import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "public", "flow-demo");
const baseUrl = process.env.FLOW_DEMO_BASE_URL || "http://127.0.0.1:5174";
const previewPort = new URL(baseUrl).port || "5174";
const viewport = { width: 430, height: 900, deviceScaleFactor: 1 };
const states = [
  "flow-input",
  "flow-loading",
  "flow-ready",
  "flow-executing",
  "flow-progress",
  "flow-next"
];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function findChromiumExecutables() {
  const candidates = [
    { label: "custom Chromium", path: process.env.CHROME_PATH },
    {
      label: "Chrome",
      path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    },
    {
      label: "Chrome",
      path: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    },
    {
      label: "Edge",
      path: "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    },
    {
      label: "Edge",
      path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    }
  ].filter((candidate) => candidate.path && existsSync(candidate.path));

  if (candidates.length === 0) {
    throw new Error(
      "Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable."
    );
  }

  return candidates;
}

async function isPreviewServerReady() {
  try {
    const response = await fetch(`${baseUrl}/portfolio-preview?state=flow-input`);
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
    process.platform === "win32"
      ? ["/d", "/s", "/c", "npm", ...npmArgs]
      : npmArgs;
  const child = spawn(
    command,
    args,
    {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true
    }
  );

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
  const eventResolvers = new Map();
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

    const resolvers = eventResolvers.get(message.method);
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

      const resolvers = eventResolvers.get(method) || [];
      resolvers.push((params) => {
        clearTimeout(timeout);
        resolve(params);
      });
      eventResolvers.set(method, resolvers);
    });
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

  return { close, once, send, waitForOpen };
}

async function waitForPreviewPage(cdp, state) {
  const expectedState = JSON.stringify(state);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const result = await cdp.send("Runtime.evaluate", {
        expression: `document.readyState === "complete" && document.querySelector("[data-portfolio-preview]")?.dataset.portfolioPreview === ${expectedState}`,
        returnByValue: true
      });

      if (result.result?.value === true) {
        return;
      }
    } catch {
      // The page may be between navigations.
    }

    await sleep(150);
  }

  throw new Error(`Preview page did not become ready for state "${state}".`);
}

function safeRm(targetPath) {
  try {
    rmSync(targetPath, { force: true, recursive: true, maxRetries: 3 });
  } catch {
    // Chromium can keep profile files locked briefly after exit.
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

function launchBrowser(browser, debugPort, userDataDir) {
  mkdirSync(userDataDir, { recursive: true });

  const child = spawn(
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

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    if (/ERROR:/.test(chunk)) {
      process.stderr.write(chunk);
    }
  });

  return child;
}

async function captureAll(browser) {
  const debugPort =
    Number(process.env.FLOW_DEMO_DEBUG_PORT) ||
    9300 + Math.floor(Math.random() * 600);
  const safeLabel = browser.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const userDataDir = path.join(
    repoRoot,
    `.tmp-flow-demo-browser-profile-${process.pid}-${safeLabel}`
  );
  const child = launchBrowser(browser, debugPort, userDataDir);
  let cdp = null;

  try {
    const pageTarget = await waitForPageTarget(debugPort);
    cdp = createCdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.waitForOpen();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      ...viewport,
      mobile: false
    });

    for (const state of states) {
      const outputFile = path.join(outputDir, `${state}.png`);
      const loadEvent = cdp.once("Page.loadEventFired").catch(() => null);
      await cdp.send("Page.navigate", {
        url: `${baseUrl}/portfolio-preview?state=${state}`
      });
      await loadEvent;
      await waitForPreviewPage(cdp, state);
      await sleep(300);

      const screenshot = await cdp.send("Page.captureScreenshot", {
        captureBeyondViewport: false,
        fromSurface: true,
        format: "png"
      });

      writeFileSync(outputFile, Buffer.from(screenshot.data, "base64"));
      console.log(`captured ${state}: ${path.relative(repoRoot, outputFile)}`);
    }
  } finally {
    cdp?.close();

    killProcessTree(child);

    safeRm(userDataDir);
  }
}

mkdirSync(outputDir, { recursive: true });

const previewServer = await ensurePreviewServer();
let lastError = null;

try {
  for (const browser of findChromiumExecutables()) {
    try {
      await captureAll(browser);
      process.exitCode = 0;
      lastError = null;
      break;
    } catch (error) {
      lastError = error;
      console.warn(
        `${browser.label} failed: ${error.message}. Trying next Chromium browser.`
      );
    }
  }

  if (lastError) {
    throw lastError;
  }
} finally {
  killProcessTree(previewServer);
}
