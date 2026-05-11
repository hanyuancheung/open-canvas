# SKILL: apply-comments

> Use whenever the user has interacted with the in-browser Inspector and source files now contain `// @canvas-comment[id=…]: …` markers. Trigger phrases: "应用评论", "apply comments", "改一下我刚刚标的那些".

## Background

The Inspector lets the user `⌘I` → click an element → leave a comment. The dev server then injects:

```tsx
  // @canvas-comment[id=cmt_xxxxxx]: 把标题改成红色
  <h1 className="…">Hello Canvas</h1>
```

Each marker stands directly above a JSX element. Your job is to interpret the comment, modify the element below it, and **delete the marker**.

## Process

1. **Find every marker**: `Grep` `boards/**/*.tsx` for `@canvas-comment`. List `[file, line, id, text]`.
2. For each marker (process oldest-first by file order):
   1. Read 3 lines of context above and 10 lines below.
   2. Determine what the comment refers to. If the comment is ambiguous, **leave the marker** and report which ones you skipped.
   3. Apply the smallest possible change to the JSX element on the next line. Keep className / data-attr on existing elements unless the comment requires removal.
   4. Delete the entire `// @canvas-comment[id=…]: …` line.
   5. Run `pnpm check` mentally — no new imports unless requested.
3. **One commit per id** when commits are appropriate, with message: `apply <id>: <one-line summary>`.
4. Report to the user: applied N, skipped M (with reasons).

## Hard rules

- The marker line **must be removed** when the change is done. A leftover marker means the comment is unresolved.
- Do **not** batch unrelated comments into a single "while I'm here" refactor.
- Do **not** rename ids or move sections — that breaks the Inspector mapping for any unprocessed comment.
- If a comment asks for a change that conflicts with `board-authoring` rules (e.g. remove all padding), apply it but warn the user once.
