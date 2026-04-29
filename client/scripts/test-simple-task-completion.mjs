import {
  createSimpleFinishingStep,
  getSimpleTaskType,
  shouldAskSimpleTaskCompletion
} from "../src/simpleTaskCompletion.mjs";

const failures = [];

assertEqual("purchase task is detected", getSimpleTaskType("买咖啡"), "purchase");
assertEqual("pickup task is detected", getSimpleTaskType("拿快递"), "pickup");
assertEqual("daily action task is detected", getSimpleTaskType("洗澡"), "daily_action");
assertEqual("open task is detected", getSimpleTaskType("打开邮箱"), "open");
assertEqual("send task is detected", getSimpleTaskType("发邮件"), "send");
assertEqual(
  "complex task is not treated as simple",
  getSimpleTaskType("写一份买咖啡活动方案"),
  ""
);

assertTrue(
  "simple task asks completion after two completed steps",
  shouldAskSimpleTaskCompletion({
    taskTitle: "买奶茶",
    stepHistory: ["打开外卖 App", "选好奶茶"]
  })
);
assertTrue(
  "simple task asks completion on duplicate",
  shouldAskSimpleTaskCompletion({
    taskTitle: "买咖啡",
    stepHistory: ["打开外卖 App"],
    isDuplicate: true
  })
);
assertTrue(
  "simple task does not ask too early without duplicate",
  !shouldAskSimpleTaskCompletion({
    taskTitle: "买咖啡",
    stepHistory: ["打开外卖 App"]
  })
);
assertTrue(
  "normal task does not use simple completion gate",
  !shouldAskSimpleTaskCompletion({
    taskTitle: "写作品集项目介绍",
    stepHistory: ["打开文档", "写标题"],
    isDuplicate: true
  })
);

assertEqual(
  "purchase finishing step is typed",
  createSimpleFinishingStep("买咖啡").step_text,
  "只补最后一步：完成下单、付款，或走到购买入口。"
);
assertEqual(
  "send finishing step is typed",
  createSimpleFinishingStep("回消息").action_type,
  "contact"
);

if (failures.length > 0) {
  console.error(`Simple task completion tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Simple task completion tests passed.");
}

function assertEqual(label, actual, expected) {
  assertTrue(label, actual === expected, `expected ${expected}, got ${actual}`);
}

function assertTrue(label, passed, detail = "") {
  if (!passed) {
    failures.push(`${label}${detail ? ` (${detail})` : ""}`);
  }
}
