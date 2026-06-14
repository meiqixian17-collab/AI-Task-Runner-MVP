import { resolveResistance } from "../src/resistancePipeline.mjs";

const cases = [
  // A. Emotional resistance
  ["A1", "情绪阻力", "回老师消息", "打开聊天框回复老师", ["social_pressure", "emotional_pressure"], "我怕一打开就被老师说", "dont_want", "emotional_pressure", "safe_draft"],
  ["A2", "情绪阻力", "向导师说明进度", "给导师发消息说明项目进度", ["social_pressure"], "我怕导师觉得我拖太久", "dont_want", "emotional_pressure", "safe_draft"],
  ["A3", "情绪阻力", "向朋友道歉", "给朋友发消息道歉", ["social_pressure"], "我怕更尴尬，也怕她不理我", "dont_want", "emotional_pressure", "safe_draft"],
  ["A4", "情绪阻力", "向同学催还钱", "发消息催同学还钱", ["social_pressure"], "我怕显得小气，还怕关系变僵", "dont_want", "emotional_pressure", "safe_draft"],
  ["A5", "情绪阻力", "向 HR 询问面试结果", "给 HR 发邮件询问面试结果", ["social_pressure"], "我怕显得很急，被 HR 讨厌", "dont_want", "emotional_pressure", "safe_draft"],
  ["A6", "情绪阻力", "向父母解释成绩", "给父母解释这次成绩", ["social_pressure"], "我怕他们骂我，说我没用", "dont_want", "emotional_pressure", "safe_draft"],
  ["A7", "情绪阻力", "给领导请假", "联系领导说明请假原因", ["social_pressure"], "我怕他觉得我又找借口", "dont_want", "emotional_pressure", "safe_draft"],
  ["A8", "情绪阻力", "拒绝别人的请求", "给对方发消息拒绝这件事", ["social_pressure"], "我怕她以后记恨我", "dont_want", "emotional_pressure", "safe_draft"],

  // B. Cognitive ambiguity
  ["B1", "认知模糊", "写论文", "分析数据并写讨论部分", ["unclear_output"], "我不知道这些数据到底说明什么", "too_hard", "unclear_output", "clarify_standard"],
  ["B2", "认知模糊", "做作品集", "选择一个项目放进作品集", ["unclear_output", "perfectionism"], "我不知道哪个项目拿得出手", "too_hard", "unclear_output", "clarify_standard"],
  ["B3", "认知模糊", "准备毕业设计", "规划毕业项目从哪块下手", ["unclear_output"], "我不知道从哪块开始做", "too_hard", "unclear_output", "clarify_standard"],
  ["B4", "认知模糊", "准备面试", "准备项目回答", ["unclear_output"], "我不知道面试官想听什么", "too_hard", "unclear_output", "clarify_standard"],
  ["B5", "认知模糊", "找实习", "浏览岗位并决定投递哪些岗位", ["unclear_output"], "岗位越看越乱，不知道自己能投什么", "too_hard", "unclear_output", "clarify_standard"],
  ["B6", "认知模糊", "制定学习计划", "制定下周学习计划", ["unclear_output"], "我不知道先学什么，感觉内容太多", "too_hard", "unclear_output", "clarify_standard"],
  ["B7", "认知模糊", "整理项目复盘", "整理项目复盘文档", ["unclear_output"], "我不知道复盘要写什么", "too_hard", "unclear_output", "clarify_standard"],
  ["B8", "认知模糊", "做竞品分析", "分析 3 个竞品并写结论", ["unclear_output"], "我越看越乱，不知道比较标准是什么", "too_hard", "unclear_output", "clarify_standard"],

  // C. Perfectionism
  ["C1", "完美主义阻力", "写简历", "写项目经历", ["perfectionism"], "我觉得太普通，拿不出手", "dont_want", "perfectionism", "low_quality_draft"],
  ["C2", "完美主义阻力", "做 PPT", "继续优化 PPT 结构", ["perfectionism"], "我想把结构想完美，不然做了也白做", "dont_want", "perfectionism", "low_quality_draft"],
  ["C3", "完美主义阻力", "写作品集项目介绍", "写项目介绍文字", ["perfectionism"], "我写得像废话，感觉很业余", "dont_want", "perfectionism", "low_quality_draft"],
  ["C4", "完美主义阻力", "发作品到社交平台", "发布作品到社交平台", ["social_pressure", "perfectionism"], "我怕别人觉得很装，也怕作品不够好", "dont_want", "emotional_pressure", "safe_draft"],
  ["C5", "完美主义阻力", "做汇报", "完善汇报稿", ["perfectionism"], "我总觉得不够高级，还想继续优化", "dont_want", "perfectionism", "low_quality_draft"],
  ["C6", "完美主义阻力", "写自我介绍", "写一段自我介绍", ["perfectionism"], "我怕像小学生，不专业", "dont_want", "perfectionism", "low_quality_draft"],
  ["C7", "完美主义阻力", "录制作品讲解", "录一段作品讲解视频", ["perfectionism", "social_pressure"], "我怕讲得太普通，被别人笑", "dont_want", "emotional_pressure", "safe_draft"],
  ["C8", "完美主义阻力", "修改设计稿", "继续优化设计稿细节", ["perfectionism"], "我想改到满意，不然不敢交", "dont_want", "perfectionism", "low_quality_draft"],

  // D. Physical/state resistance
  ["D1", "身体 / 状态阻力", "健身", "换好衣服出门训练", ["physical_low_energy"], "我胃不舒服，现在练肯定难受", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D2", "身体 / 状态阻力", "洗澡", "站起来去洗澡", ["physical_low_energy"], "我好困，站起来都烦", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D3", "身体 / 状态阻力", "整理房间", "先收拾桌面上的东西", ["physical_low_energy"], "我没电了，完全不想动", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D4", "身体 / 状态阻力", "出门拿快递", "穿鞋出门拿快递", ["physical_low_energy"], "头疼，不想出门", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D5", "身体 / 状态阻力", "打扫桌面", "把桌面垃圾清掉", ["physical_low_energy"], "我累到不想动手", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D6", "身体 / 状态阻力", "学习一小时", "打开资料学习一小时", ["physical_low_energy"], "我困得看不进去，脑子糊", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D7", "身体 / 状态阻力", "做饭", "站起来去厨房做饭", ["physical_low_energy"], "我胃不舒服，也不想站起来", "bad_state", "physical_low_energy", "pause_and_resume"],
  ["D8", "身体 / 状态阻力", "去图书馆", "收拾东西出门去图书馆", ["physical_low_energy"], "我太累了，不想出门", "bad_state", "physical_low_energy", "pause_and_resume"],

  // E. Value uncertainty
  ["E1", "价值怀疑", "继续考研", "继续刷今天的数学题", ["value_uncertainty"], "我错一堆，是不是根本没希望", "not_sure", "value_uncertainty", "value_check"],
  ["E2", "价值怀疑", "继续做这个项目", "继续写项目计划", ["value_uncertainty"], "这个项目是不是没意义，继续有什么用", "not_sure", "value_uncertainty", "value_check"],
  ["E3", "价值怀疑", "继续找实习", "继续投递 3 个岗位", ["value_uncertainty"], "投了也没反馈，是不是白费", "not_sure", "value_uncertainty", "value_check"],
  ["E4", "价值怀疑", "继续学习 AI", "继续看 AI 课程", ["value_uncertainty"], "我是不是在骗自己，根本学不会", "not_sure", "value_uncertainty", "value_check"],
  ["E5", "价值怀疑", "继续投简历", "继续投递简历", ["value_uncertainty"], "一直没回应，是不是该停", "not_sure", "value_uncertainty", "value_check"],
  ["E6", "价值怀疑", "继续准备比赛", "继续整理比赛方案", ["value_uncertainty"], "感觉没希望了，准备也是白费", "not_sure", "value_uncertainty", "value_check"],
  ["E7", "价值怀疑", "继续做作品集", "继续补作品集项目", ["value_uncertainty"], "做了也没人看，值不值得继续", "not_sure", "value_uncertainty", "value_check"],
  ["E8", "价值怀疑", "继续长期健身计划", "记录今天的训练数据", ["value_uncertainty"], "减脂一直没变化，继续有什么用", "not_sure", "value_uncertainty", "value_check"]
].map(([case_id, category, task, currentStep, risk_flags, user_utterance, expected_surface_resistance, expected_root_cause, expected_strategy]) => ({
  case_id,
  category,
  task,
  currentStep,
  risk_flags,
  user_utterance,
  expected_surface_resistance,
  expected_root_cause,
  expected_strategy
}));

