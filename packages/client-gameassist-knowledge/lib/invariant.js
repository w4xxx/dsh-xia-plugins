//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@w4xxx/dsh-client-gameassist-knowledge`.
* @module @w4xxx/dsh-client-gameassist-knowledge/invariant
*/
const PACKAGE_NAME = "@w4xxx/dsh-client-gameassist-knowledge";
/** Cordis companion plugin name. */
const name = "client-gameassist-knowledge-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: a composer button, an input-dock panel, and their
* overlay — all cordis-owned slot entries disposed with the fiber. The plugin
* keeps no store, emits no cordis events, and holds no cross-plugin state
* beyond its module-level panel cache.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
