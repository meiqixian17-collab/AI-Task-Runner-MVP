import { execFileSync, spawn } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "public", "flow-demo-v2");
const rawFrameDir = path.join(outputDir, "raw-screencast");
const frameDir = path.join(outputDir, "frames");
const generatedDataFile = path.join(repoRoot, "video", "flowDemoV2Data.generated.mjs");
const baseUrl = process.env.FLOW_DEMO_V2_BASE_URL || "http://127.0.0.1:5174";
const previewPort = new URL(baseUrl).port || "5174";
const fps = 30;
const durationFrames = 330;
const durationMs = (durationFrames / fps) * 1000;
const viewport = { width: 1600, height: 900, deviceScaleFactor: 1 };
const taskText = "我要做作品集";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function assertInsideRepo(targetPath) {
  const resolved = path.resolve(targetPath);
  const root = path.resolve(repoRoot);

  if (!resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Refusing to modify path outside repo: ${resolved}`);
  }
}

function safeRm(targetPath) {
  assertInsideRepo(targetPath);
  rmSync(targetPath, { force: true, recursive: true, maxRetries: 3 });
}

function safeRmBestEffort(targetPath) {
  try {
    safeRm(targetPath);
  } catch {
    // Chromium can keep profile files locked briefly after exit on Windows.
  }
}

function killProcessTree(child) {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === "win32" && child.pid) {
    try {
      execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true
      });
      return;
    } catch {
      // Fall back to child.kill().
    }
  }

  child.kill();
}

function findChromiumExecutables() {
  return [
    { label: "custom Chromium", path: process.env.CHROME_PATH },
    { label: "Chrome", path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
    {
      label: "Chrome",
      path: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    },
    { label: "Edge", path: "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe" },
    {
      label: "Edge",
      path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    }
  ].filter((candidate) => candidate.path && existsSync(candidate.path));
}

async function isPreviewServerReady() {
  try {
    const response = await fetch(`${baseUrl}/flow-demo-v2`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForPreviewServer(timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isPreviewServerReady()) {
      return;
    }

    await sleep(300);
  }

  throw new Error(`Timed out waiting for ${baseUrl}`);
}

async function ensurePreviewServer() {
  if (await isPreviewServerReady()) {
    return null;
  }

  const npmArgs = [
    "--prefix",
    "client",
    "run",
    "dev",
    "--",
    "--host",
    "127.0.0.1",
    "--port",
    previewPort,
    "--strictPort"
  ];
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args =
    process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...npmArgs] : npmArgs;
  const child = spawn(command, args, {
    cwd: repoRoot,
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    if (/error|failed|EADDRINUSE/i.test(chunk)) {
      process.stderr.write(chunk);
    }
  });

  await waitForPreviewServer();
  return child;
}

async function waitForJson(url, timeoutMs = 10000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Chromium is still starting.
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForPageTarget(debugPort) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 10000) {
    const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json`);
    const pageTarget = Array.isArray(targets)
      ? targets.find((target) => target.type === "page")
      : null;

    if (pageTarget?.webSocketDebuggerUrl) {
      return pageTarget;
    }

    await sleep(250);
  }

  throw new Error("Timed out waiting for Chromium page target.");
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  const onceResolvers = new Map();
  const listeners = new Map();
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result || {});
      }

      return;
    }

    const methodListeners = listeners.get(message.method) || [];
    for (const listener of methodListeners) {
      listener(message.params || {});
    }

    const resolvers = onceResolvers.get(message.method);
    if (resolvers?.length > 0) {
      const resolve = resolvers.shift();
      resolve(message.params || {});
    }
  });

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    const payload = JSON.stringify({ id, method, params });

    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(payload);
    });
  }

  function once(method, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out waiting for CDP event ${method}`));
      }, timeoutMs);

      const resolvers = onceResolvers.get(method) || [];
      resolvers.push((params) => {
        clearTimeout(timeout);
        resolve(params);
      });
      onceResolvers.set(method, resolvers);
    });
  }

  function on(method, listener) {
    const methodListeners = listeners.get(method) || [];
    methodListeners.push(listener);
    listeners.set(method, methodListeners);
  }

  async function waitForOpen() {
    if (socket.readyState === WebSocket.OPEN) {
      return;
    }

    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
  }

  function close() {
    socket.close();
  }

  return { close, once, on, send, waitForOpen };
}

function launchBrowser(browser, debugPort, userDataDir) {
  mkdirSync(userDataDir, { recursive: true });

  return spawn(
    browser.path,
    [
      "--headless=new",
      "--disable-gpu",
      "--disable-gpu-sandbox",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-component-extensions-with-background-pages",
      "--disable-sync",
      "--disable-crash-reporter",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${userDataDir}`,
      "about:blank"
    ],
    {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true
    }
  );
}

