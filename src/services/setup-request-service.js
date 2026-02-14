import moment from "moment";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { pdiDB } from "./pdi-firebase";
import { sendNewRequestEmail } from "./pdi-email-service";

const formatTimestamp = () => moment().format("DD-MMM-yyyy hh:mmA");
const formatId = () => moment().format("yyyyMMDDHHmmss");

const resolveBranch = (lead, pdiUser, userProfile) =>
  lead?.pdiBranch || pdiUser?.branch || userProfile?.branch || null;

const resolveSalesmanName = (pdiUser, userProfile) => {
  const firstName = pdiUser?.firstName || userProfile?.firstName || "";
  const lastName = pdiUser?.lastName || userProfile?.lastName || "";
  return `${firstName} ${lastName}`.trim();
};

const workToString = (work) => {
  if (!Array.isArray(work)) {
    return "";
  }
  return work.filter(Boolean).join(", ");
};

const getEquipmentDocId = (equipment) =>
  equipment?.id || equipment?.stock || `${equipment?.model || "unit"}-${formatId()}`;

const mapEquipmentForRequest = (equipment, requestId, timestamp, salesman) => ({
  id: equipment.id || equipment.stock || equipment.serial || "",
  requestID: requestId,
  timestamp,
  model: equipment.model,
  stock: equipment.stock,
  serial: equipment.serial,
  work: workToString(equipment.work) || equipment.work || "",
  notes: equipment.pdiNotes || equipment.notes || "",
  status: "Setup requested",
  changeLog: [
    {
      user: salesman,
      change: "equipment added to setup request",
      timestamp,
    },
  ],
});

const buildLeadChange = (requestId, models, timestamp, isExistingRequest = false) => ({
  change: isExistingRequest
    ? `PDI/Setup request updated with model(s) ${models}`
    : `PDI/Setup request sent for model(s) ${models}`,
  id: requestId,
  timestamp,
});

const requestPath = (branch, requestId) =>
  doc(pdiDB, "branches", branch, "requests", requestId);

const requestEquipmentPath = (branch, requestId, equipmentId) =>
  doc(pdiDB, "branches", branch, "requests", requestId, "equipment", equipmentId);

const watchRequestStatus = ({ branch, requestId, onStatus }) => {
  if (!branch || !requestId || !onStatus) {
    return () => {};
  }

  return onSnapshot(requestPath(branch, requestId), (snapshot) => {
    onStatus(snapshot.data()?.status || "");
  });
};

const submitSetupRequest = async ({ lead, pdiUser, userProfile }) => {
  const branch = resolveBranch(lead, pdiUser, userProfile);
  if (!branch) {
    throw new Error("No branch found for setup request.");
  }

  const selectedEquipment = (lead?.equipment || []).filter((unit) => unit.willSubmitPDI);
  if (selectedEquipment.length === 0) {
    throw new Error("No equipment selected for setup request.");
  }

  const isExistingRequest = Boolean(lead?.pdiID);
  const requestId = lead?.pdiID || formatId();
  const timestamp = formatTimestamp();
  const salesman = resolveSalesmanName(pdiUser, userProfile);
  const models = selectedEquipment.map((unit) => unit.model).join(", ");

  const requestData = isExistingRequest
    ? {
        id: requestId,
      }
    : {
        id: requestId,
        timestamp,
        salesman,
        status: "Requested",
        statusTimestamp: timestamp,
        workOrder: "",
        changeLog: [
          {
            user: salesman,
            change: "request created",
            timestamp,
          },
        ],
      };

  const updatedEquipment = (lead.equipment || []).map((unit) => {
    if (!unit.willSubmitPDI) {
      return unit;
    }

    return {
      ...unit,
      hasSubmittedPDI: true,
      willSubmitPDI: false,
      status: "Setup requested",
    };
  });

  const updatedLeadChangeLog = [
    ...(lead.changeLog || []),
    buildLeadChange(requestId, models, timestamp, isExistingRequest),
  ];

  const batch = writeBatch(pdiDB);
  batch.set(requestPath(branch, requestId), requestData, { merge: true });
  selectedEquipment.forEach((unit) => {
    const equipmentPayload = mapEquipmentForRequest(unit, requestId, timestamp, salesman);
    batch.set(
      requestEquipmentPath(branch, requestId, getEquipmentDocId(unit)),
      equipmentPayload,
      { merge: true },
    );
  });

  await batch.commit();

  await setDoc(
    doc(db, "leads", lead.id),
    {
      pdiID: requestId,
      pdiBranch: branch,
      equipment: updatedEquipment,
      changeLog: updatedLeadChangeLog,
    },
    { merge: true },
  );

  await sendNewRequestEmail(
    timestamp,
    selectedEquipment.map((unit) => ({
      model: unit.model,
      stock: unit.stock,
      serial: unit.serial,
      work: workToString(unit.work),
      notes: unit.pdiNotes || unit.notes || "",
    })),
    salesman,
    pdiUser || userProfile,
    salesman,
  );

  return {
    requestId,
    branch,
    updatedEquipment,
    updatedLeadChangeLog,
    isExistingRequest,
  };
};

