import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GLOBAL_ENDPOINT = "https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings";
const CACHE_KEY = "recovery-dharma-atlantis-global-meetings-v2";
const OUTPUT_ARGUMENT = process.argv.find((argument) => argument.startsWith("--output-dir="));
const OUTPUT_DIR = OUTPUT_ARGUMENT
  ? path.resolve(OUTPUT_ARGUMENT.slice("--output-dir=".length))
  : path.join(tmpdir(), "recovery-dharma-atlantis-v8-review");

const VIEWPORTS = [
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1640, height: 900 },
  { width: 1920, height: 1080 },
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 900 },
  { width: 824, height: 900 },
];

const ROUTES = [
  "/",
  "/meetings",
  "/about",
  "/newcomers",
  "/resources",
  "/connect",
  "/unknown-route",
];

const REQUIRED_SCREENSHOTS = [
  ["home-390x844.png", "/", 390, 844, "plain"],
  ["home-1280x720.png", "/", 1280, 720, "plain"],
  ["home-1366x768.png", "/", 1366, 768, "plain"],
  ["home-1440x900.png", "/", 1440, 900, "plain"],
  ["meetings-390x844.png", "/meetings", 390, 844, "live"],
  ["meetings-1366x768.png", "/meetings", 1366, 768, "live"],
  ["meetings-1440x900.png", "/meetings", 1440, 900, "live"],
  ["about-1366x768.png", "/about", 1366, 768, "plain"],
  ["newcomers-1366x768.png", "/newcomers", 1366, 768, "plain"],
  ["resources-1440x900.png", "/resources", 1440, 900, "plain"],
  ["connect-1024x768.png", "/connect", 1024, 768, "plain"],
  ["connect-1440x900.png", "/connect", 1440, 900, "plain"],
  ["not-found-1024x768.png", "/unknown-route", 1024, 768, "plain"],
];

