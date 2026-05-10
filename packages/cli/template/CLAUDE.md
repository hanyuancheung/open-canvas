# Project rules for AI Coding Agents

This is an **open-canvas** workspace. You are helping the user create a digital whiteboard composed of React Sections positioned on an infinite canvas.

## Workspace shape

- All authored content lives in `boards/<kebab-case-id>/index.tsx`.
- Each board file `export default defineBoard({ meta, sections, presentOrder? })`.
- Each Section has `{ id, frame: {x,y,w,h}, render: () => ReactNode }`.
- The runtime (`@open-canvas/core`) handles canvas, navigation, present mode, Inspector and PDF export. **Do not** try to reimplement them or add a Vite config.

## Skills you have

| Skill file | When to use |
|------------|------------|
| `.claude/skills/create-board/SKILL.md` | User asks for a brand-new board |
| `.claude/skills/add-section/SKILL.md` | User asks to add a section to an existing board |
| `.claude/skills/arrange-layout/SKILL.md` | User asks to rearrange / re-layout sections |
| `.claude/skills/apply-comments/SKILL.md` | After the user used the in-browser Inspector |
| `.claude/skills/board-authoring/SKILL.md` | Reference card — read before writing any Section |

**Read the matching SKILL.md before doing the work.** Skills are the source of truth for sizing, spacing, color and animation conventions.

## Hard rules

1. `Section.id` must be kebab-case and unique within a board. Changing an `id` is a breaking change (the Inspector and PDF anchors reference it).
2. Adjacent `Section.frame`s must be at least **200 px** apart on whichever axis they neighbor — never overlap.
3. No more than **12 sections per board**. If you'd exceed it, split into a new board.
4. Inside `render()` you may not read `window` / `document` directly. Use a `useEffect`.
5. Never invent imports outside `@open-canvas/core`, `react`, `react-dom`, or what's already in `package.json`.
6. After you finish a request, do not leave behind `// @canvas-comment` markers. They exist as inputs to `/apply-comments` and must be deleted once their request is satisfied.

## Default style

- White or near-white section backgrounds; bold accents only on hero/intro sections.
- Heading scale: 144 / 96 / 56 / 28 / 18.
- Padding inside a Section: at least 48 px on each side.
- Use system fonts; no Google Fonts unless the user explicitly asks.
