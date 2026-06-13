export const COMPLETION_ACTIONS = {
  CONTINUE: "continue",
  CONTINUE_NEXT_PHASE: "continue_next_phase",
  ASK_TASK_COMPLETION: "ask_task_completion",
  SHOW_CLOSING_CHECKLIST: "show_closing_checklist",
  OFFER_SESSION_COMPLETION: "offer_session_completion",
  COMPLETE_TASK: "complete_task"
};

export const TASK_COMPLETION_STRATEGIES = {
  ARTIFACT_CREATION: "artifact_creation",
  CLOSED_LOOP_ACTION: "closed_loop_action",
  COMMUNICATION: "communication",
  INFORMATION_CHECK: "information_check",
  DECISION_MAKING: "decision_making",
  LEARNING_PRACTICE: "learning_practice",
  PLANNING: "planning",
  ORGANIZING: "organizing",
  PHYSICAL_ACTION: "physical_action",
  REVIEW_IMPROVEMENT: "review_improvement",
  UNKNOWN_COMPLEX: "unknown_complex"
};

export const ARTIFACT_SUBTYPES = {
  PAPER: "paper",
  PRESENTATION: "presentation",
  PORTFOLIO: "portfolio",
  RESEARCH_REPORT: "research_report",
  RESUME: "resume",
  ARTICLE: "article",
  PROPOSAL: "proposal",
  GENERAL: "general_artifact"
};

const NEGATION_PROTECTION_PHRASES = [
  "不需要发送",
  "不发送",
  "不要发送",
  "先不要发送",
  "不需要提交",
  "不提交",
  "不要提交",
  "先不要提交",
  "不需要发布",
  "不发布",
  "不要发布",
  "先不要发布",
  "不需要上传",
  "不上传",
  "不要上传",
  "保存草稿",
  "保留草稿",
  "只存草稿",
  "临时版本",
  "不发出",
  "不要发出"
];

const EXTERNAL_CLOSED_LOOP_PHRASES = [
  "已发送",
  "发送成功",
  "邮件已发",
  "消息已发",
  "已回复",
  "回复成功",
  "已提交",
  "提交成功",
  "申请已提交",
  "已发布",
  "发布成功",
  "已付款",
  "付款完成",
  "支付成功",
  "已报名",
  "报名成功",
  "已预约",
  "预约成功",
  "已投递",
  "投递成功",
  "简历已投递",
  "订单已完成",
  "办理完成"
];

const CLOSING_ACTION_PHRASES = [
  "最终版",
  "最终稿",
  "可提交",
  "可展示",
  "可分享",
  "可投递",
  "导出",
  "保存最终",
  "排版完成",
  "完成排版",
  "补齐图片",
  "图片补齐",
  "补齐截图",
  "整理成稿",
  "整理成可提交",
  "检查最终",
  "提交前检查",
  "发布前检查",
  "展示前检查"
];

const PHASE_COMPLETED_PHRASES = [
  "大纲完成",
  "提纲完成",
  "初稿完成",
  "一稿完成",
  "资料收集完",
  "资料整理完",
  "结构搭好",
  "结构完成",
  "文案写完",
  "正文完成",
  "写完结论",
  "写完引言",
  "页面完成",
  "草稿完成"
];

const SESSION_COMPLETION_PHRASES = [
  "本轮完成",
  "今天先到这里",
  "这轮先到这里",
  "先收尾本轮",
  "下次继续",
  "保存断点"
];

