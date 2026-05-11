---
name: add-section
description: Append a new Section to an existing open-canvas board — find an empty slot, avoid overlap, keep ≥ 200 px gutters, update presentOrder. Trigger phrases include add a section about X, append a slide about Y, throw in another panel for Z, one more block on W.
---

# add-section

Use when the user wants to grow an **existing** board. For starting from scratch, use `create-board`.

Read `board-authoring` before placing the new frame; this file does not restate its rules.

## Required ask-back (when the user hasn't said)

Ask in **a single message**:

1. **Where should it sit?** — next to which section, on which row, or auto-placed in an empty slot.
2. **Where in `presentOrder`?** — which existing id it should follow. If unspecified, default to appending to the end and tell the user explicitly.

If the user named both the neighbor and the order, skip the ask-back.

## Process

1. **Locate the file**: find `boards/<id>/index.tsx`. If multiple boards exist and the user didn't name one, ask once.
2. **Read the whole file** before editing. The new frame has to be cross-checked against every existing frame; partial reads cause overlaps.
3. **Find an empty slot**:
   - No overlap with any existing `frame` rectangle.
   - At least 200 px gutter on every adjacent edge.
   - Default sweep: extend the current row to the right (same `y`, increasing `x`) until the row width exceeds 4000, then wrap to a new row at `y = max(existing y + h) + 240`, `x = 0`.
   - When the user named a neighbor, prefer placing to its right or below it before falling back to the auto-sweep.
4. **Pick a kebab-case id** that doesn't clash with siblings and reads descriptively.
5. **Insert the new `defineSection({...})`** after the section it logically follows in the source — not at the bottom of the array. Update `presentOrder` accordingly.
6. **Leave unrelated lines untouched.** Smaller diffs are easier to review and harder to misread.

## Self-check before saving

- [ ] New id is unique within the board.
- [ ] New frame does not overlap any existing frame (test all four corners against every other frame).
- [ ] Every adjacent gutter ≥ 200 px.
- [ ] `presentOrder` updated.
- [ ] No new imports beyond `@open-canvas/core` and `react`.

## When to refuse

If the board already has 12 sections, **do not add another**. This is `AGENTS.md` invariant §3. Suggest the user either:

- split into a sibling board (offer to run `create-board`), or
- merge or delete some redundant sections first — let the user decide which.
