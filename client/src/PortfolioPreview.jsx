import { ChevronLeft, ChevronRight, History, Sparkles } from "lucide-react";
import StepCard from "./StepCard.jsx";
import StatusPill, { getStatusPillMeta } from "./StatusPill.jsx";

const TASK_TITLE = "我要做作品集";

const noop = () => {};

const firstStep = {
  step_text: "先写下你想让作品集证明的 1 个能力。",
  completion_criteria: "写出一个具体能力即可，不需要一次完成整份作品集。",
  stage: "start",
  source: "ai"
};

const nextStep = {
  step_text: "把这个能力对应到 AI Task Runner 里的 1 个具体交互证据。",
  completion_criteria: "只需要写下一个界面或流程证据，之后再扩成案例结构。",
  stage: "execute",
  source: "ai"
};

const flowHistory = [firstStep];

const previewStates = {
  idle: {
    label: "任务输入",
    status: "idle",
    headerStatus: "idle",
    appStatus: "idle",
    isTaskComposer: true,
    taskValue: TASK_TITLE,
    currentStep: "",
    currentStepNumber: 1,
    generationSource: ""
  },
  loading: {
    label: "生成中",
    status: "loading",
    headerStatus: "loading",
    appStatus: "loading",
    currentStep: "",
    currentStepNumber: 1,
    loadingMessage: "正在生成第一步",
    generationSource: ""
  },
  ready: {
    label: "当前行动",
    status: "ready",
    headerStatus: "ready",
    appStatus: "ready",
    currentStep: firstStep,
    currentStepNumber: 1,
    generationSource: "ai"
  },
  executing: {
    label: "执行当前步",
    status: "executing",
    headerStatus: "executing",
    appStatus: "executing",
    currentStep: firstStep,
    currentStepNumber: 1,
    generationSource: "ai"
  },
  clarification: {
    label: "澄清",
    status: "clarifying",
    headerStatus: "clarifying",
    appStatus: "ready",
    currentStep: {
      step_type: "clarification",
      clarification_key: "portfolio_current_stage",
      step_text: "你的作品集现在做到哪一步了？",
      input_placeholder: "例如：已经选了 AI Task Runner，但还没整理案例结构",
      stage: "clarify",
      source: "local_rule"
    },
    currentStepNumber: 1,
    generationSource: ""
  },
  resistance: {
    label: "卡点",
    status: "executing",
    headerStatus: "executing",
    appStatus: "executing",
    currentStep: firstStep,
    currentStepNumber: 1,
    generationSource: "ai",
    resistancePanelOpen: true,
    resistanceResult: "先识别卡点，再把动作换成更低阻力的一步。"
  },
  recovery: {
    label: "低阻力版本",
    status: "fallback",
    headerStatus: "fallback",
    appStatus: "ready",
    currentStep: {
      step_text:
        "先保留一个 60 分版本：写一句你想证明的能力，不检查、不润色。",
      completion_criteria: "留下这一句话即可。",
      stage: "execute",
      source: "resistance_template"
    },
    currentStepNumber: 1,
    generationSource: "",
    isUsingFallback: true
  },
  fallback: {
    label: "兜底",
    status: "localFallback",
    headerStatus: "error",
    appStatus: "ready",
    currentStep: {
      step_text:
        "先写一句：这个作品集最想证明我能把模糊需求推进成可运行原型。",
      completion_criteria: "写下一句话即可，之后再扩成案例结构。",
      stage: "start",
      source: "generic_fallback"
    },
    currentStepNumber: 1,
    generationSource: "fallback",
    errorMessage: "AI 暂时不可用，已给出本地可执行动作。"
  },
  completed: {
    label: "完成收束",
    status: "completed",
    headerStatus: "completed",
    appStatus: "completed",
    currentStep: "",
    currentStepNumber: 2,
    generationSource: "",
    sessionSummary: "已完成 2 个步骤：写出作品集能力定位，并保留一版 60 分草稿。"
  },
  "flow-input": {
    label: "任务输入",
    status: "idle",
    headerStatus: "idle",
    appStatus: "idle",
    isTaskComposer: true,
    taskValue: "",
    currentStep: "",
    currentStepNumber: 1,
    generationSource: ""
  },
  "flow-loading": {
    label: "生成中",
    status: "loading",
    headerStatus: "loading",
    appStatus: "loading",
    currentStep: "",
    currentStepNumber: 1,
    loadingMessage: "正在生成第一步",
    generationSource: ""
  },
  "flow-ready": {
    label: "当前行动",
    status: "ready",
    headerStatus: "ready",
    appStatus: "ready",
    currentStep: firstStep,
    currentStepNumber: 1,
    generationSource: "ai"
  },
  "flow-executing": {
    label: "执行当前步",
    status: "executing",
    headerStatus: "executing",
    appStatus: "executing",
    currentStep: firstStep,
    currentStepNumber: 1,
    generationSource: "ai"
  },
  "flow-progress": {
    label: "生成下一步",
    status: "loading",
    headerStatus: "loading",
    appStatus: "loading",
    currentStep: "",
    currentStepNumber: 2,
    loadingMessage: "正在生成下一步",
    generationSource: "",
    progressOpen: true,
    stepHistory: flowHistory
  },
  "flow-next": {
    label: "当前行动",
    status: "ready",
    headerStatus: "ready",
    appStatus: "ready",
    currentStep: nextStep,
    currentStepNumber: 2,
    generationSource: "ai",
    progressOpen: true,
    stepHistory: flowHistory
  }
};

