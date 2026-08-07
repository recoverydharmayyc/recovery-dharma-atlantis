# Repository guidance

This repository contains the Recovery Dharma Atlantis website product. Keep its interface conventional: use the existing npm scripts and do not add platform-specific or custom workflow wrappers around development, verification, builds, or deployment.

## Ownership boundaries

- `src/content/` owns public wording and community facts.
- `src/config/` owns technical settings and external-source configuration.
- `src/announcements/` and `src/meetings/` own timing, validation, fetching, caching, sanitization, and fallback rules.
- Components own presentation; pages compose components; `src/styles/` owns the visual system.
- `src/app/routes.tsx` is the route authority.

Read `CONTENT_GUIDE.md` before changing public wording and `DESIGN_GUIDE.md` before changing presentation. Factual edits must not rewrite domain or design code. Visual edits must not weaken meeting, announcement, or external-directory behavior.

## Product invariants

- Treat Recovery Dharma Global records as untrusted. Preserve bounded parsing, safe URL checks, omitted credentials, timeout, versioned short-lived cache, attribution, and direct-directory fallback.
- Keep local meetings independent of the external request.
- Do not invent local facts, contacts, addresses, access claims, affiliations, or recovery outcomes.
- Preserve fictional mode, `noindex`, `public/robots.txt`, the fictional label, and the footer notice unless verified public conversion is explicitly authorized.
- Preserve route accessibility, responsive navigation, focus handling, reduced motion, the real not-found route, and the safe error boundary.
- Do not add a backend, analytics, payments, newsletter integration, remote fonts, or private configuration without an explicit product requirement.

## Verification

Run `npm run format:check` and `npm run verify` after changes. Run the browser product and Meetings checks when behavior or layout changes.
