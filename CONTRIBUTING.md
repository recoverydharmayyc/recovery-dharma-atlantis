# Contributing

Recovery Dharma Atlantis is a finished fictional reference implementation and teaching repository.
Contributions should improve correctness, accessibility, security, dependency compatibility, or
the clarity of the tutorial. This repository is not a roadmap for a hosted Atlantis service.

## Before opening a change

- Keep all visitor-facing Atlantis facts fictional. Do not submit real meeting locations, private
  contacts, credentials, member information, or unpublished community details.
- Read `AGENTS.md` for repository constraints.
- Read `CONTENT_GUIDE.md` before changing public wording.
- Read `DESIGN_GUIDE.md` before changing presentation.
- Keep the existing ownership boundaries. A documentation change should not require a runtime
  rewrite, and a factual correction should not alter meeting or design-domain behavior.
- Open an issue before adding a production dependency, backend, external service, or major
  architectural change.

## Local setup

```bash
npm ci
npm run dev
```

Use a focused branch and keep commits understandable. Do not add generated `dist/` output,
browser-test artifacts, editor settings, or local configuration.

## Required checks

```bash
npm run format:check
npm run verify
```

Run both browser checks for behavior or layout changes:

```bash
npm run test:browser:product
npm run test:browser:meetings
```

These acceptance checks depend on local Chrome rendering and host timing, so hosted CI keeps to
the deterministic `npm run verify` contract. Include the local browser results in the pull request.

Pull requests should explain the user-visible outcome, list the checks that ran, and identify any
facts or behavior that could not be verified. Include screenshots only when they materially help
review a visual change.

By contributing, you agree that your contribution is licensed under the repository's MIT License.
