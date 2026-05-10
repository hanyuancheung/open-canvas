# OPEN-CANVAS

> The whiteboard framework built for agents. Describe the board in natural language — your coding agent writes the React. open-canvas handles the infinite canvas, sectioning, present mode, hot reload, Inspector and PDF export so the agent can focus on content.

Each Section is a free-sized, freely-placed React component on a pannable, zoomable world canvas — not a constrained DSL.

```bash
npx @open-canvas/cli init my-board
```

[简体中文](./README_zh.md) · **English** · [![CI](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml) · [npm core](https://www.npmjs.com/package/@open-canvas/core) · [npm cli](https://www.npmjs.com/package/@open-canvas/cli)

---

## WHY OPEN-CANVAS

Whiteboards are visual code. Agents are great at writing code. open-canvas is the missing runtime that turns *"draft a whiteboard about X"* into an infinitely-pannable, sectioned, presentable, PDF-exportable artifact — without you ever leaving the chat.

---

## HIGHLIGHTS

- 🧭 **Infinite Canvas** — every Section has its own size, freely placed on a world canvas; pan, zoom and mini-map come built-in.
- 🎬 **Sectioned Present Mode** — define `presentOrder` and the camera eases to each section like PPT, but spatial. Speaker notes ride along.
- 🤖 **Agent-Native Authoring** — works with Claude Code, Codex, Cursor and any coding agent. Five skills ship in the scaffold and cover the full authoring loop (create / add / arrange / comment / reference).
- 🎯 **In-Browser Inspector** — `⌘I` (or `Ctrl+I`), click any element, leave a comment like *"make the title smaller"*. Comments are persisted as `@canvas-comment` markers in the source; run `/apply-comments` and the agent applies them in batch.
- 📄 **PDF Export** — `open-canvas export pdf <board>` produces a one-section-per-page PDF via `playwright-core` + `pdf-lib`.
- 🚀 **Zero Config** — users only see `boards/`. Vite, React and tsconfig live inside `@open-canvas/core`. Build output is static; deploy anywhere.

---

## GET STARTED

```bash
npx @open-canvas/cli init my-board
cd my-board
pnpm install
pnpm dev
```

Open <http://localhost:5173>, you'll land on `boards/getting-started`. Press `P` to present, `⌘I` (or `Ctrl+I`) to enter Inspector.

The scaffold ships with the agent skills pre-configured for Claude Code under `.claude/skills/`. You can also edit `boards/<id>/index.tsx` directly. See `CLAUDE.md` and `AGENTS.md` for the full agent contract.

> **Note** — the `@open-canvas/*` packages are not on the public npm registry yet. If `npx` reports `@open-canvas/cli@* could not be found`, follow one of the three zero-registry paths in [`PUBLISHING.md`](./PUBLISHING.md).

### Authoring API

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

### CLI

| Command | What it does |
|---------|-------------|
| `open-canvas dev` | Start the dev server (default port 5173) |
| `open-canvas build` | Build a static site into `dist/` |
| `open-canvas preview` | Preview the production build |
| `open-canvas export pdf <board>` | Render the board to a multi-page PDF |

PDF export needs optional deps on first use:

```bash
pnpm add -D playwright-core pdf-lib
npx playwright install chromium
```

---

## BUILT-IN SKILLS

Five skills are dropped into `.claude/skills/` by `npx @open-canvas/cli init`. They form a complete authoring loop. Trigger them with a slash command in your agent (`/create-board`, `/add-section`, …) or rely on the agent's own intent routing — the trigger phrases below work in plain English or 中文.

| Skill | Trigger phrases | What it does |
|-------|-----------------|--------------|
| 🪄 [`create-board`](./packages/cli/template/.claude/skills/create-board/SKILL.md) | "make a board about X" · "draft a whiteboard explaining Y" · "新建一块讲 Z 的白板" | Asks up to 4 scoped questions (topic & aesthetic, section count, text density, animation), then writes a complete `boards/<id>/index.tsx` in one shot — frames laid out, `presentOrder` set, ready for `pnpm dev`. |
| ➕ [`add-section`](./packages/cli/template/.claude/skills/add-section/SKILL.md) | "add a section about Y" · "再加一节讲 Y" | Locates the target board, finds a non-overlapping `frame` with ≥ 200 px gutter, picks a unique kebab-case id, inserts the new `defineSection({...})` and appends it to `presentOrder`. Refuses (and suggests splitting) past 12 sections. |
| 🧱 [`arrange-layout`](./packages/cli/template/.claude/skills/arrange-layout/SKILL.md) | "arrange in a row" · "make it a 2×3 grid" · "排成一行" · "按时间线展开" | Recomputes `frame.x` / `frame.y` only — never touches `w`/`h`, ids or `presentOrder` — to lay sections out as row / column / grid / timeline. Reports the new `id (col,row) at (x,y)` map. |
| 💬 [`apply-comments`](./packages/cli/template/.claude/skills/apply-comments/SKILL.md) | "apply comments" · "改一下我刚刚标的那些" · "应用评论" | Greps `boards/**/*.tsx` for `// @canvas-comment[id=…]: …` markers left by the Inspector, applies each as the smallest possible JSX edit, and **deletes the marker**. Skips ambiguous ones with a report; does not batch in unrelated refactors. |
| 📐 [`board-authoring`](./packages/cli/template/.claude/skills/board-authoring/SKILL.md) | passively loaded by other skills | Reference card: world coordinates, recommended frame sizes (1280×720 cover, 1600×900 standard, 2400×1350 panorama…), 200 px gutter rule, type scale, color palette, anti-patterns. The other four skills read this before touching code. |

> Markers and skill names follow the contract in `AGENTS.md` — keep `Section.id` stable, never read `window` inside `render`, and always remove `@canvas-comment` markers after applying.

---

## REPO LAYOUT

| Path | Description |
|------|-------------|
| `packages/core` | `@open-canvas/core` — runtime (canvas viewer, present mode, Inspector), Vite plugin, and the `open-canvas` dev/build/preview/export CLI |
| `packages/cli` | `@open-canvas/cli` — `npx @open-canvas/cli init` scaffolder. Generates the minimal user workspace; Vite/React/tsconfig stay hidden inside core |
| `apps/demo` | Sample workspace consuming `@open-canvas/core` via `workspace:*`, used to develop the framework itself |
| `.claude/skills/` | The five built-in skills above (shipped to user projects via the scaffold) |

The whole repo is a **pnpm + Turbo monorepo**.

---

## DEVELOPMENT

```bash
pnpm install
pnpm dev      # run apps/demo against the local @open-canvas/core
pnpm build    # build every package
pnpm check    # Biome lint + format (must be clean before commit)
```

Changes touching `packages/core` or `packages/cli` require a changeset:

```bash
pnpm changeset
```

See [`AGENTS.md`](./AGENTS.md) for the full contributor contract and [`DESIGN.md`](./DESIGN.md) for architecture and roadmap (read-only share links, MCP server, layout solver…).

---

## LICENSE

MIT
