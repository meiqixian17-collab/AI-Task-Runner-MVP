import { getSimpleTaskType } from "./simpleTaskCompletion.mjs";

export const NORMAL_TASK_COMPLETION_CHECK_STEP_COUNT = 5;

export const COMPLETION_CONFIRMATION_TYPES = {
  SIMPLE_TASK: "simple_task",
  NORMAL_TASK_CHECKPOINT: "normal_task_checkpoint",
  TASK_COMPLETION: "task_completion",
  DUPLICATE_STEP: "duplicate_step"
};

export function createTaskCompletionConfirmationStep(
  taskTitle,
  options = {}
) {
  return {
    step_type: "completion_confirmation",
    completion_confirmation_type:
      options.completion_confirmation_type ||
      COMPLETION_CONFIRMATION_TYPES.TASK_COMPLETION,
    step_text:
      options.step_text ||
      "看起来这件事已经接近完成。要把整个任务标记为已完成吗？",
    action_type: "decide",
    completion_criteria: "选择已经完成或还差一步即可。",
    estimated_effort: "low",
    stage: "finish",
    risk_flags: [],
    task_object: taskTitle || "current task",
    expected_output: "user task completion decision",
    progress_intent: "confirm_task_completion",
    completion_scope: "task",
    completion_signal: "user_confirmed",
    ...options
  };
}

export function createNormalTaskCompletionCheckpointStep(
  taskTitle,
  options = {}
) {
  return createTaskCompletionConfirmationStep(taskTitle, {
    completion_confirmation_type:
      COMPLETION_CONFIRMATION_TYPES.NORMAL_TASK_CHECKPOINT,
    step_text:
      "这个任务看起来已经进入收尾边界。现在是否要标记为已完成？",
    ...options
  });
}

export function shouldAskNormalTaskCompletionCheckpoint({
  taskTitle,
  stepHistory = [],
  completionCheckpointDismissedAtStepCount = null
}) {
  void taskTitle;
  void stepHistory;
  void completionCheckpointDismissedAtStepCount;
  return false;
}

export function shouldAskNormalTaskDuplicateCheckpoint({
  taskTitle,
  stepHistory = [],
  completionCheckpointDismissedAtStepCount = null
}) {
  void taskTitle;
  void stepHistory;
  void completionCheckpointDismissedAtStepCount;
  return false;
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

/*
 * The old five-step checkpoint is intentionally disabled. Completion prompts
 * should come from explicit closing/closed-loop signals, duplicate steps, or
 * AI completion suggestions that pass through local rules.
 */
export function legacyShouldAskNormalTaskCompletionCheckpoint({
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

export function legacyShouldAskNormalTaskDuplicateCheckpoint({
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
