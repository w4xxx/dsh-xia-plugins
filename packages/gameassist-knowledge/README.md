# 游戏助手知识库 Host

[English](README.en.md) | 中文

`@w4xxx/dsh-gameassist-knowledge` 是小夏游戏助手知识库的 Host 插件。它把文件系统目录解释为树状 Markdown 知识库，为模型注册紧凑的系统提示词索引与 `kb_list`、`kb_read`、`kb_write` 工具，并为配套 Client 面板提供 HTTP 路由。

> 此仓库中的 `@deepseek-ai/*` 包名是开发标识，不代表这些包已发布到公共 npm registry。若要公开发布，应改用维护者自己拥有的 scope，并同步更新配置与依赖引用。

## Host 与 Client

本包拥有数据、文件读写、模型工具、提示词和 Web 路由。配套浏览器包 [`@w4xxx/dsh-client-gameassist-knowledge`](../../client/gameassist-knowledge/README.md) 只负责界面，并依赖本包的 `/gameassist/knowledge/tree` 与 `/gameassist/knowledge/node` 路由；Client 不提供离线或独立数据后端。两包必须挂载到同一个 Web profile，Client 才能完整工作。

## 功能

- `kbRoot` 下每个非隐藏一级目录是一座知识库；目录是分支，`.md` 文件是节点，隐藏条目和非 Markdown 文件不进入树。
- 节点标题取首个 `# 标题`，支持 UTF-8 BOM；无标题时回退到文件名。知识库标题取其 `README.md` 标题，无可读 README 时回退到目录名。
- 扫描结果按目录优先、同类按中文 locale 名称排序；空目录不会出现在树中。
- 单节点扫描上限为 512 KiB；更大的文件不进入树。读取工具与节点路由按请求读取文件，写入工具拒绝超过该上限的内容。
- Cordis effect 持有全部注册；卸载 fiber 时提示词、路由和工具会释放。

## 要求

- 支持 ESM 与 Node.js `es2024` 目标的 Harness Host。
- Cordis、Schemastery，以及提供 `systemPrompt`、`tools`、`webServer` 服务的插件树。
- Host 进程可读写的绝对 `kbRoot` 路径。
- 若使用浏览器面板，还需要配套 Client 包及 Web profile。

## Loader / Profile patch

先让目标 profile 能解析这个本地 workspace 包，再把以下条目合并进 `$DSH_HOME/profiles/<profile>/cordis.patch.yml`。不要覆盖已有的无关 patch；profile patch 的相对模块解析基准不是本仓库，因此示例使用包名。

```yaml
- insert:
    - id: gameassist-knowledge
      name: '@w4xxx/dsh-gameassist-knowledge'
      config:
        kbRoot: 'E:/knowledge-bases'
```

用于 Web GUI 时，再加入配套 Client 条目：

```yaml
- insert:
    - id: client-gameassist-knowledge
      name: '@w4xxx/dsh-client-gameassist-knowledge'
```

可用 `dsh --profile web --dump-config` 检查最终插件树。源码集成时，本包由 `tsconfig.host.json` 引用；它不是独立应用入口，应通过 `dsh` profile 加载。

## 配置

| 字段 | 类型 | 必填 | 行为 |
|---|---|---:|---|
| `kbRoot` | `string` | 是 | 知识库根目录的绝对路径；每个一级子目录是一座库。当前 schema 只验证字符串，不验证绝对性、存在性或可写性。 |

根目录缺失或不可读时，扫描结果为空而不是加载失败。写入节点时会递归创建节点的父目录。

## 工具、路由与提示词

### 模型工具

- `kb_list()`：重新扫描并返回全部库的完整目录树、标题与路径，不返回正文。
- `kb_read({ path })`：读取单个节点全文；`path` 形如 `库名/目录/节点名`，`.md` 可省略。成功结果以 `〔kb-node〕库名/相对路径` 开头。
- `kb_write({ path, content, title? })`：创建或覆盖节点并递归创建目录。若正文没有 Markdown 一级标题且提供了非空 `title`，会自动前置 `# title`。

