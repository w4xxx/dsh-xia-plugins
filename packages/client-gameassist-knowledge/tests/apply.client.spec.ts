/**
 * Knowledge-base client wiring: the composer 📚 button entry, the input-dock
 * panel entry, and cleanup on dispose.
 */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject } from '../src/client/index.ts'

const LEFT = 'conversation.input.left'
const DOCK = 'conversation.input.dock'

describe('gameassist-knowledge client apply', () => {
  it('declares slots', () => {
    expect(inject).toEqual(['slots'])
  })

  it('registers the composer button and the dock panel; dispose removes them', async () => {
    const ctx = new Context()
    await ctx.plugin(SlotRegistry).await()
    const slots = ctx.get('slots') as SlotRegistry
    const declare = slots.register({
      name: 'root',
      children: {
        [LEFT]: { kind: 'list', scope: 'session' },
        [DOCK]: { kind: 'list', scope: 'session' },
      },
    } as never, () => null)

    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    expect(slots.entries(LEFT).some(entry => (entry.options as { id?: string }).id === 'gameassist-knowledge')).toBe(true)
    expect(slots.entries(DOCK).some(entry => (entry.options as { id?: string }).id === 'gameassist-knowledge-panel')).toBe(true)

    await fiber.dispose()
    expect(slots.entries(LEFT).some(entry => (entry.options as { id?: string }).id === 'gameassist-knowledge')).toBe(false)
    expect(slots.entries(DOCK).some(entry => (entry.options as { id?: string }).id === 'gameassist-knowledge-panel')).toBe(false)
    declare()
  })
})
