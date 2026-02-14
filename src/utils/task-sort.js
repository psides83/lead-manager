const sortTasksByFollowUpPriority = (tasks = []) => {
  const now = Date.now();

  const rank = (task) => {
    const dueUnix = Number(task?.dueUnix || 0);
    const isComplete = Boolean(task?.isComplete);
    const hasDue = dueUnix > 0;
    const isOverdue = hasDue && dueUnix < now && !isComplete;

    if (isOverdue) return 0;
    if (!isComplete && hasDue) return 1;
    if (!isComplete) return 2;
    return 3;
  };

  return [...tasks].sort((a, b) => {
    const rankDelta = rank(a) - rank(b);
    if (rankDelta !== 0) return rankDelta;

    const dueA = Number(a?.dueUnix || 0);
    const dueB = Number(b?.dueUnix || 0);
    if (dueA !== dueB) {
      if (!dueA) return 1;
      if (!dueB) return -1;
      return dueA - dueB;
    }

    const orderA = Number(a?.order || 0);
    const orderB = Number(b?.order || 0);
    if (orderA !== orderB) return orderA - orderB;

    return String(a?.id || "").localeCompare(String(b?.id || ""));
  });
};

export { sortTasksByFollowUpPriority };
