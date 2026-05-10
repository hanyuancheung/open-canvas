# SKILL: add-section

> Use when the user asks to add a section to an existing board.

## Process

1. Identify the target board file (`boards/<id>/index.tsx`). If ambiguous, ask once.
2. Read the file end-to-end before editing.
3. Compute a free `frame` that:
   - does **not overlap** any existing `frame`,
   - leaves at least **200 px** gutter on every adjacent side,
   - prefers continuing the existing row (same `y`, increasing `x`) until row width > 4000, then wraps to a new row at `y = max(existing y + h) + 240`.
4. Pick a kebab-case id that doesn't collide with siblings.
5. Insert the new `defineSection({...})` *before* the section it logically follows; append the id to `presentOrder` (or right after the section it relates to, if the user signaled order).
6. Keep all unrelated lines untouched.

## Sanity checklist (run in your head before saving)

- [ ] id unique within the board
- [ ] no frame overlap (test all 4 corners against every other frame)
- [ ] gutters ≥ 200 px
- [ ] `presentOrder` updated
- [ ] no new imports beyond `@open-canvas/core`, `react`

## When to refuse / split

If the board already has 12 sections, do **not** add another. Suggest creating a sibling board (`/create-board`) instead.
