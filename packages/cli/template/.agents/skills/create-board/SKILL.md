---
name: create-board
description: Create a brand-new open-canvas board from scratch — generate boards/<id>/index.tsx, plan sections and frames, produce something that opens cleanly in dev and presents in PPT mode without further fixes. Trigger phrases include make a board about X, draft a whiteboard explaining Y, build a deck for our launch plan, set up a new whiteboard.
---

# create-board

Use when the user wants to start a brand-new board from scratch. If they want to grow an existing board, use `add-section` instead.

Read `board-authoring` before doing any layout — sizes, spacing, type scale, colors, and the 5 invariants live there. This file does not repeat them.

## Required ask-back (when the user hasn't said)

Ask up to four scoped questions in **a single message**, in the user's language:

1. **Topic & aesthetic** — formal pitch, technical diagram, playful sketch, teaching deck, etc.
2. **How many sections** — small (3–4), medium (5–7), large (8–12, soft cap).
3. **Text density** — sparse (hero text + image), balanced, or dense (paragraphs / lists).
4. **Animation** — is static fine, or do you want subtle motion?

If the user has already answered all four, or said "you decide", skip the ask-back and start.

## Process

1. **Pick an id**: kebab-case, ≤ 32 chars, descriptive. ✅ `product-launch-q4`. ❌ `board1`, `untitled`.
2. **Plan `presentOrder` first** — cover → context → main points → close. The presentation sequence is the storytelling logic; lay it out before placing frames.
3. **Place frames** using the size table in `board-authoring`, with ≥ 200 px gutters between any pair. Common skeleton:
   - Row 1 (`y = 0`, `h = 720`): cover `1280 × 720` next to a content section `1600 × 900`.
   - Row 2 (`y = 1100`): a panorama `2400 × 900`.
   - Subsequent rows at `y = 2200`, `3200`, …
4. **Write `boards/<id>/index.tsx` in one shot** — no half-drafts. An incomplete board produces a red error screen in dev and interrupts the user.
5. **Self-check**: ids globally unique, every adjacent frame pair ≥ 200 px apart, no `window` reads inside `render`.
6. **Tell the user** which sections you produced, how to enter present mode (`P`), and how to leave Inspector comments (`Cmd/Ctrl+I`).

## Output skeleton

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

- Adding new dependencies. `@open-canvas/core` ships to end users; every extra dep inflates `npx init`. Prefer platform APIs.
- Importing CSS files. Use inline `style` or className (the template ships with Tailwind already wired).
- Sections smaller than `480 × 320` — they cannot carry meaningful content.
- Generic ids like `section-1`, `untitled`, `new`. The Inspector reverse-lookup becomes useless when ids are interchangeable.
