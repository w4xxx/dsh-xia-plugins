# 游戏助手知识库 Client

[English](README.en.md) | 中文

`@w4xxx/dsh-client-gameassist-knowledge` 是小夏游戏助手知识库的 Web Client 插件。它在会话输入区提供 📚 按钮、树面板和双区域拖放引用，把路径引用或带正文引用插入当前草稿。

> 此仓库中的 `@deepseek-ai/*` 包名是开发标识，不代表这些包已发布到公共 npm registry。若要公开发布，应改用维护者自己拥有的 scope，并同步更新配置与依赖引用。

## Client 与 Host

本包只拥有浏览器界面。配套 Host 包 [`@w4xxx/dsh-gameassist-knowledge`](../../companion/gameassist-knowledge/README.md) 扫描和写入 Markdown、注册模型工具与提示词，并提供 `/gameassist/knowledge/tree` 和 `/gameassist/knowledge/node`。Client 硬依赖这两个同源路由，没有 Host 时不能加载树或全文，也不提供本地回退。

本包的 Node face `apply()` 为空，仅让 Loader 挂载包；浏览器 face 由 `package.json` 的 `dsh.client` 和 `./client` export 发现。`./invariant` 注册包所有权，但没有运行时关系检查，因为 UI 条目由 Cordis slot 生命周期持有。

## 功能

- 在 `conversation.input.left` 插入 📚 开关；在 `conversation.input.dock` 插入最多 300px 高的知识库面板。
- 多库以标签切换，目录可展开/折叠，节点标题来自 Host 树响应。
- 节点按钮支持仅路径引用和附全文引用；HTML5 拖拽会打开全屏双区域投放层。
- 仅路径格式为 `〔kb-ref〕库名/相对路径`；附全文格式在该行后加入 `<kb-content>...</kb-content>`。
- 引用追加到当前草稿；空草稿直接写入，非空草稿前加换行。通知显示 1.8 秒。
- 空白会话首页隐藏按钮与面板，避免覆盖 workspace picker。
- 样式使用 Web Client 主题 alias tokens；React、Cordis 和 slot 基础设施由动态 Client 运行时提供。

## 要求

- Harness Web Client、React 18、Cordis slot registry。
- `@deepseek-ai/dsh-client-ui-theme`、`@deepseek-ai/dsh-client-ui-conversation`、`@deepseek-ai/dsh-client-ui-layout` Client 依赖；manifest 将它们列在 `dsh.client.inject` 中。
- 同一 origin 上已挂载配套 Host 路由。
- 浏览器支持 `fetch`、HTML5 drag-and-drop、`window` 事件和计时器。

## Loader / Profile patch

先让 Web profile 能解析本地 Host 与 Client workspace 包，再把条目合并进 `$DSH_HOME/profiles/web/cordis.patch.yml`。不要覆盖已有无关 patch。Host 条目必须配置实际知识库根目录。

```yaml
- insert:
    - id: gameassist-knowledge
      name: '@w4xxx/dsh-gameassist-knowledge'
      config:
        kbRoot: 'E:/knowledge-bases'

    - id: client-gameassist-knowledge
      name: '@w4xxx/dsh-client-gameassist-knowledge'
```

Client 没有运行时配置字段。`dsh.client.platform` 固定为 `web`，浏览器注入依赖由包 manifest 声明。可用 `dsh --profile web --dump-config` 检查 Loader 树。源码集成还需要 `tsconfig.client.json` 引用和承载 bundle 对该包的依赖；不要把它当成独立应用启动。

## Slots 与交互格式

| Slot | id | order | 内容 |
|---|---|---:|---|
| `conversation.input.left` | `gameassist-knowledge` | 20 | 📚 开关按钮 |
| `conversation.input.dock` | `gameassist-knowledge-panel` | 10 | 树面板与拖放 overlay |

插件只声明 `inject = ['slots']`，并用 `ctx.slots.inject()` 等待 slot 声明后注册。fiber dispose 后两个条目都会移除。

```text
〔kb-ref〕library/path/node.md
```

```text
〔kb-ref〕library/path/node.md
<kb-content>
# Node title
...
</kb-content>
```

