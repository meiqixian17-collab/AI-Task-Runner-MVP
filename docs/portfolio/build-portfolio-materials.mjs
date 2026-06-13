import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let chromium;

try {
  ({ chromium } = await import("playwright"));
} catch {
  ({ chromium } = require("C:/Users/mei/AppData/Roaming/npm/node_modules/playwright"));
}

const rootDir = path.resolve("docs/portfolio");
const assetsDir = path.join(rootDir, "assets");
const appUrl = "http://localhost:5173/";

await fs.mkdir(assetsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 2,
  locale: "zh-CN",
  isMobile: true,
  viewport: { width: 390, height: 844 }
});

const page = await context.newPage();
page.setDefaultTimeout(18000);

async function gotoFreshApp() {
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".page", { timeout: 18000 });
}

async function createTaskWithTitle(title) {
  const createButton = page.locator(".create-task-button, .tasks-empty .primary-action").first();
  await createButton.click();
  await page.waitForSelector("#task-input");
  await page.locator("#task-input").fill(title);
  await page.locator(".task-form .primary-action").click();
}

async function screenshot(name, options = {}) {
  const filePath = path.join(assetsDir, name);
  await page.screenshot({
    path: filePath,
    fullPage: Boolean(options.fullPage)
  });
  return filePath;
}

async function seedReadyPortfolioTask() {
  const now = new Date().toISOString();
  const tasks = [
    {
      id: "portfolio-demo-task",
      title: "写一版作品集项目介绍",
      status: "ready",
      currentStep: {
        step_text: "先用 2 句话写出这个项目解决了什么问题，不修改措辞。",
        completion_criteria: "只要写出 2 句话就算完成，先不追求完整和专业。",
        step_type: "default",
        source: "ai"
      },
      stepIndex: 0,
      stepHistory: [],
      taskContext: {
        current_stage: "已选定 AI Task Runner 作为作品集案例，但还没有整理成完整项目介绍"
      },
      createdAt: now,
      updatedAt: now,
      sessionSummary: "",
      errorMessage: "",
      generationSource: "ai",
      isImportant: true,
      reEntryPoint: null,
      resistancePanelOpen: false,
      selectedResistanceType: "",
      resistanceFeedback: "",
      interruptedStep: "",
      resistanceDiagnosis: null,
      resistanceResolution: null,
      completionCheckpointDismissedAtStepCount: null
    }
  ];

  await page.evaluate((seedTasks) => {
    window.localStorage.setItem("ai-task-runner-tasks", JSON.stringify(seedTasks));
  }, tasks);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".task-list-main").first().click();
  await page.waitForSelector(".current-step-text", { timeout: 12000 });
}

await gotoFreshApp();
await screenshot("01-task-entry.png");

await seedReadyPortfolioTask();
await page.waitForTimeout(700);
await screenshot("02-current-step.png");

await page.locator(".step-card .primary-action").first().click();
await page.waitForSelector(".step-card--executing", { timeout: 12000 });
await page.waitForTimeout(500);
await screenshot("03-stepcard-executing.png");

await page.locator(".resistance-trigger").click();
await page.waitForSelector(".resistance-panel", { timeout: 12000 });
await page.waitForTimeout(500);
await screenshot("04-resistance-recovery.png");

await gotoFreshApp();
await createTaskWithTitle("给我的店铺设计一个 Logo");
await page.waitForSelector(".clarification-input-row", { timeout: 12000 });
await page.waitForTimeout(500);
await screenshot("05-clarification.png");

