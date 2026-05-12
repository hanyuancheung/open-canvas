# Repository Guidelines for AI Agents

本文档是 **open-canvas** 项目对所有 coding agent（Claude Code、Codex、Cursor、Copilot、…）的硬性规则。通用协作规范见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)，本文件补充 agent 专属约束。

## Hard Rules

1. **Biome 必须通过** — 提交前运行 `pnpm check`（或 `pnpm check:fix`），CI 与 reviewer 都要求干净的树。
2. **改动 `packages/core` 或 `packages/cli` 后，PR 打 `release:patch` label** — merge 后 CI 自动 bump 版本、打 tag、发布 npm。`apps/demo` 与根级工具不需要。必要时可用 `release:minor` 或 `release:major`。
3. **不要手改版本号** — 由 CI（version.yml）统一处理，两包锁步同版本。
4. **`@open-canvas/core` 是发给用户的运行时，慎加依赖** — 每个新依赖都会膨胀 `npx init` 后的安装体积；优先用平台 API 或 dev-only 依赖。
5. **不要动 `packages/core/src/runtime/components/ui/`** — shadcn 自动生成、Biome 已忽略。
6. **默认不写注释** — 只在 WHY 非显而易见时写：隐藏约束、微妙不变量、特定 bug 的 workaround、令人意外的行为。不要：
   - 解释 WHAT（命名好的标识符已表达）
   - 引用 PR/调用者（"added for X"、"used by Y"）
   - 分隔横幅（`// ── Section ──`）或模块头描述
   - 注释掉的代码
   判断标准：删掉这条注释会不会让未来读者困惑？不会就别写。
7. **公共 API 严格走 `@open-canvas/core` 桶导出** — `defineBoard`、`defineSection`、`Section`、`BoardModule`、`Frame`。新增能力先在 `src/index.ts` 暴露，并在 DESIGN.md 同步说明。
8. **白板内容相关的创作指南** — 见 `.claude/skills/board-authoring/`，agent 写代码前先读它。

## 任务 → Skill 路由

| 用户意图 | 选用 skill |
|---------|-----------|
| "做一块讲 X 的白板"、"新建白板" | `create-board` |
| "加一节讲 Y" | `add-section` |
| "排成一行 / 网格 / 按时间线" | `arrange-layout` |
| 用户在 Inspector 留了评论 | `apply-comments` |
| 写代码前需要规范参考 | 被动加载 `board-authoring` |

## 不变量

- `Section.id` 是 kebab-case，board 内唯一。修改 id 等同于破坏性变更（Inspector 锚、PDF 锚都会断）。
- 相邻 `Section.frame` 之间至少 200px 间距。
- 单 board 不超过 12 个 section；超出请拆 board，并由 `create-board` 引导。
- 任何 `render` 里都不准读 `window` / `document`；副作用放进自己的 `useEffect`。
- 注入到源码的 `@canvas-comment` 标签是临时态——`apply-comments` 完成修改后**必须删除**。
