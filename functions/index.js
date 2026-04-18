const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2/options");

admin.initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

const db = admin.firestore();

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
  delivered: {
    delayHours: 72,
    taskText: (leadName) => `Post-delivery check-in with ${leadName}`,
  },
  "signiture required": {
    delayHours: 8,
    taskText: (leadName) => `Collect required signatures from ${leadName}`,
  },
};

const normalizeStatus = (value) => String(value || "").trim().toLowerCase();

const sanitizeDocId = (value = "") =>
  String(value).replace(/[^\w-]/g, "_").slice(0, 180);

const timestampString = (date = new Date()) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hour24 = date.getHours();
  const hour12 = ((hour24 + 11) % 12) + 1;
  const minute = String(date.getMinutes()).padStart(2, "0");
  const amPm = hour24 >= 12 ? "PM" : "AM";
  return `${day}-${month}-${year} ${String(hour12).padStart(2, "0")}:${minute}${amPm}`;
};

const shouldSendEmail = () => (process.env.ENABLE_EMAIL_NOTIFICATIONS || "true") === "true";

const getUserEmail = async (userId) => {
  if (!userId) return "";
  const userSnapshot = await db.collection("users").doc(userId).get();
  if (!userSnapshot.exists) return "";
  return userSnapshot.data()?.email || "";
};

const queueEmail = async ({ to, subject, text }) => {
  if (!to || !shouldSendEmail()) return;
  const emailRef = db.collection("sentEmails").doc();
  await emailRef.set({
    to,
    replyTo: to,
    from: process.env.EMAIL_FROM || "Lead Manager App<psides.solutions@outlook.com>",
    message: {
      subject,
      text,
    },
  });
};

const createNotification = async ({
  userId,
  dedupeKey,
  type,
  title,
  body,
  leadId = "",
  taskId = "",
  dueUnix = null,
  priority = "normal",
  sendEmail = false,
}) => {
  if (!userId || !title) return;

  const now = Date.now();
  const notificationId = sanitizeDocId(dedupeKey || `${type}-${now}`);
  const notificationRef = db
    .collection("users")
    .doc(userId)
    .collection("notifications")
    .doc(notificationId);

  await notificationRef.set(
    {
      id: notificationId,
      userId,
      type,
      title,
      body: body || "",
      leadId,
      taskId,
      dueUnix,
      priority,
      isRead: false,
      createdAtUnix: now,
      createdAt: timestampString(new Date(now)),
      updatedAtUnix: now,
      updatedAt: timestampString(new Date(now)),
    },
    { merge: true },
  );

  if (sendEmail) {
    const userEmail = await getUserEmail(userId);
    await queueEmail({ to: userEmail, subject: title, text: body || "" });
  }
};

const resolveLeadOwnerId = (leadData = {}) => leadData.salesmanID || leadData.uid || "";

