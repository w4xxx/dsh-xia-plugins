import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";
/** Hosts/subdomains that stay direct; see the plugin README for rationale. */
const DEFAULT_NO_PROXY = "localhost,127.0.0.1,[::1],::1,deepseek.com,registry.npmmirror.com";
/** Self-test timeout in milliseconds. */
const SELFTEST_TIMEOUT_MS = 15e3;
/** Resolve configuration from an environment-like record. */
function buildProxyConfig(env = process.env) {
	const httpProxy = env.DSH_HTTPS_PROXY || "http://127.0.0.1:7892";
	const dshHome = env.DSH_HOME || join(homedir(), ".dsh");
	const selftestEnabled = env.DSH_PROXY_SELFTEST === "1";
	return {
		httpProxy,
		httpsProxy: httpProxy,
		noProxy: DEFAULT_NO_PROXY,
		dshHome,
		undiciRequireBase: join(dshHome, "profiles", "web", "node_modules", ".dsh-global-proxy-require.js"),
		selftestEnabled,
		selftestUrl: env.DSH_PROXY_SELFTEST_URL || "https://chatgpt.com/backend-api/codex/models",
		selftestTimeoutMs: SELFTEST_TIMEOUT_MS
	};
}
//#endregion
//#region lib/types/index.js
/**
* dsh-global-proxy
*
* Installs a global undici dispatcher so every host-process fetch (the
* subscriptions plugin's OAuth token exchange, model catalogs, usage, image
* generation, x_search, ...) goes through the local HTTP(S) proxy, while
* localhost traffic stays direct. Node/undici does not read Windows system
* proxy settings, which is why `codex token endpoint error (HTTP 403)`
* appeared on login.
*
* Scope: process-global. Mounted once, it affects every undici fetch in the
* Host process. The startup self-test is OFF by default; set
* `DSH_PROXY_SELFTEST=1` to enable it (see README).
*/
/** Cordis plugin name used by loader diagnostics. */
const name = "dsh-global-proxy";
/** The registries this plugin contributes to (none; host-only side effect). */
const inject = [];
/**
* Install the global undici dispatcher. `ctx` is the Cordis plugin context;
* only `ctx.logger` is used, so the plugin degrades gracefully without it.
*/
function apply(ctx) {
	const cfg = buildProxyConfig();
	const { EnvHttpProxyAgent, setGlobalDispatcher } = createRequire(cfg.undiciRequireBase)("undici");
	setGlobalDispatcher(new EnvHttpProxyAgent({
		httpProxy: cfg.httpProxy,
		httpsProxy: cfg.httpsProxy,
		noProxy: cfg.noProxy
	}));
	const logger = ctx?.logger;
	logger?.info?.(`[dsh-global-proxy] undici global dispatcher -> ${cfg.httpProxy}`);
	if (!cfg.selftestEnabled) {
		logger?.info?.("[dsh-global-proxy] self-test disabled (DSH_PROXY_SELFTEST=1 to enable)");
		return;
	}
	fetch(cfg.selftestUrl, { signal: AbortSignal.timeout(cfg.selftestTimeoutMs) }).then((r) => logger?.info?.(`[dsh-global-proxy] self-test ${cfg.selftestUrl} -> HTTP ${r.status}`)).catch((e) => {
		const code = e?.code;
		logger?.warn?.(`[dsh-global-proxy] self-test failed: ${code || (e instanceof Error ? e.message : String(e))}`);
	});
}
//#endregion
export { apply, inject, name };
