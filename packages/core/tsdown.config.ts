import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'vite/index': 'src/vite/index.ts',
    'runtime/index': 'src/runtime/index.tsx',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'vite', 'playwright-core', 'pdf-lib'],
  platform: 'node',
})
