import express from "express";
import {
  generateFallbackStepPrompt,
  generateFirstStepPrompt,
  generateNextStepPrompt,
  generateRecoveryPlanningPrompt,
  generateResistanceDiagnosisPrompt
} from "../services/promptService.js";
import { callDeepSeek } from "../services/deepseekClient.js";

const router = express.Router();

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

const ESTIMATED_EFFORTS = ["low", "medium"];
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
const PRESSURE_TYPES = [
  "emotional_pressure",
  "social_exposure",
  "output_uncertainty",
  "task_size",
  "quality_pressure",
  "physical_energy_cost",
  "value_uncertainty",
  "decision_cost"
];

router.post("/generate-first-step", async (req, res) => {
  try {
    const { task, taskContext, clarificationAnswer, stepHistory } = req.body;

    if (!task || typeof task !== "string") {
      return res.status(400).json({
        message: "task is required and must be a string."
      });
    }

    const prompt = generateFirstStepPrompt({
      task,
      taskContext,
      clarificationAnswer,
      stepHistory
    });
    const aiText = await callDeepSeek(prompt);

    res.json(normalizeAiStep(aiText));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to generate the first step."
    });
  }
});

router.post("/generate-next-step", async (req, res) => {
  try {
    const {
      task,
      taskContext,
      clarificationAnswer,
      stepHistory,
      retryReason,
      rejectedStep,
      previousStep
    } = req.body;

    if (!task || typeof task !== "string") {
      return res.status(400).json({
        message: "task is required and must be a string."
      });
    }

    if (!Array.isArray(stepHistory)) {
      return res.status(400).json({
        message: "stepHistory is required and must be an array."
      });
    }

    const prompt = generateNextStepPrompt({
      task,
      taskContext,
      clarificationAnswer,
      stepHistory,
      retryReason,
      rejectedStep,
      previousStep
    });
    const aiText = await callDeepSeek(prompt);

    res.json(normalizeAiStep(aiText));
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to generate the next step."
    });
  }
});

