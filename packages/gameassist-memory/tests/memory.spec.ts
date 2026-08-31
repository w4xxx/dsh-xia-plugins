/**
 * Pure-logic coverage for the memory bank: list splitting, rendering, and
 * upsert semantics.
 */
import { describe, expect, it } from 'vitest'
import { applyMemoryUpdate, clipText, EMPTY_MEMORY, RECORD_INSTRUCTION, renderMemory, splitList } from '../src/index.ts'

describe('gameassist-memory', () => {
  it('splitList splits and trims', () => {
    expect(splitList('A，B、C;D\n E ')).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(splitList('')).toEqual([])
  })

  it('applyMemoryUpdate replaces profile lists and keeps the rest', () => {
    const first = applyMemoryUpdate(EMPTY_MEMORY, { interests: '游戏,二次元' })
    expect(first.interests).toEqual(['游戏', '二次元'])
    const second = applyMemoryUpdate(first, { preferences: '中文交流、樱花主题' })
    expect(second.interests).toEqual(['游戏', '二次元'])
    expect(second.preferences).toEqual(['中文交流', '樱花主题'])
  })

  it('tasks upsert by id and remove by id', () => {
    const withTask = applyMemoryUpdate(EMPTY_MEMORY, { taskTitle: '写剧情', taskStatus: 'doing', taskNotes: '第三章' })
    expect(withTask.tasks).toHaveLength(1)
    const id = withTask.tasks[0]!.id
    const updated = applyMemoryUpdate(withTask, { taskId: id, taskStatus: 'done' })
    expect(updated.tasks[0]!.status).toBe('done')
    expect(updated.tasks[0]!.title).toBe('写剧情')
    const removed = applyMemoryUpdate(updated, { removeTaskId: id })
    expect(removed.tasks).toHaveLength(0)
  })

  it('works upsert and render', () => {
    const memory = applyMemoryUpdate(EMPTY_MEMORY, {
      workName: 'My Forum Game',
      workKind: '游戏',
      workSummary: '论坛题材',
      workTech: 'Godot 4.7/GDScript',
      workPath: 'D:/projects/my-forum-game',
      workStatus: '开发中',
    })
    expect(memory.works).toHaveLength(1)
    const text = renderMemory(memory)
    expect(text).toContain('My Forum Game')
    expect(text).toContain('Godot 4.7')
    expect(text).toContain('开发中')
  })

  it('clipText truncates long text with an ellipsis', () => {
    expect(clipText('短文本', 10)).toBe('短文本')
    expect(clipText('中文文本', 3)).toBe('中文文…')
    expect(clipText('text', undefined)).toBe('text')
    expect(clipText('', 3)).toBe('')
  })

  it('renderMemory truncates notes and summaries when limits are set', () => {
    const memory = applyMemoryUpdate(EMPTY_MEMORY, { taskTitle: '写剧情', taskNotes: '一二三四五六七八九十' })
    const withWork = applyMemoryUpdate(memory, { workName: '游戏', workSummary: 'abcdefghij' })
    const full = renderMemory(withWork)
    expect(full).toContain('一二三四五六七八九十')
    expect(full).toContain('abcdefghij')

    const clipped = renderMemory(withWork, { maxNoteChars: 4, maxSummaryChars: 5 })
    expect(clipped).toContain('一二三四…')
    expect(clipped).not.toContain('五六七八九十')
    expect(clipped).toContain('abcde…')
    expect(clipped).not.toContain('fghij')
  })

  it('renderMemory limit 0 hides notes and summaries entirely', () => {
    const memory = applyMemoryUpdate(EMPTY_MEMORY, { taskTitle: '写剧情', taskNotes: '细节' })
    const withWork = applyMemoryUpdate(memory, { workName: '游戏', workSummary: '摘要' })
    const clipped = renderMemory(withWork, { maxNoteChars: 0, maxSummaryChars: 0 })
    expect(clipped).toContain('写剧情')
    expect(clipped).not.toContain('细节')
    expect(clipped).toContain('游戏')
    expect(clipped).not.toContain('摘要')
  })

  it('full render is unaffected when no limits are set', () => {
    const memory = applyMemoryUpdate(EMPTY_MEMORY, { taskTitle: '任务', taskNotes: '很长很长的备注' })
    expect(renderMemory(memory, { maxNoteChars: 200 })).toContain('很长很长的备注')
    expect(renderMemory(memory, {})).toContain('很长很长的备注')
  })

  it('record instruction keeps the memory-hygiene contract', () => {
    expect(RECORD_INSTRUCTION).toContain('记忆只放状态')
    expect(RECORD_INSTRUCTION).toContain('知识库')
    expect(RECORD_INSTRUCTION).toContain('不要新建重复条目')
    expect(RECORD_INSTRUCTION).toContain('memory_update')
  })
})