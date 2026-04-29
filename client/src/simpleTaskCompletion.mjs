const SIMPLE_TASK_TYPES = {
  PURCHASE: "purchase",
  PICKUP: "pickup",
  DAILY_ACTION: "daily_action",
  OPEN: "open",
  SEND: "send"
};

const SIMPLE_TASK_RULES = [
  {
    type: SIMPLE_TASK_TYPES.PURCHASE,
    keywords: ["买咖啡", "买奶茶", "买水", "买早餐", "买饭", "点外卖"]
  },
  {
    type: SIMPLE_TASK_TYPES.PICKUP,
    keywords: ["拿快递", "取快递", "拿外卖", "取餐"]
  },
  {
    type: SIMPLE_TASK_TYPES.DAILY_ACTION,
    keywords: ["倒垃圾", "洗澡", "刷牙", "洗脸", "喝水", "吃药"]
  },
  {
    type: SIMPLE_TASK_TYPES.OPEN,
    keywords: ["打开微信", "打开邮箱", "打开文档", "打开课程"]
  },
  {
    type: SIMPLE_TASK_TYPES.SEND,
    keywords: ["发消息", "回消息", "发邮件"]
  }
];

const COMPLEX_TASK_KEYWORDS = [
  "写",
  "整理",
  "设计",
  "分析",
  "准备",
  "复盘",
  "规划",
  "优化",
  "研究",
  "学习",
  "作品集",
  "论文",
  "ppt",
  "PPT",
  "方案",
  "报告"
];

const FINISHING_STEPS = {
  [SIMPLE_TASK_TYPES.PURCHASE]: {
    step_text: "只补最后一步：完成下单、付款，或走到购买入口。",
    action_type: "move",
    completion_criteria: "完成下单、付款，或到达购买入口即可。",
    stage: "finish"
  },
  [SIMPLE_TASK_TYPES.PICKUP]: {
    step_text: "只补最后一步：打开取件信息，或走到领取点。",
    action_type: "open",
    completion_criteria: "看到取件信息，或到达领取点即可。",
    stage: "finish"
  },
  [SIMPLE_TASK_TYPES.DAILY_ACTION]: {
    step_text: "只补最后一步：到对应位置，先开始 10 秒。",
    action_type: "move",
    completion_criteria: "到达对应位置并开始 10 秒即可。",
    stage: "finish"
  },
  [SIMPLE_TASK_TYPES.OPEN]: {
    step_text: "只补最后一步：打开目标入口，不处理内容。",
    action_type: "open",
    completion_criteria: "打开目标页面或应用即可，不需要继续处理。",
    stage: "finish"
  },
  [SIMPLE_TASK_TYPES.SEND]: {
    step_text: "只补最后一步：检查收件人，然后发送或保存草稿。",
    action_type: "contact",
    completion_criteria: "确认收件人后，发送或保存草稿即可。",
    stage: "finish"
  }
};

export function getSimpleTaskType(taskTitle) {
  const text = normalizeText(taskTitle);

  if (!text || hasAnyKeyword(text, COMPLEX_TASK_KEYWORDS)) {
    return "";
  }

  const rule = SIMPLE_TASK_RULES.find((item) =>
    hasAnyKeyword(text, item.keywords)
  );

  return rule?.type || "";
}

export function shouldAskSimpleTaskCompletion({
  taskTitle,
  stepHistory = [],
  isDuplicate = false
}) {
  const simpleTaskType = getSimpleTaskType(taskTitle);

  if (!simpleTaskType) {
    return false;
  }

  return isDuplicate || stepHistory.length >= 2;
}

export function createSimpleCompletionStep(taskTitle) {
  return {
    step_type: "completion_confirmation",
    step_text: "这件事本身很短，我先不继续拆了。确认一下：现在是否已经完成？",
    action_type: "decide",
    completion_criteria: "选择已经完成或还差一步即可。",
    estimated_effort: "low",
    stage: "finish",
    risk_flags: [],
    simple_task_type: getSimpleTaskType(taskTitle)
  };
}

export function createSimpleFinishingStep(taskTitle) {
  const simpleTaskType = getSimpleTaskType(taskTitle);
  const finishingStep =
    FINISHING_STEPS[simpleTaskType] || {
      step_text: "只补最后一步：确认你现在离完成还差什么，并立刻做掉其中最小的一步。",
      action_type: "decide",
      completion_criteria: "完成最小的最后一步即可。",
      stage: "finish"
    };

  return {
    step_type: "action",
    estimated_effort: "low",
    risk_flags: [],
    ...finishingStep
  };
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function hasAnyKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
}
