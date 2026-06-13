import React from "react";
import { Composition } from "remotion";
import { AiTaskRunnerFlowDemo } from "./AiTaskRunnerFlowDemo";
import { AiTaskRunnerFlowDemoV2 } from "./AiTaskRunnerFlowDemoV2";
import { AiTaskRunnerIntro } from "./AiTaskRunnerIntro";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="AiTaskRunnerIntro"
        component={AiTaskRunnerIntro}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AiTaskRunnerFlowDemo"
        component={AiTaskRunnerFlowDemo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AiTaskRunnerFlowDemoV2"
        component={AiTaskRunnerFlowDemoV2}
        durationInFrames={330}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