const createStatusFollowUpTask = async ({ leadId, leadData, nextStatus, previousStatus }) => {
  const normalizedNext = normalizeStatus(nextStatus);
  const normalizedPrevious = normalizeStatus(previousStatus);

  if (!leadId || !leadData?.name || !normalizedNext) return { created: false };
  if (normalizedNext === normalizedPrevious) return { created: false };

  const rule = STATUS_FOLLOW_UP_RULES[normalizedNext];
  if (!rule) return { created: false };

  const existingTasks = await db
    .collection("tasks")
    .where("leadID", "==", leadId)
    .where("isComplete", "==", false)
    .get();

  const hasExistingFollowUp = existingTasks.docs.some((taskDoc) => {
    const task = taskDoc.data() || {};
    return (
      task.taskType === "status-follow-up" &&
      normalizeStatus(task.statusTrigger) === normalizedNext
    );
  });

  if (hasExistingFollowUp) return { created: false };

  const createdAt = Date.now();
  const dueAt = createdAt + rule.delayHours * 60 * 60 * 1000;
  const id = `${createdAt}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

  const taskPayload = {
    id,
    timestamp: timestampString(new Date(createdAt)),
    dueTimestamp: timestampString(new Date(dueAt)),
    dueUnix: dueAt,
    leadID: leadId,
    leadName: leadData.name,
    task: rule.taskText(leadData.name),
    isComplete: false,
    order: Number(id),
    taskType: "status-follow-up",
    statusTrigger: nextStatus,
    isAutoFollowUp: true,
  };

  await db.collection("tasks").doc(id).set(taskPayload, { merge: true });
  return { created: true, taskPayload };
};

exports.onLeadStatusUpdatedCreateFollowUp = onDocumentUpdated("leads/{leadId}", async (event) => {
  const before = event.data?.before?.data() || {};
  const after = event.data?.after?.data() || {};
  const leadId = event.params?.leadId;

  const previousStatus = before.status;
  const nextStatus = after.status;
  if (!leadId || !nextStatus || nextStatus === previousStatus) return;

  const result = await createStatusFollowUpTask({
    leadId,
    leadData: after,
    nextStatus,
    previousStatus,
  });

  if (!result.created) return;

  const ownerId = resolveLeadOwnerId(after);
  await createNotification({
    userId: ownerId,
    dedupeKey: `status-follow-up-${result.taskPayload.id}`,
    type: "status-follow-up",
    title: "Follow-up task generated",
    body: `${result.taskPayload.task} (${after.name || "Lead"})`,
    leadId,
    taskId: result.taskPayload.id,
    dueUnix: result.taskPayload.dueUnix,
    priority: "high",
    sendEmail: true,
  });
});

exports.onTaskCreatedNotifyOwner = onDocumentCreated("tasks/{taskId}", async (event) => {
  const task = event.data?.data() || {};
  const taskId = event.params?.taskId;

  if (!taskId || !task.leadID || task.isComplete) return;

  const leadSnapshot = await db.collection("leads").doc(task.leadID).get();
  if (!leadSnapshot.exists) return;

  const lead = leadSnapshot.data() || {};
  const ownerId = resolveLeadOwnerId(lead);
  if (!ownerId) return;

  const isAutoFollowUp = task.taskType === "status-follow-up" || Boolean(task.isAutoFollowUp);

  await createNotification({
    userId: ownerId,
    dedupeKey: isAutoFollowUp ? `status-follow-up-${taskId}` : `task-created-${taskId}`,
    type: isAutoFollowUp ? "status-follow-up" : "task-created",
    title: isAutoFollowUp ? "Follow-up task generated" : "Task created",
    body: `${task.task || "Task"} (${task.leadName || lead.name || "Lead"})`,
    leadId: task.leadID,
    taskId,
    dueUnix: Number(task.dueUnix || 0) || null,
    priority: isAutoFollowUp ? "high" : "normal",
    sendEmail: isAutoFollowUp,
  });
});

exports.scheduledOverdueTaskNotifications = onSchedule(
  {
    schedule: "every 30 minutes",
    timeZone: "America/Chicago",
  },
  async () => {
    const now = Date.now();
    const dayKey = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const overdueSnapshot = await db
      .collection("tasks")
      .where("isComplete", "==", false)
      .where("dueUnix", "<=", now)
      .limit(250)
      .get();

    for (const taskDoc of overdueSnapshot.docs) {
      const task = taskDoc.data() || {};
      if (!task.leadID) continue;

      const leadSnapshot = await db.collection("leads").doc(task.leadID).get();
      if (!leadSnapshot.exists) continue;
      const lead = leadSnapshot.data() || {};
      const ownerId = resolveLeadOwnerId(lead);
      if (!ownerId) continue;

      await createNotification({
        userId: ownerId,
        dedupeKey: `task-overdue-${taskDoc.id}-${dayKey}`,
        type: "task-overdue",
        title: "Overdue follow-up",
        body: `${task.task || "Task"} (${task.leadName || lead.name || "Lead"})`,
        leadId: task.leadID,
        taskId: taskDoc.id,
        dueUnix: Number(task.dueUnix || 0) || null,
        priority: "high",
        sendEmail: true,
      });
    }

    logger.info("Overdue task notification sync complete", {
      overdueTaskCount: overdueSnapshot.size,
    });
  },
);
