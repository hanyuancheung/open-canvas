import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import kleur from 'kleur'
import { createServer } from 'vite'
import { createViteConfig } from '../vite/index.js'
import type { UserConfig } from '../types.js'

export async function runDev(root: string) {
  const user = await loadUserConfig(root)
  await ensureIndexHtml(root)
  const config = createViteConfig({ root, user, mode: 'dev' })
  const server = await createServer(config)
  await server.listen()

  const port = server.config.server.port
  const host = server.config.server.host === true ? 'localhost' : server.config.server.host
  console.log()
  console.log(kleur.bold().green('  ⌬  open-canvas'))
  console.log(`     ${kleur.gray('Local: ')}${kleur.cyan(`http://${host}:${port}/`)}`)
  console.log(`     ${kleur.gray('Press P in any board to present, ⌘I for Inspector.')}`)
  console.log()
}

export async function loadUserConfig(root: string): Promise<UserConfig> {
  for (const name of ['open-canvas.config.ts', 'open-canvas.config.js', 'open-canvas.config.mjs']) {
    const p = path.join(root, name)
    if (!existsSync(p)) continue
    try {
      // 用 Vite 自带的 esbuild 即时加载会更稳；这里走简化路径，使用动态 import 配合时间戳避免缓存
      const url = `${path.resolve(p)}?t=${Date.now()}`
      const mod = (await import(/* @vite-ignore */ url)) as { default?: UserConfig }
      return mod.default ?? {}
    } catch (e) {
      console.error(kleur.yellow(`Failed to load ${name}: ${(e as Error).message}`))
      return {}
    }
  }
  return {}
}

/** 模板必须有 index.html；用户工程零配置：若没有就帮他生成一个最小的。 */
export async function ensureIndexHtml(root: string) {
  const p = path.join(root, 'index.html')
  if (existsSync(p)) return
  const corePkgRoot = path.resolve(fileURLToPath(import.meta.url), '../../..')
  const tpl = path.join(corePkgRoot, 'client.html')
  if (existsSync(tpl)) {
    await fs.copyFile(tpl, p)
    return
  }
  await fs.writeFile(p, DEFAULT_INDEX_HTML, 'utf8')
}

const DEFAULT_INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>open-canvas</title>
  </head>
  <body>
    <div id="oc-root"></div>
    <script type="module">
      import { mount } from '@open-canvas/core/runtime'
      mount(document.getElementById('oc-root'))
    </script>
  </body>
</html>
`
