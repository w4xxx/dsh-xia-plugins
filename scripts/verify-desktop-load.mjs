#!/usr/bin/env node
/**
 * Desktop-load verification for the Xia plugin suite.
 *
 * The Electron desktop shell ships WITHOUT a `webServer`, and its plugin
 * installer writes a bundle patch that carries no `config`. Both facts have
 * broken these plugins before, so this script loads every host-side plugin into
 * a real cordis context under exactly those conditions and asserts what the
 * host should receive.
 *
 * Unlike the unit tests, this runs against the built `lib/` output through a
 * genuine `Context` (a throwing proxy), so it also catches probe patterns that
 * only work on a plain-object test double.
 *
 * Usage (run from inside a DSH checkout, where `@deepseek-ai/cordis` resolves):
 *   node D:/mycode/dsh-xia-plugins/scripts/verify-desktop-load.mjs --checkout D:/mycode/deepseek-harness-master
 *
 * Exits non-zero when any plugin fails to load or contributes the wrong surface.
 */

import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Host-side plugin -> the tools it must contribute on either host. */
const PLUGINS = [
  {
    id: 'gameassist-knowledge',
    dir: 'packages/companion/gameassist-knowledge',
    tools: ['kb_list', 'kb_read', 'kb_write'],
    // Browser-only routes; absent on desktop, present on web/CLI.
    routes: ['/gameassist/knowledge/node', '/gameassist/knowledge/tree'],
  },
  {
    id: 'gameassist-memory',
    dir: 'packages/companion/gameassist-memory',
    tools: ['memory_read', 'memory_update'],
    routes: [],
  },
  {
    id: 'gameassist-roster',
    dir: 'packages/companion/gameassist-roster',
    tools: ['roster_list', 'roster_pick'],
    routes: ['/gameassist/doubao-voices', '/gameassist/tts', '/gameassist/voice-map'],
  },
]

function parseArgs(argv) {
  const args = { checkout: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--checkout') args.checkout = argv[++i]
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
if (!args.checkout) {
  console.error('usage: node scripts/verify-desktop-load.mjs --checkout <dsh-checkout>')
  process.exit(2)
}
const checkout = resolve(args.checkout)
if (!existsSync(join(checkout, 'package.json'))) {
  console.error(`not a DSH checkout: ${checkout}`)
  process.exit(2)
}

// Resolve cordis from inside the checkout, not from this script's directory.
// The vendored copy is the primary location; a pnpm-installed one is the
// fallback, so the script also works where only the workspace install ran.
const cordisCandidates = [
  join(checkout, 'vendor', 'cordis', 'lib', 'index.js'),
  join(checkout, 'packages', 'companion', 'gameassist-knowledge', 'node_modules', '@deepseek-ai', 'cordis', 'lib', 'index.js'),
]
const cordisEntry = cordisCandidates.find(candidate => existsSync(candidate))
if (cordisEntry === undefined) {
  console.error(`cordis not found in the checkout. looked in:\n  ${cordisCandidates.join('\n  ')}`)
  process.exit(2)
}
const { Context } = await import(pathToFileURL(cordisEntry).href)

/**
 * Load one plugin into a real cordis context.
 * @param path - absolute path of the built plugin entry.
 * @param withWebServer - whether the host provides an HTTP layer.
 * @returns the tools and routes the plugin contributed, plus any load error.
 */
async function load(path, withWebServer) {
  const mod = await import(pathToFileURL(path).href)
  const ctx = new Context()
  const tools = []
  const routes = []
  ctx.provide('systemPrompt', { section: () => () => {} })
  ctx.provide('tools', { register: (definition) => { tools.push(definition.name); return () => {} } })
  if (withWebServer) {
    ctx.provide('webServer', { register: (route) => { routes.push(route.path); return () => {} } })
  }
  let error = null
  try {
    // `{}` is the desktop case: the bundle patch carries no config, so every
    // schema default has to stand on its own.
    const fiber = await ctx.plugin(mod, {})
    await new Promise(resolve => setTimeout(resolve, 400))
    await fiber.dispose()
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause)
  }
  return { tools: tools.sort(), routes: routes.sort(), error }
}

const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)
let failures = 0

for (const scenario of [
  { label: 'desktop (no webServer)', withWebServer: false },
  { label: 'web/CLI (webServer)', withWebServer: true },
]) {
  console.log(`\n=== ${scenario.label} · empty config ===`)
  for (const plugin of PLUGINS) {
    const entry = join(checkout, plugin.dir, 'lib', 'index.js')
    if (!existsSync(entry)) {
      console.log(`FAIL ${plugin.id.padEnd(24)} built entry missing: ${entry}`)
      failures++
      continue
    }
    const expectedRoutes = scenario.withWebServer ? plugin.routes : []
    const result = await load(entry, scenario.withWebServer)
    const problems = []
    if (result.error !== null) problems.push(`load error: ${result.error}`)
    if (!same(result.tools, plugin.tools)) problems.push(`tools ${JSON.stringify(result.tools)} != ${JSON.stringify(plugin.tools)}`)
    if (!same(result.routes, expectedRoutes)) problems.push(`routes ${JSON.stringify(result.routes)} != ${JSON.stringify(expectedRoutes)}`)
    if (problems.length === 0) {
      console.log(`OK   ${plugin.id.padEnd(24)} tools=${JSON.stringify(result.tools)} routes=${JSON.stringify(result.routes)}`)
    } else {
      console.log(`FAIL ${plugin.id.padEnd(24)} ${problems.join('; ')}`)
      failures++
    }
  }
}

console.log(failures === 0 ? '\n===> all plugins load on both hosts' : `\n===> ${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
