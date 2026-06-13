import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { flowDemoV2Data } from "../video/flowDemoV2Data.generated.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "video", "out", "flow-demo-v2-stills");

function assertInsideRepo(targetPath) {
  const resolved = path.resolve(targetPath);
  const root = path.resolve(repoRoot);

  if (!resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Refusing to modify path outside repo: ${resolved}`);
  }
}

function eventFrame(name) {
  const event = flowDemoV2Data.cameraEvents.find((item) => item.name === name);

  if (!event) {
    throw new Error(`Missing camera event "${name}". Run video:flow:v2:capture first.`);
  }

  return event.frame;
}

function clampFrame(frame) {
  return Math.max(0, Math.min(flowDemoV2Data.durationFrames - 1, frame));
}

function runRemotionStill(label, frame) {
  const outputFile = path.join(outputDir, `${label}.png`);
  const remotionArgs = [
    "remotion",
    "still",
    "video/index.jsx",
    "AiTaskRunnerFlowDemoV2",
    outputFile,
    "--frame",
    String(frame)
  ];
  const command = process.platform === "win32" ? "cmd.exe" : "npx";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", "npx", ...remotionArgs]
      : remotionArgs;

  execFileSync(
    command,
    args,
    {
      cwd: repoRoot,
      stdio: "inherit",
      windowsHide: true
    }
  );

  return outputFile;
}

const checks = [
  {
    label: "01-generate-before",
    frame: clampFrame(eventFrame("generate-first") - 4),
    target: "generate-first"
  },
  {
    label: "02-generate-after",
    frame: clampFrame(eventFrame("generate-first") + 8),
    target: "generate-first"
  },
  {
    label: "03-start-before",
    frame: clampFrame(eventFrame("start-execution") - 4),
    target: "start-execution"
  },
  {
    label: "04-start-after",
    frame: clampFrame(eventFrame("start-execution") + 8),
    target: "start-execution"
  },
  {
    label: "05-complete-before",
    frame: clampFrame(eventFrame("complete-step") - 4),
    target: "complete-step"
  },
  {
    label: "06-complete-after",
    frame: clampFrame(eventFrame("complete-step") + 8),
    target: "complete-step"
  },
  {
    label: "07-progress-record",
    frame: clampFrame(eventFrame("progress-record") + 4),
    target: "progress-record"
  },
  {
    label: "08-second-step",
    frame: clampFrame(eventFrame("second-step-body") + 6),
    target: "second-step-body"
  }
];

assertInsideRepo(outputDir);
rmSync(outputDir, { force: true, recursive: true, maxRetries: 3 });
mkdirSync(outputDir, { recursive: true });

const rendered = checks.map((check) => ({
  ...check,
  file: path.relative(repoRoot, runRemotionStill(check.label, check.frame))
}));

writeFileSync(
  path.join(outputDir, "checks.json"),
  JSON.stringify(rendered, null, 2),
  "utf8"
);

console.log("Rendered flow demo v2 still checks:");
for (const item of rendered) {
  console.log(`${item.label}: frame ${item.frame}, target ${item.target}, ${item.file}`);
}
