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

${formatDuplicateRetryContext(context)}

Generate the single best step the user should execute right now.

Rules:
1. Return only valid JSON for one Step object.
2. The Step type must be either "clarification" or "action".
3. Do not wrap the Step object inside another object. Return { "type": ... } directly, not { "step": { ... } }.
4. If information is insufficient for a specific, low-barrier, immediately executable action, return a clarification Step.
5. A clarification Step asks exactly one most important question.
6. Use clarification when the goal is too broad, the task object is missing, current state is missing, constraints are missing, or the task is an unscoped life/decision question.
7. If enough information exists, return an action Step.
8. Treat Latest clarification answer and Task context JSON as already provided context.
9. If the task text, taskContext, or latest clarification answer already contains the missing information, do not ask for it again.
10. Do not ask a clarification question that repeats an already answered clarification. Generate an action Step instead.
11. Action content must be concrete and observable. Do not output vague actions like "先明确你的目标", "先整理你的想法", "先规划一下", "先查找相关资料", "先思考你想要什么", "先制定一个计划", or "先了解一下相关内容".
12. If the task is already complete, start with [TASK_DONE] and briefly say it is complete.
13. Respond in the same language as the user's task.
14. Clarification questions must collect text only.
15. A clarification Step must ask exactly one question for one missing fact. Do not ask multiple questions or request a bundle of fields.
16. A clarification Step must not ask the user to write, draft, list, prepare, complete, or edit external task output. If the user should do work in a document, app, website, or real-world context, return an action Step instead.
17. If several facts are missing, ask only the first blocking question.
18. An action Step must not ask the user to reply to this system, answer this system, tell you information, or provide information to this system. If the system needs information from the user, return a clarification Step.
19. Action Steps must include action_type, stage, task_object, expected_output, progress_intent, and completion_criteria. These fields are for progress tracking and should be specific, stable, and short.
20. action_type must be exactly one of: open, write, select, prepare, contact, move, review, decide. Do not invent values such as sketch, create, or design.
21. stage must be exactly one of: start, clarify, execute, review, finish. Do not invent values such as concept_sketch.
22. task_object and progress_intent must be short stable labels, not full user-facing sentences. Put the user-visible action only in content.

${formatNonTextMaterialBoundary()}

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
  "action_type": "open | write | select | prepare | contact | move | review | decide",
  "stage": "start | clarify | execute | review | finish",
  "task_object": "short stable object being changed or produced",
  "expected_output": "specific visible output or completion boundary",
  "progress_intent": "short stable intent label, e.g. define_logo_main_shape",
  "completion_criteria": "what makes this step done",
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
3. Do not wrap the Step object inside another object. Return { "type": ... } directly, not { "step": { ... } }.
4. Do not repeat, paraphrase, summarize, or lightly rewrite any completed step.
5. A valid next step must create a clear progress delta from the latest completed step.
6. The progress delta should usually move one stage forward, for example: from opening/finding something to selecting the target item; from selecting something to writing/filling one concrete part; from writing/filling to checking one specific detail; from checking to sending/submitting/finishing; from planning to doing one visible action.
7. Prefer a safe, low-barrier, text-executable next action. Return a clarification Step only when missing information would make the next action unsafe, non-specific, or dependent on key information the user has not provided.
8. If enough information exists, return an action Step.
9. Treat Latest clarification answer and Task context JSON as already provided context.
10. If the task text, taskContext, or latest clarification answer already contains the missing information, do not ask for it again.
11. Do not ask a clarification question that repeats an already answered clarification. Generate an action Step instead.
12. Action content must be concrete and observable. Do not output vague actions like "先明确你的目标", "先整理你的想法", "先规划一下", "先查找相关资料", "先思考你想要什么", "先制定一个计划", or "先了解一下相关内容".
13. Do not explain theory or provide a long plan.
14. If the completed steps already close the task or there is no meaningful next action, start with [TASK_DONE] and briefly say it is complete.
15. Respond in the same language as the user's task.
16. When duplicate retry context is present, continue from the previous completed step. The new action must feel like the next natural task-progress step, not a generic fallback or restart.
17. Clarification questions must collect text only.
18. A clarification Step must ask exactly one question for one missing fact. Do not ask multiple questions or request a bundle of fields.
19. A clarification Step must not ask the user to write, draft, list, prepare, complete, or edit external task output. If the user should do work in a document, app, website, or real-world context, return an action Step instead.
20. If several facts are missing, ask only the first blocking question.
21. An action Step must not ask the user to reply to this system, answer this system, tell you information, or provide information to this system. If the system needs information from the user, return a clarification Step.
22. Action Steps must include action_type, stage, task_object, expected_output, progress_intent, and completion_criteria. These fields are for progress tracking and should be specific, stable, and short.
23. action_type must be exactly one of: open, write, select, prepare, contact, move, review, decide. Do not invent values such as sketch, create, or design.
24. stage must be exactly one of: start, clarify, execute, review, finish. Do not invent values such as concept_sketch.
25. task_object and progress_intent must be short stable labels, not full user-facing sentences. Put the user-visible action only in content.

