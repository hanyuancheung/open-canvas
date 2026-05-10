# SKILL: create-board

> Use when the user asks for a brand-new board, e.g. "make a board about our launch plan", "draft a whiteboard explaining X", "新建一块讲 Y 的白板".

## Goal

Produce a complete, runnable `boards/<id>/index.tsx` that opens cleanly in the dev server and presents in PPT mode without further fixes.

## Required ask-back (in one short message, in the user's language)

If the user's prompt didn't already cover them, ask up to four scoped questions in **a single message**:

1. **Topic & aesthetic** — formal pitch, playful sketch, technical diagram, etc.
2. **How many sections** — small (3–4), medium (5–7), large (8–12, soft cap).
3. **Text density** — sparse (hero text + image), balanced, or dense (paragraphs / lists).
4. **Animation** — static is fine, or do you want subtle motion?

If the user has already specified all four (or said "you decide"), skip the ask-back.

## Process

1. **Pick an id**: kebab-case, ≤ 32 chars, descriptive (`product-launch-q4`, not `board1`).
2. **Plan section order** as `presentOrder` ids — Cover → context → main points → close.
3. **Lay out frames** following `board-authoring` sizing rules, leaving ≥ 200 px gutters. A common pattern:
   - First row: `y=0`, `h=720`. Cover (1280) + supporting (1600) side by side.
   - Second row: `y=1100`, large summary (2400×900).
   - Use `y=2200, 3200, …` for further rows.
4. **Write `index.tsx`** in one shot. No partial drafts.
5. **Validate** in your head: every id unique, every frame ≥ 200 px from its neighbors, no `window` reads inside `render`.
6. **Tell the user** which sections you created and how to enter present mode.

## Output template (skeleton)

```tsx
import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: { title: '<TITLE>', emoji: '<EMOJI>', background: { kind: 'dot-grid' } },
  sections: [
    defineSection({
      id: '<id-1>',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      meta: { notes: '<speaker note>' },
      render: () => (/* … */),
    }),
    // …
  ],
  presentOrder: ['<id-1>', '<id-2>', /* … */],
})
```

## Forbidden

- Adding new dependencies.
- Importing CSS files (use inline `style={{...}}` or className with template defaults).
- Sections smaller than 480×320 — they don't carry meaningful content.
- Generic ids like `section-1`, `untitled`.
