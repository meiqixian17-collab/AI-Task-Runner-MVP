import { resolveResistance } from "../src/resistancePipeline.mjs";

const cases = [
  {
    case_id: 1,
    taskTitle: "回老师消息",
    currentStep: "打开聊天框回复老师",
    userUtterance: "怕被老师说"
  },
  {
    case_id: 2,
    taskTitle: "向朋友道歉",
    currentStep: "给朋友发消息道歉",
    userUtterance: "怕更尴尬"
  },
  {
    case_id: 3,
    taskTitle: "给领导请假",
    currentStep: "联系领导说明请假原因",
    userUtterance: "怕被觉得找借口"
  },
  {
    case_id: 4,
    taskTitle: "拒绝别人",
    currentStep: "给对方发消息拒绝这件事",
    userUtterance: "怕被记恨"
  },
  {
    case_id: 5,
    taskTitle: "催朋友还钱",
    currentStep: "发消息催朋友还钱",
    userUtterance: "怕显得小气"
  },
  {
    case_id: 6,
    taskTitle: "写论文讨论",
    currentStep: "分析实验数据并写讨论部分",
    userUtterance: "不知道数据说明什么"
  },
  {
    case_id: 7,
    taskTitle: "规划毕业设计",
    currentStep: "规划毕业项目从哪块下手",
    userUtterance: "不知道从哪块下手"
  },
  {
    case_id: 8,
    taskTitle: "找实习",
    currentStep: "浏览岗位并决定投递哪些岗位",
    userUtterance: "岗位越看越乱"
  },
  {
    case_id: 9,
    taskTitle: "准备面试",
    currentStep: "准备项目回答",
    userUtterance: "不知道面试官想听什么"
  },
  {
    case_id: 10,
    taskTitle: "做作品集",
    currentStep: "选择一个项目放进作品集",
    userUtterance: "不知道哪个项目拿得出手"
  },
  {
    case_id: 11,
    taskTitle: "写简历",
    currentStep: "写项目经历",
    userUtterance: "觉得太普通"
  },
  {
    case_id: 12,
    taskTitle: "做 PPT",
    currentStep: "继续优化 PPT 结构",
    userUtterance: "想把结构想完美"
  },
  {
    case_id: 13,
    taskTitle: "发朋友圈",
    currentStep: "发布这条朋友圈",
    userUtterance: "怕别人觉得装"
  },
  {
    case_id: 14,
    taskTitle: "健身/学习",
    currentStep: "换好衣服出门训练",
    userUtterance: "累、困、胃不舒服、没电"
  },
  {
    case_id: 15,
    taskTitle: "要不要继续考研/学习编程",
    currentStep: "继续刷今天的错题",
    userUtterance: "觉得没希望、骗自己"
  },
  {
    case_id: 16,
    taskTitle: "我想健身",
    currentStep: "先写一版 60 分项目经历，只写“我做了什么”，不改措辞。",
    userUtterance: "",
    selectedResistanceType: "dontWant"
  }
];

for (const testCase of cases) {
  const result = resolveResistance({
    taskTitle: testCase.taskTitle,
    currentStep: testCase.currentStep,
    stepHistory: [],
    userUtterance: testCase.userUtterance,
    selectedResistanceType: testCase.selectedResistanceType || ""
  });

  console.log(`\ncase_id: ${testCase.case_id}`);
  console.log(`template_id: ${result.fallback_step.template_id || ""}`);
  console.log(`recovery_mode: ${result.recovery_decision.recovery_mode}`);
  console.log(`root_cause: ${result.diagnosis.root_cause}`);
  console.log(`fallback_step.step_text: ${result.fallback_step.step_text}`);
  console.log(`validation.passed: ${result.validation.passed}`);
  console.log(`validation.issues: ${JSON.stringify(result.validation.issues)}`);
}