function getPreviewState() {
  const params = new URLSearchParams(window.location.search);
  const requestedState = params.get("state") || "ready";

  return previewStates[requestedState] ? requestedState : "ready";
}

function getStepText(step) {
  if (typeof step === "string") {
    return step;
  }

  if (!step || typeof step !== "object") {
    return "";
  }

  return String(
    step.step_text || step.stepText || step.text || step.step || ""
  ).trim();
}

function TaskStatusIcon({ status }) {
  const meta = getStatusPillMeta(status);
  const Icon = meta.icon;

  return <Icon size={16} strokeWidth={2.4} />;
}

function ProgressPreview({ isOpen, stepHistory }) {
  const history = Array.isArray(stepHistory) ? stepHistory : [];

  return (
    <section className="progress-panel" aria-labelledby="progress-title">
      <button
        aria-controls="progress-history"
        aria-expanded={Boolean(isOpen)}
        className="progress-summary"
        disabled={history.length === 0}
        type="button"
        onClick={noop}
      >
        <span className="progress-summary-main">
          <span className="progress-kicker-row">
            <History aria-hidden="true" className="heading-icon" size={16} />
            <span className="section-kicker">进度记录</span>
          </span>
          <strong id="progress-title">已完成 {history.length} 步</strong>
        </span>
        <span className="progress-summary-meta">
          {history.length === 0 ? "暂无记录" : "查看记录"}
          <ChevronRight
            aria-hidden="true"
            className={`progress-chevron${isOpen ? " progress-chevron--open" : ""}`}
            size={18}
          />
        </span>
      </button>

      {isOpen && history.length > 0 && (
        <ol className="timeline timeline--compact" id="progress-history">
          {history.map((step, index) => (
            <li key={`${getStepText(step)}-${index}`}>
              <span>{index + 1}</span>
              <p>{getStepText(step)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function PortfolioPreview() {
  const selectedState = getPreviewState();
  const preview = previewStates[selectedState];
  const stepHistory = preview.stepHistory || [];
  const taskStatus = preview.errorMessage ? "error" : preview.status;
  const taskStatusMeta = getStatusPillMeta(taskStatus);
  const taskPanelClassName = [
    "surface-card",
    "task-panel",
    preview.isTaskComposer ? "" : "task-panel--compact"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="page page--execution" data-portfolio-preview={selectedState}>
      <header className="app-header execution-header">
        <div className="page-title-stack">
          <p className="eyebrow">AI Task Runner</p>
          <div className="title-row">
            <button
              aria-label="返回我的任务"
              className="back-icon-button"
              type="button"
              onClick={noop}
            >
              <ChevronLeft aria-hidden="true" className="icon-button-svg" size={24} />
            </button>
            <StatusPill
              className="header-status-pill"
              status={preview.headerStatus}
            />
          </div>
        </div>
      </header>

      <div className="workspace-grid">
        <section className={taskPanelClassName} aria-labelledby="task-title">
          <div className="section-heading">
            <p className="section-kicker">任务输入</p>
            <h2 id="task-title">今天先推进什么？</h2>
          </div>

          {preview.isTaskComposer ? (
            <form
              className="task-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="field-label" htmlFor="portfolio-preview-task">
                待推进任务
              </label>
              <textarea
                id="portfolio-preview-task"
                readOnly
                value={preview.taskValue ?? TASK_TITLE}
                placeholder="例如：写作品集项目介绍 / 回老师消息 / 整理论文选题"
              />
              <button className="primary-action" type="submit">
                <Sparkles aria-hidden="true" className="button-icon" size={18} />
                生成第一步
              </button>
            </form>
          ) : (
            <div className="task-summary" aria-live="polite">
              <div className="task-summary-main">
                <span
                  aria-hidden="true"
                  className={`task-summary-icon task-summary-icon--${taskStatusMeta.tone}`}
                >
                  <TaskStatusIcon status={taskStatus} />
                </span>
                <div>
                  <p className="task-summary-label">{preview.label}</p>
                  <p className="task-summary-text">{TASK_TITLE}</p>
                </div>
              </div>
              <div className="task-summary-statuses" aria-label="保存状态">
                <span className="autosave-note">自动保存</span>
              </div>
            </div>
          )}
        </section>

        <StepCard
          appStatus={preview.appStatus}
          currentStep={preview.currentStep}
          currentStepNumber={preview.currentStepNumber}
          loadingMessage={preview.loadingMessage || "正在生成第一步"}
          generationSource={preview.generationSource}
          isUsingFallback={Boolean(preview.isUsingFallback)}
          reEntryPoint={null}
          resistancePanelOpen={Boolean(preview.resistancePanelOpen)}
          resistanceResult={preview.resistanceResult || ""}
          isResolvingResistance={false}
          resistanceLoadingMessage=""
          sessionSummary={preview.sessionSummary || ""}
          errorMessage={preview.errorMessage || ""}
          onStartExecuting={noop}
          onResumeCurrentStep={noop}
          onCompleteCurrentStep={noop}
          onConfirmSimpleTaskComplete={noop}
          onRequestSimpleTaskFinalStep={noop}
          onSubmitClarificationAnswer={noop}
          onToggleResistancePanel={noop}
          onResistanceSelect={noop}
          onResistanceTextSubmit={noop}
          onExit={noop}
          onReset={noop}
        />

        <ProgressPreview
          isOpen={Boolean(preview.progressOpen)}
          stepHistory={stepHistory}
        />
      </div>
    </main>
  );
}

export default PortfolioPreview;
