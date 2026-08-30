/**
 * Knowledge-base browser half. A 📚 button on the composer tool row toggles
 * a tree panel in the input dock; clicking a node's buttons or dragging it
 * onto the two-zone overlay cites it into the draft — a path-only
 * `〔kb-ref〕` line the agent resolves through kb_read, or a full
 * `<kb-content>` block so the body rides along. Tree and bodies come from the
 * host plugin's /gameassist/knowledge routes.
 */
import React from 'react'
import styles from './styles.module.css'

/** Hard dependencies: the slot registry (the input kit arrives via provide). */
export const inject = ['slots']

/** Wire shapes served by the host knowledge plugin. */
interface KbNode {
  kind: 'dir' | 'file'
  name: string
  path: string
  title?: string
  size?: number
  children?: KbNode[]
}
interface KbLibrary {
  name: string
  title: string
  nodeCount: number
  nodes: KbNode[]
}
interface TreeResponse {
  libraries: KbLibrary[]
}

const TREE_ROUTE = '/gameassist/knowledge/tree'
const NODE_ROUTE = '/gameassist/knowledge/node'

// ── shared panel state (button and panel are separate slot entries) ────────

let panelOpen = false
const panelListeners = new Set<() => void>()
function setPanelOpen(next: boolean): void {
  panelOpen = next
  for (const listener of panelListeners) listener()
}
function usePanelOpen(): boolean {
  const [value, setValue] = React.useState(panelOpen)
  React.useEffect(() => {
    const listener = (): void => { setValue(panelOpen) }
    panelListeners.add(listener)
    return () => { panelListeners.delete(listener) }
  }, [])
  return value
}

let treeCache: KbLibrary[] | null = null
async function fetchTree(): Promise<KbLibrary[] | null> {
  try {
    const response = await fetch(TREE_ROUTE, { cache: 'no-store' })
    if (!response.ok) return null
    const body = await response.json() as TreeResponse
    const libraries = Array.isArray(body.libraries) ? body.libraries : []
    treeCache = libraries
    return libraries
  } catch {
    return treeCache
  }
}

async function fetchNode(library: string, rel: string): Promise<string | null> {
  try {
    const response = await fetch(`${NODE_ROUTE}?path=${encodeURIComponent(`${library}/${rel}`)}`, { cache: 'no-store' })
    if (!response.ok) return null
    const body = await response.json() as { ok?: boolean; content?: string }
    return body.ok === true && typeof body.content === 'string' ? body.content : null
  } catch {
    return null
  }
}

/** Path-only citation line the agent resolves through kb_read. */
function pathRef(library: string, rel: string): string {
  return `〔kb-ref〕${library}/${rel}`
}

/** Full-content citation: the agent skips kb_read for this one. */
function fullRef(library: string, rel: string, content: string): string {
  return `〔kb-ref〕${library}/${rel}\n<kb-content>\n${content}\n</kb-content>`
}

/** Drag payload riding the HTML5 dataTransfer. */
interface DragPayload {
  library: string
  path: string
}

// ── tree rendering ──────────────────────────────────────────────────────────