router.post("/diagnose-resistance", async (req, res) => {
  try {
    const { context } = req.body;

    if (!context || typeof context !== "object") {
      return res.status(400).json({
        message: "context is required and must be an object."
      });
    }

    const prompt = generateResistanceDiagnosisPrompt(context);
    const aiText = await callDeepSeek(prompt, {
      systemPrompt:
        "You are a task-internal resistance diagnosis layer. Return only valid JSON. Do not generate fallback steps."
    });
    const diagnosis = normalizeResistanceDiagnosis(aiText, context);

    res.json({
      diagnosis,
      debugResistanceTrace: {
        context,
        diagnosis
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to diagnose resistance."
    });
  }
});

router.post("/plan-recovery", async (req, res) => {
  try {
    const { context, diagnosis } = req.body;

    if (!context || typeof context !== "object") {
      return res.status(400).json({
        message: "context is required and must be an object."
      });
    }

    if (!diagnosis || typeof diagnosis !== "object") {
      return res.status(400).json({
        message: "diagnosis is required and must be an object."
      });
    }

    const prompt = generateRecoveryPlanningPrompt({ context, diagnosis });
    const aiText = await callDeepSeek(prompt, {
      systemPrompt:
        "You are a task-internal recovery planning layer. Return only valid JSON. Do not generate fallback steps or user-visible copy."
    });
    const { recoveryPlan, recoveryPlanError } = normalizeRecoveryPlan(
      aiText,
      context,
      diagnosis
    );

    res.json({
      recoveryPlan,
      recoveryPlanError,
      debugResistanceTrace: {
        context,
        diagnosis,
        recoveryPlan
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to plan resistance recovery."
    });
  }
});

router.post("/generate-fallback-step", async (req, res) => {
  try {
    const { context, diagnosis, recoveryPlan, validationFeedback } = req.body;

    if (!context || typeof context !== "object") {
      return res.status(400).json({
        message: "context is required and must be an object."
      });
    }

    if (!diagnosis || typeof diagnosis !== "object") {
      return res.status(400).json({
        message: "diagnosis is required and must be an object."
      });
    }

    if (!recoveryPlan || typeof recoveryPlan !== "object") {
      return res.status(400).json({
        message: "recoveryPlan is required and must be an object."
      });
    }

    const prompt = generateFallbackStepPrompt({
      context,
      diagnosis,
      recoveryPlan,
      validationFeedback: validationFeedback || null
    });
    const aiText = await callDeepSeek(prompt, {
      systemPrompt:
        "You are a task-internal fallback step generation layer. Return only valid JSON containing one fallback_step."
    });
    const { fallbackStep, fallbackStepError } = normalizeGeneratedFallbackStep(
      aiText,
      context,
      recoveryPlan
    );

    res.json({
      raw_output: aiText,
      fallback_step: fallbackStep,
      fallbackStepError,
      debugResistanceTrace: {
        context,
        diagnosis,
        recoveryPlan,
        fallbackStepGeneration: {
          raw_output: aiText,
          parsed_fallback_step: fallbackStep,
          validation_result: null,
          retry_count: 0,
          final_source: fallbackStep ? "ai_generated" : "legacy_fallback"
        }
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to generate resistance fallback step."
    });
  }
});

function normalizeAiStep(aiText) {
  const text = aiText.trim();

  if (!text) {
    throw new Error("AI returned an empty step.");
  }

  if (text.startsWith("[TASK_DONE]")) {
    return {
      step: text.replace("[TASK_DONE]", "").trim() || "The task is complete.",
      isTaskComplete: true,
      sessionSummary: "AI judged that there is no necessary next step."
    };
  }

  const parsed = parseAiJsonObject(text);
  const structuredStep = normalizeStructuredStep(parsed);

  if (structuredStep) {
    return {
      step: structuredStep,
      isTaskComplete: false,
      sessionSummary: "Generated the current structured step from the task and history."
    };
  }

  return {
    step: text,
    isTaskComplete: false,
    sessionSummary: "Generated the current step from the task and history."
  };
}

function normalizeStructuredStep(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const type = value.step_type || value.type;
  const isClarification = type === "clarification";
  const stepText = isClarification
    ? getReadableStepText(value.question) ||
      getReadableStepText(value.step_text) ||
      getReadableStepText(value.content)
    : getReadableStepText(value.step_text) ||
      getReadableStepText(value.content) ||
      getReadableStepText(value.step) ||
      getReadableStepText(value.action);

  if (!stepText) {
    return null;
  }

  if (isClarification) {
    return {
      step_type: "clarification",
      step_text: stepText,
      clarification_key: String(
        value.clarification_key || value.reason || "clarification_answer"
      ).trim(),
      input_placeholder: String(value.input_placeholder || value.placeholder || "").trim(),
      completion_criteria: "",
      action_type: "write",
      estimated_effort: "low",
      stage: "clarify",
      risk_flags: ["unclear_output"]
    };
  }

  return {
    step_type: "action",
    step_text: stepText,
    completion_criteria: String(value.completion_criteria || "").trim(),
    action_type: ACTION_TYPES.includes(value.action_type)
      ? value.action_type
      : "write",
    estimated_effort: ESTIMATED_EFFORTS.includes(value.estimated_effort)
      ? value.estimated_effort
      : "low",
    stage: STEP_STAGES.includes(value.stage) ? value.stage : "start",
    risk_flags: normalizeStringArray(value.risk_flags, 0, 4)
  };
}

function getReadableStepText(value) {
  if (typeof value === "string") {
    const text = value.trim();
    return text === "[object Object]" ? "" : text;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const fields = [
    value.step_text,
    value.stepText,
    value.question,
    value.content,
    value.text,
    value.step,
    value.action
  ];

  for (const field of fields) {
    const text = getReadableStepText(field);

    if (text) {
      return text;
    }
  }

  return "";
}

function normalizeResistanceDiagnosis(aiText, context) {
  const parsed = parseAiJsonObject(aiText);
  const fallback = createFallbackResistanceDiagnosis(context);

  if (!parsed) {
    return fallback;
  }

  const primary = normalizeRootCause(parsed.primary_root_cause);
  const secondary = normalizeSecondaryRootCause(
    parsed.secondary_root_cause,
    primary
  );
  const evidence = normalizeStringArray(parsed.evidence, 2, 4);
  const excludedCauses = Array.isArray(parsed.excluded_causes)
    ? parsed.excluded_causes
        .map((item) => ({
          cause: String(item?.cause || "").trim(),
          reason: String(item?.reason || "").trim()
        }))
        .filter((item) => item.cause && item.reason)
        .slice(0, 4)
    : [];
  const avoid = normalizeStringArray(parsed.avoid, 2, 6);
  const normalizedPrimary = primary || fallback.primary_root_cause;
  const normalizedSurface = normalizeSurfaceResistanceForContext({
    surfaceResistance: normalizeSurfaceResistance(
      parsed.surface_resistance,
      fallback.surface_resistance
    ),
    primaryRootCause: normalizedPrimary,
    context
  });
  const normalizedRecoveryDirection = normalizeDiagnosisRecoveryDirection({
    recoveryDirection:
      String(parsed.recovery_direction || "").trim() ||
      fallback.recovery_direction,
    primaryRootCause: normalizedPrimary,
    context
  });
  const normalizedAvoid = normalizeDiagnosisAvoid({
    avoid: avoid.length >= 2 ? avoid : fallback.avoid,
    primaryRootCause: normalizedPrimary,
    context
  });

  return {
    surface_resistance: normalizedSurface,
    primary_root_cause: normalizedPrimary,
    secondary_root_cause: secondary,
    user_state_summary:
      String(parsed.user_state_summary || "").trim() ||
      fallback.user_state_summary,
    evidence: evidence.length >= 2 ? evidence : fallback.evidence,
    excluded_causes:
      excludedCauses.length > 0 ? excludedCauses : fallback.excluded_causes,
    confidence: ["low", "medium", "high"].includes(parsed.confidence)
      ? parsed.confidence
      : fallback.confidence,
    recovery_direction: normalizedRecoveryDirection,
    avoid: normalizedAvoid
  };
}

function normalizeRecoveryPlan(aiText, context, diagnosis) {
  const parsed = parseAiJsonObject(aiText);

  if (!parsed) {
    return {
      recoveryPlan: null,
      recoveryPlanError: "AI recovery plan JSON parse failed."
    };
  }

  const avoid = mergeStringArrays(diagnosis?.avoid, parsed.avoid).slice(0, 8);
  const fallbackRequirements = parsed.fallback_step_requirements || {};
  const actionType = ACTION_TYPES.includes(fallbackRequirements.action_type)
    ? fallbackRequirements.action_type
    : getDefaultRecoveryActionType(diagnosis?.primary_root_cause);
  const estimatedEffort = ESTIMATED_EFFORTS.includes(
    fallbackRequirements.estimated_effort
  )
    ? fallbackRequirements.estimated_effort
    : "low";
  const keyEvidence = normalizeStringArray(
    parsed?.based_on?.key_evidence,
    2,
    3
  );
  const diagnosisEvidence = normalizeStringArray(diagnosis?.evidence, 2, 3);
  const pressureReduced = normalizePressureReduced(
    parsed.pressure_reduced,
    diagnosis?.primary_root_cause
  );
  const strategyName = normalizeStrategyName(
    parsed.strategy_name,
    diagnosis?.primary_root_cause
  );
  const rawActionShiftTo =
    String(parsed?.action_shift?.to || "").trim() ||
    getDefaultActionShiftTo(context, diagnosis);
  const normalizedActionShiftTo = normalizeRecoveryActionShiftTo({
    actionShiftTo: rawActionShiftTo,
    strategyName,
    context,
    diagnosis,
    avoid
  });
  const normalizedActionType = normalizeRecoveryActionType({
    actionType,
    strategyName,
    actionShiftTo: normalizedActionShiftTo,
    diagnosis
  });

  return {
    recoveryPlan: {
      based_on: {
        primary_root_cause: diagnosis?.primary_root_cause || "",
        secondary_root_cause: diagnosis?.secondary_root_cause || null,
        recovery_direction: diagnosis?.recovery_direction || "",
        key_evidence:
          keyEvidence.length >= 2 ? keyEvidence : diagnosisEvidence.slice(0, 3)
      },
      strategy_name: strategyName,
      strategy_goal:
        String(parsed.strategy_goal || "").trim() ||
        getDefaultStrategyGoal(diagnosis),
      recovery_principle:
        String(parsed.recovery_principle || "").trim() ||
        getDefaultRecoveryPrinciple(diagnosis),
      action_shift: {
        from:
          String(parsed?.action_shift?.from || "").trim() ||
          context?.currentStep?.step_text ||
          "",
        to: normalizedActionShiftTo
      },
      pressure_reduced:
        pressureReduced.length > 0
          ? pressureReduced
          : getDefaultPressureReduced(diagnosis?.primary_root_cause),
      target_user_state:
        String(parsed.target_user_state || "").trim() ||
        "The user can restart with lower pressure while preserving the task goal.",
      avoid:
        avoid.length >= 2
          ? avoid
          : [
              "Do not force the original blocker.",
              "Do not generate a large multi-step plan."
            ],
      fallback_step_requirements: {
        action_type: normalizedActionType,
        estimated_effort: estimatedEffort,
        completion_boundary_required: true,
        must_preserve_goal: true,
        should_remove_pressure_source:
          typeof fallbackRequirements.should_remove_pressure_source === "boolean"
            ? fallbackRequirements.should_remove_pressure_source
            : shouldRemovePressureSource(diagnosis?.primary_root_cause),
        should_avoid_original_blocker:
          fallbackRequirements.should_avoid_original_blocker !== false
      },
      diagnosis_warning:
        parsed.diagnosis_warning === null ||
        parsed.diagnosis_warning === undefined
          ? null
          : String(parsed.diagnosis_warning || "").trim() || null
    },
    recoveryPlanError: null
  };
}

function normalizeGeneratedFallbackStep(aiText, context, recoveryPlan) {
  const parsed = parseAiJsonObject(aiText);

  if (!parsed) {
    return {
      fallbackStep: null,
      fallbackStepError: "AI fallback_step JSON parse failed."
    };
  }

  const rawStep =
    parsed.fallback_step && typeof parsed.fallback_step === "object"
      ? parsed.fallback_step
      : parsed;
  const requirements = recoveryPlan?.fallback_step_requirements || {};
  const stepText = String(rawStep.step_text || "").trim();
  const completionCriteria = String(rawStep.completion_criteria || "").trim();

  if (!stepText || !completionCriteria) {
    return {
      fallbackStep: null,
      fallbackStepError: "AI fallback_step missing step_text or completion_criteria."
    };
  }

  const actionType = ACTION_TYPES.includes(rawStep.action_type)
    ? rawStep.action_type
    : ACTION_TYPES.includes(requirements.action_type)
      ? requirements.action_type
      : "prepare";
  const estimatedEffort = ESTIMATED_EFFORTS.includes(rawStep.estimated_effort)
    ? rawStep.estimated_effort
    : ESTIMATED_EFFORTS.includes(requirements.estimated_effort)
      ? requirements.estimated_effort
      : "low";
  const stage = STEP_STAGES.includes(rawStep.stage)
    ? rawStep.stage
    : getDefaultFallbackStage(recoveryPlan, context);
  const riskFlags = normalizeFallbackRiskFlags(rawStep.risk_flags, recoveryPlan);
  const userVisibleReason =
    String(rawStep.user_visible_reason || "").trim() ||
    getDefaultUserVisibleReason(recoveryPlan);

  return {
    fallbackStep: {
      step_text: stepText,
      completion_criteria: completionCriteria,
      action_type: actionType,
      estimated_effort: estimatedEffort,
      stage,
      risk_flags: riskFlags,
      user_visible_reason: userVisibleReason
    },
    fallbackStepError: null
  };
}

function getDefaultFallbackStage(recoveryPlan, context) {
  const strategyName = recoveryPlan?.strategy_name || "";

  if (
    strategyName === "output_clarification" ||
    strategyName === "minimum_value_check"
  ) {
    return "clarify";
  }

  if (strategyName === "low_quality_draft") {
    return "execute";
  }

  if (strategyName === "safe_draft_before_contact") {
    return context?.currentStep?.stage || "start";
  }

  return context?.currentStep?.stage || "start";
}

function normalizeFallbackRiskFlags(value, recoveryPlan) {
  const risks = [];

  for (const item of normalizeStringArray(value, 0, 5)) {
    if (ROOT_CAUSES.includes(item) && !risks.includes(item)) {
      risks.push(item);
    }
  }

  if (risks.length > 0) {
    return risks;
  }

  const strategyName = recoveryPlan?.strategy_name || "";

  if (strategyName === "safe_draft_before_contact") {
    return ["perfectionism"];
  }

  if (strategyName === "low_quality_draft") {
    return ["perfectionism"];
  }

  if (strategyName === "output_clarification") {
    return ["perfectionism"];
  }

  if (
    strategyName === "energy_saving_restart" ||
    strategyName === "first_physical_action"
  ) {
    return ["physical_low_energy"];
  }

  if (strategyName === "minimum_value_check") {
    return ["value_uncertainty"];
  }

  return [];
}

function getDefaultUserVisibleReason(recoveryPlan) {
  const strategyName = recoveryPlan?.strategy_name || "";

  if (strategyName === "safe_draft_before_contact") {
    return "This step removes the sending pressure and only keeps a private draft.";
  }

  if (strategyName === "low_quality_draft") {
    return "This step lowers the quality bar and only keeps a rough draft.";
  }

  if (strategyName === "output_clarification") {
    return "This step narrows the output so you know exactly what to make.";
  }

  if (strategyName === "minimum_value_check") {
    return "This step checks whether continuing is worth it before pushing execution.";
  }

  if (
    strategyName === "energy_saving_restart" ||
    strategyName === "first_physical_action"
  ) {
    return "This step lowers the body cost and keeps a small restart point.";
  }

  return "This step lowers the current blocker while keeping the original goal.";
}

function parseAiJsonObject(text) {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch
    ? fencedMatch[1].trim()
    : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);

  if (!jsonText || !jsonText.startsWith("{")) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function createFallbackResistanceDiagnosis(context) {
  const utterance = String(context?.user_utterance || "").trim();
  const currentStep = context?.currentStep || {};
  const riskFlags = Array.isArray(currentStep.risk_flags)
    ? currentStep.risk_flags
    : [];
  const surface = utterance ? "dont_want" : "too_hard";
  const primary = utterance ? "too_large" : "unclear_output";
  const evidence = [
    utterance
      ? `user_utterance: ${utterance}`
      : "user_utterance is empty or unclear",
    currentStep.step_text
      ? `currentStep.step_text: ${currentStep.step_text}`
      : "currentStep is missing step_text"
  ];

  if (riskFlags.length > 0) {
    evidence.push(`currentStep.risk_flags: ${riskFlags.join(", ")}`);
  }

  return {
    surface_resistance: surface,
    primary_root_cause: primary,
    secondary_root_cause: null,
    user_state_summary:
      "当前信息不足以做高置信诊断，先按任务内卡点做保守处理。",
    evidence: evidence.slice(0, 4),
    excluded_causes: [
      {
        cause: "physical_low_energy",
        reason: "用户没有明确表达疲惫、困或身体状态差。"
      }
    ],
    confidence: "low",
    recovery_direction: "先降低当前步骤成本，并保留后续继续判断的空间。",
    avoid: ["不要强推用户直接完成原步骤", "不要输出大段说教或心理分析"]
  };
}

function normalizeSurfaceResistance(value, fallback) {
  return ["too_hard", "dont_want", "not_sure", "bad_state"].includes(value)
    ? value
    : fallback;
}

function normalizeSurfaceResistanceForContext({
  surfaceResistance,
  primaryRootCause,
  context
}) {
  const userUtterance = String(context?.user_utterance || "");

  if (hasLowEnergySurfaceSignal(userUtterance)) {
    return "bad_state";
  }

  if (
    primaryRootCause === "value_uncertainty" ||
    hasValueUncertaintySurfaceSignal(userUtterance)
  ) {
    return "not_sure";
  }

  if (
    (primaryRootCause === "emotional_pressure" ||
      primaryRootCause === "social_pressure") &&
    hasContactAvoidanceSurfaceSignal(userUtterance, context)
  ) {
    return "dont_want";
  }

  if (hasUnclearOutputSurfaceSignal(userUtterance)) {
    return "too_hard";
  }

  return surfaceResistance;
}

function normalizeDiagnosisRecoveryDirection({
  recoveryDirection,
  primaryRootCause,
  context
}) {
  if (!shouldRemoveContactPressure(primaryRootCause, context)) {
    return recoveryDirection;
  }

  const text = String(recoveryDirection || "");

  if (!violatesContactPressureRemoval(text)) {
    return text;
  }

  return "Remove direct contact and sending pressure first; prepare a low-risk unsent expression in a safe private place.";
}

function normalizeDiagnosisAvoid({ avoid, primaryRootCause, context }) {
  const normalizedAvoid = mergeStringArrays(avoid);

  if (shouldRemoveContactPressure(primaryRootCause, context)) {
    for (const item of [
      "Do not ask the user to open the chat app or message thread directly.",
      "Do not ask the user to send a message now.",
      "Do not encourage the user to bravely face the pressure source."
    ]) {
      if (!normalizedAvoid.includes(item)) {
        normalizedAvoid.push(item);
      }
    }
  }

  return normalizedAvoid.slice(0, 8);
}

function hasUnclearOutputSurfaceSignal(text) {
  const source = String(text || "").toLowerCase();
  const directSignals = [
    "没思路",
    "沒有思路",
    "脑子很乱",
    "腦子很亂",
    "从哪里开始",
    "从哪开始",
    "从哪儿开始",
    "从哪块下手",
    "怎么写",
    "怎么说",
    "写什么",
    "说什么",
    "哪些内容",
    "哪个角度",
    "先选",
    "先做",
    "where to start",
    "what to write",
    "what to say",
    "which angle",
    "don't know how",
    "do not know how",
    "not sure how"
  ];

  return directSignals.some((signal) => source.includes(signal));
}

function hasValueUncertaintySurfaceSignal(text) {
  const source = String(text || "").toLowerCase();
  const valueSignals = [
    "值不值得",
    "有没有用",
    "有沒有用",
    "有没有意义",
    "有沒有意義",
    "没意义",
    "沒意義",
    "还要不要",
    "還要不要",
    "是否继续",
    "是否繼續",
    "要不要继续",
    "要不要繼續",
    "投入没回报",
    "投入沒回報",
    "worth",
    "useful",
    "meaningless",
    "continue"
  ];

  return valueSignals.some((signal) => source.includes(signal));
}

function hasLowEnergySurfaceSignal(text) {
  const source = String(text || "").toLowerCase();
  const lowEnergySignals = [
    "太累",
    "好累",
    "困",
    "没力气",
    "沒力氣",
    "不想动",
    "不想動",
    "懒得起来",
    "懶得起來",
    "状态很差",
    "狀態很差",
    "tired",
    "sleepy",
    "exhausted",
    "low energy"
  ];

  return lowEnergySignals.some((signal) => source.includes(signal));
}

function hasContactAvoidanceSurfaceSignal(text, context) {
  if (!shouldRemoveContactPressure("emotional_pressure", context)) {
    return false;
  }

  const source = String(text || "").toLowerCase();
  const avoidanceSignals = [
    "怕",
    "不敢",
    "不想点开",
    "不想打开",
    "不想发",
    "一直不敢发",
    "会不会更生气",
    "被拒绝",
    "打扰",
    "小气",
    "afraid",
    "scared",
    "do not want to open",
    "don't want to open",
    "do not want to send",
    "don't want to send"
  ];

  return avoidanceSignals.some((signal) => source.includes(signal));
}

function shouldRemoveContactPressure(rootCause, context) {
  const currentStep = context?.currentStep || {};
  const riskFlags = Array.isArray(currentStep.risk_flags)
    ? currentStep.risk_flags
    : [];
  const contactText = `${context?.task_title || ""} ${
    currentStep.step_text || ""
  } ${context?.user_utterance || ""}`.toLowerCase();

  return (
    (rootCause === "emotional_pressure" || rootCause === "social_pressure") &&
    (currentStep.action_type === "contact" ||
      riskFlags.includes("social_pressure") ||
      contactText.includes("微信") ||
      contactText.includes("聊天") ||
      contactText.includes("消息") ||
      contactText.includes("发送") ||
      contactText.includes("發送") ||
      contactText.includes("send") ||
      contactText.includes("message") ||
      contactText.includes("contact"))
  );
}

function violatesContactPressureRemoval(text) {
  const source = String(text || "").toLowerCase();
  const blockerSignals = [
    "打开微信",
    "打開微信",
    "打开聊天",
    "打開聊天",
    "打开 chat",
    "open wechat",
    "open the chat",
    "open chat",
    "发送",
    "發送",
    "发消息",
    "發消息",
    "send",
    "测试对方",
    "測試對方",
    "test the other",
    "勇敢面对",
    "勇敢面對",
    "bravely face"
  ];

  return blockerSignals.some((signal) => source.includes(signal));
}

function normalizeRootCause(value) {
  return [
    "unclear_output",
    "too_large",
    "emotional_pressure",
    "social_pressure",
    "perfectionism",
    "physical_low_energy",
    "value_uncertainty"
  ].includes(value)
    ? value
    : "";
}

function normalizeSecondaryRootCause(value, primary) {
  if (value === null || value === undefined || value === primary) {
    return null;
  }

  return normalizeRootCause(value) || null;
}

function normalizeStringArray(value, min, max) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, Math.max(min, max));
}

function mergeStringArrays(...values) {
  const merged = [];

  for (const value of values) {
    for (const item of normalizeStringArray(value, 0, 8)) {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    }
  }

  return merged;
}

function normalizeStrategyName(value, rootCause) {
  const strategyMap = {
    unclear_output: "output_clarification",
    too_large: "micro_start",
    emotional_pressure: "pressure_source_removal",
    social_pressure: "safe_draft_before_contact",
    perfectionism: "low_quality_draft",
    physical_low_energy: "energy_saving_restart",
    value_uncertainty: "minimum_value_check"
  };
  const allowed = [
    "safe_draft_before_contact",
    "low_quality_draft",
    "first_physical_action",
    "minimum_value_check",
    "output_clarification",
    "energy_saving_restart",
    "pressure_source_removal",
    "micro_start"
  ];

  return allowed.includes(value) ? value : strategyMap[rootCause] || "micro_start";
}

function getDefaultRecoveryActionType(rootCause) {
  const actionMap = {
    unclear_output: "write",
    too_large: "prepare",
    emotional_pressure: "write",
    social_pressure: "write",
    perfectionism: "write",
    physical_low_energy: "move",
    value_uncertainty: "decide"
  };

  return actionMap[rootCause] || "prepare";
}

function getDefaultPressureReduced(rootCause) {
  const pressureMap = {
    unclear_output: ["output_uncertainty"],
    too_large: ["task_size"],
    emotional_pressure: ["emotional_pressure"],
    social_pressure: ["social_exposure"],
    perfectionism: ["quality_pressure"],
    physical_low_energy: ["physical_energy_cost"],
    value_uncertainty: ["value_uncertainty"]
  };

  return pressureMap[rootCause] || ["task_size"];
}

function normalizePressureReduced(value, rootCause) {
  const pressure = [];

  for (const item of normalizeStringArray(value, 0, 6)) {
    const normalized = normalizePressureType(item);

    if (normalized && !pressure.includes(normalized)) {
      pressure.push(normalized);
    }
  }

  if (pressure.length > 0) {
    return pressure;
  }

  return getDefaultPressureReduced(rootCause);
}

function normalizeRecoveryActionShiftTo({
  actionShiftTo,
  strategyName,
  context,
  diagnosis,
  avoid
}) {
  if (diagnosis?.primary_root_cause !== "physical_low_energy") {
    return actionShiftTo;
  }

  if (
    isPhysicalResumePointPlan({ strategyName, diagnosis, context }) &&
    (requiresStandingOrMoving(actionShiftTo) ||
      avoidForbidsStandingOrMoving(avoid))
  ) {
    return getPhysicalResumePointActionShiftTo(context);
  }

  return actionShiftTo;
}

function normalizeRecoveryActionType({
  actionType,
  strategyName,
  actionShiftTo,
  diagnosis
}) {
  if (diagnosis?.primary_root_cause !== "physical_low_energy") {
    return actionType;
  }

  if (
    strategyName === "first_physical_action" &&
    !isPhysicalResumePointText(actionShiftTo)
  ) {
    return "move";
  }

  if (isPhysicalResumePointText(actionShiftTo)) {
    return "prepare";
  }

  return actionType;
}

function isPhysicalResumePointPlan({ strategyName, diagnosis, context }) {
  const source = [
    strategyName,
    diagnosis?.recovery_direction || "",
    context?.currentStep?.step_text || "",
    context?.user_utterance || ""
  ]
    .join(" ")
    .toLowerCase();

  return (
    strategyName === "energy_saving_restart" ||
    source.includes("resume") ||
    source.includes("restore") ||
    source.includes("save") ||
    source.includes("later") ||
    source.includes("pause") ||
    source.includes("\u6062\u590d") ||
    source.includes("\u4fdd\u5b58") ||
    source.includes("\u7a0d\u540e") ||
    source.includes("\u66f4\u665a") ||
    source.includes("\u6682\u505c") ||
    source.includes("\u51fa\u95e8") ||
    source.includes("\u6362\u978b")
  );
}

function getPhysicalResumePointActionShiftTo(context) {
  const stepText = String(context?.currentStep?.step_text || "current step");

  return `Save a resume point for "${stepText}" without standing up, walking, moving items, or completing the original action now.`;
}

function isPhysicalResumePointText(text) {
  const source = String(text || "").toLowerCase();

  return (
    source.includes("resume point") ||
    source.includes("without standing") ||
    source.includes("\u6062\u590d\u5165\u53e3") ||
    source.includes("\u4fdd\u5b58\u6062\u590d") ||
    source.includes("\u4fdd\u5b58\u8fdb\u5ea6")
  );
}

function requiresStandingOrMoving(text) {
  const source = String(text || "").toLowerCase();
  const movementSignals = [
    "stand",
    "walk",
    "move",
    "go to",
    "put the shoes",
    "place the shoes",
    "\u7ad9\u8d77",
    "\u8d77\u6765",
    "\u8d70",
    "\u8d70\u5230",
    "\u51fa\u95e8",
    "\u6362\u978b",
    "\u7a7f\u978b",
    "\u653e\u5728\u95e8\u53e3",
    "\u62ff",
    "\u79fb\u52a8",
    "\u79fb\u52d5"
  ];

  return movementSignals.some((signal) => source.includes(signal));
}

function avoidForbidsStandingOrMoving(avoid) {
  const source = normalizeStringArray(avoid, 0, 8)
    .join(" ")
    .toLowerCase();
  const forbidSignals = [
    "do not require standing",
    "do not require walking",
    "do not require moving",
    "do not ask the user to stand",
    "do not ask the user to move",
    "\u4e0d\u8981\u8981\u6c42\u7528\u6237\u7ad9\u8d77",
    "\u4e0d\u8981\u8981\u6c42\u7528\u6237\u8d70\u52a8",
    "\u4e0d\u8981\u8981\u6c42\u7528\u6237\u79fb\u52a8",
    "\u4e0d\u8981\u6c42\u7ad9\u7acb",
    "\u4e0d\u8981\u6c42\u79fb\u52a8",
    "\u4e0d\u8981\u7ad9\u8d77",
    "\u4e0d\u8981\u8d70\u52a8",
    "\u4e0d\u8981\u79fb\u52a8",
    "\u4e0d\u8981\u7acb\u5373\u51fa\u95e8"
  ];

  return forbidSignals.some((signal) => source.includes(signal));
}

function normalizePressureType(value) {
  if (PRESSURE_TYPES.includes(value)) {
    return value;
  }

  const text = String(value || "").toLowerCase();

  if (text.includes("emotion") || text.includes("情绪")) {
    return "emotional_pressure";
  }

  if (text.includes("social") || text.includes("社交") || text.includes("发送")) {
    return "social_exposure";
  }

  if (text.includes("output") || text.includes("unclear") || text.includes("产出")) {
    return "output_uncertainty";
  }

  if (text.includes("size") || text.includes("large") || text.includes("复杂")) {
    return "task_size";
  }

  if (text.includes("quality") || text.includes("perfect") || text.includes("质量")) {
    return "quality_pressure";
  }

  if (text.includes("energy") || text.includes("physical") || text.includes("身体")) {
    return "physical_energy_cost";
  }

  if (text.includes("value") || text.includes("worth") || text.includes("价值")) {
    return "value_uncertainty";
  }

  if (text.includes("decision") || text.includes("选择")) {
    return "decision_cost";
  }

  return "";
}

function shouldRemovePressureSource(rootCause) {
  return rootCause === "emotional_pressure" || rootCause === "social_pressure";
}

function getDefaultStrategyGoal(diagnosis) {
  return `Reduce ${diagnosis?.primary_root_cause || "the blocker"} while preserving the original task goal.`;
}

function getDefaultRecoveryPrinciple(diagnosis) {
  return (
    diagnosis?.recovery_direction ||
    "Lower the current blocker before asking the user to continue execution."
  );
}

function getDefaultActionShiftTo(context, diagnosis) {
  const rootCause = diagnosis?.primary_root_cause;
  const stepText = context?.currentStep?.step_text || "the current step";

  if (rootCause === "emotional_pressure" || rootCause === "social_pressure") {
    return `Do not contact anyone yet; write a private, unsent draft related to: ${stepText}`;
  }

  if (rootCause === "perfectionism") {
    return `Create a rough, low-quality draft for: ${stepText}`;
  }

  if (rootCause === "physical_low_energy") {
    return `Do one low-energy setup action and preserve the resume point for: ${stepText}`;
  }

  if (rootCause === "value_uncertainty") {
    return `Write one reason to continue and one cost to watch before doing: ${stepText}`;
  }

  return `Clarify the smallest visible output for: ${stepText}`;
}

export default router;
