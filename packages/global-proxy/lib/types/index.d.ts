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
export declare const name = "dsh-global-proxy";
/** The registries this plugin contributes to (none; host-only side effect). */
export declare const inject: string[];
/**
 * Install the global undici dispatcher. `ctx` is the Cordis plugin context;
 * only `ctx.logger` is used, so the plugin degrades gracefully without it.
 */
export declare function apply(ctx: {
    logger?: {
        info?: (m: string) => void;
        warn?: (m: string) => void;
    };
} | undefined): void;
//# sourceMappingURL=index.d.ts.map