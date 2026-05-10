import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cac } from 'cac'
import kleur from 'kleur'

const cli = cac('open-canvas')

cli.command('dev', 'Start the open-canvas dev server').action(async () => {
  const { runDev } = await import('./dev.js')
  await runDev(process.cwd())
})

cli
  .command('build', 'Build the static site')
  .option('--out <dir>', 'Output directory', { default: 'dist' })
  .action(async (opts: { out: string }) => {
    const { runBuild } = await import('./build.js')
    await runBuild(process.cwd(), opts.out)
  })

cli.command('preview', 'Preview the production build').action(async () => {
  const { runPreview } = await import('./preview.js')
  await runPreview(process.cwd())
})

cli
  .command('export pdf <board>', 'Export a board to PDF')
  .option('--out <file>', 'Output PDF path', { default: 'board.pdf' })
  .option('--page <WxH>', 'Page size (e.g. 1920x1080)', { default: '1920x1080' })
  .action(async (board: string, opts: { out: string; page: string }) => {
    const { exportPdf } = await import('./export-pdf.js')
    await exportPdf({ root: process.cwd(), board, out: opts.out, page: opts.page })
  })

cli.help()
cli.version(await readVersion())

cli.parse()

async function readVersion(): Promise<string> {
  try {
    const p = path.resolve(fileURLToPath(import.meta.url), '../../../package.json')
    if (!existsSync(p)) return '0.0.0'
    const pkg = JSON.parse(await fs.readFile(p, 'utf8')) as { version?: string }
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export {}
export const _kleur = kleur // 引用以避免未使用警告，方便子命令使用
