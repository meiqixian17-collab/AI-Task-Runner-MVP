import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourceFile = path.join(repoRoot, "docs", "readme-cover", "ai-task-runner-cover.html");
const outputFile = path.join(repoRoot, "public", "portfolio", "ai-task-runner-cover.png");
const viewport = { width: 1600, height: 900, deviceScaleFactor: 1 };

function findChromiumExecutables() {
  const candidates = [
    { label: "custom Chromium", path: process.env.CHROME_PATH },
    { label: "Edge", path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" },
    { label: "Edge", path: "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe" },
    { label: "Chrome", path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
    { label: "Chrome", path: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" }
  ].filter((candidate) => candidate.path && existsSync(candidate.path));

  if (candidates.length === 0) {
    throw new Error("Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.");
  }

  return candidates;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
    if (resolvers && resolvers.length > 0) {
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

function safeRm(targetPath) {
  try {
    rmSync(targetPath, { force: true, recursive: true, maxRetries: 3 });
  } catch {
    // Chromium can keep profile files locked briefly after exit.
  }
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
      "--allow-file-access-from-files",
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

async function waitForCoverReady(cdp) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const result = await cdp.send("Runtime.evaluate", {
      expression:
        "document.readyState === 'complete' && Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0)",
      returnByValue: true
    });

    if (result.result?.value === true) {
      return;
    }

    await sleep(150);
  }

  throw new Error("README cover did not become ready.");
}

async function renderWithBrowser(browser) {
  const debugPort =
    Number(process.env.README_COVER_DEBUG_PORT) ||
    9800 + Math.floor(Math.random() * 600);
  const safeLabel = browser.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const userDataDir = path.join(repoRoot, `.tmp-readme-cover-profile-${process.pid}-${safeLabel}`);
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

    const loadEvent = cdp.once("Page.loadEventFired").catch(() => null);
    await cdp.send("Page.navigate", {
      url: pathToFileURL(sourceFile).href
    });
    await loadEvent;
    await waitForCoverReady(cdp);
    await sleep(250);

    const screenshot = await cdp.send("Page.captureScreenshot", {
      captureBeyondViewport: false,
      fromSurface: true,
      format: "png"
    });

    mkdirSync(path.dirname(outputFile), { recursive: true });
    writeFileSync(outputFile, Buffer.from(screenshot.data, "base64"));
    console.log(`rendered README cover with ${browser.label}: ${path.relative(repoRoot, outputFile)}`);
  } finally {
    if (cdp) {
      cdp.close();
    }

    if (!child.killed) {
      child.kill();
    }

    safeRm(userDataDir);
  }
}

if (!existsSync(sourceFile)) {
  throw new Error(`Missing README cover source: ${sourceFile}`);
}

let lastError = null;

for (const browser of findChromiumExecutables()) {
  try {
    await renderWithBrowser(browser);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(`${browser.label} failed: ${error.message}. Trying next Chromium browser.`);
  }
}

throw lastError || new Error("Unable to render README cover.");
