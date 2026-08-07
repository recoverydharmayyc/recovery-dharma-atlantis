# Recovery Dharma Atlantis

Recovery Dharma Atlantis is a complete fictional community website and a concrete, reusable community-site template. It is independent of Recovery Dharma YYC, contains no YYC operations or private information, and is not an official Recovery Dharma Global product.

The application provides Home, Meetings, About, New Here, Resources, Connect, and not-found routes. It includes two structured fictional recurring meetings, temporary-announcement support, and a bounded preview of Recovery Dharma Global's public meeting directory.

## Stack and requirements

- React, TypeScript, Vite, and React Router
- Node.js 22.22 or newer
- npm

Install and start local development:

```text
npm ci
npm run dev
```

## Verification and build

```text
npm run format:check
npm run verify
```

`npm run verify` runs linting, public-content and safety checks, automated tests, TypeScript checking, and a production build. Product and Meetings browser checks are available as `npm run test:browser:product` and `npm run test:browser:meetings` when Chrome or Chromium is installed.

Use `npm run test` for the automated test suite, `npm run build` for a production build, and `npm run preview` to inspect that build locally. Vite writes production output to `dist/`.

The built single-page application can be hosted by a conventional static host with route fallback support. `netlify.toml` builds and publishes `dist/`; `public/_redirects` supplies the Netlify SPA fallback.

## Project ownership

- `src/content/` owns public wording and community facts.
- `src/config/` owns site and external-source configuration.
- `src/announcements/` and `src/meetings/` own timing, validation, sanitization, cache, timeout, and fallback behavior.
- `src/components/`, `src/pages/`, and `src/styles/` own presentation and route composition.

See `CONTENT_GUIDE.md` for public-language and factual boundaries, `DESIGN_GUIDE.md` for the Ocean Civic Light system, and `AGENTS.md` for repository-wide engineering constraints.

## Safety and independence

The default site is fictional, has no real local address or contact method, and is blocked from search indexing through `index.html` and `public/robots.txt`. It has no backend, contact form, analytics, newsletter, payment system, Netlify Function, remote font, or environment-variable requirement.

Remote directory records are normalized, bounded, sanitized, and cached briefly in the browser; unsafe links are rejected, requests time out, and failure falls back to the full directory. Local Atlantis meetings remain available independently. Any conversion to a real community site requires verified public facts and deliberate review.
