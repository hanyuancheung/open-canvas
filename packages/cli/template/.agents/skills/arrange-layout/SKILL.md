# SKILL: arrange-layout

> Use when the user asks to re-arrange the sections of a board: "排成一行", "make it a 2×3 grid", "按时间线展开".

## Process

1. Read the entire board; collect existing `[id, frame.w, frame.h]` tuples.
2. Choose a layout strategy from the user's words:
   - **row** — single row, increasing `x`, shared `y=0`, gap 240
   - **column** — single column, increasing `y`, shared `x=0`, gap 240
   - **grid Cx R** — auto-pack into `C` columns, gap 240 each axis
   - **timeline** — same as row, but each section gets a small caption strip (don't add it; just align baseline at `y=0`)
3. Recompute `frame.x` and `frame.y` only — **never touch `frame.w` / `frame.h`** unless the user explicitly asked for resizing.
4. Keep the `id`s and `presentOrder` array unchanged.
5. Update only the literal coordinates inside each `defineSection({ frame: { ... } })` call.

## Output

Produce a single edit to the board file. Do not reformat unrelated code.

After saving, summarize the new layout to the user as: `id (col,row) at (x, y)`.
