import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Play,
  RefreshCw,
  SendHorizontal,
  TriangleAlert
} from "lucide-react";

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
    label: "入口已保留",
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
  const [resistanceIsMultiline, setResistanceIsMultiline] = useState(false);
  const clarificationTextareaRef = useRef(null);
  const resistanceTextareaRef = useRef(null);
  const currentStepText = getStepText(currentStep);
  const isClarificationStep =
    currentStep &&
    typeof currentStep === "object" &&
    currentStep.step_type === "clarification";
  const isCompletionConfirmationStep =
    currentStep &&
    typeof currentStep === "object" &&
    currentStep.step_type === "completion_confirmation";
  const isClosingChecklistStep =
    currentStep &&
    typeof currentStep === "object" &&
    currentStep.step_type === "closing_checklist";
  const completionCriteria =
    currentStep &&
    typeof currentStep === "object" &&
    !isClarificationStep &&
    !isCompletionConfirmationStep &&
    !isClosingChecklistStep
      ? currentStep.completion_criteria
      : "";
  const closingChecklistItems =
    currentStep &&
    typeof currentStep === "object" &&
    Array.isArray(currentStep.closing_checklist_items)
      ? currentStep.closing_checklist_items
      : [];
  const closingChecklistTitle =
    currentStep && typeof currentStep === "object"
      ? currentStep.closing_checklist_title
      : "";
  const completionConfirmationType =
    currentStep && typeof currentStep === "object"
      ? currentStep.completion_confirmation_type
      : "";
  const isDuplicateConfirmation =
    completionConfirmationType === "duplicate_step";
  const isSimpleCompletionConfirmation =
    completionConfirmationType === "simple_task";
  const inputPlaceholder =
    currentStep && typeof currentStep === "object"
      ? currentStep.input_placeholder
      : "";
  const showCurrentStep =
    currentStepText &&
    (appStatus === "ready" ||
      appStatus === "executing" ||
      appStatus === "paused");
  const showReadyStartAction =
    appStatus === "ready" &&
    !isClarificationStep &&
    !isCompletionConfirmationStep &&
    !isClosingChecklistStep;
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

  useEffect(() => {
    const textarea = resistanceTextareaRef.current;

    if (!textarea) {
      return;
    }

    const minimumHeight = 44;
    const maximumHeight = 108;
    textarea.style.height = `${minimumHeight}px`;

    const measuredHeight = textarea.scrollHeight;
    const nextHeight = Math.min(
      Math.max(measuredHeight, minimumHeight),
      maximumHeight
    );
    const isMultiline = measuredHeight > minimumHeight;

    setResistanceIsMultiline((currentValue) =>
      currentValue === isMultiline ? currentValue : isMultiline
    );
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = measuredHeight > maximumHeight ? "auto" : "hidden";
  }, [resistanceText, resistancePanelOpen]);

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
        <div className="step-card-title-block">
          <div className="step-card-context-row">
            <p className="section-kicker">
              {isClarificationStep
                ? "信息补充"
                : isCompletionConfirmationStep
                  ? "完成确认"
                  : isClosingChecklistStep
                    ? "收尾检查"
                    : "当前行动"}
            </p>
            <span className="step-index">第 {currentStepNumber} 步</span>
          </div>
          <h2 id="step-card-title">
            {isClarificationStep
              ? "需要补充信息"
              : isCompletionConfirmationStep
                ? "确认是否收尾"
                : isClosingChecklistStep
                  ? "确认完成边界"
                  : statusCopy.title}
          </h2>
        </div>
      </div>

      {appStatus === "idle" && (
        <div className="empty-action-panel">
          <p>把任务写在上方，生成后这里会出现当前只做的一步。</p>
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
        <div className="step-main" aria-live="polite">
          <div className="step-main-meta">
            <span>
              {isClarificationStep
                ? "需要补充信息"
                : isCompletionConfirmationStep
                  ? isDuplicateConfirmation
                    ? "重复步骤确认"
                    : "完成边界确认"
                  : isClosingChecklistStep
                    ? closingChecklistTitle || "收尾清单"
                    : statusCopy.label}
            </span>
            {generationSource === "ai" && (
              <span className="source-note">AI 已生成</span>
            )}
            {isUsingFallback && (
              <span className="source-note">已切换为低阻力版本</span>
            )}
          </div>
          <p className="current-step-text">{currentStepText}</p>
          {isClosingChecklistStep && closingChecklistItems.length > 0 && (
            <ol className="closing-checklist">
              {closingChecklistItems.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ol>
          )}
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
                <SendHorizontal
                  aria-hidden="true"
                  className="icon-button-svg"
                  size={18}
                />
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
                <CheckCircle2
                  aria-hidden="true"
                  className="button-icon"
                  size={18}
                />
                {isDuplicateConfirmation
                  ? "跳过重复点"
                  : isSimpleCompletionConfirmation
                    ? "已经完成"
                    : "标记整个任务完成"}
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
          {appStatus === "ready" && isClosingChecklistStep && (
            <div className="action-row">
              <button
                className="primary-action"
                type="button"
                onClick={onConfirmSimpleTaskComplete}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="button-icon"
                  size={18}
                />
                标记整个任务完成
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
          {showReadyStartAction && (
        <button className="primary-action" onClick={onStartExecuting}>
          <Play aria-hidden="true" className="button-icon" size={18} />
          开始执行
        </button>
      )}

          {appStatus === "executing" && (
        <div className="execution-area">
          <button className="primary-action" onClick={onCompleteCurrentStep}>
            <CheckCircle2 aria-hidden="true" className="button-icon" size={18} />
            完成当前步骤
          </button>

          <div className="resistance-entry">
            <button
              className="link-button resistance-trigger"
              disabled={isResolvingResistance}
              type="button"
              onClick={onToggleResistancePanel}
            >
              <CircleAlert aria-hidden="true" className="button-icon" size={18} />
              做不了这一小步？换个更小的
            </button>

            {resistancePanelOpen && (
              <div className="resistance-panel">
                <p className="resistance-title">选一个最接近的卡点</p>

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

                <div className="resistance-text-entry">
                  <label htmlFor="resistance-text">也可以补充一句</label>
                  <form
                    className={`resistance-input-row${
                      resistanceIsMultiline
                        ? " resistance-input-row--multiline"
                        : ""
                    }`}
                    onSubmit={handleResistanceTextSubmit}
                  >
                    <textarea
                      ref={resistanceTextareaRef}
                      id="resistance-text"
                      value={resistanceText}
                      disabled={isResolvingResistance}
                      onChange={(event) =>
                        setResistanceText(event.target.value)
                      }
                      placeholder="比如：怕写得不好 / 不知道从哪开始"
                      rows={1}
                    />
                    <button
                      aria-label="根据卡点生成更容易继续的一步"
                      className="resistance-send"
                      disabled={!canSubmitResistanceText}
                      type="submit"
                    >
                      <SendHorizontal
                        aria-hidden="true"
                        className="icon-button-svg"
                        size={18}
                      />
                    </button>
                  </form>
                </div>

                {resistanceResult && (
                  <p className="resistance-result">{resistanceResult}</p>
                )}
              </div>
            )}
          </div>
        </div>
          )}
        </div>
      )}

      {appStatus === "paused" && (
        <div className="result-state result-state--reentry">
          {reEntryPoint?.reEntryHint && <p>{reEntryPoint.reEntryHint}</p>}
          <div className="action-row">
            <button className="primary-action" onClick={onResumeCurrentStep}>
              <RefreshCw aria-hidden="true" className="button-icon" size={18} />
              继续当前步骤
            </button>
            <button className="secondary-action" onClick={onExit}>
              <ArrowLeft aria-hidden="true" className="button-icon" size={18} />
              返回我的任务
            </button>
          </div>
        </div>
      )}

      {appStatus === "completed" && (
        <div className="result-state result-state--success">
          {sessionSummary && <p>{sessionSummary}</p>}
          <div className="action-row">
            <button className="primary-action" onClick={onReset}>
              <RefreshCw aria-hidden="true" className="button-icon" size={18} />
              开始新任务
            </button>
            <button className="secondary-action" onClick={onExit}>
              <ArrowLeft aria-hidden="true" className="button-icon" size={18} />
              返回我的任务
            </button>
          </div>
        </div>
      )}

      {appStatus === "exited" && (
        <div className="result-state">
          {sessionSummary && <p>{sessionSummary}</p>}
          <div className="action-row">
            <button className="primary-action" onClick={onReset}>
              <RefreshCw aria-hidden="true" className="button-icon" size={18} />
              开始新任务
            </button>
            <button className="secondary-action" onClick={onExit}>
              <ArrowLeft aria-hidden="true" className="button-icon" size={18} />
              返回我的任务
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="inline-error">
          <TriangleAlert aria-hidden="true" className="button-icon" size={18} />
          {errorMessage}
        </p>
      )}
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
