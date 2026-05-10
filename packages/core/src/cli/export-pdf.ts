import path from 'node:path'
import fs from 'node:fs/promises'
import http from 'node:http'
import kleur from 'kleur'
import { preview } from 'vite'
import { createViteConfig } from '../vite/index.js'
import { loadUserConfig } from './dev.js'
import { runBuild } from './build.js'

interface ExportOpts {
  root: string
  board: string
  out: string
  /** "WxH" e.g. 1920x1080 */
  page: string
}

/**
 * 用 playwright-core 驱动无头浏览器，把演示模式的每个 step 截成单页 PDF，再用 pdf-lib 合并。
 *
 * `playwright-core` 与 `pdf-lib` 是 optionalDependencies——平时安装时不强制；
 * 第一次执行 export pdf 时友好引导用户安装。
 */
export async function exportPdf(opts: ExportOpts) {
  const playwright = await tryImport('playwright-core', 'export pdf needs `playwright-core` and a chromium binary. Run:\n  pnpm add -D playwright-core\n  npx playwright install chromium')
  const pdfLib = await tryImport('pdf-lib', 'export pdf needs `pdf-lib`. Run:\n  pnpm add -D pdf-lib')

  const [wStr, hStr] = opts.page.split('x')
  const pageW = Number(wStr) || 1920
  const pageH = Number(hStr) || 1080

  const distDir = path.join(opts.root, '.open-canvas-export')
  await runBuild(opts.root, distDir)

  // 启动一个本地 preview 服务器，仅用于截图
  const user = await loadUserConfig(opts.root)
  const cfg = createViteConfig({ root: opts.root, user, mode: 'preview' })
  if (cfg.build) cfg.build.outDir = distDir
  cfg.preview = { ...(cfg.preview ?? {}), port: 0 }
  const server = await preview(cfg)
  const url = server.resolvedUrls?.local?.[0] ?? 'http://localhost:4173/'

  console.log(kleur.gray(`  preview: ${url}`))

  const browser = await playwright.chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: pageW, height: pageH } })
  const page = await ctx.newPage()
  // 先发现一共有多少个 step：访问 step=0 后注入脚本读取数量
  await page.goto(`${url.replace(/\/$/, '')}/#/${opts.board}/present?step=0&print=1`)
  await page.waitForFunction(() => document.querySelector('.oc-print') !== null, { timeout: 10_000 })
  const total = await page.evaluate(() => {
    // PresentMode 在 .oc-present__bar 里渲染 "i / N"，但 print 模式没渲染——通过 hash 推断不可行
    // 改为读取 board.sections 数量：把全局 __OC_SECTION_COUNT__ 暴露到 window
    return (window as unknown as { __OC_SECTION_COUNT__?: number }).__OC_SECTION_COUNT__ ?? 1
  })

  // 兜底：从 .oc-world 子元素数量数
  const fallback = await page.evaluate(() => document.querySelectorAll('.oc-world > [data-oc-section-id]').length)
  const stepCount = Math.max(1, total || fallback || 1)

  const merged = await pdfLib.PDFDocument.create()
  for (let i = 0; i < stepCount; i++) {
    await page.goto(`${url.replace(/\/$/, '')}/#/${opts.board}/present?step=${i}&print=1`)
    await page.waitForTimeout(150)
    const buf = await page.pdf({
      width: `${pageW}px`,
      height: `${pageH}px`,
      printBackground: true,
      pageRanges: '1',
    })
    const child = await pdfLib.PDFDocument.load(buf)
    const [copied] = await merged.copyPages(child, [0])
    if (copied) merged.addPage(copied)
  }
  const out = path.resolve(opts.root, opts.out)
  await fs.writeFile(out, await merged.save())
  console.log(kleur.green(`✓ exported ${stepCount} pages → ${out}`))

  await browser.close()
  await server.httpServer?.close()
  await closeServer(server.httpServer as http.Server | null)
}

async function tryImport<T = any>(name: string, hint: string): Promise<T> {
  try {
    return (await import(/* @vite-ignore */ name)) as T
  } catch {
    console.error(kleur.red(`Missing optional dependency "${name}".`))
    console.error(hint)
    process.exit(1)
  }
}

function closeServer(s: http.Server | null) {
  if (!s) return Promise.resolve()
  return new Promise<void>((resolve) => s.close(() => resolve()))
}
