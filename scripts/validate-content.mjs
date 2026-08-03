import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const checks = [
  ["index.html", 'name="robots" content="noindex, nofollow"'],
  ["index.html", 'data-demo-state="fictional"'],
  ["public/robots.txt", "Disallow: /"],
  ["src/content/site.ts", 'demoState: "fictional"'],
  ["src/content/site.ts", 'fictionalLabel: "Fictional example"'],
  ["src/content/site.ts", "fictional tutorial community"],
  ["src/content/meetings.ts", "wednesday-evening"],
  ["src/content/meetings.ts", "sunday-morning"],
  ["src/content/meetings.ts", "Atlantis Community Room"],
  ["src/content/announcements.ts", "enabled: false"],
  [
    "src/meetings/meetingData.ts",
    "https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings",
  ],
  ["src/meetings/meetingData.ts", "https://recoverydharma.org/meetings/"],
  ["src/meetings/globalDirectory.ts", "recovery-dharma-atlantis-global-meetings-v1"],
  ["src/theme.css", "Atlantis visual identity"],
  ["src/App.tsx", 'path="/newcomers"'],
];

for (const [file, expected] of checks) {
  const text = await readFile(resolve(project, file), "utf8");
  if (!text.includes(expected)) throw new Error(file + " is missing required content: " + expected);
}

const publicContent = await Promise.all(
  [
    "src/content/home.ts",
    "src/content/about.ts",
    "src/content/newcomers.ts",
    "src/content/resources.ts",
    "src/content/connect.ts",
  ].map((file) => readFile(resolve(project, file), "utf8")),
);
const visibleText = publicContent.join("\n");
for (const removedPhrase of [
  "Leave room for verified sources",
  "Public information to verify first",
  "Approved practice resources go here",
  "Add one verified public contact method",
]) {
  if (visibleText.includes(removedPhrase))
    throw new Error("Obsolete template copy remains: " + removedPhrase);
}
if (/\bcalgary\b|\byyc\b/i.test(visibleText))
  throw new Error("YYC or Calgary identity leaked into Atlantis public content.");

process.stdout.write(
  "Content, demo-safety, and public-copy checks passed (" + checks.length + " checks).\n",
);
