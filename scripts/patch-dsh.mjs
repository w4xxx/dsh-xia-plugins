#!/usr/bin/env node
/**
 * Idempotently patch a DSH checkout so the five host/client packages from
 * this repo are part of the official TypeScript build graph and the Web
 * bundle dependency list.
 *
 * The official DeepSeek Harness tree (pinned tag dsh-v0.1.2-alpha.1) has no
 * `packages/companion` plane, so mounting these packages requires the same
 * wiring the checkout overlay needs:
 *   - tsconfig.host.json:  4 project references (packages/companion/gameassist-*)
 *   - tsconfig.client.json: 2 project references (packages/client/*)
 *   - tsconfig.base.json:  8 explicit path mappings for @dsh-xia/dsh-*
 *   - web-app package.json: 6 workspace dependencies
 *
 * Usage: node scripts/patch-dsh.mjs --checkout <path> [--dry-run]
 *
 * Text-anchor based (JSONC-safe): never re-parses/serializes the official
 * config files, so their comments and formatting survive untouched.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SCOPE = '@dsh-xia'
const HOST_REFS = [
  'gameassist-knowledge',
  'gameassist-memory',
  'gameassist-roster',
].map((n) => ({ path: `./packages/companion/${n}` }))
const CLIENT_REFS = ['game-assistant', 'gameassist-knowledge'].map((n) => ({
  path: `./packages/client/${n}`,
}))
const BASE_PATHS = {
  '@dsh-xia/dsh-gameassist-knowledge': ['./packages/companion/gameassist-knowledge/src/index.ts'],
  '@dsh-xia/dsh-gameassist-memory': ['./packages/companion/gameassist-memory/src/index.ts'],
  '@dsh-xia/dsh-gameassist-roster': ['./packages/companion/gameassist-roster/src/index.ts'],
  '@dsh-xia/dsh-client-game-assistant': ['./packages/client/game-assistant/src/index.ts'],
  '@dsh-xia/dsh-client-game-assistant/client': ['./packages/client/game-assistant/src/client/index.ts'],
  '@dsh-xia/dsh-client-gameassist-knowledge': ['./packages/client/gameassist-knowledge/src/index.ts'],
  '@dsh-xia/dsh-client-gameassist-knowledge/client': ['./packages/client/gameassist-knowledge/src/client/index.ts'],
}
const WEB_DEPS = [
  '@dsh-xia/dsh-client-game-assistant',
  '@dsh-xia/dsh-client-gameassist-knowledge',
  '@dsh-xia/dsh-gameassist-knowledge',
  '@dsh-xia/dsh-gameassist-memory',
  '@dsh-xia/dsh-gameassist-roster',
]

function parseArgs(argv) {
  const args = { checkout: null, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--checkout') args.checkout = argv[++i]
    else if (argv[i] === '--dry-run') args.dryRun = true
  }
  return args
}

function apply(file, marker, inserted, what) {
  if (!existsSync(file)) {
    console.log(`skip (missing): ${file}`)
    return
  }
  let t = readFileSync(file, 'utf8')
  // Idempotency: skip when every insertion already exists.
  const allPresent = inserted.every((s) => t.includes(s))
  if (allPresent) {
    console.log(`ok (already patched): ${what}`)
    return
  }
  const idx = t.indexOf(marker)
  if (idx === -1) {
    console.error(`FAIL: marker not found in ${file}: ${JSON.stringify(marker)}`)
    process.exitCode = 1
    return
  }
  if (args.dryRun) {
    console.log(`[dry-run] would patch: ${what}`)
    return
  }
  const block = inserted.map((s) => s + (s.endsWith('\n') ? '' : '\n')).join('')
  // Insert immediately AFTER the marker so the block lands inside the
  // braces/array opened by it (e.g. inside `"paths": {` or `"references": [`).
  t = t.slice(0, idx + marker.length) + '\n' + block + t.slice(idx + marker.length)
  writeFileSync(file, t, 'utf8')
  console.log(`patched: ${what}`)
}

const args = parseArgs(process.argv.slice(2))
if (!args.checkout) {
  console.error('usage: node scripts/patch-dsh.mjs --checkout <path> [--dry-run]')
  process.exit(1)
}
const checkout = resolve(args.checkout)
if (!existsSync(join(checkout, 'package.json'))) {
  console.error(`not a DSH checkout (no package.json): ${checkout}`)
  process.exit(1)
}

// tsconfig.host.json — insert references right after the opening "references": [
apply(
  join(checkout, 'tsconfig.host.json'),
  '"references": [',
  HOST_REFS.map((r) => `    { "path": ${JSON.stringify(r.path)} },`),
  'tsconfig.host.json references (companion ×3)',
)

// tsconfig.client.json — same anchor, client packages
apply(
  join(checkout, 'tsconfig.client.json'),
  '"references": [',
  CLIENT_REFS.map((r) => `    { "path": ${JSON.stringify(r.path)} },`),
  'tsconfig.client.json references (client ×2)',
)

// tsconfig.base.json — explicit path mappings (JSONC-safe, inside "paths": {)
apply(
  join(checkout, 'tsconfig.base.json'),
  '"paths": {',
  Object.entries(BASE_PATHS).map(
    ([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`,
  ),
  'tsconfig.base.json paths (@dsh-xia ×7)',
)

// web-app bundle — workspace dependencies
apply(
  join(checkout, 'packages/bundle/web-app/package.json'),
  '"dependencies": {',
  WEB_DEPS.map((d) => `    ${JSON.stringify(d)}: "workspace:^",`),
  'web-app package.json dependencies (×5)',
)

console.log(args.dryRun ? '\ndry-run complete' : '\npatch-dsh complete')
