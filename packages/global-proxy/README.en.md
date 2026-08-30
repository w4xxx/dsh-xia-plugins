# dsh-global-proxy

[中文](README.md) | English

`dsh-global-proxy` is a DSH Host plugin. It installs a **global undici dispatcher** for the current Node.js Host process so that `fetch` requests using undici's global dispatcher follow its proxy and direct-connection rules. Node/undici does not read the Windows system proxy (WinINET), which makes subscription-style plugins fail on OAuth token exchange, model catalogs, image generation, x_search, etc. (typically `codex token endpoint error (HTTP 403)`).

> ⚠️ Scope: **process-global**. Once mounted, every undici `fetch` in the Host process is affected; unloading the plugin does not restore the previous dispatcher.

## Release status

**Not published to npm yet**; this repository distributes source (TypeScript sources, build, and unit tests included). Use it through a source link, profile composition, or development injection.

## How it works

On load the plugin resolves the proxy and DSH Home from environment variables:

- `DSH_HTTPS_PROXY`: HTTP(S) proxy URL; defaults to `http://127.0.0.1:7892` when unset.
- `DSH_HOME`: DSH Home; defaults to `~/.dsh` when unset.

It then creates a `require` resolution base at the fixed location below and loads `undici` from it:

```text
<DSH_HOME>/profiles/web/node_modules/.dsh-global-proxy-require.js
```

The plugin creates an `EnvHttpProxyAgent`, passes the same proxy URL as both `httpProxy` and `httpsProxy`, and calls `setGlobalDispatcher(dispatcher)`. This is a process-wide global change, not a change confined to this plugin. Other plugins and `fetch` calls in the same Host process that use undici's global dispatcher are affected as well.

The browser, Git, curl, or other separate processes do not read this Node in-process dispatcher, and it does not read Windows WinINET proxy settings.

## Proxy and direct-connection rules

The current `noProxy` is a fixed string:

```text
localhost,127.0.0.1,[::1],::1,deepseek.com,registry.npmmirror.com
```

These hosts, plus subdomains matched by undici's rules, stay direct. Other matching requests use `DSH_HTTPS_PROXY` or the default proxy at `127.0.0.1:7892`. `noProxy` is not currently a plugin option and cannot be overridden separately through an environment variable.

If no local proxy is listening on the default port, requests to destinations outside `noProxy` fail. Set `DSH_HTTPS_PROXY` to a complete URL accepted by undici, for example:

```powershell
$env:DSH_HTTPS_PROXY = 'http://127.0.0.1:7892'
```

## Startup self-test (off by default)

The self-test is **off by default** and makes no external request. Enable it explicitly:

```powershell
$env:DSH_PROXY_SELFTEST = '1'
```

When enabled, after installing the dispatcher the plugin asynchronously requests (15 s timeout):

```text
https://chatgpt.com/backend-api/codex/models   # override with DSH_PROXY_SELFTEST_URL
```

Any HTTP response logs its status; network or timeout errors log a warning. The self-test does not block `apply()` from returning, so its success/failure is neither a load success/failure nor a health check of all destinations.

## Security & operational impact

- **Process-level scope** — `setGlobalDispatcher` replaces the current process's global dispatcher. The plugin neither saves the old dispatcher nor restores it on unload; hot-unload does not revert network behavior.
- **Proxy-visible data** — proxied request targets, bodies, and credentials are exposed to the proxy operator per the protocol and the proxy's capabilities. Only use a trusted proxy and evaluate the handling of OAuth, model calls, search, and uploaded data.
- **Credential-URL log risk** — the startup log prints the resolved proxy URL verbatim. A `DSH_HTTPS_PROXY` of the form `http://user:password@host:port` puts the credentials in DSH logs. Do not embed credentials in the URL unless the log system reliably redacts them.
- **No external request by default** — the self-test endpoint is contacted only when `DSH_PROXY_SELFTEST=1` is set.

## Source-link install

This is a Host plugin, not a standalone app. A source-link profile composition example (replace the path with your local directory):

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

Or insert the plugin row directly via a profile patch:

```yaml
- insert:
    - id: dsh-global-proxy
      name: dsh-global-proxy
```

The current implementation requires `undici` to resolve from `DSH_HOME/profiles/web/node_modules`, so linking it into another profile does not remove the fixed `web` profile assumption. Compose it through the supported `dsh --profile web` launch path rather than executing `lib/index.js` directly.

## Development injection

In an environment with `dsh-super-injector`, inject a source directory containing `package.json` and `lib/` at runtime:

```text
dev_inject_plugin({ dir: "D:\\path\\to\\dsh-xia-plugins\\packages\\global-proxy" })
```

Check the state with `dev_plugin_status`. Because the plugin replaces the process-wide dispatcher, unloading does not restore the pre-install dispatcher; remove the composition and restart the DSH Host for a deterministic rollback of network behavior.

`lib/client.js` is a UI-less client placeholder that satisfies the two-sided injection flow: it registers a settings item that renders `null` and provides no proxy-control UI.

## Build & test

```sh
pnpm install          # standalone install (undici only for types/tests)
pnpm run bundle       # tsdown build -> lib/index.js
pnpm test             # vitest unit tests (pure config logic, no network)
node --check lib/index.js lib/client.js
```

Source layout:

- `src/config.ts` — pure config resolution (`buildProxyConfig`, independently testable)
- `src/index.ts` — plugin entry (dispatcher install, optional self-test)
- `lib/client.js` — UI-less client placeholder (hand-written, untouched)

Real composition verification must happen in an isolated DSH Host process: check startup logs, the self-test result, `noProxy` direct targets, and proxied targets, then restart the process to restore a predictable global dispatcher state.

## Known Limitations and Deferred Work

- **Fixed Web-profile resolution assumption** — `undici` always resolves from `<DSH_HOME>/profiles/web/node_modules`; a non-Web profile, changed directory layout, or missing dependency makes loading fail.
- **No reversible lifecycle** — the plugin neither saves nor restores the previous global dispatcher; unload and hot-reload can leave process-level network state behind.
- **Incomplete proxy/noProxy configuration** — only the proxy URL is overridable via `DSH_HTTPS_PROXY`; `noProxy` is currently a fixed string (future work: make it configurable).
- **Logs may leak proxy credentials** — a proxy URL containing a username/password is written to the log verbatim.
- **Self-test is not a health-check system** — it probes one fixed URL, fails asynchronously without blocking startup, and has no retry or status endpoint.
- **No composition tests yet** — unit tests cover config resolution only; no integration test inside a real DSH Host process yet.
