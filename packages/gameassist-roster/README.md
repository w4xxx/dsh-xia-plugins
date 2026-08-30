# gameassist-roster

[English](README.en.md) | 中文

`gameassist-roster` 是小夏游戏开发助手的每日轮值角色插件。它从外部目录读取角色卡，按本地日历日期稳定选出一张，将角色设定加入系统提示词，并提供名单、临时换角和语音映射接口。

> 当前包**尚未发布到 npm**；本仓库为源码分发，包名使用自有 `@w4xxx` scope。装配（Loader/preset）中的包名请以 package.json 为准。

## 功能与运行方式

- 插件加载时读取 `cardsDir` 顶层按文件名排序的 `*.json`；每张卡只读取一次，损坏的卡会跳过，目录不可读或无有效卡时回退到小夏原本人设提示。
- 未临时覆盖时，以进程所在机器的本地日期 `YYYY-MM-DD` 哈希选择角色；同一日期和同一组卡会得到稳定结果。
- 系统提示词段 `gameassist:roster`（顺序 `10`）包含日期、角色卡和「底层身份仍是小夏」的扮演规则。
- `roster_pick` 会重新注册提示词段；插件卸载时会注销提示词、工具和 HTTP 路由。
- 需要 `systemPrompt`、`tools`、`webServer` 三个 Cordis 服务。

## 配置与接入

唯一配置项是 `cardsDir: string`。建议使用外部绝对路径；角色卡不在包的发布文件清单中，部署方必须自行提供并备份该目录。

Loader/profile patch 示例：

```yaml
- insert:
    - id: gameassist-roster
      name: '@your-scope/gameassist-roster'
      config:
        cardsDir: 'D:/dsh-data/gameassist/cards'
```

Agent preset 的 `agent.cordis.yml` 也可挂载该行：

```yaml
- id: gameassist-roster
  name: '@your-scope/gameassist-roster'
  config:
    cardsDir: 'D:/dsh-data/gameassist/cards'
```

本插件不提供 Cordis service，因此不需要 `isolate` realm；但它注册固定 HTTP 路径，且临时覆盖保存在插件实例中，所以同一进程不应挂载多个会争用该路由的实例。实际组合还必须在该行的可见上下文中提供三个必需服务。

## 角色卡格式

每个文件是一份 UTF-8 JSON 对象。`id` 与 `name` 必填，其余字段可选：

```json
{
  "id": "example-heroine",
  "name": "示例角色",
  "source": "作品名",
  "cv": "声优名",
  "role": "游戏开发职责",
  "appearance": "外貌摘要",
  "personality": ["性格要点"],
  "speech": {
    "callsUser": "主人",
    "style": "说话风格",
    "catchphrases": ["口头禅"]
  },
  "devSkill": "开发专长",
  "playbook": ["扮演要点"],
  "taboo": ["禁止事项"],
  "voice": {
    "name": "系统语音名称",
    "voiceURI": "系统语音 URI",
    "lang": "zh-CN",
    "rate": 1,
    "pitch": 1
  }
}
```

实现只做 TypeScript 类型断言，不对 JSON 字段做运行时 schema 校验；结构错误但可解析的卡可能在使用时产生异常或不完整输出。文件名决定加载顺序，`id` 应在目录内唯一。

## 工具与路由

### `roster_list`

无参数。返回全部有效卡的 `id`、名称和出处，并以 `← 今日` 标记日期算法选出的基准角色；这个标记不反映 `roster_pick` 的临时覆盖。

### `roster_pick`

参数：

- `id?: string`：切换到指定卡；未知 id 返回可用列表。
- `random?: boolean`：未传 `id` 时都会随机重抽，并尽量避开当前角色；实现不读取 `random` 的布尔值，因此 `random: false` 也会重抽。

覆盖是插件实例内、进程级的临时状态，不按会话隔离，也不写盘；共享该实例的会话都会看到新提示词。覆盖持续到再次换角或插件卸载/进程重启，没有“恢复当天默认值”的独立操作。

### `GET /gameassist/voice-map`

返回：

```json
{
  "today": "example-heroine",
  "cardName": "示例角色",
  "voices": {
    "example-heroine": {
      "name": "系统语音名称",
      "voiceURI": "系统语音 URI",
      "lang": "zh-CN",
      "rate": 1,
      "pitch": 1
    }
  }
}
```

`today` 和 `cardName` 会反映当前覆盖；没有卡时均为 `null`。`voices` 只包含声明了 `voice` 的卡。响应为 UTF-8 JSON，带 `cache-control: no-cache`，路由本身不做鉴权。

## 提示词、模型与缓存

角色卡正文和固定扮演规则会进入每次模型请求的系统提示词，两个工具的 schema 也对模型可见；提示词 token 成本随卡片字段长度增长。名单稳定时前缀可复用；调用 `roster_pick` 改写提示词后，后续请求从该段起不能复用旧前缀。插件没有定时器：跨过本地午夜不会自动重新注册提示词，因此长寿命进程中的提示词可能仍显示前一天角色，直到换角或重载；未覆盖时，`roster_list` 和 `/gameassist/voice-map` 会按请求时的日期重新计算。

## 数据、持久化与隐私

插件只读 `cardsDir`，不修改角色卡，也不持久化每日选择或临时覆盖。卡片内容会进入模型请求；语音配置会通过无鉴权的 HTTP 路由提供给能访问 Web 服务的客户端。不要在角色卡中存放秘密、凭据或不应发送给模型/浏览器的数据。

角色名称、作品名、声优、台词、形象描述和语音资源可能涉及著作权、商标、人格权或其他内容/IP 权利。创建、分发和使用角色卡及关联资源的责任由部署者承担；本包不附带角色卡，也不授予第三方内容许可。

## 源码、构建与测试

- [`src/index.ts`](src/index.ts)：配置、日期选择、卡片渲染、提示词、工具和路由。
- [`tests/roster.spec.ts`](tests/roster.spec.ts)：日期键、稳定选择、跨日分散与卡片渲染测试。
- [`tsconfig.json`](tsconfig.json) 与 [`tsdown.config.ts`](tsdown.config.ts)：先由 TypeScript 输出 `lib/types`，再由 tsdown 生成 Node ESM `lib/index.js`。

从仓库根目录运行：

```sh
pnpm exec vitest run packages/companion/gameassist-roster/tests/roster.spec.ts
pnpm --filter @w4xxx/dsh-gameassist-roster bundle
```

`bundle` 依赖先生成的 `lib/types/index.js`；完整仓库构建应使用根级 `pnpm run build`。

## 已知限制与延期工作

- 卡片只在插件加载时读取；新增、删除或编辑文件不会热更新。
- 午夜不会刷新已注册的提示词，且临时覆盖不会在午夜自动清除。
- 临时覆盖是进程级状态，不是会话级状态，也没有持久化或显式清除操作。
- JSON 没有运行时字段校验、重复 id 检查或内容长度限制；坏卡只在 JSON 解析失败时被跳过。
- 固定 `/gameassist/voice-map` 路由和进程级覆盖使多实例挂载不安全。
- 日期选择依赖加载顺序与卡片集合；改文件名、增删卡片或重复 id 会改变结果。
- 当前测试覆盖纯逻辑，不覆盖真实 Loader 组合、路由生命周期或多会话覆盖行为。
