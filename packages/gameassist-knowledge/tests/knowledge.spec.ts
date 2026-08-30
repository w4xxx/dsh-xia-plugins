/**
 * Unit tests for the knowledge-base core: title extraction, path parsing and
 * traversal protection, tree scanning, and renderings.
 */
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  countNodes,
  extractTitle,
  parseKbPath,
  renderIndex,
  renderTree,
  resolveLibraryNode,
  scanLibrary,
  scanLibraries,
  stripBom,
} from '../src/index.ts'

describe('stripBom / extractTitle', () => {
  test('strips a leading BOM', () => {
    expect(stripBom('\uFEFF# 标题')).toBe('# 标题')
    expect(stripBom('no bom')).toBe('no bom')
  })

  test('extracts the first heading, tolerating BOM and CRLF', () => {
    expect(extractTitle('\uFEFF# 知识库总目录\n\n正文', 'fallback')).toBe('知识库总目录')
    expect(extractTitle('# 世界观\r\n\r\n内容', 'fallback')).toBe('世界观')
  })

  test('falls back when no heading exists', () => {
    expect(extractTitle('只有正文', 'fallback')).toBe('fallback')
    expect(extractTitle('#  ', 'fallback')).toBe('fallback')
  })
})

describe('parseKbPath', () => {
  test('parses library + relative path and appends .md', () => {
    expect(parseKbPath('yu-ai-last-battle/剧情/第1章-起')).toEqual({ library: 'yu-ai-last-battle', rel: '剧情/第1章-起.md' })
    expect(parseKbPath('lib/a/b.md')).toEqual({ library: 'lib', rel: 'a/b.md' })
  })

  test('accepts backslashes and surrounding spaces', () => {
    expect(parseKbPath(' lib\\剧情\\第1章.md ')).toEqual({ library: 'lib', rel: '剧情/第1章.md' })
  })

  test('rejects missing library, traversal, and empty parts', () => {
    expect(parseKbPath('no-library')).toBeNull()
    expect(parseKbPath('/abs/path.md')).toBeNull()
    expect(parseKbPath('lib/../escape.md')).toBeNull()
    expect(parseKbPath('lib/a/../b.md')).toBeNull()
    expect(parseKbPath('lib//empty.md')).toBeNull()
    expect(parseKbPath('lib/')).toBeNull()
  })
})

describe('resolveLibraryNode', () => {
  const root = join(tmpdir(), 'kb')

  test('resolves a normal path inside the library', () => {
    expect(resolveLibraryNode(root, 'lib/剧情/第1章.md')).toEqual({
      abs: join(root, 'lib', '剧情', '第1章.md'),
      library: 'lib',
      rel: '剧情/第1章.md',
    })
  })

  test('rejects traversal out of the library', () => {
    expect(resolveLibraryNode(root, 'lib/../../etc/passwd.md')).toBeNull()
    expect(resolveLibraryNode(root, '../lib/a.md')).toBeNull()
  })
})

describe('scanning and rendering', () => {
  test('scans a library tree, counts nodes, and renders index/tree', async () => {
    const root = await mkdtemp(join(tmpdir(), 'kb-test-'))
    await mkdir(join(root, 'yu-ai-last-battle', '剧情'), { recursive: true })
    await mkdir(join(root, 'other'), { recursive: true })
    await writeFile(join(root, 'yu-ai-last-battle', 'README.md'), '# 《与AI的最后一战》知识库\n\n说明', 'utf8')
    await writeFile(join(root, 'yu-ai-last-battle', '剧情', '第1章.md'), '# 第1章 · 起\n\n正文', 'utf8')
    await writeFile(join(root, 'yu-ai-last-battle', '世界观.md'), '没有标题', 'utf8')

    const lib = await scanLibrary(root, 'yu-ai-last-battle')
    expect(lib).not.toBeNull()
    expect(lib!.title).toBe('《与AI的最后一战》知识库')
    expect(lib!.nodeCount).toBe(4) // README + 世界观 + 剧情 dir + 第1章
    expect(countNodes(lib!.nodes)).toBe(4)
    expect(lib!.nodes.map(node => node.name).sort()).toEqual(['README', '世界观', '剧情'])
    expect(lib!.nodes[0]!.kind).toBe('dir')

    const libs = await scanLibraries(root)
    expect(libs.map(item => item.name)).toEqual(['other', 'yu-ai-last-battle'])

    const index = renderIndex(libs)
    expect(index).toContain('yu-ai-last-battle')
    expect(index).toContain('《与AI的最后一战》知识库')

    const tree = renderTree(libs)
    expect(tree).toContain('📁 剧情/')
    expect(tree).toContain('📄 第1章 · 起（剧情/第1章.md）')
  })

  test('renders empty states', () => {
    expect(renderIndex([])).toContain('还没有知识库')
    expect(renderTree([])).toBe('（知识库为空）')
  })

  test('missing library scans to null', async () => {
    const root = await mkdtemp(join(tmpdir(), 'kb-test-empty-'))
    expect(await scanLibrary(root, 'nope')).toBeNull()
    expect(await scanLibraries(join(root, 'missing-root'))).toEqual([])
  })
})
