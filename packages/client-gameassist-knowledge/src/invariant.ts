/**
 * Package-owned invariant companion for `@w4xxx/dsh-client-gameassist-knowledge`.
 * @module @w4xxx/dsh-client-gameassist-knowledge/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@w4xxx/dsh-client-gameassist-knowledge'

/** Cordis companion plugin name. */
export const name = 'client-gameassist-knowledge-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: a composer button, an input-dock panel, and their
 * overlay — all cordis-owned slot entries disposed with the fiber. The plugin
 * keeps no store, emits no cordis events, and holds no cross-plugin state
 * beyond its module-level panel cache.
 */
const install: InvariantInstaller = () => {}

/**
 * Register this package's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the installed registration's disposer after setup succeeds.
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
