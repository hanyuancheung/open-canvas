import kleur from 'kleur'
import { preview } from 'vite'
import { createViteConfig } from '../vite/index.js'
import { loadUserConfig } from './dev.js'

export async function runPreview(root: string) {
  const user = await loadUserConfig(root)
  const config = createViteConfig({ root, user, mode: 'preview' })
  const server = await preview(config)
  server.printUrls()
  console.log(kleur.gray('  Preview running. Press Ctrl+C to stop.'))
}
