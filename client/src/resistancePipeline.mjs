import { RESISTANCE_TEMPLATE_LIBRARY } from "./resistance/templateLibrary.mjs";

const TASK_TYPES = {
  WRITING_OUTPUT: "writing_output",
  PHYSICAL_ACTION: "physical_action",
  LEARNING_INPUT: "learning_input",
  TASK_PROCESSING: "task_processing",
  DECISION_MAKING: "decision_making",
  GENERAL: "general"
};

const TASK_SUBTYPES = {
  GENERAL: "general",
  PPT_CREATION: "ppt_creation",
  ESSAY_HOMEWORK: "essay_homework",
  PROPOSAL_COPY: "proposal_copy",
  VOCABULARY_MEMORIZATION: "vocabulary_memorization",
  CHAPTER_STUDY: "chapter_study",
  REVIEW_NOTES: "review_notes",
  FITNESS_EXERCISE: "fitness_exercise",
  SHOPPING_ERRAND: "shopping_errand",
  CLEANING_TIDYING: "cleaning_tidying",
  REPLY_MESSAGE: "reply_message",
  SEND_EMAIL: "send_email",
  SUBMIT_APPLICATION: "submit_application"
};

const ACTION_TYPES = [
  "open",
  "write",
  "select",
  "prepare",
  "contact",
  "move",
  "review",
  "decide"
];

const ESTIMATED_EFFORTS = ["low", "medium", "high"];
const STEP_STAGES = ["start", "clarify", "execute", "review", "finish"];

const ROOT_CAUSES = [
  "unclear_output",
  "too_large",
  "emotional_pressure",
  "social_pressure",
  "perfectionism",
  "physical_low_energy",
  "value_uncertainty"
];

const RECOVERY_MODES = [
  "shrink_action",
  "clarify_standard",
  "safe_draft",
  "low_quality_draft",
  "pause_and_resume",
  "value_check"
];

const ACTION_TYPE_RISK_RULES = {
  contact: ["social_pressure", "emotional_pressure"],
  write: ["perfectionism", "unclear_output"],
  select: ["unclear_output"],
  prepare: ["unclear_output"],
  move: ["physical_low_energy"],
  review: ["perfectionism"],
  decide: ["value_uncertainty"],
  open: []
};

const KEYWORD_RISK_RULES = [
  {
    keywords: [
      "回复",
      "联系",
      "发消息",
      "发一句",
      "微信",
      "邮件",
      "邮箱",
      "老师",
      "hr",
      "道歉",
      "请假",
      "拒绝",
      "催",
      "问老师",
      "问HR"
    ],
    risks: ["social_pressure", "emotional_pressure"]
  },
  {
    keywords: ["整理", "优化", "准备", "规划", "思考", "梳理"],
    risks: ["unclear_output"]
  },
  {
    keywords: ["简历", "作品集", "PPT", "ppt", "汇报", "论文", "文案", "设计"],
    risks: ["perfectionism"]
  },
  {
    keywords: ["站起来", "出门", "洗澡", "运动", "健身", "打扫", "整理房间", "拿快递"],
    risks: ["physical_low_energy"]
  },
  {
    keywords: ["要不要", "是否继续", "值不值得", "方向", "选择", "放弃"],
    risks: ["value_uncertainty"]
  }
];

const UNCLEAR_COMPLETION_PHRASES = [
  "整理好",
  "想清楚",
  "准备充分",
  "优化完成",
  "做到满意"
];

const TASK_TYPE_PHRASE_RULES = [
  {
    type: TASK_TYPES.TASK_PROCESSING,
    phrases: [
      "回老师消息",
      "回复老师",
      "联系老师",
      "发邮件",
      "投简历",
      "办手续",
      "提交申请",
      "预约时间"
    ]
  },
  {
    type: TASK_TYPES.LEARNING_INPUT,
    phrases: [
      "背单词",
      "复习英语",
      "看课程资料",
      "学一个新章节",
      "学习新章节"
    ]
  },
  {
    type: TASK_TYPES.WRITING_OUTPUT,
    phrases: [
      "写答辩ppt",
      "写答辩PPT",
      "做答辩ppt",
      "做答辩PPT",
      "写论文提纲",
      "写作业",
      "准备汇报",
      "做作品集文案",
      "写作品集文案"
    ]
  },
  {
    type: TASK_TYPES.PHYSICAL_ACTION,
    phrases: [
      "去超市买东西",
      "去超市买菜",
      "打扫房间",
      "收拾房间",
      "今天去健身"
    ]
  },
  {
    type: TASK_TYPES.DECISION_MAKING,
    phrases: [
      "要不要继续",
      "要不要考研",
      "要不要换方向",
      "该不该考研",
      "是否继续"
    ]
  }
];

const TASK_TYPE_KEYWORD_RULES = [
  {
    type: TASK_TYPES.DECISION_MAKING,
    keywords: ["要不要", "是否", "该不该", "继续项目", "辞职", "换方向", "考研"]
  },
  {
    type: TASK_TYPES.TASK_PROCESSING,
    keywords: [
      "消息",
      "回复",
      "联系",
      "邮件",
      "简历",
      "投递",
      "申请",
      "手续",
      "办理",
      "报名",
      "预约"
    ]
  },
  {
    type: TASK_TYPES.LEARNING_INPUT,
    keywords: [
      "单词",
      "复习",
      "看书",
      "读书",
      "英语",
      "课程",
      "章节",
      "学习",
      "考试",
      "资料",
      "笔记"
    ]
  },
  {
    type: TASK_TYPES.PHYSICAL_ACTION,
    keywords: [
      "健身",
      "跑步",
      "散步",
      "走路",
      "运动",
      "超市",
      "买菜",
      "买东西",
      "打扫",
      "收拾",
      "整理房间",
      "收拾宿舍",
      "清理",
      "收纳"
    ]
  },
  {
    type: TASK_TYPES.WRITING_OUTPUT,
    keywords: [
      "写论文",
      "论文",
      "汇报",
      "作品集",
      "写方案",
      "方案",
      "写作业",
      "作业",
      "写作",
      "写文章",
      "文章",
      "文档",
      "报告",
      "ppt",
      "幻灯片",
      "答辩"
    ]
  }
];

const ROOT_CAUSE_RECOVERY_MODES = {
  unclear_output: "clarify_standard",
  too_large: "shrink_action",
  emotional_pressure: "safe_draft",
  social_pressure: "safe_draft",
  perfectionism: "low_quality_draft",
  physical_low_energy: "pause_and_resume",
  value_uncertainty: "value_check"
};

const FALLBACK_POLICIES = {
  clarify_standard: "clear_output_template_or_options",
  shrink_action: "shrink_to_first_physical_action",
  safe_draft: "draft_before_contact_or_social_risk",
  low_quality_draft: "low_quality_draft",
  pause_and_resume: "reduce_body_cost_or_30_second_action",
  value_check: "minimum_value_check"
};

const LOW_STATE_KEYWORDS = [
  "累",
  "困",
  "头疼",
  "头痛",
  "胃不舒服",
  "肚子疼",
  "没力气",
  "没电",
  "撑不住",
  "站不起来",
  "状态差",
  "身体",
  "起不来",
  "想睡",
  "崩溃",
  "难受",
  "不舒服"
];

const VALUE_LANGUAGE_KEYWORDS = [
  "值不值",
  "值不值得",
  "没意义",
  "没希望",
  "骗自己",
  "白费",
  "还要不要",
  "继续有什么用",
  "是不是该停",
  "没天赋",
  "要不要",
  "该不该",
  "是否继续",
  "不值得",
  "放弃"
];

const EMOTIONAL_PRESSURE_KEYWORDS = [
  "怕",
  "害怕",
  "不敢",
  "被骂",
  "被说",
  "被批",
  "责备",
  "尴尬",
  "丢脸",
  "冲突",
  "记恨",
  "生气",
  "被讨厌",
  "焦虑",
  "压力",
  "不想点开",
  "逃避"
];

const PERFECTIONISM_LANGUAGE_KEYWORDS = [
  "不够好",
  "不够高级",
  "太普通",
  "像废话",
  "像小学生",
  "不专业",
  "业余",
  "拿不出手",
  "想完美",
  "做了也白做",
  "准备充分",
  "不完美",
  "很烂",
  "太烂",
  "改不好"
];

const UNCLEAR_STANDARD_KEYWORDS = [
  "不知道",
  "没思路",
  "没方向",
  "看不懂",
  "越看越乱",
  "不知道标准",
  "不知道写什么",
  "不知道怎么判断",
  "不知道怎么",
  "不会",
  "太乱",
  "信息太多",
  "路径不清楚"
];

const PUBLIC_EXPOSURE_KEYWORDS = [
  "发送",
  "发出",
  "发布",
  "提交",
  "投递",
  "联系",
  "回复",
  "微信",
  "聊天框",
  "邮件",
  "邮箱",
  "老师",
  "领导",
  "客户",
  "对方",
  "别人看"
];

const PHYSICAL_DEMAND_KEYWORDS = [
  "站起来",
  "走到",
  "出门",
  "运动",
  "健身",
  "跑步",
  "练",
  "训练",
  "打扫",
  "收拾",
  "整理房间",
  "拿东西",
  "拿起",
  "放下"
];

