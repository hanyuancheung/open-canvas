<p align="center">
  <img src="./asset/introduction.png" alt="open-canvas" width="100%" />
</p>

# OPEN-CANVAS

> 为智能体打造的白板框架。用自然语言描述白板 —— 你的 coding agent 来写 React。open-canvas 负责无限画布、分区排版、演示模式、热更新、Inspector 与 PDF 导出，让 agent 专注于内容本身。

每一块 Section 都是可自由定尺、自由摆放的 React 组件，渲染在可平移可缩放的世界画布上 —— 不是受限的 DSL。

```bash
npx @open-canvas/cli init my-board
```

**简体中文** · [English](./README.md) · [![CI](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml) · [npm core](https://www.npmjs.com/package/@open-canvas/core) · [npm cli](https://www.npmjs.com/package/@open-canvas/cli)

---

## WHY OPEN-CANVAS

白板是视觉化的代码，agent 又最擅长写代码。open-canvas 是这中间缺失的运行时 —— 它把 *"做一块讲 X 的白板"* 这一句话，变成可无限漫游、可分区演示、可一键导出 PDF 的可视化作品，全程不必离开聊天框。

---

## HIGHLIGHTS

- 🧭 **无限画布** — 每块 Section 自定义尺寸，自由摆放在世界画布上；平移、缩放、小地图开箱即用。
- 🎬 **分区演示** — 用 `presentOrder` 定义播放序列，相机缓动到每一区，像 PPT，但保留空间感；演讲者备注一并随行。
- 🤖 **Agent 原生创作** — 兼容 Claude Code、Codex、Cursor 等任意 coding agent。脚手架内置五个 skill，覆盖完整创作闭环（创建 / 添加 / 排布 / 评论 / 参考）。
- 🎯 **浏览器内 Inspector** — `⌘I`（或 `Ctrl+I`）后点击任意元素留下 *"标题再小一点"* 之类的评论，以 `@canvas-comment` 标记持久化进源码；执行 `/apply-comments`，agent 批量应用并清理标记。
- 📄 **PDF 导出** — `open-canvas export pdf <board>`，由 `playwright-core` + `pdf-lib` 按分区分页输出。
- 🚀 **零配置** — 用户工程只见 `boards/`，Vite / React / tsconfig 全部下沉到 `@open-canvas/core`；构建产物纯静态，部署到任意平台。

---

## GET STARTED

```bash
npx @open-canvas/cli init my-board
cd my-board
pnpm install
pnpm dev
```

打开 <http://localhost:5173>，会落到 `boards/getting-started`。按 `P` 进入演示模式，按 `⌘I`（或 `Ctrl+I`）打开 Inspector。

脚手架会把 Claude Code 的 agent skills 预置在 `.claude/skills/` 下；你也可以直接编辑 `boards/<id>/index.tsx`。完整 agent 行为约束见 `CLAUDE.md` 与 `AGENTS.md`。

> **注意** — `@open-canvas/*` 系列包尚未发布到公共 npm registry。如果 `npx` 报 `@open-canvas/cli@* could not be found`，请参考 [`PUBLISHING.md`](./PUBLISHING.md) 中三条免 registry 本地落地路径。

### 创作 API

```tsx
import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: { title: 'Hello', emoji: '🎨', background: { kind: 'dot-grid' } },
  sections: [
    defineSection({
      id: 'intro',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      meta: { notes: '简短开场。' },
      render: () => <h1 style={{ fontSize: 144 }}>Hello Canvas</h1>,
    }),
  ],
  presentOrder: ['intro'],
})
```

整个公共 API 就这一小撮，作者（无论是人还是 agent）几乎不需要记忆。

### CLI

| 命令 | 作用 |
|------|------|
| `open-canvas dev` | 启动开发服务器（默认 5173 端口） |
| `open-canvas build` | 构建静态站点到 `dist/` |
| `open-canvas preview` | 预览生产构建 |
| `open-canvas export pdf <board>` | 把整块白板按分区分页导出为 PDF |

PDF 导出依赖可选项 `playwright-core` 与 `pdf-lib`，首次使用：

```bash
pnpm add -D playwright-core pdf-lib
npx playwright install chromium
```

---

## BUILT-IN SKILLS

`npx @open-canvas/cli init` 会把五个 skill 释放到工程的 `.claude/skills/` 下，构成完整的创作闭环。你既可以在 agent 里用斜杠命令显式触发（`/create-board`、`/add-section` …），也可以直接说下表中的触发短语 —— 中英文皆可。

| Skill | 触发短语 | 作用 |
|-------|---------|------|
| 🪄 [`create-board`](./packages/cli/template/.claude/skills/create-board/SKILL.md) | "做一块讲 X 的白板" · "新建一块讲 Y 的白板" · "draft a whiteboard explaining Z" | 在用户没说清时，最多用一条消息追问 4 个范围问题（主题与美学、分区数量、文字密度、是否要动效），然后**一次性**写出完整的 `boards/<id>/index.tsx` —— 排好 frame、设好 `presentOrder`，直接 `pnpm dev` 可看。 |
| ➕ [`add-section`](./packages/cli/template/.claude/skills/add-section/SKILL.md) | "再加一节讲 Y" · "add a section about Y" | 定位目标白板，计算一个**不重叠、四边 ≥ 200 px 间距**的 `frame`，起一个 kebab-case 唯一 id，插入新 `defineSection({...})` 并追加到 `presentOrder`。超过 12 个分区会拒绝并建议拆 board。 |
| 🧱 [`arrange-layout`](./packages/cli/template/.claude/skills/arrange-layout/SKILL.md) | "排成一行" · "排成 2×3 网格" · "按时间线展开" · "arrange in a row" | 仅重算每个分区的 `frame.x` / `frame.y` —— **绝不动 `w` / `h`、id、`presentOrder`** —— 重排为 row / column / grid / timeline。完成后回报 `id (col,row) at (x,y)` 的新坐标表。 |
| 💬 [`apply-comments`](./packages/cli/template/.claude/skills/apply-comments/SKILL.md) | "应用评论" · "改一下我刚刚标的那些" · "apply comments" | 在 `boards/**/*.tsx` 中扫描 Inspector 留下的 `// @canvas-comment[id=…]: …` 标记，逐条做**最小化的 JSX 改动**，并**删除标记**。模糊的标记会跳过并报告；不会"顺手"做无关重构。 |
| 📐 [`board-authoring`](./packages/cli/template/.claude/skills/board-authoring/SKILL.md) | 由其他 skill 被动加载 | 创作规范参考卡：世界坐标系、推荐尺寸（1280×720 封面 / 1600×900 标准 / 2400×1350 全景 …）、200 px 间距、字号尺度、配色、反模式。其他四个 skill 在写代码前都会先读它。 |

> 标记格式与 skill 行为契约定义在 `AGENTS.md` —— 保持 `Section.id` 稳定，不要在 `render` 里读 `window`，应用完评论后必须删掉 `@canvas-comment` 标记。

---

## REPO LAYOUT

| 路径 | 说明 |
|------|------|
| `packages/core` | `@open-canvas/core` —— 运行时（画布查看器、演示模式、Inspector）+ Vite 插件 + `open-canvas` dev/build/preview/export CLI |
| `packages/cli` | `@open-canvas/cli` —— `npx @open-canvas/cli init` 脚手架。生成最小用户工作区，Vite/React/tsconfig 隐藏在 core 内部 |
| `apps/demo` | 通过 `workspace:*` 引用 `@open-canvas/core` 的示例工作区，用于框架自身开发 |
| `.claude/skills/` | 上方五个内置 skill（脚手架时复制到用户工程） |

整个仓库是 **pnpm + Turbo monorepo**。

---

## DEVELOPMENT

```bash
pnpm install
pnpm dev      # 运行 apps/demo，链接本地 @open-canvas/core
pnpm build    # 构建所有 packages
pnpm check    # Biome lint + format（提交前必须干净）
```

任何改动 `packages/core` 或 `packages/cli` 都需要 changeset：

```bash
pnpm changeset
```

完整贡献约束见 [`AGENTS.md`](./AGENTS.md)；架构与 v0.2~v0.3 路线（只读分享链接、面向远端 agent 的 MCP server、布局求解器）见 [`DESIGN.md`](./DESIGN.md)。

---

## LICENSE

MIT
