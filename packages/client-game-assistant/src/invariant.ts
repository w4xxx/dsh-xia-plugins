/**
 * Package-owned invariant companion for `@w4xxx/dsh-client-game-assistant`.
 * @module @w4xxx/dsh-client-game-assistant/invariant
 */

/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@w4xxx/dsh-client-game-assistant'

/** Cordis companion plugin name. */
export const name = 'client-game-assistant-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

/**
 * No runtime invariant: a token override layer, one dock entry, and one
 * overlay entry, all cordis-owned and disposed with the fiber — the plugin
 * keeps no store, emits no cordis events, and holds no cross-plugin state.
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
