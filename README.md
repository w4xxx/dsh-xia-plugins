# dsh-xia-plugins

[English](README.en.md) | 中文

一套 **DeepSeek Harness（DSH）原创插件**，围绕「游戏开发助手小夏」场景：樱花皮肤与陪伴式提醒、树状知识库、每日角色轮值、持久记忆、全局代理修复。

## 为什么要用它：每天一位二次元女主角，陪你做游戏

一个人做游戏，最难受的不是 bug，是**孤单**。这套插件的核心就是这个——把你的工作会话变成有人陪的冒险：

- 🎀 **每天一位二次元女主角**：傲娇、元气、三无、软萌……每天随机一位动漫风角色，带着完整人设（性格、口癖、说话风格、开发专长）进入你的工作会话，陪你写代码、拆需求、聊世界观。想换人？一句话的事。
- 📝 **她记得你**：你的项目、任务、喜好、坑，她都记在持久记忆里——不会出现「今天你谁啊」的尴尬。
- 📚 **你的设定有地方放**：树状知识库把世界观、数值、剧情、角色设定整理成目录，聊到哪拖到哪，Agent 随取随用。
- 🌸 **有氛围的工作台**：樱花主题、消息朗读、审批/任务/回答提醒——像有个伙伴坐在工位旁边，该催你时催你。
- 🌐 **网络问题也被治好**：global-proxy 让订阅模型、海外服务的连通性不再折磨你。

**角色卡是开放的**：仓库内置五张虚构原创示例卡——助手「小夏」+「超高校级」工作室系列（美术·星见澪、剧本·花菱紬、程序·九条零、数值·冰室雪）；任何人可以按角色卡 schema 写自己的卡（性格、口头禅、声线建议都支持），组自己的队伍——谁来陪你做游戏，你说了算。

**适合谁**：独自开发的独立游戏开发者、想要轻松陪伴感的长文本工作流用户、二次元爱好者。装好后打开 DSH，选「小夏」预设，今天就有人陪你开工啦。

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

## 架构：源码 overlay + npm 分发

**分发面**：6 个包都是标准 npm 包，已声明真实的 `dependencies` / `peerDependencies`（`@deepseek-ai/cordis ~4.0.4`、`@deepseek-ai/schemastery ~3.18.4` 等，均为 npm 上的公开包）。装到 DSH 里靠 `dsh.bundle.patch` 自描述，不依赖本仓库在不在场。

**构建面**：本仓库仍以 **overlay** 方式与 DSH 源码树协作。原因是构建图——每个包的 `tsconfig.json` 用 project reference 指向 DSH 树内的 `vendor/schemastery`、`packages/settings/settings`，`lib/` 由 DSH 的 tsdown 流水线产出：

- 本仓库包含 6 个插件的**源码、文档、测试、构建配置与已构建的 `lib/`**；
- 构建与测试在 **DSH checkout 环境**内进行（把本仓库的包覆盖进 checkout，跑 `pnpm install` + `build:lib:host/client` + vitest）；
- 这样每次 CI 都顺带验证了与官方 DSH 的**真实兼容性**。

> **兼容目标：DSH `0.2.0-rc.2`**（本仓库 6 个包统一版本 `0.2.0`）。CI 钉住该 tag 做全链路验证。

## 集成方式

### 方式一：从 npm 安装（桌面端 / CLI 通用，推荐）

包已发布为普通 npm 包，桌面端与 CLI 都能直接装：

**桌面端**：菜单里的「插件管理」→ 安装框输入包名（可带版本），例如

```
@w4xxx/dsh-gameassist-knowledge@0.2.0
```

装完重启应用即可。桌面端会校验 `dsh.bundle.patch` 指向的文件在包内，本仓库所有包都已包含。

**CLI**：

```bash
dsh plugin add @w4xxx/dsh-gameassist-knowledge@0.2.0
```

> 注意：桌面端的 registry 固定为 `registry.npmjs.org`（不走本机 npm 镜像配置），国内网络需要自备代理。

### 方式二：overlay 进 DSH checkout（用于构建/测试）

```bash
# 把本仓库 packages/* 同步进你的 DSH checkout（Windows）
node scripts/integrate.mjs --checkout D:/mycode/deepseek-harness-master
# 然后按 DSH 常规流程：pnpm install && pnpm run build:lib:host && pnpm run build:lib:client
```

`scripts/integrate.mjs` 会按映射表把 6 个包复制到 checkout 的 `packages/companion|client` 对应目录（默认跳过 node_modules）。

### 方式三：profile patch 装配

在 `~/.dsh/profiles/<name>/` 的 `cordis.patch.yml` 中插入需要启用的插件（host 层与 web 层各有对应写法，见各包 README）。

### 方式四：运行时注入（开发用）

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
├─ scripts/verify-desktop-load.mjs # 双形态加载回归（桌面无 webServer / Web 有 webServer）
├─ scripts/verify-pack.mjs         # 发布就绪门禁（patch 在包内 / 无 workspace 协议）
├─ LICENSE / NOTICE.md
└─ third-party-licenses/           # DeepSeek Harness / Cordis / Schemastery / undici 的 MIT 全文
```

## 发布状态

- 6 个包统一版本 **`0.2.0`**，面向 DSH **`0.2.0-rc.2`**；
- 发布前由 `scripts/verify-pack.mjs` 守门，三项硬约束：**无 `workspace:` 协议**、**tarball 内含 `cordis.patch.yml`**、**版本与兼容线一致**；
- 包名沿用 `@w4xxx` 自有 scope（DSH 官方 `@deepseek-ai` 无发布权）；
- 每个包已声明 `dsh.bundle` manifest 与 `cordis.patch.yml`，可通过桌面端插件管理或 `dsh plugin add` 安装；
- **桌面端兼容性要点**：桌面端不提供 `webServer`，且 bundle patch 不带 `config`。因此 host 侧三个包的 HTTP 路由改为**运行时可选探测**（`ctx.reflect.get('webServer', false)`），`kbRoot` / `memoryFile` / `cardsDir` 均带默认值——缺任一都不会再让插件加载失败。见 `scripts/verify-desktop-load.mjs` 的双形态回归；
- 角色卡仅含**虚构原创示例**（助手「小夏」+ 「超高校级」工作室：美术·星见澪、剧本·花菱紬、程序·九条零、数值·冰室雪，共 5 张，位于 `packages/gameassist-roster/cards/`），不包含任何真实作品角色；
- 视觉元素（花瓣、铃声）为纯 CSS / Web Audio 合成，不含字体、图片或录音资产；
- 社区目录收录：6 个条目已按 [awesome-dsh-plugin 规范](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/blob/main/contributing.md) 准备并提交。

## 许可证

MIT + NOTICE。详见 [LICENSE](LICENSE) 与 [NOTICE.md](NOTICE.md)；第三方依赖的许可证全文见 [third-party-licenses/](third-party-licenses/)。
