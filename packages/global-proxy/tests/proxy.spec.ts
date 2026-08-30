/**
 * Config-resolution tests for dsh-global-proxy. Pure logic only — no undici,
 * no dispatcher install, no network.
 */

import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import {
  buildProxyConfig,
  DEFAULT_NO_PROXY,
  DEFAULT_PROXY,
  DEFAULT_SELFTEST_URL,
  SELFTEST_TIMEOUT_MS,
} from '../src/config.ts'

describe('dsh-global-proxy config', () => {
  it('uses the default proxy and noProxy when env is empty', () => {
    const cfg = buildProxyConfig({})
    expect(cfg.httpProxy).toBe(DEFAULT_PROXY)
    expect(cfg.httpsProxy).toBe(DEFAULT_PROXY)
    expect(cfg.noProxy).toBe(DEFAULT_NO_PROXY)
  })

  it('honours DSH_HTTPS_PROXY for both httpProxy and httpsProxy', () => {
    const cfg = buildProxyConfig({ DSH_HTTPS_PROXY: 'http://127.0.0.1:9999' })
    expect(cfg.httpProxy).toBe('http://127.0.0.1:9999')
    expect(cfg.httpsProxy).toBe('http://127.0.0.1:9999')
  })

  it('resolves undici from DSH_HOME/profiles/web/node_modules', () => {
    const cfg = buildProxyConfig({ DSH_HOME: 'C:/dsh-test-home' })
    expect(cfg.undiciRequireBase).toBe(
      join('C:/dsh-test-home', 'profiles', 'web', 'node_modules', '.dsh-global-proxy-require.js'),
    )
  })

  it('keeps the self-test off by default', () => {
    const cfg = buildProxyConfig({})
    expect(cfg.selftestEnabled).toBe(false)
  })

  it('enables the self-test only on DSH_PROXY_SELFTEST=1', () => {
    expect(buildProxyConfig({ DSH_PROXY_SELFTEST: '1' }).selftestEnabled).toBe(true)
    expect(buildProxyConfig({ DSH_PROXY_SELFTEST: '0' }).selftestEnabled).toBe(false)
    expect(buildProxyConfig({ DSH_PROXY_SELFTEST: 'true' }).selftestEnabled).toBe(false)
  })

  it('defaults and overrides the self-test URL', () => {
    expect(buildProxyConfig({}).selftestUrl).toBe(DEFAULT_SELFTEST_URL)
    expect(buildProxyConfig({ DSH_PROXY_SELFTEST_URL: 'http://127.0.0.1:9/probe' }).selftestUrl).toBe(
      'http://127.0.0.1:9/probe',
    )
  })

  it('keeps deepseek.com and the npm mirror in noProxy', () => {
    const cfg = buildProxyConfig({})
    expect(cfg.noProxy).toContain('deepseek.com')
    expect(cfg.noProxy).toContain('registry.npmmirror.com')
    expect(cfg.selftestTimeoutMs).toBe(SELFTEST_TIMEOUT_MS)
  })
})