${formatNonTextMaterialBoundary()}

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
    previousStep: getReadableStepText(input?.previousStep),
    duplicateRetryCount: normalizeRetryCount(input?.duplicateRetryCount),
    rejectedSteps: Array.isArray(input?.rejectedSteps)
      ? input.rejectedSteps
          .map((step) => getReadableStepText(step))
          .filter(Boolean)
      : [],
    recentCompletedSteps: Array.isArray(input?.recentCompletedSteps)
      ? input.recentCompletedSteps
          .map((step) => getReadableStepText(step))
          .filter(Boolean)
      : []
  };
}

function formatStepHistory(stepHistory) {
  if (!stepHistory.length) {
    return "No completed steps yet.";
  }

  return stepHistory.map((step, index) => `${index + 1}. ${step}`).join("\n");
}

function formatNonTextMaterialBoundary() {
  return `
Non-text material boundary:
- This system can receive text only. It cannot receive or inspect photos, screenshots, images, audio, recordings, files, PDFs, Word documents, spreadsheets, attachments, uploads, or pasted non-text material.
- Never ask the user to upload, attach, paste, send, show, or provide non-text material to this system.
- Clarification questions must be answerable by typing text only. If the missing information is inside a file, image, screenshot, recording, or attachment, ask the user to type the one smallest detail needed from it.
- External task actions are allowed only when the destination is outside this system, such as a school website, email app, application form, chat app, camera app, or the user's local files.
- Allowed external/local actions: "Open the local file and read the title", "Upload the required PDF to the application website", "Take a photo for the target platform", "Look at the screenshot and type the date shown".
- Forbidden system-input requests: "upload the file", "send me a screenshot", "paste the image here", "show me the document", "provide the attachment", "把截图发给我", "上传文件", "把照片给我看", "粘贴图片".
- Replacement patterns: for documents, ask for the target role, deadline, section name, file name, or one plain-text sentence; for screenshots/images, ask for the visible issue or key text typed out; for forms/applications, ask for the field label or missing item typed out; for design/portfolio tasks, ask for project name, audience, style keywords, or one visible detail in text; for audio/recordings, ask for a short typed summary or one sentence.
`.trim();
}

function formatDuplicateRetryContext(context) {
  if (context.retryReason === "duplicate_step") {
    return `
Duplicate retry context:
- The previous model output was rejected because it was too similar to an already completed step.
- Duplicate retry attempt: ${context.duplicateRetryCount || 1}
- Rejected step: ${context.rejectedStep || "Unknown"}
- Latest completed step to continue from: ${context.previousStep || "Unknown"}
- Recent completed steps to avoid rewriting:
${formatStepHistory(context.recentCompletedSteps)}
- Rejected steps from this retry round to avoid:
${formatStepHistory(context.rejectedSteps)}

Retry instruction:
Generate a replacement step that continues smoothly from the latest completed step, avoids both completed history and rejected retry candidates, and creates a new progress_delta.

Important:
1. The rejected step may contain useful task context. Preserve its relevant task object, but do not reuse its action.
2. Avoid recentCompletedSteps: do not make the user repeat an action they already completed.
3. Avoid rejectedSteps: do not repeat a failed candidate direction from this retry round.
4. Continue naturally from previousStep. Do not jump to an unrelated task or create a context break.
5. You must create a new progress_delta: change the action, stage, task_object, or expected_output being handled.
${formatEscalatedDuplicateRetryInstruction(context.duplicateRetryCount)}
6. Do not output a generic fallback such as opening related tools, writing the smallest action, clarifying goals, or making a plan unless that is genuinely the next new progress point.
7. If the rejected step was actually a natural final action and no further action is needed, return [TASK_DONE].
8. The user should feel the task continues from the previous step, not restarts.
9. If you return JSON instead of [TASK_DONE], include two internal self-check fields:
   - progress_delta: one short sentence explaining what concretely advances beyond the latest completed step.
   - why_not_duplicate: one short sentence explaining why this is not a repeat, paraphrase, or light rewrite of the rejected step or recent completed steps.

Duplicate retry return shape:
{
  "type": "action",
  "title": "当前步骤",
  "content": "one concrete action that creates the progress_delta",
  "action_type": "open | write | select | prepare | contact | move | review | decide",
  "stage": "start | clarify | execute | review | finish",
  "task_object": "short stable object being changed or produced",
  "expected_output": "specific visible output or completion boundary",
  "progress_intent": "short stable intent label",
  "completion_criteria": "what makes this step done",
  "estimated_effort": "low",
  "progress_delta": "what changes from the latest completed step",
  "why_not_duplicate": "why this is not a repeat"
}
`.trim();
  }

  if (context.retryReason === "unsupported_non_text_input_request") {
    return `
Unsupported non-text input retry context:
- The previous model output was rejected because it asked the user to provide, upload, send, paste, or show non-text material to this system.
- Rejected step/question: ${context.rejectedStep || "Unknown"}
- Previous completed step to continue from: ${context.previousStep || "Unknown"}

Retry instruction:
Generate a replacement step that preserves the same task goal and task object, but changes the input channel to text-only.

Important:
1. Do not discard the task context or restart the task.
2. Do not ask for uploads, screenshots, images, files, attachments, recordings, or pasted non-text material.
3. If the rejected step needed information from a file, image, screenshot, recording, or attachment, ask the user to type only the smallest needed detail from it.
4. If the user needs to handle a file externally, phrase it as a local or external-platform action, not as material sent to this system.
5. Keep the replacement as the next natural task-progress step.
`.trim();
  }

  return "";
}