// Layer 1: Context Layer
export function buildResistanceContext({
  taskTitle = "",
  taskMap = null,
  currentStep = "",
  stepHistory = [],
  userUtterance = "",
  selectedResistanceType = ""
} = {}) {
  const title = String(taskTitle || "").trim();
  const normalizedHistory = Array.isArray(stepHistory)
    ? stepHistory.map((step) => getStepText(step)).filter(Boolean)
    : [];
  const taskType = getTaskType(title);
  const normalizedStep =
    normalizeCurrentStep(currentStep, {
      taskTitle: title,
      taskType
    }) || createEmptyStep();
  const stepText = getStepText(normalizedStep);
  const subtype = getTaskSubtype(`${title} ${stepText}`, taskType);
  const utterance = String(userUtterance || "").trim();
  const combinedText = normalizeText(`${title} ${stepText}`);
  const resistanceText = normalizeText(utterance);
  const fullContextText = normalizeText(`${title} ${stepText} ${utterance}`);
  const surfaceResistance = identifySurfaceResistance(
    utterance,
    selectedResistanceType
  );
  const isAtomicStep = isAtomicCurrentStep(normalizedStep);
  const canShrinkFurther = canShrinkCurrentStep(normalizedStep, isAtomicStep);
  const isContactContext = isContactRelated(title, taskType, normalizedStep);

  return {
    task: {
      title,
      type: taskType,
      subtype,
      taskMap: taskMap && typeof taskMap === "object" ? taskMap : undefined
    },
    current_step: {
      step_text: normalizedStep.step_text,
      action_type: normalizedStep.action_type,
      stage: normalizedStep.stage,
      completion_criteria: normalizedStep.completion_criteria,
      estimated_effort: normalizedStep.estimated_effort,
      risk_flags: normalizedStep.risk_flags,
      can_shrink_further: canShrinkFurther
    },
    step_history: normalizedHistory,
    resistance_input: {
      user_utterance: utterance,
      selected_resistance_type: selectedResistanceType || "",
      surface_resistance: surfaceResistance
    },
    derived_context: {
      is_contact_related: isContactContext,
      is_atomic_step: isAtomicStep,
      can_shrink_further: canShrinkFurther,
      has_user_utterance: Boolean(utterance),
      has_public_exposure:
        isContactContext ||
        normalizedStep.action_type === "contact" ||
        hasAnyKeyword(fullContextText, PUBLIC_EXPOSURE_KEYWORDS),
      has_physical_demand:
        taskType === TASK_TYPES.PHYSICAL_ACTION ||
        normalizedStep.action_type === "move" ||
        hasAnyKeyword(combinedText, PHYSICAL_DEMAND_KEYWORDS),
      has_value_language: hasAnyKeyword(resistanceText, VALUE_LANGUAGE_KEYWORDS),
      has_perfectionism_language: hasAnyKeyword(
        resistanceText,
        PERFECTIONISM_LANGUAGE_KEYWORDS
      ),
      has_unclear_standard_language: hasAnyKeyword(
        resistanceText,
        UNCLEAR_STANDARD_KEYWORDS
      ),
      has_low_state_language: hasAnyKeyword(resistanceText, LOW_STATE_KEYWORDS)
    }
  };
}

export function buildAiDiagnosisContext(inputOrContext = {}) {
  const context = inputOrContext?.current_step
    ? inputOrContext
    : buildResistanceContext(inputOrContext);
  const selectedType = context?.resistance_input?.selected_resistance_type || "";
  const userUtterance =
    context?.resistance_input?.user_utterance ||
    getSelectedResistanceUtterance(selectedType);

  return {
    task_title: context?.task?.title || "",
    task_type: context?.task?.type || TASK_TYPES.GENERAL,
    ...(context?.task?.taskMap ? { taskMap: context.task.taskMap } : {}),
    currentStep: {
      step_text: context?.current_step?.step_text || "",
      action_type: context?.current_step?.action_type || "open",
      completion_criteria: context?.current_step?.completion_criteria || "",
      estimated_effort: context?.current_step?.estimated_effort || "low",
      stage: context?.current_step?.stage || "start",
      risk_flags: Array.isArray(context?.current_step?.risk_flags)
        ? context.current_step.risk_flags
        : []
    },
    stepHistory: Array.isArray(context?.step_history)
      ? context.step_history
      : [],
    user_utterance: userUtterance
  };
}

// Layer 2: Decision Layer
export function diagnoseResistance(context) {
  const surfaceResistance =
    context?.resistance_input?.surface_resistance || "dont_want";
  const userUtterance = context?.resistance_input?.user_utterance || "";
  const currentStep = context?.current_step || createEmptyStep();
  const taskTitle = context?.task?.title || "";
  const taskType = context?.task?.type || getTaskType(taskTitle);
  const utteranceRoot = getRootCauseFromUtterance({
    taskTitle,
    taskType,
    currentStep,
    userUtterance
  });
  const riskRoot = getRootCauseFromRiskFlags(
    currentStep.risk_flags || [],
    surfaceResistance
  );
  const rootCause =
    getRootCauseFromDerivedContext(context) ||
    utteranceRoot ||
    riskRoot ||
    getDefaultRootCause(surfaceResistance);
  const confidence = getDiagnosisConfidence({
    utteranceRoot,
    riskRoot,
    surfaceResistance
  });

  return {
    surface_resistance: surfaceResistance,
    root_cause: rootCause,
    confidence,
    evidence: buildDiagnosisEvidence({
      context,
      utteranceRoot,
      riskRoot,
      rootCause
    }),
    risks_to_avoid: getRisksToAvoid(rootCause, context)
  };
}

export function decideRecoveryMode(context, diagnosis) {
  const rootCause = normalizeRootCause(diagnosis?.root_cause);
  const recoveryMode = chooseRecoveryMode(context, rootCause);
  const blockedActions = getBlockedActions(context, rootCause, recoveryMode);

  return {
    recovery_mode: RECOVERY_MODES.includes(recoveryMode)
      ? recoveryMode
      : "shrink_action",
    fallback_policy:
      FALLBACK_POLICIES[recoveryMode] || FALLBACK_POLICIES.shrink_action,
    should_replace_current_step: true,
    should_pause: recoveryMode === "pause_and_resume",
    blocked_actions: blockedActions
  };
}

// Layer 3: Output Layer
export function generateFallbackStep(context, diagnosis, recoveryDecision) {
  const boundaryStep = generateBoundaryStepIfNeeded(
    context,
    diagnosis,
    recoveryDecision
  );

  if (boundaryStep) {
    return boundaryStep;
  }

  const template = findResistanceTemplate({
    context,
    diagnosis,
    recoveryDecision
  });

  if (template) {
    return buildStepFromTemplate(template, context);
  }

  return generateGenericFallbackStep(context, diagnosis, recoveryDecision);
}

function generateBoundaryStepIfNeeded(context, diagnosis, recoveryDecision) {
  const selectedType = context?.resistance_input?.selected_resistance_type || "";
  const recoveryMode = recoveryDecision?.recovery_mode || "";
  const rootCause = normalizeRootCause(diagnosis?.root_cause);

  if (
    selectedType === "tooHard" &&
    context?.derived_context?.is_atomic_step &&
    !context?.derived_context?.can_shrink_further &&
    !context?.derived_context?.has_public_exposure &&
    !context?.derived_context?.has_low_state_language
  ) {
    return generateAtomicBoundaryStep(context);
  }

  if (
    selectedType === "dontWant" &&
    rootCause === "too_large" &&
    recoveryMode === "clarify_standard"
  ) {
    return generateMinimumWillpowerStep(context);
  }

  return null;
}

function generateAtomicBoundaryStep(context) {
  const taskTitle = context?.task?.title || "";
  const taskType = context?.task?.type || getTaskType(taskTitle);
  const currentText = getStepText(context?.current_step) || "当前这一小步";

  return makeFallbackStep(
    {
      step_text: `这一步已经不能再拆了。现在只保留原动作：${currentText}`,
      action_type: context?.current_step?.action_type || "decide",
      completion_criteria: "只要完成这一个原动作即可，不再继续拆分。",
      stage: context?.current_step?.stage || "execute",
      risk_flags: ["too_large"]
    },
    taskTitle,
    taskType
  );
}

