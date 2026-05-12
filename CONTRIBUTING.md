# Contributing to open-canvas

## PR Format

Every pull request must include these sections:

```
## Background
Why this change? What problem does it solve?

## Changes
What you did — file by file or logical grouping.

## Design Decisions
Key trade-offs, alternatives considered, why this approach.

## Setup / Migration (optional)
Any manual steps needed after merge (secrets, config, env).
```

- Write in English.
- Background explains the *why*, not the *what*.
- Design Decisions is where you justify non-obvious choices.

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add minimap toggle
fix: correct pan offset on resize
ci: automated release pipeline
docs: update contributing guide
refactor: extract layout helpers
```

Subject line ≤ 50 chars. Body only when "why" isn't obvious from the subject.

## Release

- PR that changes `packages/core` or `packages/cli` → add `release:patch` label.
- On merge, CI bumps both packages (lockstep), tags, publishes to npm.
- `release:minor` / `release:major` available when needed; default to patch.
- Never manually edit version numbers.

## Code

- `pnpm check` (Biome) must pass before commit.
- Don't add dependencies to `@open-canvas/core` without justification — it ships to end users.
- Don't touch `packages/core/src/runtime/components/ui/` (auto-generated).
- Public API goes through `@open-canvas/core` barrel export (`src/index.ts`).

## For AI Agents

See [`AGENTS.md`](./AGENTS.md) for machine-specific rules (skill routing, invariants, comment handling).
