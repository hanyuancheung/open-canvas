# @open-canvas/core

Runtime, Vite plugin and CLI for [open-canvas](../../README.md) — a whiteboard framework built for AI coding agents.

## What it provides

- **Runtime** — infinite canvas viewer, sectioned PPT-style present mode, in-browser Inspector, mini-map.
- **Vite plugin** — auto-discovers `boards/<id>/index.{tsx,jsx,ts,js}`, exposes them as `virtual:open-canvas/boards`, hot-reloads on add/remove. Optionally injects `data-oc-loc` attributes for the Inspector.
- **CLI** — `open-canvas dev | build | preview | export pdf <board>`.

## Public API

```ts
import { defineBoard, defineSection, defineConfig } from '@open-canvas/core'
```

The runtime mounts itself via:

```ts
import { mount } from '@open-canvas/core/runtime'
mount(document.getElementById('oc-root'))
```

End users normally don't import these directly — `@open-canvas/cli init` generates a minimal workspace and the bin commands wrap everything.