const CLOSING_CHECKLISTS = {
  [ARTIFACT_SUBTYPES.PAPER]: {
    title: "论文收尾检查",
    intro: "看起来论文已经进入收尾阶段。先用这几项确认一下，不急着继续拆新步骤。",
    items: [
      "题目或主题已经明确。",
      "正文主体已经写完。",
      "引言和结论已经补齐。",
      "引用、参考资料或必要依据已经检查。",
      "格式、命名或保存位置已经处理。",
      "最终稿已经保存为可继续提交或修改的版本。"
    ],
    followup:
      "从论文收尾清单里挑一个还没满足的点，先补齐引用、格式、结论或最终稿保存位置中的一项。"
  },
  [ARTIFACT_SUBTYPES.PRESENTATION]: {
    title: "PPT 收尾检查",
    intro: "看起来 PPT 已经进入可展示前的收尾阶段。先确认这些项。",
    items: [
      "封面或标题页存在。",
      "背景、问题或目标讲清楚。",
      "方案或内容主体完整。",
      "结果、结论或下一步存在。",
      "没有明显空白页、占位符或断裂页面。",
      "文件已经保存、导出，或放到展示/提交位置。"
    ],
    followup:
      "从 PPT 收尾清单里挑一个还没满足的点，优先补齐空白页、结论页、导出文件或展示位置。"
  },
  [ARTIFACT_SUBTYPES.PORTFOLIO]: {
    title: "作品集收尾检查",
    intro: "看起来作品集已经接近可展示状态。先确认结构、图片和排版是否都过关。",
    items: [
      "项目名称和一句话简介存在。",
      "背景、目标和角色说明清楚。",
      "过程、方案或关键决策有展示。",
      "图片、截图或视觉材料已经补齐。",
      "页面排版基本可读，不影响展示。",
      "可展示文件、链接或导出版本已经准备好。"
    ],
    followup:
      "从作品集收尾清单里挑一个还没满足的点，先补齐图片、角色说明、排版或可展示链接中的一项。"
  },
  [ARTIFACT_SUBTYPES.RESEARCH_REPORT]: {
    title: "调研报告收尾检查",
    intro: "看起来调研报告已经进入可提交前的收尾阶段。先确认报告是否完整。",
    items: [
      "调研对象或问题已经明确。",
      "关键发现已经列出。",
      "分析或对比依据已经补齐。",
      "结论已经写出。",
      "建议、下一步或行动方向已经写出。",
      "报告整理成可提交或可分享版本。"
    ],
    followup:
      "从调研报告收尾清单里挑一个还没满足的点，先补齐关键发现、结论、建议或可提交版本中的一项。"
  },
  [ARTIFACT_SUBTYPES.RESUME]: {
    title: "简历收尾检查",
    intro: "看起来简历已经接近可投递状态。先确认这些收尾项。",
    items: [
      "基本信息完整。",
      "教育、工作或项目经历完整。",
      "与目标岗位相关的重点已突出。",
      "排版可读，无明显空白或错位。",
      "文件命名和格式适合投递。",
      "已保存为可投递版本。"
    ],
    followup:
      "从简历收尾清单里挑一个还没满足的点，先补齐经历、岗位重点、排版或可投递文件中的一项。"
  },
  [ARTIFACT_SUBTYPES.ARTICLE]: {
    title: "文章收尾检查",
    intro: "看起来文章已经进入发布或提交前的收尾阶段。先确认这些项。",
    items: [
      "标题存在。",
      "开头能说明主题。",
      "正文主体完整。",
      "结尾或观点收束存在。",
      "错别字、断句或明显占位已检查。",
      "发布/提交版本已经保存。"
    ],
    followup:
      "从文章收尾清单里挑一个还没满足的点，先补齐标题、结尾、错别字检查或保存版本中的一项。"
  },
  [ARTIFACT_SUBTYPES.PROPOSAL]: {
    title: "方案收尾检查",
    intro: "看起来方案已经进入可分享或可执行前的收尾阶段。先确认这些项。",
    items: [
      "目标或问题定义清楚。",
      "方案主体完整。",
      "执行步骤或资源需求明确。",
      "风险、限制或注意事项已写出。",
      "结论或推荐方向明确。",
      "文档已经整理成可分享版本。"
    ],
    followup:
      "从方案收尾清单里挑一个还没满足的点，先补齐执行步骤、风险、结论或分享版本中的一项。"
  },
  [ARTIFACT_SUBTYPES.GENERAL]: {
    title: "产物收尾检查",
    intro: "看起来这个产物已经接近完成。先确认它是否能被交付、展示或继续使用。",
    items: [
      "内容主体完整。",
      "结构基本清楚。",
      "明显占位或缺口已经处理。",
      "格式或呈现不影响使用。",
      "最终文件、链接或保存位置已经准备好。"
    ],
    followup:
      "从收尾清单里挑一个还没满足的点，先补齐最影响交付或展示的一项。"
  }
};

