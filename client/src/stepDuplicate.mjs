export function isDuplicateStepEntry(nextStep, historySteps = []) {
  if (!nextStep || !Array.isArray(historySteps)) {
    return false;
  }

  if (
    historySteps.some((historyStep) =>
      isStructuredDuplicateStep(nextStep, historyStep)
    )
  ) {
    return true;
  }

  return isDuplicateStepText(
    getStepText(nextStep),
    historySteps.map((step) => getStepText(step))
  );
}

export function isDuplicateStepText(nextStepText, historyStepTexts = []) {
  const nextText = normalizeStepForCompare(nextStepText);

  if (!nextText || !Array.isArray(historyStepTexts)) {
    return false;
  }

  return historyStepTexts.some((historyStepText) => {
    const historyText = normalizeStepForCompare(historyStepText);

    if (!historyText) {
      return false;
    }

    return (
      nextText === historyText ||
      isContainedDuplicate(nextText, historyText) ||
      getTextOverlapRatio(nextText, historyText) > 0.92
    );
  });
}

export function normalizeStepForCompare(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s\u3000]/g, "")
    .replace(/[.,!?;:'"()[\]{}，。！？；：“”‘’（）【】《》、]/g, "");
}

function isStructuredDuplicateStep(nextStep, historyStep) {
  const nextSignature = getProgressSignature(nextStep);
  const historySignature = getProgressSignature(historyStep);

  if (!nextSignature.hasStructuredFields || !historySignature.hasStructuredFields) {
    return false;
  }

  if (
    nextSignature.progressIntent &&
    historySignature.progressIntent &&
    nextSignature.progressIntent === historySignature.progressIntent
  ) {
    return true;
  }

  if (
    nextSignature.actionType &&
    historySignature.actionType &&
    nextSignature.taskObject &&
    historySignature.taskObject &&
    nextSignature.expectedOutput &&
    historySignature.expectedOutput
  ) {
    return (
      nextSignature.actionType === historySignature.actionType &&
      nextSignature.taskObject === historySignature.taskObject &&
      nextSignature.expectedOutput === historySignature.expectedOutput
    );
  }

  return false;
}

function getProgressSignature(step) {
  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return {
      actionType: "",
      taskObject: "",
      expectedOutput: "",
      progressIntent: "",
      hasStructuredFields: false
    };
  }

  const actionType = normalizeProgressField(step.action_type);
  const taskObject = normalizeProgressField(step.task_object);
  const expectedOutput = normalizeProgressField(step.expected_output);
  const progressIntent = normalizeProgressField(step.progress_intent);

  return {
    actionType,
    taskObject,
    expectedOutput,
    progressIntent,
    hasStructuredFields: Boolean(
      progressIntent || (actionType && taskObject && expectedOutput)
    )
  };
}

function normalizeProgressField(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]+/g, "")
    .replace(/[.,!?;:'"()[\]{}，。！？；：“”‘’（）【】《》、]/g, "");
}

function getStepText(step) {
  if (typeof step === "string") {
    return step.trim() === "[object Object]" ? "" : step;
  }

  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return "";
  }

  return (
    getStepText(step.step_text) ||
    getStepText(step.stepText) ||
    getStepText(step.question) ||
    getStepText(step.content) ||
    getStepText(step.text) ||
    getStepText(step.step) ||
    getStepText(step.action)
  );
}

function isContainedDuplicate(textA, textB) {
  if (!textA.includes(textB) && !textB.includes(textA)) {
    return false;
  }

  const longer = textA.length >= textB.length ? textA : textB;
  const shorter = textA.length >= textB.length ? textB : textA;
  const lengthRatio = shorter.length / longer.length;
  const minimumRatio = shorter.length <= 4 ? 0.65 : 0.75;

  return lengthRatio >= minimumRatio;
}

function getTextOverlapRatio(textA, textB) {
  if (!textA || !textB) {
    return 0;
  }

  const longer = textA.length >= textB.length ? textA : textB;
  const shorter = textA.length >= textB.length ? textB : textA;
  let overlapCount = 0;
  const remainingChars = longer.split("");

  for (const char of shorter) {
    const index = remainingChars.indexOf(char);

    if (index >= 0) {
      overlapCount += 1;
      remainingChars.splice(index, 1);
    }
  }

  return overlapCount / longer.length;
}
