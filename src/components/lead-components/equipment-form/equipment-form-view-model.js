import { db } from "../../../services/firebase";
import { setDoc, doc } from "@firebase/firestore";
import moment from "moment";
import {
  equipmentAvailabilityArray,
  equipmentStatusArray,
} from "../../../models/static-data";
import {
  deleteSetupRequest,
  deleteEquipmentFromSetupRequest,
  syncEquipmentToSetupRequest,
} from "../../../services/setup-request-service";
import { writeAuditLog } from "../../../services/audit-log-service";

export default class EquipmentFormViewModel {
  constructor(
    lead,
    equipment,
    equipmentData,
    setEquipmentData,
    importedData,
    setImportedData,
    change,
    setChange,
    setMessage,
    setOpenSuccess,
    setOpenError,
    loading,
    setLoading,
    setSuccess,
    setIsShowingDialog,
    handleCloseDialog,
    pdiUser,
    userProfile,
    externalRequestId,
    setExternalRequestId,
  ) {
    this.lead = lead;
    this.equipment = equipment;
    this.equipmentData = equipmentData;
    this.setEquipmentData = setEquipmentData;
    this.change = change;
    this.setChange = setChange;
    this.setMessage = setMessage;
    this.setOpenSuccess = setOpenSuccess;
    this.setOpenError = setOpenError;
    this.loading = loading;
    this.setLoading = setLoading;
    this.setSuccess = setSuccess;
    this.importedData = importedData;
    this.setImportedData = setImportedData;
    this.setIsShowingDialog = setIsShowingDialog;
    this.handleCloseDialog = handleCloseDialog;
    this.pdiUser = pdiUser;
    this.userProfile = userProfile;
    this.externalRequestId = externalRequestId;
    this.setExternalRequestId = setExternalRequestId;
  }

  // deletes the equipment item
  deleteEquipment = async (event, options = {}) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const { deleteEmptyRequestToo = false } = options;
    const leadRef = doc(db, "leads", this.lead.id);

    const deletedEquipment = { ...this.equipment };
    const equipmentIndex = this.lead.equipment.indexOf(this.equipment);

    this.lead.equipment.splice(equipmentIndex, 1);

    await setDoc(leadRef, { equipment: this.lead.equipment }, { merge: true });
    const requestResult = await deleteEquipmentFromSetupRequest({
      lead: this.lead,
      equipment: this.equipment,
      pdiUser: this.pdiUser,
      userProfile: this.userProfile,
    });

    if (requestResult?.requestBecameEmpty) {
      if (deleteEmptyRequestToo) {
        await deleteSetupRequest({
          lead: this.lead,
          pdiUser: this.pdiUser,
          userProfile: this.userProfile,
        });
        this.setMessage("Empty setup request deleted");
        this.setOpenSuccess(true);
      } else {
        return { requestBecameEmpty: true, deletedEquipment, equipmentIndex };
      }
    }

    await writeAuditLog({
      actionType: "equipment_deleted",
      entityType: "equipment",
      entityId: deletedEquipment?.id || deletedEquipment?.stock || "",
      leadId: this.lead?.id,
      before: deletedEquipment,
      metadata: { equipmentIndex, source: "equipment-dialog" },
    });

