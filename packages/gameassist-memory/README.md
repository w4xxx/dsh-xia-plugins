# gameassist-memory

[English](README.en.md) | 中文

`gameassist-memory` 为小夏游戏开发助手提供一个轻量持久记忆库。它把兴趣、偏好、备注、任务和过去作品保存在单个 JSON 文件中，将摘要加入系统提示词，并提供读取和更新工具。

> 当前包**尚未发布到 npm**；本仓库为源码分发，包名使用自有 `@w4xxx` scope。装配（Loader/preset）中的包名请以 package.json 为准。

## 功能与运行方式

- 插件加载时读取 `memoryFile` 一次；文件缺失、不可读或 JSON 解析失败时以内存中的空记忆启动。
- 系统提示词段 `gameassist:memory`（顺序 `11`）呈现当前摘要，并要求助手主动记录新信息和任务状态变化。
- `memory_update` 更新内存、写回 JSON，然后重新注册提示词段；下一次模型请求会看到新内容。
- 插件卸载时注销提示词和两个工具。
- 需要 `systemPrompt` 和 `tools` 两个 Cordis 服务。

## 记忆卫生约定（Memory Hygiene）

插件在系统提示词里向助手注入了固定约定，帮助记忆保持精简、可维护：

- **记忆只放状态**：任务/作品用一句话记清「当前进度 + 下一步」；逐日开发日志、变更细节、踩坑记录一律写入知识库或项目文档，不塞进记忆。
- **更新而非新增**：同一条任务更新状态时按 `taskId` 修改原有条目，不要反复新建同名任务（否则记忆会越堆越杂，注入 token 成本也随之上涨）。
- **截断兜底**：即便记忆里积压了长文本，注入摘要也会按 `maxNoteChars`/`maxSummaryChars` 截断，完整内容可随时用 `memory_read` 取回。

这条约定同样写在 `memory_update` 的工具描述里，助手每次调用都会看到。

## 配置与接入

配置项：

- `memoryFile: string`（必需）：单个 JSON 记忆文件的绝对路径。保存时会递归创建父目录。
- `maxNoteChars: number`（可选）：注入系统提示词时，每条任务 `notes` 最多保留的字符数。默认 `200`；设 `0` 完全隐藏 notes。完整内容仍可通过 `memory_read` 工具读取。
- `maxSummaryChars: number`（可选）：注入系统提示词时，每条作品 `summary` 最多保留的字符数。默认 `120`；设 `0` 完全隐藏 summary。完整内容仍可通过 `memory_read` 工具读取。

> 截断只影响注入的系统提示词摘要，磁盘上的记忆文件始终保留完整内容，`memory_read` 也始终返回完整内容。这样记忆库再大也不会拖垮每次对话的 token，需要细节时随时用工具取。

Loader/profile patch 示例：

```yaml
- insert:
    - id: gameassist-memory
      name: '@your-scope/gameassist-memory'
      config:
        memoryFile: 'D:/dsh-data/gameassist/memory.json'
```

Agent preset 的 `agent.cordis.yml` 示例：

```yaml
- id: gameassist-memory
  name: '@your-scope/gameassist-memory'
  config:
    memoryFile: 'D:/dsh-data/gameassist/memory.json'
    maxNoteChars: 200
    maxSummaryChars: 120
```

本插件不提供 Cordis service，因此不需要 `isolate` realm。若多个 preset 或 Loader 行指向同一文件，它们仍是独立内存副本，且没有跨实例协调；应只挂载一个写入者，或为每个实例配置不同文件。

## JSON 数据格式

文件是一份 UTF-8 JSON 对象，成功保存时采用两空格缩进并以换行结尾：

```json
{
  "interests": ["游戏开发", "二次元"],
  "preferences": ["中文交流"],
  "profileNotes": "称呼用户为主人。",
  "tasks": [
    {
      "id": "forum-game",
      "title": "推进论坛游戏",
      "status": "doing",
      "notes": "打磨第一战",
      "updatedAt": "2026-08-30T00:00:00.000Z"
    }
  ],
  "works": [
    {
      "id": "my-forum-game",
      "name": "My Forum Game",
      "kind": "游戏",
      "summary": "论坛题材游戏",
      "tech": ["Godot 4.7", "GDScript"],
      "path": "D:/projects/my-forum-game",
      "status": "开发中",
      "updatedAt": "2026-08-30T00:00:00.000Z"
    }
  ],
  "updatedAt": "2026-08-30T00:00:00.000Z"
}
```

