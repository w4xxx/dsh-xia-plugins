//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@w4xxx/dsh-client-game-assistant`.
* @module @w4xxx/dsh-client-game-assistant/invariant
*/
const PACKAGE_NAME = "@w4xxx/dsh-client-game-assistant";
/** Cordis companion plugin name. */
const name = "client-game-assistant-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: a token override layer, one dock entry, and one
* overlay entry, all cordis-owned and disposed with the fiber — the plugin
* keeps no store, emits no cordis events, and holds no cross-plugin state.
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