function normalizeRetryCount(value) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return Math.floor(count);
}

function formatEscalatedDuplicateRetryInstruction(duplicateRetryCount) {
  if (normalizeRetryCount(duplicateRetryCount) < 2) {
    return "";
  }

  return "- Because this is the second-or-later duplicate retry, you must change at least one key dimension from the rejected candidates: action_type, task_object, expected_output, or stage.";
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
12. fallback_step must not ask the user to reply to this system, answer this system, tell you information, or provide information to this system.
13. Follow the non-text material boundary below.

${formatNonTextMaterialBoundary()}

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

export function generateResistanceResolutionPrompt(context) {
  return `
You are the AI Resistance Resolution Layer for a task-start and task-progress system.

Resolve the user's current stuck point in one pass. Return diagnosis, recoveryPlan, and one fallback_step.

Context JSON:
${JSON.stringify(context, null, 2)}

${formatDuplicateRetryContext(context)}

Core rules:
1. Diagnose only task-internal resistance. Do not infer personality, long-term psychology, childhood, trauma, or deep motives.
2. The recoveryPlan must inherit the diagnosis and must not overturn primary_root_cause.
3. The fallback_step must follow the recoveryPlan, preserve the original task goal, and reduce resistance.
4. Generate one specific user-visible action only. Do not generate multiple options or a large multi-step plan.
5. step_text and completion_criteria must be concrete, low-pressure, conversational, and easy to know when done.
6. Do not expose root_cause labels to the user.
7. Do not use vague phrases like "organize your thoughts", "optimize", "prepare fully", "adjust your mindset", "try maybe", or "you can try".
8. estimated_effort must be low or medium, preferably low, and never imply more than 5 minutes.
9. Return only valid JSON.
10. fallback_step must not ask the user to reply to this system, answer this system, tell you information, or provide information to this system.
11. Follow the non-text material boundary below.

${formatNonTextMaterialBoundary()}

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

Allowed strategy guidance:
- unclear_output: strategy_name "output_clarification"; clarify the smallest output, first sentence, option, or structure.
- too_large: strategy_name "micro_start" or "first_physical_action"; keep only the first smallest action.
- emotional_pressure: strategy_name "pressure_source_removal" or "safe_draft_before_contact"; remove direct exposure to the pressure source.
- social_pressure: strategy_name "safe_draft_before_contact"; reduce social exposure with a draft that is not sent.
- perfectionism: strategy_name "low_quality_draft"; lower quality standards and avoid showing/publishing.
- physical_low_energy: strategy_name "energy_saving_restart" or "first_physical_action"; reduce body cost and preserve a resume point.
- value_uncertainty: strategy_name "minimum_value_check"; do not force execution; run a small value check.

Hard safety constraints:
- If the user says they do not know what to write/say/do, where to start, which angle to use, which content to include, or that their mind is messy, choose surface_resistance "too_hard", not "not_sure".
- Use "not_sure" only when the user questions task value, usefulness, payoff, whether it is worth continuing, or whether to continue at all.
- For emotional_pressure or social_pressure in contact/message contexts, recoveryPlan and fallback_step must remove direct contact/send/open-chat pressure. Do not suggest opening the chat, sending, testing the other person's reaction, or bravely facing it. Prefer a safe private unsent draft.
- For physical_low_energy, if the plan preserves a resume point or says not to stand/move, fallback_step must not ask the user to stand, walk, go out, put shoes by the door, move objects, or complete the original physical action.

Allowed action_type values:
open, write, select, prepare, contact, move, review, decide

Allowed estimated_effort values:
low, medium

Allowed pressure_reduced values:
emotional_pressure, social_exposure, output_uncertainty, task_size, quality_pressure, physical_energy_cost, value_uncertainty, decision_cost

Allowed stage values:
start, clarify, execute, review, finish

Return exactly this JSON shape:
{
  "diagnosis": {
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
  },
  "recoveryPlan": {
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
  },
  "fallback_step": {
    "step_text": "string",
    "completion_criteria": "string",
    "action_type": "open | write | select | prepare | contact | move | review | decide",
    "estimated_effort": "low | medium",
    "stage": "start | clarify | execute | review | finish",
    "risk_flags": ["0 to 4 allowed root cause values"],
    "user_visible_reason": "one short sentence"
  }
}
`.trim();
}
