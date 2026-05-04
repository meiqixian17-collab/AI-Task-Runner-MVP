import { getSimpleTaskType } from "./simpleTaskCompletion.mjs";

export const NORMAL_TASK_COMPLETION_CHECK_STEP_COUNT = 5;

export const COMPLETION_CONFIRMATION_TYPES = {
  SIMPLE_TASK: "simple_task",
  NORMAL_TASK_CHECKPOINT: "normal_task_checkpoint"
};

export function createNormalTaskCompletionCheckpointStep(
  taskTitle,
  options = {}
) {
  return {
    step_type: "completion_confirmation",
    completion_confirmation_type:
      COMPLETION_CONFIRMATION_TYPES.NORMAL_TASK_CHECKPOINT,
    step_text:
      "这个任务已经推进了几步。现在这件事是否已经可以先收尾？",
    action_type: "decide",
    completion_criteria: "选择已经完成或还差一步即可。",
    estimated_effort: "low",
    stage: "finish",
    risk_flags: [],
    task_object: taskTitle || "current task",
    expected_output: "user completion decision",
    progress_intent: "confirm_normal_task_completion",
    ...options
  };
}

export function shouldAskNormalTaskCompletionCheckpoint({
  taskTitle,
  stepHistory = [],
  completionCheckpointDismissedAtStepCount = null
}) {
  if (getSimpleTaskType(taskTitle)) {
    return false;
  }

  if (!Array.isArray(stepHistory)) {
    return false;
  }

  if (stepHistory.length < NORMAL_TASK_COMPLETION_CHECK_STEP_COUNT) {
    return false;
  }

  const dismissedAt = Number(completionCheckpointDismissedAtStepCount);

  return !Number.isFinite(dismissedAt) || stepHistory.length > dismissedAt;
}

export function shouldAskNormalTaskDuplicateCheckpoint({
  taskTitle,
  stepHistory = [],
  completionCheckpointDismissedAtStepCount = null
}) {
  if (getSimpleTaskType(taskTitle)) {
    return false;
  }

  if (
    !Array.isArray(stepHistory) ||
    stepHistory.length < NORMAL_TASK_COMPLETION_CHECK_STEP_COUNT
  ) {
    return false;
  }

  const dismissedAt = Number(completionCheckpointDismissedAtStepCount);

  return !Number.isFinite(dismissedAt) || stepHistory.length > dismissedAt;
}

export function getCompletionConfirmationType(step) {
  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return "";
  }

  return String(step.completion_confirmation_type || "").trim();
}

export function shouldContinueCompletionConfirmationWithAi(step) {
  return (
    getCompletionConfirmationType(step) ===
    COMPLETION_CONFIRMATION_TYPES.NORMAL_TASK_CHECKPOINT
  );
}
