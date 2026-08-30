#!/usr/bin/env node
/**
 * Overlay sync: copy this repo's packages/* into a DSH checkout so the
 * plugins can be built and tested inside the DSH workspace.
 *
 * Usage:
 *   node scripts/integrate.mjs --checkout <path-to-dsh-checkout> [--dry-run]
 *
 * The checkout must already be a valid DeepSeek Harness source tree
 * (pnpm install runs there, not here). global-proxy is not copied: it is a
 * standalone host plugin installed via link/profile/injector.
 */

import { cpSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

/** monorepo package dir -> DSH checkout relative destination */
const MAPPING = {
  'gameassist-knowledge': 'packages/companion/gameassist-knowledge',
  'gameassist-memory': 'packages/companion/gameassist-memory',
  'gameassist-roster': 'packages/companion/gameassist-roster',
  'client-game-assistant': 'packages/client/game-assistant',
  'client-gameassist-knowledge': 'packages/client/gameassist-knowledge',
}

function parseArgs(argv) {
  const args = { checkout: null, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--checkout') args.checkout = argv[++i]
    else if (argv[i] === '--dry-run') args.dryRun = true
  }
  return args
}

function filter(src) {
  const base = src.split(/[\\/]/).pop()
  return base !== 'node_modules' && base !== '.git'
}

const args = parseArgs(process.argv.slice(2))
if (!args.checkout) {
  console.error('usage: node scripts/integrate.mjs --checkout <path> [--dry-run]')
  process.exit(1)
}

const repo = resolve(import.meta.dirname, '..')
const checkout = resolve(args.checkout)
if (!existsSync(join(checkout, 'package.json'))) {
  console.error(`not a DSH checkout (no package.json): ${checkout}`)
  process.exit(1)
}

const entries = Object.entries(MAPPING)
for (const [srcDir, destRel] of entries) {
  const src = join(repo, 'packages', srcDir)
  const dest = join(checkout, destRel)
  if (!existsSync(src)) {
    console.warn(`skip (missing in repo): ${srcDir}`)
    continue
  }
  console.log(`${args.dryRun ? '[dry-run] would copy' : 'copy'} ${srcDir} -> ${destRel}`)
  if (!args.dryRun) {
    cpSync(src, dest, { recursive: true, filter })
  }
}

if (args.dryRun) {
  console.log(`\n${entries.length} package(s) would be synced into ${checkout}`)
} else {
  console.log(`\nsynced ${entries.length} package(s) into ${checkout}`)
  console.log('next: pnpm install && pnpm run build:lib:host && pnpm run build:lib:client')
  console.log('tests: pnpm exec vitest run packages/companion/gameassist-{knowledge,memory,roster}/tests packages/client/game-assistant/tests packages/client/gameassist-knowledge/tests')
}
