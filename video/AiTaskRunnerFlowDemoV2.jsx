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
import { flowDemoV2Data } from "./flowDemoV2Data.generated.mjs";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp"
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const importantTargets = new Set([
  "generate-first",
  "start-execution",
  "complete-step",
  "progress-record",
  "second-step-body"
]);

function padFrame(frame) {
  return String(Math.max(0, frame)).padStart(4, "0");
}

function framePath(frame) {
  return staticFile(`flow-demo-v2/frames/frame-${padFrame(frame)}.jpg`);
}

function eventKeyframes(events, durationFrames) {
  const sortedEvents = [...events].sort((a, b) => a.frame - b.frame);
  const keyframes = [
    {
      frame: 0,
      scale: 1.02,
      center: sortedEvents[0]?.center || {
        x: flowDemoV2Data.source.width / 2,
        y: flowDemoV2Data.source.height / 2
      }
    }
  ];

  for (const event of sortedEvents) {
    const ramp = importantTargets.has(event.name) ? 12 : 8;
    const hold = importantTargets.has(event.name) ? 16 : 10;
    const release = importantTargets.has(event.name) ? 18 : 12;

    keyframes.push(
      {
        frame: Math.max(0, event.frame - ramp),
        scale: 1.04,
        center: event.center
      },
      {
        frame: event.frame,
        scale: event.scale,
        center: event.center
      },
      {
        frame: Math.min(durationFrames - 1, event.frame + hold),
        scale: event.scale,
        center: event.center
      },
      {
        frame: Math.min(durationFrames - 1, event.frame + hold + release),
        scale: 1.04,
        center: event.center
      }
    );
  }

  keyframes.push({
    frame: durationFrames - 1,
    scale: 1.02,
    center: sortedEvents.at(-1)?.center || keyframes[0].center
  });

  return keyframes
    .sort((a, b) => a.frame - b.frame)
    .filter((item, index, items) => index === 0 || item.frame !== items[index - 1].frame);
}

function cameraAt(frame, width, height) {
  const source = flowDemoV2Data.source;
  const baseScale = width / source.width;
  const keyframes = eventKeyframes(
    flowDemoV2Data.cameraEvents,
    flowDemoV2Data.durationFrames
  );
  const nextIndex = keyframes.findIndex((keyframe) => keyframe.frame >= frame);
  const previous =
    nextIndex <= 0 ? keyframes[0] : keyframes[Math.max(0, nextIndex - 1)];
  const next =
    nextIndex <= 0 ? keyframes[0] : keyframes[Math.min(nextIndex, keyframes.length - 1)];

  if (previous.frame === next.frame) {
    return {
      scale: previous.scale,
      center: previous.center,
      baseScale
    };
  }

  const progress = interpolate(frame, [previous.frame, next.frame], [0, 1], {
    ...clamp,
    easing: ease
  });

  return {
    scale: interpolate(progress, [0, 1], [previous.scale, next.scale]),
    center: {
      x: interpolate(progress, [0, 1], [previous.center.x, next.center.x]),
      y: interpolate(progress, [0, 1], [previous.center.y, next.center.y])
    },
    baseScale
  };
}

export const AiTaskRunnerFlowDemoV2 = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const sourceFrame = Math.min(frame, flowDemoV2Data.durationFrames - 1);
  const camera = cameraAt(frame, width, height);
  const targetX = camera.center.x * camera.baseScale;
  const targetY = camera.center.y * camera.baseScale;
  const rawX = width / 2 - targetX * camera.scale;
  const rawY = height / 2 - targetY * camera.scale;
  const minX = width - width * camera.scale;
  const minY = height - height * camera.scale;
  const translateX = Math.min(0, Math.max(minX, rawX));
  const translateY = Math.min(0, Math.max(minY, rawY));

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#fafaf5" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${translateX}px, ${translateY}px) scale(${camera.scale})`,
          transformOrigin: "0 0"
        }}
      >
        <Img
          src={framePath(sourceFrame)}
          style={{
            display: "block",
            width,
            height,
            objectFit: "cover"
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
