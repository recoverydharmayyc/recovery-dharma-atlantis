import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import { DEFAULT_GLOBAL_PREVIEW_COUNT } from "../components/GlobalDirectorySection";
import SiteLayout from "../components/SiteLayout";
import { CONNECT_CONTENT } from "../content/connect";
import { ABOUT_CONTENT } from "../content/about";
import { HOME_CONTENT } from "../content/home";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
import { NEWCOMERS_CONTENT } from "../content/newcomers";
import { RESOURCES_CONTENT } from "../content/resources";
import Meetings from "../pages/Meetings";

const project = new URL("../../", import.meta.url);

async function source(path: string) {
  return readFile(new URL(path, project), "utf8");
}

test("disabled announcements create no banner region while active announcements render", () => {
  const shell = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(SiteLayout, null, createElement("p", null, "Page content")),
    ),
  );
  assert.doesNotMatch(shell, /announcement-bulletin/);

  const active = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      null,
      createElement(AnnouncementBar, {
        announcement: {
          label: "Next Saturday",
          title: "Temporary gathering",
          details: "A one-time community notice.",
          href: "/meetings#local-schedule",
          tone: "early",
          ariaLabel: "Temporary gathering",
        },
      }),
    ),
  );
  assert.match(active, /announcement-bulletin/);
  assert.match(active, /\/meetings#local-schedule/);
});

test("local meeting content renders in the initial shell before Global retrieval resolves", () => {
  const markup = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Meetings)));
  assert.match(markup, /Wednesday Evening/);
  assert.match(markup, /Sunday Morning/);
  assert.match(markup, /Loading a small preview/);
  assert.match(markup, /Recovery Dharma Global/);
});

test("Global resolution is section-scoped and does not own the Meetings page shell", async () => {
  const page = await source("src/pages/Meetings.tsx");
  const globalSection = await source("src/components/GlobalDirectorySection.tsx");
  const shellAt = page.indexOf('className="page-shell meetings-page"');
  const localAt = page.indexOf('className="local-schedule"');
  const globalAt = page.indexOf("<GlobalDirectorySection");
  assert.ok(shellAt >= 0 && localAt > shellAt && globalAt > localAt);
  assert.doesNotMatch(page, /localStorage|readFreshGlobalMeetingCache|JSON\.parse/);
  assert.doesNotMatch(globalSection, /key=\{(?:global)?status\}/i);
  assert.doesNotMatch(globalSection, /if\s*\(\s*(?:global)?status[^)]*\)\s*return/i);
});

test("Global cache and network work begin only after the local route can paint", async () => {
  const globalSection = await source("src/components/GlobalDirectorySection.tsx");
  const effectAt = globalSection.indexOf("useEffect(() =>");
  const frameAt = globalSection.indexOf("scheduleAfterLocalPaint", effectAt);
  const cacheAt = globalSection.indexOf("readFreshGlobalMeetingCache", frameAt);
  const loadAt = globalSection.indexOf("loadGlobalMeetingDirectory", cacheAt);
  assert.ok(effectAt >= 0 && frameAt > effectAt && cacheAt > frameAt && loadAt > cacheAt);
  assert.equal((globalSection.match(/window\.requestAnimationFrame/g) ?? []).length, 2);
  assert.doesNotMatch(globalSection, /setTimeout|startTransition|startViewTransition/);
});

test("router opts out of deferred route activation without adding route motion", async () => {
  const app = await source("src/app/App.tsx");
  const header = await source("src/components/SiteHeader.tsx");
  assert.match(app, /<BrowserRouter useTransitions=\{false\}>/);
  assert.doesNotMatch(`${app}\n${header}`, /startTransition|startViewTransition|viewTransition/);
});

