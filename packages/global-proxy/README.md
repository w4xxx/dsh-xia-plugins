# dsh-global-proxy

[English](README.en.md) | 中文

`dsh-global-proxy` 是一个 DSH Host 插件。它为当前 Node.js Host 进程安装**全局 undici dispatcher**，使该进程中使用 undici 全局调度器的 `fetch` 请求按代理与直连规则发送。Node/undici 不读 Windows 系统代理（WinINET），这会导致订阅类插件的 OAuth 换 token、模型目录、图片生成、x_search 等请求直连失败（典型报错 `codex token endpoint error (HTTP 403)`）。

> ⚠️ 影响范围：**进程级全局**。装配后整个 Host 进程的所有 undici `fetch` 都受其影响；卸载插件不会恢复安装前的 dispatcher。

## 发布状态

当前**尚未发布到 npm**；本仓库为源码分发（含 TypeScript 源、构建与单元测试）。可通过源码 link、profile 装配或开发注入使用。

## 工作方式

插件加载时从环境变量解析代理和 DSH Home：

- `DSH_HTTPS_PROXY`：HTTP(S) 代理 URL；未设置时使用 `http://127.0.0.1:7892`。
- `DSH_HOME`：DSH Home；未设置时使用 `~/.dsh`。

随后它固定从以下位置创建 `require` 解析基点，并加载 `undici`：

```text
<DSH_HOME>/profiles/web/node_modules/.dsh-global-proxy-require.js
```

插件创建 `EnvHttpProxyAgent`，把同一个代理 URL 同时传给 `httpProxy` 和 `httpsProxy`，再调用 `setGlobalDispatcher(dispatcher)`。这是进程级全局变更，不只影响本插件；同一 Host 进程中依赖 undici 全局 dispatcher 的其他插件和 `fetch` 调用也会受到影响。

浏览器、Git、curl 或其他独立进程不会读取这个 Node 进程内的 dispatcher。它也不会自动读取 Windows WinINET 代理设置。

## 代理与直连规则

当前实现的 `noProxy` 是固定字符串：

```text
localhost,127.0.0.1,[::1],::1,deepseek.com,registry.npmmirror.com
```

这些主机及 undici 按其规则匹配的子域保持直连；其他匹配请求走 `DSH_HTTPS_PROXY` 或默认的 `127.0.0.1:7892`。`noProxy` 当前不是插件配置项，也不能通过环境变量单独覆盖。

如果本地代理没有监听默认端口，且目标不在 `noProxy` 中，相关请求会失败。设置 `DSH_HTTPS_PROXY` 时应使用 undici 接受的完整 URL，例如：

```powershell
$env:DSH_HTTPS_PROXY = 'http://127.0.0.1:7892'
```

## 启动自检（默认关闭）

自检**默认关闭**，不会产生任何外部请求。显式启用：

```powershell
$env:DSH_PROXY_SELFTEST = '1'
```

启用后，插件安装 dispatcher 后异步请求（15 秒超时）：

```text
https://chatgpt.com/backend-api/codex/models   # 可用 DSH_PROXY_SELFTEST_URL 覆盖
```

任何 HTTP 响应都会在日志中记录状态码；网络或超时错误会记录 warning。自检不会阻止 `apply()` 返回，因此自检成功或失败都不等同于插件加载成功或失败，也不验证所有目标站点。

## 安全与运维影响

- **进程级作用域**：`setGlobalDispatcher` 替换当前 Node 进程的全局 dispatcher。插件没有保存旧 dispatcher，也没有在卸载时恢复它；热卸载不等于网络行为立即还原。
- **代理可见数据**：走代理的请求目标、请求内容和凭据按所用协议与代理能力暴露给代理运营方。只使用可信代理，并评估 OAuth、模型调用、搜索和上传数据的处理风险。
- **凭据 URL 日志风险**：启动日志会原样打印解析后的代理 URL。若 `DSH_HTTPS_PROXY` 使用 `http://user:password@host:port` 形式，用户名和密码会进入 DSH 日志。不要在 URL 中嵌入凭据，除非日志系统已做可靠脱敏。
- **自检默认不发起外部请求**：只有显式设置 `DSH_PROXY_SELFTEST=1` 才会访问自检端点。

## 源码 link 安装

这是 Host 插件，不是独立应用。一个源码 link 的 profile 装配示例如下，其中路径应替换为本机实际目录：

```json
{
  "dependencies": {
    "dsh-global-proxy": "link:D:/path/to/dsh-xia-plugins/packages/global-proxy"
  },
  "bundles": [
    "dsh-global-proxy"
  ]
}
```

如果使用 profile patch 直接插入插件行：

```yaml
- insert:
    - id: dsh-global-proxy
      name: dsh-global-proxy
```

当前实现依赖 `DSH_HOME/profiles/web/node_modules` 中可解析的 `undici`，所以 link 到其他 profile 并不足以消除固定 `web` profile 假设。应通过受支持的 `dsh --profile web` 启动路径装配，而不是直接执行 `lib/index.js`。

## 开发注入

在装有 `dsh-super-injector` 的开发环境中，可以把已包含 `package.json` 与 `lib/` 的源码目录运行时注入：

```text
dev_inject_plugin({ dir: "D:\\path\\to\\dsh-xia-plugins\\packages\\global-proxy" })
```

注入后可用 `dev_plugin_status` 检查状态。因为该插件修改进程级全局 dispatcher，卸载插件不会恢复安装前的 dispatcher；需要确定性回滚网络行为时，应移除装配并重启 DSH Host。

`lib/client.js` 只是满足双端注入流程的无界面 client 占位：它注册一个返回 `null` 的设置项，不提供代理控制 UI。

## 构建与测试

```sh
pnpm install          # 独立安装（undici 仅用于类型与测试）
pnpm run bundle       # tsdown 构建 -> lib/index.js
pnpm test             # vitest 单元测试（纯配置逻辑，不发网络请求）
node --check lib/index.js lib/client.js
```

源码结构：

- `src/config.ts` — 纯配置解析（`buildProxyConfig`，可独立测试）
- `src/index.ts` — 插件入口（安装 dispatcher、可选自检）
- `lib/client.js` — 无界面 client 占位（手写，不动）

实际组合验证必须在隔离的 DSH Host 进程中完成：检查启动日志、自检结果、`noProxy` 直连目标和代理目标，并在验证结束后重启进程以恢复可预测的全局 dispatcher 状态。

## Known Limitations and Deferred Work

- **固定 Web profile 解析假设**——`undici` 总是从 `<DSH_HOME>/profiles/web/node_modules` 解析；非 Web profile、改变后的目录结构或缺少该依赖会导致加载失败。
- **没有可逆生命周期**——插件没有保存或恢复之前的全局 dispatcher，卸载和热重载可能留下进程级网络状态。
- **代理和 `noProxy` 配置不完整**——只有代理 URL 可通过 `DSH_HTTPS_PROXY` 覆盖；`noProxy` 目前为固定字符串（未来可配置化）。
- **日志可能泄露代理凭据**——包含用户名或密码的代理 URL 会被完整写入日志。
- **启动自检不是健康检查体系**——它只访问一个固定 URL，异步失败不会阻止插件启动，也没有重试或状态接口。
- **缺少组合测试**——已有单元测试覆盖配置解析，但没有在真实 DSH Host 进程中的组合测试。