仅路径引用依赖模型随后使用 Host 的 `kb_read`；附全文引用会直接把 Host 返回的正文放进用户草稿。

## 路由与缓存行为

- `GET /gameassist/knowledge/tree` 在面板打开和点击刷新时请求，使用 `cache: 'no-store'`。成功响应写入模块级 `treeCache`。
- `GET /gameassist/knowledge/node?path=...` 在附全文时请求，使用 `encodeURIComponent` 编码组合路径与 `cache: 'no-store'`。
- 树请求失败时返回最后一次模块级缓存；没有缓存时保持当前 UI 数据。节点请求失败不回退到缓存，只显示失败通知。
- 面板开关和树缓存是模块级状态，不按 session 隔离；面板组件自己的 active library、展开项、拖拽和通知状态是 React 本地状态。

## 数据与安全

Client 不直接访问文件系统，也不持久化知识库。它信任 Host 返回的 JSON，并把节点正文作为纯文本写入草稿；React 文本渲染不会把标题或正文当作 HTML。附全文会把整个节点内容发送到当前会话，因此用户应在发送前检查草稿，Host 部署也必须限制敏感库与路由访问。

路由是相对 URL，因此请求发往当前 GUI origin。Client 不增加认证、CSRF 保护、内容大小检查、schema 验证或权限过滤；这些责任属于 Host、Web Server 与部署边界。Host 的路径保护是词法级的，符号链接或 Windows junction 可能逃逸 `kbRoot`；参见 Host README 的安全说明。

## 开发、构建与测试

在仓库根目录运行：

```sh
pnpm --filter @w4xxx/dsh-client-gameassist-knowledge bundle
pnpm --filter @w4xxx/dsh-client-gameassist-knowledge watch
pnpm exec vitest run packages/client/gameassist-knowledge/tests/apply.client.spec.ts
pnpm exec tsc -b packages/client/gameassist-knowledge/tsconfig.json
```

`bundle` 使用共享 `clientBundle` 生成 `lib/index.js`、`lib/invariant.js` 和动态浏览器产物 `lib/client.js`。`watch` 只重建包；实时 GUI 更新还要求同一 checkout 的 Web 开发重建链正在运行。测试验证 `inject`、两个 slot 注册及 dispose 清理，不覆盖 fetch、渲染、点击、拖放或多会话行为。

## Model Experience

### 用户消息中的知识库引用

#### What the model sees

Client 本身不注册系统提示词或模型工具。它间接改变模型输入：仅路径模式把 `〔kb-ref〕library/path.md` 加入用户草稿，附全文模式再加入 `<kb-content>` 块和完整节点正文。路径的解释约定与 `kb_read` 能力由配套 Host 提供。

#### Token effect

关闭面板或不引用节点时直接 token 开销为零。仅路径模式增加一行短引用；附全文模式增加路径、标签和完整正文，开销随节点长度增长。内容只有在用户发送修改后的草稿后才进入会话。

#### KV Cache effect

新引用作为新的用户消息内容追加，不修改先前已记录的消息。它通常保留此前可复用前缀，但增加后续请求长度；编辑尚未发送的草稿没有模型或 KV cache 影响。实际缓存能力与淘汰由模型提供方决定。

## Known Limitations and Deferred Work

- **依赖 Host 路由** — 没有 `/gameassist/knowledge/tree` 和 `/gameassist/knowledge/node` 时，树和全文不可用；没有离线后端或独立错误页面。
- **模块级状态跨 session** — 面板开关与树缓存由同一浏览器模块共享，不按会话隔离。
- **测试范围窄** — 当前测试只验证 slot 生命周期，不覆盖网络失败、草稿插入、可访问性、拖放或真实 Web 组合。
- **无 Client 配置与运行时校验** — 路由固定，响应只做最小字段检查，Host/Client 版本不匹配可能表现为空树或读取失败。
- **Host 文件边界风险传递** — Client 能请求 Host 暴露的节点；Host 只做词法路径保护，symlink/junction 逃逸风险必须由部署方处理。
- **公共发布身份未确定** — `@deepseek-ai` 仅是仓库开发标识；公共 registry 发布必须使用维护者拥有的 scope，并更新 Host/Client、patch 和 manifest 引用。
