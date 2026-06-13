import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  ink: "#172033",
  muted: "#667085",
  line: "#d9e2ee",
  paper: "#f7f9fc",
  white: "#ffffff",
  blue: "#2563eb",
  blueSoft: "#dbeafe",
  green: "#18a058",
  orange: "#f59e0b",
};

const image = (name) => staticFile(`portfolio/${name}`);

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

const fade = (frame, start, end) =>
  interpolate(frame, [start, start + 18, end - 18, end], [0, 1, 1, 0], {
    ...clamp,
    easing: easeInOut,
  });

const enter = (frame, start, distance = 36) => {
  const progress = interpolate(frame, [start, start + 28], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
  };
};

const Screen = ({ src, style }) => {
  return (
    <div
      style={{
        border: `1px solid ${palette.line}`,
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(23, 32, 51, 0.18)",
        overflow: "hidden",
        background: palette.white,
        ...style,
      }}
    >
      <Img
        src={src}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

const Pill = ({ children, tone = "blue" }) => {
  const tones = {
    blue: { color: palette.blue, background: palette.blueSoft },
    green: { color: palette.green, background: "#dcfce7" },
    orange: { color: "#b45309", background: "#fef3c7" },
  };

  return (
    <div
      style={{
        ...tones[tone],
        borderRadius: 999,
        fontSize: 28,
        fontWeight: 700,
        padding: "12px 22px",
      }}
    >
      {children}
    </div>
  );
};

const StepCard = ({ index, title, body, tone, frame, start }) => {
  return (
    <div
      style={{
        ...enter(frame, start, 24),
        display: "grid",
        gridTemplateColumns: "72px 1fr",
        gap: 24,
        alignItems: "center",
        padding: 30,
        borderRadius: 24,
        border: `1px solid ${palette.line}`,
        background: palette.white,
        boxShadow: "0 20px 50px rgba(23, 32, 51, 0.08)",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          display: "grid",
          placeItems: "center",
          color: palette.white,
          background: tone,
          fontSize: 34,
          fontWeight: 800,
        }}
      >
        {index}
      </div>
      <div>
        <div style={{ color: palette.ink, fontSize: 34, fontWeight: 800 }}>{title}</div>
        <div style={{ color: palette.muted, fontSize: 24, lineHeight: 1.35, marginTop: 6 }}>
          {body}
        </div>
      </div>
    </div>
  );
};

const Background = () => {
  return (
    <AbsoluteFill style={{ background: palette.paper }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(37, 99, 235, 0.15), transparent 34%), radial-gradient(circle at 88% 18%, rgba(24, 160, 88, 0.12), transparent 32%), linear-gradient(135deg, #f8fafc 0%, #edf3fb 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          top: 72,
          height: 1,
          background: "rgba(23, 32, 51, 0.08)",
        }}
      />
    </AbsoluteFill>
  );
};

const HeroScene = ({ frame, fps }) => {
  const local = frame;
  const imageDrift = interpolate(local, [0, 3 * fps], [0, -28], { ...clamp, easing: easeInOut });

  return (
    <AbsoluteFill style={{ opacity: fade(frame, 0, 96) }}>
      <div style={{ position: "absolute", left: 118, top: 118, width: 740 }}>
        <div style={enter(local, 6)}>
          <Pill>AI Task Runner MVP</Pill>
        </div>
        <h1
          style={{
            ...enter(local, 12),
            margin: "42px 0 0",
            color: palette.ink,
            fontSize: 86,
            lineHeight: 1.02,
            letterSpacing: 0,
          }}
        >
          把“不知道怎么开始”
          <br />
          变成“只做这一步”
        </h1>
        <p
          style={{
            ...enter(local, 24),
            margin: "34px 0 0",
            color: palette.muted,
            fontSize: 34,
            lineHeight: 1.45,
          }}
        >
          面向个人任务启动与推进的执行闭环：先给最小可执行动作，再根据完成、卡住或信息不足继续推进。
        </p>
      </div>
      <Screen
        src={image("01-task-entry.png")}
        style={{
          position: "absolute",
          right: 112,
          top: 164 + imageDrift,
          width: 860,
          height: 568,
          transform: "rotate(-2deg)",
        }}
      />
    </AbsoluteFill>
  );
};

const LoopScene = ({ frame, fps }) => {
  const local = frame - 78;
  const imageShift = interpolate(local, [0, 3.4 * fps], [28, -18], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{ opacity: fade(frame, 78, 186) }}>
      <div style={{ position: "absolute", left: 110, top: 108, width: 700 }}>
        <div style={enter(local, 0)}>
          <Pill tone="green">核心闭环</Pill>
        </div>
        <h2
          style={{
            ...enter(local, 9),
            color: palette.ink,
            fontSize: 68,
            lineHeight: 1.08,
            margin: "34px 0 0",
          }}
        >
          不是一次性计划，
          <br />
          是持续推进任务
        </h2>
        <div style={{ display: "grid", gap: 22, marginTop: 48 }}>
          <StepCard
            index="1"
            title="生成当前一步"
            body="把任务压缩成马上能执行的 StepCard。"
            tone={palette.blue}
            frame={local}
            start={18}
          />
          <StepCard
            index="2"
            title="完成后自然续航"
            body="基于 stepHistory 生成下一步，而不是重复拆计划。"
            tone={palette.green}
            frame={local}
            start={30}
          />
          <StepCard
            index="3"
            title="卡住时降阻恢复"
            body="识别阻力类型，给出更低门槛的 fallback step。"
            tone={palette.orange}
            frame={local}
            start={42}
          />
        </div>
      </div>
      <Screen
        src={image("02-current-step.png")}
        style={{
          position: "absolute",
          right: 150,
          top: 122 + imageShift,
          width: 760,
          height: 502,
        }}
      />
      <Screen
        src={image("03-stepcard-executing.png")}
        style={{
          position: "absolute",
          right: 76,
          top: 492 + imageShift,
          width: 660,
          height: 436,
        }}
      />
    </AbsoluteFill>
  );
};

