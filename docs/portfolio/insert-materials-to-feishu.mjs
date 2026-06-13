import { spawnSync } from "node:child_process";

const doc = process.argv[2];
const imagesOnly = process.argv.includes("--images-only");
const deleteExistingImages = process.argv.includes("--delete-existing-images");

if (!doc) {
  console.error("Usage: node docs/portfolio/insert-materials-to-feishu.mjs <feishu-doc-url>");
  process.exit(1);
}

const env = {
  ...process.env,
  LARK_CLI_NO_PROXY: "1"
};

function runLark(args) {
  const larkCliEntry =
    "C:\\Users\\mei\\AppData\\Roaming\\npm\\node_modules\\@larksuite\\cli\\scripts\\run.js";
  const result = spawnSync("node", [larkCliEntry, ...args], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

if (!imagesOnly) {
  console.log("Appending supplement markdown...");
  runLark([
    "docs",
    "+update",
    "--api-version",
    "v2",
    "--doc",
    doc,
    "--command",
    "append",
    "--content",
    "@docs\\portfolio\\ai-task-runner-supplement-materials.md",
    "--doc-format",
    "markdown"
  ]);
}

const images = [
  {
    file: "docs\\portfolio\\assets\\01-task-entry.png",
    anchor: "12.1 首屏核心界面截图",
    caption: "图 1 任务入口页：用户先输入一个想推进的任务，而不是先拆完整计划。"
  },
  {
    file: "docs\\portfolio\\assets\\02-current-step.png",
    anchor: "12.2 当前一步：StepCard 核心界面",
    caption: "图 2 StepCard 当前一步：AI 建议被转化为一个可执行的任务状态。"
  },
  {
    file: "docs\\portfolio\\assets\\03-stepcard-executing.png",
    anchor: "12.3 执行状态：从建议进入行动",
    caption: "图 3 执行状态：界面聚焦当前步骤，并保留完成与卡点恢复入口。"
  },
  {
    file: "docs\\portfolio\\assets\\04-resistance-recovery.png",
    anchor: "12.4 卡点恢复：用户做不下去时降低阻力",
    caption: "图 4 卡点恢复：用户做不下去时，系统先识别阻力并降低门槛。"
  },
  {
    file: "docs\\portfolio\\assets\\05-clarification.png",
    anchor: "12.5 信息澄清：上下文不足时先问必要问题",
    caption: "图 5 信息澄清：上下文不足时，系统先问必要问题，而不是替用户猜。"
  },
  {
    file: "docs\\portfolio\\assets\\06-task-flow.png",
    anchor: "12.6 任务推进流程图",
    caption: "图 6 核心任务推进流程：主流程围绕当前一步推进，旁路处理信息不足和执行卡住。"
  }
];

const existingImageBlockIds = [
  "doxcnDW798cD7CRFGwLqhOb6wvf",
  "doxcnLygw5PLHXx2A4ENMu9qPze",
  "doxcn0VKr2lefSqllsaTgkm4wfd",
  "doxcn9S46dSk5mE6k0yd4WelyxG",
  "doxcnntZ1l542BetBvGYKxkX0ic",
  "doxcnTDCAt2ZGZqNsHh8GOUnKVg"
];

if (deleteExistingImages) {
  for (const blockId of existingImageBlockIds) {
    console.log(`Deleting old image block ${blockId}...`);
    runLark([
      "docs",
      "+update",
      "--api-version",
      "v2",
      "--doc",
      doc,
      "--command",
      "block_delete",
      "--block-id",
      blockId
    ]);
  }
}

for (const image of images) {
  console.log(`Inserting ${image.file}...`);
  runLark([
    "docs",
    "+media-insert",
    "--doc",
    doc,
    "--file",
    image.file,
    "--type",
    "image",
    "--selection-with-ellipsis",
    image.anchor,
    "--caption",
    image.caption,
    "--width",
    "360",
    "--align",
    "center"
  ]);
}

console.log("Done.");
