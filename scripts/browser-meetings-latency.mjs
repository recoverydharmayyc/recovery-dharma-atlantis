import { spawn } from "node:child_process";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GLOBAL_ENDPOINT = "https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings";
const CACHE_KEY = "recovery-dharma-atlantis-global-meetings-v2";
const ROUTE_BUDGET_MS = Number(process.env.MEETINGS_ROUTE_BUDGET_MS || 120);
const BROWSER_PROFILE_PARENT = process.env.BROWSER_PROFILE_PARENT || PROJECT_ROOT;
const BROWSER_TEMP_PARENT = process.env.BROWSER_TEMP_PARENT || BROWSER_PROFILE_PARENT;
const SOURCE_ROUTES = ["/", "/about", "/newcomers", "/resources", "/connect"];
const OUTPUT_ARGUMENT = process.argv.find((argument) => argument.startsWith("--output="));
const OUTPUT_PATH = OUTPUT_ARGUMENT
  ? path.resolve(OUTPUT_ARGUMENT.slice("--output=".length))
  : null;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function availablePort(preferredPort = 0) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(preferredPort, "127.0.0.1", resolve);
  });
  const address = server.address();
  invariant(address && typeof address === "object", "Could not reserve a browser-test port");
  const port = address.port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function nearbyAvailablePort(startingPort) {
  for (let offset = 0; offset < 20; offset += 1) {
    try {
      return await availablePort(startingPort + offset);
    } catch {
      // Try the next local port.
    }
  }
  throw new Error("Could not reserve a second browser-test port");
}

async function firstAvailable(paths) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the next known browser location.
    }
  }
  return null;
}

async function waitForDevTools(port, timeoutMs = 15_000) {
  const urls = [`http://127.0.0.1:${port}/json/list`, `http://[::1]:${port}/json/list`];
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) return await response.json();
      } catch {
        // Chrome may bind either local address in constrained environments.
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for Chrome DevTools on port ${port}`);
}

async function waitForHttp(url, timeoutMs = 15_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timeoutId);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.listeners.get(message.method) || []) listener(message.params);
    });
    this.socket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error("Chrome DevTools connection closed"));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, timeoutMs = 5_000) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Chrome DevTools command timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timeoutId });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    this.listeners.set(method, [...(this.listeners.get(method) || []), listener]);
  }

  close() {
    this.socket.close();
  }
}

function stage(message) {
  process.stderr.write(`[meetings-browser] ${message}\n`);
}

function maximumCache({ corrupt = false } = {}) {
  return Array.from({ length: 240 }, (_, index) => ({
    id: `browser-cache-${index}`,
    name: `Cached open meeting ${index} ${"Aegean ".repeat(12)}`.slice(0, 180),
    dayIndex: index % 7,
    time: `${String(index % 24).padStart(2, "0")}:${index % 2 ? "30" : "00"}`,
    endTime: `${String((index + 1) % 24).padStart(2, "0")}:${index % 2 ? "30" : "00"}`,
    timeZone: "UTC",
    region: "Online",
    conferenceUrl:
      corrupt && index === 239 ? "javascript:alert(1)" : `https://zoom.us/j/${100000000 + index}`,
    sourceUrl: "https://recoverydharma.org/meetings/",
  }));
}

const livePayload = [
  {
    id: "browser-safe-live",
    name: "Browser regression open meeting",
    day: 4,
    time: "18:00",
    end_time: "19:00",
    timezone: "UTC",
    regions: ["Online"],
    conference_url: "https://zoom.us/j/123456789",
    url: "https://recoverydharma.org/meetings/",
    types: ["O"],
  },
];

let viteProcess;
let chromeProcess;
let browserProfile;
let cdp;

