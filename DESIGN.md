# open-canvas — 为智能体打造的白板框架

> **一句话定位**：把 *"帮我做一块讲 X 的白板"* 这条自然语言指令，变成可无限漫游、可分区演示、可一键导出 PDF 的可视化作品；agent 写 React 代码，框架负责画布、缩放、分区、导航、热重载、Inspector 反馈与导出。

本文档定义 open-canvas 的整体架构与边界：以 *无边界画布 + 任意尺寸分区* 为创作范式，以 *Vite 插件 + 虚拟模块* 为运行机制，以 *Skills + Inspector 闭环* 为 agent 协作机制。

---

## 一、设计目标

| 维度 | 设计选择 |
|------|---------|
| 创作单元 | **Section**：任意尺寸的分区，散布在无边界画布上 |
| 画布 | **无限平面**，支持自由缩放 / 平移 / 小地图 |
| 演示 | **按 Section 序列播放**（PPT 模式），相机缓动到每一区；同时保留自由导航模式 |
| 导出 | **静态站点 + 一键 PDF**（按分区分页） |
| Agent 创作 | `/create-board`、`/add-section`、`/arrange-layout` 等 skills |
| Inspector | 浏览器内点击 → 留 `@canvas-comment` → agent 一键应用 |
| 安装 | `npx @open-canvas/cli init` |

---

## 二、核心心智模型

```
┌─ Board (一块白板) ─────────────────────────────────────┐
│                                                        │
│   ┌─ Section "intro" ─┐    ┌─ Section "arch" ─┐        │
│   │   <ReactNode/>    │    │   <ReactNode/>   │        │
│   └───────────────────┘    └──────────────────┘        │
│                                                        │
│              ┌─ Section "demo" (任意 W×H) ─┐           │
│              │        <ReactNode/>         │           │
│              └─────────────────────────────┘           │
│                                                        │
└────────────────────────────────────────────────────────┘
        ↑ 无限平面，平移/缩放/小地图     ↑ 演示序列 = [intro, arch, demo, ...]
```

- **Board** = 一份作品。对应文件 `boards/<id>/index.tsx`，默认导出 `BoardModule`。
- **Section** = 白板上的一块"画板"，由 React 组件 + `frame: { x, y, w, h }` 描述。
- **Order** = 演示时的播放序列（默认按文件中数组顺序）。
- 所有坐标都是 **逻辑坐标**（CSS 像素），框架负责把世界坐标映射到屏幕。

### 为什么是 React 组件而不是 DSL？

核心论断：**作品本质上是可视化的代码，而 agent 最擅长写代码**。  
**任意 React + Tailwind/CSS** 给 agent 最大灵活度，框架不限制内容形式（图、表、代码块、动画、视频均可）；agent 不需要再学一门 DSL，就能产出能跑、能演、能导出的成品。

---

## 三、Monorepo 结构

