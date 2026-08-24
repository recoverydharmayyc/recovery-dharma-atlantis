# Customize the example with ChatGPT and Codex

This tutorial is for people who may never have worked with React, TypeScript, Git, or a terminal.
You do not need to understand every source file before making a careful change. The repository is
organized so that facts, domain behavior, and visual presentation can be changed independently.

The safest rule is simple: start from a working copy, provide only verified facts, make one clear
change at a time, and inspect the result before publishing anything.

## 1. Run the untouched example

Install Node.js 22.22 or newer and Git, then clone the repository:

```bash
git clone https://github.com/recoverydharmayyc/recovery-dharma-atlantis.git
cd recovery-dharma-atlantis
npm ci
npm run dev
```

Open the local address printed by Vite. Visit Home, Meetings, About, New Here, Resources, Connect,
and a made-up address such as `/does-not-exist`. Also try the narrow mobile layout.

Before editing, confirm the automated baseline:

```bash
npm run format:check
npm run verify
```

If the untouched checkout does not pass, solve that setup problem before asking for a content or
design change.

## 2. Protect the working baseline

Create a Git branch for the change:

```bash
git switch -c customize/my-community
```

A branch gives you a named candidate without duplicating or overwriting the approved source. You
can always return to `main` if the direction is wrong.

Do not commit `.env` files, credentials, private contact details, member information, meeting
passwords, or unpublished locations. This example does not need any of them.

## 3. Write down factual authority

An AI assistant can organize supplied facts; it cannot verify private community knowledge. Prepare
a short fact sheet in your prompt or working notes:

```text
PUBLIC-USE CONFIRMATION
I confirm that the facts below are approved for public use: yes/no

WEBSITE NAME
...

CITY OR REGION
...

PURPOSE
...

RECURRING MEETINGS
- Stable ID:
- Title:
- Day:
- Local start and end time:
- IANA time zone, for example America/Edmonton:
- Format:
- Verified venue or online description:
- Verified public link, or none:
- Newcomer and registration notes:

TEMPORARY ANNOUNCEMENT
- Enabled:
- Exact start and expiry:
- Approved wording:

VERIFIED ADDRESS
...

VERIFIED CONTACT METHOD
...

ACCESSIBILITY INFORMATION
...

APPROVED EXTERNAL LINKS
...

FACTS STILL UNKNOWN
...
```

Write `unknown` when something is unknown. Never let an assistant fill gaps with a plausible name,
address, schedule, access claim, affiliation, testimonial, policy, or recovery outcome.

## 4. Start the coding session at the repository root

Use a coding workspace that can read, edit, and run commands in the cloned checkout. Codex reads
repository-level `AGENTS.md` guidance before it works; the file in this project records the safety,
ownership, and verification rules. See OpenAI's
[AGENTS.md documentation](https://developers.openai.com/codex/agent-configuration/agents-md) for how
that instruction discovery works.

Ask the assistant to inspect the repository before editing. A useful first request is:

```text
Read AGENTS.md, CONTENT_GUIDE.md, DESIGN_GUIDE.md, and the relevant source files.

Goal:
[Describe one visitor-facing outcome.]

Verified public facts:
[Paste only approved facts. Mark everything else unknown.]

Keep:
- fictional mode and indexing blocks unless I explicitly authorize a verified public conversion
- local meetings independent of the Recovery Dharma Global request
- external-directory sanitization, timeout, cache, attribution, and fallback
- route accessibility, responsive navigation, focus handling, and reduced motion

Definition of done:
[Describe what you will inspect in the browser.]

Implement the change, run the repository's required checks, and report every changed file and any
remaining uncertainty.
```

Good prompts state the outcome and evidence. They do not prescribe an unverified technical fix.
For example, ask to “show this approved temporary meeting until its final occurrence expires,” not
to “replace the announcement system with a timer.”

## 5. Use the source ownership map

Most customizations begin in one of these places:

| Change                             | Start here                          | Read first         |
| ---------------------------------- | ----------------------------------- | ------------------ |
| Public wording                     | `src/content/`                      | `CONTENT_GUIDE.md` |
| Recurring local meetings           | `src/content/meetings.ts`           | `CONTENT_GUIDE.md` |
| Temporary meeting or notice        | `src/content/announcements.ts`      | `CONTENT_GUIDE.md` |
| Site and external-source settings  | `src/config/`                       | `AGENTS.md`        |
| Colours, type, spacing, and shapes | `src/styles/tokens.css`             | `DESIGN_GUIDE.md`  |
| Shared presentation                | `src/components/` and `src/styles/` | `DESIGN_GUIDE.md`  |
| Page composition                   | `src/pages/`                        | Both guides        |
| Routes                             | `src/app/routes.tsx`                | `AGENTS.md`        |

A factual edit should not rewrite meeting calculations or the design system. A visual edit should
not rewrite factual content, announcement timing, or external-data safety.

## 6. Review the candidate, not just the explanation

Inspect exactly what changed:

```bash
git status --short
git diff --stat
git diff
```

Then run the standard gate:

```bash
npm run format:check
npm run verify
```

For behavior or layout changes, also run:

```bash
npm run test:browser:product
npm run test:browser:meetings
```

Finally, use the browser yourself. Check:

- Every navigation route and a missing-page address.
- Every local meeting, time zone, venue description, and link.
- The nearest-meeting marker around meeting boundaries.
- Temporary content before its start, while active, and after expiry.
- Recovery Dharma Global attribution, safe fallback, and local schedule independence.
- Mobile navigation, keyboard focus, Escape behavior, narrow widths, and 200 percent zoom.
- The fictional label, footer notice, `noindex`, and crawler block unless removal was explicitly
  part of a fully verified conversion.

Passing automation is evidence, but personal review remains the publication decision.

## 7. Converting the fictional example

Treat conversion to a real community site as its own explicit change. First verify every public
name, schedule, time zone, location, contact method, access statement, affiliation, and external
link. Remove unknown claims rather than guessing them.

Only after that review should you ask the assistant to replace the fictional content and update the
fictional-mode signals, metadata, tests, `index.html`, and `public/robots.txt` together. Review the
result as public information. The default checkout intentionally fails closed and should never
silently become indexable because one label was removed.

## 8. Keep or discard the result

If the candidate is correct, commit it with a short description:

```bash
git add -A
git commit -m "Customize community website"
```

If it is not correct, keep working on the same branch or abandon the branch after returning to an
approved checkout. Do not publish a build merely because an assistant says it is complete.

The finished cycle is: verified facts, bounded request, reviewable edit, automated checks, human
inspection, and an intentional commit.