function generateMinimumWillpowerStep(context) {
  const taskTitle = context?.task?.title || "";
  const taskType = context?.task?.type || getTaskType(taskTitle);
  const sourceText = normalizeText(
    `${taskTitle} ${getStepText(context?.current_step)}`
  );
  let step = {
    step_text: "先只做 10 秒，把当前任务入口放到眼前，不要求继续。",
    action_type: "prepare",
    completion_criteria: "入口到眼前就算完成，不需要继续推进。",
    stage: "start",
    risk_flags: ["too_large"]
  };

  if (context?.derived_context?.has_physical_demand) {
    step = {
      step_text: "先不要求完成运动，只把一个相关物品放到眼前，比如水杯、衣服或鞋。",
      action_type: "prepare",
      completion_criteria: "只要有一个相关物品到眼前即可，不需要站起来或开始训练。",
      stage: "start",
      risk_flags: ["too_large", "physical_low_energy"]
    };
  } else if (hasAnyKeyword(sourceText, ["写", "文档", "作业", "论文", "简历"])) {
    step = {
      step_text: "先不写正文，只在文档里留下一个临时标题。",
      action_type: "write",
      completion_criteria: "写出临时标题就算完成，不需要继续写。",
      stage: "start",
      risk_flags: ["too_large", "perfectionism"]
    };
  } else if (hasAnyKeyword(sourceText, ["学习", "复习", "课程", "资料"])) {
    step = {
      step_text: "先不学习内容，只把资料打开到要看的那一页。",
      action_type: "open",
      completion_criteria: "看到那一页就算完成，不需要继续看。",
      stage: "start",
      risk_flags: ["too_large"]
    };
  } else if (context?.derived_context?.is_contact_related) {
    step = {
      step_text: "先不联系对方，只在备忘录里写下你要表达的 1 个关键词。",
      action_type: "write",
      completion_criteria: "写出 1 个关键词即可，不需要发送。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    };
  }

  return makeFallbackStep(step, taskTitle, taskType);
}

function generateGenericFallbackStep(context, diagnosis, recoveryDecision) {
  const taskTitle = context?.task?.title || "";
  const taskType = context?.task?.type || getTaskType(taskTitle);
  const currentStep = context?.current_step || createEmptyStep();
  const recoveryMode = recoveryDecision?.recovery_mode || "shrink_action";

  switch (recoveryMode) {
    case "pause_and_resume":
      return generatePauseAndResumeStep(context, taskTitle, taskType);
    case "value_check":
      return generateValueCheckStep(context, taskTitle, taskType);
    case "safe_draft":
      return generateSafeDraftStep(context, taskTitle, taskType);
    case "low_quality_draft":
      return generateLowQualityDraftStep(context, taskTitle, taskType);
    case "clarify_standard":
      return generateClarifyStandardStep(context, taskTitle, taskType);
    case "shrink_action":
      return generateShrinkActionStep(context, taskTitle, taskType);
    default:
      return generateClarifyStandardStep(context, taskTitle, taskType);
  }
}

function findResistanceTemplate({ context, diagnosis, recoveryDecision }) {
  const recoveryMode = recoveryDecision?.recovery_mode || "";
  const rootCause = normalizeRootCause(diagnosis?.root_cause);
  const scoredTemplates = RESISTANCE_TEMPLATE_LIBRARY.map((template) => {
    const score = scoreResistanceTemplate({
      template,
      context,
      recoveryMode,
      rootCause
    });

    return {
      template,
      score
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredTemplates[0]?.template || null;
}

function scoreResistanceTemplate({ template, context, recoveryMode, rootCause }) {
  if (template.recovery_mode !== recoveryMode) {
    return 0;
  }

  if (
    Array.isArray(template.root_causes) &&
    template.root_causes.length > 0 &&
    !template.root_causes.includes(rootCause)
  ) {
    return 0;
  }

  const taskText = normalizeText(context?.task?.title || "");
  const stepText = normalizeText(getStepText(context?.current_step));
  const utteranceText = normalizeText(
    context?.resistance_input?.user_utterance || ""
  );
  let score = template.priority || 1;
  let matchedSignals = 0;

  const taskMatches = countPatternMatches(taskText, template.task_patterns);
  const stepMatches = countPatternMatches(stepText, template.step_patterns);
  const utteranceMatches = countPatternMatches(
    utteranceText,
    template.utterance_patterns
  );
  const subtypeMatches =
    template.task_subtype && template.task_subtype === context?.task?.subtype
      ? 1
      : 0;

  matchedSignals += taskMatches + stepMatches + utteranceMatches;
  score += taskMatches * 20;
  score += stepMatches * 12;
  score += utteranceMatches * 14;

  if (subtypeMatches) {
    score += 16;
    matchedSignals += 1;
  }

  // Step text may already be a bad fallback. Do not let a step-only match
  // pull the task into an unrelated expert template.
  if (stepMatches > 0 && taskMatches === 0 && utteranceMatches === 0 && !subtypeMatches) {
    return 0;
  }

  return matchedSignals > 0 ? score : 0;
}

function countPatternMatches(text, patterns = []) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return 0;
  }

  return patterns.filter((pattern) =>
    text.includes(String(pattern).toLowerCase())
  ).length;
}

function buildStepFromTemplate(template, context) {
  const taskTitle = context?.task?.title || "";
  const taskType = context?.task?.type || getTaskType(taskTitle);
  const step = {
    ...template.step,
    step_text: renderTemplateText(template.step?.step_text || "", context),
    completion_criteria: renderTemplateText(
      template.step?.completion_criteria || "",
      context
    ),
    template_id: template.id
  };

  return makeFallbackStep(step, taskTitle, taskType);
}

function renderTemplateText(value, context) {
  const currentStep = getStepText(context?.current_step) || "原来的那一步";
  const taskTitle = context?.task?.title || "这件事";
  const personRole = inferPersonRole(`${taskTitle} ${currentStep}`);

  return String(value || "")
    .replaceAll("{taskTitle}", taskTitle)
    .replaceAll("{currentStep}", currentStep)
    .replaceAll("{personRole}", personRole);
}

function inferPersonRole(text) {
  const normalized = normalizeText(text);

  if (hasAnyKeyword(normalized, ["老师", "导师"])) {
    return "老师";
  }

  if (hasAnyKeyword(normalized, ["领导", "老板"])) {
    return "领导";
  }

  if (hasAnyKeyword(normalized, ["客户"])) {
    return "客户";
  }

  if (hasAnyKeyword(normalized, ["朋友"])) {
    return "朋友";
  }

  return "对方";
}

function generatePauseAndResumeStep(context, taskTitle, taskType) {
  return makeFallbackStep(
    {
      step_text: "先暂停当前任务，不推进执行；只在心里记住：下次回来从原来的那一步开始。",
      action_type: "decide",
      completion_criteria: "只要允许自己暂停 1 分钟即可，不需要移动或看屏幕。",
      stage: "start",
      risk_flags: ["physical_low_energy"]
    },
    taskTitle,
    taskType
  );
}

function generateValueCheckStep(context, taskTitle, taskType) {
  const text = normalizeText(
    `${taskTitle} ${getStepText(context?.current_step)} ${
      context?.resistance_input?.user_utterance || ""
    }`
  );
  const stepText = hasAnyKeyword(text, ["没希望", "没天赋", "错一堆"])
    ? "先写下：这件事还可能有一点希望的 1 个证据，以及暂停也可以接受的 1 个理由。"
    : "先写下：继续这件事还值得的 1 个理由，以及暂停也可以接受的 1 个理由。";

  return makeFallbackStep(
    {
      step_text: stepText,
      action_type: "write",
      completion_criteria: "各写 1 句即可，不需要现在推进原任务。",
      stage: "clarify",
      risk_flags: ["value_uncertainty"]
    },
    taskTitle,
    taskType
  );
}

function generateSafeDraftStep(context, taskTitle, taskType) {
  const sourceText = normalizeText(
    `${taskTitle} ${getStepText(context?.current_step)}`
  );
  const draftLine = getSafeDraftLine(sourceText);

  return makeFallbackStep(
    {
      step_text: `先在备忘录里写一句只给自己看的安全草稿：${draftLine}`,
      action_type: "write",
      completion_criteria: "只要写出这一句草稿即可，不需要给任何人看。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    },
    taskTitle,
    taskType
  );
}

function generateLowQualityDraftStep(context, taskTitle, taskType) {
  const sourceText = normalizeText(
    `${taskTitle} ${getStepText(context?.current_step)} ${
      context?.resistance_input?.user_utterance || ""
    }`
  );
  let stepText = "先做一个故意粗糙的临时版本，只留下 1 句意思，不追求好。";

  if (context?.derived_context?.has_physical_demand) {
    stepText = "先把今天的目标改成 60 分版本：只确认一个最低门槛动作，不要求完成训练。";
  } else if (hasAnyKeyword(sourceText, ["ppt", "幻灯片", "汇报", "结构"])) {
    stepText = "先做一个很粗糙的 PPT 占位版本，只写 3 个临时小标题，不美化。";
  } else if (hasAnyKeyword(sourceText, ["简历", "作品集", "项目经历"])) {
    stepText = "先写一版很粗糙的项目经历草稿，只写你做了什么，不写得漂亮。";
  } else if (hasAnyKeyword(sourceText, ["论文", "讨论", "报告", "文章"])) {
    stepText = "先写一版很粗糙的讨论草稿，只写 1 个可能的解释，不判断对错。";
  }

  return makeFallbackStep(
    {
      step_text: stepText,
      action_type: "write",
      completion_criteria: "只要留下临时草稿即可，不做质量处理，也不给别人看。",
      stage: context?.current_step?.stage || "execute",
      risk_flags: ["perfectionism"]
    },
    taskTitle,
    taskType
  );
}

function generateClarifyStandardStep(context, taskTitle, taskType) {
  const sourceText = normalizeText(
    `${taskTitle} ${getStepText(context?.current_step)} ${
      context?.resistance_input?.user_utterance || ""
    }`
  );
  let stepText = "先把当前卡点补成一句话：我现在不知道___。";

  if (context?.derived_context?.has_physical_demand) {
    stepText = "先只确认这一步最小的身体入口：要碰到哪一个物品，或走到哪一个位置。";
  } else if (context?.derived_context?.is_contact_related) {
    stepText = "先不打开聊天框，只写下对方现在最需要知道的 1 个信息点。";
  } else if (hasAnyKeyword(sourceText, ["数据", "论文讨论", "讨论"])) {
    stepText = "先写下：这组数据最可能回答的一个小问题是什么。";
  } else if (hasAnyKeyword(sourceText, ["岗位", "实习", "投什么", "找实习"])) {
    stepText = "先写下：这个岗位最重要的一个筛选条件是什么。";
  } else if (hasAnyKeyword(sourceText, ["项目", "作品集"])) {
    stepText = "先写下：别人看这个项目时最想确认哪一种能力。";
  } else if (hasAnyKeyword(sourceText, ["计划", "安排", "规划"])) {
    stepText = "先写下：这份计划今天只需要决定哪一个最小顺序。";
  } else if (hasAnyKeyword(sourceText, ["复盘", "总结"])) {
    stepText = "先写下：这次复盘最需要解释的一个变化是什么。";
  } else if (hasAnyKeyword(sourceText, ["分析", "竞品", "比较"])) {
    stepText = "先写下：这次比较只看哪一个标准。";
  } else if (taskType === TASK_TYPES.LEARNING_INPUT) {
    stepText = "先写下：这一小段内容最想让你分清的一个概念是什么。";
  } else if (taskType === TASK_TYPES.WRITING_OUTPUT) {
    stepText = "先写下你卡住的是哪一种：内容、顺序，还是标准。";
  }

  return makeFallbackStep(
    {
      step_text: stepText,
      action_type: "write",
      completion_criteria: "只要写出这个判断入口即可，不继续做内容。",
      stage: "clarify",
      risk_flags: ["unclear_output"]
    },
    taskTitle,
    taskType
  );
}

function generateShrinkActionStep(context, taskTitle, taskType) {
  const currentStep = context?.current_step || createEmptyStep();
  const stage = currentStep.stage || "start";

  if (context?.derived_context?.is_atomic_step) {
    return generateClarifyStandardStep(context, taskTitle, taskType);
  }

  if (currentStep.action_type === "write") {
    return makeFallbackStep(
      {
        step_text: "先只写当前步骤里的第一句话，哪怕只是临时句子。",
        action_type: "write",
        completion_criteria: "写出第一句即可，不继续展开。",
        stage,
        risk_flags: ["too_large"]
      },
      taskTitle,
      taskType
    );
  }

  if (currentStep.action_type === "review") {
    return makeFallbackStep(
      {
        step_text: "先只看当前材料的第一个小标题，并记下 1 个关键词。",
        action_type: "review",
        completion_criteria: "记下 1 个关键词即可，不继续阅读。",
        stage,
        risk_flags: ["too_large", "unclear_output"]
      },
      taskTitle,
      taskType
    );
  }

  if (currentStep.action_type === "prepare") {
    return makeFallbackStep(
      {
        step_text: "先只把当前步骤需要的第 1 个材料放到手边。",
        action_type: "prepare",
        completion_criteria: "材料到手边即可，不继续处理。",
        stage,
        risk_flags: ["too_large"]
      },
      taskTitle,
      taskType
    );
  }

  return makeFallbackStep(
    {
      step_text: "先只定位当前步骤的第一个入口，不做后续操作。",
      action_type: "open",
      completion_criteria: "找到第一个入口即可，不继续处理。",
      stage,
      risk_flags: ["too_large"]
    },
    taskTitle,
    taskType
  );
}

function getSafeDraftLine(sourceText) {
  if (hasAnyKeyword(sourceText, ["道歉", "抱歉", "对不起"])) {
    return "我想先承认这件事给你带来的影响。";
  }

  if (hasAnyKeyword(sourceText, ["请假", "无法按时", "来不了"])) {
    return "我想说明一下今天无法按时处理的原因。";
  }

  if (hasAnyKeyword(sourceText, ["拒绝", "没法答应", "不答应"])) {
    return "这件事我可能没法答应，但我想认真回复你。";
  }

  if (hasAnyKeyword(sourceText, ["催款", "催材料", "催", "进度"])) {
    return "我想确认一下这件事现在方便推进到哪一步。";
  }

  if (hasAnyKeyword(sourceText, ["老师", "领导", "汇报", "同步"])) {
    return "我想和您同步一下目前进度。";
  }

  return "我想先把这件事说清楚，再决定要不要给出去。";
}

export function validateFallbackStep(
  context,
  diagnosis,
  recoveryDecision,
  fallbackStep
) {
  const issues = [];
  const blockingIssues = [];
  const stepText = getStepText(fallbackStep);
  const currentText = getStepText(context?.current_step);
  const recoveryMode = recoveryDecision?.recovery_mode || "shrink_action";
  const outputText = normalizeText(
    `${stepText} ${fallbackStep?.completion_criteria || ""}`
  );

  if (!stepText) {
    addValidationIssue(blockingIssues, issues, {
      code: "empty_fallback_step",
      severity: "error",
      message: "fallback_step 不能为空。"
    });
  }

  if (stepText && normalizeText(stepText) === normalizeText(currentText)) {
    addValidationIssue(blockingIssues, issues, {
      code: "same_as_current_step",
      severity: "error",
      message: "fallback_step 不应完全等于原 currentStep。"
    });
  }

  addModeValidationIssues({
    context,
    diagnosis,
    recoveryDecision,
    fallbackStep,
    recoveryMode,
    outputText,
    blockingIssues,
    issues
  });

  if (diagnosis?.root_cause === "physical_low_energy" && blockingIssues.length === 0) {
    issues.push({
      code: "physical_low_energy_risk_recorded",
      severity: "warning",
      message: "physical_low_energy 已走 pause_and_resume，风险已记录。"
    });
  }

  const severity = getValidationSeverity(issues);

  return {
    passed: blockingIssues.length === 0,
    issues,
    severity
  };
}

function addModeValidationIssues({
  context,
  diagnosis,
  recoveryDecision,
  fallbackStep,
  recoveryMode,
  outputText,
  blockingIssues,
  issues
}) {
  if (
    recoveryDecision?.blocked_actions?.includes("send_message") &&
    containsUnsafeAction(outputText, ["发送", "发消息", "打开微信", "打开聊天框"])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "blocked_send_message",
      severity: "error",
      message: "blocked_actions 包含 send_message 时，输出不能引导发送或打开聊天入口。"
    });
  }

  if (
    recoveryMode === "pause_and_resume" &&
    containsUnsafeAction(outputText, [
      "站起来",
      "出门",
      "运动",
      "健身",
      "继续学习",
      "继续写",
      "继续看屏幕",
      "跑步",
      "训练"
    ])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "pause_mode_physical_or_execution_push",
      severity: "error",
      message: "pause_and_resume 时不能要求站起来、出门、运动或继续学习/写作。"
    });
  }

  if (
    recoveryMode === "value_check" &&
    containsUnsafeAction(outputText, [
      "刷题",
      "投递",
      "联系",
      "发送",
      "完成今天",
      "继续做",
      "继续投",
      "继续联系"
    ])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "value_check_continues_execution",
      severity: "error",
      message: "value_check 时不能继续推进刷题、投递、联系或完成原任务。"
    });
  }

  if (
    diagnosis?.root_cause === "value_uncertainty" &&
    !hasAnyKeyword(outputText, [
      "值",
      "值得",
      "理由",
      "希望",
      "证据",
      "暂停",
      "接受",
      "收益",
      "代价",
      "成本",
      "判断"
    ])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "missing_value_check",
      severity: "error",
      message: "value_uncertainty 时必须先做最小价值判断。"
    });
  }

  if (
    recoveryMode === "safe_draft" &&
    containsUnsafeAction(outputText, [
      "打开微信",
      "打开聊天框",
      "发送",
      "联系对方",
      "直接道歉",
      "直接拒绝",
      "直接催"
    ])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "safe_draft_exposes_user",
      severity: "error",
      message: "safe_draft 时不能打开聊天入口、发送、联系对方或直接执行高压沟通。"
    });
  }

  if (
    recoveryMode === "low_quality_draft" &&
    hasAnyKeyword(outputText, [
      "继续优化",
      "再检查",
      "检查一遍",
      "修改到满意",
      "准备充分",
      "找更好的模板"
    ])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "low_quality_draft_quality_push",
      severity: "error",
      message: "low_quality_draft 时不能继续优化、检查或追求准备充分。"
    });
  }

  if (
    recoveryMode === "clarify_standard" &&
    fallbackStep?.action_type === "open" &&
    hasAnyKeyword(outputText, ["打开", "页面", "文件"])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "clarify_standard_only_opens",
      severity: "error",
      message: "clarify_standard 不能只让用户打开页面或文件。"
    });
  }

  if (
    recoveryMode === "shrink_action" &&
    context?.derived_context?.is_atomic_step
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "shrink_action_on_atomic_step",
      severity: "error",
      message: "当前步骤已经很小，不能继续伪拆小，应改用 clarify_standard 或 safe_draft。"
    });
  }

  if (
    context?.derived_context?.has_physical_demand &&
    hasAnyKeyword(outputText, ["项目经历", "简历", "ppt", "论文", "作品集"])
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "domain_mismatch_for_physical_task",
      severity: "error",
      message: "身体/运动类任务不能输出简历、PPT、论文或作品集类恢复入口。"
    });
  }
}