test("route changes reset the single main scroll surface before paint", async () => {
  const layout = await source("src/components/SiteLayout.tsx");
  assert.match(layout, /useLayoutEffect/);
  assert.match(layout, /main\.scrollTop = 0/);
  assert.match(layout, /main\?\.focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(layout, /setTimeout|startTransition|startViewTransition/);
});

test("public copy contains no implementation tutorial or owner-placeholder language", () => {
  const publicCopy = JSON.stringify({
    HOME_CONTENT,
    MEETINGS_PAGE_CONTENT,
    ABOUT_CONTENT,
    NEWCOMERS_CONTENT,
    RESOURCES_CONTENT,
    CONNECT_CONTENT,
  });
  assert.doesNotMatch(
    publicCopy,
    /React|TypeScript|source folder|AI tool|owner should|adopter|tutorial project/i,
  );
  assert.doesNotMatch(
    publicCopy,
    /Leave room for verified sources|Public information to verify first|Add only after approval/i,
  );
});

test("Connect has no form or active endpoint and Global attribution remains visible", async () => {
  const connectPage = await source("src/pages/Connect.tsx");
  const meetingContent = await source("src/content/meetings.ts");
  assert.doesNotMatch(connectPage, /<form|action=|mailto:|tel:/i);
  assert.match(CONNECT_CONTENT.emptyState.body, /does not accept messages/i);
  assert.match(meetingContent, /Recovery Dharma Global’s public meeting directory/);
});

test("one token file owns the light Ocean Civic CSS colours", async () => {
  const styleRoot = new URL("src/styles/", project);
  const topLevel = await readdir(styleRoot, { withFileTypes: true });
  const pageFiles = await readdir(new URL("pages/", styleRoot));
  const cssFiles = [
    ...topLevel.filter((entry) => entry.isFile()).map((entry) => entry.name),
    ...pageFiles.map((name) => `pages/${name}`),
  ];
  for (const file of cssFiles) {
    const css = await readFile(new URL(file, styleRoot), "utf8");
    if (file !== "tokens.css") assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|\brgb\(/i, file);
  }
  const html = await source("index.html");
  assert.match(html, /href="\/src\/styles\/index\.css"/);
  assert.doesNotMatch(html, /<style>|#[0-9a-f]{3,8}\b/i);
  const allEditable = await Promise.all([
    html,
    source("src/main.tsx"),
    ...cssFiles.map((file) => readFile(new URL(file, styleRoot), "utf8")),
  ]);
  const joined = allEditable.join("\n");
  assert.doesNotMatch(joined, /forest_deep_two|faviconTarget|framer-motion|theme-dark/i);
  assert.doesNotMatch(
    joined,
    /aegean|frieze|bronze|ochre|limestone|terracotta|atlantis-(?:chart|rings)/i,
  );
  assert.doesNotMatch(joined, /ui-serif|Georgia|Cambria|Times New Roman/i);
  assert.doesNotMatch(joined, /https?:\/\/[^\s"')]+\.(?:woff2?|ttf|otf|png|jpe?g|webp|gif)/i);
  const tokens = await source("src/styles/tokens.css");
  for (const role of [
    "--canvas",
    "--canvas-raised",
    "--canvas-subtle",
    "--ink",
    "--ink-muted",
    "--ocean",
    "--ocean-strong",
    "--ocean-soft",
    "--coral",
    "--coral-strong",
    "--footer-canvas",
    "--radius-surface",
    "--radius-control",
    "--surface-padding",
    "--row-padding-block",
    "--section-gap",
    "--font-sans",
  ]) {
    assert.match(tokens, new RegExp(role));
  }
});

test("the original Ocean Civic mark and one ripple motif are local and lightweight", async () => {
  const motifNames = ["atlantis-mark.svg", "atlantis-ripple.svg"];
  const motifs = await Promise.all(
    motifNames.map((name) => source(`public/${name}`).then((text) => ({ name, text }))),
  );
  for (const motif of motifs) {
    assert.match(motif.text, /^<svg/);
    assert.doesNotMatch(motif.text, /<text|<image|filter=|(?:href|src)="https?:\/\//i);
    assert.ok(Buffer.byteLength(motif.text) < 5_000, `${motif.name} should remain lightweight`);
  }
  const styles = await Promise.all([
    source("src/styles/components.css"),
    source("src/styles/layout.css"),
    source("src/styles/pages/home.css"),
    source("src/styles/pages/meetings.css"),
    source("src/styles/pages/editorial.css"),
  ]);
  const joined = styles.join("\n");
  for (const name of motifNames) assert.match(joined, new RegExp(name.replace(".", "\\.")));
  for (const removed of ["aegean-frieze.svg", "atlantis-chart.svg", "atlantis-rings.svg"])
    assert.doesNotMatch(joined, new RegExp(removed.replace(".", "\\.")));
});

test("the desktop shell has one scroll owner and mobile retains document flow", async () => {
  const styleRoot = new URL("src/styles/", project);
  const topLevel = await readdir(styleRoot, { withFileTypes: true });
  const pageFiles = await readdir(new URL("pages/", styleRoot));
  const cssFiles = [
    ...topLevel.filter((entry) => entry.isFile()).map((entry) => entry.name),
    ...pageFiles.map((name) => `pages/${name}`),
  ];
  const allCss = (
    await Promise.all(cssFiles.map((file) => readFile(new URL(file, styleRoot), "utf8")))
  ).join("\n");
  const layout = await source("src/styles/layout.css");
  assert.equal((allCss.match(/overflow-y:\s*(?:auto|scroll)/gi) ?? []).length, 1);
  assert.match(layout, /\.site-main\s*\{[^}]*overflow-y:\s*auto/is);
  assert.match(layout, /body\s*\{[^}]*overflow:\s*hidden/is);
  assert.match(layout, /grid-template-rows:\s*auto auto minmax\(0, 1fr\) auto/);
  assert.match(layout, /scrollbar-gutter:\s*stable/);
  assert.doesNotMatch(allCss, /\.global-meeting-list\s*\{[^}]*overflow/is);
  assert.doesNotMatch(allCss, /\.meeting-detail\s*\{[^}]*overflow-y/is);
});

test("Global preview defaults to three records and expands accessibly", async () => {
  const globalSection = await source("src/components/GlobalDirectorySection.tsx");
  assert.equal(DEFAULT_GLOBAL_PREVIEW_COUNT, 3);
  assert.match(globalSection, /meetings\.slice\(0, DEFAULT_GLOBAL_PREVIEW_COUNT\)/);
  assert.match(globalSection, /aria-expanded=\{expanded\}/);
  assert.match(globalSection, /aria-controls="global-meeting-preview"/);
  assert.match(globalSection, /Show more worldwide meetings/);
});

test("the compact footer does not duplicate primary navigation", async () => {
  const footer = await source("src/components/SiteFooter.tsx");
  assert.match(footer, /footer-utility/);
  assert.doesNotMatch(footer, /NAVIGATION_ROUTES|<nav|BrandMark/);
  assert.match(footer, /Recovery Dharma Global/);
});

test("beginner batch files retain safe preview, archive, and build boundaries", async () => {
  const start = await source("START-WEBSITE.bat");
  const archive = await source("MAKE-AI-COPY.bat");
  const build = await source("BUILD-WEBSITE.bat");

  assert.match(start, /set "PROJECT_DIR=%~dp0"/);
  assert.match(start, /call npm ci/);
  assert.match(start, /call npm run dev -- --host 127\.0\.0\.1 --open/);

  for (const excluded of [
    "node_modules",
    "dist",
    "PUBLISH-THIS-FOLDER",
    "AI-COPY",
    ".git",
    ".env*",
    "screenshots",
    "review-artifacts",
  ])
    assert.match(archive, new RegExp(excluded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(archive, /DESIGN_GUIDE\.md[^\r\n]*(?:skip|exclude)/i);
  assert.match(archive, /recovery-dharma-atlantis-source\.zip/);

  assert.match(build, /call npm run verify/);
  assert.match(build, /PUBLISH-THIS-FOLDER/);
  assert.match(build, /xcopy "%PROJECT_DIR%dist\\\*"/);
});

test("meeting layout uses document flow without fixed-height or nested-scroll panels", async () => {
  const css = await source("src/styles/pages/meetings.css");
  const appSources = await Promise.all([
    source("src/app/App.tsx"),
    source("src/app/routes.tsx"),
    source("src/components/SiteLayout.tsx"),
    source("src/pages/Meetings.tsx"),
  ]);
  assert.doesNotMatch(css, /position:\s*fixed/i);
  assert.doesNotMatch(css, /overflow-y:\s*(?:auto|scroll)/i);
  assert.doesNotMatch(css, /height:\s*\d+(?:px|rem|vh)/i);
  assert.doesNotMatch(css, /opacity:\s*0\s*;|visibility:\s*hidden/i);
  assert.doesNotMatch(css, /\.meeting-detail__(?:copy|facts)[^{]*\{[^}]*position:\s*absolute/is);
  assert.doesNotMatch(
    appSources.join("\n"),
    /startViewTransition|viewTransition|startTransition|Suspense|lazy\(/,
  );
});

test("focus and reduced-motion rules remain explicit", async () => {
  const base = await source("src/styles/base.css");
  assert.match(base, /:focus-visible/);
  assert.match(base, /prefers-reduced-motion:\s*reduce/);
});
