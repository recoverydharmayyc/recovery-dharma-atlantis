# Recovery Dharma Atlantis

## How to Make Your Own Community Website

### No Coding Experience Required

Recovery Dharma Atlantis is an independent fictional educational project and a worked community example for the tutorial above. It is not the Recovery Dharma YYC website, contains no YYC meeting operations or private information, and is not an official Recovery Dharma Global product.

The project shows that a complete modern website can remain one owned project folder. A nontechnical person can preview it, give a clean copy to an AI tool, inspect the returned candidate, and publish only what they approve.

React, TypeScript, Vite, React Router, and Framer Motion are internal tools. Beginners use the included Windows batch files and do not need to learn commands first. No individualized technical support is promised.

## Safe starter state

The untouched project is fictional, uses sample local meetings, has no active contact method, and is blocked from indexing. Adopters must verify every public fact before they decide to convert it into a real site.

## Beginner path

Read `START_HERE.txt`.

- Double-click `START-WEBSITE.bat` to preview.
- Double-click `MAKE-AI-COPY.bat` to make a clean source ZIP for an AI tool.
- Make and inspect a separate candidate before approving it.
- Double-click `BUILD-WEBSITE.bat` only after approval to create `PUBLISH-THIS-FOLDER` for manual hosting.

The model-independent AI instructions and worksheets are `AI_READ_FIRST.txt`, `MY_WEBSITE_FACTS.txt`, and `CHANGE_REQUEST.txt`.

## Tutorial systems already present

A likely tutorial sequence is:

1. Obtain the starter project.
2. Preview it with `START-WEBSITE.bat`.
3. Change the community name and visual identity.
4. Replace fictional local meeting facts.
5. Add or edit a second recurring meeting.
6. Add a temporary meeting through the existing announcement system.
7. Change theme tokens without changing the layout.
8. Inspect every route.
9. Build or publish the approved version.
10. Recover by returning to an approved project copy.

The local meeting facts live in `src/content/meetings.ts`. Temporary meeting and ordinary announcement configuration live in `src/content/announcements.ts`. The visual identity lives in `src/theme.css`.

## Recovery Dharma Global preview

The Meetings page can show a small preview from Recovery Dharma Global’s public endpoint:

- `https://recoverydharma.org/wp-admin/admin-ajax.php?action=meetings`
- Full directory fallback: `https://recoverydharma.org/meetings/`

The browser keeps only sanitized public listing fields for about fifteen minutes. It does not cache personal data. If the live directory fails, a fresh cached preview remains visible; otherwise the page offers the full-directory link. An adopter may remove this preview if they do not want an external data dependency.

## Technical note

The normal production command is `npm run build`; Netlify publishes `dist`. The public starter has no backend, forms, analytics, newsletter, payment flow, environment-variable requirement, or Netlify Functions.
