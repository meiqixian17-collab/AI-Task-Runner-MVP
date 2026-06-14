import {
  COMPLETION_ACTIONS,
  decideCompletionBoundary
} from "../src/taskCompletionModel.mjs";

const failures = [];

assertEqual(
  "finish stage alone does not complete open design task",
  decideCompletionBoundary({
    taskTitle: "设计一个百货店 Logo",
    completedStep: {
      step_text: "画出 3 个不同布局的 Logo 草图。",
      completion_criteria: "完成 3 个可区分的草图即可。",
      stage: "finish"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE
);
assertEqual(
  "review wording does not complete open design task",
  decideCompletionBoundary({
    taskTitle: "设计一个百货店 Logo",
    completedStep: {
      step_text: "检查草图是否包含店名和主要图形。",
      completion_criteria: "检查完成即可。",
      stage: "review"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE
);
assertEqual(
  "submit success asks for completion confirmation",
  decideCompletionBoundary({
    taskTitle: "提交申请",
    completedStep: {
      step_text: "点击提交申请，看到提交成功提示。",
      completion_criteria: "看到提交成功即可。",
      stage: "finish"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.ASK_TASK_COMPLETION
);
assertEqual(
  "payment completion asks for completion confirmation",
  decideCompletionBoundary({
    taskTitle: "买咖啡",
    completedStep: {
      step_text: "完成下单并付款。",
      completion_criteria: "付款完成即可。",
      stage: "finish"
    },
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.ASK_TASK_COMPLETION
);
assertEqual(
  "saved draft does not complete email send task",
  decideCompletionBoundary({
    taskTitle: "发邮件",
    completedStep: "保存草稿，不需要发送",
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.CONTINUE
);
assertEqual(
  "sent email asks for completion confirmation",
  decideCompletionBoundary({
    taskTitle: "发邮件",
    completedStep: "邮件已发",
    stepHistory: []
  }).action,
  COMPLETION_ACTIONS.ASK_TASK_COMPLETION
);

if (failures.length > 0) {
  console.error(`Task completion rule tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Task completion rule tests passed.");
}

function assertEqual(label, actual, expected) {
  assertTrue(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertTrue(label, passed, detail = "") {
  if (!passed) {
    failures.push(`${label}${detail ? ` (${detail})` : ""}`);
  }
}
