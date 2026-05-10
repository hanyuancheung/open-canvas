import { defineConfig } from 'tsup'

const entry = {
  index: 'src/index.ts',
  'vite/index': 'src/vite/index.ts',
  'runtime/index': 'src/runtime/index.tsx',
  'cli/index': 'src/cli/index.ts',
}

export default defineConfig({
  entry,
  format: ['esm'],
  dts: { entry },
  clean: true,
  splitting: false,
  sourcemap: false,
  platform: 'node',
  target: 'node18',
  tsconfig: 'tsconfig.build.json',
  external: [
    'react',
    'react-dom',
    'vite',
    'playwright-core',
    'pdf-lib',
    'virtual:open-canvas/boards',
    'virtual:open-canvas/config',
  ],
  loader: { '.css': 'copy' },
})