async function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  const signalProcess = (signal) => {
    try {
      if (process.platform !== "win32" && processHandle.pid)
        process.kill(-processHandle.pid, signal);
      else processHandle.kill(signal);
    } catch {
      // The process group may already have closed.
    }
  };
  signalProcess("SIGTERM");
  await Promise.race([
    new Promise((resolve) => processHandle.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  if (processHandle.exitCode === null) signalProcess("SIGKILL");
}

async function cleanup() {
  cdp?.close();
  await stopProcess(chromeProcess);
  await stopProcess(viteProcess);
  if (browserProfile) await rm(browserProfile, { recursive: true, force: true });
}

process.once("SIGINT", () => void cleanup().finally(() => process.exit(130)));
process.once("SIGTERM", () => void cleanup().finally(() => process.exit(143)));

try {
  const chromePath =
    process.env.CHROME_PATH ||
    (await firstAvailable([
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]));
  invariant(chromePath, "Chrome or Chromium is required for the Meetings browser regression check");

  const vitePort = await availablePort();
  const debugPort = await nearbyAvailablePort(vitePort + 1);
  const baseUrl = `http://127.0.0.1:${vitePort}`;
  const viteOutput = [];
  viteProcess = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"],
    {
      cwd: PROJECT_ROOT,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [viteProcess.stdout, viteProcess.stderr]) {
    stream.on("data", (chunk) => {
      viteOutput.push(String(chunk));
      if (viteOutput.length > 30) viteOutput.shift();
    });
  }
  await waitForHttp(`${baseUrl}/`, 15_000).catch((error) => {
    throw new Error(`${error.message}\n${viteOutput.join("")}`);
  });
  stage(`Vite ready at ${baseUrl}`);

  browserProfile = await mkdtemp(path.join(BROWSER_PROFILE_PARENT, ".browser-test-"));
  const chromeOutput = [];
  chromeProcess = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-gpu-compositing",
      "--enable-unsafe-swiftshader",
      "--no-default-browser-check",
      "--no-first-run",
      "--no-sandbox",
      "--remote-debugging-address=127.0.0.1",
      `--remote-debugging-port=${debugPort}`,
      "--use-angle=swiftshader",
      "--use-gl=angle",
      `--user-data-dir=${browserProfile}`,
      "--window-size=1440,900",
      `${baseUrl}/`,
    ],
    {
      detached: process.platform !== "win32",
      env: { ...process.env, TMPDIR: BROWSER_TEMP_PARENT },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [chromeProcess.stdout, chromeProcess.stderr]) {
    stream.on("data", (chunk) => {
      chromeOutput.push(String(chunk));
      if (chromeOutput.length > 60) chromeOutput.shift();
    });
  }

  const targets = await waitForDevTools(debugPort).catch((error) => {
    throw new Error(`${error.message}\n${chromeOutput.join("")}`);
  });
  stage(`Chrome DevTools ready on ${debugPort}`);
  const target = targets.find((item) => item.type === "page");
  invariant(target, "The browser did not expose a page target");
  cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Fetch.enable", {
    patterns: [{ urlPattern: GLOBAL_ENDPOINT, requestStage: "Request" }],
  });
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  stage("DevTools domains configured");

  const heldRequests = new Set();
  cdp.on("Fetch.requestPaused", (event) => {
    if (event.request.url === GLOBAL_ENDPOINT) heldRequests.add(event.requestId);
    else void cdp.send("Fetch.continueRequest", { requestId: event.requestId });
  });

  async function evaluate(expression) {
    const result = await cdp.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async function waitUntil(predicateExpression, message, timeoutMs = 4_000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (await evaluate(predicateExpression)) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(message);
  }

  async function clearHeldRequests() {
    for (const requestId of heldRequests) {
      try {
        await cdp.send("Fetch.failRequest", { requestId, errorReason: "Aborted" });
      } catch {
        // Route cleanup may already have cancelled the request.
      }
    }
    heldRequests.clear();
  }

  async function routeTo(pathname) {
    await clearHeldRequests();
    await cdp.send("Page.navigate", { url: `${baseUrl}${pathname}` });
    await waitUntil(
      `location.pathname === ${JSON.stringify(pathname)} && Boolean(document.querySelector('#main-content h1'))`,
      `Route did not settle: ${pathname}`,
    );
  }

  async function setCache(mode) {
    const cacheValue =
      mode === "empty"
        ? null
        : JSON.stringify({
            schemaVersion: 2,
            cachedAt: Date.now(),
            meetings: maximumCache({ corrupt: mode === "corrupt-max" }),
          });
    await evaluate(
      cacheValue === null
        ? `localStorage.removeItem(${JSON.stringify(CACHE_KEY)})`
        : `localStorage.setItem(${JSON.stringify(CACHE_KEY)}, ${JSON.stringify(cacheValue)})`,
    );
  }

  async function measureNavigation(sourcePath, cacheMode) {
    await routeTo(sourcePath);
    await setCache(cacheMode);
    await evaluate(`(() => {
      performance.clearMarks();
      performance.clearMeasures();
      window.__atlantisRouteResult = null;
      window.__atlantisFirstFrame = null;
      const startedAt = performance.now();
      performance.mark('route-click');
      const main = document.querySelector('#main-content');
      const collect = (observedBy) => {
        const heading = document.querySelector('#meetings-heading');
        const controls = document.querySelectorAll('.schedule-row__select');
        const detail = document.querySelector('#selected-meeting-details');
        if (!heading || controls.length !== 2 || !detail) return false;
        performance.mark('local-content-ready');
        performance.measure('route-click-to-local-content', 'route-click', 'local-content-ready');
        const pageStyle = getComputedStyle(document.querySelector('.meetings-page'));
        window.__atlantisRouteResult = {
          source: ${JSON.stringify(sourcePath)},
          cacheMode: ${JSON.stringify(cacheMode)},
          observedBy,
          localContentMs: performance.getEntriesByName('route-click-to-local-content').at(-1)?.duration,
          activeRoute: Boolean(document.querySelector('a[href="/meetings"][aria-current="page"]')),
          controls: controls.length,
          selectedTitle: detail.querySelector('h3')?.textContent,
          globalState: document.querySelector('[data-global-state]')?.dataset.globalState,
          opacity: pageStyle.opacity,
          visibility: pageStyle.visibility,
          animationName: pageStyle.animationName,
          transitionProperty: pageStyle.transitionProperty,
        };
        return true;
      };
      const observer = new MutationObserver(() => {
        if (collect('mutation')) observer.disconnect();
      });
      observer.observe(main, { childList: true, subtree: true });
      requestAnimationFrame(() => {
        window.__atlantisFirstFrame = {
          elapsedMs: performance.now() - startedAt,
          headingVisible: Boolean(document.querySelector('#meetings-heading')),
          controlsVisible: document.querySelectorAll('.schedule-row__select').length === 2,
          detailVisible: Boolean(document.querySelector('#selected-meeting-details')),
        };
        collect('first-frame');
      });
      document.querySelector('.primary-nav a[href="/meetings"]')?.click();
    })()`);
    await waitUntil(
      "Boolean(window.__atlantisRouteResult && window.__atlantisFirstFrame)",
      `Local Meetings content did not appear from ${sourcePath}`,
    );
    const result = await evaluate("window.__atlantisRouteResult");
    result.firstFrame = await evaluate("window.__atlantisFirstFrame");
    result.cacheBytes = await evaluate(
      `localStorage.getItem(${JSON.stringify(CACHE_KEY)})?.length || 0`,
    );
    invariant(
      result.activeRoute,
      `${sourcePath}: active Meetings route did not update with content`,
    );
    invariant(
      result.controls === 2,
      `${sourcePath}: both local meeting controls were not available`,
    );
    invariant(
      result.firstFrame.headingVisible,
      `${sourcePath}: heading missed the first rendered frame`,
    );
    invariant(
      result.firstFrame.controlsVisible,
      `${sourcePath}: local rows missed the first rendered frame`,
    );
    invariant(
      result.firstFrame.detailVisible,
      `${sourcePath}: selected detail missed the first rendered frame`,
    );
    invariant(
      result.globalState === "loading",
      `${sourcePath}: Global work was not isolated as loading`,
    );
    invariant(result.opacity === "1", `${sourcePath}: Meetings page was opacity-hidden`);
    invariant(
      result.visibility === "visible",
      `${sourcePath}: Meetings page was visibility-hidden`,
    );
    invariant(
      result.animationName === "none",
      `${sourcePath}: Meetings page retained an entry animation`,
    );
    invariant(
      !result.transitionProperty
        .split(",")
        .map((value) => value.trim())
        .includes("opacity"),
      `${sourcePath}: Meetings page retained an opacity transition`,
    );
    invariant(
      result.localContentMs <= ROUTE_BUDGET_MS,
      `${sourcePath}: local content took ${result.localContentMs.toFixed(1)}ms (budget ${ROUTE_BUDGET_MS}ms)`,
    );
    return result;
  }

  await routeTo("/");
  const measurements = [];
  for (const sourcePath of SOURCE_ROUTES) {
    stage(`measuring ${sourcePath} to /meetings with an empty cache`);
    measurements.push(await measureNavigation(sourcePath, "empty"));
  }
  stage("measuring maximum fresh cache");
  measurements.push(await measureNavigation("/", "fresh-max"));
  stage("measuring maximum corrupted cache");
  measurements.push(await measureNavigation("/", "corrupt-max"));

  await waitUntil(
    "document.querySelectorAll('.schedule-row__select').length === 2",
    "Local rows missing",
  );
  await evaluate(`(() => {
    window.__meetingsRouteRoot = document.querySelector('.meetings-page');
    document.querySelectorAll('.schedule-row__select')[1].click();
  })()`);
  await waitUntil(
    "document.querySelectorAll('.schedule-row__select')[1]?.getAttribute('aria-pressed') === 'true'",
    "The Sunday meeting could not be selected",
  );
  await waitUntil("window.__meetingsRouteRoot && true", "Meetings route root was not captured");
  await waitUntil(
    "document.querySelector('[data-global-state]')?.dataset.globalState === 'loading'",
    "Global loading state was not isolated",
  );
  const requestStartedAt = Date.now();
  while (heldRequests.size === 0 && Date.now() - requestStartedAt < 2_000)
    await new Promise((resolve) => setTimeout(resolve, 10));
  invariant(heldRequests.size > 0, "The delayed Global request did not start");
  stage("resolving the delayed Global request");

  const encodedPayload = Buffer.from(JSON.stringify(livePayload)).toString("base64");
  for (const requestId of [...heldRequests]) {
    await cdp.send("Fetch.fulfillRequest", {
      requestId,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "Access-Control-Allow-Origin", value: "*" },
      ],
      body: encodedPayload,
    });
    heldRequests.delete(requestId);
  }
  await waitUntil(
    "document.querySelector('[data-global-state]')?.dataset.globalState !== 'loading'",
    "The fulfilled Global request did not resolve",
  );
  const afterGlobalResolution = await evaluate(`({
    routeRootRetained: window.__meetingsRouteRoot === document.querySelector('.meetings-page'),
    sundayStillSelected: document.querySelectorAll('.schedule-row__select')[1]?.getAttribute('aria-pressed') === 'true',
    selectedTitle: document.querySelector('#selected-meeting-details h3')?.textContent,
    globalState: document.querySelector('[data-global-state]')?.dataset.globalState,
  })`);
  invariant(
    afterGlobalResolution.routeRootRetained,
    "Global resolution remounted the Meetings route root",
  );
  invariant(
    afterGlobalResolution.sundayStillSelected,
    "Global resolution reset the local selection",
  );

  const report = {
    capturedAt: new Date().toISOString(),
    viewport: "1440x900",
    budgetMs: ROUTE_BUDGET_MS,
    delayedGlobalRequest: true,
    measurements,
    afterGlobalResolution,
  };
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (OUTPUT_PATH) await writeFile(OUTPUT_PATH, serialized);
  process.stdout.write(serialized);
} finally {
  await cleanup();
}
