# SKILL: board-authoring (reference)

> Read this **before** writing or modifying any Section. Treat the numbers here as defaults; the user can override.

## Coordinate system

- World coordinates, CSS pixels.
- `(0, 0)` is the conventional origin; growing `x` to the right, growing `y` downward.
- One Section = one absolutely-positioned `<div>` of size `w × h` rendered at `(x, y)`.

## Recommended frame sizes

| Purpose | Size (`w × h`) |
|---------|---------------|
| Cover / hero | `1280 × 720` |
| Standard content | `1600 × 900` |
| Wide summary / panorama | `2400 × 1350` |
| Quote / pull-out | `960 × 540` |
| Code listing | `1280 × 1600` (taller than wide) |

Always keep `min(w, h) ≥ 480`.

## Spacing

- **Gutter** between adjacent sections: at least **200 px**, prefer 240.
- **Padding** inside a section: at least **48 px**.
- **Stack rule**: put related sections in one row; start a new row at `y = previousRowBottom + 240`.

## Type scale

| Role | Size (`px`) | Weight |
|------|------------|--------|
| Hero | 144 | 800 |
| H1 | 96 | 700 |
| H2 | 56 | 700 |
| Body | 28 | 400 |
| Caption | 18 | 500 |

## Color

- Default surface: `#ffffff`.
- Default text: `#0f172a`.
- Muted: `#475569`.
- Accent: pick **one** from `#0ea5e9`, `#6366f1`, `#10b981`, `#f59e0b` per board and reuse.
- Hero gradient pair (good defaults): `#0ea5e9 → #6366f1`.

## Layout patterns

```
COVER (1280)            CONTENT (1600)
┌────────────┐  ──gap──  ┌────────────────┐
│            │           │                │
│            │           │                │
└────────────┘           └────────────────┘
0,0                       1480,0

PANORAMA (2400)
┌────────────────────────────────────────┐
│                                        │
└────────────────────────────────────────┘
200, 1100
```

## Animation

- Default: static.
- If asked for motion, use CSS-only animations (`@keyframes`, `transition`). No external libraries.
- Avoid `position: fixed` / `viewport` units inside a Section — the world is transformed; layout must be relative to the section frame.

## Anti-patterns to avoid

- Reading `window`, `document`, or `localStorage` inside `render()`.
- Importing CSS files (cascade conflicts with the runtime).
- Using `<img src="https://…">` without an alt.
- Section content that bleeds beyond `w × h` (use `overflow: hidden` if needed).
- Two sections sharing a non-trivial visual element (duplicate the element instead — present mode dims everything but the active section).
