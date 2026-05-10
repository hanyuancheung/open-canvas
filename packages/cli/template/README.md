# My Canvas

This is an **open-canvas** workspace — a whiteboard built for agents.

## Run

```bash
pnpm install      # or npm install / yarn
pnpm dev          # http://localhost:5173
```

## Add a board

Create `boards/<id>/index.tsx` and export `defineBoard(...)`. The dev server auto-discovers it.

```tsx
import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: { title: 'Roadmap', emoji: '🛣️' },
  sections: [
    defineSection({
      id: 'q1',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      render: () => <div style={{padding:64}}>Q1 plans</div>,
    }),
  ],
})
```

## Use with an AI agent

This workspace ships with skills for Claude Code (and any compatible agent) under `.claude/skills/` and `.agents/skills/`. Try:

- `/create-board "a board about our new product launch"`
- `/add-section "another section explaining the architecture"`
- `/arrange-layout "a 3-column grid"`

After presenting (`P`) or browsing, hit `⌘I` to enter Inspector, click any element, leave a comment. Then ask the agent: `/apply-comments`.

## Export

```bash
pnpm build                                              # static site → dist/
pnpm export:pdf                                          # PDF using getting-started
open-canvas export pdf <board> --out deck.pdf           # custom PDF
```

PDF export needs `playwright-core` + a chromium binary the first time:

```bash
pnpm add -D playwright-core pdf-lib
npx playwright install chromium
```