const STRATEGY_CHECKLISTS = {
  [TASK_COMPLETION_STRATEGIES.COMMUNICATION]: {
    title: "沟通收尾检查",
    intro: "这类任务要区分草稿和真正发送。先确认现在到哪一步。",
    items: [
      "草稿已经写完。",
      "收件人或沟通对象已经确认。",
      "已经决定是否需要发送。",
      "如果不发送，草稿已经保存。",
      "如果要发送，发送动作和结果已经确认。"
    ],
    followup:
      "先补齐沟通收尾里最缺的一项：确认对象、保存草稿，或完成发送前的最后检查。"
  },
  [TASK_COMPLETION_STRATEGIES.PLANNING]: {
    title: "规划收尾检查",
    intro: "看起来规划已经接近可执行状态。先确认它能不能直接指导下一步。",
    items: [
      "目标已经明确。",
      "下一步行动已经列出。",
      "优先级已经明确。",
      "时间或触发条件已经明确。",
      "计划已经保存成可执行 checklist。"
    ],
    followup:
      "先补齐规划里最影响执行的一项：下一步、优先级、时间或保存位置。"
  },
  [TASK_COMPLETION_STRATEGIES.LEARNING_PRACTICE]: {
    title: "学习本轮收尾检查",
    intro: "这类任务通常是长期推进。先确认本轮是否可以结束，而不是标记整个长期任务完成。",
    items: [
      "本轮学习目标已经完成。",
      "留下了一个输出，例如笔记、练习或总结。",
      "记录了还不懂的问题。",
      "知道下次从哪里继续。",
      "可以结束本轮，而不是标记整个长期任务完成。"
    ],
    followup:
      "先补齐本轮学习收尾里最缺的一项：笔记、练习结果、不懂的问题或下次继续位置。"
  },
  [TASK_COMPLETION_STRATEGIES.ORGANIZING]: {
    title: "整理收尾检查",
    intro: "整理类任务先确认范围和本轮结果，避免无限整理。",
    items: [
      "整理范围已经明确。",
      "已处理区域达到可接受状态。",
      "剩余未处理区域已经记录。",
      "下次继续位置已经明确。",
      "可以结束本轮。"
    ],
    followup:
      "先补齐整理收尾里最缺的一项：范围、剩余区域、下次继续位置或最后一小块处理。"
  }
};

