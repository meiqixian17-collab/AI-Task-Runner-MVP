import {
  MAX_DUPLICATE_RETRY_COUNT,
  buildDuplicateRetryContext,
  getDuplicateStepDecision
} from "../src/duplicateRetry.mjs";
import { isDuplicateStepEntry } from "../src/stepDuplicate.mjs";

const failures = [];

const history = [
  makeStep("open", "doc", "doc open", "Open the document"),
  makeStep("write", "title", "title written", "Write the title")
];
const duplicateStep = makeStep("write", "title", "title written", "Write the title");

const firstDuplicateDecision = getDuplicateStepDecision({
  nextStep: duplicateStep,
  historyForCompare: history,
  taskTitle: "Draft report",
  duplicateRetryCount: 0,
  rejectedSteps: [],
  isDuplicateStep: isDuplicateStepEntry,
  shouldAskSimpleTaskCompletion: () => false,
  getStepText
});

assertEqual(
  "first duplicate retries instead of falling back",
  firstDuplicateDecision.action,
  "retry"
);
assertEqual(
  "first retry attempt is counted as 1",
  firstDuplicateDecision.nextDuplicateRetryCount,
  1
);

const secondDuplicateStep = makeStep(
  "write",
  "title",
  "title written",
  "Write the title again"
);
const secondDuplicateDecision = getDuplicateStepDecision({
  nextStep: secondDuplicateStep,
  historyForCompare: history,
  taskTitle: "Draft report",
  duplicateRetryCount: firstDuplicateDecision.nextDuplicateRetryCount,
  rejectedSteps: firstDuplicateDecision.rejectedSteps,
  isDuplicateStep: () => true,
  shouldAskSimpleTaskCompletion: () => false,
  getStepText
});

assertEqual(
  "second duplicate still retries when under max",
  secondDuplicateDecision.action,
  "retry"
);
assertDeepEqual(
  "second retry carries both failed candidates",
  secondDuplicateDecision.rejectedSteps,
  ["Write the title", "Write the title again"]
);

const maxedDuplicateDecision = getDuplicateStepDecision({
  nextStep: "Write the title one more time",
  historyForCompare: history,
  taskTitle: "Draft report",
  duplicateRetryCount: MAX_DUPLICATE_RETRY_COUNT,
  rejectedSteps: secondDuplicateDecision.rejectedSteps,
  isDuplicateStep: () => true,
  shouldAskSimpleTaskCompletion: () => false,
  getStepText
});

assertEqual(
  "max duplicate retry count falls back",
  maxedDuplicateDecision.action,
  "fallback"
);

const longHistory = ["step 1", "step 2", "step 3", "step 4", "step 5", "step 6"];
const retryContext = buildDuplicateRetryContext({
  rejectedStep: "step 6",
  historyForCompare: longHistory,
  duplicateRetryCount: 2,
  rejectedSteps: ["step 6", "step 6 again"],
  getStepText
});

assertDeepEqual(
  "recentCompletedSteps only keeps the latest five completed steps",
  retryContext.recentCompletedSteps,
  ["step 2", "step 3", "step 4", "step 5", "step 6"]
);
assertEqual("retry context exposes duplicateRetryCount", retryContext.duplicateRetryCount, 2);
assertDeepEqual("retry context exposes rejectedSteps", retryContext.rejectedSteps, [
  "step 6",
  "step 6 again"
]);

const nonDuplicateDecision = getDuplicateStepDecision({
  nextStep: makeStep("review", "intro", "intro checked", "Review the intro"),
  historyForCompare: history,
  taskTitle: "Draft report",
  duplicateRetryCount: 0,
  rejectedSteps: [],
  isDuplicateStep: isDuplicateStepEntry,
  shouldAskSimpleTaskCompletion: () => false,
  getStepText
});

assertEqual(
  "non duplicate step is accepted for normal currentStep update",
  nonDuplicateDecision.action,
  "accept"
);

const simpleCompletionDecision = getDuplicateStepDecision({
  nextStep: duplicateStep,
  historyForCompare: history,
  taskTitle: "Buy coffee",
  duplicateRetryCount: 0,
  rejectedSteps: [],
  isDuplicateStep: () => true,
  shouldAskSimpleTaskCompletion: () => true,
  getStepText
});

assertEqual(
  "simple task duplicate asks for completion before retry",
  simpleCompletionDecision.action,
  "complete"
);

if (failures.length > 0) {
  console.error(`Duplicate retry tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Duplicate retry tests passed.");
}

function makeStep(actionType, taskObject, expectedOutput, stepText) {
  return {
    step_text: stepText,
    action_type: actionType,
    task_object: taskObject,
    expected_output: expectedOutput,
    progress_intent: `${actionType}_${taskObject}`
  };
}

function getStepText(step) {
  if (typeof step === "string") {
    return step.trim();
  }

  return String(step?.step_text || step?.content || "").trim();
}

function assertEqual(label, actual, expected) {
  assertTrue(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertDeepEqual(label, actual, expected) {
  assertEqual(label, JSON.stringify(actual), JSON.stringify(expected));
}

function assertTrue(label, passed, detail = "") {
  if (!passed) {
    failures.push(`${label}${detail ? ` (${detail})` : ""}`);
  }
}
