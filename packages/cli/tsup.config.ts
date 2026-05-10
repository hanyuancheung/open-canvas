import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: false,
  platform: 'node',
  target: 'node18',
})
