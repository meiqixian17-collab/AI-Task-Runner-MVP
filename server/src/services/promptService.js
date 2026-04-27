export function generateFirstStepPrompt(input) {
  const context = normalizeGenerationInput(input);

  return `
User task:

${context.task}

Task context JSON:
${JSON.stringify(context.taskContext, null, 2)}

Latest clarification answer:
${context.clarificationAnswer || "None"}

Completed steps:
${formatStepHistory(context.stepHistory)}

Generate the single best step the user should execute right now.

Rules:
1. Return only valid JSON for one Step object.
2. The Step type must be either "clarification" or "action".
3. If information is insufficient for a specific, low-barrier, immediately executable action, return a clarification Step.
4. A clarification Step asks exactly one most important question.
5. Use clarification when the goal is too broad, the task object is missing, current state is missing, constraints are missing, or the task is an unscoped life/decision question.
6. If enough information exists, return an action Step.
7. Action content must be concrete and observable. Do not output vague actions like "先明确你的目标", "先整理你的想法", "先规划一下", "先查找相关资料", "先思考你想要什么", "先制定一个计划", or "先了解一下相关内容".
8. If the task is already complete, start with [TASK_DONE] and briefly say it is complete.
9. Respond in the same language as the user's task.

Return exactly one of these shapes:
{
  "type": "clarification",
  "title": "需要补充一个信息",
  "content": "我需要先确认一个信息，才能给你具体的下一步。",
  "question": "one question",
  "placeholder": "short example",
  "reason": "missing information"
}

{
  "type": "action",
  "title": "当前步骤",
  "content": "one concrete action",
  "estimated_effort": "low"
}
`.trim();
}

export function generateNextStepPrompt(input) {
  const context = normalizeGenerationInput(input);

  return `
Original task:

${context.task}

Task context JSON:
${JSON.stringify(context.taskContext, null, 2)}

Latest clarification answer:
${context.clarificationAnswer || "None"}

Completed steps:

${formatStepHistory(context.stepHistory)}

${formatDuplicateRetryContext(context)}

Based on the original task and completed steps, generate the next single action the user should execute right now.

Rules:
1. Return only valid JSON for one Step object.
2. The Step type must be either "clarification" or "action".
3. Do not repeat a completed step.
4. If information is still insufficient, return a clarification Step and ask exactly one question.
5. If enough information exists, return an action Step.
6. Action content must be concrete and observable. Do not output vague actions like "先明确你的目标", "先整理你的想法", "先规划一下", "先查找相关资料", "先思考你想要什么", "先制定一个计划", or "先了解一下相关内容".
7. Do not explain theory or provide a long plan.
8. If the task is complete, start with [TASK_DONE] and briefly say it is complete.
9. Respond in the same language as the user's task.
10. When duplicate retry context is present, continue from the previous completed step. The new action must feel like the next natural task-progress step, not a generic fallback or restart.

Return the same JSON shape as generate-first-step.
`.trim();
}

function normalizeGenerationInput(input) {
  if (typeof input === "string") {
    return {
      task: input,
      taskContext: {},
      clarificationAnswer: "",
      stepHistory: []
    };
  }

  return {
    task: String(input?.task || "").trim(),
    taskContext:
      input?.taskContext && typeof input.taskContext === "object"
        ? input.taskContext
        : {},
    clarificationAnswer: String(input?.clarificationAnswer || "").trim(),
    stepHistory: Array.isArray(input?.stepHistory)
      ? input.stepHistory.map((step) => getReadableStepText(step)).filter(Boolean)
      : [],
    retryReason: String(input?.retryReason || "").trim(),
    rejectedStep: getReadableStepText(input?.rejectedStep),
    previousStep: getReadableStepText(input?.previousStep)
  };
}

function formatStepHistory(stepHistory) {
  if (!stepHistory.length) {
    return "No completed steps yet.";
  }

  return stepHistory.map((step, index) => `${index + 1}. ${step}`).join("\n");
}

