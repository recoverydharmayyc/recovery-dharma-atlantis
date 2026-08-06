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

## Viewport-first shell

At ordinary desktop sizes, the shell gives the remaining viewport height to `.site-main`. That is the only vertical scroll surface: routes that fit have no scrollbar, while longer or expanded content scrolls there. The document/body must not scroll at the same time, and child panels must never introduce another vertical scrollbar. Route changes reset `.site-main` to the top before paint.

Narrow layouts, short windows, and zoomed/reflowed layouts return to normal document scrolling so content and focus targets cannot be clipped. Do not force a route to fit by hiding facts, shrinking body text, scaling the page, or adding an internal list scrollbar.

Home, About, New Here, Connect, 404, and the default Meetings composition are intentionally compact on standard desktop viewports. Extra Global records appear only after the visitor chooses “Show more worldwide meetings”; expansion may make the single main surface scroll.

## Safe changes

Factual edits belong in `src/content/` and must not rewrite the visual system. Visual edits must not weaken meeting timing, Recovery Dharma Global sanitization, cache, timeout, attribution, or fallback behavior in `src/meetings/`. Preserve responsive navigation, keyboard focus, reduced motion, fictional mode, and every route.
