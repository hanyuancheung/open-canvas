#!/usr/bin/env node

/**
 * Release script — bump both packages to same version, commit, tag, push.
 *
 * Usage:
 *   node scripts/release.mjs patch|minor|major [--dry-run]
 *
 * CI will handle npm publish when it sees the tag push.
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// --- Args ---
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const bump = args.find((a) => ['patch', 'minor', 'major'].includes(a))

if (!bump) {
  console.error('Usage: node scripts/release.mjs <patch|minor|major> [--dry-run]')
  process.exit(1)
}

// --- Helpers ---
function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`)
  if (dryRun && opts.write) {
    console.log('  [dry-run] skipped')
    return ''
  }
  return execSync(cmd, { cwd: root, encoding: 'utf-8', stdio: 'pipe', ...opts }).trim()
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number)
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    case 'patch':
      return `${major}.${minor}.${patch + 1}`
  }
}

// --- Preflight checks ---
const branch = run('git rev-parse --abbrev-ref HEAD')
if (branch !== 'main') {
  console.error(`Error: must be on main branch (currently on "${branch}")`)
  process.exit(1)
}

const status = run('git status --porcelain')
if (status) {
  console.error('Error: working directory not clean')
  console.error(status)
  process.exit(1)
}

// Pull latest
run('git pull --rebase', { write: true })

// --- Bump versions ---
const corePkgPath = resolve(root, 'packages/core/package.json')
const cliPkgPath = resolve(root, 'packages/cli/package.json')

const corePkg = readJson(corePkgPath)
const cliPkg = readJson(cliPkgPath)

// Use core version as source of truth
const currentVersion = corePkg.version
const newVersion = bumpVersion(currentVersion, bump)

console.log(`\nBumping: ${currentVersion} → ${newVersion} (${bump})\n`)

corePkg.version = newVersion
cliPkg.version = newVersion

if (!dryRun) {
  writeJson(corePkgPath, corePkg)
  writeJson(cliPkgPath, cliPkg)
}

// --- Update lockfile ---
run('pnpm install --lockfile-only', { write: true })

// --- Git commit + tag ---
run('git add packages/core/package.json packages/cli/package.json pnpm-lock.yaml', { write: true })
run(`git commit -m "release: v${newVersion}"`, { write: true })
run(`git tag v${newVersion}`, { write: true })

// --- Push ---
run('git push --follow-tags', { write: true })

console.log(`\n✓ Released v${newVersion}`)
console.log('  CI will publish to npm when it detects the tag.')