const unsafeByStrategy = {
  safe_draft: ["打开微信", "打开聊天框", "发送", "联系对方", "发消息"],
  pause_and_resume: ["站起来", "出门", "运动", "继续学习", "继续写", "训练"],
  value_check: ["刷题", "投递", "联系", "发送", "继续做", "完成今天"],
  low_quality_draft: ["继续优化", "再检查", "修改到满意", "准备充分"],
  clarify_standard: ["打开页面", "打开文件", "整理思路", "准备一下"]
};

const semanticExpectations = {
  A5: {
    forbid: ["承认这件事给你带来的影响"],
    reason: "HR follow-up should not use apology/admission framing."
  },
  A6: {
    forbid: ["承认这件事给你带来的影响"],
    reason: "Explaining grades to parents should not use apology template by default."
  },
  B6: {
    forbid: ["数据", "支持或反驳"],
    reason: "Learning plan should not receive paper-data template."
  },
  B7: {
    forbid: ["面试官"],
    reason: "Project retrospective should not receive interview template."
  },
  B8: {
    forbid: ["面试官", "数据"],
    reason: "Competitive analysis should use comparison criteria, not interview/paper template."
  },
  C7: {
    forbid: ["备忘录里写一句"],
    reason: "Recording a work explanation needs private rehearsal/draft, not only one chat sentence."
  }
};

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function stripSafeNegations(text) {
  const safePhrases = [
    "先不要打开聊天框",
    "不要打开聊天框",
    "不打开聊天框",
    "先不要打开微信",
    "不要打开微信",
    "不打开微信",
    "先不要发送",
    "不要发送",
    "不需要发送",
    "不发送",
    "先不要发消息",
    "不要发消息",
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
    (current, phrase) => current.replaceAll(phrase, ""),
    text
  );
}