function formatDuplicateRetryContext(context) {
  if (context.retryReason !== "duplicate_step") {
    return "";
  }

  return `
Duplicate retry context:
- The previous model output was rejected because it repeated an already completed step.
- Rejected duplicate step: ${context.rejectedStep || "Unknown"}
- Previous completed step to continue from: ${context.previousStep || "Unknown"}

Retry instruction:
Generate a new action step that directly continues from the previous completed step. Preserve the user's original task and current task context. Do not restart the task. Do not output a generic fallback such as opening related tools, writing the smallest action, clarifying goals, or making a plan. The user should feel the task is continuing smoothly.
`.trim();
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

export function generateResistanceDiagnosisPrompt(context) {
  return `
You are the AI Diagnosis Layer for a task-start and task-progress system.

Diagnose why the user is stuck inside this task. Use the full context, not only user_utterance.

Context JSON:
${JSON.stringify(context, null, 2)}

Allowed surface_resistance values:
- too_hard
- dont_want
- not_sure
- bad_state

Allowed root cause values:
- unclear_output
- too_large
- emotional_pressure
- social_pressure
- perfectionism
- physical_low_energy
- value_uncertainty

Rules:
1. user_utterance has higher priority than risk_flags.
2. risk_flags are only reference signals. Do not choose a root cause only because a risk flag exists.
3. Separate surface_resistance from primary_root_cause.
4. Choose exactly one primary_root_cause.
5. secondary_root_cause must be one allowed root cause or null. Do not force it.
6. evidence must contain 2 to 4 items, all grounded in the provided context.
7. excluded_causes must contain at least 1 item.
8. Do not infer personality, long-term psychology, childhood, trauma, or deep motives.
9. Only do task-internal diagnosis.
10. Do not generate a fallback_step or executable user step.
11. recovery_direction is a direction for later planning, not a final instruction.
12. If context is insufficient, set confidence to low and choose a conservative recovery_direction.
13. Surface mapping: phrases like "I don't know what to write", "I don't know where to start", "my mind is messy", "不知道怎么写", "不知道从哪里开始", "不知道该从哪个角度", or "脑子很乱" mean surface_resistance "too_hard", not "not_sure".
14. Surface mapping: use "not_sure" only when the user questions whether the task is worth continuing, whether it has value, or whether to continue.
15. For emotional_pressure or social_pressure in contact/message contexts, recovery_direction must remove direct contact/send/open-chat pressure. Do not suggest opening the chat, sending, testing the other person's reaction, or bravely facing it.

Additional P0 rules:
- If the user says they do not know what to write/say/do, where to start, which angle to use, which content to include, or that their mind is messy, choose surface_resistance "too_hard", not "not_sure".
- Choose "not_sure" only when the user questions task value, usefulness, payoff, whether it is worth continuing, or whether to continue at all.
- For emotional_pressure or social_pressure in contact/message contexts, recovery_direction must remove direct contact/send/open-chat pressure. Do not suggest opening the chat, sending, testing the other person's reaction, or bravely facing it. Prefer a safe private unsent draft direction.

Return only valid JSON in this exact shape:
{
  "surface_resistance": "too_hard | dont_want | not_sure | bad_state",
  "primary_root_cause": "unclear_output | too_large | emotional_pressure | social_pressure | perfectionism | physical_low_energy | value_uncertainty",
  "secondary_root_cause": "unclear_output | too_large | emotional_pressure | social_pressure | perfectionism | physical_low_energy | value_uncertainty | null",
  "user_state_summary": "one sentence",
  "evidence": ["2 to 4 context-grounded strings"],
  "excluded_causes": [
    {
      "cause": "string",
      "reason": "string"
    }
  ],
  "confidence": "low | medium | high",
  "recovery_direction": "string",
  "avoid": ["at least 2 strings"]
}
`.trim();
}

export function generateRecoveryPlanningPrompt({ context, diagnosis }) {
  return `
You are the AI Recovery Planning Layer for a task-start and task-progress system.

Create a structured recoveryPlan from the existing diagnosis. Do not re-diagnose the user. Do not generate a final fallback_step or user-visible message.

Input JSON:
${JSON.stringify({ context, diagnosis }, null, 2)}

Rules:
1. Inherit the diagnosis. Do not overturn primary_root_cause.
2. primary_root_cause is the first basis for strategy selection.
3. secondary_root_cause may only adjust the strategy.
4. diagnosis.avoid is a hard constraint. Preserve those avoid items and add more if useful.
5. If the diagnosis seems contradictory, set diagnosis_warning, but still plan from the given diagnosis.
6. action_shift.from must come from currentStep.step_text.
7. action_shift.to must reduce resistance while preserving the original task goal.
8. Do not make every case a micro_start. Match strategy_name to primary_root_cause.
9. Keep fallback_step_requirements concrete for later generation.
10. completion_boundary_required and must_preserve_goal must be true.
11. Do not infer personality, long-term psychology, childhood, trauma, or deep motives.
12. Return only valid JSON.

Strategy guidance:
- unclear_output: strategy_name "output_clarification"; clarify the smallest output, first sentence, option, or structure.
- too_large: strategy_name "micro_start" or "first_physical_action"; keep only the first smallest action.
- emotional_pressure: strategy_name "pressure_source_removal" or "safe_draft_before_contact"; remove direct exposure to the pressure source.
- social_pressure: strategy_name "safe_draft_before_contact"; reduce social exposure with a draft that is not sent.
- perfectionism: strategy_name "low_quality_draft"; lower quality standards and avoid showing/publishing.
- physical_low_energy: strategy_name "energy_saving_restart" or "first_physical_action"; reduce body cost and preserve a resume point. If the plan preserves a resume point or says not to stand/move, action_shift.to must not ask the user to stand, walk, go out, put shoes by the door, move objects, or complete the original physical action.
- value_uncertainty: strategy_name "minimum_value_check"; do not force execution; run a small value check.

Allowed action_type values:
open, write, select, prepare, contact, move, review, decide

Allowed estimated_effort values:
low, medium

Allowed pressure_reduced values:
emotional_pressure, social_exposure, output_uncertainty, task_size, quality_pressure, physical_energy_cost, value_uncertainty, decision_cost

Return exactly this JSON shape:
{
  "based_on": {
    "primary_root_cause": "string",
    "secondary_root_cause": "string or null",
    "recovery_direction": "string",
    "key_evidence": ["2 to 3 strings from diagnosis.evidence"]
  },
  "strategy_name": "string",
  "strategy_goal": "string",
  "recovery_principle": "string",
  "action_shift": {
    "from": "string from currentStep.step_text",
    "to": "string"
  },
  "pressure_reduced": ["at least 1 allowed pressure_reduced value"],
  "target_user_state": "string",
  "avoid": ["at least 2 strings, preserving diagnosis.avoid"],
  "fallback_step_requirements": {
    "action_type": "open | write | select | prepare | contact | move | review | decide",
    "estimated_effort": "low | medium",
    "completion_boundary_required": true,
    "must_preserve_goal": true,
    "should_remove_pressure_source": true,
    "should_avoid_original_blocker": true
  },
  "diagnosis_warning": null
}
`.trim();
}

export function generateFallbackStepPrompt({
  context,
  diagnosis,
  recoveryPlan,
  validationFeedback
}) {
  return `
You are the AI Fallback Step Generation Layer for a task-start and task-progress system.

Generate exactly one structured fallback_step from the recoveryPlan. Do not re-diagnose the user. Do not change the strategy. Do not generate multiple options.

Input JSON:
${JSON.stringify({ context, diagnosis, recoveryPlan, validationFeedback }, null, 2)}

Core principle:
Internal structure, user-facing natural language. step_text and completion_criteria should be concrete, low-pressure, and conversational.

Rules:
1. Inherit recoveryPlan. Do not violate recoveryPlan.avoid.
2. Follow recoveryPlan.action_shift.to. Do not return to recoveryPlan.action_shift.from or the original blocker.
3. Generate one specific action only.
4. Do not use vague phrases like "organize your thoughts", "optimize", "prepare fully", "adjust your mindset", "try maybe", or "you can try".
5. completion_criteria must make it obvious when the user can click completion.
6. If recoveryPlan removes a pressure source, completion_criteria must not include that pressure source.
7. Do not expose root_cause labels to the user.
8. user_visible_reason must be one short sentence explaining why this step is easier.
9. estimated_effort must be low or medium, preferably low, and never imply more than 5 minutes.
10. risk_flags should describe the new fallback_step, not copy currentStep.risk_flags blindly.
11. Return only valid JSON.

Strategy rules:
- safe_draft_before_contact: write an unsent private draft. Do not open chat apps, contact, or send. completion_criteria must say no sending is needed.
- low_quality_draft: make a rough low-quality draft or placeholder. Do not optimize, polish, improve, publish, or seek references.
- output_clarification: define one small output, first sentence, one angle, or one selection. Do not ask for full planning.
- micro_start / first_physical_action: one smallest starter action, usually within 30 seconds, without completing the original step.
- energy_saving_restart: reduce body cost. If recoveryPlan.action_shift.to is a resume point without movement, do not ask the user to stand, walk, move objects, put shoes somewhere, go out, or complete the original physical action.
- minimum_value_check: do a low-cost value check. Do not continue the original execution, and do not decide for the user.

Allowed action_type values:
open, write, select, prepare, contact, move, review, decide

Allowed estimated_effort values:
low, medium

Allowed stage values:
start, clarify, execute, review, finish

Return exactly this JSON shape:
{
  "fallback_step": {
    "step_text": "string",
    "completion_criteria": "string",
    "action_type": "open | write | select | prepare | contact | move | review | decide",
    "estimated_effort": "low | medium",
    "stage": "start | clarify | execute | review | finish",
    "risk_flags": ["string"],
    "user_visible_reason": "one short sentence"
  }
}
`.trim();
}
