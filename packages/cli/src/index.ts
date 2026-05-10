import path from 'node:path'
import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cac } from 'cac'
import kleur from 'kleur'
import prompts from 'prompts'

const cli = cac('open-canvas-init')

cli
  .command('init [dir]', 'Scaffold a new open-canvas workspace')
  .option('--name <name>', 'Override the package name')
  .option('--force', 'Continue even if the target directory is not empty')
  .option('--template <template>', 'Starter template (minimal | gallery)', { default: 'minimal' })
  .action(async (dir: string | undefined, opts: { name?: string; force?: boolean; template: string }) => {
    await runInit({ dir, ...opts })
  })

cli.help()
cli.parse()

interface InitOpts {
  dir?: string
  name?: string
  force?: boolean
  template: string
}

async function runInit(opts: InitOpts) {
  const cwd = process.cwd()
  let target = opts.dir
  if (!target) {
    const ans = await prompts({
      type: 'text',
      name: 'dir',
      message: 'Project directory',
      initial: 'my-board',
    })
    target = (ans.dir as string | undefined) ?? 'my-board'
  }
  const absTarget = path.resolve(cwd, target)
  const pkgName = opts.name ?? path.basename(absTarget)

  if (existsSync(absTarget)) {
    const entries = await fs.readdir(absTarget)
    if (entries.length > 0 && !opts.force) {
      const confirm = await prompts({
        type: 'confirm',
        name: 'go',
        message: `${kleur.yellow(absTarget)} is not empty. Continue?`,
        initial: false,
      })
      if (!confirm.go) {
        console.log(kleur.gray('Aborted.'))
        process.exit(0)
      }
    }
  } else {
    await fs.mkdir(absTarget, { recursive: true })
  }

  const templateRoot = await resolveTemplateRoot(opts.template)
  await copyDir(templateRoot, absTarget)
  await renderPackageJson(absTarget, pkgName)

  console.log()
  console.log(kleur.bold().green('  ✓  open-canvas workspace created'))
  console.log()
  console.log(`  ${kleur.gray('cd')} ${path.relative(cwd, absTarget) || '.'}`)
  console.log(`  ${kleur.gray('pnpm install')}    ${kleur.gray('# or npm/yarn')}`)
  console.log(`  ${kleur.gray('pnpm dev')}`)
  console.log()
  console.log(kleur.gray('  Tips:'))
  console.log(kleur.gray('    • Edit boards/getting-started/index.tsx'))
  console.log(kleur.gray('    • Press P in any board to present, ⌘I for Inspector.'))
  console.log(kleur.gray('    • Ask your agent: /create-board "a board about X"'))
  console.log()
}

async function resolveTemplateRoot(name: string): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url))
  // 包发布时 template/ 与 dist/ 同级 → 上一级
  const candidates = [
    path.resolve(here, '../template'),
    path.resolve(here, '../../template'),
  ]
  for (const c of candidates) {
    if (existsSync(c)) {
      // 子模板未来支持；现在 minimal 即模板根
      if (name === 'minimal') return c
      const sub = path.join(c, name)
      if (existsSync(sub)) return sub
      return c
    }
  }
  throw new Error(`Template "${name}" not found.`)
}

async function copyDir(src: string, dst: string) {
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const s = path.join(src, e.name)
    // package.json.tmpl → package.json，由 renderPackageJson 接管
    let name = e.name
    if (name === 'package.json.tmpl') continue
    if (name === '_gitignore') name = '.gitignore'
    const d = path.join(dst, name)
    if (e.isDirectory()) {
      await fs.mkdir(d, { recursive: true })
      await copyDir(s, d)
    } else {
      await fs.copyFile(s, d)
    }
  }
}

async function renderPackageJson(target: string, pkgName: string) {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const tmpl = [
    path.resolve(here, '../template/package.json.tmpl'),
    path.resolve(here, '../../template/package.json.tmpl'),
  ].find((p) => existsSync(p))
  if (!tmpl) return
  const raw = await fs.readFile(tmpl, 'utf8')
  const rendered = raw.replace(/__PKG_NAME__/g, pkgName)
  await fs.writeFile(path.join(target, 'package.json'), rendered, 'utf8')
}
