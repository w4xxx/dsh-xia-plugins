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
import { createRequire } from 'node:module';
import { buildProxyConfig } from './config.js';
/** Cordis plugin name used by loader diagnostics. */
export const name = 'dsh-global-proxy';
/** The registries this plugin contributes to (none; host-only side effect). */
export const inject = [];
/**
 * Install the global undici dispatcher. `ctx` is the Cordis plugin context;
 * only `ctx.logger` is used, so the plugin degrades gracefully without it.
 */
export function apply(ctx) {
    const cfg = buildProxyConfig();
    // undici is not resolvable from this package's real path (the injector
    // mounts the package via junction and ESM resolves the real path), so load
    // it from the web profile's own node_modules through DSH_HOME.
    const req = createRequire(cfg.undiciRequireBase);
    const { EnvHttpProxyAgent, setGlobalDispatcher } = req('undici');
    setGlobalDispatcher(new EnvHttpProxyAgent({
        httpProxy: cfg.httpProxy,
        httpsProxy: cfg.httpsProxy,
        noProxy: cfg.noProxy,
    }));
    const logger = ctx?.logger;
    logger?.info?.(`[dsh-global-proxy] undici global dispatcher -> ${cfg.httpProxy}`);
    if (!cfg.selftestEnabled) {
        logger?.info?.('[dsh-global-proxy] self-test disabled (DSH_PROXY_SELFTEST=1 to enable)');
        return;
    }
    // Self-test: prove a normally-blocked origin is reachable through the proxy.
    fetch(cfg.selftestUrl, { signal: AbortSignal.timeout(cfg.selftestTimeoutMs) })
        .then((r) => logger?.info?.(`[dsh-global-proxy] self-test ${cfg.selftestUrl} -> HTTP ${r.status}`))
        .catch((e) => {
        const code = e?.code;
        logger?.warn?.(`[dsh-global-proxy] self-test failed: ${code || (e instanceof Error ? e.message : String(e))}`);
    });
}
//# sourceMappingURL=index.js.map