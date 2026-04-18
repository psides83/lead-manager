import moment from "moment";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const MAX_NOTIFICATION_ITEMS = 50;

const sanitizeDocId = (value = "") =>
  String(value).replace(/[^\w-]/g, "_").slice(0, 180);

const notificationsCollection = (userId) =>
  collection(db, "users", userId, "notifications");

const maybeSendEmailNotification = async ({ userEmail, title, body }) => {
  const emailEnabled = process.env.REACT_APP_ENABLE_EMAIL_NOTIFICATIONS === "true";
  if (!emailEnabled || !userEmail) return;

  try {
    await addDoc(collection(db, "sentEmails"), {
      to: userEmail,
      replyTo: userEmail,
      message: {
        subject: title,
        text: body,
      },
    });
  } catch (_) {
    // Email should be best-effort and never block in-app notification flow.
  }
};

const upsertNotification = async ({
  userId,
  dedupeKey,
  type,
  title,
  body,
  leadId = "",
  taskId = "",
  dueUnix = null,
  priority = "normal",
  metadata = {},
  userEmail = "",
  sendEmail = false,
}) => {
  if (!userId || !title) return;

  const now = moment();
  const docId = sanitizeDocId(dedupeKey || `${type}-${now.valueOf()}`);
  const notificationRef = doc(notificationsCollection(userId), docId);

  await setDoc(
    notificationRef,
    {
      id: docId,
      userId,
      type,
      title,
      body: body || "",
      leadId,
      taskId,
      dueUnix,
      priority,
      metadata,
      isRead: false,
      createdAtUnix: now.valueOf(),
      createdAt: now.format("DD-MMM-yyyy hh:mmA"),
      updatedAtUnix: now.valueOf(),
      updatedAt: now.format("DD-MMM-yyyy hh:mmA"),
    },
    { merge: true },
  );

  if (sendEmail) {
    await maybeSendEmailNotification({ userEmail, title, body });
  }
};

const markNotificationRead = async ({ userId, notificationId }) => {
  if (!userId || !notificationId) return;
  const now = moment();
  await setDoc(
    doc(notificationsCollection(userId), notificationId),
    {
      isRead: true,
      readAtUnix: now.valueOf(),
      readAt: now.format("DD-MMM-yyyy hh:mmA"),
      updatedAtUnix: now.valueOf(),
      updatedAt: now.format("DD-MMM-yyyy hh:mmA"),
    },
    { merge: true },
  );
};

const markAllNotificationsRead = async ({ userId, notifications }) => {
  if (!userId) return;
  const unread = (notifications || []).filter((item) => !item?.isRead);
  await Promise.all(
    unread.map((item) =>
      markNotificationRead({
        userId,
        notificationId: item.id,
      }),
    ),
  );
};

const markTaskNotificationsRead = async ({ userId, taskId }) => {
  if (!userId || !taskId) return;
  const taskNotificationsQuery = query(
    notificationsCollection(userId),
    where("taskId", "==", taskId),
  );
  const snapshot = await getDocs(taskNotificationsQuery);
  await Promise.all(
    snapshot.docs.map((notificationDoc) =>
      markNotificationRead({
        userId,
        notificationId: notificationDoc.id,
      }),
    ),
  );
};

const watchNotifications = ({ userId, onChange, maxItems = MAX_NOTIFICATION_ITEMS }) => {
  if (!userId) return () => {};

  const notificationsQuery = query(
    notificationsCollection(userId),
    orderBy("updatedAtUnix", "desc"),
    limit(maxItems),
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const items = snapshot.docs.map((item) => item.data());
    onChange?.(items);
  });
};

const createTaskCreatedNotification = async ({
  userId,
  userEmail,
  lead,
  task,
  dueUnix = null,
}) => {
  if (!task || !lead?.id) return;
  await upsertNotification({
    userId,
    userEmail,
    type: "task-created",
    dedupeKey: `task-created-${task.id}`,
    title: "Task created",
    body: `${task.task} (${lead.name})`,
    leadId: lead.id,
    taskId: task.id,
    dueUnix,
    priority: "normal",
  });
};

const createFollowUpTaskNotification = async ({
  userId,
  userEmail,
  lead,
  task,
}) => {
  if (!task || !lead?.id) return;
  await upsertNotification({
    userId,
    userEmail,
    type: "status-follow-up",
    dedupeKey: `status-follow-up-${task.id}`,
    title: "Follow-up task generated",
    body: `${task.task} (${lead.name})`,
    leadId: lead.id,
    taskId: task.id,
    dueUnix: task.dueUnix || null,
    priority: "high",
    sendEmail: true,
  });
};

const createOverdueTaskNotification = async ({
  userId,
  userEmail,
  task,
  dayKey,
}) => {
  if (!task?.id || !task?.leadID) return;

  await upsertNotification({
    userId,
    userEmail,
    type: "task-overdue",
    dedupeKey: `task-overdue-${task.id}-${dayKey}`,
    title: "Overdue follow-up",
    body: `${task.task} (${task.leadName || "Lead"})`,
    leadId: task.leadID,
    taskId: task.id,
    dueUnix: Number(task.dueUnix || 0),
    priority: "high",
    sendEmail: true,
  });
};

const syncOverdueTaskNotifications = async ({ userId, userEmail }) => {
  if (!userId) return;

  const openTasksQuery = query(
    collection(db, "tasks"),
    where("isComplete", "==", false),
  );
  const snapshot = await getDocs(openTasksQuery);
  const now = Date.now();
  const dayKey = moment().format("YYYYMMDD");

  const overdueTasks = snapshot.docs
    .map((item) => item.data())
    .filter((task) => Number(task?.dueUnix || 0) > 0 && Number(task.dueUnix) < now);

  await Promise.all(
    overdueTasks.map((task) =>
      createOverdueTaskNotification({
        userId,
        userEmail,
        task,
        dayKey,
      }),
    ),
  );
};

export {
  upsertNotification,
  markNotificationRead,
  markAllNotificationsRead,
  markTaskNotificationsRead,
  watchNotifications,
  createTaskCreatedNotification,
  createFollowUpTaskNotification,
  syncOverdueTaskNotifications,
};
