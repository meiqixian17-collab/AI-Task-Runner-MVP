import {
  COMPLETION_ACTIONS,
  TASK_COMPLETION_STRATEGIES,
  ARTIFACT_SUBTYPES,
  decideCompletionBoundary,
  detectCompletionSignals,
  getClosingChecklistTemplate,
  getTaskCompletionProfile
} from "../src/taskCompletionModel.mjs";

const failures = [];

assertEqual(
  "paper task is artifact creation",
  getTaskCompletionProfile("写论文").strategy,
  TASK_COMPLETION_STRATEGIES.ARTIFACT_CREATION
);
assertEqual(
  "paper subtype is detected",
  getTaskCompletionProfile("写论文").subtype,
  ARTIFACT_SUBTYPES.PAPER
);
assertEqual(
  "presentation subtype is detected",
  getTaskCompletionProfile("做 PPT").subtype,
  ARTIFACT_SUBTYPES.PRESENTATION
);
assertEqual(
  "portfolio subtype is detected",
  getTaskCompletionProfile("写作品集").subtype,
  ARTIFACT_SUBTYPES.PORTFOLIO
);
assertEqual(
  "research report subtype is detected",
  getTaskCompletionProfile("写调研报告").subtype,
  ARTIFACT_SUBTYPES.RESEARCH_REPORT
);
assertEqual(
  "submit application is closed loop",
  getTaskCompletionProfile("提交申请").strategy,
  TASK_COMPLETION_STRATEGIES.CLOSED_LOOP_ACTION
);
assertEqual(
  "email task is communication",
  getTaskCompletionProfile("发邮件").strategy,
  TASK_COMPLETION_STRATEGIES.COMMUNICATION
);

assertTrue(
  "negation protection detects saved draft",
  detectCompletionSignals({
    step_text: "保存草稿，不需要发送。"
  }).hasNegation
);
assertTrue(
  "external closed loop detects submit success",
  detectCompletionSignals({
    step_text: "看到提交成功提示。"
  }).hasExternalClosedLoop
);
assertTrue(
  "closing action detects exportable version",
  detectCompletionSignals({
    step_text: "导出可展示版本。"
  }).hasClosingAction
);

assertEqual(
  "paper conclusion does not complete the task",
  decideCompletionBoundary({
    taskTitle: "写论文",
    completedStep: {
      step_text: "写完结论。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE_NEXT_PHASE
);
assertEqual(
  "paper final draft enters closing checklist",
  decideCompletionBoundary({
    taskTitle: "写论文",
    completedStep: {
      step_text: "检查最终稿格式并保存最终版。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST
);
assertEqual(
  "PPT export enters closing checklist",
  decideCompletionBoundary({
    taskTitle: "做 PPT",
    completedStep: {
      step_text: "导出可展示版本。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST
);
assertEqual(
  "PPT page writing continues",
  decideCompletionBoundary({
    taskTitle: "做 PPT",
    completedStep: {
      step_text: "写完第 3 页内容。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE
);
assertEqual(
  "portfolio copy completion is only phase completion",
  decideCompletionBoundary({
    taskTitle: "写作品集",
    completedStep: {
      step_text: "文案写完。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE_NEXT_PHASE
);
assertEqual(
  "portfolio images and layout enter closing checklist",
  decideCompletionBoundary({
    taskTitle: "写作品集",
    completedStep: {
      step_text: "补齐图片并完成排版。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST
);
assertEqual(
  "research report submit version enters closing checklist",
  decideCompletionBoundary({
    taskTitle: "写调研报告",
    completedStep: {
      step_text: "整理成可提交版本。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST
);
assertEqual(
  "saved draft protects email from completion",
  decideCompletionBoundary({
    taskTitle: "发邮件",
    completedStep: {
      step_text: "保存草稿，不需要发送。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE
);
assertEqual(
  "submitted application asks for task completion",
  decideCompletionBoundary({
    taskTitle: "提交申请",
    completedStep: {
      step_text: "看到提交成功提示。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.ASK_TASK_COMPLETION
);
assertEqual(
  "resume delivery asks for task completion",
  decideCompletionBoundary({
    taskTitle: "投递简历",
    completedStep: {
      step_text: "简历已投递。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.ASK_TASK_COMPLETION
);
assertEqual(
  "negation beats submit wording",
  decideCompletionBoundary({
    taskTitle: "提交报告",
    completedStep: {
      step_text: "检查提交按钮，但先不要提交。"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE
);
assertEqual(
  "AI done suggestion on paper enters closing checklist",
  decideCompletionBoundary({
    taskTitle: "写论文",
    completedStep: "",
    stepHistory: [],
    aiSuggestedComplete: true
  }).action,
  COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST
);
assertEqual(
  "unknown task with AI done suggestion asks for confirmation",
  decideCompletionBoundary({
    taskTitle: "做一个项目",
    completedStep: "",
    stepHistory: [],
    aiSuggestedComplete: true
  }).action,
  COMPLETION_ACTIONS.ASK_TASK_COMPLETION
);
assertTrue(
  "paper checklist has concrete checklist items",
  getClosingChecklistTemplate("写论文").items.length >= 5
);

if (failures.length > 0) {
  console.error(`Task completion model tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Task completion model tests passed.");
}

function assertEqual(label, actual, expected) {
  assertTrue(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertTrue(label, passed, detail = "") {
  if (!passed) {
    failures.push(`${label}${detail ? ` (${detail})` : ""}`);
  }
}
