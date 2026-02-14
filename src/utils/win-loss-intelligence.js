import moment from "moment";

const APP_TIMESTAMP_FORMAT = "DD-MMM-yyyy hh:mmA";

const parseAppTimestamp = (value) => {
  if (!value) {
    return null;
  }
  const parsed = moment(value, APP_TIMESTAMP_FORMAT, true);
  return parsed.isValid() ? parsed.valueOf() : null;
};

const normalizeKey = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase();

const toDisplayCase = (value) =>
  (value || "")
    .toString()
    .trim()
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

const buildClosePayload = ({ lead, closeOutcome, closeReason, closeCompetitor, closeNotes }) => {
  const closedAt = moment();
  const createdUnix = parseAppTimestamp(lead?.timestamp);
  const closeUnix = closedAt.valueOf();
  const cycleDays =
    typeof createdUnix === "number" && createdUnix > 0
      ? Math.max(0, Math.round(((closeUnix - createdUnix) / (1000 * 60 * 60 * 24)) * 10) / 10)
      : null;

  return {
    closeOutcome: (closeOutcome || "").trim(),
    closeReason: (closeReason || "").trim(),
    closeCompetitor: (closeCompetitor || "").trim(),
    closeNotes: (closeNotes || "").trim(),
    closeTimestamp: closedAt.format(APP_TIMESTAMP_FORMAT),
    closeUnix,
    closeCycleDays: cycleDays,
  };
};

const countTopValues = (values, limit = 3) => {
  const counts = values.reduce((acc, value) => {
    const normalized = normalizeKey(value);
    if (!normalized) {
      return acc;
    }
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ label: toDisplayCase(key), count }));
};

const computeWinLossIntelligence = (leads = []) => {
  const closedLeads = leads.filter((lead) => lead?.status === "Closed");
  const lostLeads = closedLeads.filter(
    (lead) => normalizeKey(lead?.closeOutcome) === "lost",
  );

  const topLossReasons = countTopValues(lostLeads.map((lead) => lead?.closeReason));

  const competitorMentions = countTopValues(
    lostLeads.flatMap((lead) =>
      (lead?.closeCompetitor || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );

  const cycleDays = closedLeads
    .map((lead) => {
      const directCycle = Number(lead?.closeCycleDays);
      if (Number.isFinite(directCycle) && directCycle >= 0) {
        return directCycle;
      }
      const createdUnix = parseAppTimestamp(lead?.timestamp);
      const closedUnix =
        Number(lead?.closeUnix) || parseAppTimestamp(lead?.closeTimestamp);
      if (!createdUnix || !closedUnix) {
        return null;
      }
      return Math.max(0, (closedUnix - createdUnix) / (1000 * 60 * 60 * 24));
    })
    .filter((value) => Number.isFinite(value));

  const avgCycleDays =
    cycleDays.length > 0
      ? Math.round((cycleDays.reduce((sum, value) => sum + value, 0) / cycleDays.length) * 10) / 10
      : null;

  return {
    closedCount: closedLeads.length,
    lostCount: lostLeads.length,
    topLossReasons,
    competitorMentions,
    avgCycleDays,
  };
};

export { buildClosePayload, computeWinLossIntelligence };
