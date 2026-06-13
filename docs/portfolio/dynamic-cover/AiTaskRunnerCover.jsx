import "./AiTaskRunnerCover.css";

export default function AiTaskRunnerCover() {
  return (
    <div className="atr-cover" aria-label="AI Task Runner 动态项目封面">
      <section className="atr-cover__grid">
        <div className="atr-cover__copy">
          <div className="atr-cover__eyebrow">PRODUCT / AI UX</div>
          <h3>AI Task Runner</h3>
          <p>把“不知道怎么开始”转成当前可执行的一步，并在完成后继续推进。</p>
        </div>

        <div className="atr-cover__stage">
          <div className="atr-cover__phone-shadow" />
          <div className="atr-cover__phone">
            <div className="atr-cover__topbar">
              <svg
                className="atr-cover__svg atr-cover__back-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <div className="atr-cover__status">
                <svg
                  className="atr-cover__svg atr-cover__play"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7-11-7Z" />
                </svg>
                <span>可执行</span>
              </div>
            </div>

            <div className="atr-cover__task">
              <span>当前任务</span>
              <strong>写一版作品集项目介绍</strong>
            </div>

            <article className="atr-cover__step-card">
              <div className="atr-cover__step-head">
                <span>当前行动</span>
                <span className="atr-cover__step-index">第 1 步</span>
              </div>
              <div className="atr-cover__phase">这一步已经可以开始</div>
              <div className="atr-cover__rule" />
              <div className="atr-cover__source">
                准备执行 <em>AI 已生成</em>
              </div>
              <div className="atr-cover__step-text">
                <span className="atr-cover__step-one">
                  先用 2 句话写出这个项目解决了什么问题，不修改措辞。
                </span>
                <span className="atr-cover__step-two">
                  把这 2 句话整理成一句项目定位，不追求完美。
                </span>
              </div>
              <div className="atr-cover__button">
                <span className="atr-cover__button-start">
                  <svg
                    className="atr-cover__svg atr-cover__play"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7-11-7Z" />
                  </svg>
                  开始执行
                </span>
                <span className="atr-cover__button-complete">
                  <svg
                    className="atr-cover__svg atr-cover__play"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12.5 11.2 15 16 9" />
                    <circle cx="12" cy="12" r="8.5" />
                  </svg>
                  完成当前步骤
                </span>
                <span className="atr-cover__button-next">
                  <svg
                    className="atr-cover__svg atr-cover__play"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7-11-7Z" />
                  </svg>
                  进入下一步
                </span>
              </div>
            </article>

            <div className="atr-cover__progress">
              <div className="atr-cover__progress-left">
                <svg
                  className="atr-cover__svg"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <div>
                  <div className="atr-cover__progress-label">进度记录</div>
                  <div className="atr-cover__progress-count">
                    <span className="atr-cover__count-zero">已完成 0 步</span>
                    <span className="atr-cover__count-one">已完成 1 步</span>
                  </div>
                </div>
              </div>
              <div className="atr-cover__progress-right">
                <span>暂无记录</span>
                <svg
                  className="atr-cover__svg"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