function getValidationSeverity(issues) {
  if (issues.some((issue) => issue.severity === "error")) {
    return "error";
  }

  if (issues.some((issue) => issue.severity === "warning")) {
    return "warning";
  }

  return "ok";
}

function containsUnsafeAction(text, keywords) {
  const normalized = stripSafeNegatedActions(normalizeText(text));
  return hasAnyKeyword(normalized, keywords);
}

function stripSafeNegatedActions(text) {
  const safePhrases = [
    "先不要打开聊天框",
    "不要打开聊天框",
    "不打开聊天框",
    "先不要打开微信",
    "不要打开微信",
    "不打开微信",
    "先不要发送",
    "不要发送",
    "不用发送",
    "不需要发送",
    "不发送",
    "不用发",
    "不用发给",
    "先不要发消息",
    "不要发消息",
    "不用发消息",
    "不发消息",
    "先不要联系",
    "不要联系",
    "不需要联系",
    "不联系",
    "不站起来",
    "不要站起来",
    "不出门",
    "不要出门",
    "不运动",
    "不要运动",
    "不继续学习",
    "不要继续学习",
    "不继续写",
    "不要继续写",
    "不继续看屏幕",
    "不刷题",
    "不投递",
    "不继续执行",
    "不继续任务",
    "不发布",
    "不发送"
  ];

  return safePhrases.reduce(
    (currentText, phrase) => currentText.replaceAll(phrase, ""),
    text
  );
}

export function resolveResistance(input = {}) {
  const context = buildResistanceContext(input);
  const aiDiagnosisContext =
    input.aiDiagnosisContext || buildAiDiagnosisContext(context);
  const aiDiagnosis = normalizeAiDiagnosis(input.aiDiagnosis);
  const aiRecoveryPlan = normalizeAiRecoveryPlan(input.aiRecoveryPlan);
  const aiFallbackStep = normalizeAiFallbackStep(input.aiFallbackStep, {
    taskTitle: context?.task?.title || "",
    taskType: context?.task?.type || TASK_TYPES.GENERAL
  });
  const fallbackStepGeneration =
    input.fallbackStepGeneration &&
    typeof input.fallbackStepGeneration === "object"
      ? input.fallbackStepGeneration
      : null;
  const diagnosis = diagnoseResistance(context);
  let recoveryDecision = decideRecoveryMode(context, diagnosis);
  let fallbackStep = aiFallbackStep;
  let validation = fallbackStep
    ? validateAiFallbackStepAgainstPlan(
        context,
        diagnosis,
        recoveryDecision,
        fallbackStep,
        aiRecoveryPlan
      )
    : {
        passed: false,
        severity: "error",
        issues: [
          {
            code: "missing_ai_fallback_step",
            severity: "error",
            message: "AI fallback_step is missing."
          }
        ]
      };
  let finalSource = validation.passed ? "ai_generated" : "template_fallback";

  if (!validation.passed) {
    fallbackStep = generateFallbackStep(context, diagnosis, recoveryDecision);
    validation = validateFallbackStep(
      context,
      diagnosis,
      recoveryDecision,
      fallbackStep
    );
    finalSource = fallbackStepGeneration ? "template_fallback" : "legacy_fallback";
  }

  if (!validation.passed) {
    const repaired = repairFailedFallbackStep({
      context,
      diagnosis,
      failedDecision: recoveryDecision,
      failedValidation: validation
    });
    recoveryDecision = repaired.recoveryDecision;
    fallbackStep = repaired.fallbackStep;
    validation = repaired.validation;
    finalSource = fallbackStepGeneration ? "template_fallback" : "legacy_fallback";
  }

  return {
    context,
    diagnosis,
    ai_diagnosis: aiDiagnosis,
    ai_recovery_plan: aiRecoveryPlan,
    ai_recovery_plan_error:
      typeof input.aiRecoveryPlanError === "string"
        ? input.aiRecoveryPlanError
        : "",
    ai_fallback_step: aiFallbackStep,
    debugResistanceTrace: {
      context: aiDiagnosisContext,
      diagnosis: aiDiagnosis,
      recoveryPlan: aiRecoveryPlan,
      fallbackStepGeneration: {
        raw_output: fallbackStepGeneration?.raw_output || "",
        parsed_fallback_step:
          fallbackStepGeneration?.parsed_fallback_step || aiFallbackStep,
        validation_result:
          fallbackStepGeneration?.validation_result || validation,
        retry_count: Number.isInteger(fallbackStepGeneration?.retry_count)
          ? fallbackStepGeneration.retry_count
          : 0,
        final_source: finalSource
      }
    },
    recovery_decision: recoveryDecision,
    fallback_step: fallbackStep,
    validation
  };
}

