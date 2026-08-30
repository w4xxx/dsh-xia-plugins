window.__ModuleLoader__.load({
	id: "dsh-global-proxy",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const inject = ["slots"];
		// Minimal no-op client half: this plugin is host-only; the registered
		// settings item renders nothing.
		function apply(ctx) {
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({ name: "settings.general.item", id: "dsh-global-proxy", order: -100 }, () => null));
		}
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});