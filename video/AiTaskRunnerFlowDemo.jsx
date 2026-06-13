import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp"
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);
const taskText = "我要做作品集";
const screen = {
  width: 430,
  height: 900,
  left: 745,
  top: 90,
  displayWidth: 430,
  displayHeight: 900
};

const scenes = [
  { start: 0, end: 48, image: "flow-input.png" },
  { start: 48, end: 72, image: "flow-loading.png" },
  { start: 72, end: 120, image: "flow-ready.png" },
  { start: 120, end: 168, image: "flow-executing.png" },
  { start: 168, end: 216, image: "flow-progress.png" },
  { start: 216, end: 300, image: "flow-next.png" }
];

const pointerKeyframes = [
  { frame: 0, x: 220, y: 170 },
  { frame: 18, x: 212, y: 214 },
  { frame: 46, x: 214, y: 356 },
  { frame: 54, x: 214, y: 356 },
  { frame: 76, x: 214, y: 356 },
  { frame: 108, x: 214, y: 398 },
  { frame: 118, x: 214, y: 398 },
  { frame: 130, x: 214, y: 398 },
  { frame: 154, x: 214, y: 398 },
  { frame: 166, x: 214, y: 398 },
  { frame: 184, x: 214, y: 586 },
  { frame: 216, x: 214, y: 586 },
  { frame: 252, x: 220, y: 525 },
  { frame: 300, x: 220, y: 525 }
];

const clickFrames = [48, 120, 168];

function getScene(frame) {
  return (
    scenes.find((scene) => frame >= scene.start && frame < scene.end) ||
    scenes[scenes.length - 1]
  );
}

function sceneOpacity(frame, scene) {
  const fadeIn = interpolate(frame, [scene.start, scene.start + 5], [0, 1], {
    ...clamp,
    easing: easeOut
  });
  const fadeOut = interpolate(frame, [scene.end - 5, scene.end], [1, 0], {
    ...clamp,
    easing: easeInOut
  });

  if (scene.start === 0) {
    return fadeOut;
  }

  if (scene.end === 300) {
    return fadeIn;
  }

  return Math.min(fadeIn, fadeOut);
}

function pointAt(frame) {
  const nextIndex = pointerKeyframes.findIndex((point) => point.frame >= frame);

  if (nextIndex <= 0) {
    return pointerKeyframes[0];
  }

  const next = pointerKeyframes[nextIndex];
  const previous = pointerKeyframes[nextIndex - 1];
  const progress = interpolate(frame, [previous.frame, next.frame], [0, 1], {
    ...clamp,
    easing: easeInOut
  });

  return {
    x: interpolate(progress, [0, 1], [previous.x, next.x]),
    y: interpolate(progress, [0, 1], [previous.y, next.y])
  };
}

function currentZoom(frame) {
  const activeWindows = [
    [0, 58],
    [90, 130],
    [145, 178],
    [230, 272]
  ];
  const active = activeWindows.some(([start, end]) => frame >= start && frame <= end);
  const pulse = interpolate(frame % 38, [0, 19, 38], [0, 1, 0], {
    ...clamp,
    easing: easeInOut
  });

  return active ? 1.055 + pulse * 0.015 : 1.025;
}

function cameraTransform(frame) {
  const pointer = pointAt(frame);
  const scale = currentZoom(frame);
  const focusX = screen.width / 2 - pointer.x;
  const focusY = screen.height / 2 - pointer.y;
  const translateX = focusX * 0.18;
  const translateY = focusY * 0.18;

  return {
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
  };
}

function imagePath(name) {
  return staticFile(`flow-demo/${name}`);
}

function TypedTask({ frame }) {
  const visibleChars = Math.round(
    interpolate(frame, [12, 42], [0, taskText.length], {
      ...clamp,
      easing: Easing.linear
    })
  );
  const text = taskText.slice(0, visibleChars);
  const caretOpacity =
    frame < 48 && Math.floor(frame / 8) % 2 === 0 && visibleChars > 0 ? 1 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 179,
        width: 336,
        color: "#241b12",
        fontFamily:
          '"Noto Sans SC", "Microsoft YaHei", "Segoe UI", Arial, sans-serif',
        fontSize: 15,
        fontWeight: 500,
        lineHeight: "24px",
        whiteSpace: "pre-wrap"
      }}
    >
      {text}
      <span style={{ opacity: caretOpacity }}>|</span>
    </div>
  );
}

function Cursor({ frame }) {
  const point = pointAt(frame);

  return (
    <>
      {clickFrames.map((clickFrame) => {
        const age = frame - clickFrame;

        if (age < 0 || age > 14) {
          return null;
        }

        const clickPoint = pointAt(clickFrame);
        const progress = interpolate(age, [0, 14], [0, 1], {
          ...clamp,
          easing: easeOut
        });

        return (
          <div
            key={clickFrame}
            style={{
              position: "absolute",
              left: clickPoint.x - 24,
              top: clickPoint.y - 24,
              width: 48,
              height: 48,
              border: "3px solid rgba(170, 97, 22, 0.45)",
              borderRadius: 999,
              opacity: 1 - progress,
              transform: `scale(${interpolate(progress, [0, 1], [0.35, 1.45])})`
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: point.x,
          top: point.y,
          width: 22,
          height: 32,
          filter: "drop-shadow(0 4px 8px rgba(36, 27, 18, 0.28))",
          transform: "translate(-2px, -2px)"
        }}
      >
        <svg viewBox="0 0 22 32" width="22" height="32">
          <path
            d="M2 2L19 19H10L6 30L2 28L6 18H2V2Z"
            fill="#fffdf8"
            stroke="#241b12"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    </>
  );
}

export const AiTaskRunnerFlowDemo = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const activeScene = getScene(frame);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #f7f4ee 0%, #eee7dc 48%, #f9f5ed 100%)"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: screen.left - 26,
          top: screen.top - 26,
          width: screen.displayWidth + 52,
          height: screen.displayHeight + 52,
          borderRadius: 48,
          background: "rgba(255, 253, 248, 0.72)",
          boxShadow:
            "0 42px 90px rgba(58, 42, 26, 0.24), 0 2px 8px rgba(58, 42, 26, 0.08)"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: screen.left,
          top: screen.top,
          width: screen.displayWidth,
          height: screen.displayHeight,
          borderRadius: 34,
          overflow: "hidden",
          background: "#fafaf5",
          transformOrigin: "50% 50%",
          ...cameraTransform(frame)
        }}
      >
        {scenes.map((scene) => (
          <Img
            key={scene.image}
            src={imagePath(scene.image)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: sceneOpacity(frame, scene)
            }}
          />
        ))}
        {activeScene.image === "flow-input.png" && <TypedTask frame={frame} />}
        <Cursor frame={frame} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: `inset 0 0 0 1px rgba(58, 42, 26, 0.03), inset 0 0 ${Math.round(
            width * 0.16
          )}px rgba(58, 42, 26, 0.08)`
        }}
      />
    </AbsoluteFill>
  );
};
