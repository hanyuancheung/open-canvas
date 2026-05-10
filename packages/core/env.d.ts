/// <reference types="vite/client" />

declare module 'virtual:open-canvas/boards' {
  import type { BoardModule } from '@open-canvas/core'
  const boards: Record<string, () => Promise<{ default: BoardModule }>>
  export default boards
}

declare module 'virtual:open-canvas/config' {
  import type { ResolvedConfig } from '@open-canvas/core'
  const config: ResolvedConfig
  export default config
}
