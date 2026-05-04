import { useEffect, useRef, useState } from "react";

const RESISTANCE_OPTIONS = [
  {
    type: "tooHard",
    label: "这一步太难了"
  },
  {
    type: "dontWant",
    label: "我就是不想做"
  },
  {
    type: "unsure",
    label: "我不确定还要不要继续"
  },
  {
    type: "notReady",
    label: "我现在状态不适合做"
  }
];

const STATUS_COPY = {
  idle: {
    label: "等待任务",
    title: "先写下一件事",
    body: "系统会把它拆成一个低阻力、能立刻开始的动作。"
  },
  loading: {
    label: "生成步骤",
    title: "正在找到最小可执行动作",
    body: "优先保证这一步具体、轻量，不会让你卡在准备阶段。"
  },
  ready: {
    label: "准备执行",
    title: "这一步已经可以开始",
    body: "不用完成整个任务，只需要把当前这一步向前推进。"
  },
  executing: {
    label: "执行中",
    title: "专注完成当前一步",
    body: "如果卡住，可以把动作继续缩小，或暂时保留入口。"
  },
  paused: {
    label: "已暂停",
    title: "入口已为你保留",
    body: "下次回来时，不需要重新整理上下文。"
  },
  completed: {
    label: "已完成",
    title: "这轮推进已经闭环",
    body: "可以重新开始，也可以把新的任务交给系统继续拆解。"
  },
  exited: {
    label: "已退出",
    title: "本次推进已结束",
    body: "上下文已停在这里，重新开始会清空当前任务。"
  }
};
function StepCard({
  appStatus,
  currentStep,
  currentStepNumber,
  loadingMessage,
  generationSource,
  isUsingFallback,
  reEntryPoint,
  resistancePanelOpen,
  resistanceResult,
  isResolvingResistance,
  resistanceLoadingMessage,
  sessionSummary,
  errorMessage,
  statusMeta,
  onStartExecuting,
  onResumeCurrentStep,
  onCompleteCurrentStep,
  onConfirmSimpleTaskComplete,
  onRequestSimpleTaskFinalStep,
  onSubmitClarificationAnswer,
  onToggleResistancePanel,
  onResistanceSelect,
  onResistanceTextSubmit,
  onExit,
  onReset
}) {
  const [resistanceText, setResistanceText] = useState("");
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [clarificationError, setClarificationError] = useState("");
  const [clarificationIsMultiline, setClarificationIsMultiline] =
    useState(false);
  const clarificationTextareaRef = useRef(null);
  const currentStepText = getStepText(currentStep);
  const isClarificationStep =
    currentStep &&
    typeof currentStep === "object" &&
    currentStep.step_type === "clarification";
  const isCompletionConfirmationStep =
    currentStep &&
    typeof currentStep === "object" &&
    currentStep.step_type === "completion_confirmation";
  const completionCriteria =
    currentStep &&
    typeof currentStep === "object" &&
    !isClarificationStep &&
    !isCompletionConfirmationStep
      ? currentStep.completion_criteria
      : "";
  const inputPlaceholder =
    currentStep && typeof currentStep === "object"
      ? currentStep.input_placeholder
      : "";
  const showCurrentStep =
    currentStepText &&
    (appStatus === "ready" ||
      appStatus === "executing" ||
      appStatus === "paused");
  const statusCopy = STATUS_COPY[appStatus] || STATUS_COPY.idle;
  const canSubmitResistanceText =
    resistanceText.trim().length > 0 && !isResolvingResistance;
  const canSubmitClarification = clarificationAnswer.trim().length > 0;

  useEffect(() => {
    setClarificationAnswer("");
    setClarificationError("");
  }, [
    currentStepText,
    currentStep && typeof currentStep === "object"
      ? currentStep.clarification_key
      : ""
  ]);

  useEffect(() => {
    const textarea = clarificationTextareaRef.current;

    if (!textarea) {
      return;
    }

    const minimumHeight = 44;
    const maximumHeight = 96;
    const originalValue = textarea.value;
    const shouldMeasurePlaceholder = !originalValue && inputPlaceholder;

    if (shouldMeasurePlaceholder) {
      textarea.value = inputPlaceholder;
    }

    textarea.style.height = `${minimumHeight}px`;

    const measuredHeight = textarea.scrollHeight;
    const nextHeight = Math.min(
      Math.max(measuredHeight, minimumHeight),
      maximumHeight
    );
    const isMultiline = measuredHeight > minimumHeight;

    if (shouldMeasurePlaceholder) {
      textarea.value = originalValue;
    }

    setClarificationIsMultiline((currentValue) =>
      currentValue === isMultiline ? currentValue : isMultiline
    );
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = measuredHeight > maximumHeight ? "auto" : "hidden";
  }, [clarificationAnswer, inputPlaceholder, currentStepText]);

  function handleResistanceTextSubmit(event) {
    event.preventDefault();

    if (!canSubmitResistanceText) {
      return;
    }

    onResistanceTextSubmit(resistanceText);
    setResistanceText("");
  }

  function handleClarificationSubmit(event) {
    event.preventDefault();

    if (!canSubmitClarification) {
      setClarificationError("请先输入内容。");
      return;
    }

    onSubmitClarificationAnswer(clarificationAnswer);
    setClarificationAnswer("");
    setClarificationError("");
  }

  return (
    <section
      className={`surface-card step-card priority-card step-card--${appStatus}`}
      aria-labelledby="step-card-title"
    >
      <div className="step-card-header">
        <div>
          <p className="section-kicker">
            {isClarificationStep
              ? "信息补充"
              : isCompletionConfirmationStep
                ? "完成确认"
                : "当前行动"}
          </p>
          <h2 id="step-card-title">
            {isClarificationStep
              ? "需要补充信息"
              : isCompletionConfirmationStep
                ? "确认是否收尾"
                : statusCopy.title}
          </h2>
        </div>
        <div className="step-meta">
          <span className={`status-pill status-pill--${statusMeta.tone}`}>
            {isClarificationStep
              ? "待补充"
              : isCompletionConfirmationStep
                ? "待确认"
                : statusMeta.label}
          </span>
          <span className="step-index">第 {currentStepNumber} 步</span>
        </div>
      </div>

      {appStatus === "idle" && (
        <div className="empty-action-panel">
          <p>等待任务输入</p>
        </div>
      )}

      {appStatus === "loading" && (
        <div className="loading-panel" aria-live="polite">
          <span className="loading-bar" />
          <p>{loadingMessage}</p>
        </div>
      )}

      {isResolvingResistance && (
        <div className="loading-panel" aria-live="polite">
          <span className="loading-bar" />
          <p>{resistanceLoadingMessage}</p>
        </div>
      )}

      {showCurrentStep && !isResolvingResistance && (
        <div className="step-focus">
          <div className="step-focus-header">
            <span>
              {isClarificationStep
                ? "需要补充信息"
                : isCompletionConfirmationStep
                  ? "简单任务收尾"
                  : statusCopy.label}
            </span>
            {generationSource === "ai" && (
              <strong className="source-badge source-badge--ai">
                AI 返回
              </strong>
            )}
            {isUsingFallback && (
              <strong className="source-badge source-badge--fallback">
                备用步骤
              </strong>
            )}
          </div>
          <p className="current-step-text">{currentStepText}</p>
          {appStatus === "ready" && isClarificationStep && (
            <form
              className={`clarification-input-row${
                clarificationIsMultiline
                  ? " clarification-input-row--multiline"
                  : ""
              }`}
              onSubmit={handleClarificationSubmit}
            >
              <textarea
                ref={clarificationTextareaRef}
                aria-label="补充任务信息"
                value={clarificationAnswer}
                onChange={(event) => {
                  setClarificationAnswer(event.target.value);
                  setClarificationError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleClarificationSubmit(event);
                  }
                }}
                placeholder={inputPlaceholder || "输入补充信息"}
                rows={1}
              />
              <button
                aria-label="提交补充信息"
                className="clarification-submit"
                disabled={!canSubmitClarification}
                type="submit"
              >
                ✓
              </button>
              {clarificationError && (
                <p className="clarification-error">{clarificationError}</p>
              )}
            </form>
          )}
          {appStatus === "ready" && isCompletionConfirmationStep && (
            <div className="action-row">
              <button
                className="primary-action"
                type="button"
                onClick={onConfirmSimpleTaskComplete}
              >
                已经完成
              </button>
              <button
                className="secondary-action"
                type="button"
                onClick={onRequestSimpleTaskFinalStep}
              >
                还差一步
              </button>
            </div>
          )}
        </div>
      )}

      {appStatus === "ready" &&
        !isClarificationStep &&
        !isCompletionConfirmationStep && (
        <button className="primary-action" onClick={onStartExecuting}>
          开始执行
        </button>
      )}

      {appStatus === "executing" && !isResolvingResistance && (
        <div className="execution-area">
          <button className="primary-action" onClick={onCompleteCurrentStep}>
            完成当前步骤
          </button>

          <div className="resistance-entry">
            <button
              className="link-button"
              disabled={isResolvingResistance}
              type="button"
              onClick={onToggleResistancePanel}
            >
              我卡住了
            </button>

            {resistancePanelOpen && (
              <div className="resistance-panel">
                <div className="resistance-text-entry">
                  <label htmlFor="resistance-text">卡点</label>
                  <form
                    className="resistance-input-row"
                    onSubmit={handleResistanceTextSubmit}
                  >
                    <input
                      id="resistance-text"
                      type="text"
                      value={resistanceText}
                      disabled={isResolvingResistance}
                      onChange={(event) =>
                        setResistanceText(event.target.value)
                      }
                      placeholder="补充当前卡点"
                    />
                    <button
                      aria-label="根据卡点生成更容易继续的一步"
                      className="resistance-send"
                      disabled={!canSubmitResistanceText}
                      type="submit"
                    >
                      ✓
                    </button>
                  </form>
                </div>

                <p className="resistance-title">卡住的原因</p>

                <div className="resistance-options">
                  {RESISTANCE_OPTIONS.map((option) => (
                    <button
                      className="resistance-option"
                      disabled={isResolvingResistance}
                      key={option.type}
                      onClick={() => onResistanceSelect(option.type)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {resistanceResult && (
                  <p className="resistance-result">{resistanceResult}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {appStatus === "paused" && (
        <div className="result-state">
          {reEntryPoint?.reEntryHint && <p>{reEntryPoint.reEntryHint}</p>}
          <div className="action-row">
            <button className="primary-action" onClick={onResumeCurrentStep}>
              继续当前步骤
            </button>
            <button className="secondary-action" onClick={onExit}>
              返回我的任务
            </button>
          </div>
        </div>
      )}

      {appStatus === "completed" && (
        <div className="result-state result-state--success">
          {sessionSummary && <p>{sessionSummary}</p>}
          <button className="secondary-action" onClick={onExit}>
            返回我的任务
          </button>
        </div>
      )}

      {appStatus === "exited" && (
        <div className="result-state">
          {sessionSummary && <p>{sessionSummary}</p>}
          <button className="secondary-action" onClick={onExit}>
            返回我的任务
          </button>
        </div>
      )}

      {errorMessage && <p className="inline-error">{errorMessage}</p>}
    </section>
  );
}

function getStepText(step) {
  if (typeof step === "string") {
    return step;
  }

  if (!step || typeof step !== "object") {
    return "";
  }

  return String(
    step.step_text ||
      step.stepText ||
      step.text ||
      step.step ||
      ""
  ).trim();
}

export default StepCard;
