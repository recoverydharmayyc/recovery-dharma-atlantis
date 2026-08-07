import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const checks = [
  ["index.html", 'name="robots" content="noindex, nofollow"'],
  ["index.html", 'data-demo-state="fictional"'],
  ["public/robots.txt", "Disallow: /"],
  ["src/config/site.ts", 'demoState: "fictional"'],
  ["src/content/site.ts", 'fictionalLabel: "Fictional example"'],
  ["src/content/site.ts", "fictional tutorial community"],
  ["src/content/meetings.ts", "wednesday-evening"],
  ["src/content/meetings.ts", "sunday-morning"],
  ["src/content/meetings.ts", "Atlantis Community Room"],
  ["src/content/announcements.ts", "enabled: false"],
  [
    "src/config/externalSources.ts",
    "https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings",
  ],
  ["src/config/externalSources.ts", "https://recoverydharma.org/meetings/"],
  ["src/config/externalSources.ts", "recovery-dharma-atlantis-global-meetings-v2"],
  ["src/styles/tokens.css", "--canvas: #f4fafb"],
  ["src/styles/tokens.css", "--ocean: #147f8a"],
  ["src/styles/tokens.css", "--coral: #f2644b"],
  ["src/styles/tokens.css", "--surface-padding"],
  ["public/atlantis-mark.svg", "<circle"],
  ["public/atlantis-ripple.svg", "<circle"],
  ["public/favicon.svg", "#f2644b"],
  ["src/config/site.ts", 'newcomers: "/newcomers"'],
  ["src/app/routes.tsx", 'path="*"'],
  ["CONTENT_GUIDE.md", "Public facts and wording live in `src/content/`"],
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
    "src/content/meetings.ts",
    "src/content/site.ts",
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
if (/React|TypeScript|AI tool|source folder|tutorial project|adopter/i.test(visibleText))
  throw new Error("Implementation or owner workflow language leaked into public content.");

for (const retiredPhrase of [
  "sit together",
  "come sit with us",
  "no gurus",
  "shared practice",
  "one ordinary step at a time",
  "two ways into the week",
  "find a time to sit together",
  "people exploring recovery",
  "hold space",
  "healing journey",
  "sacred",
  "transformational",
  "path together",
  "community of belonging",
  "supportive space",
  "wherever you are on your journey",
  "connect, grow, heal",
]) {
  if (visibleText.toLowerCase().includes(retiredPhrase.toLowerCase()))
    throw new Error("Retired public phrase remains: " + retiredPhrase);
}

if (
  /guarantee(?:d|s)? (?:recovery|outcomes?)|cure(?:s|d)? addiction|medical treatment/i.test(
    visibleText,
  )
)
  throw new Error("Medical or guaranteed-outcome language leaked into public content.");

process.stdout.write(
  "Content, demo-safety, and public-copy checks passed (" + checks.length + " checks).\n",
);
