// @vitest-environment jsdom

/**
 * Permanent game-assistant skin wiring: token override layer, dock charm
 * entry, petal overlay entry, and cleanup on dispose.
 */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject } from '../src/client/index.ts'

const DOCK = 'conversation.composer.dock'
const OVERLAY = 'shell.overlay'

describe('game-assistant client apply', () => {
  it('declares theme and slots', () => {
    expect(inject).toEqual(['theme', 'slots', 'sessions', 'uiSession'])
  })

  it('stacks the permanent token layer and registers both entries; dispose removes them', async () => {
    const ctx = new Context()
    await ctx.plugin(SlotRegistry).await()
    const layers: Array<{ source: string; tokens: Record<string, unknown> }> = []
    ctx.provide('theme', {
      overrideTokens(source: string, tokens: Record<string, unknown>) {
        layers.push({ source, tokens })
        return () => {}
      },
    })
    ctx.provide('sessions', {
      list: {
        subscribe: () => () => {},
        getSnapshot: () => ({ jobsBySession: {} }),
      },
      binding: () => undefined,
    })
    ctx.provide('uiSession', {
      pendingInteractions: {
        subscribe: () => () => {},
        getSnapshot: () => new Map(),
      },
    })
    const slots = ctx.get('slots') as SlotRegistry
    const declare = slots.register({
      name: 'root',
      children: {
        [DOCK]: { kind: 'list', scope: 'session' },
        [OVERLAY]: { kind: 'list', scope: 'root' },
      },
    } as never, () => null)

    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    expect(layers).toHaveLength(1)
    const layer = layers[0]!
    expect(layer.source).toBe('game-assistant-permanent')
    expect((layer.tokens['--dsw-alias-brand-primary'] as { light: string }).light).toBe('#e0558f')
    expect(slots.entries(DOCK).some((entry) => (entry.options as { id?: string }).id === 'assistant-charm')).toBe(true)
    expect(slots.entries(OVERLAY).some((entry) => (entry.options as { id?: string }).id === 'sakura-petals')).toBe(true)

    await fiber.dispose()
    expect(slots.entries(DOCK).some((entry) => (entry.options as { id?: string }).id === 'assistant-charm')).toBe(false)
    expect(slots.entries(OVERLAY).some((entry) => (entry.options as { id?: string }).id === 'sakura-petals')).toBe(false)
    declare()
  })
})
