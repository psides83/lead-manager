import moment from "moment";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const writeAuditLog = async ({
  actionType,
  entityType,
  entityId,
  actor,
  leadId,
  before,
  after,
  metadata,
}) => {
  const id = moment().format("yyyyMMDDHHmmssSSS");
  const timestamp = moment().format("DD-MMM-yyyy hh:mmA");

  try {
    await setDoc(
      doc(db, "auditLogs", id),
      {
        id,
        timestamp,
        actionType: actionType || "unknown",
        entityType: entityType || "unknown",
        entityId: entityId || "",
        leadId: leadId || "",
        actor: actor || null,
        before: before || null,
        after: after || null,
        metadata: metadata || null,
      },
      { merge: true },
    );
    return true;
  } catch (_) {
    // Audit logging is best-effort and must never block core user actions.
    return false;
  }
};

export { writeAuditLog };