function repairFailedFallbackStep({
  context,
  diagnosis,
  failedDecision,
  failedValidation
}) {
  const recoveryMode = chooseRepairRecoveryMode(context, diagnosis);
  const recoveryDecision = {
    ...failedDecision,
    recovery_mode: recoveryMode,
    fallback_policy: FALLBACK_POLICIES[recoveryMode],
    should_replace_current_step: true,
    should_pause: recoveryMode === "pause_and_resume",
    blocked_actions: getBlockedActions(
      context,
      normalizeRootCause(diagnosis?.root_cause),
      recoveryMode
    )
  };
  const fallbackStep = generateGenericFallbackStep(
    context,
    diagnosis,
    recoveryDecision
  );
  const validation = validateFallbackStep(
    context,
    diagnosis,
    recoveryDecision,
    fallbackStep
  );
  const repairIssue = {
    code: "repaired_after_validation_failure",
    severity: validation.passed ? "warning" : "error",
    message: "原始 fallback_step 未通过 validator，已改用更安全的 recovery_mode。",
    previous_issues: failedValidation.issues || []
  };

  return {
    recoveryDecision,
    fallbackStep,
    validation: {
      ...validation,
      passed: validation.passed,
      severity: validation.passed ? "warning" : validation.severity,
      issues: [repairIssue, ...validation.issues]
    }
  };
}

function chooseRepairRecoveryMode(context, diagnosis) {
  const rootCause = normalizeRootCause(diagnosis?.root_cause);
  const derived = context?.derived_context || {};

  if (rootCause === "physical_low_energy" || derived.has_low_state_language) {
    return "pause_and_resume";
  }

  if (rootCause === "value_uncertainty" || derived.has_value_language) {
    return "value_check";
  }

  if (
    rootCause === "emotional_pressure" ||
    rootCause === "social_pressure" ||
    derived.has_public_exposure
  ) {
    return "safe_draft";
  }

  if (rootCause === "perfectionism" || derived.has_perfectionism_language) {
    return "low_quality_draft";
  }

  return "clarify_standard";
}

export function normalizeResistanceDiagnosis(diagnosis) {
  if (!diagnosis || typeof diagnosis !== "object") {
    return null;
  }

  const fallbackStep = normalizeCurrentStep(diagnosis.fallback_step || "");

  if (!fallbackStep) {
    return null;
  }

  return {
    surface_resistance: [
      "too_hard",
      "dont_want",
      "not_sure",
      "bad_state"
    ].includes(diagnosis.surface_resistance)
      ? diagnosis.surface_resistance
      : "dont_want",
    root_cause: ROOT_CAUSES.includes(diagnosis.root_cause)
      ? diagnosis.root_cause
      : "too_large",
    confidence:
      typeof diagnosis.confidence === "number"
        ? diagnosis.confidence
        : undefined,
    evidence: Array.isArray(diagnosis.evidence) ? diagnosis.evidence : [],
    risks_to_avoid: Array.isArray(diagnosis.risks_to_avoid)
      ? diagnosis.risks_to_avoid
      : [],
    recovery_strategy:
      diagnosis.recovery_strategy ||
      diagnosis.fallback_policy ||
      "fallback_step",
    recovery_mode: RECOVERY_MODES.includes(diagnosis.recovery_mode)
      ? diagnosis.recovery_mode
      : undefined,
    fallback_step: fallbackStep
  };
}

export function normalizeResistanceResolution(resolution) {
  if (!resolution || typeof resolution !== "object") {
    return null;
  }

  const fallbackStep = normalizeCurrentStep(resolution.fallback_step || "");

  if (!fallbackStep) {
    return null;
  }

  return {
    context:
      resolution.context && typeof resolution.context === "object"
        ? resolution.context
        : null,
    diagnosis:
      resolution.diagnosis && typeof resolution.diagnosis === "object"
        ? resolution.diagnosis
        : null,
    ai_diagnosis: normalizeAiDiagnosis(resolution.ai_diagnosis),
    ai_recovery_plan: normalizeAiRecoveryPlan(resolution.ai_recovery_plan),
    ai_recovery_plan_error:
      typeof resolution.ai_recovery_plan_error === "string"
        ? resolution.ai_recovery_plan_error
        : "",
    ai_fallback_step: normalizeAiFallbackStep(resolution.ai_fallback_step),
    debugResistanceTrace:
      resolution.debugResistanceTrace &&
      typeof resolution.debugResistanceTrace === "object"
        ? {
            context:
              resolution.debugResistanceTrace.context &&
              typeof resolution.debugResistanceTrace.context === "object"
                ? resolution.debugResistanceTrace.context
                : null,
            diagnosis: normalizeAiDiagnosis(
              resolution.debugResistanceTrace.diagnosis
            ),
            recoveryPlan: normalizeAiRecoveryPlan(
              resolution.debugResistanceTrace.recoveryPlan
            ),
            fallbackStepGeneration:
              resolution.debugResistanceTrace.fallbackStepGeneration &&
              typeof resolution.debugResistanceTrace.fallbackStepGeneration ===
                "object"
                ? {
                    raw_output:
                      resolution.debugResistanceTrace.fallbackStepGeneration
                        .raw_output || "",
                    parsed_fallback_step: normalizeAiFallbackStep(
                      resolution.debugResistanceTrace.fallbackStepGeneration
                        .parsed_fallback_step
                    ),
                    validation_result:
                      resolution.debugResistanceTrace.fallbackStepGeneration
                        .validation_result || null,
                    retry_count: Number.isInteger(
                      resolution.debugResistanceTrace.fallbackStepGeneration
                        .retry_count
                    )
                      ? resolution.debugResistanceTrace.fallbackStepGeneration
                          .retry_count
                      : 0,
                    final_source:
                      resolution.debugResistanceTrace.fallbackStepGeneration
                        .final_source || "legacy_fallback"
                  }
                : null
          }
        : null,
    recovery_decision:
      resolution.recovery_decision &&
      typeof resolution.recovery_decision === "object"
        ? resolution.recovery_decision
        : null,
    fallback_step: fallbackStep,
    validation:
      resolution.validation && typeof resolution.validation === "object"
        ? {
            passed: Boolean(resolution.validation.passed),
            severity: resolution.validation.severity || "ok",
            issues: Array.isArray(resolution.validation.issues)
              ? resolution.validation.issues
              : []
          }
        : {
            passed: true,
            severity: "ok",
            issues: []
          }
  };
}

export function normalizeAiDiagnosis(diagnosis) {
  if (!diagnosis || typeof diagnosis !== "object") {
    return null;
  }

  const primaryRootCause = ROOT_CAUSES.includes(diagnosis.primary_root_cause)
    ? diagnosis.primary_root_cause
    : null;
  const secondaryRootCause =
    diagnosis.secondary_root_cause &&
    ROOT_CAUSES.includes(diagnosis.secondary_root_cause) &&
    diagnosis.secondary_root_cause !== primaryRootCause
      ? diagnosis.secondary_root_cause
      : null;
  const evidence = Array.isArray(diagnosis.evidence)
    ? diagnosis.evidence.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const excludedCauses = Array.isArray(diagnosis.excluded_causes)
    ? diagnosis.excluded_causes
        .map((item) => ({
          cause: String(item?.cause || "").trim(),
          reason: String(item?.reason || "").trim()
        }))
        .filter((item) => item.cause && item.reason)
    : [];
  const avoid = Array.isArray(diagnosis.avoid)
    ? diagnosis.avoid.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  if (!primaryRootCause) {
    return null;
  }

  return {
    surface_resistance: [
      "too_hard",
      "dont_want",
      "not_sure",
      "bad_state"
    ].includes(diagnosis.surface_resistance)
      ? diagnosis.surface_resistance
      : "dont_want",
    primary_root_cause: primaryRootCause,
    secondary_root_cause: secondaryRootCause,
    user_state_summary: String(diagnosis.user_state_summary || "").trim(),
    evidence: evidence.slice(0, 4),
    excluded_causes: excludedCauses.slice(0, 4),
    confidence: ["low", "medium", "high"].includes(diagnosis.confidence)
      ? diagnosis.confidence
      : "low",
    recovery_direction: String(diagnosis.recovery_direction || "").trim(),
    avoid: avoid.slice(0, 6)
  };
}

