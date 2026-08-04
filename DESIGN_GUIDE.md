# Atlantis design guide

## Concept

Atlantis is an **Aegean civic archive**: a modern community field guide shaped by gathering ledgers, navigation charts, sun-warmed plaster, limestone, terracotta, bronze, and Mediterranean blue. It should feel useful and human—not mythical, corporate, or app-like.

## Design ownership

- `src/styles/tokens.css` owns colour, type scale, spacing, widths, borders, and motion timing.
- `src/styles/components.css` owns the masthead, bulletin, actions, shared information surfaces, and footer.
- `src/styles/pages/` owns route composition.
- `public/atlantis-mark.svg`, `atlantis-rings.svg`, `atlantis-chart.svg`, and `aegean-frieze.svg` are original local motifs.

## Colour roles

- Page: warm limestone paper.
- Plaster: warm explanatory fields.
- Limestone: schedules and factual ledgers.
- Aegean/night sea: high-priority information and the Global directory chapter.
- Terracotta: primary actions, selections, and temporary notices.
- Sea glass: secondary actions and links.
- Bronze: rules, timing details, and restrained ornament.

Change identity through these semantic roles in `tokens.css`; do not scatter new colour literals through page files.

## Information surfaces

- **Limestone ledger:** schedules and structured facts.
- **Painted plaster field:** introductions and explanations.
- **Aegean information field:** important meeting or source information.
- **Terracotta notice:** temporary or selected information.
- **Civic index row:** steps, resources, and compact sequences.

These are editorial groupings, not a generic card system. Keep rules, rows, bands, and split compositions. Do not box every paragraph, add large radii, or add shadows everywhere.

## Spacing and viewport law

Use **more interior space, less empty section space**. Preserve comfortable row and surface padding while keeping page starts, section gaps, and the footer compact. Wide screens should place related information beside each other. Short pages should feel complete near one viewport, without fixed-height route areas, clipped content, or nested scrolling.

## Safe changes

Factual edits belong in `src/content/` and must not rewrite the design system. Visual edits must not weaken meeting timing, Recovery Dharma Global sanitization, cache, timeout, attribution, or fallback behavior in `src/meetings/`. Preserve keyboard behavior, focus visibility, reduced motion, fictional mode, and every route.