function TreeNode(props: any): any {
  const { library, node, depth, expanded, onToggle, onCitePath, onCiteFull, onDragStart } = props
  const indent = { paddingLeft: `${6 + depth * 14}px` }
  if (node.kind === 'dir') {
    const isOpen = expanded[node.path] ?? false
    return React.createElement('div', null,
      React.createElement('div', {
        className: styles.dirRow,
        style: indent,
        role: 'button',
        tabIndex: 0,
        onClick: () => { onToggle(node.path) },
        onKeyDown: (event: any) => {
          if (event.key === 'Enter' || event.key === ' ') onToggle(node.path)
        },
      },
        React.createElement('span', { className: styles.caret }, isOpen ? '▾' : '▸'),
        React.createElement('span', { className: styles.dirName }, `📁 ${node.name}`),
      ),
      isOpen
        ? (node.children ?? []).map((child: KbNode) => React.createElement(TreeNode, {
          key: child.path,
          library,
          node: child,
          depth: depth + 1,
          expanded,
          onToggle,
          onCitePath,
          onCiteFull,
          onDragStart,
        }))
        : null,
    )
  }
  return React.createElement('div', {
    className: styles.fileRow,
    style: indent,
    draggable: true,
    title: `${node.path}（拖拽或点击按钮引用）`,
    onDragStart: (event: any) => {
      event.dataTransfer.setData('application/x-kb-ref', JSON.stringify({ library, path: node.path }))
      event.dataTransfer.effectAllowed = 'copy'
      onDragStart({ library, path: node.path })
    },
  },
    React.createElement('span', { className: styles.fileName }, `📄 ${node.title ?? node.name}`),
    React.createElement('span', { className: styles.actions },
      React.createElement('button', {
        type: 'button',
        className: styles.citeBtn,
        title: '引用路径（助手按需读正文）',
        onClick: () => { onCitePath(library, node) },
      }, '🔗'),
      React.createElement('button', {
        type: 'button',
        className: styles.citeBtn,
        title: '附全文（正文随消息带入）',
        onClick: () => { onCiteFull(library, node) },
      }, '📄'),
    ),
  )
}

// ── full-screen two-zone drop overlay ───────────────────────────────────────

function DragOverlay(props: any): any {
  const { onDropPath, onDropFull, onCancel } = props
  const [side, setSide] = React.useState<'path' | 'full' | null>(null)
  React.useEffect(() => {
    const finish = (): void => { onCancel() }
    window.addEventListener('dragend', finish)
    return () => { window.removeEventListener('dragend', finish) }
  }, [])
  const allow = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
  }
  return React.createElement('div', {
    className: styles.dragOverlay,
    onDragOver: allow,
    onDragLeave: () => { setSide(null) },
    onDrop: (event: any) => {
      event.preventDefault()
      event.stopPropagation()
      if (side === 'full') onDropFull()
      else onDropPath()
    },
  },
    React.createElement('div', {
      className: side === 'path' ? styles.dropZoneActive : styles.dropZone,
      onDragEnter: () => { setSide('path') },
      onDragOver: allow,
    }, '🔗 松开 = 仅路径引用'),
    React.createElement('div', {
      className: side === 'full' ? styles.dropZoneActive : styles.dropZone,
      onDragEnter: () => { setSide('full') },
      onDragOver: allow,
    }, '📄 松开 = 附全文引用'),
    React.createElement('button', {
      type: 'button',
      className: styles.dragCancel,
      onClick: onCancel,
    }, '取消'),
  )
}

// ── panel (input dock) ──────────────────────────────────────────────────────