用户路径接受 `/` 或 `\`，禁止空段、`.` 和 `..`，并为缺少后缀的路径追加 `.md`。库名仅接受单词字符、中日韩统一表意文字、连字符、点与空格。

### HTTP 路由

- `GET /gameassist/knowledge/tree`：返回 `{ libraries }` JSON，响应带 `cache-control: no-cache`。首次空缓存时先刷新再响应；已有数据时先响应当前快照，再异步刷新。
- `GET /gameassist/knowledge/node?path=<库名/相对路径>`：返回节点标题和正文；无效路径为 400，不存在或不可读为 404，成功响应带 `cache-control: no-cache`。

这些路由没有包内认证或授权逻辑，依赖承载它们的 Web Server 部署边界。

### 系统提示词

插件注册 `gameassist:knowledge` 段，顺序为 `12`。它包含固定中文使用说明，以及库名、库标题、节点总数和每座库顶层条目的紧凑索引；正文只在调用工具或由 Client 附全文时进入上下文。

## 数据与安全

知识库是 `kbRoot` 下的普通 UTF-8 Markdown 文件，没有数据库、版本控制、锁、原子写入、身份隔离或并发冲突处理。`kb_write` 直接覆盖目标文件；部署方应负责备份、文件权限、可信用户边界和并发写策略。HTTP 节点路由会把正文返回给能访问该 Web Server 的调用者，模型工具也能读写 Host 进程有权限访问的节点。

路径保护是词法级的：实现拒绝 `.`、`..` 与解析后越出库目录的路径，但不会解析并校验真实路径。若 `kbRoot` 或其后代包含指向库外的符号链接或 Windows junction，读取、扫描或写入可能逃逸预期根目录。仅应在受信任、无此类重解析点的目录上使用，或在上层施加文件系统隔离。

Host 的诊断日志**默认关闭**；设置环境变量 `DSH_KB_DIAG_FILE` 为绝对路径才启用（写入失败会被静默忽略，不影响插件运行）。

## 开发、构建与测试

在仓库根目录运行：

```sh
pnpm --filter @w4xxx/dsh-gameassist-knowledge bundle
pnpm exec vitest run packages/companion/gameassist-knowledge/tests/knowledge.spec.ts
pnpm exec tsc -b packages/companion/gameassist-knowledge/tsconfig.json
```

`bundle` 使用 `tsdown.config.ts` 将 `lib/types/index.js` 打包为 Node ESM `lib/index.js`。测试覆盖 BOM/标题、路径解析与词法遍历保护、扫描、计数和文本渲染；它不启动真实 Loader、Web Server 或配套 Client。

## Model Experience

### 系统提示词知识库索引

#### What the model sees

模型看到固定的中文知识库使用说明，以及当前扫描结果生成的库级紧凑索引；索引只列库名、标题、节点总数和顶层目录或文件名，不含节点正文。扫描完成后该段被注册；后续刷新会更新内存树，但不会重新注册已存在的提示词段，因此同一插件生命周期内的提示词索引可能保持初次扫描内容。

#### Token effect

这是每次组装请求时存在的固定说明加数据依赖索引。开销随库数量与顶层条目数量增长，不随深层目录或正文长度增长。正文仅在 `kb_read` 工具结果或 Client 的 `<kb-content>` 引用中按需加入后续消息。

#### KV Cache effect

插件保持稳定时，该段位于系统提示词中的固定顺序，内容可形成可复用前缀。重新加载插件、改变初次扫描时的索引或改变更早的提示词段会改变前缀；普通节点正文编辑不会在本插件生命周期内重写已注册段。实际缓存能力与淘汰由模型提供方决定。

### 工具 schema 与工具结果

#### What the model sees

模型可见三个中文工具 schema：`kb_list` 无参数，`kb_read` 要求字符串 `path`，`kb_write` 要求 `path` 与 `content` 并可选 `title`。工具执行后，完整树、节点正文或写入状态作为工具结果进入会话。

#### Token effect

工具 schema 为每个可用请求增加固定开销。结果是条件性开销：`kb_list` 随完整树增长，`kb_read` 随节点正文增长，`kb_write` 只返回简短状态；工具参数中的正文也计入发出调用的模型输出与会话历史。

#### KV Cache effect

稳定的工具 schema 可保持请求前缀稳定；挂载、卸载或修改工具定义会改变该部分。工具调用和结果追加到会话历史，不替换之前的前缀，但会增加后续请求长度。实际缓存能力与淘汰由模型提供方决定。

## Known Limitations and Deferred Work

- **诊断日志默认关闭** — 仅当设置 `DSH_KB_DIAG_FILE` 时才写盘；该路径属于部署配置，不应指向公开目录。
- **路径保护不解析真实路径** — 词法检查不能阻止符号链接或 junction 逃逸；部署必须使用可信目录或外部隔离。
- **无内建认证和事务写入** — 路由依赖 Web Server 的访问边界，写入是直接覆盖且没有锁、原子提交、版本或冲突检测。
- **提示词索引可能陈旧** — 工具和路由刷新内存树，但已注册的系统提示词段只在初次异步扫描后生成一次。
- **大小限制口径不完全一致** — 扫描按文件系统字节数执行 512 KiB 上限，写入按 JavaScript 字符串长度比较并把它标为“字节”。
- **公共发布身份未确定** — `@deepseek-ai` 仅是仓库开发标识；公共 registry 发布必须使用维护者拥有的 scope，并更新所有 Host/Client 引用。