const RecoveryScene = ({ frame, fps }) => {
  const local = frame - 168;
  const scale = interpolate(local, [0, 2.4 * fps], [0.97, 1.03], {
    ...clamp,
    easing: easeInOut,
  });

  return (
    <AbsoluteFill style={{ opacity: fade(frame, 168, 246) }}>
      <div style={{ position: "absolute", left: 116, right: 116, top: 98 }}>
        <div style={enter(local, 0)}>
          <Pill tone="orange">关键状态处理</Pill>
        </div>
        <h2
          style={{
            ...enter(local, 8),
            color: palette.ink,
            fontSize: 66,
            lineHeight: 1.08,
            margin: "34px 0 0",
            maxWidth: 880,
          }}
        >
          信息不足时先澄清，
          <br />
          用户卡住时先降低阻力
        </h2>
      </div>
      <Screen
        src={image("05-clarification.png")}
        style={{
          position: "absolute",
          left: 136,
          bottom: 112,
          width: 760,
          height: 502,
          transform: `scale(${scale})`,
        }}
      />
      <Screen
        src={image("04-resistance-recovery.png")}
        style={{
          position: "absolute",
          right: 136,
          bottom: 112,
          width: 760,
          height: 502,
          transform: `scale(${2.0 - scale})`,
        }}
      />
    </AbsoluteFill>
  );
};

const OutroScene = ({ frame, fps }) => {
  const local = frame - 228;
  const progress = interpolate(local, [0, 2.2 * fps], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  return (
    <AbsoluteFill style={{ opacity: fade(frame, 228, 300) }}>
      <div
        style={{
          position: "absolute",
          left: 126,
          right: 126,
          top: 118,
          display: "grid",
          gridTemplateColumns: "1fr 720px",
          gap: 80,
          alignItems: "center",
        }}
      >
        <div>
          <div style={enter(local, 0)}>
            <Pill>产品价值</Pill>
          </div>
          <h2
            style={{
              ...enter(local, 8),
              color: palette.ink,
              fontSize: 76,
              lineHeight: 1.06,
              margin: "38px 0 0",
            }}
          >
            让 AI 陪用户
            <br />
            完成任务，而不只是生成建议
          </h2>
          <p
            style={{
              ...enter(local, 20),
              color: palette.muted,
              fontSize: 32,
              lineHeight: 1.45,
              margin: "34px 0 0",
              maxWidth: 760,
            }}
          >
            推进、澄清、恢复、确认完成，构成一个面向真实执行过程的任务系统。
          </p>
        </div>
        <div
          style={{
            ...enter(local, 12),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
            transform: `translateY(${interpolate(progress, [0, 1], [42, 0])}px)`,
          }}
        >
          {[
            "state-preview-clarification.png",
            "state-preview-fallback.png",
            "state-preview-completed.png",
            "03-stepcard-executing.png",
          ].map((src) => (
            <Screen key={src} src={image(src)} style={{ width: 338, height: 214, borderRadius: 18 }} />
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 126,
          right: 126,
          bottom: 82,
          color: palette.muted,
          fontSize: 26,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>AI Task Runner MVP</span>
        <span>10s product intro · Remotion</span>
      </div>
    </AbsoluteFill>
  );
};

export const AiTaskRunnerIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, Segoe UI, Microsoft YaHei, Arial, sans-serif" }}>
      <Background />
      <HeroScene frame={frame} fps={fps} />
      <LoopScene frame={frame} fps={fps} />
      <RecoveryScene frame={frame} fps={fps} />
      <OutroScene frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
