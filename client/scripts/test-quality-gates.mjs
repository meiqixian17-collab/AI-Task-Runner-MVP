import { evaluateAiFallbackStep, resolveResistance } from "../src/resistancePipeline.mjs";

const cases = [
  {
    id: "safe-draft-contact-pressure",
    input: {
      taskTitle: "回老师消息",
      currentStep: {
        step_text: "打开聊天框回复老师",
        risk_flags: ["social_pressure", "emotional_pressure"]
      },
      userUtterance: "我怕一打开就被老师说"
    },
    expect: {
      rootCause: "emotional_pressure",
      recoveryMode: "safe_draft",
      mustIncludeOneOf: ["备忘录", "草稿"],
      unsafeAfterNegation: ["打开聊天框", "打开微信", "发送", "发消息", "联系对方"]
    }
  },
  {
    id: "clarify-unclear-output",
    input: {
      taskTitle: "写论文",
      currentStep: {
        step_text: "分析数据并写讨论部分",
        risk_flags: ["unclear_output"]
      },
      userUtterance: "我不知道这些数据到底说明什么"
    },
    expect: {
      rootCause: "unclear_output",
      recoveryMode: "clarify_standard",
      mustIncludeOneOf: ["问题", "判断", "标准"],
      unsafeAfterNegation: ["整理思路", "准备一下", "打开页面"]
    }
  },
  {
    id: "pause-low-energy-physical-action",
    input: {
      taskTitle: "健身",
      currentStep: {
        step_text: "换好衣服出门训练",
        risk_flags: ["physical_low_energy"]
      },
      userUtterance: "我胃不舒服，现在练肯定难受"
    },
    expect: {
      rootCause: "physical_low_energy",
      recoveryMode: "pause_and_resume",
      mustIncludeOneOf: ["暂停", "入口", "保留"],
      unsafeAfterNegation: ["站起来", "出门", "训练", "运动", "换衣服"]
    }
  },
  {
    id: "value-check-long-term-doubt",
    input: {
      taskTitle: "继续考研",
      currentStep: {
        step_text: "继续刷今天的数学题",
        risk_flags: ["value_uncertainty"]
      },
      userUtterance: "我错一堆，是不是根本没希望"
    },
    expect: {
      rootCause: "value_uncertainty",
      recoveryMode: "value_check",
      mustIncludeOneOf: ["理由", "值得", "暂停"],
      unsafeAfterNegation: ["刷题", "继续做", "完成今天"]
    }
  },
  {
    id: "low-quality-draft-perfectionism",
    input: {
      taskTitle: "写简历",
      currentStep: {
        step_text: "写项目经历",
        risk_flags: ["perfectionism"]
      },
      userUtterance: "我觉得太普通，拿不出手"
    },
    expect: {
      rootCause: "perfectionism",
      recoveryMode: "low_quality_draft",
      mustIncludeOneOf: ["60 分", "粗糙", "只写"],
      unsafeAfterNegation: ["继续优化", "改到满意", "再检查"]
    }
  }
];

const safeNegations = [
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
  "不训练",
  "不要训练",
  "不运动",
  "不要运动",
  "不刷题",
  "不继续做",
  "不继续执行",
  "不继续任务"
];

const failures = [];

for (const testCase of cases) {
  const result = resolveResistance(testCase.input);
  const stepText = result.fallback_step?.step_text || "";
  const criteria = result.fallback_step?.completion_criteria || "";
  const outputText = `${stepText} ${criteria}`;
  const textWithoutSafeNegations = stripSafeNegations(outputText);

  assertEqual({
    testCase,
    label: "root_cause",
    actual: result.diagnosis.root_cause,
    expected: testCase.expect.rootCause
  });
  assertEqual({
    testCase,
    label: "recovery_mode",
    actual: result.recovery_decision.recovery_mode,
    expected: testCase.expect.recoveryMode
  });
  assertTrue({
    testCase,
    label: "validation.passed",
    passed: result.validation.passed,
    detail: JSON.stringify(result.validation.issues)
  });
  assertTrue({
    testCase,
    label: "fallback includes expected semantic cue",
    passed: includesAny(outputText, testCase.expect.mustIncludeOneOf),
    detail: `expected one of ${testCase.expect.mustIncludeOneOf.join(", ")} in: ${outputText}`
  });
  assertTrue({
    testCase,
    label: "fallback avoids unsafe action",
    passed: !includesAny(textWithoutSafeNegations, testCase.expect.unsafeAfterNegation),
    detail: `unsafe words found after removing safe negations: ${textWithoutSafeNegations}`
  });
  assertTrue({
    testCase,
    label: "completion criteria is concrete",
    passed: criteria.trim().length >= 6,
    detail: `criteria: ${criteria}`
  });
}

const unsafeAiFallback = evaluateAiFallbackStep(
  {
    taskTitle: "回老师消息",
    currentStep: {
      step_text: "打开聊天框回复老师",
      risk_flags: ["social_pressure", "emotional_pressure"]
    },
    userUtterance: "我怕一打开就被老师说"
  },
  {
    step_text: "打开微信，直接给老师发送消息。",
    completion_criteria: "消息发送出去即可。",
    action_type: "contact",
    estimated_effort: "low",
    stage: "execute",
    risk_flags: ["social_pressure"]
  },
  {
    fallback_step_requirements: {
      should_remove_pressure_source: true,
      should_avoid_original_blocker: true
    }
  }
);

assertTrue({
  testCase: { id: "reject-unsafe-ai-fallback" },
  label: "unsafe AI fallback is rejected",
  passed: !unsafeAiFallback.validation.passed,
  detail: JSON.stringify(unsafeAiFallback.validation.issues)
});

if (failures.length > 0) {
  console.error(`\nQuality gates failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Quality gates passed: ${cases.length + 1} checks`);
}

function assertEqual({ testCase, label, actual, expected }) {
  assertTrue({
    testCase,
    label,
    passed: actual === expected,
    detail: `expected ${expected}, got ${actual}`
  });
}

function assertTrue({ testCase, label, passed, detail }) {
  if (!passed) {
    failures.push(`${testCase.id}: ${label} failed (${detail})`);
  }
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function stripSafeNegations(text) {
  return safeNegations.reduce(
    (current, phrase) => current.replaceAll(phrase, ""),
    text
  );
}