function scoreCase(testCase, result) {
  const step = result.fallback_step || {};
  const stepText = step.step_text || "";
  const criteria = step.completion_criteria || "";
  const mode = result.recovery_decision.recovery_mode;
  const root = result.diagnosis.root_cause;
  const surface = result.diagnosis.surface_resistance;
  const contextOk = result.context.task.title === testCase.task && result.context.current_step.step_text === testCase.currentStep;
  const rootOk = root === testCase.expected_root_cause;
  const strategyOk = mode === testCase.expected_strategy;
  const concrete = stepText.length > 8 && !includesAny(stepText, ["慢慢来", "别担心", "准备一下", "整理思路"]);
  const criteriaOk = criteria.length > 8 && includesAny(criteria, ["只要", "即可", "写出", "不需要", "不继续", "不发送", "暂停"]);
  const unsafe = includesAny(stripSafeNegations(stepText + criteria), unsafeByStrategy[mode] || []);
  const deviates = testCase.category !== "身体 / 状态阻力" && includesAny(stepText, ["项目经历", "PPT", "论文", "作品集"]) && !includesAny(testCase.task + testCase.currentStep, ["项目经历", "PPT", "论文", "作品集", "简历", "汇报"]);
  const semantic = semanticExpectations[testCase.case_id];
  const semanticMismatch = semantic ? includesAny(stepText + criteria, semantic.forbid || []) : false;
  const validatorOk = result.validation.passed;

  let score = 0;
  if (contextOk) score += 2;
  if (rootOk) score += 2;
  if (strategyOk) score += 2;
  if (concrete && !semanticMismatch) score += 2;
  if (criteriaOk) score += 1;
  if (!unsafe && !deviates && validatorOk) score += 1;

  const failures = [];
  if (!contextOk) failures.push("context");
  if (surface !== testCase.expected_surface_resistance) failures.push("surface");
  if (!rootOk) failures.push("root_cause");
  if (!strategyOk) failures.push("strategy");
  if (!concrete || deviates || semanticMismatch) failures.push("fallback");
  if (!criteriaOk) failures.push("fallback");
  if (!validatorOk || unsafe) failures.push("validator");

  return {
    score,
    result: score >= 8 ? "pass" : score >= 5 ? "uncertain" : "fail",
    failure_layer: score === 10 ? "" : failures[0] || "fallback",
    failure_reason: buildFailureReason({ contextOk, surface, rootOk, strategyOk, concrete, criteriaOk, unsafe, deviates, semanticMismatch, semantic, validatorOk, testCase, result }),
    fix_direction: buildFixDirection(failures[0], testCase, result)
  };
}

