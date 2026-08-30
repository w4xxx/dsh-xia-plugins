/**
 * Tree-shaped knowledge base for the Xia game-assistant preset. Each library
 * is a directory under the configured root: directories are branches and
 * `.md` files are leaf nodes whose first `# heading` line is the display
 * title. The browser panel reads the tree and node bodies over two HTTP
 * routes; the agent gets `kb_list` / `kb_read` / `kb_write` tools plus a
 * compact prompt index that names libraries and their top level only, so
 * reading bodies stays strictly on demand (token-cheap).
 *
 * @module @w4xxx/dsh-gameassist-knowledge
 */

import { appendFileSync } from 'node:fs'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'gameassist-knowledge'

/** Best-effort diagnostic log (never breaks the plugin on failure).
 * Off by default; set DSH_KB_DIAG_FILE to an absolute path to enable. */
const DIAG_FILE = process.env.DSH_KB_DIAG_FILE || ''
function diag(message: string): void {
  if (!DIAG_FILE) return
  try {
    appendFileSync(DIAG_FILE, `${new Date().toISOString()} ${message}\n`)
  } catch {
    // diagnostics must never break the plugin
  }
}
diag('module imported')

/** The registries this plugin contributes to. */
export const inject = ['systemPrompt', 'tools', 'webServer']

/** Plugin configuration validated by the loader. */
export interface Config {
  /** Absolute path of the knowledge-base root (one subdirectory per library). */
  kbRoot: string
}

/** Schemastery validation for {@link Config}. */
export const Config: z<Config> = z.object({
  kbRoot: z.string(),
})

/** One `.md` leaf node. */
export interface KbFileNode {
  kind: 'file'
  /** Display name without the `.md` suffix. */
  name: string
  /** Library-relative POSIX path including `.md`. */
  path: string
  /** First `# heading` line (BOM-tolerant) or the file name. */
  title: string
  /** File size in bytes. */
  size: number
}

/** One directory branch. */
export interface KbDirNode {
  kind: 'dir'
  name: string
  /** Library-relative POSIX path with a trailing `/`. */
  path: string
  children: KbTreeNode[]
}

export type KbTreeNode = KbFileNode | KbDirNode

/** One knowledge library (a top-level directory). */
export interface KbLibrary {
  name: string
  /** `README.md` heading, or the directory name. */
  title: string
  /** Total node count (files plus directories). */
  nodeCount: number
  nodes: KbTreeNode[]
}

/** Single-node byte ceiling; larger files are skipped by tree scans. */
export const MAX_NODE_BYTES = 512 * 1024

/** Strip a leading UTF-8 BOM (Node keeps it in decoded strings). */
export function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

/** Extract the first `# heading` line, tolerating a BOM; falls back when absent. */
export function extractTitle(text: string, fallback: string): string {
  const match = /^#\s+(.+?)\s*$/m.exec(stripBom(text))
  const raw = match === null || match[1] === undefined ? fallback : match[1].trim()
  return raw === '' ? fallback : raw
}

/** Normalize a native path to POSIX separators. */
export function toPosix(path: string): string {
  return path.split(sep).join('/')
}

/**
 * Parse a user-facing node path of the form `library/dir/name` (`.md` suffix
 * optional) into its library name and normalized relative path.
 * @returns null when the shape is invalid or contains traversal segments.
 */
export function parseKbPath(input: string): { library: string; rel: string } | null {
  const trimmed = input.trim().replace(/\\/g, '/')
  const firstSlash = trimmed.indexOf('/')
  if (firstSlash <= 0) return null
  const library = trimmed.slice(0, firstSlash)
  if (library === '.' || library === '..' || !/^[\w\u4e00-\u9fff\-\. ]+$/.test(library)) return null
  let rel = trimmed.slice(firstSlash + 1)
  if (rel === '') return null
  if (!rel.endsWith('.md')) rel += '.md'
  for (const part of rel.split('/')) {
    if (part === '' || part === '.' || part === '..') return null
  }
  return { library, rel }
}

/**
 * Resolve a user-facing node path against the knowledge root with traversal
 * protection.
 * @returns the absolute path plus library/relative identity, or null.
 */
export function resolveLibraryNode(kbRoot: string, input: string): { abs: string; library: string; rel: string } | null {
  const parsed = parseKbPath(input)
  if (parsed === null) return null
  const libAbs = resolve(kbRoot, parsed.library)
  const abs = resolve(libAbs, parsed.rel)
  const relCheck = relative(libAbs, abs)
  if (relCheck === '' || relCheck.startsWith('..') || relCheck.includes(`..${sep}`)) return null
  return { abs, library: parsed.library, rel: parsed.rel }
}

