---
name: arrange-layout
description: Re-arrange every Section of an existing open-canvas board into a new spatial layout (row, column, grid, timeline). Only x/y coordinates change — sizes, ids, content, and presentOrder stay untouched. Trigger phrases include arrange them in a row, lay them out as a 2x3 grid, spread them along a timeline, line everything up vertically.
---

# arrange-layout

Use when the user wants the existing sections of a board re-positioned in space — a row, column, grid, timeline, or similar. This skill **only repositions**; it does not redesign content or resize sections.

Read `board-authoring` before laying out; this file does not restate its rules.

## Required ask-back (when the user hasn't said)

Ask in **a single message**:

1. **Layout shape** — row / column / grid (how many columns?) / timeline / something custom.
2. **Order source** — follow the current `presentOrder`, the `sections` array order, or a fresh ordering the user provides.

If the user has already specified both, skip.

## Boundaries (do not change)

- `frame.w` and `frame.h`. "Arrange" means spatial repositioning, not re-sizing. If the user wants resizing, ask first or refuse.
- `id`. Renaming an id is a breaking change (Inspector and PDF anchors break) — see `AGENTS.md` invariant §1.
- `presentOrder`. The presentation sequence is narrative logic, not spatial logic; do not let layout shape drive it.
- Unrelated source lines. Touch only the `x` and `y` literals inside each `defineSection({ frame: { ... } })` call. No reformatting.

## Layout strategies

After reading the file and collecting `[id, w, h]` for every section, apply the user's chosen strategy. All defaults use a 240 px gutter (above the 200 px hard floor).

| Strategy | Formula |
|----------|---------|
| **row** | shared `y = 0`, increasing `x`; `x_i = x_{i-1} + w_{i-1} + 240` |
| **column** | shared `x = 0`, increasing `y`; `y_i = y_{i-1} + h_{i-1} + 240` |
| **grid (C cols)** | column width = max `w` in that column, row height = max `h` in that row; coords accumulate with 240 gap on both axes |
| **timeline** | same as row, with all sections sharing `y = 0` as the timeline baseline; **do not** synthesize date labels — that is content, not layout |

## Process

1. Read the whole file; collect `[id, w, h]` and the current `presentOrder`.
2. Re-order the working sequence according to the chosen order source (`presentOrder` / array order / explicit override).
3. Apply the chosen strategy to compute new `(x, y)` for each section.
4. Write back the smallest possible diff — only the `x` and `y` literals inside each `defineSection`'s frame.
5. Report the new layout: list every `id` with its new `(x, y)`, in reading order (row: left-to-right, column: top-to-bottom, grid: row-major).
