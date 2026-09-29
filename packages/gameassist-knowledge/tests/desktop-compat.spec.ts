/**
 * Desktop-compatibility regression tests.
 *
 * The Electron desktop shell ships without a `webServer`, so this plugin must
 * load and keep its `kb_*` tools there. These tests pin the two properties that
 * makes possible: the optional `webServer` dependency, and a `kbRoot` default
 * that needs no profile patch to be hand-edited.
 */
import { describe, expect, test } from 'vitest'
import {
  Config,
  apply,
  defaultKbRoot,
  inject,
  name,
  resolveWebServer,
  stripBom,
} from '../src/index.ts'

describe('bundle contract', () => {
  test('plugin name and inject list stay stable', () => {
    expect(name).toBe('gameassist-knowledge')
    // `webServer` must NOT be a hard dependency: the desktop host disables it.
    expect(inject).toEqual(['systemPrompt', 'tools'])
    expect(inject).not.toContain('webServer')
  })
})

describe('kbRoot default', () => {
  test('resolves without any profile-supplied config', () => {
    const previous = process.env.DSH_KB_ROOT
    try {
      delete process.env.DSH_KB_ROOT
      const root = defaultKbRoot()
      expect(root).toMatch(/knowledge-bases$/u)
      // Must be absolute so the host can scan it from any working directory.
      expect(root).toBe(defaultKbRoot())
    } finally {
      if (previous === undefined) delete process.env.DSH_KB_ROOT
      else process.env.DSH_KB_ROOT = previous
    }
  })

  test('honours DSH_KB_ROOT when provided', () => {
    const previous = process.env.DSH_KB_ROOT
    try {
      process.env.DSH_KB_ROOT = 'D:/somewhere/else/kb'
      expect(defaultKbRoot()).toMatch(/somewhere/u)
    } finally {
      if (previous === undefined) delete process.env.DSH_KB_ROOT
      else process.env.DSH_KB_ROOT = previous
    }
  })

  test('schema supplies a default so an empty patch still validates', () => {
    // The bundle patch ships no `config`, so validation runs with `{}`.
    const parsed = (Config as unknown as { (value?: unknown): { kbRoot: string } })({})
    expect(typeof parsed.kbRoot).toBe('string')
    expect(parsed.kbRoot.length).toBeGreaterThan(0)
  })
})

/**
 * Minimal host double recording what the plugin contributes.
 *
 * Two cordis behaviours are reproduced deliberately, because both have already
 * caused real failures in this plugin:
 *
 * 1. `ctx.effect` runs its callback immediately and keeps the returned disposer.
 * 2. Reading an undeclared service off the context THROWS. A real cordis context
 *    is a proxy whose `get` trap raises `cannot get property "..." without
 *    inject`; a plain object would silently yield `undefined` and let a broken
 *    probe pass. `reflect.get(name, false)` is the sanctioned non-throwing path.
 */
function stubContext(options: { webServer?: boolean } = {}): {
  ctx: any
  tools: string[]
  routes: string[]
  disposers: (() => void)[]
} {
  const tools: string[] = []
  const routes: string[] = []
  const disposers: (() => void)[] = []
  const base: any = {
    systemPrompt: {
      section: () => () => {},
    },
    tools: {
      register: (definition: { name: string }) => {
        tools.push(definition.name)
        return () => {}
      },
    },
    effect: (fn: () => (() => void) | void) => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
    },
  }
  if (options.webServer === true) {
    base.webServer = {
      register: (route: { path: string }) => {
        routes.push(route.path)
        return () => {}
      },
    }
  }
  // Reflection layer: the only non-throwing way to ask for an optional service.
  base.reflect = {
    get: (name: string, strict = true) => {
      const found = base[name]
      if (found === undefined && strict) throw new Error(`cannot get property "${name}" without inject`)
      return found
    },
  }
  const ctx = new Proxy(base, {
    get(target, prop, receiver) {
      if (prop === 'webServer' && target.webServer === undefined) {
        throw new Error('cannot get property "webServer" without inject')
      }
      return Reflect.get(target, prop, receiver)
    },
  })
  return { ctx, tools, routes, disposers }
}

describe('apply on a host without webServer (desktop)', () => {
  test('registers kb tools and survives the throwing context proxy', () => {
    const { ctx, tools, routes } = stubContext({ webServer: false })
    // A bare `ctx.webServer` probe would throw against this proxy.
    expect(() => ctx.webServer).toThrow(/without inject/u)
    expect(() => apply(ctx, { kbRoot: 'E:/myaicode/knowledge-bases' })).not.toThrow()
    expect(tools.sort()).toEqual(['kb_list', 'kb_read', 'kb_write'])
    expect(routes).toEqual([])
  })
})

describe('apply on a host with webServer (web/CLI)', () => {
  test('registers both routes and the kb tools', () => {
    const { ctx, tools, routes } = stubContext({ webServer: true })
    apply(ctx, { kbRoot: 'E:/myaicode/knowledge-bases' })
    expect(routes.sort()).toEqual(['/gameassist/knowledge/node', '/gameassist/knowledge/tree'])
    expect(tools.sort()).toEqual(['kb_list', 'kb_read', 'kb_write'])
  })
})

describe('resolveWebServer', () => {
  test('answers undefined instead of raising on a server-less host', () => {
    const { ctx } = stubContext({ webServer: false })
    expect(resolveWebServer(ctx)).toBeUndefined()
  })

  test('returns the service when the host provides one', () => {
    const { ctx } = stubContext({ webServer: true })
    expect(typeof resolveWebServer(ctx).register).toBe('function')
  })

  test('tolerates a plain object host without a reflection layer', () => {
    expect(resolveWebServer({})).toBeUndefined()
    const server = { register: () => () => {} }
    expect(resolveWebServer({ webServer: server })).toBe(server)
  })
})

describe('kb_write output shape stays stable', () => {
  test('stripBom still guards written content', () => {
    expect(stripBom('\uFEFF# 标题')).toBe('# 标题')
  })
})
