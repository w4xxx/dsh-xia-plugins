/**
 * Pure proxy-configuration builder for dsh-global-proxy.
 *
 * Kept free of undici and of any runtime side effects beyond reading the
 * environment, so it can be unit-tested without a DSH host or a live proxy.
 * The plugin's `apply()` consumes the produced config and performs the
 * side-effecting parts (dispatcher install, optional self-test).
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
/** HTTP(S) proxy used when `DSH_HTTPS_PROXY` is unset. */
export const DEFAULT_PROXY = 'http://127.0.0.1:7892';
/** Hosts/subdomains that stay direct; see the plugin README for rationale. */
export const DEFAULT_NO_PROXY = 'localhost,127.0.0.1,[::1],::1,deepseek.com,registry.npmmirror.com';
/** Self-test endpoint used only when explicitly enabled. */
export const DEFAULT_SELFTEST_URL = 'https://chatgpt.com/backend-api/codex/models';
/** Self-test timeout in milliseconds. */
export const SELFTEST_TIMEOUT_MS = 15_000;
/** Resolve configuration from an environment-like record. */
export function buildProxyConfig(env = process.env) {
    const httpProxy = env.DSH_HTTPS_PROXY || DEFAULT_PROXY;
    const dshHome = env.DSH_HOME || join(homedir(), '.dsh');
    const selftestEnabled = env.DSH_PROXY_SELFTEST === '1';
    return {
        httpProxy,
        httpsProxy: httpProxy,
        noProxy: DEFAULT_NO_PROXY,
        dshHome,
        undiciRequireBase: join(dshHome, 'profiles', 'web', 'node_modules', '.dsh-global-proxy-require.js'),
        selftestEnabled,
        selftestUrl: env.DSH_PROXY_SELFTEST_URL || DEFAULT_SELFTEST_URL,
        selftestTimeoutMs: SELFTEST_TIMEOUT_MS,
    };
}
//# sourceMappingURL=config.js.map