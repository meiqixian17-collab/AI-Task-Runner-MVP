export const MAX_DUPLICATE_RETRY_COUNT = 2;

export function getDuplicateStepDecision({
  nextStep,
  historyForCompare = [],
  taskTitle = "",
  duplicateRetryCount = 0,
  rejectedSteps = [],
  isDuplicateStep,
  shouldAskSimpleTaskCompletion,
  getStepText
}) {
  const history = Array.isArray(historyForCompare) ? historyForCompare : [];
  const retryCount = normalizeDuplicateRetryCount(duplicateRetryCount);
  const existingRejectedSteps = normalizeStepTextList(rejectedSteps, getStepText);
  const isDuplicate =
    typeof isDuplicateStep === "function" && isDuplicateStep(nextStep, history);

  if (!isDuplicate) {
    return {
      action: "accept",
      duplicateRetryCount: retryCount,
      rejectedSteps: existingRejectedSteps
    };
  }

  if (
    typeof shouldAskSimpleTaskCompletion === "function" &&
    shouldAskSimpleTaskCompletion({
      taskTitle,
      stepHistory: history,
      isDuplicate: true
    })
  ) {
    return {
      action: "complete",
      duplicateRetryCount: retryCount,
      rejectedSteps: appendRejectedStepText(
        existingRejectedSteps,
        nextStep,
        getStepText
      )
    };
  }

  const nextRejectedSteps = appendRejectedStepText(
    existingRejectedSteps,
    nextStep,
    getStepText
  );

  return {
    action: "confirm_completion",
    duplicateRetryCount: retryCount,
    rejectedSteps: nextRejectedSteps
  };
}

export function buildDuplicateRetryContext({
  rejectedStep,
  historyForCompare = [],
  duplicateRetryCount = 1,
  rejectedSteps = [],
  getStepText
}) {
  const history = Array.isArray(historyForCompare) ? historyForCompare : [];

  return {
    retryReason: "duplicate_step",
    rejectedStep: toStepText(rejectedStep, getStepText),
    previousStep: toStepText(history[history.length - 1], getStepText),
    recentCompletedSteps: history.slice(-5),
    duplicateRetryCount: normalizeDuplicateRetryCount(duplicateRetryCount),
    rejectedSteps: normalizeStepTextList(rejectedSteps, getStepText)
  };
}

export function normalizeDuplicateRetryCount(value) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return Math.floor(count);
}

function appendRejectedStepText(rejectedSteps, rejectedStep, getStepText) {
  return [
    ...normalizeStepTextList(rejectedSteps, getStepText),
    toStepText(rejectedStep, getStepText)
  ].filter(Boolean);
}

function normalizeStepTextList(steps, getStepText) {
  if (!Array.isArray(steps)) {
    return [];
  }

  return steps.map((step) => toStepText(step, getStepText)).filter(Boolean);
}

function toStepText(step, getStepText) {
  if (typeof getStepText === "function") {
    return String(getStepText(step) || "").trim();
  }

  if (typeof step === "string") {
    return step.trim() === "[object Object]" ? "" : step.trim();
  }

  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return "";
  }

  return (
    toStepText(step.step_text, getStepText) ||
    toStepText(step.stepText, getStepText) ||
    toStepText(step.question, getStepText) ||
    toStepText(step.content, getStepText) ||
    toStepText(step.text, getStepText) ||
    toStepText(step.step, getStepText) ||
    toStepText(step.action, getStepText)
  );
}
