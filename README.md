# Recovery Dharma Atlantis

## How to Make Your Own Community Website

### No Coding Experience Required

Recovery Dharma Atlantis is an independent fictional educational project and the worked community example for this tutorial. It is not the Recovery Dharma YYC website, contains no YYC meeting operations or private information, and is not an official Recovery Dharma Global product.

The project demonstrates a simple ownership idea: a complete modern website can remain one project folder. A nontechnical owner can preview it, give a clean copy to a general-purpose AI tool, inspect the returned candidate, and publish only what they approve.

React, TypeScript, Vite, and React Router are implementation tools inside the folder. Beginners use the included Windows batch files and do not need to learn commands first. No individualized technical support is promised.

## Safe starter state

The untouched project is fictional, uses sample local meetings, has no active contact method, and is blocked from indexing. Adopters are responsible for verifying every public fact before deliberately converting it into a real site.

## Beginner path

Read `START_HERE.txt`.

- Double-click `START-WEBSITE.bat` to preview.
- Double-click `MAKE-AI-COPY.bat` to make a clean source ZIP for an AI tool.
- Make and inspect a separate candidate before approving it.
- Double-click `BUILD-WEBSITE.bat` only after approval to create `PUBLISH-THIS-FOLDER` for manual hosting.

The model-independent AI instructions and worksheets are `AI_READ_FIRST.txt`, `MY_WEBSITE_FACTS.txt`, and `CHANGE_REQUEST.txt`.

## Systems already present

A likely tutorial sequence is:

1. Obtain the starter project.
2. Preview it with `START-WEBSITE.bat`.
3. Change the community name and identity.
4. Replace fictional local meeting facts.
5. Add or edit a second recurring meeting.
6. Add a temporary meeting through the existing announcement system.
7. Change design tokens without changing the layout or meeting rules.
8. Inspect every route.
9. Build or publish the approved version.
10. Recover by returning to an approved project copy.

Public wording lives in `src/content/`. Recurring local meeting facts live in `src/content/meetings.ts`; temporary meetings and scheduled notices live in `src/content/announcements.ts`. Centralized colour, system sans-serif typography, spacing, and shape decisions live in `src/styles/tokens.css`. Shared presentation components live in `src/components/`, and route compositions live in `src/styles/pages/`. `DESIGN_GUIDE.md` explains the light Ocean Civic system, its single ripple identity family, and the viewport-first rule that permits only one desktop main scroll surface. Meeting timing, validation, external retrieval, sanitization, and caching live in `src/meetings/` and should not be rewritten for an ordinary factual or visual change.

## Recovery Dharma Global preview

The Meetings page can show a bounded preview from Recovery Dharma Global’s public endpoint:

- `https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings`
- Full directory fallback: `https://recoverydharma.org/meetings/`

The request has a timeout and omits credentials. Remote records are treated as untrusted: fields are normalized, unsafe URLs are rejected, arbitrary HTML is never rendered, and record counts are bounded. The browser keeps only sanitized public meeting fields in a versioned cache for about fifteen minutes; it does not cache personal data. If live retrieval fails, a fresh cached preview remains visible. Without a usable cache, the page provides the full-directory link. Local Atlantis meetings never depend on this request.

An adopter may remove the Global preview if they do not want an external data dependency, but should remove the whole attributed feature rather than weaken its sanitization or fallback behavior.

## Technical note

The normal production command is `npm run build`; Netlify publishes `dist`. `npm run verify` runs the meaningful project checks and production build. The public starter has no backend, form, analytics, newsletter, payment flow, environment-variable requirement, remote font, stock image, or Netlify Function.
