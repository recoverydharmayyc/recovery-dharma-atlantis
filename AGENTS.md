# Repository guidance

This repository contains the finished Recovery Dharma Atlantis fictional website and its
AI-assisted customization tutorial. It is a reference implementation, not a hosted service or a
product roadmap. Keep its interface conventional: use the existing npm scripts and do not add
platform-specific or custom workflow wrappers around development, verification, builds, or
deployment.

## Ownership boundaries

- `src/content/` owns public wording and community facts.
- `src/config/` owns technical settings and external-source configuration.
- `src/announcements/` and `src/meetings/` own timing, validation, fetching, caching, sanitization, and fallback rules.
- Components own presentation; pages compose components; `src/styles/` owns the visual system.
- `src/app/routes.tsx` is the route authority.
- `README.md`, `TUTORIAL.md`, and `CONTRIBUTING.md` own repository and teaching guidance. Tutorial
  language must not leak into the visitor-facing application.

Read `CONTENT_GUIDE.md` before changing public wording and `DESIGN_GUIDE.md` before changing presentation. Factual edits must not rewrite domain or design code. Visual edits must not weaken meeting, announcement, or external-directory behavior.

## Product invariants

- Treat Recovery Dharma Global records as untrusted. Preserve bounded parsing, safe URL checks, omitted credentials, timeout, versioned short-lived cache, attribution, and direct-directory fallback.
- Keep local meetings independent of the external request.
- Do not invent local facts, contacts, addresses, access claims, affiliations, or recovery outcomes.
- Preserve fictional mode, `noindex`, `public/robots.txt`, the fictional label, and the footer notice unless verified public conversion is explicitly authorized.
- Preserve route accessibility, responsive navigation, focus handling, reduced motion, the real not-found route, and the safe error boundary.
- Do not add a backend, analytics, payments, newsletter integration, remote fonts, or private configuration without an explicit product requirement.

## Open-source quality

- Prefer small, legible modules and descriptive names over clever abstractions.
- Keep the fictional example deterministic and safe to clone. Do not commit secrets, personal
  information, generated build output, or machine-specific configuration.
- Add focused regression coverage for behavior changes. Do not make repository documentation
  depend on an untracked external worksheet or a second source repository.
- This project has no feature roadmap. Maintenance changes should improve correctness,
  accessibility, security, compatibility, or teaching clarity.

## Verification

Run `npm run format:check` and `npm run verify` after changes. Run the browser product and Meetings checks when behavior or layout changes.