/** Recursively scan one directory into tree nodes (sorted: directories first). */
export async function scanDir(absDir: string, relDir: string): Promise<KbTreeNode[]> {
  const entries = await readdir(absDir, { withFileTypes: true })
  const nodes: KbTreeNode[] = []
  for (const entry of entries) {
    const name = entry.name
    if (name.startsWith('.')) continue
    const abs = join(absDir, name)
    const rel = relDir === '' ? name : `${relDir}/${name}`
    if (entry.isDirectory()) {
      const children = await scanDir(abs, rel).catch(() => [])
      if (children.length > 0) nodes.push({ kind: 'dir', name, path: `${rel}/`, children })
    } else if (entry.isFile() && name.endsWith('.md')) {
      try {
        const st = await stat(abs)
        if (st.size > MAX_NODE_BYTES) continue
        const text = await readFile(abs, 'utf8')
        nodes.push({
          kind: 'file',
          name: name.slice(0, -3),
          path: rel,
          title: extractTitle(text, name.slice(0, -3)),
          size: st.size,
        })
      } catch {
        // unreadable node — skip, keep the tree usable
      }
    }
  }
  nodes.sort((a, b) => (a.kind === b.kind ? a.name.localeCompare(b.name, 'zh') : a.kind === 'dir' ? -1 : 1))
  return nodes
}

/** Count files and directories in a node list. */
export function countNodes(nodes: KbTreeNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1
    if (node.kind === 'dir') count += countNodes(node.children)
  }
  return count
}

/** Scan one library directory into a {@link KbLibrary}; null when absent/not a dir. */
export async function scanLibrary(kbRoot: string, libName: string): Promise<KbLibrary | null> {
  const abs = resolve(kbRoot, libName)
  try {
    const st = await stat(abs)
    if (!st.isDirectory()) return null
  } catch {
    return null
  }
  let title = libName
  try {
    const readmeText = await readFile(join(abs, 'README.md'), 'utf8')
    const readmeTitle = extractTitle(readmeText, '')
    if (readmeTitle !== '') title = readmeTitle
  } catch {
    // no README — keep the directory name
  }
  const nodes = await scanDir(abs, '').catch(() => [])
  return { name: libName, title, nodeCount: countNodes(nodes), nodes }
}

/** Scan every library under the root (non-dot directories, sorted by name). */
export async function scanLibraries(kbRoot: string): Promise<KbLibrary[]> {
  let names: string[]
  try {
    names = (await readdir(kbRoot, { withFileTypes: true }))
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
      .sort()
  } catch {
    return []
  }
  const libs: KbLibrary[] = []
  for (const name of names) {
    const lib = await scanLibrary(kbRoot, name)
    if (lib !== null) libs.push(lib)
  }
  return libs
}

/** Compact prompt index: library names plus their top level only. */
export function renderIndex(libs: KbLibrary[]): string {
  if (libs.length === 0) return '（还没有知识库：在知识库根目录建一个作品子目录、放入 .md 节点即可）'
  const lines: string[] = []
  for (const lib of libs) {
    const top = lib.nodes.map(node => (node.kind === 'dir' ? `${node.name}/` : node.name)).join('、')
    const shown = top === '' ? '' : `：${top}`
    lines.push(`- ${lib.name}（${lib.title}，${lib.nodeCount} 节点）${shown}`)
  }
  return lines.join('\n')
}

/** Full tree rendering for the `kb_list` tool. */
export function renderTree(libs: KbLibrary[]): string {
  if (libs.length === 0) return '（知识库为空）'
  const lines: string[] = []
  for (const lib of libs) {
    lines.push(`## ${lib.name} · ${lib.title}`)
    const walk = (nodes: KbTreeNode[], depth: number): void => {
      for (const node of nodes) {
        const indent = '  '.repeat(depth)
        if (node.kind === 'dir') {
          lines.push(`${indent}📁 ${node.name}/`)
          walk(node.children, depth + 1)
        } else {
          lines.push(`${indent}📄 ${node.title}（${node.path}）`)
        }
      }
    }
    walk(lib.nodes, 0)
  }
  return lines.join('\n')
}

/**
 * Register the prompt index, the two browser routes, and the three tools.
 * Every contribution is disposed with the fiber.
 * @param ctx - plugin context carrying systemPrompt, tools, and webServer.
 * @param config - the validated plugin configuration.
 */