```
open-canvas/
├─ DESIGN.md                       # 本文档
├─ AGENTS.md                       # 通用 agent 规则
├─ CLAUDE.md                       # Claude Code 硬性规则
├─ README.md
├─ pnpm-workspace.yaml
├─ turbo.json
├─ biome.json
├─ package.json
│
├─ packages/
│  ├─ core/                        # @open-canvas/core
│  │  ├─ src/
│  │  │  ├─ runtime/               # 浏览器运行时
│  │  │  │  ├─ App.tsx
│  │  │  │  ├─ Home.tsx            # 列出所有 board
│  │  │  │  ├─ BoardViewer.tsx     # 无限画布视图
│  │  │  │  ├─ PresentMode.tsx     # PPT 播放
│  │  │  │  ├─ Inspector/          # 点击 → 评论
│  │  │  │  └─ MiniMap.tsx
│  │  │  ├─ canvas/                # 平移/缩放/坐标变换
│  │  │  │  ├─ useViewport.ts
│  │  │  │  ├─ usePanZoom.ts
│  │  │  │  └─ fitFrame.ts
│  │  │  ├─ vite/                  # Vite 插件
│  │  │  │  ├─ plugin.ts           # virtual:open-canvas/boards
│  │  │  │  ├─ discover.ts         # glob boards/<id>/index.tsx
│  │  │  │  └─ inspector-tag.ts    # 注入 data-oc-loc
│  │  │  ├─ cli/                   # bin: open-canvas
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ dev.ts
│  │  │  │  ├─ build.ts
│  │  │  │  └─ export-pdf.ts       # Playwright 驱动 → PDF
│  │  │  ├─ types.ts               # BoardModule, Section, ...
│  │  │  └─ index.ts               # 公共 API: defineBoard, defineSection
│  │  ├─ bin.js
│  │  ├─ package.json
│  │  └─ tsdown.config.ts
│  │
│  └─ cli/                         # @open-canvas/cli (脚手架)
│     ├─ src/index.ts              # init 命令
│     ├─ template/                 # 复制到用户工程
│     │  ├─ boards/getting-started/index.tsx
│     │  ├─ open-canvas.config.ts
│     │  ├─ package.json.tmpl
│     │  ├─ .gitignore
│     │  ├─ CLAUDE.md
│     │  └─ .claude/skills/
│     │     ├─ create-board/SKILL.md
│     │     ├─ add-section/SKILL.md
│     │     ├─ arrange-layout/SKILL.md
│     │     ├─ apply-comments/SKILL.md
│     │     └─ board-authoring/SKILL.md
│     ├─ bin.js
│     └─ package.json
│
└─ apps/
   └─ demo/                        # 框架自身开发用
      ├─ boards/
      │  ├─ getting-started/index.tsx
      │  └─ product-launch/index.tsx
      ├─ open-canvas.config.ts
      └─ package.json
```

> 设计原则：用户工程**只有 `boards/` 目录**和一个可选 config，Vite/React/tsconfig 全部下沉到 `@open-canvas/core`，让 agent 与人都只面对内容、不面对工具链。

---

## 四、公共 API

### 4.1 定义一块白板

```tsx
// boards/getting-started/index.tsx
import { defineBoard, defineSection } from '@open-canvas/core'

export default defineBoard({
  meta: {
    title: 'Getting Started',
    emoji: '🎨',
    background: { kind: 'dot-grid', color: '#e5e7eb' },
  },
  sections: [
    defineSection({
      id: 'intro',
      frame: { x: 0, y: 0, w: 1280, h: 720 },
      render: () => (
        <div className="h-full w-full bg-white p-16">
          <h1 className="text-7xl font-bold">Hello Canvas</h1>
        </div>
      ),
    }),
    defineSection({
      id: 'arch',
      frame: { x: 1400, y: 0, w: 1600, h: 900 },
      render: () => <Architecture />,
    }),
  ],
  // 演示序列；省略则按 sections 顺序
  presentOrder: ['intro', 'arch'],
})
```

### 4.2 类型定义（节选）

```ts
export interface Frame {
  x: number; y: number; w: number; h: number
  rotation?: number   // 可选，预留
}

export interface Section {
  id: string                              // kebab-case，作 Inspector 锚
  frame: Frame
  render: () => React.ReactNode
  notes?: string                          // 演讲者备注
  background?: SectionBackground
}

export interface BoardModule {
  meta: BoardMeta
  sections: Section[]
  presentOrder?: string[]
}
```

> **硬约束**：`id` 必须 kebab-case 且在 board 内唯一；这是 Inspector 反向定位与 PDF 锚点的依据。

---

## 五、关键模块实现要点

### 5.1 无限画布（canvas/usePanZoom）

- **世界坐标 ↔ 屏幕坐标** 通过单一 `Viewport { x, y, zoom }` 状态管理。
- 渲染层结构：
  ```html
  <div class="oc-screen">                   <!-- overflow:hidden, 占满视口 -->
    <div class="oc-world"                   <!-- transform: translate(x,y) scale(z) -->
         style="transform-origin:0 0">
      <SectionShell frame=...>...</SectionShell>
      ...
    </div>
    <MiniMap />                              <!-- 右下角小地图 -->
  </div>
  ```
