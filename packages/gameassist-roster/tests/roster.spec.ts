/**
 * Pure-logic coverage for the daily roster: date-key locality, per-day pick
 * stability, and card rendering.
 */
import { describe, expect, it } from 'vitest'
import { localDateKey, pickFor, renderCard } from '../src/index.ts'

describe('gameassist-roster', () => {
  it('pickFor is stable per key', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    expect(pickFor(ids, '2025-01-01')).toBe(pickFor(ids, '2025-01-01'))
  })

  it('pickFor scatters across days', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const seen = new Set(Array.from({ length: 14 }, (_, i) => pickFor(ids, `2025-01-${String(i + 1).padStart(2, '0')}`)))
    expect(seen.size).toBeGreaterThan(1)
  })

  it('localDateKey uses the local calendar date', () => {
    expect(localDateKey(new Date(2025, 0, 5, 23, 59))).toBe('2025-01-05')
  })

  it('renderCard renders the key fields', () => {
    const text = renderCard({
      id: 'x',
      name: '测试角色',
      source: '某部作品',
      cv: '某声优',
      personality: ['元气'],
      speech: { catchphrases: ['喵。'] },
      playbook: ['保持元气'],
      taboo: ['不要吵闹'],
    })
    expect(text).toContain('【测试角色】')
    expect(text).toContain('某部作品')
    expect(text).toContain('某声优')
    expect(text).toContain('喵。')
    expect(text).toContain('扮演要点')
    expect(text).toContain('禁止事项')
  })
})