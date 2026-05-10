import kleur from 'kleur'
import { build } from 'vite'
import { createViteConfig } from '../vite/index.js'
import { ensureIndexHtml, loadUserConfig } from './dev.js'

export async function runBuild(root: string, outDir: string) {
  const user = await loadUserConfig(root)
  await ensureIndexHtml(root)
  const config = createViteConfig({ root, user, mode: 'build' })
  if (config.build) config.build.outDir = outDir
  await build(config)
  console.log(kleur.green(`✓ built → ${outDir}`))
}
