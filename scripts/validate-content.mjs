import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const checks = [
  ["index.html", "name=\"robots\" content=\"noindex, nofollow\""],
  ["index.html", "data-demo-state=\"fictional\""],
  ["public/robots.txt", "Disallow: /"],
  ["src/content/site.ts", "demoState: \"fictional\""],
  ["src/content/site.ts", "siteTitle: \"Recovery Dharma Atlantis\""],
  ["src/content/site.ts", "day: \"Wednesday\""],
  ["src/content/site.ts", "venue: \"Atlantis Community Room\""],
  ["src/App.tsx", "path=\"/newcomers\""],
];

for (const [file, expected] of checks) {
  const text = await readFile(resolve(project, file), "utf8");
  if (!text.includes(expected)) {
    throw new Error(`${file} is missing required content: ${expected}`);
  }
}

process.stdout.write(`Content and demo-safety checks passed (${checks.length} checks).\n`);