export function normalizeAiRecoveryPlan(recoveryPlan) {
  if (!recoveryPlan || typeof recoveryPlan !== "object") {
    return null;
  }

  const basedOn =
    recoveryPlan.based_on && typeof recoveryPlan.based_on === "object"
      ? recoveryPlan.based_on
      : {};
  const fallbackRequirements =
    recoveryPlan.fallback_step_requirements &&
    typeof recoveryPlan.fallback_step_requirements === "object"
      ? recoveryPlan.fallback_step_requirements
      : {};
  const actionShift =
    recoveryPlan.action_shift && typeof recoveryPlan.action_shift === "object"
      ? recoveryPlan.action_shift
      : {};
  const actionType = ACTION_TYPES.includes(fallbackRequirements.action_type)
    ? fallbackRequirements.action_type
    : "prepare";
  const estimatedEffort = ["low", "medium"].includes(
    fallbackRequirements.estimated_effort
  )
    ? fallbackRequirements.estimated_effort
    : "low";
  const keyEvidence = Array.isArray(basedOn.key_evidence)
    ? basedOn.key_evidence
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const pressureReduced = Array.isArray(recoveryPlan.pressure_reduced)
    ? recoveryPlan.pressure_reduced
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];
  const avoid = Array.isArray(recoveryPlan.avoid)
    ? recoveryPlan.avoid
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

  return {
    based_on: {
      primary_root_cause: ROOT_CAUSES.includes(basedOn.primary_root_cause)
        ? basedOn.primary_root_cause
        : "",
      secondary_root_cause:
        basedOn.secondary_root_cause &&
        ROOT_CAUSES.includes(basedOn.secondary_root_cause)
          ? basedOn.secondary_root_cause
          : null,
      recovery_direction: String(basedOn.recovery_direction || "").trim(),
      key_evidence: keyEvidence
    },
    strategy_name: String(recoveryPlan.strategy_name || "").trim(),
    strategy_goal: String(recoveryPlan.strategy_goal || "").trim(),
    recovery_principle: String(recoveryPlan.recovery_principle || "").trim(),
    action_shift: {
      from: String(actionShift.from || "").trim(),
      to: String(actionShift.to || "").trim()
    },
    pressure_reduced: pressureReduced,
    target_user_state: String(recoveryPlan.target_user_state || "").trim(),
    avoid,
    fallback_step_requirements: {
      action_type: actionType,
      estimated_effort: estimatedEffort,
      completion_boundary_required: true,
      must_preserve_goal: true,
      should_remove_pressure_source: Boolean(
        fallbackRequirements.should_remove_pressure_source
      ),
      should_avoid_original_blocker:
        fallbackRequirements.should_avoid_original_blocker !== false
    },
    diagnosis_warning:
      recoveryPlan.diagnosis_warning === null ||
      recoveryPlan.diagnosis_warning === undefined
        ? null
        : String(recoveryPlan.diagnosis_warning || "").trim() || null
  };
}

export function normalizeAiFallbackStep(fallbackStep, options = {}) {
  if (!fallbackStep || typeof fallbackStep !== "object") {
    return null;
  }

  const normalizedStep = normalizeCurrentStep(fallbackStep, options);

  if (!normalizedStep) {
    return null;
  }

  const explicitRiskFlags = Array.isArray(fallbackStep.risk_flags)
    ? fallbackStep.risk_flags
        .filter((risk) => ROOT_CAUSES.includes(risk))
        .slice(0, 5)
    : null;

  return {
    ...normalizedStep,
    risk_flags: explicitRiskFlags || normalizedStep.risk_flags,
    user_visible_reason: String(fallbackStep.user_visible_reason || "").trim()
  };
}

export function evaluateAiFallbackStep(
  input = {},
  fallbackStep = null,
  recoveryPlan = null
) {
  const context = buildResistanceContext(input);
  const diagnosis = diagnoseResistance(context);
  const recoveryDecision = decideRecoveryMode(context, diagnosis);
  const normalizedFallbackStep = normalizeAiFallbackStep(fallbackStep, {
    taskTitle: context?.task?.title || "",
    taskType: context?.task?.type || TASK_TYPES.GENERAL
  });
  const validation = normalizedFallbackStep
    ? validateAiFallbackStepAgainstPlan(
        context,
        diagnosis,
        recoveryDecision,
        normalizedFallbackStep,
        normalizeAiRecoveryPlan(recoveryPlan)
      )
    : {
        passed: false,
        severity: "error",
        issues: [
          {
            code: "invalid_ai_fallback_step",
            severity: "error",
            message: "AI fallback_step is missing or invalid."
          }
        ]
      };

  return {
    context,
    diagnosis,
    recovery_decision: recoveryDecision,
    fallback_step: normalizedFallbackStep,
    validation
  };
}

function validateAiFallbackStepAgainstPlan(
  context,
  diagnosis,
  recoveryDecision,
  fallbackStep,
  recoveryPlan
) {
  const baseValidation = validateFallbackStep(
    context,
    diagnosis,
    recoveryDecision,
    fallbackStep
  );
  const issues = [...baseValidation.issues];
  const blockingIssues = issues.filter((issue) => issue.severity === "error");
  const outputText = `${getStepText(fallbackStep)} ${
    fallbackStep?.completion_criteria || ""
  }`;
  const normalizedOutput = normalizeText(outputText);

  if (
    recoveryPlan?.action_shift?.from &&
    normalizeText(recoveryPlan.action_shift.from) &&
    normalizedOutput === normalizeText(recoveryPlan.action_shift.from)
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "ai_fallback_returns_to_original_action",
      severity: "error",
      message: "AI fallback_step returned to recoveryPlan.action_shift.from."
    });
  }

  if (
    recoveryPlan?.fallback_step_requirements?.should_remove_pressure_source &&
    violatesPressureRemoval(outputText)
  ) {
    addValidationIssue(blockingIssues, issues, {
      code: "ai_fallback_violates_pressure_removal",
      severity: "error",
      message: "AI fallback_step violates pressure-source removal."
    });
  }

  if (violatesRecoveryAvoid(outputText, recoveryPlan?.avoid || [])) {
    addValidationIssue(blockingIssues, issues, {
      code: "ai_fallback_violates_recovery_avoid",
      severity: "error",
      message: "AI fallback_step violates recoveryPlan.avoid."
    });
  }

  if (isVagueFallbackStep(outputText)) {
    addValidationIssue(blockingIssues, issues, {
      code: "ai_fallback_too_vague",
      severity: "error",
      message: "AI fallback_step is too vague to execute."
    });
  }

  return {
    passed: blockingIssues.length === 0,
    issues,
    severity: getValidationSeverity(issues)
  };
}

function violatesPressureRemoval(text) {
  return containsUnsafeAction(text, [
    "打开微信",
    "打开聊天",
    "打开聊天框",
    "发送",
    "发出",
    "发消息",
    "联系对方",
    "立刻联系",
    "open wechat",
    "open chat",
    "send",
    "contact"
  ]);
}

function violatesRecoveryAvoid(text, avoid = []) {
  const output = normalizeText(text);
  const avoidText = normalizeText(avoid.join(" "));

  if (!output || !avoidText) {
    return false;
  }

  if (
    hasAnyKeyword(avoidText, ["发送", "发消息", "send"]) &&
    containsUnsafeAction(output, ["发送", "发消息", "发出", "send"])
  ) {
    return true;
  }

  if (
    hasAnyKeyword(avoidText, ["打开微信", "打开聊天", "open chat"]) &&
    containsUnsafeAction(output, ["打开微信", "打开聊天", "open chat"])
  ) {
    return true;
  }

  if (
    hasAnyKeyword(avoidText, ["继续做", "继续投递", "继续看", "continue"]) &&
    containsUnsafeAction(output, ["继续做", "继续投递", "继续看", "continue"])
  ) {
    return true;
  }

  if (
    hasAnyKeyword(avoidText, ["优化", "完善", "润色"]) &&
    hasAnyKeyword(output, ["优化", "完善", "润色"])
  ) {
    return true;
  }

  return false;
}

function isVagueFallbackStep(text) {
  return hasAnyKeyword(text, [
    "调整心态",
    "慢慢来",
    "整理一下",
    "优化一下",
    "准备充分",
    "想清楚",
    "try to",
    "maybe",
    "you can try"
  ]);
}

export function getLegacyResistanceType(surfaceResistance) {
  const typeMap = {
    too_hard: "tooHard",
    dont_want: "dontWant",
    not_sure: "unsure",
    bad_state: "notReady"
  };

  return typeMap[surfaceResistance] || "dontWant";
}

export function getDiagnosisFeedback(diagnosis) {
  const feedbackMap = {
    unclear_output: "已先补一个明确产出边界，再继续。",
    too_large: "已把入口压到更小的第一动作。",
    emotional_pressure: "已先避开发送和后果压力，改成安全草稿。",
    social_pressure: "已先改成不发送的低风险开场白。",
    perfectionism: "已改成低质量草稿入口，不要求写好。",
    physical_low_energy: "已改成低身体成本的 30 秒入口。",
    value_uncertainty: "已暂停强推执行，先做最小价值确认。"
  };

  return feedbackMap[diagnosis?.root_cause] || "已生成更容易继续的 fallback step。";
}

function createEmptyStep() {
  return {
    step_text: "",
    action_type: "open",
    completion_criteria: "",
    estimated_effort: "low",
    stage: "start",
    risk_flags: []
  };
}

function identifySurfaceResistance(userUtterance, selectedType) {
  const text = normalizeText(userUtterance);
  const selectedMap = {
    tooHard: "too_hard",
    dontWant: "dont_want",
    unsure: "not_sure",
    notReady: "bad_state"
  };

  if (text) {
    if (hasAnyKeyword(text, VALUE_LANGUAGE_KEYWORDS)) {
      return "not_sure";
    }

    if (hasAnyKeyword(text, LOW_STATE_KEYWORDS)) {
      return "bad_state";
    }

    if (hasAnyKeyword(text, UNCLEAR_STANDARD_KEYWORDS)) {
      return "too_hard";
    }

    if (
      hasAnyKeyword(text, [
        ...EMOTIONAL_PRESSURE_KEYWORDS,
        "不想",
        "不愿意",
        "拖着",
        "烦"
      ])
    ) {
      return "dont_want";
    }
  }

  return selectedMap[selectedType] || "dont_want";
}

