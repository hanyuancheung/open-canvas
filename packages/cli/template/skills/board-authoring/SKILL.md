---
name: board-authoring
description: Single source of truth for open-canvas board/section authoring conventions — coordinate system, sizes, type scale, colors, spacing, invariants. Required reading before any skill writes or modifies a Section. Do not restate these rules elsewhere.
---

# board-authoring

This is a passive reference, not an action skill. `create-board`, `add-section`, `arrange-layout`, and `apply-comments` should all consult this file before doing any work, and **must not duplicate its rules in their own SKILL.md** — duplicated rules drift over time.

## Invariants (project-wide hard constraints)

Source: `AGENTS.md` § Invariants. Any skill that violates one of these is a regression.

1. **`Section.id` is kebab-case and unique within a board.** The Inspector anchor and the PDF anchor both depend on it; renaming an id is a breaking change.
2. **Adjacent `Section.frame`s have at least 200 px of gutter** (240 preferred). Tighter gutters cause visual smearing during present-mode camera transitions.
3. **At most 12 sections per board.** Beyond that, split into sibling boards via `create-board`.
4. **Never read `window` / `document` / `localStorage` inside `render`.** The world is rendered through a CSS `transform`; runtime side-effects must live in their own `useEffect`.
5. **`@canvas-comment` markers are transient.** `apply-comments` must delete each marker after applying it; a leftover marker means the comment was never resolved.

## Coordinate system

- Unit: CSS pixels, world coordinates.
- Origin `(0, 0)` is top-left; `x` grows right, `y` grows down.
- A Section is one absolutely-positioned `<div>` of size `w × h` rendered at `(x, y)`. The runtime wraps the world in `transform: translate(...) scale(...)`.
- **Do not use `position: fixed` or viewport units (`vw`/`vh`/`dvh`) inside a Section** — they escape the world transform and desync from the camera.

## Recommended frame sizes

| Purpose | `w × h` |
|---------|--------|
| Cover / hero | `1280 × 720` |
| Standard content | `1600 × 900` |
| Wide summary / panorama | `2400 × 1350` |
| Pull-quote / callout | `960 × 540` |
| Code listing (tall) | `1280 × 1600` |

Hard floor: `min(w, h) ≥ 480`. Anything smaller cannot carry meaningful content; it reads as a layout mistake during presentation.

## Spacing

- **Between sections**: ≥ 200 px, prefer 240.
- **Padding inside a section**: ≥ 48 px.
- **Row stacking**: keep related sections on the same row; start the next row at `y = previousRowBottom + 240`.

## Type scale

| Role | `px` | `weight` |
|------|-----|---------|
| Hero | 144 | 800 |
| H1 | 96 | 700 |
| H2 | 56 | 700 |
| Body | 28 | 400 |
| Caption | 18 | 500 |

## Color

- Default surface: `#ffffff`.
- Default text: `#0f172a`.
- Muted text: `#475569`.
- Accent: pick **one** of `#0ea5e9` / `#6366f1` / `#10b981` / `#f59e0b` per board and reuse. A scattered palette dilutes visual hierarchy.
- Default hero gradient pair: `#0ea5e9 → #6366f1`.

## Layout sketch

```
COVER (1280×720)         CONTENT (1600×900)
┌────────────┐  ──gap──  ┌────────────────┐
│            │           │                │
└────────────┘           └────────────────┘
(0, 0)                    (1480, 0)

PANORAMA (2400×1350)
┌────────────────────────────────────────┐
│                                        │
└────────────────────────────────────────┘
(200, 1100)
```

## Animation

- Default to static.
- When motion is needed, use **CSS only** (`@keyframes`, `transition`). Do not pull in framer-motion / gsap as runtime dependencies.
- Animations must not depend on `window.scrollY` or viewport size — see the coordinate-system rule above.

## Anti-patterns

- Reading `window` / `document` / `localStorage` inside `render()`.
- Importing CSS files (cascade conflicts with the runtime; use inline `style` or className).
- Content that overflows `w × h` (add `overflow: hidden` to the section container if needed).
- Two sections sharing the same animation state or external store — present mode only foregrounds the active section, so cross-section sharing produces "half-frozen" presentations.
- `<img>` without an `alt`.
- Hard-coding remote image/video URLs inside components — prefer `boards/<id>/assets/` with relative imports so the export pipeline can rewrite them later.
