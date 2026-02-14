import moment from "moment";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "./firebase";

const STATUS_FOLLOW_UP_RULES = {
  "lead created": {
    delayHours: 24,
    taskText: (leadName) => `Initial outreach to ${leadName}`,
  },
  "quote requested": {
    delayHours: 12,
    taskText: (leadName) => `Send quote to ${leadName}`,
  },
  "trade assessment required": {
    delayHours: 24,
    taskText: (leadName) => `Schedule trade assessment with ${leadName}`,
  },
  "more info required": {
    delayHours: 24,
    taskText: (leadName) => `Collect missing info from ${leadName}`,
  },
  "quote sent": {
    delayHours: 48,
    taskText: (leadName) => `Follow up on quote with ${leadName}`,
  },
  "follow-up due": {
    delayHours: 4,
    taskText: (leadName) => `Follow up with ${leadName} today`,
  },
  "updated quote requested": {
    delayHours: 12,
    taskText: (leadName) => `Send updated quote to ${leadName}`,
  },
  "finance app info required": {
    delayHours: 24,
    taskText: (leadName) => `Collect finance app info from ${leadName}`,
  },
  "finance submitted": {
    delayHours: 48,
    taskText: (leadName) => `Check finance decision for ${leadName}`,
  },
  "finance approved": {
    delayHours: 24,
    taskText: (leadName) => `Finalize delivery/pickup plan with ${leadName}`,
  },
  "see equipment status": {
    delayHours: 24,
    taskText: (leadName) => `Confirm equipment availability for ${leadName}`,
  },
  "schedule pickup/delivery required": {
    delayHours: 12,
    taskText: (leadName) => `Schedule pickup/delivery with ${leadName}`,
  },
  "pickup/delivery scheduled": {
    delayHours: 24,
    taskText: (leadName) => `Confirm pickup/delivery details with ${leadName}`,
  },
  "delivered": {
    delayHours: 72,
    taskText: (leadName) => `Post-delivery check-in with ${leadName}`,
  },
  "signiture required": {
    delayHours: 8,
    taskText: (leadName) => `Collect required signatures from ${leadName}`,
  },
};

const normalizeStatus = (value) => (value || "").toString().trim().toLowerCase();

const createStatusFollowUpTask = async ({ lead, previousStatus, nextStatus }) => {
  const normalizedNextStatus = normalizeStatus(nextStatus);
  const normalizedPreviousStatus = normalizeStatus(previousStatus);

  if (!lead?.id || !lead?.name || !normalizedNextStatus) {
    return { created: false };
  }

  if (normalizedNextStatus === normalizedPreviousStatus) {
    return { created: false };
  }

  const followUpRule = STATUS_FOLLOW_UP_RULES[normalizedNextStatus];
  if (!followUpRule) {
    return { created: false };
  }

  const openTasksSnapshot = await getDocs(
    query(
      collection(db, "tasks"),
      where("leadID", "==", lead.id),
      where("isComplete", "==", false),
    ),
  );

  const hasExistingFollowUp = openTasksSnapshot.docs.some((taskDoc) => {
    const taskData = taskDoc.data() || {};
    return (
      taskData.taskType === "status-follow-up" &&
      normalizeStatus(taskData.statusTrigger) === normalizedNextStatus
    );
  });

  if (hasExistingFollowUp) {
    return { created: false };
  }

  const createdAt = moment();
  const dueAt = moment().add(followUpRule.delayHours, "hours");
  const id = createdAt.format("yyyyMMDDHHmmssSSS");

  await setDoc(
    doc(db, "tasks", id),
    {
      id,
      timestamp: createdAt.format("DD-MMM-yyyy hh:mmA"),
      dueTimestamp: dueAt.format("DD-MMM-yyyy hh:mmA"),
      dueUnix: dueAt.valueOf(),
      leadID: lead.id,
      leadName: lead.name,
      task: followUpRule.taskText(lead.name),
      isComplete: false,
      order: Number(id),
      taskType: "status-follow-up",
      statusTrigger: nextStatus,
      isAutoFollowUp: true,
    },
    { merge: true },
  );

  return { created: true };
};

export { createStatusFollowUpTask };
