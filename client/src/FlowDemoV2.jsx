import { CheckCircle2, ChevronRight, History, Play, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const TASK_TEXT = "我要做作品集";

const firstStep = {
  title: "先确定作品集要证明的一个能力",
  body: "写下一句你最想让作品集证明的能力，不需要整理完整案例。",
  criteria: "完成标准：留下一个清晰能力词，比如“把模糊需求推进成可运行原型”。"
};

const secondStep = {
  title: "把能力映射到一个可展示证据",
  body: "选一个界面、流程或交互记录，作为这个能力的第一条证据。",
  criteria: "完成标准：只需要选出一个证据对象，后续再扩成案例结构。"
};

function FlowCursor() {
  const [cursor, setCursor] = useState({ x: -80, y: -80, pressed: false });
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    function handleMove(event) {
      setCursor((current) => ({
        ...current,
        x: event.clientX,
        y: event.clientY
      }));
    }

    function handleDown(event) {
      const id = `${Date.now()}-${Math.random()}`;

      setCursor({ x: event.clientX, y: event.clientY, pressed: true });
      setRipples((current) => [
        ...current.slice(-3),
        { id, x: event.clientX, y: event.clientY }
      ]);

      window.setTimeout(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 520);
    }

    function handleUp(event) {
      setCursor((current) => ({
        ...current,
        x: event.clientX,
        y: event.clientY,
        pressed: false
      }));
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div className="flow-demo-v2-pointer-layer" aria-hidden="true">
      {ripples.map((ripple) => (
        <span
          className="flow-demo-v2-click-ripple"
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
      <span
        className={`flow-demo-v2-cursor${
          cursor.pressed ? " flow-demo-v2-cursor--pressed" : ""
        }`}
        style={{ left: cursor.x, top: cursor.y }}
      />
    </div>
  );
}

function StepCardDemo({ phase, onStart, onComplete }) {
  const isLoading = phase === "firstLoading" || phase === "nextLoading";
  const isFirstReady = phase === "firstReady";
  const isExecuting = phase === "executing";
  const isSecondReady = phase === "secondReady";
  const step = isSecondReady ? secondStep : firstStep;

  return (
    <section
      className={`flow-demo-v2-step-card flow-demo-v2-step-card--${phase}`}
      data-capture-target={isSecondReady ? "second-step-body" : "step-card"}
    >
      <div className="flow-demo-v2-step-header">
        <p className="section-kicker">当前行动</p>
        <span className="step-index">第 {isSecondReady ? 2 : 1} 步</span>
      </div>

      {phase === "input" && (
        <div className="flow-demo-v2-empty-step">
          <h2>先输入一个要推进的任务</h2>
          <p>系统会把任务拆成当前只需要完成的一小步。</p>
        </div>
      )}

      {isLoading && (
        <div className="flow-demo-v2-loading" aria-live="polite">
          <span className="flow-demo-v2-loading-bar" />
          <p>{phase === "nextLoading" ? "正在生成下一步" : "正在生成第一步"}</p>
        </div>
      )}

      {(isFirstReady || isExecuting || isSecondReady) && (
        <article
          className="flow-demo-v2-step-main"
          data-capture-target={isSecondReady ? "second-step-body" : "step-card-body"}
        >
          <div className="flow-demo-v2-step-meta">
            <span>{isExecuting ? "执行中" : "AI 已生成"}</span>
          </div>
          <h2>{step.title}</h2>
          <p className="flow-demo-v2-step-text">{step.body}</p>
          <p className="flow-demo-v2-criteria">{step.criteria}</p>

          {isFirstReady && (
            <button
              className="primary-action"
              data-capture-target="start-execution"
              type="button"
              onClick={onStart}
            >
              <Play aria-hidden="true" className="button-icon" size={18} />
              开始执行
            </button>
          )}

          {isExecuting && (
            <button
              className="primary-action"
              data-capture-target="complete-step"
              type="button"
              onClick={onComplete}
            >
              <CheckCircle2 aria-hidden="true" className="button-icon" size={18} />
              完成当前步骤
            </button>
          )}
        </article>
      )}
    </section>
  );
}

function ProgressPanel({ completedSteps }) {
  const hasProgress = completedSteps.length > 0;

  return (
    <section className="flow-demo-v2-progress" data-capture-target="progress-record">
      <button
        aria-expanded={hasProgress}
        className="progress-summary"
        disabled={!hasProgress}
        type="button"
      >
        <span className="progress-summary-main">
          <span className="progress-kicker-row">
            <History aria-hidden="true" className="heading-icon" size={16} />
            <span className="section-kicker">进度记录</span>
          </span>
          <strong>已完成 {completedSteps.length} 步</strong>
        </span>
        <span className="progress-summary-meta">
          {hasProgress ? "查看记录" : "暂无记录"}
          <ChevronRight
            aria-hidden="true"
            className={`progress-chevron${hasProgress ? " progress-chevron--open" : ""}`}
            size={18}
          />
        </span>
      </button>

      {hasProgress && (
        <ol className="timeline timeline--compact">
          {completedSteps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <p>{step.title}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function FlowDemoV2() {
  const [task, setTask] = useState("");
  const [phase, setPhase] = useState("input");
  const [completedSteps, setCompletedSteps] = useState([]);
  const taskIsReady = task.trim().length > 0;

  const statusLabel = useMemo(() => {
    if (phase === "input") return "待输入";
    if (phase === "firstLoading" || phase === "nextLoading") return "生成中";
    if (phase === "executing") return "执行中";
    return "可执行";
  }, [phase]);

  function handleGenerate(event) {
    event.preventDefault();

    if (!taskIsReady || phase !== "input") {
      return;
    }

    setPhase("firstLoading");
    window.setTimeout(() => setPhase("firstReady"), 820);
  }

  function handleStart() {
    if (phase === "firstReady") {
      setPhase("executing");
    }
  }

  function handleComplete() {
    if (phase !== "executing") {
      return;
    }

    setCompletedSteps([firstStep]);
    setPhase("nextLoading");
    window.setTimeout(() => setPhase("secondReady"), 860);
  }

  return (
    <main
      className="flow-demo-v2"
      data-flow-demo-v2="ready"
      data-flow-phase={phase}
    >
      <div className="flow-demo-v2-shell">
        <header className="flow-demo-v2-header">
          <div>
            <p className="eyebrow">AI Task Runner</p>
            <h1>任务推进</h1>
          </div>
          <span className="status-pill status-pill--primary">{statusLabel}</span>
        </header>

        <section
          className={`surface-card flow-demo-v2-task${
            phase === "input" ? "" : " flow-demo-v2-task--compact"
          }`}
        >
          {phase === "input" ? (
            <form className="task-form" onSubmit={handleGenerate}>
              <div className="section-heading">
                <p className="section-kicker">任务输入</p>
                <h2>今天先推进什么？</h2>
              </div>
              <label className="field-label" htmlFor="flow-demo-v2-task">
                待推进任务
              </label>
              <textarea
                autoComplete="off"
                data-capture-target="task-input"
                id="flow-demo-v2-task"
                onChange={(event) => setTask(event.target.value)}
                placeholder="例如：写作品集项目介绍"
                value={task}
              />
              <button
                className="primary-action"
                data-capture-target="generate-first"
                disabled={!taskIsReady}
                type="submit"
              >
                <Sparkles aria-hidden="true" className="button-icon" size={18} />
                生成第一步
              </button>
            </form>
          ) : (
            <div className="flow-demo-v2-task-summary">
              <div>
                <p className="section-kicker">任务输入</p>
                <strong>{TASK_TEXT}</strong>
              </div>
              <span>自动保存</span>
            </div>
          )}
        </section>

        <ProgressPanel completedSteps={completedSteps} />

        <StepCardDemo
          phase={phase}
          onComplete={handleComplete}
          onStart={handleStart}
        />
      </div>
      <FlowCursor />
    </main>
  );
}

export default FlowDemoV2;