- 交互：
  - 滚轮 = 缩放（按光标为中心）
  - 空格+拖拽 / 触控板双指 = 平移
  - `f` 聚焦当前 section（`fitFrame`）
  - `1` 重置 100%、`0` fit-all
- **不使用 canvas 元素**：所有 Section 仍是真实 DOM，确保 Inspector、辅助技术、文本选中、可交互组件都开箱可用。

### 5.2 Vite 插件 — 自动发现 + 虚拟模块

```ts
// virtual:open-canvas/boards
export default {
  'getting-started': () => import('/boards/getting-started/index.tsx'),
  'product-launch':  () => import('/boards/product-launch/index.tsx'),
}
```

- 启动时 `fast-glob` 扫描 `boards/*/index.{tsx,jsx,ts,js}`。
- `chokidar` 监听增/删/改 → `server.moduleGraph.invalidateModule` → HMR。
- **额外**：编译期注入 `data-oc-loc="boards/foo/index.tsx:42:8"` 到每个 JSX 元素（轻量 transform 插件），把渲染后的 DOM 节点反查到源码行列——这是 Inspector 评论闭环的关键基础。

### 5.3 演示模式（PresentMode）

进入条件：URL `/<board>/present` 或快捷键 `P`。

- 按 `presentOrder`（缺省按 sections 顺序）逐 Section 播放。
- 每一步：用 `fitFrame(section.frame, viewport)` 计算目标 `Viewport`，做 `requestAnimationFrame` 缓动过渡（`cubic-bezier(.22,1,.36,1)`）。
- 键盘：`→/Space/PgDn` 下一步，`←/PgUp` 上一步，`Home/End` 首末，`Esc` 退出，`B` 黑屏，`,` `.` 演讲者视图。
- **演讲者视图**（双显示器 / `Cmd+Shift+P`）：左 = 当前 section + 备注 + 计时器，右 = 下一 section 缩略。

### 5.4 Inspector — 点击 DOM 写回源码

工作流程分四步：

1. 编译期注入 `data-oc-loc="<file>:<line>:<col>"`（仅 dev / `--inspector` build）。
2. 运行时按 `Cmd/Ctrl+I` 进入 Inspector，鼠标悬停高亮，点击弹出输入框。
3. 提交后通过 `POST /__open-canvas__/comments` 把：

   ```tsx
   // @canvas-comment[id=cmt_01HXY]: 把标题改成红色
   <h1 className="text-7xl font-bold">Hello Canvas</h1>
   ```

   注入到对应 `data-oc-loc` 上一行。
4. agent 调用 `/apply-comments` skill：
   - 读取 `boards/**/*.tsx` 中所有 `@canvas-comment` 标记
   - 解析 `id` + 评论文本 + 紧邻代码上下文
   - 应用修改，**修改成功后删除标记**（关闭闭环）

### 5.5 PDF 导出

```bash
open-canvas export pdf <board-id> --out deck.pdf [--page 1920x1080]
```

实现：
1. `open-canvas build` 生成静态站点。
2. 启动 Playwright（`@open-canvas/core` 把 `playwright-core` + chromium 列为 *peer optional*，按需 `npx playwright install chromium`）。
3. 对 `presentOrder` 中每个 section：
   - 跳转 `/{board}/present?step={i}&print=1`
   - `print=1` 模式禁用动画、设为目标 `frame` 的 1:1 渲染
   - 调用 `page.pdf({ width, height, printBackground: true })`
4. 用 `pdf-lib` 合并 → 输出。

> 选 Playwright 而非 `@react-pdf/renderer`：Section 是任意 React（含 Canvas/SVG/动画），只有真实浏览器能保真。

### 5.6 PPT/分区 数据流

```
boards/foo/index.tsx
   │ defineBoard({ sections, presentOrder })
   ▼
@open-canvas/core/runtime
   │ ──> BoardViewer       (自由漫游)
   │ ──> PresentMode       (按 presentOrder 顺序)
   └─> exportPdf()         (对每个 step 截图)
```