function KnowledgePanel(props: any): any {
  const open = usePanelOpen()
  // Point-in-time draft snapshot from the InputZone owner currency — read as a
  // plain prop, NOT via the useInput hook, so the hook order stays stable
  // across the open/closed flip (a conditional `props.useInput?.()` call
  // crashes React when the hook appears mid-life).
  const draft = (props.input as { draft?: string } | undefined)?.draft ?? ''
  const inputActions = props.inputActions as { setDraft: (text: string) => void } | undefined
  const [libraries, setLibraries] = React.useState<KbLibrary[]>(() => treeCache ?? [])
  const [active, setActive] = React.useState<string | null>(null)
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [dragging, setDragging] = React.useState<DragPayload | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const noticeTimer = React.useRef<number | undefined>(undefined)
  const draftRef = React.useRef('')
  draftRef.current = draft

  React.useEffect(() => () => {
    if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current)
  }, [])

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    void fetchTree().then(next => {
      if (cancelled || next === null) return
      setLibraries(next)
      setActive(prev => (prev === null || !next.some(item => item.name === prev) ? (next[0]?.name ?? null) : prev))
    })
    return () => { cancelled = true }
  }, [open])

  const flash = (text: string): void => {
    setNotice(text)
    if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => { setNotice(null) }, 1800)
  }

  const insert = (text: string): void => {
    if (inputActions === undefined) return
    const draft = draftRef.current
    inputActions.setDraft(draft.trim() === '' ? text : `${draft}\n${text}`)
  }

  const citePath = (library: string, node: KbNode): void => {
    insert(pathRef(library, node.path))
    flash(`已引用「${node.title ?? node.name}」🔗`)
  }

  const citeFull = (library: string, node: KbNode): void => {
    void fetchNode(library, node.path).then(content => {
      if (content === null) {
        flash('读取节点失败 ❌')
        return
      }
      insert(fullRef(library, node.path, content))
      flash(`已附全文「${node.title ?? node.name}」📄`)
    })
  }

  if (!open) return null
  if ((props.session as { blank?: boolean } | undefined)?.blank === true) return null

  const library = libraries.find(item => item.name === active) ?? libraries[0]

  return React.createElement('div', { className: styles.panel },
    React.createElement('div', { className: styles.head },
      React.createElement('span', { className: styles.title }, '📚 知识库'),
      libraries.length > 1
        ? React.createElement('div', { className: styles.tabs },
          libraries.map(item => React.createElement('button', {
            key: item.name,
            type: 'button',
            className: item.name === library?.name ? styles.tabActive : styles.tab,
            title: item.title,
            onClick: () => { setActive(item.name) },
          }, item.name)),
        )
        : null,
      React.createElement('button', {
        type: 'button',
        className: styles.refresh,
        title: '刷新树',
        onClick: () => {
          void fetchTree().then(next => { if (next !== null) setLibraries(next) })
        },
      }, '⟳'),
    ),
    library === undefined
      ? React.createElement('p', { className: styles.hint }, '（还没有知识库节点。在知识库根目录建一个作品子目录、放入 .md 文件即可）')
      : React.createElement('div', { className: styles.tree },
        library.nodes.map((node: KbNode) => React.createElement(TreeNode, {
          key: node.path,
          library: library.name,
          node,
          depth: 0,
          expanded,
          onToggle: (path: string) => { setExpanded(prev => ({ ...prev, [path]: !(prev[path] ?? false) })) },
          onCitePath: citePath,
          onCiteFull: citeFull,
          onDragStart: (payload: DragPayload) => { setDragging(payload) },
        })),
      ),
    notice !== null ? React.createElement('div', { className: styles.notice }, notice) : null,
    dragging !== null
      ? React.createElement(DragOverlay, {
        onCancel: () => { setDragging(null) },
        onDropPath: () => {
          const payload = dragging
          setDragging(null)
          if (payload !== null) {
            insert(pathRef(payload.library, payload.path))
            flash('已引用路径 🔗')
          }
        },
        onDropFull: () => {
          const payload = dragging
          setDragging(null)
          if (payload !== null) {
            void fetchNode(payload.library, payload.path).then(content => {
              if (content === null) {
                flash('读取节点失败 ❌')
                return
              }
              insert(fullRef(payload.library, payload.path, content))
              flash('已附全文 📄')
            })
          }
        },
      })
      : null,
  )
}

// ── composer button (input left) ────────────────────────────────────────────

function KnowledgeButton(props: any): any {
  const open = usePanelOpen()
  // Hide on the blank-session hero (workspace picker screen): no composer
  // draft exists there, and the button/pad would overlap the picker.
  if ((props.session as { blank?: boolean } | undefined)?.blank === true) return null
  return React.createElement('button', {
    type: 'button',
    className: open ? styles.kbButtonActive : styles.kbButton,
    title: open ? '收起知识库' : '打开知识库（拖拽子节点引用给助手）',
    'aria-pressed': open,
    onClick: () => { setPanelOpen(!open) },
  }, '📚')
}

// ── plugin body ─────────────────────────────────────────────────────────────

export function apply(ctx: any): void {
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register(
    { name: 'conversation.input.left', id: 'gameassist-knowledge', order: 20 },
    KnowledgeButton,
  ))

  ctx.slots.inject('conversation.input.dock', () => ctx.slots.register(
    { name: 'conversation.input.dock', id: 'gameassist-knowledge-panel', order: 10 },
    KnowledgePanel,
  ))
}
