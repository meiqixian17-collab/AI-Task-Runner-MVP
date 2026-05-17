import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  History,
  MoreVertical,
  Plus,
  Sparkles,
  Star,
  Trash2
} from "lucide-react";
import {
  generateFirstStep,
  generateNextStep,
  resolveResistanceWithAi
} from "./api.js";
import {
  buildAiDiagnosisContext,
  evaluateAiFallbackStep,
  getDiagnosisFeedback as getPipelineDiagnosisFeedback,
  getLegacyResistanceType as getPipelineLegacyResistanceType,
  normalizeResistanceDiagnosis as normalizePipelineResistanceDiagnosis,
  normalizeResistanceResolution as normalizePipelineResistanceResolution,
  resolveResistance
} from "./resistancePipeline.mjs";
import {
  createSimpleCompletionStep,
  createSimpleFinishingStep,
  shouldAskSimpleTaskCompletion
} from "./simpleTaskCompletion.mjs";
import {
  buildDuplicateRetryContext,
  getDuplicateStepDecision
} from "./duplicateRetry.mjs";
import { isDuplicateStepEntry } from "./stepDuplicate.mjs";
import {
  COMPLETION_CONFIRMATION_TYPES,
  createTaskCompletionConfirmationStep,
  createNormalTaskCompletionCheckpointStep,
  getCompletionConfirmationType,
  shouldContinueCompletionConfirmationWithAi
} from "./taskCompletionCheckpoint.mjs";
import {
  COMPLETION_ACTIONS,
  createClosingChecklistStep,
  createClosingFollowupStep,
  decideCompletionBoundary
} from "./taskCompletionModel.mjs";
import StepCard from "./StepCard.jsx";
import StatusPill, { getStatusPillMeta } from "./StatusPill.jsx";

const APP_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  READY: "ready",
  EXECUTING: "executing",
  PAUSED: "paused",
  EXITED: "exited",
  COMPLETED: "completed"
};

const GENERATION_SOURCE = {
  NONE: "",
  AI: "ai",
  FALLBACK: "fallback"
};

const STEP_SOURCE = {
  AI: "ai",
  DUPLICATE_RETRY: "duplicate_retry",
  LOCAL_RULE: "local_rule",
  GENERIC_FALLBACK: "generic_fallback",
  RESISTANCE_AI: "resistance_ai",
  RESISTANCE_TEMPLATE: "resistance_template",
  LEGACY_RECOVERY: "legacy_recovery"
};

const RE_ENTRY_STORAGE_KEY = "ai-task-runner-re-entry-point";
const TASKS_STORAGE_KEY = "ai-task-runner-tasks";

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

const CLARIFICATION_TASK_TYPES = {
  LOGO_DESIGN: "logo_design",
  MESSAGE_WRITING: "message_writing",
  RESUME: "resume",
  PORTFOLIO: "portfolio",
  PAPER: "paper",
  BROAD_GOAL: "broad_goal",
  MISSING_OBJECT: "missing_object",
  MISSING_CONSTRAINTS: "missing_constraints",
  UNSCOPED_DECISION: "unscoped_decision"
};

const CLARIFICATION_RULES = {
  [CLARIFICATION_TASK_TYPES.LOGO_DESIGN]: [
    {
      key: "brand_name",
      question: "告诉我你的店铺或品牌叫什么名字？",
      placeholder: "例如：小岛咖啡 / 有光手作",
      required: true
    },
    {
      key: "business_type",
      question: "这个店铺主要卖什么？",
      placeholder: "例如：咖啡 / 手作饰品 / 宠物用品",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.MESSAGE_WRITING]: [
    {
      key: "recipient",
      question: "这条消息是发给谁的？",
      placeholder: "例如：老师 / 同学 / HR / 朋友",
      required: true
    },
    {
      key: "message_goal",
      question: "你希望这条消息达到什么目的？",
      placeholder: "例如：请假 / 道歉 / 询问进度",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.RESUME]: [
    {
      key: "target_position",
      question: "这份简历主要投什么岗位？",
      placeholder: "例如：AI 产品实习生 / UI 设计实习生",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.PORTFOLIO]: [
    {
      key: "current_stage",
      question: "你的作品集现在做到哪一步了？",
      placeholder: "例如：还没选项目 / 已选项目但没整理",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.PAPER]: [
    {
      key: "current_stage",
      question: "你现在已经做到哪一步了？",
      placeholder: "例如：还没选题 / 已有题目 / 已经写了一部分",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.BROAD_GOAL]: [
    {
      key: "focus_area",
      question: "你现在最想先推进哪一部分？",
      placeholder: "例如：学习 / 求职 / 健康 / 项目",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.MISSING_OBJECT]: [
    {
      key: "task_object",
      question: "你要处理的具体对象是什么？",
      placeholder: "例如：报告 / 页面 / 课程材料",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.MISSING_CONSTRAINTS]: [
    {
      key: "constraints",
      question: "这件事有什么必须满足的要求吗？",
      placeholder: "例如：明天交 / 10 页以内 / 面向老师汇报",
      required: true
    }
  ],
  [CLARIFICATION_TASK_TYPES.UNSCOPED_DECISION]: [
    {
      key: "concrete_task",
      question: "你希望我先帮你推进哪一个具体任务？",
      placeholder: "例如：列优缺点 / 找 3 个岗位",
      required: true
    }
  ]
};

const RESISTANCE_SIGNALS = {
  EMOTIONAL_PRESSURE: "emotional_pressure",
  COGNITIVE_CONFUSION: "cognitive_confusion",
  PERFECTIONISM: "perfectionism",
  PHYSICAL_LOW_STATE: "physical_low_state",
  VALUE_DOUBT: "value_doubt",
  GENERAL: "general"
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

const UNSUPPORTED_NON_TEXT_RETRY_REASON = "unsupported_non_text_input_request";

const NON_TEXT_MATERIAL_KEYWORDS = [
  "照片",
  "拍照",
  "截图",
  "图片",
  "图像",
  "录音",
  "音频",
  "文件",
  "附件",
  "pdf",
  "word",
  "excel",
  "screenshot",
  "photo",
  "image",
  "audio",
  "recording",
  "file",
  "attachment"
];

const UNSUPPORTED_NON_TEXT_RECIPIENT_KEYWORDS = [
  "给我",
  "发来",
  "发过来",
  "发给系统",
  "给系统",
  "让我看",
  "给我看",
  "传上来",
  "传给我",
  "上传到这里",
  "发到这里",
  "粘贴到这里",
  "贴到这里",
  "send me",
  "to me",
  "upload here",
  "paste here",
  "show me",
  "provide me",
  "submit here"
];

const UNSUPPORTED_NON_TEXT_ACTION_KEYWORDS = [
  "上传",
  "粘贴",
  "贴上",
  "提供",
  "提交",
  "展示",
  "upload",
  "paste",
  "attach",
  "provide",
  "submit"
];

const EXTERNAL_NON_TEXT_TARGET_KEYWORDS = [
  "网站",
  "平台",
  "页面",
  "表单",
  "邮箱",
  "老师",
  "同学",
  "朋友",
  "领导",
  "hr",
  "客户",
  "对方",
  "学校",
  "公司",
  "招聘",
  "申请",
  "报名",
  "app",
  "application"
];

const ROOT_CAUSES = [
  "unclear_output",
  "too_large",
  "emotional_pressure",
  "social_pressure",
  "perfectionism",
  "physical_low_energy",
  "value_uncertainty"
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

function App() {
  const [view, setView] = useState("list");
  const [tasks, setTasks] = useState(() => readSavedTasks());
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || null;

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  function updateTask(taskId, updater) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const updates =
          typeof updater === "function" ? updater(task) : updater;

        return normalizeTask({
          ...task,
          ...updates,
          updatedAt: updates.updatedAt || new Date().toISOString()
        });
      })
    );
  }

  function handleCreateTask() {
    const task = createTask();

    setTasks((currentTasks) => [task, ...currentTasks]);
    setSelectedTaskId(task.id);
    setView("execution");
  }

  function handleSelectTask(taskId) {
    setSelectedTaskId(taskId);
    setView("execution");
  }

  function handleToggleImportant(taskId) {
    updateTask(taskId, (task) => ({
      isImportant: !task.isImportant
    }));
  }

  function handleDeleteTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );

    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
      setView("list");
    }
  }

  function handleBackToList() {
    if (selectedTask && isUnsavedDraftTask(selectedTask)) {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== selectedTask.id)
      );
    }

    setSelectedTaskId(null);
    setView("list");
  }

  if (view === "execution" && selectedTask) {
    return (
      <TaskExecutionPage
        task={selectedTask}
        onBack={handleBackToList}
        onStartNewTask={handleCreateTask}
        onUpdateTask={updateTask}
      />
    );
  }

  return (
    <MyTasksPage
      tasks={tasks}
      onCreateTask={handleCreateTask}
      onSelectTask={handleSelectTask}
      onToggleImportant={handleToggleImportant}
      onDeleteTask={handleDeleteTask}
    />
  );
}

