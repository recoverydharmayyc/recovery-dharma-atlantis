# Atlantis design guide

## Ocean Civic Light

Recovery Dharma Atlantis uses one clear, welcoming visual system: a cool near-white canvas, deep navy ink, ocean teal-blue identity, and one warm coral action colour. It should feel like a cared-for community website—not software, a museum publication, or an underwater fantasy.

## Design ownership

- `src/styles/tokens.css` owns every production colour, the system sans-serif type scale, spacing, widths, radii, borders, shadow, and motion timing.
- `src/styles/components.css` owns the masthead, bulletin, actions, shared information surfaces, and footer.
- `src/styles/pages/` owns route composition.
- `public/atlantis-mark.svg` and `public/atlantis-ripple.svg` are the only identity motif family. The mark suggests gathering and intersecting currents; the ripple should frame information, never become wallpaper.

## Three colour families

- **Neutral canvas and ink:** page, raised surfaces, readable text, and quiet rules.
- **Ocean:** identity, links, selected information, and high-priority meeting fields.
- **Coral:** the primary action and occasional next/temporary marker.

Change colours through the semantic roles in `tokens.css`. Do not add a second warm accent, unrelated greens, dark-theme overrides, or colour literals in component/page CSS.

## Type, grid, and shapes

One system sans-serif family owns every heading, paragraph, label, navigation item, and action. Use weight, size, line length, and spacing for hierarchy; do not reintroduce serif display type or giant headings.

All public regions align to one `--page-max` / `--page-gutter` grid. Major information surfaces use `--radius-surface`, controls use `--radius-control`, and true status indicators alone may be fully rounded. Use one border system and one restrained shadow.

## Composition

Meeting information belongs in the reading path, especially on Home and Meetings. Prefer integrated horizontal fields, shared rules, and compact lists over dashboard grids or a collection of unrelated cards. Keep enough padding inside useful objects while avoiding empty stage-setting space between sections.

## Safe changes

Factual edits belong in `src/content/` and must not rewrite the visual system. Visual edits must not weaken meeting timing, Recovery Dharma Global sanitization, cache, timeout, attribution, or fallback behavior in `src/meetings/`. Preserve responsive navigation, keyboard focus, reduced motion, fictional mode, and every route.