const syncEquipmentToSetupRequest = async ({
  lead,
  equipment,
  pdiUser,
  userProfile,
}) => {
  if (!lead?.pdiID || !equipment?.hasSubmittedPDI) {
    return;
  }

  const branch = resolveBranch(lead, pdiUser, userProfile);
  if (!branch) {
    return;
  }

  await setDoc(
    requestEquipmentPath(branch, lead.pdiID, getEquipmentDocId(equipment)),
    {
      id: equipment.id || equipment.stock || equipment.serial || "",
      requestID: lead.pdiID,
      timestamp: equipment.timestamp,
      model: equipment.model,
      stock: equipment.stock,
      serial: equipment.serial,
      work: workToString(equipment.work),
      notes: equipment.pdiNotes || equipment.notes || "",
      status: equipment.status,
      changeLog: equipment.changeLog || [],
    },
    { merge: true },
  );
};

const deleteEquipmentFromSetupRequest = async ({
  lead,
  equipment,
  pdiUser,
  userProfile,
}) => {
  if (!lead?.pdiID) {
    return { requestBecameEmpty: false };
  }

  const branch = resolveBranch(lead, pdiUser, userProfile);
  if (!branch) {
    return { requestBecameEmpty: false };
  }

  const equipmentCollectionRef = collection(
    pdiDB,
    "branches",
    branch,
    "requests",
    lead.pdiID,
    "equipment",
  );

  // Support legacy and mixed equipment doc-id strategies (id, stock, serial, generated ids).
  const candidateIds = [
    equipment?.id,
    equipment?.stock,
    equipment?.serial,
    getEquipmentDocId(equipment),
  ].filter(Boolean);
  const uniqueCandidateIds = [...new Set(candidateIds)];

  await Promise.all(
    uniqueCandidateIds.map((candidateId) =>
      deleteDoc(requestEquipmentPath(branch, lead.pdiID, candidateId)),
    ),
  );

  const existingEquipment = await getDocs(equipmentCollectionRef);
  const deletionTasks = [];

  existingEquipment.forEach((equipmentDoc) => {
    const data = equipmentDoc.data() || {};
    const matchesByDocId = uniqueCandidateIds.includes(equipmentDoc.id);
    const matchesByField =
      (equipment?.id && data?.id === equipment.id) ||
      (equipment?.stock && data?.stock === equipment.stock) ||
      (equipment?.serial && data?.serial === equipment.serial);

    if (matchesByDocId || matchesByField) {
      deletionTasks.push(deleteDoc(equipmentDoc.ref));
    }
  });

  if (deletionTasks.length > 0) {
    await Promise.all(deletionTasks);
  }

  const remainingEquipment = await getDocs(
    equipmentCollectionRef,
  );
  const hasSubmittedEquipmentOnLead = (lead?.equipment || []).some(
    (unit) => unit?.hasSubmittedPDI,
  );

  return {
    // Firestore can have legacy/orphan equipment docs; use lead state as fallback truth.
    requestBecameEmpty: remainingEquipment.empty || !hasSubmittedEquipmentOnLead,
    branch,
    requestId: lead.pdiID,
  };
};

const deleteSetupRequest = async ({ lead, pdiUser, userProfile }) => {
  if (!lead?.pdiID) {
    return;
  }

  const branch = resolveBranch(lead, pdiUser, userProfile);
  if (!branch) {
    return;
  }

  await deleteDoc(requestPath(branch, lead.pdiID));
  await setDoc(
    doc(db, "leads", lead.id),
    {
      pdiID: deleteField(),
      pdiBranch: deleteField(),
    },
    { merge: true },
  );
};

export {
  resolveBranch,
  watchRequestStatus,
  submitSetupRequest,
  syncEquipmentToSetupRequest,
  deleteEquipmentFromSetupRequest,
  deleteSetupRequest,
};