const diagramPage = await context.newPage();
await diagramPage.setViewportSize({ width: 390, height: 844 });
await diagramPage.setContent(
  String.raw`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f7f4ef;
        color: #17202a;
        font-family: Inter, "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
      }
      .canvas {
        width: 390px;
        min-height: 844px;
        margin: 0 auto;
        padding: 28px 22px;
        background: #ffffff;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 760;
        letter-spacing: 0;
        line-height: 1.18;
      }
      .subtitle {
        margin: 0 0 24px;
        color: #5d6a75;
        font-size: 13px;
        line-height: 1.55;
      }
      .main-flow {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        align-items: stretch;
        margin-bottom: 20px;
      }
      .node {
        min-height: 74px;
        padding: 14px 16px;
        border: 1px solid #cfd8e1;
        border-radius: 12px;
        background: #f9fbfc;
        position: relative;
      }
      .node.primary {
        background: #eef7f2;
        border-color: #9fcbb4;
      }
      .node strong {
        display: block;
        font-size: 16px;
        margin-bottom: 6px;
      }
      .node span {
        color: #5c6974;
        display: block;
        font-size: 12px;
        line-height: 1.45;
      }
      .node:not(:last-child)::after {
        content: "↓";
        position: absolute;
        left: 50%;
        bottom: -14px;
        width: 20px;
        margin-left: -10px;
        text-align: center;
        color: #607080;
        font-size: 18px;
        font-weight: 700;
        z-index: 2;
      }
      .branches {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .branch {
        padding: 16px;
        border-radius: 14px;
        border: 1px solid #d8dee6;
        background: #fbfcfd;
      }
      .branch h2 {
        margin: 0 0 12px;
        font-size: 17px;
      }
      .branch-flow {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .branch .node {
        min-height: 78px;
        padding: 12px;
      }
      .branch .node strong {
        font-size: 14px;
      }
      .branch .node span {
        font-size: 11px;
      }
      .branch .node:not(:last-child)::after {
        content: "";
      }
      .branch.recovery {
        background: #fffaf2;
      }
      .branch.clarify {
        background: #f6fbff;
      }
      .legend {
        display: grid;
        gap: 8px;
        margin-top: 16px;
        color: #5d6a75;
        font-size: 12px;
      }
      .dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
        background: #5fa77d;
      }
      .dot.sub { background: #5c8fc7; }
      .dot.warn { background: #d99a42; }
    </style>
  </head>
  <body>
    <section class="canvas">
      <h1>AI Task Runner 核心任务推进流程</h1>
      <p class="subtitle">主流程围绕“当前一步”推进；旁路处理信息不足和执行卡住。</p>
      <div class="main-flow">
        <div class="node"><strong>输入任务</strong><span>用户输入一个开放任务，不需要先拆完整计划。</span></div>
        <div class="node primary"><strong>生成当前一步</strong><span>系统给出低阻力、具体、可执行的小动作。</span></div>
        <div class="node"><strong>开始执行</strong><span>StepCard 聚焦当前动作，减少选择和判断成本。</span></div>
        <div class="node"><strong>完成当前步</strong><span>记录到 stepHistory，形成短期执行上下文。</span></div>
        <div class="node primary"><strong>生成下一步</strong><span>基于已完成内容继续衔接，直到自然收尾。</span></div>
      </div>
      <div class="branches">
        <div class="branch clarify">
          <h2>旁路 A：信息不足</h2>
          <div class="branch-flow">
            <div class="node"><strong>识别缺口</strong><span>任务缺少必要上下文</span></div>
            <div class="node"><strong>提出澄清</strong><span>只问当前步骤所需信息</span></div>
            <div class="node"><strong>补充信息</strong><span>用户回答关键字段</span></div>
            <div class="node primary"><strong>继续生成</strong><span>回到当前一步</span></div>
          </div>
        </div>
        <div class="branch recovery">
          <h2>旁路 B：执行卡住</h2>
          <div class="branch-flow">
            <div class="node"><strong>用户卡住</strong><span>太难、不想做、不确定</span></div>
            <div class="node"><strong>判断阻力</strong><span>识别卡点类型</span></div>
            <div class="node primary"><strong>降低门槛</strong><span>生成 fallback step</span></div>
            <div class="node"><strong>暂停恢复</strong><span>必要时保留入口</span></div>
          </div>
        </div>
      </div>
      <div class="legend">
        <span><i class="dot"></i>核心推进节点</span>
        <span><i class="dot sub"></i>信息澄清分支</span>
        <span><i class="dot warn"></i>卡点恢复分支</span>
      </div>
    </section>
  </body>
</html>`,
  { waitUntil: "domcontentloaded" }
);
await diagramPage.locator(".canvas").screenshot({
  path: path.join(assetsDir, "06-task-flow.png")
});

await browser.close();

const output = {
  assetsDir,
  files: [
    "01-task-entry.png",
    "02-current-step.png",
    "03-stepcard-executing.png",
    "04-resistance-recovery.png",
    "05-clarification.png",
    "06-task-flow.png"
  ].map((file) => path.join(assetsDir, file))
};

console.log(JSON.stringify(output, null, 2));
