# open-canvas

> 为智能体打造的白板框架。
> 把一句 *"做一块讲 X 的白板"*，变成可无限漫游、可分区演示、可一键导出 PDF 的可视化作品 —— 由 agent 用纯 React 写就。

**简体中文** · [English](./README.md) · [![CI](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/hanyuancheung/open-canvas/actions/workflows/ci.yml) · [npm core](https://www.npmjs.com/package/@open-canvas/core) · [npm cli](https://www.npmjs.com/package/@open-canvas/cli)

## 30 秒上手

```bash
npx @open-canvas/cli init my-board
cd my-board
pnpm install
pnpm dev
```

打开 http://localhost:5173，会落到 `boards/getting-started`。按 `P` 进入演示模式，按 `⌘I`（或 `Ctrl+I`）打开 Inspector。

> **注意** — `@open-canvas/*` 系列包尚未发布到 npm registry。如果 `npx` 报 `@open-canvas/cli@* could not be found`，
> 请参考 [`PUBLISHING.md`](./PUBLISHING.md) 中的三条免 registry 本地落地路径（直接跑 / `pnpm link` / 本地 tarball）。

## 核心特性

- 🧭 **无限画布** — 每块 Section 自定义尺寸，自由摆放；平移 / 缩放 / 小地图开箱即用。
- 🎬 **分区演示** — 用 `presentOrder` 定义播放序列，相机缓动到每一区，像 PPT 但保留空间感。
- 📄 **PDF 导出** — `open-canvas export pdf <board>`，按分区分页输出。
- 🤖 **Agent 原生** — 预置 `create-board` / `add-section` / `arrange-layout` / `apply-comments` 五个 skill，适配任何 coding agent。
- 🔍 **浏览器内 Inspector** — `⌘I` 后点击任意元素留下 `@canvas-comment`，agent 一键应用并清理标记。
- 🚀 **零配置** — 用户工程只见 `boards/`，Vite / React / tsconfig 全部下沉到 `@open-canvas/core`。

完整架构见 [`DESIGN.md`](./DESIGN.md)，agent 行为约束见 [`AGENTS.md`](./AGENTS.md)。

## 一次典型协作流程

1. 对 agent 说：*"做一块讲 Q4 发布计划的白板"* → 它调用 `/create-board`。
2. dev server 在 agent 编辑 `boards/<id>/index.tsx` 时实时热更新。
3. 按 `P` 走一遍演示；按 `⌘I` 点击任意元素留下 *"标题再小一点"* 之类的评论。
4. 让 agent 执行 `/apply-comments` —— 它读回标记、修改 JSX、删除标记。
5. `pnpm export:pdf` 产出可分享的 PDF。

## CLI 命令

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

## 创作 API

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

## 仓库结构

```
open-canvas/
├─ packages/
│  ├─ core/                @open-canvas/core（运行时 + Vite 插件 + bin）
│  └─ cli/                 @open-canvas/cli（npx 脚手架）
├─ apps/
│  └─ demo/                框架自身开发用的工作区
├─ DESIGN.md               架构与设计取舍
├─ AGENTS.md               通用 agent 协作合约（Codex/Cursor/Copilot…）
└─ CLAUDE.md               Claude Code 专用硬性规则
```

## 框架自身开发

```bash
pnpm install
pnpm dev      # 运行 apps/demo，链接本地 @open-canvas/core
pnpm build    # 构建所有 packages
pnpm check    # Biome lint + format
```

## 现状

处于早期阶段，但 v0.1 的功能面（画布 / 演示 / Inspector / PDF）已闭环。v0.2 ~ v0.3 路线（只读分享链接、面向远端 agent 的 MCP server、布局求解器）见 [`DESIGN.md`](./DESIGN.md)。

## License

MIT
