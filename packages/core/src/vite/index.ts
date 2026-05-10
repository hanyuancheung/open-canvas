import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import type { InlineConfig } from 'vite'
import { commentsApiPlugin } from './comments-api'
import { inspectorTagPlugin } from './inspector-tag'
import { openCanvasPlugin } from './plugin'
import type { UserConfig } from '../types'

export { openCanvasPlugin } from './plugin'
export { inspectorTagPlugin } from './inspector-tag'
export { commentsApiPlugin } from './comments-api'

/**
 * 一站式 Vite 配置工厂。CLI 与用户工程都通过它构建运行时。
 */
export function createViteConfig(opts: {
  root: string
  user?: UserConfig
  mode: 'dev' | 'build' | 'preview'
}): InlineConfig {
  const inspector = opts.user?.inspector ?? opts.mode !== 'build'
  const boardsDir = opts.user?.boardsDir ?? 'boards'
  const corePkgRoot = path.resolve(fileURLToPath(import.meta.url), '../../..')

  return {
    root: opts.root,
    configFile: false,
    publicDir: path.join(opts.root, 'public'),
    resolve: {
      alias: {
        // 让用户的 boards/*.tsx 可以 `import { defineBoard } from '@open-canvas/core'`
        // 通过 nodeModules 自然解析，这里只做兜底。
      },
    },
    plugins: [
      react(),
      openCanvasPlugin({ ...(opts.user ?? {}), root: opts.root, inspector, boardsDir }),
      inspector ? inspectorTagPlugin({ root: opts.root, boardsDir }) : null,
      opts.mode === 'dev' ? commentsApiPlugin({ root: opts.root }) : null,
    ].filter(Boolean) as InlineConfig['plugins'],
    server: {
      port: opts.user?.port ?? 5173,
      host: true,
      fs: {
        // 允许从 monorepo 上层加载 @open-canvas/core 源码（dev 模式 link 时常用）
        allow: [opts.root, corePkgRoot],
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2022',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client'],
      // The runtime imports virtual modules (`virtual:open-canvas/boards` etc.) that
      // only Vite's plugin pipeline can resolve. If esbuild's dep prebundling tries
      // to crawl runtime/index.js it errors out. Skip it entirely.
      exclude: ['@open-canvas/core', '@open-canvas/core/runtime', '@open-canvas/core/vite'],
    },
    ssr: {
      noExternal: ['@open-canvas/core'],
    },
  }
}
