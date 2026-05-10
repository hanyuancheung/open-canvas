# CLAUDE.md — Hard rules for Claude Code in open-canvas

> Claude Code 在本仓库工作时，必须遵守 [`AGENTS.md`](./AGENTS.md) 中的全部规则。本文件只列出 *Claude Code 特有* 的行为约束。

## Skills 优先

仓库内 `apps/demo/.claude/skills/` 与 `packages/cli/template/.claude/skills/` 中已经预置：

- `create-board` — 端到端起草白板
- `add-section` — 追加 Section
- `arrange-layout` — 重排布局
- `apply-comments` — 处理 Inspector 评论
- `board-authoring` — 创作规范（被动加载）

**遇到任意一个上述任务前，先 `Read` 对应 SKILL.md，再开始动手。**

## 工具使用约束

- **永远先 `Read` 再 `Edit`**：`packages/core/src/runtime/` 经常调整，对它的修改前必须先读到当前内容。
- **不要新增依赖到 `@open-canvas/core` 的 `dependencies`** 而不在 PR 描述里解释为什么平台 API 解决不了。
- **改了 `packages/core` 或 `packages/cli`** → 在同一轮里运行 `pnpm changeset` 并提交。
- **批量改动**：跨文件重构时优先用 `mcp__codebase-search` 或 `Grep`，不要让用户挨个文件提示。

## 跟 Inspector 评论交互的标准流程

1. 用户在浏览器 `Cmd+I` 模式下点击元素并提交评论。
2. 源码中出现 `// @canvas-comment[id=…]: …` 标记。
3. 你被请求执行 `apply-comments`：
   - `Grep` 整个 `boards/**/*.tsx` 找出所有 `@canvas-comment`
   - 解析 `id` + 紧邻下一行的 JSX
   - 应用修改
   - **删除该 `@canvas-comment` 标记**（关闭闭环——这一步遗漏会让评论永远残留）
4. 不要把多个评论的修改塞进一次"大重构"——逐条处理，commit message 引用评论 id。

## 输出风格

- 直接、简短，不寒暄。
- 报告改动时按 *修改了什么 / 为什么 / 影响范围* 三段式。
- 文件引用用反引号包路径：`packages/core/src/canvas/usePanZoom.ts`。