export function getTaskCompletionProfile(taskTitle) {
  const text = normalizeText(taskTitle);

  if (!text) {
    return createProfile(TASK_COMPLETION_STRATEGIES.UNKNOWN_COMPLEX);
  }

  const closedLoopSubtype = getClosedLoopSubtype(text);
  if (closedLoopSubtype) {
    return createProfile(TASK_COMPLETION_STRATEGIES.CLOSED_LOOP_ACTION, {
      subtype: closedLoopSubtype,
      allowsSessionCompletion: false
    });
  }

  const communicationSubtype = getCommunicationSubtype(text);
  if (communicationSubtype) {
    return createProfile(TASK_COMPLETION_STRATEGIES.COMMUNICATION, {
      subtype: communicationSubtype,
      needsClosingChecklist: true,
      allowsSessionCompletion: false
    });
  }

  const artifactSubtype = getArtifactSubtype(text);
  if (artifactSubtype) {
    return createProfile(TASK_COMPLETION_STRATEGIES.ARTIFACT_CREATION, {
      subtype: artifactSubtype,
      needsClosingChecklist: true,
      allowsSessionCompletion: true
    });
  }

  if (hasAnyKeyword(text, ["查", "查看", "确认", "检查通知", "看一眼", "地址", "时间", "状态"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.INFORMATION_CHECK, {
      allowsSessionCompletion: false
    });
  }

  if (hasAnyKeyword(text, ["要不要", "是否", "该不该", "决定", "选择", "选题", "选方向"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.DECISION_MAKING, {
      allowsSessionCompletion: false
    });
  }

  if (hasAnyKeyword(text, ["学习", "复习", "练习", "刷题", "背单词", "课程", "看书"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.LEARNING_PRACTICE, {
      needsClosingChecklist: true,
      allowsSessionCompletion: true
    });
  }

  if (hasAnyKeyword(text, ["规划", "计划", "制定计划", "排期", "路线", "拆任务"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.PLANNING, {
      needsClosingChecklist: true,
      allowsSessionCompletion: true
    });
  }

  if (hasAnyKeyword(text, ["整理", "收拾", "清理", "归档", "收纳"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.ORGANIZING, {
      needsClosingChecklist: true,
      allowsSessionCompletion: true
    });
  }

  if (hasAnyKeyword(text, ["出门", "下楼", "洗澡", "刷牙", "健身", "跑步", "做饭", "拿快递", "取快递"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.PHYSICAL_ACTION, {
      allowsSessionCompletion: false
    });
  }

  if (hasAnyKeyword(text, ["检查", "修改", "优化", "润色", "复盘", "review"])) {
    return createProfile(TASK_COMPLETION_STRATEGIES.REVIEW_IMPROVEMENT, {
      allowsSessionCompletion: true
    });
  }

  return createProfile(TASK_COMPLETION_STRATEGIES.UNKNOWN_COMPLEX);
}

export function detectCompletionSignals(step, stepHistory = [], options = {}) {
  const latestText = normalizeText(collectStepText(step).join(" "));
  const historyText = normalizeText(
    (Array.isArray(stepHistory) ? stepHistory : [])
      .map((historyStep) => collectStepText(historyStep).join(" "))
      .join(" ")
  );
  const allText = normalizeText(`${historyText} ${latestText}`);
  const protectedText = stripNegationProtection(allText);

  return {
    hasNegation: hasAnyKeyword(latestText, NEGATION_PROTECTION_PHRASES),
    hasExternalClosedLoop: hasAnyKeyword(protectedText, EXTERNAL_CLOSED_LOOP_PHRASES),
    hasClosingAction: hasAnyKeyword(protectedText, CLOSING_ACTION_PHRASES),
    hasPhaseCompleted: hasAnyKeyword(protectedText, PHASE_COMPLETED_PHRASES),
    hasSessionCompletion: hasAnyKeyword(protectedText, SESSION_COMPLETION_PHRASES),
    hasAiCompletionSuggestion: Boolean(options.aiSuggestedComplete),
    latestText,
    allText
  };
}

export function getClosingChecklistTemplate(profileOrTaskTitle) {
  const profile =
    typeof profileOrTaskTitle === "string"
      ? getTaskCompletionProfile(profileOrTaskTitle)
      : profileOrTaskTitle;

  if (profile?.strategy === TASK_COMPLETION_STRATEGIES.ARTIFACT_CREATION) {
    return (
      CLOSING_CHECKLISTS[profile.subtype] ||
      CLOSING_CHECKLISTS[ARTIFACT_SUBTYPES.GENERAL]
    );
  }

  return (
    STRATEGY_CHECKLISTS[profile?.strategy] ||
    CLOSING_CHECKLISTS[ARTIFACT_SUBTYPES.GENERAL]
  );
}

export function createClosingChecklistStep(taskTitle, decision = {}) {
  const profile = decision.profile || getTaskCompletionProfile(taskTitle);
  const checklist = decision.checklist || getClosingChecklistTemplate(profile);

  return {
    step_type: "closing_checklist",
    step_text: checklist.intro,
    action_type: "review",
    completion_criteria: "确认清单都满足，或选择还差一步。",
    estimated_effort: "low",
    stage: "finish",
    risk_flags: [],
    task_object: taskTitle || "current task",
    expected_output: "closing checklist decision",
    progress_intent: "confirm_task_closing_boundary",
    completion_scope: "task",
    completion_signal: "closing_action",
    closing_checklist_title: checklist.title,
    closing_checklist_items: [...checklist.items],
    closing_followup_text: checklist.followup,
    task_completion_profile: {
      strategy: profile.strategy,
      subtype: profile.subtype
    }
  };
}

export function createClosingFollowupStep(taskTitle, currentChecklistStep = null) {
  const profile = getTaskCompletionProfile(taskTitle);
  const checklist =
    currentChecklistStep?.closing_followup_text ||
    getClosingChecklistTemplate(profile).followup;

  return {
    step_type: "action",
    step_text: checklist,
    action_type: "review",
    completion_criteria: "补齐这一项即可，不需要继续扩展新任务。",
    estimated_effort: "low",
    stage: "finish",
    risk_flags: [],
    task_object: taskTitle || "current task",
    expected_output: "one missing closing item handled",
    progress_intent: "complete_one_closing_gap",
    completion_scope: "step",
    completion_signal: "closing_action"
  };
}

export function decideCompletionBoundary({
  taskTitle,
  completedStep,
  stepHistory = [],
  aiSuggestedComplete = false,
  duplicateStepDetected = false
}) {
  const profile = getTaskCompletionProfile(taskTitle);
  const signals = detectCompletionSignals(completedStep, stepHistory, {
    aiSuggestedComplete
  });

  if (signals.hasNegation) {
    return createDecision(COMPLETION_ACTIONS.CONTINUE, {
      reason: "negation_protection",
      confidence: "high",
      profile,
      signals
    });
  }

  if (duplicateStepDetected) {
    return createDecision(COMPLETION_ACTIONS.ASK_TASK_COMPLETION, {
      reason: "duplicate_step_detected",
      confidence: "medium",
      profile,
      signals
    });
  }

  if (signals.hasExternalClosedLoop) {
    return createDecision(COMPLETION_ACTIONS.ASK_TASK_COMPLETION, {
      reason: "external_closed_loop_detected",
      confidence: "high",
      profile,
      signals
    });
  }

  if (signals.hasClosingAction) {
    if (profile.needsClosingChecklist) {
      return createDecision(COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST, {
        reason: "closing_action_detected",
        confidence: "high",
        profile,
        signals,
        checklist: getClosingChecklistTemplate(profile)
      });
    }

    return createDecision(COMPLETION_ACTIONS.ASK_TASK_COMPLETION, {
      reason: "closing_action_detected",
      confidence: "medium",
      profile,
      signals
    });
  }

  if (signals.hasAiCompletionSuggestion) {
    if (profile.needsClosingChecklist) {
      return createDecision(COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST, {
        reason: "ai_completion_suggestion_needs_closing_checklist",
        confidence: "medium",
        profile,
        signals,
        checklist: getClosingChecklistTemplate(profile)
      });
    }

    return createDecision(COMPLETION_ACTIONS.ASK_TASK_COMPLETION, {
      reason: "ai_completion_suggestion_requires_user_confirmation",
      confidence: "medium",
      profile,
      signals
    });
  }

  if (signals.hasPhaseCompleted) {
    return createDecision(COMPLETION_ACTIONS.CONTINUE_NEXT_PHASE, {
      reason: "phase_completed",
      confidence: "medium",
      profile,
      signals
    });
  }

  if (signals.hasSessionCompletion && profile.allowsSessionCompletion) {
    return createDecision(COMPLETION_ACTIONS.OFFER_SESSION_COMPLETION, {
      reason: "session_completion_signal",
      confidence: "medium",
      profile,
      signals
    });
  }

  return createDecision(COMPLETION_ACTIONS.CONTINUE, {
    reason: "no_completion_boundary",
    confidence: "low",
    profile,
    signals
  });
}

function createProfile(strategy, overrides = {}) {
  return {
    strategy,
    subtype: overrides.subtype || "",
    needsClosingChecklist: Boolean(overrides.needsClosingChecklist),
    allowsSessionCompletion: Boolean(overrides.allowsSessionCompletion),
    allowsExternalConfirmation:
      overrides.allowsExternalConfirmation !== undefined
        ? Boolean(overrides.allowsExternalConfirmation)
        : true
  };
}

function createDecision(action, details = {}) {
  return {
    action,
    reason: details.reason || "",
    confidence: details.confidence || "low",
    profile: details.profile || createProfile(TASK_COMPLETION_STRATEGIES.UNKNOWN_COMPLEX),
    signals: details.signals || {},
    ...(details.checklist ? { checklist: details.checklist } : {})
  };
}

function getClosedLoopSubtype(text) {
  if (hasAnyKeyword(text, ["提交", "交申请", "递交", "上传"])) {
    return "submit";
  }

  if (hasAnyKeyword(text, ["投递", "发送简历", "投简历"])) {
    return "apply";
  }

  if (hasAnyKeyword(text, ["发布", "发作品", "发到社交平台"])) {
    return "publish";
  }

  if (hasAnyKeyword(text, ["付款", "支付", "下单"])) {
    return "pay";
  }

  if (hasAnyKeyword(text, ["报名", "注册"])) {
    return "register";
  }

  if (hasAnyKeyword(text, ["预约", "预定", "订票"])) {
    return "book";
  }

  return "";
}

function getCommunicationSubtype(text) {
  if (hasAnyKeyword(text, ["回消息", "回复消息", "回复微信", "回微信", "聊天"])) {
    return "reply_message";
  }

  if (hasAnyKeyword(text, ["邮件", "email", "邮箱"])) {
    return "email";
  }

  if (hasAnyKeyword(text, ["道歉"])) {
    return "apology";
  }

  if (hasAnyKeyword(text, ["催", "提醒"])) {
    return "reminder";
  }

  if (hasAnyKeyword(text, ["询问", "问老师", "问导师", "问hr", "问HR", "联系"])) {
    return "ask_for_help";
  }

  if (hasAnyKeyword(text, ["说明进度", "汇报进度", "解释"])) {
    return "status_update";
  }

  return "";
}

function getArtifactSubtype(text) {
  if (hasAnyKeyword(text, ["论文", "毕业论文", "开题", "综述"])) {
    return ARTIFACT_SUBTYPES.PAPER;
  }

  if (hasAnyKeyword(text, ["ppt", "PPT", "幻灯片", "汇报", "演示文稿"])) {
    return ARTIFACT_SUBTYPES.PRESENTATION;
  }

  if (hasAnyKeyword(text, ["作品集", "portfolio", "项目集"])) {
    return ARTIFACT_SUBTYPES.PORTFOLIO;
  }

  if (hasAnyKeyword(text, ["调研报告", "研究报告", "竞品分析报告", "调研", "竞品分析"])) {
    return ARTIFACT_SUBTYPES.RESEARCH_REPORT;
  }

  if (hasAnyKeyword(text, ["简历", "resume"])) {
    return ARTIFACT_SUBTYPES.RESUME;
  }

  if (hasAnyKeyword(text, ["文章", "公众号", "博客", "推文"])) {
    return ARTIFACT_SUBTYPES.ARTICLE;
  }

  if (hasAnyKeyword(text, ["方案", "proposal", "策划案", "计划书"])) {
    return ARTIFACT_SUBTYPES.PROPOSAL;
  }

  if (hasAnyKeyword(text, ["文档", "报告", "稿件", "内容", "材料"])) {
    return ARTIFACT_SUBTYPES.GENERAL;
  }

  return "";
}

function stripNegationProtection(text) {
  return NEGATION_PROTECTION_PHRASES.reduce(
    (currentText, phrase) => currentText.replaceAll(normalizeText(phrase), ""),
    text
  );
}

function collectStepText(value) {
  if (typeof value === "string") {
    return [value].filter(Boolean);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return [
    value.step_text,
    value.stepText,
    value.question,
    value.content,
    value.text,
    value.step,
    value.action,
    value.completion_criteria,
    value.completionCriteria
  ]
    .flatMap((field) => collectStepText(field))
    .map((text) => String(text || "").trim())
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function hasAnyKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}