function getSelectedResistanceUtterance(selectedType) {
  const utteranceMap = {
    tooHard: "用户选择：太难了 / 不会做 / 做不动",
    dontWant: "用户选择：不想做 / 抗拒 / 拖延",
    unsure: "用户选择：不确定是否继续 / 怀疑价值",
    notReady: "用户选择：当前状态不适合 / 累 / 困 / 身体状态差"
  };

  return utteranceMap[selectedType] || "";
}

function getDefaultRootCause(surfaceResistance) {
  if (surfaceResistance === "bad_state") {
    return "physical_low_energy";
  }

  if (surfaceResistance === "not_sure") {
    return "value_uncertainty";
  }

  if (surfaceResistance === "too_hard") {
    return "unclear_output";
  }

  return "too_large";
}

function getDiagnosisConfidence({ utteranceRoot, riskRoot, surfaceResistance }) {
  if (utteranceRoot) {
    return 0.82;
  }

  if (riskRoot) {
    return 0.68;
  }

  if (surfaceResistance) {
    return 0.55;
  }

  return 0.42;
}

function getRootCauseFromDerivedContext(context) {
  const derived = context?.derived_context || {};
  const fullText = normalizeText(
    `${context?.task?.title || ""} ${getStepText(context?.current_step)} ${
      context?.resistance_input?.user_utterance || ""
    }`
  );

  if (derived.has_low_state_language) {
    return "physical_low_energy";
  }

  if (derived.has_value_language) {
    return "value_uncertainty";
  }

  if (
    derived.has_public_exposure &&
    hasAnyKeyword(
      context?.resistance_input?.user_utterance || "",
      EMOTIONAL_PRESSURE_KEYWORDS
    )
  ) {
    return "emotional_pressure";
  }

  if (
    derived.has_unclear_standard_language &&
    hasAnyKeyword(fullText, ["哪个项目", "项目选择", "拿得出手", "作品集"])
  ) {
    return "unclear_output";
  }

  if (derived.has_perfectionism_language) {
    return "perfectionism";
  }

  if (derived.has_unclear_standard_language) {
    return "unclear_output";
  }

  return "";
}

function chooseRecoveryMode(context, rootCause) {
  const derived = context?.derived_context || {};

  if (rootCause === "physical_low_energy" || derived.has_low_state_language) {
    return "pause_and_resume";
  }

  if (rootCause === "value_uncertainty" || derived.has_value_language) {
    return "value_check";
  }

  if (
    rootCause === "emotional_pressure" ||
    rootCause === "social_pressure" ||
    (derived.has_public_exposure &&
      hasAnyKeyword(
        context?.resistance_input?.user_utterance || "",
        EMOTIONAL_PRESSURE_KEYWORDS
      ))
  ) {
    return "safe_draft";
  }

  if (rootCause === "perfectionism" || derived.has_perfectionism_language) {
    return "low_quality_draft";
  }

  if (rootCause === "unclear_output" || derived.has_unclear_standard_language) {
    return "clarify_standard";
  }

  if (rootCause === "too_large" && derived.can_shrink_further) {
    return "shrink_action";
  }

  return "clarify_standard";
}

function buildDiagnosisEvidence({ context, utteranceRoot, riskRoot, rootCause }) {
  const evidence = [];

  if (context?.resistance_input?.user_utterance) {
    evidence.push("user_utterance_present");
  }

  if (utteranceRoot) {
    evidence.push(`utterance_matched_${utteranceRoot}`);
  }

  if (riskRoot) {
    evidence.push(`current_step_risk_matched_${riskRoot}`);
  }

  if (context?.resistance_input?.selected_resistance_type) {
    evidence.push(
      `selected_${context.resistance_input.selected_resistance_type}`
    );
  }

  if (context?.derived_context?.is_contact_related) {
    evidence.push("contact_related_context");
  }

  if (context?.derived_context?.is_atomic_step) {
    evidence.push("current_step_already_atomic");
  }

  if (evidence.length === 0) {
    evidence.push(`defaulted_to_${rootCause}`);
  }

  return evidence;
}

function getRisksToAvoid(rootCause, context) {
  const riskMap = {
    unclear_output: ["ambiguous_completion_standard"],
    too_large: ["larger_scope", "multi_step_batch"],
    emotional_pressure: ["send_message", "increase_social_exposure"],
    social_pressure: ["send_message", "increase_social_exposure"],
    perfectionism: ["quality_polish", "large_revision"],
    physical_low_energy: ["force_original_execution", "long_effort"],
    value_uncertainty: ["continue_original_execution", "skip_value_check"]
  };
  const risks = [...(riskMap[rootCause] || [])];

  if (context?.derived_context?.is_contact_related) {
    risks.push("send_message");
  }

  return [...new Set(risks)];
}

function getBlockedActions(context, rootCause, recoveryMode) {
  const blockedActionsByMode = {
    shrink_action: ["expand_scope"],
    clarify_standard: ["skip_completion_standard"],
    safe_draft: ["send_message", "submit_external_action"],
    low_quality_draft: ["polish_quality"],
    pause_and_resume: ["force_original_execution", "long_effort"],
    value_check: ["continue_original_execution"]
  };
  const blockedActions = [...(blockedActionsByMode[recoveryMode] || [])];

  if (
    context?.derived_context?.is_contact_related &&
    ["clarify_standard", "safe_draft"].includes(recoveryMode)
  ) {
    blockedActions.push("send_message");
  }

  if (rootCause === "value_uncertainty") {
    blockedActions.push("continue_original_execution");
  }

  return [...new Set(blockedActions)];
}

function getRootCauseFromUtterance({
  taskTitle,
  taskType,
  currentStep,
  userUtterance
}) {
  const text = normalizeText(userUtterance);

  if (!text) {
    return "";
  }

  if (hasAnyKeyword(text, LOW_STATE_KEYWORDS)) {
    return "physical_low_energy";
  }

  if (hasAnyKeyword(text, VALUE_LANGUAGE_KEYWORDS)) {
    return "value_uncertainty";
  }

  if (hasAnyKeyword(text, PERFECTIONISM_LANGUAGE_KEYWORDS)) {
    return "perfectionism";
  }

  const hasSocialContext = isContactRelated(
    taskTitle,
    taskType,
    currentStep
  );
  const hasSocialWords = hasAnyKeyword(text, [
    "回复",
    "联系",
    "发消息",
    "微信",
    "邮件",
    "老师",
    "hr",
    "HR",
    "领导",
    "客户",
    "对方",
    "朋友",
    "同学",
    "请假",
    "拒绝",
    "道歉",
    "催"
  ]);
  const hasEmotionalWords = hasAnyKeyword(text, EMOTIONAL_PRESSURE_KEYWORDS);

  if ((hasSocialContext || hasSocialWords) && hasEmotionalWords) {
    return "emotional_pressure";
  }

  if (hasSocialWords) {
    return "social_pressure";
  }

  if (hasEmotionalWords) {
    return "emotional_pressure";
  }

  if (hasAnyKeyword(text, UNCLEAR_STANDARD_KEYWORDS)) {
    return "unclear_output";
  }

  if (
    hasAnyKeyword(text, [
      "太大",
      "太多",
      "做不完",
      "一堆",
      "好多",
      "复杂",
      "麻烦",
      "无从下手"
    ])
  ) {
    return "too_large";
  }

  return "";
}

function getRootCauseFromRiskFlags(riskFlags, surfaceResistance) {
  if (!Array.isArray(riskFlags) || riskFlags.length === 0) {
    return "";
  }

  if (surfaceResistance === "not_sure" && riskFlags.includes("value_uncertainty")) {
    return "value_uncertainty";
  }

  if (
    surfaceResistance === "bad_state" &&
    riskFlags.includes("physical_low_energy")
  ) {
    return "physical_low_energy";
  }

  if (surfaceResistance === "dont_want") {
    return (
      findFirstRisk(riskFlags, [
        "emotional_pressure",
        "social_pressure",
        "perfectionism",
        "physical_low_energy",
        "value_uncertainty",
        "unclear_output",
        "too_large"
      ]) || ""
    );
  }

  if (surfaceResistance === "too_hard") {
    return (
      findFirstRisk(riskFlags, [
        "unclear_output",
        "too_large",
        "perfectionism",
        "emotional_pressure",
        "social_pressure"
      ]) || ""
    );
  }

  return findFirstRisk(riskFlags, ROOT_CAUSES) || "";
}

function findFirstRisk(riskFlags, orderedRisks) {
  return orderedRisks.find((risk) => riskFlags.includes(risk));
}

function normalizeRootCause(rootCause) {
  return ROOT_CAUSES.includes(rootCause) ? rootCause : "too_large";
}

function makeFallbackStep(step, taskTitle, taskType) {
  const normalizedStep = normalizeCurrentStep(
    {
      estimated_effort: "low",
      ...step
    },
    {
      taskTitle,
      taskType,
      stage: step.stage
    }
  );

  if (!normalizedStep) {
    return normalizedStep;
  }

  return step.template_id
    ? {
        ...normalizedStep,
        template_id: step.template_id
      }
    : normalizedStep;
}

function addValidationIssue(blockingIssues, issues, issue) {
  issues.push(issue);

  if (issue.severity === "error") {
    blockingIssues.push(issue);
  }
}

function isContactRelated(taskTitle, taskType, currentStep) {
  const textSource = `${taskTitle} ${getStepText(currentStep)}`;
  const text = normalizeText(textSource);
  const taskSubtype = getTaskSubtype(textSource, taskType);

  return (
    taskSubtype === TASK_SUBTYPES.REPLY_MESSAGE ||
    taskSubtype === TASK_SUBTYPES.SEND_EMAIL ||
    currentStep?.action_type === "contact" ||
    hasAnyKeyword(text, [
      "回复",
      "联系",
      "发消息",
      "发出",
      "微信",
      "邮件",
      "老师",
      "hr",
      "HR",
      "领导",
      "客户",
      "对方",
      "请假",
      "拒绝",
      "道歉",
      "催"
    ])
  );
}