实现对读入 JSON 只做 TypeScript 类型断言，不做运行时 schema 校验或迁移。可解析但缺字段/字段类型错误的文件可能在提示词渲染或更新时失败。

## 工具与更新语义

### `memory_read`

无参数。返回当前内存摘要；它不重新读取磁盘。

### `memory_update`

所有字段都可选，但至少要提供一个非 `undefined` 值：

- `interests`、`preferences`：用逗号、中文逗号、顿号、分号或换行切分。**一旦提供就替换整个列表**；传空字符串会清空列表，而不是追加。
- `profileNotes`：替换整段备注；空字符串会清空。
- `taskId`、`taskTitle`、`taskStatus`、`taskNotes`：按 `taskId` 更新任务。找不到 id 时，只有提供 `taskTitle` 才创建；未给 id 时自动生成 `t...` id，新任务状态默认 `todo`。
- `removeTaskId`：按 id 删除任务。
- `workId`、`workName`、`workKind`、`workSummary`、`workTech`、`workPath`、`workStatus`：按 `workId` 更新作品。找不到 id 时，只有提供 `workName` 才创建；未给 id 时自动生成 `w...` id。
- `workTech`：与兴趣/偏好相同，提供后替换该作品的整个技术列表；空字符串会清空。
- `removeWorkId`：按 id 删除作品。

删除在同一次调用的 upsert 之前执行，因此同时删除某 id 并提供足以创建的字段时，可以重新创建该 id。每次有效更新都会刷新文档的 `updatedAt`；实际新增或更新的任务/作品也会刷新各自时间。状态字符串没有枚举限制。

## 提示词、模型与缓存

记忆摘要和固定记录指令会进入每次模型请求的系统提示词，两个工具的 schema 也对模型可见。token 成本随兴趣、任务、作品及备注长度线性增长；**注入摘要默认按 `maxNoteChars`/`maxSummaryChars` 截断**（默认 200/120 字符），超出部分不会进入提示词，需要完整内容时调用 `memory_read`。记忆不变时前缀稳定；`memory_update` 改写提示词后，后续请求从该段起不能复用旧前缀。工具结果也会把更新后的完整摘要返回到当前会话。

## 持久化、隐私与安全

所有记忆存放在 `memoryFile` 指向的**一个 JSON 文件**中。保存直接调用 `writeFile` 覆盖目标文件，不采用临时文件加原子替换，也没有文件锁、事务、并发写入合并或跨进程同步；进程中断、磁盘故障或多个写入者竞争可能留下截断文件或丢失更新。请在外层做备份并确保只有一个写入者。

该文件可能包含个人偏好、项目路径、任务、作品和自由文本备注；摘要会发送给所选模型，并可能出现在工具结果、会话日志或 UI 中。将文件放在权限受控的位置，避免存放凭据和不必要的敏感信息，**不要把私人记忆文件提交到版本控制**。仓库或插件包只应包含脱敏示例。

## 源码、构建与测试

- [`src/index.ts`](src/index.ts)：配置、数据类型、摘要渲染、更新语义、读写和工具注册。
- [`tests/memory.spec.ts`](tests/memory.spec.ts)：列表切分、全量替换、任务 upsert/删除和作品渲染测试。
- [`tsconfig.json`](tsconfig.json) 与 [`tsdown.config.ts`](tsdown.config.ts)：先由 TypeScript 输出 `lib/types`，再由 tsdown 生成 Node ESM `lib/index.js`。

从仓库根目录运行：

```sh
pnpm exec vitest run packages/companion/gameassist-memory/tests/memory.spec.ts
pnpm --filter @w4xxx/dsh-gameassist-memory bundle
```

`bundle` 依赖先生成的 `lib/types/index.js`；完整仓库构建应使用根级 `pnpm run build`。

## 已知限制与延期工作

- 只支持一个完整 JSON 文档；没有多用户、命名空间、查询索引或历史版本。
- 文件只在插件加载时读取；外部修改不会热加载，`memory_read` 也不重新读盘。
- 写入非原子且无锁；并发工具调用、多个插件实例或多个进程可能覆盖彼此或损坏文件。
- 读入数据没有 schema 校验、大小限制或迁移；任意解析/读取错误都静默回退为空记忆。
- 兴趣、偏好和 `workTech` 是全列表替换，不提供单项追加/删除操作。
- 提示词摘要默认截断（`maxNoteChars`/`maxSummaryChars`），但仍不做敏感信息脱敏；完整内容始终保留在磁盘上。
- 当前测试覆盖纯更新逻辑，不覆盖真实 Loader 组合、文件 I/O 失败、并发写入或插件生命周期。
