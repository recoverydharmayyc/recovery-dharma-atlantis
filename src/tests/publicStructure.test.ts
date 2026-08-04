import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteLayout from "../components/SiteLayout";
import { CONNECT_CONTENT } from "../content/connect";
import { HOME_CONTENT } from "../content/home";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
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
  const shellAt = page.indexOf('className="page-shell meetings-page"');
  const localAt = page.indexOf('className="local-schedule"');
  const globalAt = page.indexOf('className="global-directory"');
  assert.ok(shellAt >= 0 && localAt > shellAt && globalAt > localAt);
  assert.doesNotMatch(page, /key=\{globalStatus\}/);
  assert.doesNotMatch(page, /if\s*\(\s*globalStatus[^)]*\)\s*return/);
});

test("public copy contains no implementation tutorial or owner-placeholder language", () => {
  const publicCopy = JSON.stringify({ HOME_CONTENT, MEETINGS_PAGE_CONTENT, CONNECT_CONTENT });
  assert.doesNotMatch(publicCopy, /React|TypeScript|source folder|AI tool|owner should|adopter/i);
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

test("one token file owns CSS colour literals and inherited visual assets are absent", async () => {
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
  assert.doesNotMatch(joined, /forest_deep_two|faviconTarget|framer-motion/i);
  assert.doesNotMatch(joined, /https?:\/\/[^\s"')]+\.(?:woff2?|ttf|otf|png|jpe?g|webp|gif)/i);
});

test("meeting layout uses document flow without fixed-height or nested-scroll panels", async () => {
  const css = await source("src/styles/pages/meetings.css");
  assert.doesNotMatch(css, /position:\s*(?:absolute|fixed)/i);
  assert.doesNotMatch(css, /overflow-y:\s*(?:auto|scroll)/i);
  assert.doesNotMatch(css, /height:\s*\d+(?:px|rem|vh)/i);
});

test("focus and reduced-motion rules remain explicit", async () => {
  const base = await source("src/styles/base.css");
  assert.match(base, /:focus-visible/);
  assert.match(base, /prefers-reduced-motion:\s*reduce/);
});
