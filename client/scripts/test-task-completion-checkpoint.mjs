import {
  COMPLETION_CONFIRMATION_TYPES,
  createNormalTaskCompletionCheckpointStep,
  createTaskCompletionConfirmationStep,
  shouldAskNormalTaskCompletionCheckpoint,
  shouldAskNormalTaskDuplicateCheckpoint,
  shouldContinueCompletionConfirmationWithAi
} from "../src/taskCompletionCheckpoint.mjs";

const failures = [];

const normalHistory = Array.from(
  { length: 6 },
  (_, index) => `completed step ${index + 1}`
);

assertTrue(
  "normal task no longer shows checkpoint only because five steps passed",
  !shouldAskNormalTaskCompletionCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: normalHistory
  })
);

assertTrue(
  "normal duplicate checkpoint is disabled as a step-count gate",
  !shouldAskNormalTaskDuplicateCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: normalHistory
  })
);

const taskCompletionStep = createTaskCompletionConfirmationStep(
  "Draft project report"
);

assertEqual(
  "task completion prompt has task completion type",
  taskCompletionStep.completion_confirmation_type,
  COMPLETION_CONFIRMATION_TYPES.TASK_COMPLETION
);
assertEqual(
  "task completion prompt is scoped to task",
  taskCompletionStep.completion_scope,
  "task"
);
assertTrue(
  "task completion prompt does not continue with AI by default",
  !shouldContinueCompletionConfirmationWithAi(taskCompletionStep)
);

const legacyNormalStep = createNormalTaskCompletionCheckpointStep(
  "Draft project report"
);

assertEqual(
  "legacy normal checkpoint keeps its type for compatibility",
  legacyNormalStep.completion_confirmation_type,
  COMPLETION_CONFIRMATION_TYPES.NORMAL_TASK_CHECKPOINT
);
assertTrue(
  "legacy normal checkpoint can still use AI continuation",
  shouldContinueCompletionConfirmationWithAi(legacyNormalStep)
);

if (failures.length > 0) {
  console.error(`Task completion checkpoint tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Task completion checkpoint tests passed.");
}

function assertEqual(label, actual, expected) {
  assertTrue(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertTrue(label, passed, detail = "") {
  if (!passed) {
    failures.push(`${label}${detail ? ` (${detail})` : ""}`);
  }
}
