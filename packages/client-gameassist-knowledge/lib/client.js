window.__ModuleLoader__.load({
	id: "@w4xxx/dsh-client-gameassist-knowledge",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		//#region \0dsh-css:D:\mycode\_dsh-012a1-stage\packages\client\gameassist-knowledge\src\client\styles.module.css.mjs
		const css = ".VSSCfW_kbButton,.VSSCfW_kbButtonActive{border:1px solid var(--dsw-alias-border-l1);min-width:30px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:6px;justify-content:center;align-items:center;padding:0 7px;font-size:13px;line-height:1;display:inline-flex}.VSSCfW_kbButton:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.VSSCfW_kbButtonActive{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}.VSSCfW_panel{background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;flex-direction:column;gap:6px;max-height:300px;padding:8px 10px;display:flex;overflow:hidden}.VSSCfW_head{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.VSSCfW_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600}.VSSCfW_tabs{flex-wrap:wrap;flex:1;gap:4px;display:flex}.VSSCfW_tab,.VSSCfW_tabActive{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:999px;padding:2px 8px;font-size:12px}.VSSCfW_tab:hover{color:var(--dsw-alias-label-primary)}.VSSCfW_tabActive{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}.VSSCfW_refresh{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:6px;padding:2px 8px;font-size:13px}.VSSCfW_refresh:hover{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}.VSSCfW_tree{flex:1;min-height:0;overflow-y:auto}.VSSCfW_dirRow{cursor:pointer;color:var(--dsw-alias-label-primary);user-select:none;border-radius:6px;align-items:center;gap:4px;padding:3px 6px;font-size:13px;display:flex}.VSSCfW_dirRow:hover{background:var(--dsw-alias-bg-layer-2)}.VSSCfW_caret{width:12px;color:var(--dsw-alias-label-secondary)}.VSSCfW_dirName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.VSSCfW_fileRow{color:var(--dsw-alias-label-primary);border-radius:6px;align-items:center;gap:4px;padding:3px 6px;font-size:13px;display:flex}.VSSCfW_fileRow:hover{background:var(--dsw-alias-bg-layer-2)}.VSSCfW_fileName{text-overflow:ellipsis;white-space:nowrap;cursor:grab;flex:1;overflow:hidden}.VSSCfW_actions{gap:2px;display:none}.VSSCfW_fileRow:hover .VSSCfW_actions{display:flex}.VSSCfW_citeBtn{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);height:20px;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:5px;padding:0 5px;font-size:11px}.VSSCfW_citeBtn:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}.VSSCfW_hint{color:var(--dsw-alias-label-secondary);margin:4px 0;font-size:12px}.VSSCfW_notice{color:var(--dsw-alias-brand-primary);font-size:12px}.VSSCfW_dragOverlay{z-index:99999;background:#1712198c;justify-content:center;align-items:stretch;gap:14px;padding:10vh 8vw;display:flex;position:fixed;inset:0}.VSSCfW_dropZone,.VSSCfW_dropZoneActive{border:2px dashed var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-overlay);user-select:none;border-radius:16px;flex:1;justify-content:center;align-items:center;font-size:17px;font-weight:600;transition:all .12s;display:flex}.VSSCfW_dropZoneActive{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);transform:scale(1.01)}.VSSCfW_dragCancel{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:999px;padding:6px 18px;position:absolute;bottom:24px;left:50%;transform:translate(-50%)}";
		const tagId = "@w4xxx/dsh-client-gameassist-knowledge/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@w4xxx/dsh-client-gameassist-knowledge";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"actions": "VSSCfW_actions",
			"caret": "VSSCfW_caret",
			"citeBtn": "VSSCfW_citeBtn",
			"dirName": "VSSCfW_dirName",
			"dirRow": "VSSCfW_dirRow",
			"dragCancel": "VSSCfW_dragCancel",
			"dragOverlay": "VSSCfW_dragOverlay",
			"dropZone": "VSSCfW_dropZone",
			"dropZoneActive": "VSSCfW_dropZoneActive",
			"fileName": "VSSCfW_fileName",
			"fileRow": "VSSCfW_fileRow",
			"head": "VSSCfW_head",
			"hint": "VSSCfW_hint",
			"kbButton": "VSSCfW_kbButton",
			"kbButtonActive": "VSSCfW_kbButtonActive",
			"notice": "VSSCfW_notice",
			"panel": "VSSCfW_panel",
			"refresh": "VSSCfW_refresh",
			"tab": "VSSCfW_tab",
			"tabActive": "VSSCfW_tabActive",
			"tabs": "VSSCfW_tabs",
			"title": "VSSCfW_title",
			"tree": "VSSCfW_tree"
		};
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Knowledge-base browser half. A 📚 button on the composer tool row toggles
		* a tree panel in the input dock; clicking a node's buttons or dragging it
		* onto the two-zone overlay cites it into the draft — a path-only
		* `〔kb-ref〕` line the agent resolves through kb_read, or a full
		* `<kb-content>` block so the body rides along. Tree and bodies come from the
		* host plugin's /gameassist/knowledge routes.
		*/
		/** Hard dependencies: the slot registry (the input kit arrives via provide). */
		const inject = ["slots"];
		const TREE_ROUTE = "/gameassist/knowledge/tree";
		const NODE_ROUTE = "/gameassist/knowledge/node";
		let panelOpen = false;
		const panelListeners = /* @__PURE__ */ new Set();
		function setPanelOpen(next) {
			panelOpen = next;
			for (const listener of panelListeners) listener();
		}
		function usePanelOpen() {
			const [value, setValue] = react.default.useState(panelOpen);
			react.default.useEffect(() => {
				const listener = () => {
					setValue(panelOpen);
				};
				panelListeners.add(listener);
				return () => {
					panelListeners.delete(listener);
				};
			}, []);
			return value;
		}
		let treeCache = null;
		async function fetchTree() {
			try {
				const response = await fetch(TREE_ROUTE, { cache: "no-store" });
				if (!response.ok) return null;
				const body = await response.json();
				const libraries = Array.isArray(body.libraries) ? body.libraries : [];
				treeCache = libraries;
				return libraries;
			} catch {
				return treeCache;
			}
		}
		async function fetchNode(library, rel) {
			try {
				const response = await fetch(`${NODE_ROUTE}?path=${encodeURIComponent(`${library}/${rel}`)}`, { cache: "no-store" });
				if (!response.ok) return null;
				const body = await response.json();
				return body.ok === true && typeof body.content === "string" ? body.content : null;
			} catch {
				return null;
			}
		}
		/** Path-only citation line the agent resolves through kb_read. */
		function pathRef(library, rel) {
			return `〔kb-ref〕${library}/${rel}`;
		}
		/** Full-content citation: the agent skips kb_read for this one. */
		function fullRef(library, rel, content) {
			return `〔kb-ref〕${library}/${rel}\n<kb-content>\n${content}\n</kb-content>`;
		}
		function TreeNode(props) {
			const { library, node, depth, expanded, onToggle, onCitePath, onCiteFull, onDragStart } = props;
			const indent = { paddingLeft: `${6 + depth * 14}px` };
			if (node.kind === "dir") {
				const isOpen = expanded[node.path] ?? false;
				return react.default.createElement("div", null, react.default.createElement("div", {
					className: styles_module_css_default.dirRow,
					style: indent,
					role: "button",
					tabIndex: 0,
					onClick: () => {
						onToggle(node.path);
					},
					onKeyDown: (event) => {
						if (event.key === "Enter" || event.key === " ") onToggle(node.path);
					}
				}, react.default.createElement("span", { className: styles_module_css_default.caret }, isOpen ? "▾" : "▸"), react.default.createElement("span", { className: styles_module_css_default.dirName }, `📁 ${node.name}`)), isOpen ? (node.children ?? []).map((child) => react.default.createElement(TreeNode, {
					key: child.path,
					library,
					node: child,
					depth: depth + 1,
					expanded,
					onToggle,
					onCitePath,
					onCiteFull,
					onDragStart
				})) : null);
			}
			return react.default.createElement("div", {
				className: styles_module_css_default.fileRow,
				style: indent,
				draggable: true,
				title: `${node.path}（拖拽或点击按钮引用）`,
				onDragStart: (event) => {
					event.dataTransfer.setData("application/x-kb-ref", JSON.stringify({
						library,
						path: node.path
					}));
					event.dataTransfer.effectAllowed = "copy";
					onDragStart({
						library,
						path: node.path
					});
				}
			}, react.default.createElement("span", { className: styles_module_css_default.fileName }, `📄 ${node.title ?? node.name}`), react.default.createElement("span", { className: styles_module_css_default.actions }, react.default.createElement("button", {
				type: "button",
				className: styles_module_css_default.citeBtn,
				title: "引用路径（助手按需读正文）",
				onClick: () => {
					onCitePath(library, node);
				}
			}, "🔗"), react.default.createElement("button", {
				type: "button",
				className: styles_module_css_default.citeBtn,
				title: "附全文（正文随消息带入）",
				onClick: () => {
					onCiteFull(library, node);
				}
			}, "📄")));
		}
		function DragOverlay(props) {
			const { onDropPath, onDropFull, onCancel } = props;
			const [side, setSide] = react.default.useState(null);
			react.default.useEffect(() => {
				const finish = () => {
					onCancel();
				};
				window.addEventListener("dragend", finish);
				return () => {
					window.removeEventListener("dragend", finish);
				};
			}, []);
			const allow = (event) => {
				event.preventDefault();
				event.stopPropagation();
			};
			return react.default.createElement("div", {
				className: styles_module_css_default.dragOverlay,
				onDragOver: allow,
				onDragLeave: () => {
					setSide(null);
				},
				onDrop: (event) => {
					event.preventDefault();
					event.stopPropagation();
					if (side === "full") onDropFull();
					else onDropPath();
				}
			}, react.default.createElement("div", {
				className: side === "path" ? styles_module_css_default.dropZoneActive : styles_module_css_default.dropZone,
				onDragEnter: () => {
					setSide("path");
				},
				onDragOver: allow
			}, "🔗 松开 = 仅路径引用"), react.default.createElement("div", {
				className: side === "full" ? styles_module_css_default.dropZoneActive : styles_module_css_default.dropZone,
				onDragEnter: () => {
					setSide("full");
				},
				onDragOver: allow
			}, "📄 松开 = 附全文引用"), react.default.createElement("button", {
				type: "button",
				className: styles_module_css_default.dragCancel,
				onClick: onCancel
			}, "取消"));
		}
		function KnowledgePanel(props) {
			const open = usePanelOpen();
			const draft = props.input?.draft ?? "";
			const inputActions = props.inputActions;
			const [libraries, setLibraries] = react.default.useState(() => treeCache ?? []);
			const [active, setActive] = react.default.useState(null);
			const [expanded, setExpanded] = react.default.useState({});
			const [dragging, setDragging] = react.default.useState(null);
			const [notice, setNotice] = react.default.useState(null);
			const noticeTimer = react.default.useRef(void 0);
			const draftRef = react.default.useRef("");
			draftRef.current = draft;
			react.default.useEffect(() => () => {
				if (noticeTimer.current !== void 0) window.clearTimeout(noticeTimer.current);
			}, []);
			react.default.useEffect(() => {
				if (!open) return;
				let cancelled = false;
				fetchTree().then((next) => {
					if (cancelled || next === null) return;
					setLibraries(next);
					setActive((prev) => prev === null || !next.some((item) => item.name === prev) ? next[0]?.name ?? null : prev);
				});
				return () => {
					cancelled = true;
				};
			}, [open]);
			const flash = (text) => {
				setNotice(text);
				if (noticeTimer.current !== void 0) window.clearTimeout(noticeTimer.current);
				noticeTimer.current = window.setTimeout(() => {
					setNotice(null);
				}, 1800);
			};
			const insert = (text) => {
				if (inputActions === void 0) return;
				const draft = draftRef.current;
				inputActions.setDraft(draft.trim() === "" ? text : `${draft}\n${text}`);
			};
			const citePath = (library, node) => {
				insert(pathRef(library, node.path));
				flash(`已引用「${node.title ?? node.name}」🔗`);
			};
			const citeFull = (library, node) => {
				fetchNode(library, node.path).then((content) => {
					if (content === null) {
						flash("读取节点失败 ❌");
						return;
					}
					insert(fullRef(library, node.path, content));
					flash(`已附全文「${node.title ?? node.name}」📄`);
				});
			};
			if (!open) return null;
			if (props.session?.blank === true) return null;
			const library = libraries.find((item) => item.name === active) ?? libraries[0];
			return react.default.createElement("div", { className: styles_module_css_default.panel }, react.default.createElement("div", { className: styles_module_css_default.head }, react.default.createElement("span", { className: styles_module_css_default.title }, "📚 知识库"), libraries.length > 1 ? react.default.createElement("div", { className: styles_module_css_default.tabs }, libraries.map((item) => react.default.createElement("button", {
				key: item.name,
				type: "button",
				className: item.name === library?.name ? styles_module_css_default.tabActive : styles_module_css_default.tab,
				title: item.title,
				onClick: () => {
					setActive(item.name);
				}
			}, item.name))) : null, react.default.createElement("button", {
				type: "button",
				className: styles_module_css_default.refresh,
				title: "刷新树",
				onClick: () => {
					fetchTree().then((next) => {
						if (next !== null) setLibraries(next);
					});
				}
			}, "⟳")), library === void 0 ? react.default.createElement("p", { className: styles_module_css_default.hint }, "（还没有知识库节点。在知识库根目录建一个作品子目录、放入 .md 文件即可）") : react.default.createElement("div", { className: styles_module_css_default.tree }, library.nodes.map((node) => react.default.createElement(TreeNode, {
				key: node.path,
				library: library.name,
				node,
				depth: 0,
				expanded,
				onToggle: (path) => {
					setExpanded((prev) => ({
						...prev,
						[path]: !(prev[path] ?? false)
					}));
				},
				onCitePath: citePath,
				onCiteFull: citeFull,
				onDragStart: (payload) => {
					setDragging(payload);
				}
			}))), notice !== null ? react.default.createElement("div", { className: styles_module_css_default.notice }, notice) : null, dragging !== null ? react.default.createElement(DragOverlay, {
				onCancel: () => {
					setDragging(null);
				},
				onDropPath: () => {
					const payload = dragging;
					setDragging(null);
					if (payload !== null) {
						insert(pathRef(payload.library, payload.path));
						flash("已引用路径 🔗");
					}
				},
				onDropFull: () => {
					const payload = dragging;
					setDragging(null);
					if (payload !== null) fetchNode(payload.library, payload.path).then((content) => {
						if (content === null) {
							flash("读取节点失败 ❌");
							return;
						}
						insert(fullRef(payload.library, payload.path, content));
						flash("已附全文 📄");
					});
				}
			}) : null);
		}
		function KnowledgeButton(props) {
			const open = usePanelOpen();
			if (props.session?.blank === true) return null;
			return react.default.createElement("button", {
				type: "button",
				className: open ? styles_module_css_default.kbButtonActive : styles_module_css_default.kbButton,
				title: open ? "收起知识库" : "打开知识库（拖拽子节点引用给助手）",
				"aria-pressed": open,
				onClick: () => {
					setPanelOpen(!open);
				}
			}, "📚");
		}
		function apply(ctx) {
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "gameassist-knowledge",
				order: 20
			}, KnowledgeButton));
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "gameassist-knowledge-panel",
				order: 10
			}, KnowledgePanel));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map