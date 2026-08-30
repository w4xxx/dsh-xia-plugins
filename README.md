# dsh-xia-plugins

[English](README.en.md) | 中文

一套 **DeepSeek Harness（DSH）原创插件**，围绕「游戏开发助手小夏」场景：樱花皮肤与陪伴式提醒、树状知识库、每日角色轮值、持久记忆、全局代理修复。

## 包含的插件

| 包 | 层次 | 一句话 |
|---|---|---|
| [`@w4xxx/dsh-client-game-assistant`](packages/client-game-assistant/README.md) | Web client | 樱花主题、审批/任务/回答提醒、消息朗读、语音设置 |
| [`@w4xxx/dsh-client-gameassist-knowledge`](packages/client-gameassist-knowledge/README.md) | Web client | 知识库 📚 面板与拖拽引用 |
| [`@w4xxx/dsh-gameassist-knowledge`](packages/gameassist-knowledge/README.md) | Host | 树状 Markdown 知识库（数据面 + 工具 + HTTP） |
| [`@w4xxx/dsh-gameassist-memory`](packages/gameassist-memory/README.md) | Host（preset） | 单文件持久记忆（interests/tasks/works…） |
| [`@w4xxx/dsh-gameassist-roster`](packages/gameassist-roster/README.md) | Host（preset） | 每日角色轮值与 voice-map |
| [`dsh-global-proxy`](packages/global-proxy/README.md) | Host（进程级） | undici 全局代理（修复 Node 不走系统代理） |

每个包都有独立的中文 `README.md` 与英文 `README.en.md`，含配置表、工具/路由/slot 清单、数据与安全、构建测试与已知限制。

## 架构：DSH checkout overlay

DSH 的生态依赖（`@deepseek-ai/cordis`、`@deepseek-ai/schemastery`、`@deepseek-ai/dsh-client-ui-renderer` 等）**尚未发布到 npm**，本仓库也无法独立 `pnpm install` 它们。因此本仓库以 **overlay** 方式与 DSH 源码树协作：

- 本仓库只包含 6 个插件的**源码、文档、测试与构建配置**；
- 构建与测试在 **DSH checkout 环境**内进行（把本仓库的包覆盖/链接进 checkout，跑 DSH 的 `pnpm install` + `build:lib:host/client` + vitest）；
- 这样每次 CI 都顺带验证了与官方 DSH 的**真实兼容性**。

## 集成方式

### 方式一：overlay 进 DSH checkout（推荐，用于构建/测试）

```bash
# 把本仓库 packages/* 同步进你的 DSH checkout（Windows）
node scripts/integrate.mjs --checkout D:/mycode/deepseek-harness-master
# 然后按 DSH 常规流程：pnpm install && pnpm run build:lib:host && pnpm run build:lib:client
```

`scripts/integrate.mjs` 会按映射表把 6 个包复制到 checkout 的 `packages/companion|client` 对应目录（默认跳过 node_modules）。

### 方式二：profile patch 装配

在 `~/.dsh/profiles/web/` 的 `cordis.patch.yml` 中插入需要启用的插件（host 层与 web 层各有对应写法，见各包 README）。

### 方式三：运行时注入（开发用）

装了 `dsh-super-injector` 时，可用 `dev_inject_plugin` 把任意包目录（含 `package.json` 与 `lib/`）运行时注入。

## 目录结构

```
dsh-xia-plugins/
├─ packages/
│  ├─ gameassist-knowledge/        # Host：知识库数据面
│  ├─ gameassist-memory/           # Host：持久记忆
│  ├─ gameassist-roster/           # Host：每日角色轮值（含虚构示例卡）
│  ├─ client-game-assistant/       # Web：小夏皮肤与提醒
│  ├─ client-gameassist-knowledge/ # Web：知识库面板
│  └─ global-proxy/                # Host：undici 全局代理
├─ scripts/integrate.mjs           # overlay 同步脚本
├─ LICENSE / NOTICE.md
└─ third-party-licenses/           # DeepSeek Harness / Cordis / Schemastery / undici 的 MIT 全文
```

## 发布状态

- 本仓库当前为**源码分发**，6 个包尚未发布到 npm；
- 包名沿用 `@w4xxx` 自有 scope（DSH 官方 `@deepseek-ai` 无发布权）；
- 角色卡仅含**虚构原创示例**（`packages/gameassist-roster/cards/xia.example.json`），不包含任何真实作品角色；
- 视觉元素（花瓣、铃声）为纯 CSS / Web Audio 合成，不含字体、图片或录音资产。

## 许可证

MIT + NOTICE。详见 [LICENSE](LICENSE) 与 [NOTICE.md](NOTICE.md)；第三方依赖的许可证全文见 [third-party-licenses/](third-party-licenses/)。
