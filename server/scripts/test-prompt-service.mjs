import {
  generateFirstStepPrompt,
  generateNextStepPrompt
} from "../src/services/promptService.js";

const failures = [];

const firstStepPrompt = generateFirstStepPrompt({
  task: "做作品集",
  taskContext: {
    current_stage: "有两个项目，还没开始整理"
  },
  clarificationAnswer: "有两个项目，还没开始整理"
});

const prompt = generateNextStepPrompt({
  task: "Draft report",
  stepHistory: ["Open the document", "Write the title"],
  retryReason: "duplicate_step",
  rejectedStep: "Write the title again",
  previousStep: "Write the title",
  recentCompletedSteps: [
    "Collect source links",
    "Open the document",
    "Write the title"
  ],
  duplicateRetryCount: 2,
  rejectedSteps: ["Write the title again", "Rewrite the title"]
});

assertIncludes(
  "first prompt treats clarification answer as provided context",
  firstStepPrompt,
  "Treat Latest clarification answer and Task context JSON as already provided context"
);
assertIncludes(
  "first prompt forbids repeated clarification",
  firstStepPrompt,
  "Do not ask a clarification question that repeats an already answered clarification"
);
assertIncludes(
  "next prompt treats clarification answer as provided context",
  prompt,
  "Treat Latest clarification answer and Task context JSON as already provided context"
);
assertIncludes(
  "next prompt forbids repeated clarification",
  prompt,
  "Do not ask a clarification question that repeats an already answered clarification"
);
assertIncludes("prompt includes retry count", prompt, "Duplicate retry attempt: 2");
assertIncludes("prompt includes rejectedSteps heading", prompt, "Rejected steps from this retry round to avoid");
assertIncludes("prompt includes first rejected step", prompt, "Write the title again");
assertIncludes("prompt includes second rejected step", prompt, "Rewrite the title");
assertIncludes("prompt distinguishes completed history", prompt, "Avoid recentCompletedSteps");
assertIncludes("prompt distinguishes rejected retry candidates", prompt, "Avoid rejectedSteps");
assertIncludes("prompt asks to continue from previousStep", prompt, "Continue naturally from previousStep");
assertIncludes("prompt requires progress_delta", prompt, "new progress_delta");
assertIncludes(
  "second retry strengthens key dimension constraint",
  prompt,
  "second-or-later duplicate retry"
);
assertIncludes("prompt permits task completion", prompt, "return [TASK_DONE]");

if (failures.length > 0) {
  console.error(`Prompt service tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Prompt service tests passed.");
}

function assertIncludes(label, text, expected) {
  if (!text.includes(expected)) {
    failures.push(`${label} (missing ${expected})`);
  }
}
