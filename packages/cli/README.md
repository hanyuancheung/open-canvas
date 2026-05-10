# @open-canvas/cli

> Scaffolder for [open-canvas](../../README.md) workspaces.

```bash
npx @open-canvas/cli init my-board
cd my-board
pnpm install
pnpm dev
```

Options:

| Flag | Purpose |
|------|--------|
| `--name <name>` | Override the generated `package.json` name |
| `--force` | Continue even if the target directory is not empty |
| `--template <name>` | Starter template (default `minimal`) |

## What `init` does

1. Copies `template/` → target directory.
2. Renders `package.json` with the requested name.
3. Drops in `.claude/skills/`, `.agents/skills/`, `CLAUDE.md`, `AGENTS.md` so any coding agent immediately knows the workspace conventions.
4. Hands control to `@open-canvas/core` for `dev / build / preview / export pdf`.