---

## 六、CLI 设计

### 6.1 脚手架（`@open-canvas/cli`）

```bash
npx @open-canvas/cli init my-board
# 选项
#   --name <pkg-name>     覆盖 package.json name
#   --force               目录非空也强制写入
#   --template minimal|gallery   起始模板
```

`init` 行为：
1. 复制 `template/` → 目标目录。
2. 渲染 `package.json.tmpl`（依赖：`@open-canvas/core`，scripts: `dev/build/preview/export`）。
3. 写入 `.claude/skills/` 与 `.agents/skills/`（同源软链接，兼容 Claude Code / Codex / Cursor）。
4. 输出 next steps：`cd my-board && pnpm i && pnpm dev`。

### 6.2 运行时 CLI（`@open-canvas/core` 的 bin）

```
open-canvas dev                    # Vite dev server (默认 5173)
open-canvas build [--out dist]     # 静态构建
open-canvas preview                # 预览生产构建
open-canvas export pdf <board>     # 导出 PDF
open-canvas export html            # 同 build，alias
```

> 关键诉求：**用户工程不见 Vite 配置**。所有命令都包在 `@open-canvas/core/bin.js` 里，让作者只关心 `boards/` 内容。

---

## 七、Agent 集成（Skills）

预置 5 个 Skill，覆盖 *创作 → 修改 → 应用反馈* 全流程：

| Skill | 触发场景 | 关键行为 |
|-------|---------|---------|
| `create-board` | "帮我做一块讲 X 的白板" | 询问主题 / 节数 / 演示风格 / 是否要分区导航；规划 sections + frame 布局；生成 `boards/<id>/index.tsx` |
| `add-section` | "再加一节讲架构" | 在已有 board 中追加 Section，自动找空位（不与现有 frame 重叠）|
| `arrange-layout` | "把它们排成一行 / 网格 / 时间线" | 重新计算所有 section 的 frame；保持 id 不变 |
| `apply-comments` | 用户在 Inspector 留了评论 | 扫描 `@canvas-comment` → 修改 → 删除标记 |
| `board-authoring` | 编程参考（被动加载） | 画布坐标系、推荐尺寸（标题 1280×720 / 内容 1600×900 / 全景 2400×1350）、字号比例、配色、Section 间距规范 |

每个 SKILL.md 内置 *硬约束*：

```
- 永远使用 defineBoard / defineSection；禁止裸导出
- Section frame 之间至少留 200px 间距，避免视觉粘连
- 不要超过 12 个 section / board，超出请拆 board
- 禁止在 render 里读 window；副作用放进自己的 useEffect
```

---

## 八、关键设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 画布尺寸 | **每 Section 自定义** | 白板的本质是异质内容并存——封面、长文、宽幅图表、代码清单各有最佳尺寸 |
| 渲染层 | **真实 DOM**（不用 `<canvas>`） | 保留 Inspector / a11y / 文本选中 / 可交互组件 |
| 演示形态 | **缓动相机切到下一分区** | 视觉上是连续白板，体验上是 PPT；保持空间感 |
| 导出 | 静态站点 **+ PDF** | 满足"导出 PDF"硬需求；静态产物可部署任意 CDN |
| 反馈通道 | 注入 `@canvas-comment` 源码注释 | 反馈与代码同进出版本控制，永不丢失，便于 agent 批量消费 |
| 配置入口 | `boardsDir` / `port` / `inspector` | 极简且类型化，避免发明 DSL |

---

## 九、Roadmap（v0.1 → v0.3）

- **v0.1（MVP）**：core 运行时（无限画布/演示/Inspector）+ cli 脚手架 + skills + PDF 导出
- **v0.2**：协作只读分享链接、Section 模板库、svgl logo 集成
- **v0.3**：MCP server（让远端 agent 通过 MCP 直接增删 section）、布局求解器（避免重叠）

---

下一节将给出 **可直接 `pnpm install && pnpm dev` 运行** 的最小可用代码骨架。
