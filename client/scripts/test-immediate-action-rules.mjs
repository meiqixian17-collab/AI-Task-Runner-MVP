import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const failures = [];
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(scriptDir, "..");
const appSource = fs.readFileSync(
  path.join(clientRoot, "src", "App.jsx"),
  "utf8"
);

const helperSource = [
  "getReadableStepText",
  "getStepText",
  "normalizeText",
  "hasAnyKeyword",
  "normalizeTaskContext",
  "getTaskContextText",
  "isAnsweredClarificationStep",
  "maybeGenerateActionFromAnsweredClarification",
  "maybeGenerateImmediateActionStep"
]
  .map((functionName) => extractFunction(appSource, functionName))
  .join("\n\n");

const context = {
  STEP_SOURCE: {
    LOCAL_RULE: "local_rule"
  },
  hasEnoughSpecificContext: () => false,
  normalizeCurrentStep(value, options = {}) {
    const rawStep = value && typeof value === "object" ? value : {};

    return {
      step_type: rawStep.step_type || "action",
      step_text: rawStep.step_text || "",
      action_type: rawStep.action_type || "write",
      completion_criteria: rawStep.completion_criteria || "",
      estimated_effort: rawStep.estimated_effort || "low",
      stage: rawStep.stage || options.stage || "start",
      risk_flags: rawStep.risk_flags || [],
      ...(rawStep.task_object ? { task_object: rawStep.task_object } : {}),
      ...(rawStep.expected_output
        ? { expected_output: rawStep.expected_output }
        : {}),
      ...(rawStep.progress_intent
        ? { progress_intent: rawStep.progress_intent }
        : {}),
      ...(options.source ? { source: options.source } : {}),
      ...(options.sourceReason ? { source_reason: options.sourceReason } : {})
    };
  }
};

vm.createContext(context);
vm.runInContext(helperSource, context, {
  filename: "App.jsx.immediate-action-helpers.js"
});

const titleContextStep = context.maybeGenerateImmediateActionStep({
  title: "我要做作品集，有两个项目，还没开始整理",
  taskContext: {}
});
assertPortfolioTwoProjectAction(
  "title context produces two-project portfolio action",
  titleContextStep
);

const currentStageContextStep = context.maybeGenerateImmediateActionStep({
  title: "我要做作品集",
  taskContext: {
    current_stage: "有两个项目，还没开始整理"
  }
});
assertPortfolioTwoProjectAction(
  "current_stage context produces two-project portfolio action",
  currentStageContextStep
);

const clarificationAnswerContextStep = context.maybeGenerateImmediateActionStep({
  title: "我要做作品集",
  taskContext: {
    clarification_answer: "有两个项目，还没开始整理"
  }
});
assertPortfolioTwoProjectAction(
  "clarification_answer context produces two-project portfolio action",
  clarificationAnswerContextStep
);

const singleProjectStep = context.maybeGenerateImmediateActionStep({
  title: "我要做作品集，只有一个项目，还没开始",
  taskContext: {}
});
assertTrue(
  "single-project portfolio action is generated",
  singleProjectStep?.step_text?.includes("唯一项目"),
  singleProjectStep?.step_text || "missing step"
);

const repeatedClarificationStep = {
  step_type: "clarification",
  step_text: "你的作品集现在做到哪一步了？",
  clarification_key: "current_stage"
};
const answeredClarificationDecision = simulateAnsweredClarificationBranch({
  title: "我要做作品集",
  taskContext: {
    current_stage: "有两个项目，还没开始整理"
  },
  repeatedClarificationStep
});
assertEqual(
  "answered clarification branch uses immediate action",
  answeredClarificationDecision.action,
  "immediate"
);
assertPortfolioTwoProjectAction(
  "answered clarification branch avoids generic fallback",
  answeredClarificationDecision.step
);

if (failures.length > 0) {
  console.error(`Immediate action rule tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Immediate action rule tests passed.");
}

function simulateAnsweredClarificationBranch({
  title,
  taskContext,
  repeatedClarificationStep
}) {
  if (
    context.isAnsweredClarificationStep(repeatedClarificationStep, taskContext)
  ) {
    const immediateActionStep =
      context.maybeGenerateActionFromAnsweredClarification({
        title,
        taskContext
      });

    if (immediateActionStep) {
      return {
        action: "immediate",
        step: immediateActionStep
      };
    }

    return {
      action: "fallback",
      error: "AI repeated a clarification that was already answered."
    };
  }

  return {
    action: "accept",
    step: repeatedClarificationStep
  };
}

function assertPortfolioTwoProjectAction(label, step) {
  assertTrue(label, step?.step_text?.includes("这两个项目"), step?.step_text);
}

function extractFunction(source, functionName) {
  const marker = `function ${functionName}`;
  const start = source.indexOf(marker);

  if (start === -1) {
    throw new Error(`Missing function ${functionName}`);
  }

  const parametersEnd = source.indexOf(")", start);
  const bodyStart = source.indexOf("{", parametersEnd);
  let depth = 0;

  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Could not parse function ${functionName}`);
}

function assertEqual(label, actual, expected) {
  assertTrue(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertTrue(label, passed, detail = "") {
  if (!passed) {
    failures.push(`${label}${detail ? ` (${detail})` : ""}`);
  }
}
