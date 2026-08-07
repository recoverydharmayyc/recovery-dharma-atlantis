# Recovery Dharma Atlantis

Recovery Dharma Atlantis is an independent, fictional community-website starter. It is the worked example for **How to Make Your Own Community Website — No Coding Experience Required**.

It is not the Recovery Dharma YYC website, contains no YYC meeting operations or private information, and is not an official Recovery Dharma Global product. No individualized technical support is promised.

## What is included

The public application has Home, Meetings, About, New Here, Resources, Connect, and not-found routes. It uses React, TypeScript, Vite, and React Router internally, but the entire editable project remains one owned folder.

Public wording and facts live in `src/content/`. The starter includes two structured fictional recurring meetings and a disabled temporary-meeting announcement configuration. Meeting timing and validation live in `src/meetings/`; presentation changes should not rewrite those rules.

The Meetings route provides a bounded preview of Recovery Dharma Global’s public meeting directory. Remote records are treated as untrusted: fields are normalized, unsafe links are rejected, results are bounded, requests time out, and only sanitized public fields enter a versioned fifteen-minute browser cache. If the live source fails, a fresh cache may remain visible; otherwise the page links directly to the full directory. Local Atlantis meetings do not depend on that request.

An adopter may remove the entire Global preview if they do not want an external data dependency. Do not retain the display while weakening its attribution, sanitization, cache, timeout, or fallback behavior.

## Beginner workflow

Start with `START_HERE.txt`.

- `START-WEBSITE.bat` opens a local preview on Windows.
- `MAKE-AI-COPY.bat` creates a clean project ZIP for a general-purpose AI tool.
- `BUILD-WEBSITE.bat` verifies the project and creates `PUBLISH-THIS-FOLDER` for manual hosting.

The model-independent instructions and factual worksheet are `AI_READ_FIRST.txt`, `MY_WEBSITE_FACTS.txt`, and `CHANGE_REQUEST.txt`. `DESIGN_GUIDE.md` explains presentation ownership; `CONTENT_GUIDE.md` explains the public voice and factual boundaries.

Keep an untouched approved copy, inspect every route in a separate candidate, and publish only the version you personally approve.

## Technical workflow

For local development:

```text
npm ci
npm run dev
```

For a complete project check and production build:

```text
npm run verify
```

`npm run build` writes the static application to `dist`. Netlify uses the build command in `netlify.toml`, publishes `dist`, and applies the SPA fallback from `public/_redirects`.

## Safety and independence

The untouched starter is fictional, contains no real local address or contact method, and is blocked from search indexing through `index.html` and `public/robots.txt`. It has no backend, contact form, analytics, newsletter, payment system, Netlify Function, remote font, or environment-variable requirement.

Adopters are responsible for verifying every public fact before knowingly converting the starter into a real community site. Recovery Dharma Atlantis does not imply endorsement by Recovery Dharma Global.
