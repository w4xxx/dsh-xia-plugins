/**
 * Pure-logic coverage for the memory bank: list splitting, rendering, and
 * upsert semantics.
 */
import { describe, expect, it } from 'vitest'
import { applyMemoryUpdate, EMPTY_MEMORY, renderMemory, splitList } from '../src/index.ts'

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
})