const livePayload = Array.from({ length: 6 }, (_, index) => ({
  id: `v8-live-${index + 1}`,
  name: [
    "Open Practice Online",
    "Morning Meditation Circle",
    "Evening Sangha Online",
    "Open Inquiry Meeting",
    "Weekend Reflection Circle",
    "Community Practice Online",
  ][index],
  day: index,
  time: `${String(9 + index).padStart(2, "0")}:00`,
  end_time: `${String(10 + index).padStart(2, "0")}:00`,
  timezone: "UTC",
  regions: ["Online"],
  conference_url: `https://zoom.us/j/${123456780 + index}`,
  url: "https://recoverydharma.org/meetings/",
  types: ["O"],
}));

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function stage(message) {
  process.stderr.write(`[v8-browser] ${message}\n`);
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
  }

  send(method, params = {}, timeoutMs = 8_000) {
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

let viteProcess;
let chromeProcess;
let browserProfile;
let cdp;

async function stopProcess(processHandle) {
  if (!processHandle || processHandle.exitCode !== null) return;
  try {
    if (process.platform !== "win32" && processHandle.pid)
      process.kill(-processHandle.pid, "SIGTERM");
    else processHandle.kill("SIGTERM");
  } catch {
    // The process group may already have closed.
  }
  await Promise.race([
    new Promise((resolve) => processHandle.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
}

async function cleanup() {
  cdp?.close();
  await stopProcess(chromeProcess);
  await stopProcess(viteProcess);
  if (browserProfile) await rm(browserProfile, { recursive: true, force: true });
}

try {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const chromePath =
    process.env.CHROME_PATH ||
    (await firstAvailable([
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]));
  invariant(chromePath, "Chrome or Chromium is required for V8 browser review");

  const vitePort = await availablePort();
  const debugPort = await nearbyAvailablePort(vitePort + 1);
  const baseUrl = `http://127.0.0.1:${vitePort}`;
  viteProcess = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(vitePort), "--strictPort"],
    { cwd: PROJECT_ROOT, detached: process.platform !== "win32", stdio: "ignore" },
  );
  await waitForHttp(`${baseUrl}/`);
  stage(`Vite ready at ${baseUrl}`);

  browserProfile = await mkdtemp(path.join(tmpdir(), "recovery-dharma-atlantis-v8-browser-"));
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
      "--window-size=1920,1080",
      `${baseUrl}/`,
    ],
    { cwd: browserProfile, detached: process.platform !== "win32", stdio: "ignore" },
  );

  const targets = await waitForDevTools(debugPort);
  const target = targets.find((item) => item.type === "page");
  invariant(target, "The browser did not expose a page target");
  cdp = new CdpClient(target.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Fetch.enable", {
    patterns: [{ urlPattern: GLOBAL_ENDPOINT, requestStage: "Request" }],
  });

  let globalMode = "live";
  const heldRequests = new Set();
  const requestUrls = new Map();
  const consoleErrors = [];
  const failedLocalRequests = [];
  const unexpectedExternalRequests = new Set();

  cdp.on("Runtime.exceptionThrown", (event) => {
    consoleErrors.push(event.exceptionDetails?.text || "Uncaught browser exception");
  });
  cdp.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error") consoleErrors.push(event.args?.map((arg) => arg.value).join(" "));
  });
  cdp.on("Network.requestWillBeSent", (event) => {
    const url = event.request.url;
    requestUrls.set(event.requestId, url);
    if (/^https?:/i.test(url) && !url.startsWith(baseUrl) && url !== GLOBAL_ENDPOINT)
      unexpectedExternalRequests.add(url);
  });
  cdp.on("Network.loadingFailed", (event) => {
    if (event.canceled) return;
    const url = requestUrls.get(event.requestId);
    if (url?.startsWith(baseUrl)) failedLocalRequests.push(`${event.errorText}:${url}`);
  });
  cdp.on("Fetch.requestPaused", (event) => {
    if (event.request.url !== GLOBAL_ENDPOINT) {
      void cdp.send("Fetch.continueRequest", { requestId: event.requestId });
      return;
    }
    if (globalMode === "hold") {
      heldRequests.add(event.requestId);
      return;
    }
    if (globalMode === "fail") {
      void cdp.send("Fetch.failRequest", { requestId: event.requestId, errorReason: "Failed" });
      return;
    }
    void cdp.send("Fetch.fulfillRequest", {
      requestId: event.requestId,
      responseCode: 200,
      responseHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "Access-Control-Allow-Origin", value: "*" },
      ],
      body: Buffer.from(JSON.stringify(livePayload)).toString("base64"),
    });
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

  async function waitUntil(expression, message, timeoutMs = 5_000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    throw new Error(message);
  }

  async function clearHeldRequests() {
    for (const requestId of heldRequests) {
      try {
        await cdp.send("Fetch.failRequest", { requestId, errorReason: "Aborted" });
      } catch {
        // Navigation may already have cancelled it.
      }
    }
    heldRequests.clear();
  }

  async function setViewport(width, height) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
  }

  async function settle() {
    await evaluate(
      `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`,
    );
  }

  async function navigate(route, { mode = "live", waitForGlobal = true } = {}) {
    await clearHeldRequests();
    globalMode = mode;
    const appIsMounted = await evaluate(`Boolean(document.querySelector('#root'))`).catch(
      () => false,
    );
    if (appIsMounted) {
      await evaluate(`(() => {
        history.pushState({}, '', ${JSON.stringify(route)});
        dispatchEvent(new PopStateEvent('popstate'));
      })()`);
    } else {
      await cdp.send("Page.navigate", { url: `${baseUrl}${route}` });
    }
    try {
      await waitUntil(
        `location.pathname === ${JSON.stringify(route)} && Boolean(document.querySelector('#main-content h1'))`,
        `Route did not render: ${route}`,
      );
    } catch (error) {
      const diagnostic = await evaluate(`({
        pathname: location.pathname,
        heading: document.querySelector('#main-content h1')?.textContent || null,
        rootText: document.querySelector('#root')?.textContent?.slice(0, 240) || null,
      })`).catch(() => ({ browser: "unavailable" }));
      throw new Error(`${error.message}; diagnostic=${JSON.stringify(diagnostic)}`);
    }
    if (route === "/meetings" && mode !== "hold" && waitForGlobal)
      await waitUntil(
        `document.querySelector('[data-global-state]')?.dataset.globalState !== 'loading'`,
        `Global state did not settle in ${mode} mode`,
      );
    await settle();
  }

  async function capture(filename) {
    const result = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(path.join(OUTPUT_DIR, filename), Buffer.from(result.data, "base64"));
  }

  async function clearCache() {
    await evaluate(`localStorage.removeItem(${JSON.stringify(CACHE_KEY)})`);
  }

  async function setFreshCache() {
    const cache = {
      schemaVersion: 2,
      cachedAt: Date.now(),
      meetings: Array.from({ length: 4 }, (_, index) => ({
        id: `v8-cache-${index}`,
        name: `Cached open meeting ${index + 1}`,
        dayIndex: index,
        time: `${String(10 + index).padStart(2, "0")}:00`,
        endTime: `${String(11 + index).padStart(2, "0")}:00`,
        timeZone: "UTC",
        region: "Online",
        conferenceUrl: `https://zoom.us/j/${223456780 + index}`,
        sourceUrl: "https://recoverydharma.org/meetings/",
      })),
    };
    await evaluate(
      `localStorage.setItem(${JSON.stringify(CACHE_KEY)}, ${JSON.stringify(JSON.stringify(cache))})`,
    );
  }

  async function measure(route, width, height, state = "default") {
    const selectors = {
      "/": ["#home-heading", ".next-ledger", "#home-practice-heading"],
      "/meetings": [
        "#meetings-heading",
        ".schedule-ledger",
        "#selected-meeting-details",
        "#global-heading",
      ],
      "/about": ["#about-heading", ".about-principles", ".about-rhythm"],
      "/newcomers": ["#newcomers-heading", ".newcomer-guide", ".newcomer-closing"],
      "/resources": ["#resources-heading", ".resource-chapters"],
      "/connect": ["#connect-heading", ".connect-empty"],
      "/unknown-route": ["#not-found-heading", ".not-found-action"],
    }[route];
    return evaluate(`(() => {
      const main = document.querySelector('.site-main');
      const root = document.documentElement;
      const body = document.body;
      const mainStyle = getComputedStyle(main);
      const descendants = [...main.querySelectorAll('*')];
      const nestedScrollers = descendants.filter((element) => {
        const overflow = getComputedStyle(element).overflowY;
        return overflow === 'auto' || overflow === 'scroll';
      });
      const visible = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const mainRange = Math.max(0, main.scrollHeight - main.clientHeight);
      const bodyRange = Math.max(0, root.scrollHeight - root.clientHeight, body.scrollHeight - body.clientHeight);
      return {
        viewport: ${JSON.stringify(`${width}x${height}`)},
        route: ${JSON.stringify(route)},
        state: ${JSON.stringify(state)},
        documentScrollHeight: root.scrollHeight,
        documentClientHeight: root.clientHeight,
        siteMainScrollHeight: main.scrollHeight,
        siteMainClientHeight: main.clientHeight,
        bodyScrollRange: bodyRange,
        siteMainScrollRange: mainRange,
        nestedOverflowYCount: nestedScrollers.length,
        shellMode: mainStyle.overflowY === 'auto' ? 'single-main-scroll' : 'document-flow',
        fit: mainRange <= 1,
        horizontalOverflow: root.scrollWidth > root.clientWidth + 1 || main.scrollWidth > main.clientWidth + 1,
        keyFirstScreenElements: ${JSON.stringify(selectors)}.map((selector) => ({ selector, visible: visible(selector) })),
        headerHeight: document.querySelector('.site-header')?.getBoundingClientRect().height || 0,
        footerHeight: document.querySelector('.site-footer')?.getBoundingClientRect().height || 0,
      };
    })()`);
  }

  stage("auditing route and viewport matrix");
  const fitRecords = [];
  for (const viewport of VIEWPORTS) {
    await setViewport(viewport.width, viewport.height);
    for (const route of ROUTES) {
      stage(`matrix ${viewport.width}x${viewport.height} ${route}`);
      await navigate(route, { mode: route === "/meetings" ? "live" : "hold" });
      fitRecords.push(await measure(route, viewport.width, viewport.height));
    }
  }

  stage("capturing required default screenshots");
  for (const [filename, route, width, height, mode] of REQUIRED_SCREENSHOTS) {
    await setViewport(width, height);
    await navigate(route, { mode: mode === "plain" ? "hold" : mode });
    await capture(filename);
  }

  stage("checking mobile navigation and focus restoration");
  await setViewport(390, 844);
  await navigate("/", { mode: "hold" });
  await evaluate(`document.querySelector('.menu-button').click()`);
  await waitUntil(
    `Boolean(document.querySelector('.mobile-nav-panel'))`,
    "Mobile menu did not open",
  );
  await capture("menu-open-390x844.png");
  await evaluate(
    `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`,
  );
  await waitUntil(`!document.querySelector('.mobile-nav-panel')`, "Escape did not close the menu");
  await waitUntil(
    `document.activeElement === document.querySelector('.menu-button')`,
    "Mobile menu focus did not return to its trigger",
  );
  const menuResult = await evaluate(`({
    focusReturned: document.activeElement === document.querySelector('.menu-button'),
    bodyOverflow: getComputedStyle(document.body).overflowY,
    mainOverflow: getComputedStyle(document.querySelector('.site-main')).overflowY,
  })`);

  stage("checking Global pending, live, cached, failure, selection, and expansion states");
  await setViewport(1440, 900);
  await clearCache();
  await navigate("/meetings", { mode: "hold", waitForGlobal: false });
  const pendingState = await evaluate(`({
    state: document.querySelector('[data-global-state]')?.dataset.globalState,
    localRows: document.querySelectorAll('.schedule-row__select').length,
    detail: Boolean(document.querySelector('#selected-meeting-details')),
  })`);
  invariant(pendingState.state === "loading", "Pending Global state was not isolated");
  invariant(
    pendingState.localRows === 2 && pendingState.detail,
    "Pending Global work hid local content",
  );

  await navigate("/", { mode: "hold" });
  await navigate("/meetings", { mode: "live" });
  const liveState = await evaluate(`({
    state: document.querySelector('[data-global-state]')?.dataset.globalState,
    records: document.querySelectorAll('.global-meeting').length,
    canExpand: Boolean(document.querySelector('.global-show-more')),
  })`);
  invariant(liveState.state === "live", "Live Global state did not render");
  invariant(
    liveState.records === 3 && liveState.canExpand,
    "Default Global preview was not three records",
  );
  await evaluate(`document.querySelectorAll('.schedule-row__select')[0].click()`);
  const wednesdaySelected = await evaluate(
    `document.querySelectorAll('.schedule-row__select')[0].getAttribute('aria-pressed') === 'true'`,
  );
  await evaluate(`document.querySelectorAll('.schedule-row__select')[1].click()`);
  const sundaySelected = await evaluate(
    `document.querySelectorAll('.schedule-row__select')[1].getAttribute('aria-pressed') === 'true'`,
  );
  invariant(wednesdaySelected && sundaySelected, "Both local meeting selections were not operable");
  await evaluate(`document.querySelector('.global-show-more').click()`);
  await waitUntil(
    `document.querySelectorAll('.global-meeting').length > 3`,
    "Show more did not reveal additional Global records",
  );
  const expandedMeasurement = await measure("/meetings", 1440, 900, "global-expanded");
  invariant(
    expandedMeasurement.nestedOverflowYCount === 0,
    "Expanded Global records created a nested scroller",
  );
  await capture("meetings-global-expanded-1440x900.png");

  await navigate("/", { mode: "hold" });
  await setFreshCache();
  await navigate("/meetings", { mode: "fail" });
  const cachedState = await evaluate(
    `document.querySelector('[data-global-state]')?.dataset.globalState`,
  );
  invariant(cachedState === "cached", "Fresh cache was not retained after live failure");

  await navigate("/", { mode: "hold" });
  await clearCache();
  await setViewport(1366, 768);
  await navigate("/meetings", { mode: "fail" });
  const fallbackState = await evaluate(`({
    state: document.querySelector('[data-global-state]')?.dataset.globalState,
    localRows: document.querySelectorAll('.schedule-row__select').length,
    directoryLink: Boolean(document.querySelector('.global-directory__intro a[href="https://recoverydharma.org/meetings/"]')),
  })`);
  invariant(
    fallbackState.localRows === 2 && fallbackState.directoryLink,
    "No-cache fallback lost local or directory content",
  );
  await capture("meetings-global-fallback-1366x768.png");

  stage(
    "checking announcement shell, route scroll reset, long copy, zoom reflow, and reduced motion",
  );
  await setViewport(1366, 768);
  await navigate("/", { mode: "hold" });
  const announcementAbsent = await evaluate(`!document.querySelector('.announcement-bulletin')`);
  invariant(announcementAbsent, "Disabled announcement reserved a DOM region");
  await evaluate(`(() => {
    const aside = document.createElement('aside');
    aside.className = 'announcement-bulletin';
    aside.setAttribute('aria-label', 'Temporary gathering');
    aside.innerHTML = '<div class="site-container announcement-bulletin__inner"><span class="announcement-bulletin__marker">Extra meeting · Upcoming</span><span class="announcement-bulletin__message"><strong>Temporary community meeting</strong><span>Next Saturday · 2:00 p.m. · Atlantis Community Room</span></span><a class="announcement-bulletin__link" href="/meetings#local-schedule">View details →</a></div>';
    document.querySelector('.site-header').after(aside);
  })()`);
  const announcementMeasurement = await measure("/", 1366, 768, "temporary-announcement-fixture");
  invariant(announcementMeasurement.bodyScrollRange === 0, "Announcement created body scrolling");
  await capture("announcement-1366x768.png");

  await navigate("/resources", { mode: "hold" });
  await evaluate(`document.querySelector('.site-main').scrollTop = 400`);
  await evaluate(`document.querySelector('.brand-link').click()`);
  await waitUntil(`location.pathname === '/'`, "Route-scroll test did not navigate home");
  const resetResult = await evaluate(`({
    mainTop: document.querySelector('.site-main').scrollTop,
    documentTop: document.documentElement.scrollTop || document.body.scrollTop,
  })`);
  invariant(
    resetResult.mainTop === 0 && resetResult.documentTop === 0,
    "Route navigation did not reset scroll ownership",
  );

  await setViewport(390, 844);
  await navigate("/meetings", { mode: "live" });
  await evaluate(
    `document.querySelector('.meeting-detail__description').textContent += ' This intentionally lengthened review fixture checks that detailed local information continues in normal flow without clipping or an internal scrollbar.'`,
  );
  const longCopyMeasurement = await measure("/meetings", 390, 844, "long-local-description");
  invariant(
    !longCopyMeasurement.horizontalOverflow,
    "Long meeting copy created horizontal overflow",
  );

  await setViewport(720, 450);
  await navigate("/", { mode: "hold" });
  const zoomEquivalent = await measure("/", 720, 450, "200-percent-reflow-equivalent");
  invariant(
    zoomEquivalent.shellMode === "document-flow",
    "Zoom-equivalent layout remained body locked",
  );
  invariant(!zoomEquivalent.horizontalOverflow, "Zoom-equivalent layout overflowed horizontally");

  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  const reducedMotion = await evaluate(`(() => {
    const style = getComputedStyle(document.querySelector('.button-link'));
    return { matches: matchMedia('(prefers-reduced-motion: reduce)').matches, duration: style.transitionDuration };
  })()`);
  invariant(reducedMotion.matches, "Reduced-motion preference was not emulated");
  await cdp.send("Emulation.setEmulatedMedia", { features: [] });

  stage("capturing error boundary and compact footer fixtures");
  await setViewport(1024, 768);
  await navigate("/", { mode: "hold" });
  await evaluate(
    `document.querySelector('#root').innerHTML = '<div class="app-error-shell" data-demo-state="fictional"><main class="app-error" aria-labelledby="app-error-title"><p class="app-error-label">Fictional example</p><h1 id="app-error-title">This page could not be displayed.</h1><p>Reload the page to try again. No message or personal information was sent.</p><button type="button">Reload page</button><p class="app-error-notice">Recovery Dharma Atlantis is a fictional tutorial community and does not describe an active meeting.</p></main></div>'`,
  );
  await capture("error-boundary-1024x768.png");

  await setViewport(1440, 900);
  await cdp.send("Page.navigate", { url: `${baseUrl}/` });
  await waitUntil(
    `Boolean(document.querySelector('#main-content h1'))`,
    "App did not recover after error fixture",
  );
  globalMode = "hold";
  await settle();
  await capture("compact-footer-1440x900.png");

  const allMeasurements = [
    ...fitRecords,
    expandedMeasurement,
    announcementMeasurement,
    longCopyMeasurement,
    zoomEquivalent,
  ];
  const targetFits = [
    ["/", "1366x768"],
    ["/", "1440x900"],
    ["/", "1640x900"],
    ["/about", "1366x768"],
    ["/about", "1440x900"],
    ["/newcomers", "1366x768"],
    ["/newcomers", "1440x900"],
    ["/connect", "1024x768"],
    ["/connect", "1280x720"],
    ["/connect", "1366x768"],
    ["/connect", "1440x900"],
    ["/unknown-route", "1024x768"],
    ["/resources", "1440x900"],
    ["/meetings", "1440x900"],
    ["/meetings", "1640x900"],
  ];
  const failedTargets = targetFits.filter(([route, viewport]) => {
    const record = fitRecords.find((item) => item.route === route && item.viewport === viewport);
    return !record?.fit;
  });

  const reportLines = [
    "Recovery Dharma Atlantis V8 viewport-fit report",
    `Captured: ${new Date().toISOString()}`,
    "Fit law: siteMain.scrollHeight <= siteMain.clientHeight + 1",
    "",
    ...allMeasurements.flatMap((record) => [
      `viewport=${record.viewport} route=${record.route} state=${record.state}`,
      `document=${record.documentScrollHeight}/${record.documentClientHeight} site-main=${record.siteMainScrollHeight}/${record.siteMainClientHeight}`,
      `body-range=${record.bodyScrollRange} main-range=${record.siteMainScrollRange} nested-overflow-y=${record.nestedOverflowYCount} fit=${record.fit} mode=${record.shellMode} horizontal-overflow=${record.horizontalOverflow}`,
      `header=${record.headerHeight.toFixed(1)} footer=${record.footerHeight.toFixed(1)} first-screen=${record.keyFirstScreenElements.map((item) => `${item.selector}:${item.visible}`).join(",")}`,
      "",
    ]),
  ];
  await writeFile(path.join(OUTPUT_DIR, "viewport-fit-report.txt"), `${reportLines.join("\n")}\n`);

  const finalReport = {
    capturedAt: new Date().toISOString(),
    outputDirectory: OUTPUT_DIR,
    matrixRecords: fitRecords.length,
    requiredTargetFailures: failedTargets,
    menuResult,
    pendingState,
    liveState,
    cachedState,
    fallbackState,
    resetResult,
    reducedMotion,
    consoleErrors,
    failedLocalRequests,
    unexpectedExternalRequests: [...unexpectedExternalRequests],
  };
  await writeFile(
    path.join(OUTPUT_DIR, "browser-validation-v8.json"),
    `${JSON.stringify(finalReport, null, 2)}\n`,
  );
  invariant(consoleErrors.length === 0, `Browser console errors: ${consoleErrors.join(" | ")}`);
  invariant(
    failedLocalRequests.length === 0,
    `Local requests failed: ${failedLocalRequests.join(" | ")}`,
  );
  invariant(unexpectedExternalRequests.size === 0, "Unexpected external network requests occurred");
  invariant(
    failedTargets.length === 0,
    `Required viewport targets did not fit: ${JSON.stringify(failedTargets)}`,
  );
  invariant(
    fitRecords.every((record) => !record.horizontalOverflow),
    "A matrix route overflowed horizontally",
  );
  invariant(
    fitRecords
      .filter((record) => record.shellMode === "single-main-scroll")
      .every((record) => record.bodyScrollRange === 0 && record.nestedOverflowYCount === 0),
    "Desktop shell had body or nested scrolling",
  );
  process.stdout.write(`${JSON.stringify(finalReport, null, 2)}\n`);
} finally {
  await cleanup();
}