function buildFailureReason(flags) {
  const reasons = [];
  if (!flags.contextOk) reasons.push("context title/currentStep mismatch");
  if (flags.surface !== flags.testCase.expected_surface_resistance) reasons.push(`surface ${flags.surface} != expected ${flags.testCase.expected_surface_resistance}`);
  if (!flags.rootOk) reasons.push(`root ${flags.result.diagnosis.root_cause} != expected ${flags.testCase.expected_root_cause}`);
  if (!flags.strategyOk) reasons.push(`mode ${flags.result.recovery_decision.recovery_mode} != expected ${flags.testCase.expected_strategy}`);
  if (!flags.concrete) reasons.push("fallback too abstract");
  if (!flags.criteriaOk) reasons.push("completion criteria unclear");
  if (flags.unsafe) reasons.push("fallback contains unsafe push for mode");
  if (flags.deviates) reasons.push("fallback appears domain-mismatched");
  if (flags.semanticMismatch) reasons.push(flags.semantic?.reason || "fallback semantic mismatch");
  if (!flags.validatorOk) reasons.push("validator failed or repair did not pass");
  return reasons.join("; ");
}

function buildFixDirection(layer, testCase, result) {
  if (!layer) return "";
  const map = {
    context: "Context 层增加任务域一致性和 currentStep 来源校验。",
    surface: "Surface 规则补充该类 utterance 的显性阻力映射。",
    root_cause: "Diagnosis 层调整 root_cause 优先级或关键词。",
    strategy: "Decision 层修正高风险 recovery_mode 优先级。",
    fallback: "模板库/generic fallback 增加更贴合该任务域的可执行入口。",
    validator: "Output Validator 增加该模式的 unsafe action 或 domain mismatch 检查。"
  };
  return map[layer] || "补充专项规则和回归 case。";
}

const rows = cases.map((testCase) => {
  const result = resolveResistance({
    taskTitle: testCase.task,
    currentStep: {
      step_text: testCase.currentStep,
      risk_flags: testCase.risk_flags
    },
    stepHistory: [],
    userUtterance: testCase.user_utterance,
    selectedResistanceType: ""
  });
  const score = scoreCase(testCase, result);

  return {
    ...testCase,
    actual_surface_resistance: result.diagnosis.surface_resistance,
    actual_root_cause: result.diagnosis.root_cause,
    actual_strategy: result.recovery_decision.recovery_mode,
    actual_fallback_step: result.fallback_step.step_text,
    actual_completion_criteria: result.fallback_step.completion_criteria,
    template_id: result.fallback_step.template_id || "",
    validator_result: result.validation.passed ? `passed:${result.validation.severity}` : `failed:${result.validation.severity}`,
    validator_issues: result.validation.issues,
    state_update: "无法真实调用；脚本只调用 resolveResistance，App.applyResistance 代码路径会用 fallback_step 替换 currentStep。",
    ...score
  };
});

const summary = {
  total: rows.length,
  average_score: Number((rows.reduce((sum, row) => sum + row.score, 0) / rows.length).toFixed(2)),
  pass: rows.filter((row) => row.result === "pass").length,
  uncertain: rows.filter((row) => row.result === "uncertain").length,
  fail: rows.filter((row) => row.result === "fail").length,
  by_category: Object.fromEntries([...new Set(rows.map((row) => row.category))].map((category) => {
    const group = rows.filter((row) => row.category === category);
    return [category, {
      total: group.length,
      average_score: Number((group.reduce((sum, row) => sum + row.score, 0) / group.length).toFixed(2)),
      pass: group.filter((row) => row.result === "pass").length,
      uncertain: group.filter((row) => row.result === "uncertain").length,
      fail: group.filter((row) => row.result === "fail").length
    }];
  })),
  by_failure_layer: ["context", "surface", "root_cause", "strategy", "fallback", "validator", "state_update"].reduce((acc, layer) => {
    acc[layer] = rows.filter((row) => row.failure_layer === layer).length;
    return acc;
  }, {})
};

console.log(JSON.stringify({ summary, rows }, null, 2));