    this.setIsShowingDialog(false);
    return { requestBecameEmpty: false, deletedEquipment, equipmentIndex };
  };

  deleteEmptySetupRequest = async () => {
    await deleteSetupRequest({
      lead: this.lead,
      pdiUser: this.pdiUser,
      userProfile: this.userProfile,
    });
    this.setMessage("Empty setup request deleted");
    this.setOpenSuccess(true);
    this.setIsShowingDialog(false);
  };

  restoreEquipment = async ({ equipment, equipmentIndex }) => {
    if (!equipment) {
      return;
    }

    const leadRef = doc(db, "leads", this.lead.id);
    const updatedEquipment = [...(this.lead.equipment || [])];
    const safeIndex =
      typeof equipmentIndex === "number" && equipmentIndex >= 0
        ? Math.min(equipmentIndex, updatedEquipment.length)
        : updatedEquipment.length;

    updatedEquipment.splice(safeIndex, 0, equipment);
    this.lead.equipment = updatedEquipment;

    await setDoc(leadRef, { equipment: updatedEquipment }, { merge: true });
    await syncEquipmentToSetupRequest({
      lead: this.lead,
      equipment,
      pdiUser: this.pdiUser,
      userProfile: this.userProfile,
    });
    await writeAuditLog({
      actionType: "equipment_restore_undo",
      entityType: "equipment",
      entityId: equipment?.id || equipment?.stock || "",
      leadId: this.lead?.id,
      after: equipment,
      metadata: { equipmentIndex: safeIndex, source: "undo-snackbar" },
    });
  };

  logChanges() {
    const equipmentData = this.equipmentData;
    const importedData = this.importedData;
    const change = this.change;
    const setChange = this.setChange;

    if (equipmentData.model !== importedData.model) {
      setChange(
        change.push(
          `Model edited from ${
            importedData.model === "" ? "BLANK" : importedData.model
          } to ${equipmentData.model === "" ? "BLANK" : equipmentData.model}`,
        ),
      );
    }

    if (equipmentData.stock !== importedData.stock) {
      setChange(
        change.push(
          `Stock # for ${equipmentData.model} edited from ${
            importedData.stock === "" ? "BLANK" : importedData.stock
          } to ${equipmentData.stock === "" ? "BLANK" : equipmentData.stock}`,
        ),
      );
    }

    if (equipmentData.serial !== importedData.serial) {
      setChange(
        change.push(
          `Serial # for ${equipmentData.model} edited from ${
            importedData.serial === "" ? "BLANK" : importedData.serial
          } to ${equipmentData.serial === "" ? "BLANK" : equipmentData.serial}`,
        ),
      );
    }

    if ((equipmentData.quotePrice || "") !== (importedData.quotePrice || "")) {
      setChange(
        change.push(
          `Quote price for ${equipmentData.model} edited from ${
            importedData.quotePrice === "" || importedData.quotePrice === undefined
              ? "BLANK"
              : `$${importedData.quotePrice}`
          } to ${
            equipmentData.quotePrice === "" || equipmentData.quotePrice === undefined
              ? "BLANK"
              : `$${equipmentData.quotePrice}`
          }`,
        ),
      );
    }

    if (equipmentData.status !== importedData.status) {
      setChange(
        change.push(
          `Status of ${equipmentData.model} updated from ${importedData.status} to ${equipmentData.status}`,
        ),
      );
    }

    if (equipmentData.notes !== importedData.notes) {
      setChange(
        change.push(
          `Notes on ${equipmentData.model} edited from ${
            importedData.notes === "" ? "BLANK" : importedData.notes
          } to ${equipmentData.notes === "" ? "BLANK" : equipmentData.notes}`,
        ),
      );
    }

    if (equipmentData.availability !== importedData.availability) {
      setChange(
        change.push(
          `Availability of ${equipmentData.model} updated from ${importedData.availability} to ${equipmentData.availability}`,
        ),
      );
    }

    if (equipmentData.willSubmitPDI !== importedData.willSubmitPDI) {
      setChange(
        change.push(
          `Will Sumbit PDI of ${equipmentData.model} updated from ${importedData.willSubmitPDI} to ${equipmentData.willSubmitPDI}`,
        ),
      );
    }
  }

  // Add the equipment to the firestore "leads" collection and the equipment to the fire store "equipment" collection.
  setEquipmentToFirestore = async () => {
    const lead = this.lead;
    const equipment = this.equipment;
    const equipmentData = this.equipmentData;

    const timestamp = moment().format("DD-MMM-yyyy hh:mmA");
    const id = equipment ? equipment.id : moment().format("yyyyMMDDHHmmss");
    const normalizedRequestId = String(this.externalRequestId || "").trim();
    const resolvedBranch =
      lead?.pdiBranch || this.pdiUser?.branch || this.userProfile?.branch || "";
    this.logChanges();
    var changeString = this.change.toString().replace(/,/g, ", ");

    if (changeString[0] === ",") {
      changeString = changeString.substring(1).trim();
    }

    equipmentData.changeLog.push({
      id: id,
      change: equipment ? changeString : `${equipmentData.model} added`,
      timestamp: timestamp,
    });

    var leadChangeLog = lead.changeLog;

    leadChangeLog.push({
      id: moment().format("yyyyMMDDHHmmss"),
      change: equipment ? changeString : `${equipmentData.model} added`,
      timestamp: timestamp,
    });

    equipmentData.work = this.workNullEmpties();
    equipmentData.id = id;
    equipmentData.timestamp = timestamp;
    if (normalizedRequestId) {
      equipmentData.hasSubmittedPDI = true;
      equipmentData.willSubmitPDI = false;
      if (!equipmentData.status || equipmentData.status === "Equipment added") {
        equipmentData.status = "Setup requested";
      }
    }

    if (equipment) {
      const currentEquipmentIndex = lead.equipment.indexOf(equipment);
      lead.equipment[currentEquipmentIndex] = equipmentData;
    } else {
      lead.equipment.push(equipmentData);
    }

    const leadRef = doc(db, "leads", lead?.id);

    const leadUpdate = {
      equipment: lead.equipment,
      changeLog: leadChangeLog,
    };
    if (normalizedRequestId) {
      leadUpdate.pdiID = normalizedRequestId;
      if (resolvedBranch) {
        leadUpdate.pdiBranch = resolvedBranch;
      }
    }

    await setDoc(leadRef, leadUpdate, { merge: true });
    if (normalizedRequestId) {
      lead.pdiID = normalizedRequestId;
      if (resolvedBranch) {
        lead.pdiBranch = resolvedBranch;
      }
    }
    await writeAuditLog({
      actionType: equipment ? "equipment_updated" : "equipment_added",
      entityType: "equipment",
      entityId: equipmentData?.id || equipmentData?.stock || "",
      leadId: lead?.id,
      before: equipment || null,
      after: equipmentData,
      metadata: { source: "equipment-dialog" },
    });

    await syncEquipmentToSetupRequest({
      lead,
      equipment: equipmentData,
      pdiUser: this.pdiUser,
      userProfile: this.userProfile,
    });
  };

  workNullEmpties = () => {
    var temp = [];

    if (this.equipmentData.work !== undefined) {
      for (let i of this.equipmentData.work) i ? temp.push(i) : temp.push(null);
    }

    return temp;
  };

  // Reset the Lead form
  resetLeadForm() {
    this.setEquipmentData({
      model: "",
      stock: "",
      serial: "",
      quotePrice: "",
      availability: "Availability Unknown",
      status: "Equipment added",
      notes: "",
      willSubmitPDI: false,
      hasSubmittedPDI: false,
      changeLog: [],
    });
    this.setChange([]);
    this.setImportedData({});
    this.setExternalRequestId("");
  }

  // Request submission validation.
  equipmentSubmitValidation = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setLoading(true);

    if (this.equipmentData.model === "") {
      this.setMessage("Equipment must have a model");
      this.setOpenError(true);
      this.setLoading(false);
      return;
    } else {
      await this.setEquipmentToFirestore();
      this.setSuccess(true);
      this.setMessage("lead successfully edited");
      this.setOpenSuccess(true);
      this.setLoading(false);
      this.handleCloseDialog();
    }
  };

  // sets the state of the save button based on whether data in the form has changed or is being saved
  buttonIsDisabled() {
    const equipmentData = this.equipmentData;
    const importedData = this.importedData;
    function removeNulls(array) {
      var temp = [];
      if (array !== undefined) {
        for (let i of array) i && temp.push(i);
        return temp.toString().replace(/(^,)|(,$)/g, "");
      }
    }

    if (this.loading) return true;

    if (equipmentData.model !== importedData.model) return false;
    if (equipmentData.stock !== importedData.stock) return false;
    if (equipmentData.serial !== importedData.serial) return false;
    if ((equipmentData.quotePrice || "") !== (importedData.quotePrice || "")) return false;
    if (equipmentData.status !== importedData.status) return false;
    if (equipmentData.availability !== importedData.availability) return false;
    if (equipmentData.notes !== importedData.notes) return false;
    if (equipmentData.willSubmitPDI !== importedData.willSubmitPDI)
      return false;
    if ((this.externalRequestId || "").trim() !== String(this.lead?.pdiID || "").trim())
      return false;
    if (
      equipmentData.work.length !== 0 &&
      equipmentData.work.some((item) => {
        return item !== null;
      }) &&
      removeNulls(equipmentData.work) !==
        importedData?.work?.replace(/(^,)|(,$)/g, "")
    )
      return false;
    return true;
  }

  // handles the onChange of the equipment inputs
  handleEquipmentInput(e, id) {
    var value = e.target.value;

    if (id === "model" || id === "serial") {
      const newValue = e.target.value;
      value = newValue.toUpperCase();
    }

    if (id === "stock") {
      const newValue = e.target.value;
      value = newValue.replace(/[^0-9]/g, "");
    }

    if (id === "quotePrice") {
      const rawValue = e.target.value.replace(/[^0-9.]/g, "");
      const [whole = "", ...decimalParts] = rawValue.split(".");
      const decimals = decimalParts.join("").slice(0, 2);
      value = decimals.length > 0 ? `${whole}.${decimals}` : whole;
    }

    this.setEquipmentData({ ...this.equipmentData, [id]: value });
  }

  // handles equipment object values for the inputs
  handleEquipmentValues(id) {
    const equipmentData = this.equipmentData;

    switch (id) {
      case "model":
        return equipmentData.model;
      case "stock":
        return equipmentData.stock;
      case "serial":
        return equipmentData.serial;
      case "quotePrice":
        return equipmentData.quotePrice || "";
      case "status":
        return equipmentData.status;
      case "availability":
        return equipmentData.availability;
      case "notes":
        return equipmentData.notes;
      default:
        return "";
    }
  }

  // sets the array for the equipment select inputs
  equipmentSelectArray(id) {
    switch (id) {
      case "status":
        return equipmentStatusArray;
      case "availability":
        return equipmentAvailabilityArray;
      default:
        return null;
    }
  }
}
