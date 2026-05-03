import {
  isDuplicateStepEntry,
  isDuplicateStepText
} from "../src/stepDuplicate.mjs";

const failures = [];

assertTrue(
  "exact same step is duplicate",
  isDuplicateStepText("打开文档", ["打开文档"])
);
assertTrue(
  "small contained rewrite is duplicate",
  isDuplicateStepText("打开文档", ["先打开文档"])
);
assertTrue(
  "progressive contained step is not duplicate",
  !isDuplicateStepText("打开文档，写下标题", ["打开文档"])
);
assertTrue(
  "same task object with new action is not duplicate",
  !isDuplicateStepText("给老师的邮件写一句开头", ["找到老师的邮件"])
);
assertTrue(
  "same structured progress intent is duplicate",
  isDuplicateStepEntry(
    {
      step_text: "在设计工具中，写下你希望 Logo 包含的 1 个主要图形。",
      action_type: "write",
      task_object: "logo_main_shape",
      expected_output: "1 main shape",
      progress_intent: "define_logo_main_shape"
    },
    [
      {
        step_text: "写下你希望 Logo 包含的 1 个主要图形。",
        action_type: "write",
        task_object: "logo_main_shape",
        expected_output: "1 main shape",
        progress_intent: "define_logo_main_shape"
      }
    ]
  )
);
assertTrue(
  "same structured action object and output is duplicate without intent",
  isDuplicateStepEntry(
    {
      step_text: "在空白文档里写下 1 个主要图形。",
      action_type: "write",
      task_object: "logo_main_shape",
      expected_output: "1 main shape"
    },
    [
      {
        step_text: "写下 1 个主要图形。",
        action_type: "write",
        task_object: "logo_main_shape",
        expected_output: "1 main shape"
      }
    ]
  )
);
assertTrue(
  "new structured output is not duplicate",
  !isDuplicateStepEntry(
    {
      step_text: "根据主要图形画出 3 个不同布局的 Logo 草图。",
      action_type: "write",
      task_object: "logo_drafts",
      expected_output: "3 draft layouts",
      progress_intent: "create_logo_draft_variants"
    },
    [
      {
        step_text: "写下你希望 Logo 包含的 1 个主要图形。",
        action_type: "write",
        task_object: "logo_main_shape",
        expected_output: "1 main shape",
        progress_intent: "define_logo_main_shape"
      }
    ]
  )
);

if (failures.length > 0) {
  console.error(`Step duplicate tests failed: ${failures.length}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Step duplicate tests passed.");
}

function assertTrue(label, passed) {
  if (!passed) {
    failures.push(label);
  }
}
