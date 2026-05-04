import {
  COMPLETION_CONFIRMATION_TYPES,
  NORMAL_TASK_COMPLETION_CHECK_STEP_COUNT,
  createNormalTaskCompletionCheckpointStep,
  shouldAskNormalTaskCompletionCheckpoint,
  shouldAskNormalTaskDuplicateCheckpoint,
  shouldContinueCompletionConfirmationWithAi
} from "../src/taskCompletionCheckpoint.mjs";

const failures = [];

const normalHistory = Array.from(
  { length: NORMAL_TASK_COMPLETION_CHECK_STEP_COUNT },
  (_, index) => `completed step ${index + 1}`
);

assertTrue(
  "normal task shows checkpoint after five completed steps",
  shouldAskNormalTaskCompletionCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: normalHistory
  })
);

assertTrue(
  "normal task checkpoint is not shown at same dismissed step count",
  !shouldAskNormalTaskCompletionCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: normalHistory,
    completionCheckpointDismissedAtStepCount: normalHistory.length
  })
);

assertTrue(
  "normal task checkpoint can show again after one more completed step",
  shouldAskNormalTaskCompletionCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: [...normalHistory, "completed step 6"],
    completionCheckpointDismissedAtStepCount: normalHistory.length
  })
);

const checkpointStep = createNormalTaskCompletionCheckpointStep(
  "Draft project report"
);

assertEqual(
  "normal checkpoint has completion confirmation type",
  checkpointStep.completion_confirmation_type,
  COMPLETION_CONFIRMATION_TYPES.NORMAL_TASK_CHECKPOINT
);
assertTrue(
  "normal checkpoint continue path asks AI for the next step",
  shouldContinueCompletionConfirmationWithAi(checkpointStep)
);

assertTrue(
  "already completed button can complete normal checkpoint",
  checkpointStep.step_type === "completion_confirmation"
);

assertTrue(
  "early duplicate normal task does not ask for completion before threshold",
  !shouldAskNormalTaskDuplicateCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: ["Open the document"]
  })
);

assertTrue(
  "duplicate normal task can ask for completion after threshold",
  shouldAskNormalTaskDuplicateCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: normalHistory
  })
);

assertTrue(
  "duplicate checkpoint does not immediately reappear after dismissal",
  !shouldAskNormalTaskDuplicateCheckpoint({
    taskTitle: "Draft project report",
    stepHistory: normalHistory,
    completionCheckpointDismissedAtStepCount: normalHistory.length
  })
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