export function apply(ctx: any, config: Config): void {
  const kbRoot = config.kbRoot
  diag(`apply called, kbRoot=${kbRoot}`)
  let libraries: KbLibrary[] = []

  const refresh = async (): Promise<void> => {
    libraries = await scanLibraries(kbRoot)
    diag(`scan done: ${libraries.length} libraries, ${libraries.map(item => `${item.name}=${item.nodeCount}`).join(' ')}`)
  }

  let disposedSection: (() => void) | undefined
  const registerSection = (): void => {
    disposedSection?.()
    disposedSection = undefined
    disposedSection = ctx.systemPrompt.section({
      name: 'gameassist:knowledge',
      order: 12,
      text: [
        '【知识库】以下作品已建立树状知识库（.md 文件即节点）。主人把节点拖入输入框时会以「〔kb-ref〕库名/相对路径」引用；若消息里同时附有 <kb-content> 块，正文已随消息带入，无需再读。你可调用 kb_list 查看完整目录树、kb_read 读取节点正文、kb_write 写入或更新节点。',
        renderIndex(libraries),
      ].join('\n'),
    })
  }

  ctx.effect(() => {
    let settled = false
    void refresh().then(() => {
      if (!settled) registerSection()
    })
    return () => {
      settled = true
      disposedSection?.()
      disposedSection = undefined
    }
  })

  ctx.effect(() => {
    try {
      const disposeTree = ctx.webServer.register({
        kind: 'exact',
        path: '/gameassist/knowledge/tree',
        handler: (_req: any, res: any): void => {
          const respond = (): void => {
            const body = JSON.stringify({ libraries })
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' })
            res.end(body)
          }
          if (libraries.length === 0) {
            void refresh().then(respond).catch(respond)
          } else {
            respond()
            void refresh()
          }
        },
      })
      diag('route registered: /gameassist/knowledge/tree')
      const disposeNode = ctx.webServer.register({
        kind: 'exact',
        path: '/gameassist/knowledge/node',
        handler: (req: any, res: any): void => {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const resolved = resolveLibraryNode(kbRoot, url.searchParams.get('path') ?? '')
          if (resolved === null) {
            res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ ok: false, error: 'missing or invalid path' }))
            return
          }
          void readFile(resolved.abs, 'utf8')
            .then(content => {
              res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' })
              res.end(JSON.stringify({
                ok: true,
                library: resolved.library,
                rel: resolved.rel,
                title: extractTitle(content, resolved.rel),
                content: stripBom(content),
              }))
            })
            .catch(() => {
              res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ ok: false, error: 'node not found' }))
            })
        },
      })
      diag('route registered: /gameassist/knowledge/node')
      return () => {
        disposeTree()
        disposeNode()
        diag('routes disposed')
      }
    } catch (error) {
      diag(`route registration FAILED: ${String(error)}`)
      return () => {}
    }
  })

  ctx.effect(() => {
    const disposeList = ctx.tools.register({
      name: 'kb_list',
      description: '列出所有知识库的完整目录树（标题与路径，不含正文）。需要了解有哪些设定节点时调用。',
      parameters: { type: 'object', properties: {} },
      output: { schema: { type: 'string' }, render(_a: unknown, v: string) { return [{ type: 'text', text: v }] } },
      execute: async () => {
        await refresh()
        return renderTree(libraries)
      },
    })
    diag('tool registered: kb_list')
    const disposeRead = ctx.tools.register({
      name: 'kb_read',
      description: '读取知识库一个节点的全文。参数 path 形如「库名/目录/节点名」（.md 后缀可省略）。主人拖拽「仅路径」引用后用它取正文。',
      parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
      output: { schema: { type: 'string' }, render(_a: unknown, v: string) { return [{ type: 'text', text: v }] } },
      execute: async (args: { path: string }) => {
        const resolved = resolveLibraryNode(kbRoot, args.path)
        if (resolved === null) return 'path 参数不合法：应形如「库名/目录/节点名」，且不得包含 .. 等越界段。'
        try {
          const content = stripBom(await readFile(resolved.abs, 'utf8'))
          return `〔kb-node〕${resolved.library}/${resolved.rel}\n\n${content}`
        } catch {
          return `节点不存在：${resolved.library}/${resolved.rel}（可用 kb_list 查看现有节点路径）`
        }
      },
    })
    const disposeWrite = ctx.tools.register({
      name: 'kb_write',
      description: '在知识库中写入或更新一个节点。path 形如「库名/目录/节点名」（.md 后缀可省略）；content 为完整 Markdown 正文（建议首行写成「# 标题」，否则用 title 参数自动补标题行）；目录不存在时自动创建。',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          content: { type: 'string' },
          title: { type: 'string' },
        },
        required: ['path', 'content'],
      },
      output: { schema: { type: 'string' }, render(_a: unknown, v: string) { return [{ type: 'text', text: v }] } },
      execute: async (args: { path: string; content: string; title?: string }) => {
        const resolved = resolveLibraryNode(kbRoot, args.path)
        if (resolved === null) return 'path 参数不合法：应形如「库名/目录/节点名」，且不得包含 .. 等越界段。'
        let content = stripBom(args.content)
        if (!/^#\s+\S/m.test(content) && args.title !== undefined && args.title !== '') {
          content = `# ${args.title}\n\n${content}`
        }
        if (content.length > MAX_NODE_BYTES) return `节点过大（${content.length} 字节），上限 ${MAX_NODE_BYTES} 字节；请拆分成多个节点。`
        try {
          await mkdir(dirname(resolved.abs), { recursive: true })
          await writeFile(resolved.abs, content, 'utf8')
          void refresh()
          return `已写入节点 ${resolved.library}/${resolved.rel}（${content.length} 字节）。`
        } catch (error) {
          return `写入失败：${String(error)}`
        }
      },
    })
    return () => {
      disposeList()
      disposeRead()
      disposeWrite()
    }
  })
}
