# open-canvas

> A whiteboard framework built for agents.
> Turn *"draft a whiteboard about X"* into an infinitely-pannable, sectioned, presentable, PDF-exportable artifact — written by your coding agent in plain React.

[简体中文](./README_zh.md) · **English** · [![CI](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml) · [npm core](https://www.npmjs.com/package/@open-canvas/core) · [npm cli](https://www.npmjs.com/package/@open-canvas/cli)

## 30-second tour

```bash
npx @open-canvas/cli init my-board
cd my-board
pnpm install
pnpm dev
```

Open http://localhost:5173, you'll land on `boards/getting-started`. Press `P` to present, `⌘I` (or `Ctrl+I`) to enter Inspector.

> **Note** — the `@open-canvas/*` packages are not published to the npm registry yet. If `npx` reports
> `@open-canvas/cli@* could not be found`, follow one of the three zero-registry paths in
> [`PUBLISHING.md`](./PUBLISHING.md) (direct run / `pnpm link` / local tarball).

## Core features

- 🧭 **Infinite canvas** — each Section has its own size, freely placed; pan / zoom / mini-map come built-in.
- 🎬 **Sectioned presenting** — define `presentOrder` and the camera eases to each section, like PPT but spatial.
- 📄 **PDF export** — `open-canvas export pdf <board>` produces a one-section-per-page PDF.
- 🤖 **Agent-native** — ships with `create-board` / `add-section` / `arrange-layout` / `apply-comments` skills for any coding agent.
- 🔍 **In-browser Inspector** — `⌘I`, click any element, leave a `@canvas-comment`; the agent applies it on demand.
- 🚀 **Zero config** — users only see `boards/`. Vite, React and tsconfig live inside `@open-canvas/core`.

For deeper internals see [`DESIGN.md`](./DESIGN.md); for agent behavior contracts see [`AGENTS.md`](./AGENTS.md).

## How a typical session looks

1. Ask your agent: *"create a board explaining our Q4 launch plan"* → it runs `/create-board`.
2. The dev server hot-reloads as the agent edits `boards/<id>/index.tsx`.
3. Press `P` to walk through the deck; press `⌘I` and click any element to drop a comment like *"make the title smaller"*.
4. Ask the agent `/apply-comments` — it reads back the markers, edits the JSX, removes them.
5. `pnpm export:pdf` ships a sharable PDF.

## CLI commands

| Command | What it does |
|---------|-------------|
| `open-canvas dev` | Start the dev server (default port 5173) |
| `open-canvas build` | Build a static site into `dist/` |
| `open-canvas preview` | Preview the production build |
| `open-canvas export pdf <board>` | Render the board to a multi-page PDF |

PDF export uses `playwright-core` + `pdf-lib` (declared as optional deps). On first use:

```bash
pnpm add -D playwright-core pdf-lib
npx playwright install chromium
```

## Authoring API

```tsx
import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: { title: 'Hello', emoji: '🎨', background: { kind: 'dot-grid' } },
  sections: [
    defineSection({
      id: 'intro',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      meta: { notes: 'A short opener.' },
      render: () => <h1 style={{ fontSize: 144 }}>Hello Canvas</h1>,
    }),
  ],
  presentOrder: ['intro'],
})
```

That's the entire surface area users (and agents) need to memorize.

## Repository layout

```
open-canvas/
├─ packages/
│  ├─ core/                @open-canvas/core (runtime + Vite plugin + bin)
│  └─ cli/                 @open-canvas/cli  (npx scaffolder)
├─ apps/
│  └─ demo/                Workspace used while developing the framework
├─ DESIGN.md               Architecture & rationale
├─ AGENTS.md               Agent contract (Codex/Cursor/Copilot…)
└─ CLAUDE.md               Claude-specific hard rules
```

## Working on the framework itself

```bash
pnpm install
pnpm dev      # runs apps/demo against the local @open-canvas/core
pnpm build    # build every package
pnpm check    # Biome lint + format
```

## Status

Early-stage but feature-complete for the v0.1 surface (canvas + present mode + Inspector + PDF). Roadmap toward v0.3 (read-only share links, MCP server for remote agents, layout solver) lives in [`DESIGN.md`](./DESIGN.md).

## License

MIT
