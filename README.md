# Recovery Dharma Atlantis

Recovery Dharma Atlantis is a finished, fictional community website and a worked tutorial for
customizing a small React application with an AI coding assistant. Clone it, run it locally, and
use its repository guidance as the starting context for your own site.

**This is not a live meeting website.** Atlantis is fictional, its local listings are examples,
and there is no hosted demo. The project is independent of Recovery Dharma YYC and is not an
official Recovery Dharma Global product.

## What this example demonstrates

- A conventional React, TypeScript, Vite, and React Router application.
- Clear ownership between public content, technical configuration, domain rules, components,
  pages, and styles.
- Accessible navigation, focus handling, reduced-motion support, a real not-found route, and a
  safe application error boundary.
- Structured recurring meetings and automatically expiring announcements.
- Defensive use of an untrusted public directory: bounded parsing, URL checks, sanitization,
  timeout, short-lived browser cache, attribution, and a direct fallback link.
- A repository-level `AGENTS.md` that gives an AI coding assistant durable project constraints.
- Automated content, unit, type, build, and browser checks.

The public application remains a believable fictional website. Tutorial instructions stay in the
repository documentation instead of leaking into visitor-facing pages.

## Quick start

You need Git, npm, and Node.js 22.22 or newer.

```bash
git clone https://github.com/recoverydharmayyc/recovery-dharma-atlantis.git
cd recovery-dharma-atlantis
npm ci
npm run dev
```

Vite prints the local address to open in your browser. No environment variables, account
credentials, backend, or remote font are required.

Read [TUTORIAL.md](TUTORIAL.md) before replacing the fictional example. It provides a complete,
beginner-friendly workflow for preparing verified facts, asking an AI coding assistant for a
change, reviewing the result, and deciding whether to keep it.

## Repository map

| Path                 | Responsibility                                                             |
| -------------------- | -------------------------------------------------------------------------- |
| `src/content/`       | Visitor-facing wording and fictional community facts                       |
| `src/config/`        | Site settings and external-source limits                                   |
| `src/announcements/` | Announcement timing and activation rules                                   |
| `src/meetings/`      | Meeting validation, time calculations, fetching, caching, and sanitization |
| `src/components/`    | Reusable presentation components                                           |
| `src/pages/`         | Route-level page composition                                               |
| `src/styles/`        | Design tokens, shared styles, layout, and page styles                      |
| `src/app/routes.tsx` | Authoritative route table                                                  |
| `src/tests/`         | Fast automated behavior and repository checks                              |
| `scripts/`           | Content validation and browser product checks                              |
| `public/`            | Static artwork, crawler rules, and static-host route fallback              |

Before changing public wording, read [CONTENT_GUIDE.md](CONTENT_GUIDE.md). Before changing
presentation, read [DESIGN_GUIDE.md](DESIGN_GUIDE.md). [AGENTS.md](AGENTS.md) records the
repository-wide constraints for humans and coding agents.

## Commands

| Command                         | Purpose                                                                  |
| ------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                   | Start the local development server                                       |
| `npm run format`                | Format supported files with Prettier                                     |
| `npm run format:check`          | Check formatting without changing files                                  |
| `npm run lint`                  | Run ESLint                                                               |
| `npm run test:content`          | Check fictional mode, public copy, and required safety content           |
| `npm test`                      | Run the Node-based automated test suite                                  |
| `npm run typecheck`             | Check TypeScript without emitting files                                  |
| `npm run build`                 | Create a production build in `dist/`                                     |
| `npm run verify`                | Run lint, content checks, tests, type checking, and the production build |
| `npm run test:browser:product`  | Review routes, viewports, navigation, focus, and fallback states         |
| `npm run test:browser:meetings` | Check Meetings rendering and local-first latency                         |
| `npm run preview`               | Serve the production build locally                                       |

For a normal change, run:

```bash
npm run format:check
npm run verify
```

Run both browser checks when behavior or layout changes. Chrome or Chromium must be installed for
those checks. GitHub Actions runs the same complete gate for pushes and pull requests.

## External data and fictional safety

Local Atlantis meetings render without waiting for the external request. Recovery Dharma Global
records are treated as untrusted public input and are never rendered as HTML. Unsafe, incomplete,
closed, specialty-access, or access-gated records are excluded from the small preview. A failed
request never removes the local schedule or the full-directory fallback.

The example remains blocked from search indexing through `index.html` and `public/robots.txt`.
It has no real address, contact method, form, analytics, payments, newsletter, or private
configuration. Do not remove those safeguards until every replacement fact has been verified and
the conversion is an explicit, reviewed change.

## Building and hosting your copy

`npm run build` writes a static single-page application to `dist/`. It can be hosted by a static
host that supports route fallback to `index.html`. `netlify.toml` and `public/_redirects` show one
conventional Netlify configuration; they do not connect this repository to a hosted site.

Publishing is deliberately a human decision. Preview the exact build, verify every public fact,
and confirm the fictional safeguards have only been changed when that was intentional.

## Project status

This repository is a complete reference implementation, not a live service or a product roadmap.
Maintenance is limited to correctness, accessibility, security, dependency compatibility, and
clearer teaching material. See [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change.

## License

The repository source and documentation are available under the [MIT License](LICENSE). External
websites, directory records, names, and marks remain the property of their respective owners.
The `"private": true` package setting only prevents accidental publication to the npm registry; it
does not restrict the repository's MIT-licensed use.
