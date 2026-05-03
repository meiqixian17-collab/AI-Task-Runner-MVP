const failures = [];

assertTrue(
  "finish stage alone does not complete open design task",
  !shouldCompleteTask("设计一个百货店 Logo", [], {
    step_text: "画出 3 个不同布局的 Logo 草图。",
    completion_criteria: "完成 3 个可区分的草图即可。",
    stage: "finish"
  })
);
assertTrue(
  "review wording does not complete open design task",
  !shouldCompleteTask("设计一个百货店 Logo", [], {
    step_text: "检查草图是否包含店名和主要图形。",
    completion_criteria: "检查完成即可。",
    stage: "review"
  })
);
assertTrue(
  "submit success completes task",
  shouldCompleteTask("提交申请", [], {
    step_text: "点击提交申请，看到提交成功提示。",
    completion_criteria: "看到提交成功即可。",
    stage: "finish"
  })
);
assertTrue(
  "payment completion completes task",
  shouldCompleteTask("买咖啡", [], {
    step_text: "完成下单并付款。",
    completion_criteria: "付款完成即可。",
    stage: "finish"
  })
);
assertTrue(
  "saved draft does not complete email send task",
  !shouldCompleteTask("发邮件", ["保存草稿"])
);
assertTrue(
  "sent email completes email send task",
  shouldCompleteTask("发邮件", ["邮件已发"])
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

function shouldCompleteTask(task, stepHistory, justCompletedStep = "") {
  if (hasExplicitTaskCompletionSignal(justCompletedStep)) {
    return true;
  }

  const taskType = getTaskType(task);

  if (taskType !== "task_processing") {
    return false;
  }

  const taskSubtype = getTaskSubtype(task, taskType);
  const completedText = normalizeText(
    stepHistory.map((step) => getStepText(step)).join(" ")
  );

  if (taskSubtype === "reply_message") {
    return hasAnyKeyword(completedText, [
      "已回复",
      "回复了",
      "发送回复",
      "发出回复",
      "消息已发"
    ]);
  }

  if (taskSubtype === "send_email") {
    return hasAnyKeyword(completedText, [
      "已发送",
      "发送成功",
      "发送邮件",
      "点击发送",
      "发出邮件",
      "邮件已发"
    ]);
  }

  if (taskSubtype === "submit_application") {
    return hasAnyKeyword(completedText, [
      "已提交",
      "提交申请",
      "已投递",
      "投递简历",
      "发送简历",
      "简历已发"
    ]);
  }

  return hasAnyKeyword(completedText, [
    "已发送",
    "发送成功",
    "已提交",
    "提交成功",
    "已投递",
    "投递成功",
    "已发布",
    "发布成功",
    "已交付",
    "交付完成",
    "已付款",
    "付款完成",
    "已下单",
    "下单完成",
    "预约成功",
    "报名成功",
    "办理完成"
  ]);
}

function hasExplicitTaskCompletionSignal(step) {
  const stepText = getStepText(step);
  const text = normalizeText(
    `${stepText} ${step?.completion_criteria || ""}`
  );

  if (!stepText) {
    return false;
  }

  const executionText = stripNegatedFinalActions(text);

  return hasAnyKeyword(executionText, [
    "已发送",
    "发送成功",
    "已完成发送",
    "已提交",
    "提交成功",
    "已完成提交",
    "已投递",
    "投递成功",
    "已发布",
    "发布成功",
    "已交付",
    "交付完成",
    "已付款",
    "付款完成",
    "已完成付款",
    "已下单",
    "下单完成",
    "预约成功",
    "报名成功",
    "办理完成",
    "邮件已发",
    "消息已发",
    "申请已提交",
    "简历已投递",
    "订单已完成",
    "报名已成功",
    "预约已成功"
  ]);
}

function stripNegatedFinalActions(text) {
  const safePhrases = [
    "不需要发送",
    "不发送",
    "不要发送",
    "先不要发送",
    "不需要提交",
    "不提交",
    "不要提交",
    "不发布",
    "不要发布",
    "不需要发布",
    "不发出",
    "不要发出"
  ];

  return safePhrases.reduce(
    (currentText, phrase) => currentText.replaceAll(phrase, ""),
    text
  );
}

function getTaskType(task) {
  const text = normalizeText(task);

  if (hasAnyKeyword(text, ["消息", "回复", "联系", "邮件", "简历", "投递", "申请", "手续", "办理", "报名", "预约"])) {
    return "task_processing";
  }

  return "general";
}

function getTaskSubtype(task, taskType) {
  if (taskType !== "task_processing") {
    return "";
  }

  const text = normalizeText(task);

  if (hasAnyKeyword(text, ["回复", "回消息", "消息"])) {
    return "reply_message";
  }

  if (hasAnyKeyword(text, ["邮件", "邮箱"])) {
    return "send_email";
  }

  if (hasAnyKeyword(text, ["简历", "投递", "申请"])) {
    return "submit_application";
  }

  return "";
}

function getStepText(step) {
  if (typeof step === "string") {
    return step.trim() === "[object Object]" ? "" : step;
  }

  if (!step || typeof step !== "object") {
    return "";
  }

  return step.step_text || step.content || step.text || "";
}

function normalizeText(value) {
  const text = getStepText(value) || String(value || "");
  return text.toLowerCase();
}

function hasAnyKeyword(text, keywords) {
  return keywords.some((keyword) =>
    text.includes(String(keyword).toLowerCase())
  );
}

function assertTrue(label, passed) {
  if (!passed) {
    failures.push(label);
  }
}