async function waitForDemoReady(cdp) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = await cdp.send("Runtime.evaluate", {
      expression:
        'document.readyState === "complete" && document.querySelector("[data-flow-demo-v2]")?.dataset.flowDemoV2 === "ready"',
      returnByValue: true
    });

    if (result.result?.value === true) {
      return;
    }

    await sleep(100);
  }

  throw new Error("Flow demo v2 route did not become ready.");
}

async function waitForPhase(cdp, phase, timeoutMs = 5000) {
  const startedAt = Date.now();
  const expected = JSON.stringify(phase);

  while (Date.now() - startedAt < timeoutMs) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: `document.querySelector("[data-flow-demo-v2]")?.dataset.flowPhase === ${expected}`,
      returnByValue: true
    });

    if (result.result?.value === true) {
      return;
    }

    await sleep(80);
  }

  throw new Error(`Timed out waiting for phase "${phase}".`);
}

async function targetBox(cdp, name) {
  const selector = `[data-capture-target="${name}"]`;
  const expression = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      center: {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2
      }
    };
  })()`;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true
    });

    if (result.result?.value) {
      return result.result.value;
    }

    await sleep(100);
  }

  throw new Error(`Could not find capture target "${name}".`);
}

function frameFromStart(startedAt) {
  return Math.min(durationFrames - 1, Math.max(0, Math.round(((Date.now() - startedAt) / 1000) * fps)));
}

function cameraEvent(name, box, startedAt, scale) {
  return {
    name,
    frame: frameFromStart(startedAt),
    scale,
    center: {
      x: Math.round(box.center.x * 100) / 100,
      y: Math.round(box.center.y * 100) / 100
    },
    bounds: {
      x: Math.round(box.x * 100) / 100,
      y: Math.round(box.y * 100) / 100,
      width: Math.round(box.width * 100) / 100,
      height: Math.round(box.height * 100) / 100
    }
  };
}

async function moveMouse(cdp, from, to, durationMs) {
  const steps = Math.max(8, Math.round(durationMs / 16));

  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased;

    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      button: "none"
    });
    await sleep(durationMs / steps);
  }
}

async function clickAt(cdp, point) {
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1
  });
  await sleep(80);
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1
  });
}

async function normalizeFrames(recordedFrames) {
  if (recordedFrames.length === 0) {
    throw new Error("No screencast frames were recorded.");
  }

  mkdirSync(frameDir, { recursive: true });

  for (let frame = 0; frame < durationFrames; frame += 1) {
    const targetMs = (frame / fps) * 1000;
    let selected = recordedFrames[0];

    for (const recordedFrame of recordedFrames) {
      if (recordedFrame.ms <= targetMs) {
        selected = recordedFrame;
      } else {
        break;
      }
    }

    const outputFile = path.join(frameDir, `frame-${String(frame).padStart(4, "0")}.jpg`);
    copyFileSync(selected.file, outputFile);
  }
}

function writeGeneratedData(cameraEvents) {
  const payload = {
    fps,
    durationFrames,
    source: viewport,
    framePattern: "flow-demo-v2/frames/frame-####.jpg",
    cameraEvents
  };

  writeFileSync(
    generatedDataFile,
    `export const flowDemoV2Data = ${JSON.stringify(payload, null, 2)};\n`,
    "utf8"
  );
}

async function captureWithBrowser(browser) {
  const debugPort =
    Number(process.env.FLOW_DEMO_V2_DEBUG_PORT) ||
    9500 + Math.floor(Math.random() * 400);
  const safeLabel = browser.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const userDataDir = path.join(
    repoRoot,
    `.tmp-flow-demo-v2-browser-profile-${process.pid}-${safeLabel}`
  );
  const child = launchBrowser(browser, debugPort, userDataDir);
  let cdp = null;
  const recordedFrames = [];
  const cameraEvents = [];
  let currentPoint = null;
  let recordingStartedAt = 0;

  try {
    const pageTarget = await waitForPageTarget(debugPort);
    cdp = createCdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.waitForOpen();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Input.setIgnoreInputEvents", { ignore: false });
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      mobile: false
    });

    cdp.on("Page.screencastFrame", (params) => {
      const index = recordedFrames.length;
      const file = path.join(rawFrameDir, `raw-${String(index).padStart(4, "0")}.jpg`);
      writeFileSync(file, Buffer.from(params.data, "base64"));
      recordedFrames.push({
        file,
        ms: Math.max(0, Date.now() - recordingStartedAt)
      });
      cdp.send("Page.screencastFrameAck", { sessionId: params.sessionId }).catch(() => {});
    });

    const loadEvent = cdp.once("Page.loadEventFired").catch(() => null);
    await cdp.send("Page.navigate", { url: `${baseUrl}/flow-demo-v2` });
    await loadEvent;
    await waitForDemoReady(cdp);
    await sleep(300);

    recordingStartedAt = Date.now();
    await cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 92,
      everyNthFrame: 1
    });

    async function moveToTarget(name, durationMs = 420) {
      const box = await targetBox(cdp, name);
      const destination = box.center;

      if (!currentPoint) {
        currentPoint = destination;
        await cdp.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: destination.x,
          y: destination.y,
          button: "none"
        });
        return box;
      }

      await moveMouse(cdp, currentPoint, destination, durationMs);
      currentPoint = destination;
      return box;
    }

    async function focusTarget(name, scale, durationMs = 420) {
      const box = await moveToTarget(name, durationMs);
      cameraEvents.push(cameraEvent(name, box, recordingStartedAt, scale));
      return box;
    }

    async function clickTarget(name, scale, durationMs = 420) {
      const box = await focusTarget(name, scale, durationMs);
      await clickAt(cdp, box.center);
      return box;
    }

    await sleep(350);
    await clickTarget("task-input", 1.08, 120);

    for (const char of taskText) {
      await cdp.send("Input.insertText", { text: char });
      await sleep(95);
    }

    await sleep(240);
    await clickTarget("generate-first", 1.24, 430);
    await waitForPhase(cdp, "firstReady", 4000);
    await sleep(360);
    await clickTarget("start-execution", 1.24, 430);
    await waitForPhase(cdp, "executing", 2000);
    await sleep(560);
    await clickTarget("complete-step", 1.25, 430);
    await waitForPhase(cdp, "nextLoading", 2000);
    await sleep(360);
    await focusTarget("progress-record", 1.2, 360);
    await waitForPhase(cdp, "secondReady", 4000);
    await sleep(320);
    await focusTarget("second-step-body", 1.2, 420);

    const remainingMs = durationMs - (Date.now() - recordingStartedAt);
    if (remainingMs > 0) {
      await sleep(remainingMs);
    }

    await cdp.send("Page.stopScreencast").catch(() => {});
    await normalizeFrames(recordedFrames);
    writeGeneratedData(cameraEvents);
    safeRmBestEffort(rawFrameDir);

    console.log(`recorded raw frames: ${recordedFrames.length}`);
    console.log(`normalized frames: ${durationFrames}`);
    console.log(`camera events: ${cameraEvents.map((event) => `${event.name}@${event.frame}`).join(", ")}`);
  } finally {
    cdp?.close();
    killProcessTree(child);
    safeRmBestEffort(userDataDir);
  }
}

assertInsideRepo(outputDir);
safeRm(outputDir);
mkdirSync(rawFrameDir, { recursive: true });
mkdirSync(frameDir, { recursive: true });

const previewServer = await ensurePreviewServer();
let lastError = null;

try {
  const browsers = findChromiumExecutables();

  if (browsers.length === 0) {
    throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.");
  }

  for (const browser of browsers) {
    try {
      await captureWithBrowser(browser);
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      console.warn(`${browser.label} failed: ${error.message}. Trying next Chromium browser.`);
    }
  }

  if (lastError) {
    throw lastError;
  }
} finally {
  killProcessTree(previewServer);
}