function MyTasksPage({
  tasks,
  onCreateTask,
  onSelectTask,
  onToggleImportant,
  onDeleteTask
}) {
  const longPressTimers = useRef({});
  const suppressNextClick = useRef(false);
  const taskMenuRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const [menuTaskId, setMenuTaskId] = useState(null);
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState(null);
  const [completedOpen, setCompletedOpen] = useState(false);
  const activeMenuTask =
    tasks.find((task) => task.id === menuTaskId) || null;
  const deleteConfirmTask =
    tasks.find((task) => task.id === deleteConfirmTaskId) || null;
  const isActiveMenuTaskCompleted =
    activeMenuTask?.status === APP_STATUS.COMPLETED;
  const sortedTasks = [...tasks].sort((firstTask, secondTask) => {
    if (firstTask.isImportant === secondTask.isImportant) {
      return 0;
    }

    return firstTask.isImportant ? -1 : 1;
  });
  const activeTasks = sortedTasks.filter(
    (task) => task.status !== APP_STATUS.COMPLETED
  );
  const completedTasks = sortedTasks.filter(
    (task) => task.status === APP_STATUS.COMPLETED
  );
  const listHeaderStatus =
    activeTasks.length > 0
      ? {
          label: `${activeTasks.length} 个进行中`,
          status: APP_STATUS.READY
        }
      : completedTasks.length > 0
        ? {
            label: `${completedTasks.length} 个已完成`,
            status: APP_STATUS.COMPLETED
          }
        : {
            label: "待输入",
            status: APP_STATUS.IDLE
          };

  useEffect(() => {
    const activeDialog = deleteConfirmTask
      ? deleteDialogRef.current
      : activeMenuTask
        ? taskMenuRef.current
        : null;

    if (!activeDialog) {
      return;
    }

    const focusableElements = getFocusableElements(activeDialog);
    focusableElements[0]?.focus();

    function handleDialogKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (deleteConfirmTask) {
          setDeleteConfirmTaskId(null);
        } else {
          setMenuTaskId(null);
        }
        return;
      }

      if (event.key !== "Tab" || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    activeDialog.addEventListener("keydown", handleDialogKeyDown);

    return () => {
      activeDialog.removeEventListener("keydown", handleDialogKeyDown);
    };
  }, [activeMenuTask, deleteConfirmTask]);

  function openTaskMenu(taskId) {
    suppressNextClick.current = true;
    setMenuTaskId(taskId);
  }

  function startLongPress(taskId) {
    clearLongPress(taskId);
    longPressTimers.current[taskId] = window.setTimeout(() => {
      openTaskMenu(taskId);
    }, 500);
  }

  function clearLongPress(taskId) {
    const timer = longPressTimers.current[taskId];

    if (timer) {
      window.clearTimeout(timer);
      delete longPressTimers.current[taskId];
    }
  }

  function handleTaskClick(taskId) {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }

    onSelectTask(taskId);
  }

  function handleTaskMenuButtonClick(event, taskId) {
    event.stopPropagation();
    clearLongPress(taskId);
    openTaskMenu(taskId);
  }

  function handleToggleImportant() {
    if (!activeMenuTask) {
      return;
    }

    onToggleImportant(activeMenuTask.id);
    setMenuTaskId(null);
  }

  function handleRequestDelete() {
    if (!activeMenuTask) {
      return;
    }

    setDeleteConfirmTaskId(activeMenuTask.id);
    setMenuTaskId(null);
  }

  function handleConfirmDelete() {
    if (!deleteConfirmTask) {
      return;
    }

    onDeleteTask(deleteConfirmTask.id);
    setDeleteConfirmTaskId(null);
  }

  return (
    <main className="page page--list">
      <header className="app-header tasks-header">
        <div className="page-title-stack">
          <p className="eyebrow">AI Task Runner</p>
          <div className="title-row title-row--spread">
            <div className="title-with-status">
              <h1>我的任务</h1>
              <StatusPill
                className="header-status-pill"
                label={listHeaderStatus.label}
                status={listHeaderStatus.status}
              />
            </div>
            <button
              aria-label="创建新任务"
              className="create-task-button"
              type="button"
              onClick={onCreateTask}
            >
              <Plus aria-hidden="true" className="icon-button-svg" size={22} />
            </button>
          </div>
        </div>
      </header>

      {tasks.length === 0 ? (
        <section className="surface-card tasks-empty" aria-live="polite">
          <StatusPill status="idle" size="sm" />
          <h2>把任何「不知道从哪开始」的任务交给 AI，生成可执行的下一步</h2>
          <p>不用先想完整计划，先把事情放进来。</p>
          <button
            className="primary-action"
            type="button"
            onClick={onCreateTask}
          >
            <Plus aria-hidden="true" className="button-icon" size={18} />
            创建第一个任务
          </button>
        </section>
      ) : (
        <>
          {activeTasks.length === 0 ? (
            <section className="surface-card tasks-empty" aria-live="polite">
              <StatusPill status="completed" size="sm" />
              <h2>暂无未完成任务</h2>
              <p>新的任务会继续出现在这里。</p>
            </section>
          ) : (
            <>
              <p className="task-list-hint">长按任务可编辑</p>
              <section className="task-list" aria-label="任务列表">
                {activeTasks.map((task) => {
                  const statusMeta = getStatusMeta(task.status);
                  const detail = getTaskListDetail(task);

                  return (
                    <div
                      className={`task-list-item${
                        task.isImportant ? " task-list-item--important" : ""
                      }`}
                      key={task.id}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        openTaskMenu(task.id);
                      }}
                      onMouseDown={() => startLongPress(task.id)}
                      onMouseLeave={() => clearLongPress(task.id)}
                      onMouseUp={() => clearLongPress(task.id)}
                      onTouchCancel={() => clearLongPress(task.id)}
                      onTouchEnd={() => clearLongPress(task.id)}
                      onTouchMove={() => clearLongPress(task.id)}
                      onTouchStart={() => startLongPress(task.id)}
                    >
                      <button
                        className="task-list-main"
                        type="button"
                        onClick={() => handleTaskClick(task.id)}
                      >
                      <span
                        aria-hidden="true"
                        className={`task-status-icon task-status-icon--${
                          task.errorMessage ? "error" : statusMeta.tone
                        }`}
                      >
                        {getTaskStatusIcon(task.status, Boolean(task.errorMessage))}
                      </span>
                      <span className="task-list-content">
                        <strong>
                          {task.isImportant && (
                            <Star
                              aria-label="重要任务"
                              className="important-mark"
                              fill="currentColor"
                              role="img"
                              size={15}
                            />
                          )}
                          {task.title || "未命名任务"}
                        </strong>
                        <span className="task-list-detail">
                          <span className="task-list-summary">{detail.summary}</span>
                          <time
                            className="task-list-time"
                            dateTime={task.updatedAt}
                          >
                            {detail.timeText}
                          </time>
                        </span>
                      </span>
                      <StatusPill
                        className="task-list-status"
                        status={task.errorMessage ? "error" : task.status}
                        size="sm"
                      />
                      </button>
                      <button
                        aria-label={`打开${task.title || "未命名任务"}的任务操作`}
                        className="task-row-menu-button"
                        type="button"
                        onClick={(event) => handleTaskMenuButtonClick(event, task.id)}
                        onMouseDown={(event) => event.stopPropagation()}
                        onTouchStart={(event) => event.stopPropagation()}
                      >
                        <MoreVertical
                          aria-hidden="true"
                          className="icon-button-svg"
                          size={18}
                        />
                      </button>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          {completedTasks.length > 0 && (
            <section
              className="completed-tasks"
              aria-labelledby="completed-tasks-title"
            >
              <button
                aria-controls="completed-tasks-list"
                aria-expanded={completedOpen}
                className="completed-tasks-toggle"
                type="button"
                onClick={() => setCompletedOpen((isOpen) => !isOpen)}
              >
                <span className="completed-tasks-title" id="completed-tasks-title">
                  <CheckCircle2
                    aria-hidden="true"
                    className="heading-icon"
                    size={16}
                  />
                  已完成任务
                </span>
                <span aria-hidden="true" className="completed-tasks-meta">
                  {completedTasks.length} 个
                  <ChevronRight
                    className={`completed-tasks-chevron${
                      completedOpen ? " completed-tasks-chevron--open" : ""
                    }`}
                    size={18}
                  />
                </span>
              </button>

              {completedOpen && (
                <ul className="completed-task-list" id="completed-tasks-list">
                  {completedTasks.map((task) => {
                    return (
                      <li className="completed-task-row" key={task.id}>
                        <div
                          aria-label={`查看${task.title || "未命名任务"}的完成记录`}
                          className="completed-task-item"
                          role="button"
                          tabIndex={0}
                          onClick={() => handleTaskClick(task.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleTaskClick(task.id);
                            }
                          }}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            openTaskMenu(task.id);
                          }}
                          onMouseDown={() => startLongPress(task.id)}
                          onMouseLeave={() => clearLongPress(task.id)}
                          onMouseUp={() => clearLongPress(task.id)}
                          onTouchCancel={() => clearLongPress(task.id)}
                          onTouchEnd={() => clearLongPress(task.id)}
                          onTouchMove={() => clearLongPress(task.id)}
                          onTouchStart={() => startLongPress(task.id)}
                        >
                          <strong>{task.title || "未命名任务"}</strong>
                          <StatusPill status={task.status} size="sm" />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      {activeMenuTask && (
        <div
          className="modal-scrim"
          role="presentation"
          onClick={() => setMenuTaskId(null)}
        >
          <section
            aria-labelledby="task-menu-title"
            aria-modal="true"
            className="task-action-sheet"
            ref={taskMenuRef}
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="task-menu-title">{activeMenuTask.title || "未命名任务"}</h2>
            {!isActiveMenuTaskCompleted && (
              <button type="button" onClick={handleToggleImportant}>
                <Star
                  aria-hidden="true"
                  className="button-icon"
                  fill={activeMenuTask.isImportant ? "currentColor" : "none"}
                  size={18}
                />
                {activeMenuTask.isImportant ? "取消重要" : "标记为重要"}
              </button>
            )}
            <button
              className="danger-action"
              type="button"
              onClick={handleRequestDelete}
            >
              <Trash2 aria-hidden="true" className="button-icon" size={18} />
              删除任务
            </button>
            <button type="button" onClick={() => setMenuTaskId(null)}>
              取消
            </button>
          </section>
        </div>
      )}

      {deleteConfirmTask && (
        <div
          className="modal-scrim"
          role="presentation"
          onClick={() => setDeleteConfirmTaskId(null)}
        >
          <section
            aria-labelledby="delete-task-title"
            aria-modal="true"
            className="confirm-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-task-title">确定删除这个任务吗？</h2>
            <p>删除后无法恢复。</p>
            <div className="confirm-actions">
              <button type="button" onClick={() => setDeleteConfirmTaskId(null)}>
                取消
              </button>
              <button
                className="danger-action danger-action--solid"
                type="button"
                onClick={handleConfirmDelete}
              >
                <Trash2 aria-hidden="true" className="button-icon" size={18} />
                删除
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function getReadableFallbackMessage(error) {
  const message = String(error?.message || "");
  const isTimeout =
    error?.name === "RequestTimeoutError" || /timeout|timed out/i.test(message);

  if (isTimeout) {
    return "响应慢了，我先给你一个不用等 AI 也能开始的备用动作。";
  }

  return "生成没有顺利完成，我先给你一个可执行的备用动作。";
}

function TaskExecutionPage({ task, onBack, onStartNewTask, onUpdateTask }) {
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isResolvingResistance, setIsResolvingResistance] = useState(false);
  const [resistanceLoadingMessage, setResistanceLoadingMessage] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);
  const resistanceLoadingTimers = useRef([]);

  const taskInput = task.title;
  const appStatus = task.status;
  const currentStep = task.currentStep;
  const currentStepText = getStepText(currentStep);
  const stepHistory = task.stepHistory;
  const isLoading = appStatus === APP_STATUS.LOADING;
  const isTaskLocked =
    appStatus === APP_STATUS.LOADING ||
    appStatus === APP_STATUS.READY ||
    appStatus === APP_STATUS.EXECUTING ||
    appStatus === APP_STATUS.PAUSED ||
    appStatus === APP_STATUS.EXITED ||
    appStatus === APP_STATUS.COMPLETED;
  const currentStepNumber = task.stepIndex + 1;
  const isUsingFallback = task.generationSource === GENERATION_SOURCE.FALLBACK;
  const resistanceResult =
    task.resistanceFeedback ||
    getResistanceResult(
      task.selectedResistanceType,
      task.interruptedStep || currentStep
    );
  const statusMeta = getStatusMeta(appStatus);
  const isTaskComposer = appStatus === APP_STATUS.IDLE;
  const taskPanelCopy = getTaskPanelCopy(appStatus);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessage("");
      return;
    }

    setLoadingMessage("理解任务中");

    const stageTwoTimer = setTimeout(() => {
      setLoadingMessage("生成步骤中");
    }, 2000);

    const slowTimer = setTimeout(() => {
      setLoadingMessage("如果继续变慢，我会自动给你备用步骤");
    }, 5000);

    return () => {
      clearTimeout(stageTwoTimer);
      clearTimeout(slowTimer);
    };
  }, [isLoading]);

  useEffect(() => () => clearResistanceLoadingTimers(), []);

  function updateCurrentTask(updates) {
    onUpdateTask(task.id, updates);
  }

  function closeResistancePanel(extraUpdates = {}) {
    updateCurrentTask({
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      ...extraUpdates
    });
  }

  function clearResistanceLoadingTimers() {
    resistanceLoadingTimers.current.forEach((timer) => window.clearTimeout(timer));
    resistanceLoadingTimers.current = [];
  }

  function startResistanceLoading() {
    clearResistanceLoadingTimers();
    setIsResolvingResistance(true);
    setResistanceLoadingMessage("正在分析卡点");

    resistanceLoadingTimers.current = [
      window.setTimeout(() => {
        setResistanceLoadingMessage("正在生成低阻力步骤");
      }, 2000),
      window.setTimeout(() => {
        setResistanceLoadingMessage("正在校验可执行步骤");
      }, 5000)
    ];
  }

  function stopResistanceLoading() {
    clearResistanceLoadingTimers();
    setIsResolvingResistance(false);
    setResistanceLoadingMessage("");
  }

  function handleTitleChange(event) {
    if (isTaskLocked) {
      return;
    }

    updateCurrentTask({
      title: event.target.value,
      errorMessage: ""
    });
  }

  async function handleSubmitTask(event) {
    event.preventDefault();

    const trimmedTask = taskInput.trim();
    const nextTaskContext = {};

    if (!trimmedTask) {
      updateCurrentTask({ errorMessage: "请先输入一个任务。" });
      return;
    }

    const clarificationStep = maybeGenerateClarificationStep({
      title: trimmedTask,
      taskContext: nextTaskContext
    });
    const immediateActionStep = clarificationStep
      ? null
      : maybeGenerateImmediateActionStep({
          title: trimmedTask,
          taskContext: nextTaskContext
        });

    updateCurrentTask({
      title: trimmedTask,
      currentStep: clarificationStep || immediateActionStep || "",
      stepIndex: 0,
      stepHistory: [],
      taskContext: nextTaskContext,
      status:
        clarificationStep || immediateActionStep
          ? APP_STATUS.READY
          : APP_STATUS.LOADING,
      sessionSummary: "",
      errorMessage: "",
      generationSource: immediateActionStep
        ? GENERATION_SOURCE.FALLBACK
        : GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null,
      completionCheckpointDismissedAtStepCount: null
    });
    clearSavedReEntryPoint();

    if (clarificationStep || immediateActionStep) {
      return;
    }

    try {
      const data = await generateFirstStep(
        buildTaskGenerationPayload({
          taskTitle: trimmedTask,
          taskContext: nextTaskContext,
          stepHistory: []
        })
      );
      await applyGeneratedStep(data, trimmedTask, []);
    } catch (error) {
      applyFallbackStep(trimmedTask, error, []);
    }
  }

  function handleStartExecuting() {
    updateCurrentTask({
      status: APP_STATUS.EXECUTING,
      errorMessage: "",
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null,
      completionCheckpointDismissedAtStepCount: null
    });
  }

  function handleResumeCurrentStep() {
    updateCurrentTask((currentTask) => ({
      currentStep: currentTask.reEntryPoint?.currentStep || currentTask.currentStep,
      title: currentTask.reEntryPoint?.task || currentTask.title,
      status: APP_STATUS.EXECUTING,
      errorMessage: "",
      sessionSummary: "",
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    }));
    clearSavedReEntryPoint();
  }

  async function handleCompleteCurrentStep() {
    const finishedStep = currentStepText.trim();

    if (!finishedStep) {
      updateCurrentTask({ errorMessage: "当前没有可完成的步骤。" });
      return;
    }

    const completedStep =
      normalizeHistoryStep(currentStep || finishedStep, {
        taskTitle: taskInput,
        taskType: getTaskType(taskInput),
        stage: currentStep?.stage || "execute"
      }) || finishedStep;
    const nextHistory = [...stepHistory, completedStep];
    const nextStepIndex = task.stepIndex + 1;

    updateCurrentTask({
      stepHistory: nextHistory,
      stepIndex: nextStepIndex,
      currentStep: "",
      status: APP_STATUS.LOADING,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null,
      completionCheckpointDismissedAtStepCount: null
    });
    clearSavedReEntryPoint();

    const completionDecision = decideCompletionBoundary({
      taskTitle: taskInput,
      completedStep,
      stepHistory: nextHistory
    });

    if (
      applyCompletionBoundaryDecision(
        completionDecision,
        taskInput,
        nextHistory
      )
    ) {
      return;
    }

    if (
      shouldAskSimpleTaskCompletion({
        taskTitle: taskInput,
        stepHistory: nextHistory
      })
    ) {
      showSimpleTaskCompletionConfirmation(taskInput);
      return;
    }

    const clarificationStep = maybeGenerateClarificationStep({
      title: taskInput,
      taskContext: task.taskContext
    });

    if (clarificationStep) {
      updateCurrentTask({
        currentStep: clarificationStep,
        status: APP_STATUS.READY,
        errorMessage: "",
        generationSource: GENERATION_SOURCE.NONE
      });
      return;
    }

    try {
      const data = await generateNextStep(
        buildTaskGenerationPayload({
          taskTitle: taskInput,
          taskContext: task.taskContext,
          stepHistory: nextHistory
        }),
        nextHistory
      );
      await applyGeneratedStep(data, taskInput, nextHistory);
    } catch (error) {
      applyFallbackStep(taskInput, error, nextHistory);
    }
  }

  async function handleSubmitClarificationAnswer(answer) {
    const trimmedAnswer = answer.trim();
    const clarificationKey =
      currentStep && typeof currentStep === "object"
        ? currentStep.clarification_key
        : "";

    if (!clarificationKey) {
      updateCurrentTask({ errorMessage: "当前没有可补充的信息项。" });
      return;
    }

    if (!trimmedAnswer) {
      updateCurrentTask({ errorMessage: "请先输入内容。" });
      return;
    }

    const nextTaskContext = {
      ...task.taskContext,
      [clarificationKey]: trimmedAnswer
    };

    updateCurrentTask({
      taskContext: nextTaskContext,
      currentStep: "",
      status: APP_STATUS.LOADING,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();

    const nextClarificationStep = maybeGenerateClarificationStep({
      title: taskInput,
      taskContext: nextTaskContext
    });

    if (nextClarificationStep) {
      updateCurrentTask({
        currentStep: nextClarificationStep,
        status: APP_STATUS.READY,
        errorMessage: "",
        generationSource: GENERATION_SOURCE.NONE
      });
      return;
    }

    const immediateActionStep = maybeGenerateImmediateActionStep({
      title: taskInput,
      taskContext: nextTaskContext
    });

    if (immediateActionStep) {
      updateCurrentTask({
        currentStep: immediateActionStep,
        status: APP_STATUS.READY,
        errorMessage: "",
        generationSource: GENERATION_SOURCE.FALLBACK
      });
      return;
    }

    try {
      const generationPayload = buildTaskGenerationPayload({
        taskTitle: taskInput,
        taskContext: nextTaskContext,
        clarificationAnswer: trimmedAnswer,
        stepHistory
      });
      const data =
        stepHistory.length === 0
          ? await generateFirstStep(generationPayload)
          : await generateNextStep(generationPayload, stepHistory);

      await applyGeneratedStep(data, taskInput, stepHistory, {
        taskContext: nextTaskContext
      });
    } catch (error) {
      applyFallbackStep(taskInput, error, stepHistory);
    }
  }

  async function applyGeneratedStep(
    data,
    taskTitle,
    historyForCompare = stepHistory,
    options = {}
  ) {
    if (!data?.isTaskComplete && isInvalidStep(data?.step)) {
      applyFallbackStep(
        taskTitle,
        new Error("AI 返回了空步骤或无效步骤。"),
        historyForCompare
      );
      return;
    }

    const nextStep = data.isTaskComplete
      ? ""
      : normalizeCurrentStep(data.step || "", {
          taskTitle,
          stage: historyForCompare.length === 0 ? "start" : "execute",
          source: options.stepSource || STEP_SOURCE.AI,
          sourceReason:
            options.sourceReason || "Generated by the AI step endpoint."
        });
    const effectiveTaskContext =
      options.taskContext && typeof options.taskContext === "object"
        ? options.taskContext
        : task.taskContext;

    if (
      !data.isTaskComplete &&
      isAnsweredClarificationStep(nextStep, effectiveTaskContext)
    ) {
      const immediateActionStep = maybeGenerateActionFromAnsweredClarification({
        title: taskTitle,
        taskContext: effectiveTaskContext
      });

      if (immediateActionStep) {
        updateCurrentTask({
          currentStep: immediateActionStep,
          status: APP_STATUS.READY,
          sessionSummary: "",
          errorMessage: "",
          generationSource: GENERATION_SOURCE.FALLBACK,
          reEntryPoint: null,
          resistancePanelOpen: false,
          selectedResistanceType: "",
          resistanceFeedback: "",
          interruptedStep: "",
          resistanceDiagnosis: null,
          resistanceResolution: null
        });
        clearSavedReEntryPoint();
        return;
      }

      applyFallbackStep(
        taskTitle,
        new Error("AI repeated a clarification that was already answered."),
        historyForCompare
      );
      return;
    }

    if (!data.isTaskComplete) {
      const duplicateDecision = getDuplicateStepDecision({
        nextStep,
        historyForCompare,
        taskTitle,
        duplicateRetryCount: options.duplicateRetryCount,
        rejectedSteps: options.rejectedSteps,
        isDuplicateStep,
        shouldAskSimpleTaskCompletion,
        getStepText
      });

      if (duplicateDecision.action === "complete") {
        showSimpleTaskCompletionConfirmation(taskTitle);
        return;
      }

      if (duplicateDecision.action !== "accept") {
        showDuplicateStepConfirmation(
          taskTitle,
          nextStep,
          historyForCompare,
          duplicateDecision
        );
        return;
      }

    }

    if (
      !data.isTaskComplete &&
      hasUnsupportedNonTextInputRequest(nextStep)
    ) {
      if (options.retryUnsupportedNonText !== false) {
        try {
          setLoadingMessage("正在重新生成文字可执行步骤");
          const retryData = await regenerateAfterUnsupportedNonTextInputRequest({
            taskTitle,
            rejectedStep: nextStep,
            historyForCompare
          });

          await applyGeneratedStep(retryData, taskTitle, historyForCompare, {
            ...options,
            retryUnsupportedNonText: false,
            sourceReason:
              "Regenerated after unsupported non-text input request."
          });
          return;
        } catch (error) {
          applyFallbackStep(taskTitle, error, historyForCompare);
          return;
        }
      }

      applyFallbackStep(
        taskTitle,
        new Error("当前步骤需要图片、文件或音频，但这里暂时只支持文字推进。"),
        historyForCompare
      );
      return;
    }

    if (data.isTaskComplete) {
      const completionDecision = decideCompletionBoundary({
        taskTitle,
        completedStep: data.step || data.sessionSummary || "",
        stepHistory: historyForCompare,
        aiSuggestedComplete: true
      });

      if (
        applyCompletionBoundaryDecision(
          completionDecision,
          taskTitle,
          historyForCompare
        )
      ) {
        return;
      }

      showTaskCompletionConfirmation(taskTitle, completionDecision);
      return;
    }

    updateCurrentTask({
      currentStep: nextStep,
      status: APP_STATUS.READY,
      sessionSummary: data.sessionSummary || "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.AI,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  function showSimpleTaskCompletionConfirmation(taskTitle) {
    updateCurrentTask({
      currentStep: normalizeCurrentStep(createSimpleCompletionStep(taskTitle), {
        taskTitle,
        stage: "finish",
        source: STEP_SOURCE.LOCAL_RULE,
        sourceReason: "Simple task entered local completion confirmation."
      }),
      status: APP_STATUS.READY,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  function showNormalTaskCompletionCheckpoint(
    taskTitle,
    historyForCompare = stepHistory,
    options = {}
  ) {
    updateCurrentTask({
      currentStep: normalizeCurrentStep(
        createNormalTaskCompletionCheckpointStep(taskTitle, {
          pending_duplicate_retry: options.duplicateRetry || null
        }),
        {
          taskTitle,
          stage: "finish",
          source: STEP_SOURCE.LOCAL_RULE,
          sourceReason: "Normal task reached a completion checkpoint."
        }
      ),
      status: APP_STATUS.READY,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  function applyCompletionBoundaryDecision(
    decision,
    taskTitle,
    historyForCompare = stepHistory
  ) {
    if (!decision || typeof decision !== "object") {
      return false;
    }

    if (decision.action === COMPLETION_ACTIONS.SHOW_CLOSING_CHECKLIST) {
      showClosingChecklist(taskTitle, decision);
      return true;
    }

    if (decision.action === COMPLETION_ACTIONS.ASK_TASK_COMPLETION) {
      showTaskCompletionConfirmation(taskTitle, decision);
      return true;
    }

    if (decision.action === COMPLETION_ACTIONS.OFFER_SESSION_COMPLETION) {
      updateCurrentTask({
        currentStep: "",
        status: APP_STATUS.EXITED,
        stepHistory: historyForCompare,
        sessionSummary: "本轮推进已收住，任务还没有标记为完成。",
        errorMessage: "",
        generationSource: GENERATION_SOURCE.NONE,
        reEntryPoint: null,
        resistancePanelOpen: false,
        selectedResistanceType: "",
        resistanceFeedback: "",
        interruptedStep: "",
        resistanceDiagnosis: null,
        resistanceResolution: null
      });
      clearSavedReEntryPoint();
      return true;
    }

    return false;
  }

  function showClosingChecklist(taskTitle, decision) {
    updateCurrentTask({
      currentStep: normalizeCurrentStep(
        createClosingChecklistStep(taskTitle, decision),
        {
          taskTitle,
          stage: "finish",
          source: STEP_SOURCE.LOCAL_RULE,
          sourceReason: "Generated by local closing-boundary rules."
        }
      ),
      status: APP_STATUS.READY,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  function showTaskCompletionConfirmation(taskTitle, decision = {}) {
    updateCurrentTask({
      currentStep: normalizeCurrentStep(
        createTaskCompletionConfirmationStep(taskTitle, {
          completion_confirmation_type:
            COMPLETION_CONFIRMATION_TYPES.TASK_COMPLETION,
          step_text:
            "看起来这件事已经到完成边界。要把整个任务标记为已完成吗？"
        }),
        {
          taskTitle,
          stage: "finish",
          source: STEP_SOURCE.LOCAL_RULE,
          sourceReason:
            decision.reason || "Generated by local completion-boundary rules."
        }
      ),
      status: APP_STATUS.READY,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  function showDuplicateStepConfirmation(
    taskTitle,
    rejectedStep,
    historyForCompare,
    duplicateDecision
  ) {
    updateCurrentTask({
      currentStep: normalizeCurrentStep(
        createTaskCompletionConfirmationStep(taskTitle, {
          completion_confirmation_type: COMPLETION_CONFIRMATION_TYPES.DUPLICATE_STEP,
          step_text:
            "下一步和前面已经做过的内容很像。这里不是确认整个任务完成，只是确认这个重复点是否已经可以跳过。",
          pending_duplicate_retry: {
            rejectedStep: getStepText(rejectedStep),
            duplicateRetryCount: duplicateDecision.duplicateRetryCount + 1,
            rejectedSteps: duplicateDecision.rejectedSteps || [],
            previousStep: getStepText(historyForCompare[historyForCompare.length - 1])
          }
        }),
        {
          taskTitle,
          stage: "finish",
          source: STEP_SOURCE.LOCAL_RULE,
          sourceReason: "Generated by local duplicate-step confirmation rules."
        }
      ),
      status: APP_STATUS.READY,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  async function handleConfirmSimpleTaskComplete() {
    const confirmationType = getCompletionConfirmationType(currentStep);

    if (confirmationType === COMPLETION_CONFIRMATION_TYPES.DUPLICATE_STEP) {
      await handleContinueAfterDuplicateConfirmation();
      return;
    }

    const summary =
      confirmationType === COMPLETION_CONFIRMATION_TYPES.SIMPLE_TASK
        ? "已确认这个简单任务完成。"
        : "已确认整个任务完成。";

    updateCurrentTask({
      currentStep: "",
      status: APP_STATUS.COMPLETED,
      sessionSummary: summary,
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  async function handleRequestCompletionContinuation() {
    if (
      currentStep &&
      typeof currentStep === "object" &&
      currentStep.step_type === "closing_checklist"
    ) {
      updateCurrentTask({
        currentStep: normalizeCurrentStep(
          createClosingFollowupStep(taskInput, currentStep),
          {
            taskTitle: taskInput,
            stage: "finish",
            source: STEP_SOURCE.LOCAL_RULE,
            sourceReason: "Generated one local follow-up from the closing checklist."
          }
        ),
        status: APP_STATUS.READY,
        sessionSummary: "",
        errorMessage: "",
        generationSource: GENERATION_SOURCE.NONE,
        reEntryPoint: null,
        resistancePanelOpen: false,
        selectedResistanceType: "",
        resistanceFeedback: "",
        interruptedStep: "",
        resistanceDiagnosis: null,
        resistanceResolution: null
      });
      clearSavedReEntryPoint();
      return;
    }

    const confirmationType = getCompletionConfirmationType(currentStep);

    if (
      confirmationType === COMPLETION_CONFIRMATION_TYPES.TASK_COMPLETION ||
      confirmationType === COMPLETION_CONFIRMATION_TYPES.DUPLICATE_STEP
    ) {
      if (confirmationType === COMPLETION_CONFIRMATION_TYPES.DUPLICATE_STEP) {
        updateCurrentTask({
          currentStep: withStepSource(
            getNonDuplicateFallbackStep(taskInput, stepHistory),
            STEP_SOURCE.LOCAL_RULE,
            "Generated a local non-duplicate step after duplicate confirmation."
          ),
          status: APP_STATUS.READY,
          sessionSummary: "",
          errorMessage: "",
          generationSource: GENERATION_SOURCE.NONE,
          reEntryPoint: null,
          resistancePanelOpen: false,
          selectedResistanceType: "",
          resistanceFeedback: "",
          interruptedStep: "",
          resistanceDiagnosis: null,
          resistanceResolution: null
        });
        clearSavedReEntryPoint();
        return;
      }

      updateCurrentTask({
        currentStep: normalizeCurrentStep(
          createClosingFollowupStep(taskInput, currentStep),
          {
            taskTitle: taskInput,
            stage: "finish",
            source: STEP_SOURCE.LOCAL_RULE,
            sourceReason:
              "Generated one local finishing step after completion confirmation."
          }
        ),
        status: APP_STATUS.READY,
        sessionSummary: "",
        errorMessage: "",
        generationSource: GENERATION_SOURCE.NONE,
        reEntryPoint: null,
        resistancePanelOpen: false,
        selectedResistanceType: "",
        resistanceFeedback: "",
        interruptedStep: "",
        resistanceDiagnosis: null,
        resistanceResolution: null
      });
      clearSavedReEntryPoint();
      return;
    }

    if (shouldContinueCompletionConfirmationWithAi(currentStep)) {
      await handleContinueAfterNormalTaskCheckpoint();
      return;
    }

    updateCurrentTask({
      currentStep: normalizeCurrentStep(createSimpleFinishingStep(taskInput), {
        taskTitle: taskInput,
        stage: "finish",
        source: STEP_SOURCE.LOCAL_RULE,
        sourceReason: "Simple task generated a local final-step prompt."
      }),
      status: APP_STATUS.READY,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  async function handleContinueAfterNormalTaskCheckpoint() {
    const pendingDuplicateRetry =
      currentStep &&
      typeof currentStep === "object" &&
      currentStep.pending_duplicate_retry &&
      typeof currentStep.pending_duplicate_retry === "object"
        ? currentStep.pending_duplicate_retry
        : null;

    updateCurrentTask({
      currentStep: "",
      status: APP_STATUS.LOADING,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null,
      completionCheckpointDismissedAtStepCount: stepHistory.length
    });
    clearSavedReEntryPoint();

    try {
      const data = pendingDuplicateRetry
        ? await regenerateAfterDuplicateStep({
            taskTitle: taskInput,
            rejectedStep: pendingDuplicateRetry.rejectedStep,
            historyForCompare: stepHistory,
            taskContext: task.taskContext,
            duplicateRetryCount: pendingDuplicateRetry.duplicateRetryCount,
            rejectedSteps: pendingDuplicateRetry.rejectedSteps
          })
        : await generateNextStep(
            buildTaskGenerationPayload({
              taskTitle: taskInput,
              taskContext: task.taskContext,
              stepHistory
            }),
            stepHistory
          );

      await applyGeneratedStep(data, taskInput, stepHistory, {
        duplicateRetryCount: pendingDuplicateRetry?.duplicateRetryCount,
        rejectedSteps: pendingDuplicateRetry?.rejectedSteps,
        stepSource: pendingDuplicateRetry
          ? STEP_SOURCE.DUPLICATE_RETRY
          : STEP_SOURCE.AI,
        sourceReason: pendingDuplicateRetry
          ? "Regenerated after normal-task duplicate checkpoint."
          : "Generated after normal-task completion checkpoint.",
        completionCheckpointDismissedAtStepCount: stepHistory.length
      });
    } catch (error) {
      applyFallbackStep(taskInput, error, stepHistory);
    }
  }

  async function handleContinueAfterDuplicateConfirmation() {
    const pendingDuplicateRetry =
      currentStep &&
      typeof currentStep === "object" &&
      currentStep.pending_duplicate_retry &&
      typeof currentStep.pending_duplicate_retry === "object"
        ? currentStep.pending_duplicate_retry
        : null;

    updateCurrentTask({
      currentStep: "",
      status: APP_STATUS.LOADING,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();

    try {
      const data = pendingDuplicateRetry
        ? await regenerateAfterDuplicateStep({
            taskTitle: taskInput,
            rejectedStep: pendingDuplicateRetry.rejectedStep,
            historyForCompare: stepHistory,
            taskContext: task.taskContext,
            duplicateRetryCount: pendingDuplicateRetry.duplicateRetryCount,
            rejectedSteps: pendingDuplicateRetry.rejectedSteps
          })
        : await generateNextStep(
            buildTaskGenerationPayload({
              taskTitle: taskInput,
              taskContext: task.taskContext,
              stepHistory
            }),
            stepHistory
          );

      await applyGeneratedStep(data, taskInput, stepHistory, {
        duplicateRetryCount: pendingDuplicateRetry?.duplicateRetryCount,
        rejectedSteps: pendingDuplicateRetry?.rejectedSteps,
        stepSource: pendingDuplicateRetry
          ? STEP_SOURCE.DUPLICATE_RETRY
          : STEP_SOURCE.AI,
        sourceReason: pendingDuplicateRetry
          ? "Regenerated after duplicate-step phase confirmation."
          : "Generated after duplicate-step confirmation."
      });
    } catch (error) {
      applyFallbackStep(taskInput, error, stepHistory);
    }
  }

  function regenerateAfterDuplicateStep({
    taskTitle,
    rejectedStep,
    historyForCompare,
    taskContext,
    duplicateRetryCount,
    rejectedSteps
  }) {
    return generateNextStep(
      buildTaskGenerationPayload({
        taskTitle,
        taskContext: taskContext || task.taskContext,
        stepHistory: historyForCompare,
        duplicateRetry: buildDuplicateRetryContext({
          rejectedStep,
          historyForCompare,
          duplicateRetryCount,
          rejectedSteps,
          getStepText
        })
      }),
      historyForCompare
    );
  }

  function regenerateAfterUnsupportedNonTextInputRequest({
    taskTitle,
    rejectedStep,
    historyForCompare
  }) {
    const retryPayload = buildTaskGenerationPayload({
      taskTitle,
      taskContext: task.taskContext,
      stepHistory: historyForCompare,
      duplicateRetry: buildUnsupportedNonTextRetryContext({
        rejectedStep,
        historyForCompare
      })
    });

    if (historyForCompare.length === 0) {
      return generateFirstStep(retryPayload);
    }

    return generateNextStep(retryPayload, historyForCompare);
  }

  function applyFallbackStep(taskTitle, error, historyForCompare = stepHistory) {
    const fallbackErrorMessage = getReadableFallbackMessage(error);

    updateCurrentTask({
      currentStep: withStepSource(
        getNonDuplicateFallbackStep(taskTitle, historyForCompare),
        STEP_SOURCE.GENERIC_FALLBACK,
        "生成没有顺利完成时启用通用备用步骤。"
      ),
      status: APP_STATUS.READY,
      generationSource: GENERATION_SOURCE.FALLBACK,
      sessionSummary: "生成没有顺利完成，已切换到可执行的备用动作。",
      errorMessage: fallbackErrorMessage,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    clearSavedReEntryPoint();
  }

  function toggleResistancePanel() {
    updateCurrentTask((currentTask) => ({
      resistancePanelOpen: !currentTask.resistancePanelOpen,
      selectedResistanceType: "",
      resistanceFeedback: ""
    }));
  }

  function handleResistanceSelect(type) {
    applyResistance(type, "");
  }

  function handleResistanceTextSubmit(text) {
    const resistanceText = text.trim();

    if (!resistanceText) {
      return;
    }

    applyResistance("", resistanceText);
  }

  async function resolveResistanceWithUnsupportedRetry({
    aiDiagnosisContext,
    resistanceInput
  }) {
    const firstResult = await resolveResistanceWithAi(aiDiagnosisContext);

    if (!hasUnsupportedNonTextInputRequest(firstResult.fallback_step)) {
      return {
        aiResolutionResult: firstResult,
        retryCount: 0,
        unsupportedAfterRetry: false
      };
    }

    setResistanceLoadingMessage("正在重新生成文字可执行步骤");

    const retryResult = await resolveResistanceWithAi({
      ...aiDiagnosisContext,
      ...buildUnsupportedNonTextRetryContext({
        rejectedStep: firstResult.fallback_step,
        historyForCompare: resistanceInput.stepHistory || []
      }),
      previousStep: getStepText(currentStep)
    });

    return {
      aiResolutionResult: retryResult,
      retryCount: 1,
      unsupportedAfterRetry: hasUnsupportedNonTextInputRequest(
        retryResult.fallback_step
      )
    };
  }

  async function applyResistance(type, resistanceText) {
    if (isResolvingResistance) {
      return;
    }

    startResistanceLoading();

    const resistanceInput = {
      taskTitle: taskInput,
      currentStep,
      stepHistory,
      userUtterance: resistanceText,
      selectedResistanceType: type
    };
    const aiDiagnosisContext = buildAiDiagnosisContext(resistanceInput);
    let aiDiagnosis = null;
    let aiRecoveryPlan = null;
    let aiRecoveryPlanError = "";
    let aiFallbackStep = null;
    let fallbackStepGeneration = {
      raw_output: "",
      parsed_fallback_step: null,
      validation_result: null,
      retry_count: 0,
      final_source: "legacy_fallback"
    };

    try {
      const {
        aiResolutionResult,
        retryCount,
        unsupportedAfterRetry
      } = await resolveResistanceWithUnsupportedRetry({
        aiDiagnosisContext,
        resistanceInput
      });
      aiDiagnosis = aiResolutionResult.diagnosis || null;
      aiRecoveryPlan = aiResolutionResult.recoveryPlan || null;
      aiRecoveryPlanError = aiResolutionResult.recoveryPlanError || "";

      const generatedStep = aiResolutionResult.fallback_step || null;
      if (unsupportedAfterRetry) {
        fallbackStepGeneration = {
          raw_output: aiResolutionResult.raw_output || "",
          parsed_fallback_step: generatedStep,
          validation_result: {
            passed: false,
            severity: "error",
            issues: [
              {
                code: "unsupported_non_text_input_request",
                severity: "error",
                message:
                  "AI 备用步骤要求了不支持的非文本输入。"
              }
            ]
          },
          retry_count: retryCount,
          final_source: "template_fallback"
        };
        console.warn(
          "[debugResistanceTrace] AI 备用步骤要求了不支持的非文本输入"
        );
      } else {
        const evaluation = evaluateAiFallbackStep(
          resistanceInput,
          generatedStep,
          aiRecoveryPlan
        );

        fallbackStepGeneration = {
          raw_output: aiResolutionResult.raw_output || "",
          parsed_fallback_step: generatedStep,
          validation_result: evaluation.validation,
          retry_count: retryCount,
          final_source: evaluation.validation.passed
            ? "ai_generated"
            : "template_fallback"
        };

        if (evaluation.validation.passed) {
          aiFallbackStep = generatedStep;
        }
      }

      console.log("[debugResistanceTrace]", {
        context: aiDiagnosisContext,
        diagnosis: aiDiagnosis,
        recoveryPlan: aiRecoveryPlan,
        fallbackStepGeneration
      });
    } catch (error) {
      aiRecoveryPlanError = error.message || "AI resistance resolution failed";
      fallbackStepGeneration = {
        ...fallbackStepGeneration,
        validation_result: {
          passed: false,
          severity: "error",
          issues: [
            {
              code: "ai_resistance_resolution_failed",
              severity: "error",
              message: aiRecoveryPlanError
            }
          ]
        },
        final_source: "legacy_fallback"
      };
      console.warn("[debugResistanceTrace] AI resistance resolution failed", error);
    }

    try {
      const resistanceResolution = resolveResistance({
        ...resistanceInput,
        aiDiagnosis,
        aiDiagnosisContext,
        aiRecoveryPlan,
        aiRecoveryPlanError,
        aiFallbackStep,
        fallbackStepGeneration
      });
      const diagnosis = resistanceResolution.diagnosis;
      const legacyDiagnosis = {
        ...diagnosis,
        ai_diagnosis: resistanceResolution.ai_diagnosis,
        ai_recovery_plan: resistanceResolution.ai_recovery_plan,
        ai_recovery_plan_error: resistanceResolution.ai_recovery_plan_error,
        ai_fallback_step: resistanceResolution.ai_fallback_step,
        debugResistanceTrace: resistanceResolution.debugResistanceTrace,
        recovery_strategy: resistanceResolution.recovery_decision.fallback_policy,
        recovery_mode: resistanceResolution.recovery_decision.recovery_mode,
        fallback_step: resistanceResolution.fallback_step
      };
      const resistanceStepSource = getResistanceStepSource(
        resistanceResolution.debugResistanceTrace?.fallbackStepGeneration
          ?.final_source
      );

      updateCurrentTask({
        status: APP_STATUS.EXECUTING,
        errorMessage: "",
        generationSource: GENERATION_SOURCE.FALLBACK,
        selectedResistanceType:
          type || getPipelineLegacyResistanceType(diagnosis.surface_resistance),
        resistanceFeedback: getPipelineDiagnosisFeedback(diagnosis),
        interruptedStep: currentStep,
        currentStep: withStepSource(
          resistanceResolution.fallback_step,
          resistanceStepSource,
          "Generated by the resistance recovery flow."
        ),
        resistanceDiagnosis: legacyDiagnosis,
        resistanceResolution,
        reEntryPoint: null,
        sessionSummary: "",
        resistancePanelOpen: false
      });
    } finally {
      stopResistanceLoading();
    }
  }

  function handleReset() {
    if (
      appStatus === APP_STATUS.COMPLETED ||
      appStatus === APP_STATUS.EXITED
    ) {
      onStartNewTask();
      return;
    }

    updateCurrentTask({
      title: "",
      currentStep: "",
      stepIndex: 0,
      stepHistory: [],
      taskContext: {},
      status: APP_STATUS.IDLE,
      sessionSummary: "",
      errorMessage: "",
      generationSource: GENERATION_SOURCE.NONE,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null
    });
    setLoadingMessage("");
    clearSavedReEntryPoint();
  }

  return (
    <main className="page page--execution">
      <header className="app-header execution-header">
        <div className="page-title-stack">
          <p className="eyebrow">AI Task Runner</p>
          <div className="title-row">
            <button
              aria-label="返回我的任务"
              className="back-icon-button"
              type="button"
              onClick={onBack}
            >
              <ArrowLeft aria-hidden="true" className="icon-button-svg" size={22} />
            </button>
            <StatusPill
              className="header-status-pill"
              status={task.errorMessage ? "error" : appStatus}
            />
          </div>
        </div>
      </header>

      <div className="workspace-grid">
        <section
          className={`surface-card task-panel${
            isTaskComposer ? "" : " task-panel--compact"
          }`}
          aria-labelledby="task-title"
        >
          <div className="section-heading">
            <p className="section-kicker">{taskPanelCopy.kicker}</p>
            <h2 id="task-title">{taskPanelCopy.title}</h2>
          </div>

          {isTaskComposer ? (
            <form onSubmit={handleSubmitTask} className="task-form">
              <label className="field-label" htmlFor="task-input">
                待推进任务
              </label>
              <textarea
                id="task-input"
                value={taskInput}
                onChange={handleTitleChange}
                placeholder="例如：写作品集项目介绍 / 回老师消息 / 整理论文选题"
                disabled={isTaskLocked}
              />
              <button
                className="primary-action"
                type="submit"
                disabled={isTaskLocked}
              >
                <Sparkles aria-hidden="true" className="button-icon" size={18} />
                生成第一步
              </button>
            </form>
          ) : (
            <div className="task-summary" aria-live="polite">
              <div className="task-summary-main">
                <span
                  aria-hidden="true"
                  className={`task-summary-icon task-summary-icon--${
                    task.errorMessage ? "error" : statusMeta.tone
                  }`}
                >
                  {getTaskStatusIcon(appStatus, Boolean(task.errorMessage))}
                </span>
                <div>
                  <p className="task-summary-label">{taskPanelCopy.summary}</p>
                  <p className="task-summary-text">
                    {taskInput || "暂无任务内容"}
                  </p>
                </div>
              </div>
              <div className="task-summary-statuses" aria-label="保存状态">
                <span className="autosave-note">自动保存</span>
              </div>
            </div>
          )}
        </section>

        <StepCard
          appStatus={appStatus}
          currentStep={currentStep}
          currentStepNumber={currentStepNumber}
          loadingMessage={loadingMessage}
          generationSource={task.generationSource}
          isUsingFallback={isUsingFallback}
          reEntryPoint={task.reEntryPoint}
          resistancePanelOpen={task.resistancePanelOpen}
          resistanceResult={resistanceResult}
          isResolvingResistance={isResolvingResistance}
          resistanceLoadingMessage={resistanceLoadingMessage}
          sessionSummary={task.sessionSummary}
          errorMessage={task.errorMessage}
          onStartExecuting={handleStartExecuting}
          onResumeCurrentStep={handleResumeCurrentStep}
          onCompleteCurrentStep={handleCompleteCurrentStep}
          onConfirmSimpleTaskComplete={handleConfirmSimpleTaskComplete}
          onRequestSimpleTaskFinalStep={handleRequestCompletionContinuation}
          onSubmitClarificationAnswer={handleSubmitClarificationAnswer}
          onToggleResistancePanel={toggleResistancePanel}
          onResistanceSelect={handleResistanceSelect}
          onResistanceTextSubmit={handleResistanceTextSubmit}
          onExit={onBack}
          onReset={handleReset}
        />

        <section className="progress-panel" aria-labelledby="progress-title">
          <button
            aria-controls="progress-history"
            aria-expanded={progressOpen}
            className="progress-summary"
            disabled={stepHistory.length === 0}
            type="button"
            onClick={() => setProgressOpen((isOpen) => !isOpen)}
          >
            <span className="progress-summary-main">
              <span className="progress-kicker-row">
                <History aria-hidden="true" className="heading-icon" size={16} />
                <span className="section-kicker">进度记录</span>
              </span>
              <strong id="progress-title">已完成 {stepHistory.length} 步</strong>
            </span>
            <span className="progress-summary-meta">
              {stepHistory.length === 0 ? "暂无记录" : "查看记录"}
              <ChevronRight
                aria-hidden="true"
                className={`progress-chevron${
                  progressOpen ? " progress-chevron--open" : ""
                }`}
                size={18}
              />
            </span>
          </button>

          {progressOpen && stepHistory.length > 0 && (
            <ol className="timeline timeline--compact" id="progress-history">
              {stepHistory.map((step, index) => (
                <li key={`${getStepText(step)}-${index}`}>
                  <span>{index + 1}</span>
                  <p>{getStepText(step)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

function createTask(overrides = {}) {
  const now = new Date().toISOString();

  return normalizeTask({
    id: createTaskId(),
    title: "",
    status: APP_STATUS.IDLE,
    currentStep: "",
    stepIndex: 0,
    stepHistory: [],
    taskContext: {},
    createdAt: now,
    updatedAt: now,
    sessionSummary: "",
    errorMessage: "",
    generationSource: GENERATION_SOURCE.NONE,
    isImportant: false,
    reEntryPoint: null,
    resistancePanelOpen: false,
    selectedResistanceType: "",
    resistanceFeedback: "",
    interruptedStep: "",
    resistanceDiagnosis: null,
    resistanceResolution: null,
    completionCheckpointDismissedAtStepCount: null,
    ...overrides
  });
}

function withStepSource(step, source, sourceReason = "") {
  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return step;
  }

  return {
    ...step,
    source: step.source || source,
    source_reason: step.source_reason || sourceReason
  };
}

function getSavedTaskStepSource(task) {
  if (task?.currentStep?.source) {
    return task.currentStep.source;
  }

  if (task?.generationSource === GENERATION_SOURCE.AI) {
    return STEP_SOURCE.AI;
  }

  if (task?.generationSource === GENERATION_SOURCE.FALLBACK) {
    return STEP_SOURCE.GENERIC_FALLBACK;
  }

  return "";
}

function getResistanceStepSource(finalSource) {
  if (finalSource === "ai_generated") {
    return STEP_SOURCE.RESISTANCE_AI;
  }

  if (finalSource === "template_fallback") {
    return STEP_SOURCE.RESISTANCE_TEMPLATE;
  }

  return STEP_SOURCE.LEGACY_RECOVERY;
}

function normalizeTask(task) {
  const now = new Date().toISOString();
  const taskTitle = task.title || "";
  const taskType = getTaskType(taskTitle);
  const stepHistory = normalizeStepHistory(task.stepHistory, {
    taskTitle,
    taskType
  });
  const currentStep = normalizeCurrentStep(task.currentStep || "", {
    taskTitle,
    taskType,
    source: getSavedTaskStepSource(task),
    sourceReason: "Loaded from saved task state."
  });
  const shouldRecoverMissingStep =
    taskTitle &&
    !currentStep &&
    (hasBrokenObjectStep(task.currentStep) ||
      task.status === APP_STATUS.READY ||
      task.status === APP_STATUS.EXECUTING);
  const recoveredCurrentStep =
    shouldRecoverMissingStep
      ? normalizeCurrentStep(getFallbackStep(taskTitle), {
          taskTitle,
          taskType,
          stage: stepHistory.length === 0 ? "start" : "execute",
          source: STEP_SOURCE.LEGACY_RECOVERY,
          sourceReason:
            "Recovered from a broken or missing saved current step."
        })
      : currentStep;
  const interruptedStep = normalizeCurrentStep(task.interruptedStep || "", {
    taskTitle,
    taskType
  });
  const normalizedStatus = Object.values(APP_STATUS).includes(task.status)
    ? task.status
    : APP_STATUS.IDLE;

  return {
    id: task.id || createTaskId(),
    title: taskTitle,
    status:
      recoveredCurrentStep && !currentStep
        ? APP_STATUS.READY
        : normalizedStatus,
    currentStep: recoveredCurrentStep,
    stepIndex: Number.isInteger(task.stepIndex)
      ? task.stepIndex
      : stepHistory.length,
    stepHistory,
    taskContext: normalizeTaskContext(task.taskContext),
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || now,
    sessionSummary: task.sessionSummary || "",
    errorMessage: task.errorMessage || "",
    generationSource:
      recoveredCurrentStep && !currentStep
        ? GENERATION_SOURCE.FALLBACK
        : task.generationSource || GENERATION_SOURCE.NONE,
    isImportant: Boolean(task.isImportant),
    reEntryPoint: normalizeReEntryPoint(task.reEntryPoint, taskTitle, taskType),
    resistancePanelOpen: Boolean(task.resistancePanelOpen),
    selectedResistanceType: task.selectedResistanceType || "",
    resistanceFeedback: task.resistanceFeedback || "",
    interruptedStep,
    resistanceDiagnosis: normalizePipelineResistanceDiagnosis(
      task.resistanceDiagnosis
    ),
    resistanceResolution: normalizePipelineResistanceResolution(
      task.resistanceResolution
    ),
    completionCheckpointDismissedAtStepCount: Number.isFinite(
      Number(task.completionCheckpointDismissedAtStepCount)
    )
      ? Math.max(0, Math.floor(Number(task.completionCheckpointDismissedAtStepCount)))
      : null
  };
}

function hasBrokenObjectStep(step) {
  if (typeof step === "string") {
    return step.trim() === "[object Object]";
  }

  if (!step || typeof step !== "object" || Array.isArray(step)) {
    return false;
  }

  return Object.values(step).some((value) => hasBrokenObjectStep(value));
}

function normalizeTaskContext(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, contextValue]) => [key, String(contextValue || "").trim()])
      .filter(([key, contextValue]) => key && contextValue)
  );
}

function getTaskContextText(taskTitle, taskContext = {}) {
  return [
    taskTitle,
    ...Object.values(taskContext || {})
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
}

function isAnsweredClarificationStep(step, taskContext) {
  if (!step || typeof step !== "object" || step.step_type !== "clarification") {
    return false;
  }

  const context = normalizeTaskContext(taskContext);
  const clarificationKey = String(step.clarification_key || "").trim();

  return Boolean(clarificationKey && context[clarificationKey]);
}

function maybeGenerateActionFromAnsweredClarification({ title, taskContext }) {
  return maybeGenerateImmediateActionStep({
    title,
    taskContext
  });
}

function maybeGenerateClarificationStep(task) {
  const taskType = detectClarificationTaskType(task.title);
  const rules = CLARIFICATION_RULES[taskType];

  if (!rules) {
    return null;
  }

  const taskContext = normalizeTaskContext(task.taskContext);
  const missingRequiredInfo = rules.find(
    (rule) => rule.required && !taskContext[rule.key]
  );

  if (!missingRequiredInfo) {
    return null;
  }

  return normalizeCurrentStep(
    {
      step_type: "clarification",
      step_text: missingRequiredInfo.question,
      clarification_key: missingRequiredInfo.key,
      input_placeholder: missingRequiredInfo.placeholder,
      completion_criteria: "补充这个信息后即可继续。",
      action_type: "write",
      estimated_effort: "low",
      stage: "clarify",
      risk_flags: ["unclear_output"]
    },
    {
      taskTitle: task.title,
      stage: "clarify",
      source: STEP_SOURCE.LOCAL_RULE,
      sourceReason: "Generated by the local clarification rule set."
    }
  );
}

function maybeGenerateImmediateActionStep(task) {
  const taskTitle = String(task.title || "").trim();
  const text = normalizeText(taskTitle);
  const taskContext = normalizeTaskContext(task.taskContext);
  const contextText = normalizeText(getTaskContextText(taskTitle, taskContext));

  if (
    hasAnyKeyword(text, ["logo", "Logo", "标志"]) &&
    hasAnyKeyword(text, ["咖啡", "咖啡店", "咖啡馆"]) &&
    hasEnoughSpecificContext(text)
  ) {
    return normalizeCurrentStep(
      {
        step_type: "action",
        step_text:
          "打开一个空白画布，写下咖啡店名称，并列出 3 个你希望 Logo 传达的关键词。",
        action_type: "write",
        completion_criteria: "",
        estimated_effort: "low",
        stage: "start",
        risk_flags: ["unclear_output"]
      },
      {
        taskTitle,
        stage: "start",
        source: STEP_SOURCE.LOCAL_RULE,
        sourceReason: "Generated by a local immediate-action rule."
      }
    );
  }

  const hasPortfolioContext = hasAnyKeyword(contextText, ["作品集", "portfolio"]);
  const hasExplicitSinglePortfolioProject = hasAnyKeyword(contextText, [
    "一个项目",
    "1个项目",
    "一个案例",
    "1个案例",
    "只有一个"
  ]);

  if (
    hasPortfolioContext &&
    !hasExplicitSinglePortfolioProject &&
    hasAnyKeyword(contextText, [
      "两个项目",
      "2个项目",
      "两个案例",
      "2个案例",
      "已有项目",
      "已有案例",
      "还没有整理",
      "还没开始整理",
      "还没整理",
      "未整理",
      "案例"
    ])
  ) {
    return normalizeCurrentStep(
      {
        step_type: "action",
        step_text:
          "新建一个文档，写下这两个项目的名称，并在每个项目下面补一句“我在这个项目中解决了什么问题”。",
        action_type: "write",
        completion_criteria: "",
        estimated_effort: "low",
        stage: "start",
        risk_flags: ["unclear_output", "perfectionism"]
      },
      {
        taskTitle,
        stage: "start",
        source: STEP_SOURCE.LOCAL_RULE,
        sourceReason: "Generated by a local immediate-action rule."
      }
    );
  }

  if (
    hasPortfolioContext &&
    hasAnyKeyword(contextText, [
      "一个项目",
      "1个项目",
      "一个案例",
      "1个案例",
      "只有一个",
      "还没开始",
      "没有开始",
      "刚开始"
    ])
  ) {
    return normalizeCurrentStep(
      {
        step_type: "action",
        step_text:
          "新建一个作品集草稿文档，写下这个唯一项目的临时名称，并补一句“这个项目最想证明我的哪种能力”。",
        action_type: "write",
        completion_criteria:
          "写出项目临时名称和 1 句能力判断即可，不需要开始排版。",
        estimated_effort: "low",
        stage: "start",
        risk_flags: ["unclear_output", "perfectionism"],
        task_object: "portfolio_single_project_entry",
        expected_output: "project name and 1 ability sentence",
        progress_intent: "define_single_portfolio_project_entry"
      },
      {
        taskTitle,
        stage: "start",
        source: STEP_SOURCE.LOCAL_RULE,
        sourceReason: "Generated by a local immediate-action rule."
      }
    );
  }

  return null;
}

function detectClarificationTaskType(taskTitle) {
  const text = normalizeText(taskTitle);

  if (hasEnoughSpecificContext(text)) {
    return "";
  }

  if (
    hasAnyKeyword(text, [
      "我想变优秀",
      "我要变优秀",
      "想提升自己",
      "我要提升自己",
      "我想提升自己",
      "我想学习 ai",
      "我想学习AI",
      "我想学 ai",
      "我想学AI",
      "我想做一个项目",
      "我要做一个项目"
    ])
  ) {
    return CLARIFICATION_TASK_TYPES.BROAD_GOAL;
  }

  if (
    hasAnyKeyword(text, [
      "帮我设计一下",
      "我要写一个东西",
      "我想写一个东西",
      "我要整理资料",
      "我要准备一下",
      "我想准备一下"
    ])
  ) {
    return CLARIFICATION_TASK_TYPES.MISSING_OBJECT;
  }

  if (
    hasAnyKeyword(text, ["我该不该", "未来该做什么", "怎么赚钱", "改变人生"]) &&
    !hasAnyKeyword(text, ["先写", "先做", "具体", "草稿", "列出"])
  ) {
    return CLARIFICATION_TASK_TYPES.UNSCOPED_DECISION;
  }

  if (
    hasAnyKeyword(text, [
      "我要做一个展示",
      "我想做一个展示",
      "我要写报告",
      "我想写报告",
      "我要做设计方案",
      "我想做设计方案"
    ])
  ) {
    return CLARIFICATION_TASK_TYPES.MISSING_CONSTRAINTS;
  }

  if (
    hasAnyKeyword(text, ["logo", "Logo", "标志", "品牌设计"]) &&
    hasAnyKeyword(text, ["店铺", "品牌", "门店", "公司", "自己的店"])
  ) {
    return CLARIFICATION_TASK_TYPES.LOGO_DESIGN;
  }

  if (
    hasAnyKeyword(text, ["简历", "resume"]) &&
    hasAnyKeyword(text, ["投", "岗位", "求职", "申请", "优化", "修改", "写"])
  ) {
    return CLARIFICATION_TASK_TYPES.RESUME;
  }

  if (hasAnyKeyword(text, ["作品集", "portfolio"])) {
    return CLARIFICATION_TASK_TYPES.PORTFOLIO;
  }

  if (hasAnyKeyword(text, ["论文", "paper"])) {
    return CLARIFICATION_TASK_TYPES.PAPER;
  }

  if (
    hasAnyKeyword(text, ["消息", "短信", "微信", "邮件", "email"]) &&
    hasAnyKeyword(text, ["写", "发", "回复", "道歉", "请假", "询问", "解释"])
  ) {
    return CLARIFICATION_TASK_TYPES.MESSAGE_WRITING;
  }

  return "";
}

function hasEnoughSpecificContext(text) {
  return hasAnyKeyword(text, [
    "已经",
    "已",
    "还没开始",
    "没开始",
    "正在",
    "做到",
    "明天",
    "今天",
    "后天",
    "本周",
    "周五",
    "交",
    "截止",
    "deadline"
  ]);
}

function buildTaskGenerationPayload({
  taskTitle,
  taskContext = {},
  clarificationAnswer = "",
  stepHistory = [],
  duplicateRetry = null
}) {
  const normalizedContext = normalizeTaskContext(taskContext);
  const retryContext =
    duplicateRetry && typeof duplicateRetry === "object"
      ? {
          retryReason: String(duplicateRetry.retryReason || "").trim(),
          rejectedStep: getStepText(duplicateRetry.rejectedStep),
          previousStep: getStepText(duplicateRetry.previousStep),
          recentCompletedSteps: Array.isArray(
            duplicateRetry.recentCompletedSteps
          )
            ? duplicateRetry.recentCompletedSteps
                .map((step) => getStepText(step))
                .filter(Boolean)
            : [],
          duplicateRetryCount: Number.isFinite(
            Number(duplicateRetry.duplicateRetryCount)
          )
            ? Math.max(0, Math.floor(Number(duplicateRetry.duplicateRetryCount)))
            : 0,
          rejectedSteps: Array.isArray(duplicateRetry.rejectedSteps)
            ? duplicateRetry.rejectedSteps
                .map((step) => getStepText(step))
                .filter(Boolean)
            : []
        }
      : null;

  return {
    task: taskTitle,
    taskContext: normalizedContext,
    clarificationAnswer: String(clarificationAnswer || "").trim(),
    stepHistory: stepHistory.map((step) => getStepText(step)).filter(Boolean),
    ...(retryContext ? retryContext : {})
  };
}

function buildUnsupportedNonTextRetryContext({
  rejectedStep,
  historyForCompare = []
}) {
  return {
    retryReason: UNSUPPORTED_NON_TEXT_RETRY_REASON,
    rejectedStep: getUserVisibleStepSummary(rejectedStep),
    previousStep: getStepText(historyForCompare[historyForCompare.length - 1])
  };
}

function hasUnsupportedNonTextInputRequest(step) {
  return collectUserVisibleStepText(step).some((text) =>
    isUnsupportedNonTextInputRequestText(text)
  );
}

function getUserVisibleStepSummary(step) {
  return collectUserVisibleStepText(step).join(" | ");
}

function collectUserVisibleStepText(value) {
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
    value.title,
    value.placeholder,
    value.input_placeholder,
    value.inputPlaceholder,
    value.completion_criteria,
    value.completionCriteria,
    value.user_visible_reason,
    value.userVisibleReason
  ]
    .flatMap((field) => collectUserVisibleStepText(field))
    .map((text) => text.trim())
    .filter(Boolean);
}

function isUnsupportedNonTextInputRequestText(value) {
  const text = normalizeText(value);

  if (!hasAnyKeyword(text, NON_TEXT_MATERIAL_KEYWORDS)) {
    return false;
  }

  if (hasAnyKeyword(text, UNSUPPORTED_NON_TEXT_RECIPIENT_KEYWORDS)) {
    return true;
  }

  if (!hasAnyKeyword(text, UNSUPPORTED_NON_TEXT_ACTION_KEYWORDS)) {
    return false;
  }

  return !hasAnyKeyword(text, EXTERNAL_NON_TEXT_TARGET_KEYWORDS);
}

function createTaskId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSavedTasks() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);

  if (rawTasks) {
    try {
      const savedTasks = JSON.parse(rawTasks);

      if (Array.isArray(savedTasks)) {
        return savedTasks.map((task) => normalizeTask(task));
      }
    } catch {
      return [];
    }
  }

  const savedReEntryPoint = readSavedReEntryPoint();

  if (!savedReEntryPoint) {
    return [];
  }

  return [
    normalizeTask(createTask({
      title: savedReEntryPoint.task,
      status: APP_STATUS.PAUSED,
      currentStep: savedReEntryPoint.currentStep,
      stepIndex: savedReEntryPoint.stepHistory.length,
      stepHistory: savedReEntryPoint.stepHistory,
      sessionSummary: savedReEntryPoint.reEntryHint || "",
      reEntryPoint: savedReEntryPoint
    }))
  ];
}

function saveTasks(tasks) {
  if (typeof window === "undefined") {
    return;
  }

  const persistableTasks = tasks.filter((task) => !isUnsavedDraftTask(task));

  window.localStorage.setItem(
    TASKS_STORAGE_KEY,
    JSON.stringify(persistableTasks)
  );
}

function isUnsavedDraftTask(task) {
  return (
    task.status === APP_STATUS.IDLE &&
    !task.title.trim() &&
    !task.currentStep &&
    task.stepHistory.length === 0
  );
}

function getTaskListDetail(task) {
  const statusMeta = getStatusMeta(task.status);
  const timeText = formatRelativeTime(task.updatedAt);

  if (task.status === APP_STATUS.COMPLETED) {
    return {
      summary: `${statusMeta.label} - 已完成 ${task.stepHistory.length} 步`,
      timeText
    };
  }

  const hasCurrentOrPendingStep =
    Boolean(task.currentStep) || task.status === APP_STATUS.IDLE;
  const stepLabel = hasCurrentOrPendingStep
    ? `第 ${task.stepIndex + 1} 步`
    : `已完成 ${task.stepHistory.length} 步`;
  const rawSummary = getStepText(task.currentStep);
  const summary = getSafeDisplayText(rawSummary, "等待生成第一步");

  return {
    summary: `${statusMeta.label} - ${stepLabel} - ${summary}`,
    timeText
  };
}

function getTaskStatusIcon(status, hasError = false) {
  const meta = getStatusPillMeta(hasError ? "error" : status);
  const Icon = meta.icon;

  return <Icon size={16} strokeWidth={2.4} />;
}

function getSafeDisplayText(value, fallback = "") {
  const text = String(value || "").trim();

  if (!text || isMojibakeText(text)) {
    return fallback;
  }

  return text;
}

function isMojibakeText(value) {
  const text = String(value || "");

  if (!text) {
    return false;
  }

  const mojibakeSignals =
    text.match(/[\u93b4\u6220\u6b91\u6d60\u8bf2\u59df\u6d93\u7ed7\u59dd\u6b12\u7ded\u934f\u6fc8\u7cba\u93c4\u951b]/g) ||
    [];
  const replacementSignals = text.match(/[\uFFFD]/g) || [];

  return mojibakeSignals.length >= 3 || replacementSignals.length > 0;
}

function formatRelativeTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }

  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "刚刚";
  }

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)} 分钟前`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)} 小时前`;
  }

  if (diffMs < day * 2) {
    return "昨天";
  }

  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric"
  });
}

function isInvalidStep(step) {
  const text = getStepText(step);

  if (!text) {
    return true;
  }

  if (text.length < 4) {
    return true;
  }

  const invalidPhrases = [
    "I cannot",
    "I can't",
    "cannot help",
    "无法提供",
    "我不能",
    "请提供更多信息"
  ];

  return invalidPhrases.some((phrase) => text.includes(phrase));
}

function isDuplicateStep(nextStep, history) {
  return isDuplicateStepEntry(nextStep, history);
}

function getStepText(step) {
  if (typeof step === "string") {
    return step.trim() === "[object Object]" ? "" : step;
  }

  if (!step || typeof step !== "object") {
    return "";
  }

  return getReadableStepText(step);
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

function normalizeCurrentStep(value, options = {}) {
  const stepText = getStepText(value).trim();

  if (!stepText) {
    return "";
  }

  const rawStep = value && typeof value === "object" ? value : {};
  const taskTitle = options.taskTitle || "";
  const taskType = options.taskType || getTaskType(taskTitle || stepText);
  const stepType =
    rawStep.step_type === "clarification" ||
    rawStep.step_type === "completion_confirmation" ||
    rawStep.step_type === "closing_checklist"
      ? rawStep.step_type
      : "action";
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
  const source = String(rawStep.source || options.source || "").trim();
  const sourceReason = String(
    rawStep.source_reason ||
      rawStep.sourceReason ||
      options.sourceReason ||
      ""
  ).trim();

  const normalizedStep = {
    step_type: stepType,
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
    })
  };

  if (source) {
    normalizedStep.source = source;
  }

  if (sourceReason) {
    normalizedStep.source_reason = sourceReason;
  }

  if (stepType === "clarification") {
    normalizedStep.clarification_key = String(
      rawStep.clarification_key ||
        rawStep.clarificationKey ||
        "clarification_answer"
    ).trim();
    normalizedStep.input_placeholder = String(
      rawStep.input_placeholder || rawStep.inputPlaceholder || ""
    ).trim();
  }

  if (stepType === "completion_confirmation") {
    normalizedStep.simple_task_type = String(rawStep.simple_task_type || "").trim();
    normalizedStep.completion_confirmation_type =
      String(rawStep.completion_confirmation_type || "").trim() ||
      COMPLETION_CONFIRMATION_TYPES.SIMPLE_TASK;

    if (
      rawStep.pending_duplicate_retry &&
      typeof rawStep.pending_duplicate_retry === "object" &&
      !Array.isArray(rawStep.pending_duplicate_retry)
    ) {
      normalizedStep.pending_duplicate_retry = {
        rejectedStep: getStepText(rawStep.pending_duplicate_retry.rejectedStep),
        duplicateRetryCount: Number.isFinite(
          Number(rawStep.pending_duplicate_retry.duplicateRetryCount)
        )
          ? Math.max(
              0,
              Math.floor(Number(rawStep.pending_duplicate_retry.duplicateRetryCount))
            )
          : 1,
        rejectedSteps: Array.isArray(rawStep.pending_duplicate_retry.rejectedSteps)
          ? rawStep.pending_duplicate_retry.rejectedSteps
              .map((step) => getStepText(step))
              .filter(Boolean)
          : [],
        previousStep: getStepText(rawStep.pending_duplicate_retry.previousStep)
      };
    }
  }

  if (stepType === "closing_checklist") {
    normalizedStep.closing_checklist_title = String(
      rawStep.closing_checklist_title || ""
    ).trim();
    normalizedStep.closing_checklist_items = Array.isArray(
      rawStep.closing_checklist_items
    )
      ? rawStep.closing_checklist_items
          .map((item) => String(item || "").trim())
          .filter(Boolean)
      : [];
    normalizedStep.closing_followup_text = String(
      rawStep.closing_followup_text || ""
    ).trim();
  }

  [
    "task_object",
    "expected_output",
    "progress_intent",
    "progress_delta",
    "why_not_duplicate"
  ].forEach((field) => {
    const fieldValue = String(rawStep[field] || "").trim();

    if (fieldValue) {
      normalizedStep[field] = fieldValue;
    }
  });

  return normalizedStep;
}

function normalizeHistoryStep(value, options = {}) {
  const normalizedStep = normalizeCurrentStep(value, options);

  if (!normalizedStep) {
    return null;
  }

  return normalizedStep;
}

function normalizeStepHistory(stepHistory, options = {}) {
  if (!Array.isArray(stepHistory)) {
    return [];
  }

  return stepHistory
    .map((step) => normalizeHistoryStep(step, options))
    .filter(Boolean);
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

function normalizeReEntryPoint(reEntryPoint, taskTitle, taskType) {
  if (!reEntryPoint || typeof reEntryPoint !== "object") {
    return null;
  }

  const currentStep = normalizeCurrentStep(reEntryPoint.currentStep, {
    taskTitle,
    taskType
  });
  const stepHistory = normalizeStepHistory(reEntryPoint.stepHistory, {
    taskTitle,
    taskType
  });

  return {
    ...reEntryPoint,
    currentStep,
    stepHistory,
    reEntryHint: reEntryPoint.reEntryHint || generateReEntryHint(currentStep)
  };
}

function normalizeResistanceDiagnosis(diagnosis) {
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
    recovery_strategy: diagnosis.recovery_strategy || "fallback_step",
    fallback_step: fallbackStep
  };
}

function diagnoseResistanceLegacy(context) {
  const taskTitle = context.task_title || "";
  const taskType = context.task_type || getTaskType(taskTitle);
  const currentStep = normalizeCurrentStep(context.currentStep, {
    taskTitle,
    taskType
  });
  const userUtterance = context.user_utterance || "";
  const surfaceResistance = identifySurfaceResistance(
    userUtterance,
    context.selected_resistance_type
  );
  const rootCause = identifyRootCause({
    taskTitle,
    taskType,
    currentStep,
    stepHistory: context.stepHistory || [],
    userUtterance,
    surfaceResistance
  });
  const recoveryStrategy = getRecoveryStrategy(rootCause);
  const fallbackStep = generateFallbackStepFromDiagnosis({
    taskTitle,
    taskType,
    currentStep,
    userUtterance,
    rootCause
  });

  return {
    surface_resistance: surfaceResistance,
    root_cause: rootCause,
    recovery_strategy: recoveryStrategy,
    fallback_step: fallbackStep
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
    if (
      hasAnyKeyword(text, [
        "值不值",
        "值不值得",
        "要不要",
        "该不该",
        "是否继续",
        "放弃",
        "没意义",
        "还要不要"
      ])
    ) {
      return "not_sure";
    }

    if (
      hasAnyKeyword(text, [
        "累",
        "困",
        "头疼",
        "头痛",
        "没力气",
        "没电",
        "撑不住",
        "状态差",
        "不舒服",
        "想睡"
      ])
    ) {
      return "bad_state";
    }

    if (
      hasAnyKeyword(text, [
        "不会",
        "太难",
        "不知道",
        "没思路",
        "看不懂",
        "太复杂",
        "做不完"
      ])
    ) {
      return "too_hard";
    }

    if (hasAnyKeyword(text, ["不想", "不愿意", "不敢", "拖着", "逃避", "烦"])) {
      return "dont_want";
    }
  }

  return selectedMap[selectedType] || "dont_want";
}

function identifyRootCause({
  taskTitle,
  taskType,
  currentStep,
  userUtterance,
  surfaceResistance
}) {
  const utteranceRoot = getRootCauseFromUtterance({
    taskTitle,
    taskType,
    currentStep,
    userUtterance
  });

  if (utteranceRoot) {
    return utteranceRoot;
  }

  const riskRoot = getRootCauseFromRiskFlags(
    currentStep?.risk_flags || [],
    surfaceResistance
  );

  if (riskRoot) {
    return riskRoot;
  }

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

  if (
    hasAnyKeyword(text, [
      "累",
      "困",
      "头疼",
      "头痛",
      "没力气",
      "没电",
      "撑不住",
      "状态差",
      "身体",
      "起不来",
      "想睡"
    ])
  ) {
    return "physical_low_energy";
  }

  if (
    hasAnyKeyword(text, [
      "值不值",
      "值不值得",
      "要不要",
      "该不该",
      "是否继续",
      "没意义",
      "不值得",
      "方向",
      "放弃",
      "继续有什么用"
    ])
  ) {
    return "value_uncertainty";
  }

  if (
    hasAnyKeyword(text, [
      "很烂",
      "太烂",
      "不够好",
      "不完美",
      "拿不出手",
      "像废话",
      "像小学生",
      "不专业",
      "业余",
      "改不好"
    ])
  ) {
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
  const hasEmotionalWords = hasAnyKeyword(text, [
    "怕",
    "害怕",
    "不敢",
    "焦虑",
    "压力",
    "尴尬",
    "丢脸",
    "被骂",
    "被讨厌",
    "生气",
    "冲突",
    "不想点开",
    "逃避",
    "难受"
  ]);

  if ((hasSocialContext || hasSocialWords) && hasEmotionalWords) {
    return "emotional_pressure";
  }

  if (hasSocialWords) {
    return "social_pressure";
  }

  if (hasEmotionalWords) {
    return "emotional_pressure";
  }

  if (
    hasAnyKeyword(text, [
      "不知道怎么",
      "不知道写什么",
      "不知道标准",
      "不会",
      "没思路",
      "没方向",
      "看不懂",
      "太乱"
    ])
  ) {
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

function getRecoveryStrategy(rootCause) {
  const strategyMap = {
    unclear_output: "clear_output_template_or_options",
    too_large: "shrink_to_first_physical_action",
    emotional_pressure: "safe_draft_before_contact",
    social_pressure: "draft_before_send_or_low_risk_opening",
    perfectionism: "low_quality_draft",
    physical_low_energy: "reduce_body_cost_or_30_second_action",
    value_uncertainty: "minimum_value_check"
  };

  return strategyMap[rootCause] || "fallback_step";
}

function generateFallbackStepFromDiagnosis({
  taskTitle,
  taskType,
  currentStep,
  rootCause
}) {
  const currentText = getStepText(currentStep);
  const combinedText = normalizeText(`${taskTitle} ${currentText}`);
  const stage = currentStep?.stage || "start";

  if (rootCause === "unclear_output") {
    if (isContactRelated(taskTitle, taskType, currentStep)) {
      return makeFallbackStep(
        {
          step_text:
            "先在备忘录里写一句：您好，我想确认一下这件事下一步需要我做什么。",
          action_type: "write",
          completion_criteria: "只要写出这一句话即可，不需要发送。",
          stage: "clarify",
          risk_flags: ["unclear_output", "social_pressure"]
        },
        taskTitle,
        taskType
      );
    }

    if (taskType === TASK_TYPES.LEARNING_INPUT || currentStep?.action_type === "review") {
      return makeFallbackStep(
        {
          step_text: "先在当前资料里圈出一个你看得懂的关键词。",
          action_type: "review",
          completion_criteria: "只要圈出或记下 1 个关键词，就算完成。",
          stage: "clarify",
          risk_flags: ["unclear_output"]
        },
        taskTitle,
        taskType
      );
    }

    return makeFallbackStep(
      {
        step_text:
          "先写下这一步最后要留下的一个产出名称，例如：一句话、一个文件名或一个选项。",
        action_type: "write",
        completion_criteria: "只要写出 1 个产出名称即可，不需要开始做内容。",
        stage: "clarify",
        risk_flags: ["unclear_output"]
      },
      taskTitle,
      taskType
    );
  }

  if (rootCause === "too_large") {
    if (taskType === TASK_TYPES.PHYSICAL_ACTION || currentStep?.action_type === "move") {
      return makeFallbackStep(
        {
          step_text: "先只站起来，把第一个要处理的东西放到手边。",
          action_type: "move",
          completion_criteria: "东西到手边就算完成，不需要继续处理。",
          stage,
          risk_flags: ["too_large", "physical_low_energy"]
        },
        taskTitle,
        taskType
      );
    }

    if (currentStep?.action_type === "write") {
      return makeFallbackStep(
        {
          step_text: "先只打开文档，写下一个临时标题。",
          action_type: "write",
          completion_criteria: "写出临时标题就算完成，不需要写正文。",
          stage,
          risk_flags: ["too_large", "perfectionism"]
        },
        taskTitle,
        taskType
      );
    }

    return makeFallbackStep(
      {
        step_text: "先只打开当前步骤需要的页面或文件，不做后续操作。",
        action_type: "open",
        completion_criteria: "看到页面或文件内容就算完成。",
        stage,
        risk_flags: ["too_large"]
      },
      taskTitle,
      taskType
    );
  }

  if (rootCause === "emotional_pressure") {
    if (isContactRelated(taskTitle, taskType, currentStep)) {
      return makeFallbackStep(
        {
          step_text:
            "先不要打开微信或邮箱，先在备忘录里写一句：您好，我想和您同步一下目前进度。",
          action_type: "write",
          completion_criteria: "只要写出这一句话即可，不需要发送。",
          stage: "start",
          risk_flags: ["perfectionism", "social_pressure"]
        },
        taskTitle,
        taskType
      );
    }

    return makeFallbackStep(
      {
        step_text: "先写下你最担心发生的一个后果，只写一句，不处理它。",
        action_type: "write",
        completion_criteria: "写出 1 个担心的后果就算完成，不需要解决它。",
        stage: "clarify",
        risk_flags: ["emotional_pressure"]
      },
      taskTitle,
      taskType
    );
  }

  if (rootCause === "social_pressure") {
    return makeFallbackStep(
      {
        step_text:
          "先在备忘录里写一版不发送的开场白：您好，我想和您确认一下这件事。",
        action_type: "write",
        completion_criteria: "只要写出这句开场白即可，不需要发送。",
        stage: "start",
        risk_flags: ["social_pressure", "perfectionism"]
      },
      taskTitle,
      taskType
    );
  }

  if (rootCause === "perfectionism") {
    if (hasAnyKeyword(combinedText, ["简历", "作品集", "项目经历"])) {
      return makeFallbackStep(
        {
          step_text:
            "先写一版很粗糙的项目经历草稿，只写你做了什么，不写得漂亮。",
          action_type: "write",
          completion_criteria: "写出一句“我负责了什么”即可，不需要润色。",
          stage: currentStep?.stage || "execute",
          risk_flags: ["perfectionism"]
        },
        taskTitle,
        taskType
      );
    }

    if (hasAnyKeyword(combinedText, ["ppt", "幻灯片", "汇报", "设计"])) {
      return makeFallbackStep(
        {
          step_text: "先做一个很粗糙的占位版本，只写标题或一句话，不美化。",
          action_type: "write",
          completion_criteria: "只要留下一个占位标题或一句话，就算完成。",
          stage: currentStep?.stage || "execute",
          risk_flags: ["perfectionism"]
        },
        taskTitle,
        taskType
      );
    }

    return makeFallbackStep(
      {
        step_text: "先写一个故意粗糙的第一句，只表达意思，不追求好。",
        action_type: "write",
        completion_criteria: "写出 1 句粗糙版本即可，不需要修改。",
        stage: currentStep?.stage || "execute",
        risk_flags: ["perfectionism"]
      },
      taskTitle,
      taskType
    );
  }

  if (rootCause === "physical_low_energy") {
    if (taskType === TASK_TYPES.PHYSICAL_ACTION || currentStep?.action_type === "move") {
      return makeFallbackStep(
        {
          step_text: "先做 30 秒动作：站起来，把离你最近的一个相关物品放到手边。",
          action_type: "move",
          completion_criteria: "完成这个 30 秒动作就算完成，不需要继续。",
          stage: "start",
          risk_flags: ["physical_low_energy"]
        },
        taskTitle,
        taskType
      );
    }

    return makeFallbackStep(
      {
        step_text: "先做一个恢复点：喝一口水或调整坐姿，然后把任务入口放到眼前。",
        action_type: "move",
        completion_criteria: "完成这个恢复点就算完成，不需要马上继续任务。",
        stage: "start",
        risk_flags: ["physical_low_energy"]
      },
      taskTitle,
      taskType
    );
  }

  return makeFallbackStep(
    {
      step_text: `Write one result you still want from ${taskTitle || "this task"}, and one cost you want to avoid.`,
      action_type: "write",
      completion_criteria: "各写出一句即可，不需要现在做最终决定。",
      stage: "clarify",
      risk_flags: ["value_uncertainty"]
    },
    taskTitle,
    taskType
  );
}

function makeFallbackStep(step, taskTitle, taskType) {
  return normalizeCurrentStep(
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
      "发送",
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

function getLegacyResistanceType(surfaceResistance) {
  const typeMap = {
    too_hard: "tooHard",
    dont_want: "dontWant",
    not_sure: "unsure",
    bad_state: "notReady"
  };

  return typeMap[surfaceResistance] || "dontWant";
}

function getDiagnosisFeedback(diagnosis) {
  const feedbackMap = {
    unclear_output: "已先补一个明确产出边界，再继续。",
    too_large: "已把入口压到更小的第一动作。",
    emotional_pressure: "已先避开发送和后果压力，改成安全草稿。",
    social_pressure: "已先改成不发送的低风险开场白。",
    perfectionism: "已改成低质量草稿入口，不要求写好。",
    physical_low_energy: "已改成低身体成本的 30 秒入口。",
    value_uncertainty: "已停止强推执行，先做最小价值确认。"
  };

  return feedbackMap[diagnosis.root_cause] || "已生成更容易继续的备用步骤。";
}

function getFallbackStep(task) {
  const taskType = getTaskType(task);
  const taskSubtype = getTaskSubtype(task, taskType);
  const text = normalizeText(task);

  if (taskType === TASK_TYPES.WRITING_OUTPUT) {
    if (taskSubtype === TASK_SUBTYPES.PPT_CREATION) {
      return "打开 PPT，新建第一页，先写上标题。";
    }

    if (taskSubtype === TASK_SUBTYPES.PROPOSAL_COPY) {
      return "打开文档，先写下这份文案最想突出的一句话。";
    }

    return "打开文档，先写下标题和一个小标题。";
  }

  if (taskType === TASK_TYPES.LEARNING_INPUT) {
    if (taskSubtype === TASK_SUBTYPES.VOCABULARY_MEMORIZATION) {
      return "打开单词书或单词 App，先选出今天要背的 5 个单词。";
    }

    if (taskSubtype === TASK_SUBTYPES.CHAPTER_STUDY) {
      return "打开课程资料，先看这一章的标题和小节目录。";
    }

    return "打开相关资料，阅读第一小节，并记录 3 个要点。";
  }

  if (taskType === TASK_TYPES.PHYSICAL_ACTION) {
    if (taskSubtype === TASK_SUBTYPES.CLEANING_TIDYING) {
      return "先只处理眼前最明显的 1 件物品。";
    }

    if (taskSubtype === TASK_SUBTYPES.SHOPPING_ERRAND) {
      return "先写下要买的 3 件东西，再拿上手机和钥匙。";
    }

    return "先换好衣服或鞋，站起来走到门口。";
  }

  if (taskType === TASK_TYPES.TASK_PROCESSING) {
    if (taskSubtype === TASK_SUBTYPES.REPLY_MESSAGE) {
      return "先打开聊天窗口，找到那条需要回复的消息。";
    }

    if (taskSubtype === TASK_SUBTYPES.SEND_EMAIL) {
      return "先打开邮箱，新建邮件并填好收件人。";
    }

    if (taskSubtype === TASK_SUBTYPES.SUBMIT_APPLICATION) {
      return "先打开目标岗位页面，确认简历是否已经准备好。";
    }

    return "先打开需要处理的入口，只定位到那条消息、邮件或办理页面。";
  }

  if (taskType === TASK_TYPES.DECISION_MAKING) {
    return "先写下继续和不继续各 1 个最重要的理由。";
  }

  if (hasAnyKeyword(text, ["整理", "收纳", "清理", "打扫", "归档"])) {
    return "先清理最明显的一小块区域，并把无关物品移走。";
  }

  if (hasAnyKeyword(text, ["会议", "演示", "沟通", "面试", "讨论"])) {
    return "打开一个空白文档，写下这次沟通最想达成的 1 个目标。";
  }

  return "打开相关工具，写下这个任务现在能立刻完成的最小动作。";
}

function getNonDuplicateFallbackStep(taskTitle, history = []) {
  const taskType = getTaskType(taskTitle);
  const stage = history.length === 0 ? "start" : "execute";
  const primaryStep = normalizeCurrentStep(getFallbackStep(taskTitle), {
    taskTitle,
    taskType,
    stage
  });

  if (!isDuplicateStep(primaryStep, history)) {
    return primaryStep;
  }

  const fallbackCandidates = [
    {
      step_text: "打开一个空白文档，写下这个任务下一步要留下的具体产出名称。",
      action_type: "write",
      completion_criteria: "写出 1 个产出名称即可，不需要开始制作内容。",
      stage,
      risk_flags: ["unclear_output"]
    },
    {
      step_text: "写下你已经完成的 1 件事，以及下一步还缺的 1 件事。",
      action_type: "write",
      completion_criteria: "各写出 1 句话即可，不需要整理成计划。",
      stage: "review",
      risk_flags: ["unclear_output"]
    },
    {
      step_text: "打开当前任务相关文件，只标出你准备继续处理的位置。",
      action_type: "open",
      completion_criteria: "看到并标出继续处理的位置即可，不需要修改内容。",
      stage,
      risk_flags: ["too_large"]
    },
    {
      step_text: "新建一行空白记录，写下你接下来 5 分钟只处理哪一个小块。",
      action_type: "write",
      completion_criteria: "写出一个小块名称即可，不需要继续拆分。",
      stage: "clarify",
      risk_flags: ["too_large", "unclear_output"]
    }
  ];

  for (const candidate of fallbackCandidates) {
    const fallbackStep = normalizeCurrentStep(candidate, {
      taskTitle,
      taskType,
      stage: candidate.stage
    });

    if (!isDuplicateStep(fallbackStep, history)) {
      return fallbackStep;
    }
  }

  return normalizeCurrentStep(
    {
      step_text: `写下这一步和上一条已完成步骤不同的 1 个动作，动作对象是：${taskTitle}`,
      action_type: "write",
      completion_criteria: "只要写出 1 个不同动作即可。",
      stage: "clarify",
      risk_flags: ["unclear_output"]
    },
    {
      taskTitle,
      taskType,
      stage: "clarify"
    }
  );
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

function getResistanceSignal(resistanceText) {
  const text = normalizeText(resistanceText);

  if (!text) {
    return {
      signalType: RESISTANCE_SIGNALS.GENERAL,
      resistanceType: "dontWant"
    };
  }

  if (
    hasAnyKeyword(text, [
      "头疼",
      "头痛",
      "胃不舒服",
      "肚子疼",
      "疼",
      "困",
      "累",
      "没电",
      "撑不住",
      "不舒服",
      "想睡",
      "哭",
      "崩溃",
      "脑子糊",
      "状态差"
    ])
  ) {
    return {
      signalType: RESISTANCE_SIGNALS.PHYSICAL_LOW_STATE,
      resistanceType: "notReady"
    };
  }

  if (
    hasAnyKeyword(text, [
      "值不值",
      "没意义",
      "要不要",
      "该不该",
      "是不是该停",
      "骗自己",
      "没希望",
      "不值得",
      "还要不要",
      "继续有什么用"
    ])
  ) {
    return {
      signalType: RESISTANCE_SIGNALS.VALUE_DOUBT,
      resistanceType: "unsure"
    };
  }

  if (
    hasAnyKeyword(text, [
      "怕",
      "被骂",
      "责备",
      "尴尬",
      "丢脸",
      "记恨",
      "生气",
      "冲突",
      "吵架",
      "小气",
      "没人情味",
      "不靠谱",
      "被讨厌"
    ])
  ) {
    return {
      signalType: RESISTANCE_SIGNALS.EMOTIONAL_PRESSURE,
      resistanceType: "dontWant"
    };
  }

  if (
    hasAnyKeyword(text, [
      "不够好",
      "不够高级",
      "太普通",
      "像废话",
      "像小学生",
      "还差一点",
      "有错",
      "不完美",
      "很菜",
      "业余",
      "拿不出手"
    ])
  ) {
    return {
      signalType: RESISTANCE_SIGNALS.PERFECTIONISM,
      resistanceType: "dontWant"
    };
  }

  if (
    hasAnyKeyword(text, [
      "不知道",
      "不会",
      "看不懂",
      "越看越乱",
      "没思路",
      "没方向",
      "脑子乱",
      "不知道怎么",
      "不知道写什么",
      "不知道标准",
      "太乱"
    ])
  ) {
    return {
      signalType: RESISTANCE_SIGNALS.COGNITIVE_CONFUSION,
      resistanceType: "tooHard"
    };
  }

  return {
    signalType: RESISTANCE_SIGNALS.GENERAL,
    resistanceType: "dontWant"
  };
}

function generateSmallerStep(taskType, step, task, resistanceText = "") {
  const resistanceSignal = getResistanceSignal(resistanceText);
  const stepText = getStepText(step);

  if (resistanceSignal.signalType === RESISTANCE_SIGNALS.COGNITIVE_CONFUSION) {
    return generateCognitiveEntryStep(stepText, task);
  }

  const effectiveTaskType = getEffectiveTaskType(taskType, stepText);
  const taskSubtype = getTaskSubtype(`${task} ${stepText}`, effectiveTaskType);
  const text = normalizeText(`${stepText} ${task}`);

  if (hasAnyKeyword(text, ["ppt", "幻灯片", "演示", "答辩"])) {
    if (hasAnyKeyword(text, ["目录", "大纲", "结构"])) {
      return "先只写下 3 个粗略的小标题，不排序、不美化。";
    }

    return "先打开 PPT，新建第一页，并写上标题。";
  }

  if (effectiveTaskType === TASK_TYPES.WRITING_OUTPUT) {
    if (taskSubtype === TASK_SUBTYPES.PROPOSAL_COPY) {
      return "先只写一句最想让别人记住的卖点。";
    }

    return "先打开文档，只写一句最粗糙的开头。";
  }

  if (effectiveTaskType === TASK_TYPES.PHYSICAL_ACTION) {
    if (taskSubtype === TASK_SUBTYPES.FITNESS_EXERCISE) {
      return "先换运动鞋，站起来走到门口。";
    }

    if (taskSubtype === TASK_SUBTYPES.SHOPPING_ERRAND) {
      return "先拿上手机和钥匙，走到门口。";
    }

    if (taskSubtype === TASK_SUBTYPES.CLEANING_TIDYING) {
      return "先只把眼前 1 件东西放回该放的位置。";
    }

    return "先只做一个身体动作：站起来，走到任务开始的位置。";
  }

  if (effectiveTaskType === TASK_TYPES.LEARNING_INPUT) {
    if (taskSubtype === TASK_SUBTYPES.VOCABULARY_MEMORIZATION) {
      return "先只背 3 个单词，记不住也算开始。";
    }

    if (taskSubtype === TASK_SUBTYPES.CHAPTER_STUDY) {
      return "先只看这一章的标题和第一段。";
    }

    return "先打开资料，只看第一段并划出一个关键词。";
  }

  if (effectiveTaskType === TASK_TYPES.TASK_PROCESSING) {
    if (taskSubtype === TASK_SUBTYPES.REPLY_MESSAGE) {
      return "先只打开聊天框，找到那条需要回复的消息。";
    }

    if (taskSubtype === TASK_SUBTYPES.SEND_EMAIL) {
      return "先打开邮箱，点开那封需要处理的邮件。";
    }

    if (taskSubtype === TASK_SUBTYPES.SUBMIT_APPLICATION) {
      return "先打开目标岗位页面，只确认申请入口在哪里。";
    }

    return "先打开办理入口，只确认下一步需要点哪里。";
  }

  if (effectiveTaskType === TASK_TYPES.DECISION_MAKING) {
    return "先只写下继续和不继续各 1 个理由。";
  }

  return `先把这一步缩小到 2 分钟内能开始：${stepText}`;
}

function generateMinimumAction(taskType, step, task, resistanceText = "") {
  const resistanceSignal = getResistanceSignal(resistanceText);
  const stepText = getStepText(step);

  if (resistanceSignal.signalType === RESISTANCE_SIGNALS.EMOTIONAL_PRESSURE) {
    return generateEmotionalSafetyStep(stepText, task);
  }

  if (resistanceSignal.signalType === RESISTANCE_SIGNALS.PERFECTIONISM) {
    return generateImperfectDraftStep(stepText, task);
  }

  const effectiveTaskType = getEffectiveTaskType(taskType, stepText);
  const taskSubtype = getTaskSubtype(`${task} ${stepText}`, effectiveTaskType);
  const text = normalizeText(`${stepText} ${task}`);

  if (effectiveTaskType === TASK_TYPES.WRITING_OUTPUT) {
    if (taskSubtype === TASK_SUBTYPES.PPT_CREATION) {
      return "不用做完，先只打开 PPT 看一眼。";
    }

    if (taskSubtype === TASK_SUBTYPES.PROPOSAL_COPY) {
      return "不用写完整文案，先只写一个很粗糙的卖点。";
    }

    return "不用写正文，先只打开文档看一眼。";
  }

  if (effectiveTaskType === TASK_TYPES.PHYSICAL_ACTION) {
    if (taskSubtype === TASK_SUBTYPES.FITNESS_EXERCISE) {
      return "不用开始训练，先只换好衣服或鞋。";
    }

    if (taskSubtype === TASK_SUBTYPES.CLEANING_TIDYING) {
      return "不用打扫完，先只把 1 件东西放回原位。";
    }

    if (taskSubtype === TASK_SUBTYPES.SHOPPING_ERRAND) {
      return "不用马上出门，先只写下最需要买的 1 件东西。";
    }

    return "不用完成这件事，先只站起来走 10 步。";
  }

  if (effectiveTaskType === TASK_TYPES.LEARNING_INPUT) {
    if (taskSubtype === TASK_SUBTYPES.VOCABULARY_MEMORIZATION) {
      return "不用背完，先只看 3 个单词 30 秒。";
    }

    return "不用学完，先只打开材料看 30 秒。";
  }

  if (effectiveTaskType === TASK_TYPES.TASK_PROCESSING) {
    if (taskSubtype === TASK_SUBTYPES.REPLY_MESSAGE) {
      return "不用马上回复，先只打开聊天框。";
    }

    if (taskSubtype === TASK_SUBTYPES.SEND_EMAIL) {
      return "不用马上发送，先只打开邮箱。";
    }

    if (taskSubtype === TASK_SUBTYPES.SUBMIT_APPLICATION) {
      return "不用马上投递，先只打开目标岗位页面。";
    }

    return "不用处理完，先只打开对应页面。";
  }

  if (effectiveTaskType === TASK_TYPES.DECISION_MAKING) {
    return "不用马上做决定，先只写下你最犹豫的一点。";
  }

  return "不用完成这一步，先只做 30 秒：把当前步骤需要的入口摆到眼前。";
}

function generateDecisionPrompt(taskType, step, task, resistanceText = "") {
  const taskText = task.trim();
  const resistanceSignal = getResistanceSignal(resistanceText);
  const stepText = getStepText(step);

  if (resistanceSignal.signalType === RESISTANCE_SIGNALS.VALUE_DOUBT) {
    return "先不推进执行，写下：继续这件事还值得的 1 个理由，以及不继续也可以接受的 1 个理由。";
  }

  if (taskType === TASK_TYPES.DECISION_MAKING) {
    return "先不推进执行，写下：继续这件事的最大收益，以及不继续的最大代价。";
  }

  if (!taskText) {
    return "先判断：你现在还想完成这件事吗？如果想，写下一个最想得到的结果。";
  }

  if (stepText) {
    return `Check whether you still want to continue "${taskText}". If yes, write the result you want after this step.`;
  }

  return `Check whether you still want to continue "${taskText}". If yes, write one result you want.`;
}

function getResistanceResult(type, step) {
  if (type === "tooHard") {
    return "已把当前步骤拆小，先从这个更容易开始的动作继续。";
  }

  if (type === "dontWant") {
    return "已降低启动门槛，不要求完成全部，先做最小动作。";
  }

  if (type === "unsure") {
    return "先不用正常推进，先确认这件事现在还值不值得继续。";
  }

  if (type === "notReady") {
    return generateReEntryHint(step);
  }

  return "";
}

function getResistanceTextResult(signalType) {
  if (signalType === RESISTANCE_SIGNALS.EMOTIONAL_PRESSURE) {
    return "已按你补充的情况处理：先降低发送、被评价或冲突带来的压力。";
  }

  if (signalType === RESISTANCE_SIGNALS.COGNITIVE_CONFUSION) {
    return "已按你补充的情况处理：先补一个判断入口，而不是继续硬写。";
  }

  if (signalType === RESISTANCE_SIGNALS.PERFECTIONISM) {
    return "已按你补充的情况处理：先允许一个粗糙版本存在。";
  }

  if (signalType === RESISTANCE_SIGNALS.PHYSICAL_LOW_STATE) {
    return "已按你补充的情况处理：先保存中断点，等状态合适再回来。";
  }

  if (signalType === RESISTANCE_SIGNALS.VALUE_DOUBT) {
    return "已按你补充的情况处理：先回到是否值得继续的判断。";
  }

  return "已根据你补充的情况重新调整当前步骤。";
}

function generateEmotionalSafetyStep(step, task) {
  const text = normalizeText(`${step} ${task}`);

  if (hasAnyKeyword(text, ["消息", "回复", "聊天", "微信", "老师", "领导", "朋友", "客户", "家长", "老板"])) {
    return "先不发送，打开备忘录写一版只有自己看的草稿。";
  }

  if (hasAnyKeyword(text, ["邮件", "邮箱"])) {
    return "先不发邮件，只在草稿里写下最安全的一句话。";
  }

  if (hasAnyKeyword(text, ["拒绝", "道歉", "请假", "催", "解释"])) {
    return "先不联系对方，只写下你最担心对方怎么反应。";
  }

  return "先不做会暴露给别人的动作，只写下你最担心发生的结果。";
}

function generateImperfectDraftStep(step, task) {
  const text = normalizeText(`${step} ${task}`);

  if (hasAnyKeyword(text, ["简历", "申请", "邮件", "作品集"])) {
    return "先保留一个 60 分版本，不检查、不发送，只存成草稿。";
  }

  if (hasAnyKeyword(text, ["ppt", "幻灯片", "汇报", "演讲"])) {
    return "先做一页很粗糙的占位页，只写标题，不美化。";
  }

  if (hasAnyKeyword(text, ["发布", "提交", "发送"])) {
    return "先不发布，只把内容放进草稿区，允许它暂时不好。";
  }

  return "先写一个故意粗糙的 60 分版本，今天不评价它。";
}

function generateCognitiveEntryStep(step, task) {
  const text = normalizeText(`${step} ${task}`);

  if (hasAnyKeyword(text, ["论文", "综述", "研究", "选题", "开题"])) {
    return "先写下一个问题：这一步到底需要回答哪个小问题？";
  }

  if (hasAnyKeyword(text, ["作品集", "简历", "面试", "项目"])) {
    return "先写下一个判断标准：别人看这一步时最想知道什么？";
  }

  if (hasAnyKeyword(text, ["资料", "课程", "学习", "复习", "看书"])) {
    return "先只找出这一页或这一段里最重要的 1 个词。";
  }

  return "先写下你现在最不确定的 1 个点，不急着解决。";
}

function generateReEntryHint(step) {
  return `现在不适合继续，我们先保留这里。下次回来时，从这一小步重新开始：${getStepText(step)}`;
}

function createReEntryPoint(task, currentStep, stepHistory) {
  const stepNumber = stepHistory.length + 1;
  const reEntryHint = generateReEntryHint(currentStep);

  return {
    task,
    currentStep,
    stepHistory: [...stepHistory],
    stepNumber,
    completedStepCount: stepHistory.length,
    pauseReason: "not_ready_now",
    reEntryHint
  };
}

function readSavedReEntryPoint() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(RE_ENTRY_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const savedPoint = JSON.parse(rawValue);

    if (!savedPoint?.task || !savedPoint?.currentStep) {
      return null;
    }

    return {
      ...savedPoint,
      stepHistory: Array.isArray(savedPoint.stepHistory)
        ? savedPoint.stepHistory
        : []
    };
  } catch {
    return null;
  }
}

function saveReEntryPoint(reEntryPoint) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    RE_ENTRY_STORAGE_KEY,
    JSON.stringify(reEntryPoint)
  );
}

function clearSavedReEntryPoint() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RE_ENTRY_STORAGE_KEY);
}

function getEffectiveTaskType(taskType, step) {
  const stepType = getTaskType(step);

  if (stepType !== TASK_TYPES.GENERAL) {
    return stepType;
  }

  return taskType;
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

function getStatusMeta(status) {
  return getStatusPillMeta(status);
}

function getTaskPanelCopy(status) {
  const copyMap = {
    idle: {
      kicker: "任务输入",
      title: "今天先推进什么？",
      summary: "",
      action: "生成第一步"
    },
    loading: {
      kicker: "任务上下文",
      title: "任务已锁定",
      summary: "正在生成第一步",
      action: "生成中"
    },
    ready: {
      kicker: "任务上下文",
      title: "已转为上下文",
      summary: "当前任务",
      action: "返回我的任务"
    },
    executing: {
      kicker: "任务上下文",
      title: "执行中任务",
      summary: "当前任务",
      action: "返回我的任务"
    },
    paused: {
      kicker: "任务上下文",
      title: "已保留入口",
      summary: "恢复入口",
      action: "返回我的任务"
    },
    exited: {
      kicker: "任务上下文",
      title: "本次任务已退出",
      summary: "上次任务",
      action: "开始新任务"
    },
    completed: {
      kicker: "任务上下文",
      title: "本次任务已完成",
      summary: "已完成任务",
      action: "开始新任务"
    }
  };

  return copyMap[status] || copyMap.idle;
}

export default App;
