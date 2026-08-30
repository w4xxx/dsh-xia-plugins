# @w4xxx/dsh-client-game-assistant

[English](README.en.md) | 中文

## 简介

「小夏」游戏助手配套的 **Web UI 层**：樱花主题（永久 token 覆盖）、时间感知的输入栏小挂件（charm）、指针穿透的花瓣飘落层，以及一套陪伴式提醒与朗读功能——审批提问提醒、后台任务完成提醒、回答完成提醒、消息朗读按钮与语音设置（角色专属声线 / 默认语音 / 自定义 TTS 端点）。

> 本包是纯 UI/交互层（Host `apply` 为空），**不提供任何 Agent 后端能力**；`/gameassist/voice-map` 数据来自配套的 `@w4xxx/dsh-gameassist-roster`。

## 安装

当前包**尚未发布到 npm**；本仓库为源码分发，包名使用自有 `@w4xxx` scope。作为 Web bundle 装配：

```yaml
- insert:
    - id: ui-game-assistant
      name: '@w4xxx/dsh-client-game-assistant'
```

构建：`pnpm --filter @w4xxx/dsh-client-game-assistant run bundle`（或仓库根 `pnpm run build:lib:client`）；改动后浏览器 **Ctrl+F5 强刷**生效。

## 配置

无装配配置项；以下偏好均存于浏览器 `localStorage`：

| Key | 内容 |
|---|---|
| `dsh.gameassist.voice.v1` | 默认语音偏好（TTS 端点/声线/语速/音调） |
| `dsh.gameassist.role-voice.v1` | 当日角色声线临时覆盖（每日自动回滚） |

## 功能

- **樱花主题**：覆盖 `:root` 的 theme tokens（`game-assistant-permanent`），常驻生效。
- **Composer charm**：输入栏时间感知小挂件。
- **花瓣层**：`shell.overlay` 指针穿透装饰。
- **审批提醒**：等待审批时铃声提醒，每 **20s** 复响；超过 **120s** 无人应答自动取消本轮。
- **任务完成提醒**：后台任务进入终态（completed/failed/killed）时提醒，每任务一次。
- **回答完成提醒**：`running` 从 true→false 且 turn 数增长时提醒（防历史回放误报）。
- **消息朗读**：助手/用户消息旁朗读按钮，走 speakText 管线：自定义端点 → 当日角色声线 → 默认语音。
- **语音设置**：`settings.section` 两区——扮演角色声线（当日有效）与默认语音；可配置开源 TTS 端点（示例 `http://127.0.0.1:9880/tts`，POST `{text}` 返回音频）。

## 数据与安全

- 语音偏好仅存浏览器 localStorage（按机器/浏览器隔离）；无服务端持久化。
- 朗读请求发往你配置的 TTS 端点（同源或 CORS 允许的地址）；文本会发送给该端点。
- 提醒/轮值文案依赖 roster 的 `/gameassist/voice-map`，未装配 roster 时相关功能降级。

## 开发

```bash
pnpm exec vitest run packages/client/game-assistant/tests/apply.client.spec.ts
```

（测试为 jsdom 环境，校验注入 `theme/slots/sessions` 与注册行为。）

## 已知限制

- 浏览器 TTS/朗读能力依赖宿主浏览器与 CORS；自定义端点的协议需匹配。
- 「今日角色」声线覆盖按 localStorage 记录，跨设备不同步。
- 审批提醒 120s 超时取消是**本轮**语义，非全局设置。

## 许可证

MIT（最终以独立仓库 LICENSE/NOTICE 为准）。
