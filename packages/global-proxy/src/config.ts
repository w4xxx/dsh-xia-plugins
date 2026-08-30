/**
 * Pure proxy-configuration builder for dsh-global-proxy.
 *
 * Kept free of undici and of any runtime side effects beyond reading the
 * environment, so it can be unit-tested without a DSH host or a live proxy.
 * The plugin's `apply()` consumes the produced config and performs the
 * side-effecting parts (dispatcher install, optional self-test).
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/** HTTP(S) proxy used when `DSH_HTTPS_PROXY` is unset. */
export const DEFAULT_PROXY = 'http://127.0.0.1:7892'

/** Hosts/subdomains that stay direct; see the plugin README for rationale. */
export const DEFAULT_NO_PROXY =
  'localhost,127.0.0.1,[::1],::1,deepseek.com,registry.npmmirror.com'

/** Self-test endpoint used only when explicitly enabled. */
export const DEFAULT_SELFTEST_URL = 'https://chatgpt.com/backend-api/codex/models'

/** Self-test timeout in milliseconds. */
export const SELFTEST_TIMEOUT_MS = 15_000

/** Environment variables consumed by this plugin. */
export interface ProxyEnv {
  /** HTTP(S) proxy URL shared by httpProxy and httpsProxy. */
  DSH_HTTPS_PROXY?: string
  /** DSH home; `profiles/web/node_modules` under it resolves undici. */
  DSH_HOME?: string
  /** Set to `1` to enable the startup self-test (off by default). */
  DSH_PROXY_SELFTEST?: string
  /** Override for the self-test endpoint. */
  DSH_PROXY_SELFTEST_URL?: string
}

/** Fully-resolved plugin configuration. */
export interface ProxyConfig {
  httpProxy: string
  httpsProxy: string
  noProxy: string
  /** Absolute path to the DSH home directory. */
  dshHome: string
  /** Absolute path where undici is expected to be resolvable. */
  undiciRequireBase: string
  selftestEnabled: boolean
  selftestUrl: string
  selftestTimeoutMs: number
}

/** Resolve configuration from an environment-like record. */
export function buildProxyConfig(env: ProxyEnv = process.env): ProxyConfig {
  const httpProxy = env.DSH_HTTPS_PROXY || DEFAULT_PROXY
  const dshHome = env.DSH_HOME || join(homedir(), '.dsh')
  const selftestEnabled = env.DSH_PROXY_SELFTEST === '1'
  return {
    httpProxy,
    httpsProxy: httpProxy,
    noProxy: DEFAULT_NO_PROXY,
    dshHome,
    undiciRequireBase: join(dshHome, 'profiles', 'web', 'node_modules', '.dsh-global-proxy-require.js'),
    selftestEnabled,
    selftestUrl: env.DSH_PROXY_SELFTEST_URL || DEFAULT_SELFTEST_URL,
    selftestTimeoutMs: SELFTEST_TIMEOUT_MS,
  }
}