function isAtomicCurrentStep(step) {
  const text = getStepText(step);
  const normalized = normalizeText(`${text} ${step.completion_criteria}`);

  if (!text) {
    return false;
  }

  if (
    hasAnyKeyword(normalized, [
      "打开",
      "点一下",
      "点击一个",
      "写一句",
      "写出一句",
      "一句话",
      "拿起",
      "拿上",
      "放下",
      "放到手边",
      "站起来",
      "走到门口",
      "看 30 秒",
      "看30秒",
      "30 秒",
      "选 1 个",
      "选一个",
      "1 个"
    ])
  ) {
    return true;
  }

  if (step.estimated_effort === "low" && text.length <= 28) {
    return true;
  }

  if (
    ["open", "select", "move"].includes(step.action_type) &&
    text.length <= 36
  ) {
    return true;
  }

  return hasAnyKeyword(normalized, [
    "只要",
    "1 个",
    "一件",
    "一句",
    "30 秒"
  ]);
}

function canShrinkCurrentStep(step, isAtomicStep) {
  if (!getStepText(step) || isAtomicStep) {
    return false;
  }

  if (step.estimated_effort === "medium") {
    return true;
  }

  return !["open", "select", "contact"].includes(step.action_type);
}

function normalizeCurrentStep(value, options = {}) {
  const stepText = getStepText(value).trim();

  if (!stepText) {
    return "";
  }

  const rawStep = value && typeof value === "object" ? value : {};
  const taskTitle = options.taskTitle || "";
  const taskType = options.taskType || getTaskType(taskTitle || stepText);
  const actionType =
    normalizeActionType(rawStep.action_type) ||
    inferActionType(stepText, taskType);
  const completionCriteria = String(
    rawStep.completion_criteria ||
      rawStep.completionCriteria ||
      inferCompletionCriteria(stepText, actionType)
  ).trim();
  const estimatedEffort =
    normalizeEstimatedEffort(rawStep.estimated_effort) || "low";
  const stage =
    normalizeStepStage(rawStep.stage || options.stage) ||
    inferStepStage(stepText, taskType);

  return {
    step_text: stepText,
    action_type: actionType,
    completion_criteria:
      completionCriteria || "完成这个具体动作即可，不需要做到完美。",
    estimated_effort: estimatedEffort === "high" ? "medium" : estimatedEffort,
    stage,
    risk_flags: inferRiskFlags({
      taskTitle,
      taskType,
      action_type: actionType,
      step_text: stepText,
      completion_criteria: completionCriteria,
      explicitRisks: rawStep.risk_flags
    }),
    ...(rawStep.template_id ? { template_id: rawStep.template_id } : {})
  };
}

function normalizeActionType(value) {
  return ACTION_TYPES.includes(value) ? value : "";
}

function normalizeEstimatedEffort(value) {
  return ESTIMATED_EFFORTS.includes(value) ? value : "";
}

function normalizeStepStage(value) {
  return STEP_STAGES.includes(value) ? value : "";
}

function inferActionType(stepText, taskType) {
  const text = normalizeText(stepText);

  if (hasAnyKeyword(text, ["写", "写下", "记录", "草稿", "填", "列出", "标出"])) {
    return "write";
  }

  if (
    hasAnyKeyword(text, [
      "回复",
      "联系",
      "发消息",
      "发送",
      "发出",
      "发一句",
      "打电话",
      "消息",
      "微信",
      "邮件",
      "邮箱",
      "老师",
      "问老师",
      "给老师",
      "问hr",
      "问HR",
      "给hr",
      "道歉",
      "请假",
      "拒绝",
      "催"
    ])
  ) {
    return "contact";
  }

  if (hasAnyKeyword(text, ["选择", "选出", "挑出", "选一个", "选 1 个"])) {
    return "select";
  }

  if (
    taskType === TASK_TYPES.PHYSICAL_ACTION ||
    hasAnyKeyword(text, ["站起来", "走到", "出门", "洗澡", "运动", "健身", "打扫", "拿快递", "换好"])
  ) {
    return "move";
  }

  if (hasAnyKeyword(text, ["检查", "查看", "阅读", "看", "确认", "浏览", "复盘"])) {
    return "review";
  }

  if (hasAnyKeyword(text, ["判断", "决定", "要不要", "是否", "值不值得", "继续还是"])) {
    return "decide";
  }

  if (hasAnyKeyword(text, ["打开", "点开", "进入", "找到"])) {
    return "open";
  }

  if (hasAnyKeyword(text, ["准备", "收集", "拿上", "放到", "摆到", "新建"])) {
    return "prepare";
  }

  return "open";
}

function inferCompletionCriteria(stepText, actionType) {
  const text = normalizeText(stepText);

  if (actionType === "write") {
    return "只要写出一句话即可，不需要润色。";
  }

  if (actionType === "select") {
    return "只要选出一个对象即可，不需要说明理由。";
  }

  if (actionType === "contact") {
    return "只要完成这一句低风险表达即可，不需要解释完整原因。";
  }

  if (actionType === "move") {
    return "只要完成这个身体动作即可，不需要继续做后续步骤。";
  }

  if (actionType === "review") {
    return "只要看到指定内容并记下一个发现，就算完成。";
  }

  if (actionType === "decide") {
    return "只要写下一个判断即可，不需要现在做最终决定。";
  }

  if (hasAnyKeyword(text, ["打开", "点开", "进入"])) {
    return "只要打开并看到目标内容，就算完成。";
  }

  return "完成这个具体动作即可，不需要做到完美。";
}

function inferStepStage(stepText, taskType) {
  const text = normalizeText(stepText);

  if (hasAnyKeyword(text, ["检查", "查看", "确认", "复盘", "核对"])) {
    return "review";
  }

  if (hasAnyKeyword(text, ["提交", "发送", "发出", "完成", "收尾"])) {
    return "finish";
  }

  if (
    taskType === TASK_TYPES.DECISION_MAKING ||
    hasAnyKeyword(text, ["判断", "要不要", "是否", "值不值得", "方向"])
  ) {
    return "clarify";
  }

  if (hasAnyKeyword(text, ["打开", "准备", "站起来", "选出"])) {
    return "start";
  }

  return "execute";
}

function inferRiskFlags({
  taskTitle = "",
  taskType = "",
  action_type,
  step_text,
  completion_criteria,
  explicitRisks = []
}) {
  const risks = [
    ...(Array.isArray(explicitRisks) ? explicitRisks : []),
    ...(ACTION_TYPE_RISK_RULES[action_type] || [])
  ];
  const sourceText = normalizeText(
    `${taskType} ${taskTitle} ${step_text} ${completion_criteria}`
  );

  KEYWORD_RISK_RULES.forEach((rule) => {
    if (hasAnyKeyword(sourceText, rule.keywords)) {
      risks.push(...rule.risks);
    }
  });

  if (hasAnyKeyword(sourceText, UNCLEAR_COMPLETION_PHRASES)) {
    risks.push("unclear_output", "perfectionism");
  }

  return dedupeValidRisks(risks);
}

function dedupeValidRisks(risks) {
  return [...new Set(risks)].filter((risk) => ROOT_CAUSES.includes(risk));
}

function getTaskType(task) {
  const text = normalizeText(task);

  return (
    findTaskTypeByRules(text, TASK_TYPE_PHRASE_RULES, "phrases") ||
    findTaskTypeByRules(text, TASK_TYPE_KEYWORD_RULES, "keywords") ||
    TASK_TYPES.GENERAL
  );
}

function findTaskTypeByRules(text, rules, fieldName) {
  const matchedRule = rules.find((rule) => hasAnyKeyword(text, rule[fieldName]));
  return matchedRule?.type || "";
}

function getTaskSubtype(task, taskType) {
  const text = normalizeText(task);

  if (taskType === TASK_TYPES.WRITING_OUTPUT) {
    if (hasAnyKeyword(text, ["ppt", "幻灯片", "答辩", "演示"])) {
      return TASK_SUBTYPES.PPT_CREATION;
    }

    if (hasAnyKeyword(text, ["作品集", "文案", "方案"])) {
      return TASK_SUBTYPES.PROPOSAL_COPY;
    }

    if (hasAnyKeyword(text, ["作业", "论文", "提纲", "报告", "文章"])) {
      return TASK_SUBTYPES.ESSAY_HOMEWORK;
    }
  }

  if (taskType === TASK_TYPES.LEARNING_INPUT) {
    if (hasAnyKeyword(text, ["背单词", "单词"])) {
      return TASK_SUBTYPES.VOCABULARY_MEMORIZATION;
    }

    if (hasAnyKeyword(text, ["章节", "课程", "资料"])) {
      return TASK_SUBTYPES.CHAPTER_STUDY;
    }

    if (hasAnyKeyword(text, ["复习", "笔记", "考试", "英语"])) {
      return TASK_SUBTYPES.REVIEW_NOTES;
    }
  }

  if (taskType === TASK_TYPES.PHYSICAL_ACTION) {
    if (hasAnyKeyword(text, ["健身", "运动", "跑步", "散步", "走路"])) {
      return TASK_SUBTYPES.FITNESS_EXERCISE;
    }

    if (hasAnyKeyword(text, ["超市", "买菜", "买东西"])) {
      return TASK_SUBTYPES.SHOPPING_ERRAND;
    }

    if (hasAnyKeyword(text, ["打扫", "收拾", "整理", "清理", "收纳"])) {
      return TASK_SUBTYPES.CLEANING_TIDYING;
    }
  }

  if (taskType === TASK_TYPES.TASK_PROCESSING) {
    if (hasAnyKeyword(text, ["消息", "回复", "聊天", "微信", "老师", "联系"])) {
      return TASK_SUBTYPES.REPLY_MESSAGE;
    }

    if (hasAnyKeyword(text, ["邮件", "邮箱"])) {
      return TASK_SUBTYPES.SEND_EMAIL;
    }

    if (hasAnyKeyword(text, ["简历", "投递", "申请", "岗位"])) {
      return TASK_SUBTYPES.SUBMIT_APPLICATION;
    }
  }

  return TASK_SUBTYPES.GENERAL;
}

function getStepText(step) {
  if (typeof step === "string") {
    return step;
  }

  if (!step || typeof step !== "object") {
    return "";
  }

  return String(
    step.step_text ||
      step.stepText ||
      step.text ||
      step.step ||
      ""
  ).trim();
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
