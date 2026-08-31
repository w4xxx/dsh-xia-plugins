window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-game-assistant",
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
		//#region \0dsh-css:D:\mycode\deepseek-harness-master\packages\client\game-assistant\src\client\styles.module.css.mjs
		const css = ".D7U48G_charm{color:var(--dsw-alias-label-secondary);user-select:none;align-items:center;gap:6px;font-size:11px;line-height:16px;display:inline-flex}.D7U48G_dot{background:var(--dsw-alias-brand-primary);border-radius:50%;width:7px;height:7px;animation:2.4s ease-in-out infinite D7U48G_gameassist-pulse}@keyframes D7U48G_gameassist-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.6)}}.D7U48G_petalLayer{pointer-events:none;z-index:1;position:fixed;inset:0;overflow:hidden}.D7U48G_petal{background:linear-gradient(135deg,#e0558f8c,#ff7ab859);border-radius:60% 40%;width:10px;height:14px;animation-name:D7U48G_gameassist-fall;animation-timing-function:linear;animation-iteration-count:infinite;position:absolute;top:-24px}@keyframes D7U48G_gameassist-fall{0%{transform:translateY(-24px)rotate(0)}50%{transform:translate(28px,50vh)rotate(180deg)}to{transform:translate(-14px,105vh)rotate(360deg)}}.D7U48G_notifyCharm{color:var(--dsw-alias-state-warn-primary);user-select:none;align-items:center;gap:6px;font-size:11px;line-height:16px;animation:1.2s ease-in-out infinite D7U48G_gameassist-notify-blink;display:inline-flex}@keyframes D7U48G_gameassist-notify-blink{0%,to{opacity:1}50%{opacity:.45}}.D7U48G_readAloud{width:24px;height:24px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:5px;justify-content:center;align-items:center;padding:0;font-size:13px;line-height:1;display:inline-flex}.D7U48G_readAloud:hover{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}.D7U48G_readAloud[aria-pressed=true]{color:var(--dsw-alias-brand-primary)}.D7U48G_voicePage{flex-direction:column;gap:14px;max-width:520px;display:flex}.D7U48G_voiceTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:15px}.D7U48G_voiceSection{border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-brand-primary);margin:10px 0 0;padding-top:12px;font-size:14px;font-weight:600}.D7U48G_voiceRow{flex-wrap:wrap;gap:8px;display:flex}.D7U48G_voiceHint{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.7}.D7U48G_voiceField{color:var(--dsw-alias-label-primary);flex-direction:column;gap:6px;font-size:13px;display:flex}.D7U48G_voiceSelect{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:6px;padding:6px 8px}.D7U48G_voiceRange{width:100%;accent-color:var(--dsw-alias-brand-primary)}.D7U48G_voiceTest{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary);cursor:pointer;border-radius:6px;align-self:flex-start;padding:6px 14px}@media (prefers-reduced-motion:reduce){.D7U48G_dot,.D7U48G_petal,.D7U48G_notifyCharm{animation:none}}";
		const tagId = "@deepseek-ai/dsh-client-game-assistant/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-game-assistant";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles_module_css_default = {
			"charm": "D7U48G_charm",
			"dot": "D7U48G_dot",
			"gameassist-fall": "D7U48G_gameassist-fall",
			"gameassist-notify-blink": "D7U48G_gameassist-notify-blink",
			"gameassist-pulse": "D7U48G_gameassist-pulse",
			"notifyCharm": "D7U48G_notifyCharm",
			"petal": "D7U48G_petal",
			"petalLayer": "D7U48G_petalLayer",
			"readAloud": "D7U48G_readAloud",
			"voiceField": "D7U48G_voiceField",
			"voiceHint": "D7U48G_voiceHint",
			"voicePage": "D7U48G_voicePage",
			"voiceRange": "D7U48G_voiceRange",
			"voiceRow": "D7U48G_voiceRow",
			"voiceSection": "D7U48G_voiceSection",
			"voiceSelect": "D7U48G_voiceSelect",
			"voiceTest": "D7U48G_voiceTest",
			"voiceTitle": "D7U48G_voiceTitle"
		};
		//#endregion
		//#region src/client/index.ts
		/**
		* Game-assistant companion skin, browser half. Permanent "sakura" alias-token
		* layer over the active theme, a time-aware charm line in the composer dock,
		* and a pointer-transparent petal overlay. Everything rides the cordis
		* lifecycle: stopping the row removes the token layer, both slot entries, and
		* the injected CSS.
		*/
		/** Token → per-scheme value pairs layered over the active theme. */
		const SAKURA_TOKENS = {
			"--dsw-alias-bg-base": {
				light: "#fdf7f9",
				dark: "#171219"
			},
			"--dsw-alias-bg-layer-1": {
				light: "#fffafd",
				dark: "#201824"
			},
			"--dsw-alias-bg-layer-2": {
				light: "#f8eef3",
				dark: "#2a1e2c"
			},
			"--dsw-alias-bg-overlay": {
				light: "#fff7fa",
				dark: "#241a26"
			},
			"--dsw-alias-border-l1": {
				light: "#f2dfe7",
				dark: "#382635"
			},
			"--dsw-alias-border-l2": {
				light: "#e3c3d1",
				dark: "#4c3145"
			},
			"--dsw-alias-brand-primary": {
				light: "#e0558f",
				dark: "#ff7ab8"
			},
			"--dsw-alias-label-primary": {
				light: "#3f2b36",
				dark: "#eee3eb"
			},
			"--dsw-alias-label-secondary": {
				light: "#8a6f7c",
				dark: "#a98fa3"
			},
			"--dsw-alias-state-error-primary": {
				light: "#e5484d",
				dark: "#ff6b70"
			},
			"--dsw-alias-state-success-primary": {
				light: "#30a46c",
				dark: "#55c98a"
			},
			"--dsw-alias-state-warn-primary": {
				light: "#e08f26",
				dark: "#f2b04c"
			},
			"--dsw-specific-sidebar-fill": {
				light: "#f6e9ef",
				dark: "#1d1520"
			}
		};
		/** [startHour, endHourExclusive, line] windows; the last window wraps midnight. */
		const GREETINGS = [
			[
				5,
				11,
				"早上好~今天也要元气满满"
			],
			[
				11,
				17,
				"下午好~小夏陪你敲代码"
			],
			[
				17,
				23,
				"晚上好~写完这段就休息一下吧"
			],
			[
				23,
				5,
				"夜深了…小夏在呢，别熬太晚哦"
			]
		];
		function greeting() {
			const hour = (/* @__PURE__ */ new Date()).getHours();
			const found = GREETINGS.find(([from, to]) => from < to ? hour >= from && hour < to : hour >= from || hour < to);
			return (found === void 0 ? GREETINGS[1] : found)[2];
		}
		/** Notifier cadence: remind-chime interval and unattended stop deadline. */
		const APPROVAL_TIMEOUT_MS = 12e4;
		const APPROVAL_REMIND_MS = 2e4;
		/** Two-tone chime via Web Audio (silent when audio is unavailable or blocked). */
		function playChime() {
			try {
				const Ctor = window.AudioContext ?? window.webkitAudioContext;
				if (Ctor === void 0) return;
				const audio = new Ctor();
				audio.resume();
				const tone = (freq, at, dur) => {
					const osc = audio.createOscillator();
					const gain = audio.createGain();
					osc.type = "sine";
					osc.frequency.value = freq;
					gain.gain.setValueAtTime(1e-4, audio.currentTime + at);
					gain.gain.exponentialRampToValueAtTime(.22, audio.currentTime + at + .02);
					gain.gain.exponentialRampToValueAtTime(1e-4, audio.currentTime + at + dur);
					osc.connect(gain);
					gain.connect(audio.destination);
					osc.start(audio.currentTime + at);
					osc.stop(audio.currentTime + at + dur + .05);
				};
				tone(659.25, 0, .18);
				tone(987.77, .22, .32);
				window.setTimeout(() => {
					audio.close();
				}, 1600);
			} catch {}
		}
		/** localStorage key for the voice preference (browser-local by design: voices are per machine). */
		const VOICE_STORAGE_KEY = "dsh.gameassist.voice.v1";
		/** Read the persisted voice preference with bounds-guards and a safe default. */
		function loadVoicePref() {
			try {
				const raw = window.localStorage.getItem(VOICE_STORAGE_KEY);
				if (raw === null) return {
					voiceURI: null,
					voiceName: "",
					rate: 1.1,
					pitch: 1.1,
					endpoint: ""
				};
				const parsed = JSON.parse(raw);
				return {
					voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : null,
					voiceName: typeof parsed.voiceName === "string" ? parsed.voiceName : "",
					rate: typeof parsed.rate === "number" && parsed.rate >= .5 && parsed.rate <= 2 ? parsed.rate : 1.1,
					pitch: typeof parsed.pitch === "number" && parsed.pitch >= .5 && parsed.pitch <= 2 ? parsed.pitch : 1.1,
					endpoint: typeof parsed.endpoint === "string" ? parsed.endpoint : ""
				};
			} catch {
				return {
					voiceURI: null,
					voiceName: "",
					rate: 1.1,
					pitch: 1.1,
					endpoint: ""
				};
			}
		}
		/** Persist the voice preference (best effort — private mode may refuse). */
		function saveVoicePref(pref) {
			try {
				window.localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(pref));
			} catch {}
		}
		/** localStorage key for the per-day role-voice override. */
		const ROLE_OVERRIDE_KEY = "dsh.gameassist.role-voice.v1";
		/** Local calendar date key, `YYYY-MM-DD` (same boundary as the roster rotation). */
		function localDateKey(date) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		}
		/** Read the role-voice override with shape guards (invalid entries degrade to null). */
		function loadRoleOverride() {
			try {
				const raw = window.localStorage.getItem(ROLE_OVERRIDE_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				if (typeof parsed.date !== "string" || typeof parsed.cardId !== "string") return null;
				return {
					date: parsed.date,
					cardId: parsed.cardId,
					voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : void 0,
					voiceName: typeof parsed.voiceName === "string" ? parsed.voiceName : void 0,
					rate: typeof parsed.rate === "number" && parsed.rate >= .5 && parsed.rate <= 2 ? parsed.rate : void 0,
					pitch: typeof parsed.pitch === "number" && parsed.pitch >= .5 && parsed.pitch <= 2 ? parsed.pitch : void 0
				};
			} catch {
				return null;
			}
		}
		/** Persist the role-voice override (best effort). */
		function saveRoleOverride(value) {
			try {
				window.localStorage.setItem(ROLE_OVERRIDE_KEY, JSON.stringify(value));
			} catch {}
		}
		/** Drop the role-voice override (back to the card defaults). */
		function clearRoleOverride() {
			try {
				window.localStorage.removeItem(ROLE_OVERRIDE_KEY);
			} catch {}
		}
		let voiceMap = null;
		/**
		* Module-level voice cache. Browsers populate getVoices() asynchronously —
		* before the first `voiceschanged` event it can return [] and every matcher
		* misses. The cache is warmed at plugin apply and refreshed on every
		* `voiceschanged`, so per-click matching never races the async load.
		*/
		let cachedVoices = [];
		function refreshCachedVoices() {
			try {
				const synth = window.speechSynthesis;
				if (synth === void 0) return;
				const list = synth.getVoices();
				if (list.length > 0) cachedVoices = list;
			} catch {}
		}
		/** Wait (bounded) for the engine to publish its voice list. */
		async function waitForVoices(timeoutMs = 1e3) {
			try {
				const synth = window.speechSynthesis;
				if (synth === void 0) return [];
				const existing = synth.getVoices();
				if (existing.length > 0) return existing;
				return await new Promise((resolve) => {
					let settled = false;
					const finish = () => {
						if (settled) return;
						settled = true;
						synth.removeEventListener("voiceschanged", finish);
						window.clearTimeout(timer);
						resolve(synth.getVoices());
					};
					const timer = window.setTimeout(finish, timeoutMs);
					synth.addEventListener("voiceschanged", finish);
				});
			} catch {
				return [];
			}
		}
		/**
		* Ensure the module-level `voiceMap` is loaded. The host registers
		* `/gameassist/voice-map` asynchronously (after the roster plugin reads its
		* cards from disk), so a page opened right after a host restart can hit 404
		* on the first fetch and — with a one-shot fetch — permanently lose today's
		* character voice. This fetches with bounded exponential backoff until the
		* route answers, guarded by a single-flight lock so parallel callers share
		* one request chain.
		*/
		let voiceMapLoading = null;
		function ensureVoiceMap() {
			if (voiceMap !== null) return Promise.resolve(voiceMap);
			if (voiceMapLoading !== null) return voiceMapLoading;
			const fetchOnce = async () => {
				for (let attempt = 0; attempt < 5; attempt++) try {
					const response = await fetch("/gameassist/voice-map", { cache: "no-cache" });
					if (!response.ok) throw new Error(`voice-map status ${response.status}`);
					const map = await response.json();
					voiceMap = map;
					return map;
				} catch {
					await new Promise((resolve) => window.setTimeout(resolve, 300 * 2 ** attempt));
				}
				return voiceMap;
			};
			voiceMapLoading = fetchOnce().finally(() => {
				voiceMapLoading = null;
			});
			return voiceMapLoading;
		}
		/**
		* Shared TTS speaker. Priority: a configured custom endpoint (open-source
		* engines like Kokoro/Piper/ChatTTS) → the day's character voice from the
		* roster map → the global voice preference → any Chinese voice → the browser
		* default.
		* @returns false when nothing could speak (callers flash 🔇).
		*/
		async function speakText(text, options) {
			const pref = loadVoicePref();
			if (pref.endpoint !== "") try {
				const response = await fetch(pref.endpoint, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ text })
				});
				if (!response.ok) throw new Error(`tts endpoint status ${response.status}`);
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				const audio = new Audio(url);
				const finish = () => {
					if (options?.onend !== void 0) options.onend();
					URL.revokeObjectURL(url);
				};
				audio.onended = finish;
				audio.onerror = finish;
				await audio.play();
				return {
					ok: true,
					voiceName: "自定义端点"
				};
			} catch {}
			try {
				await ensureVoiceMap();
				const synth = window.speechSynthesis;
				if (synth === void 0) return {
					ok: false,
					voiceName: ""
				};
				const char = voiceMap === null || voiceMap.today === null ? void 0 : voiceMap.voices[voiceMap.today];
				const storedOverride = loadRoleOverride();
				const override = char === void 0 || storedOverride === null || storedOverride.date !== localDateKey(/* @__PURE__ */ new Date()) || storedOverride.cardId !== voiceMap.today ? null : storedOverride;
				const rate = override?.rate ?? char?.rate ?? pref.rate;
				const pitch = override?.pitch ?? char?.pitch ?? pref.pitch;
				const targetURI = (override !== null && override.voiceURI !== void 0 && override.voiceURI !== "" ? override.voiceURI : char?.voiceURI) ?? pref.voiceURI;
				const targetName = override !== null && override.voiceName !== void 0 && override.voiceName !== "" ? override.voiceName : char?.name;
				synth.cancel();
				const utter = new SpeechSynthesisUtterance(text);
				utter.lang = "zh-CN";
				utter.rate = rate;
				utter.pitch = pitch;
				const voices = cachedVoices.length > 0 ? cachedVoices : await waitForVoices();
				if (voices.length > 0) cachedVoices = voices;
				const pickUri = (uri) => voices.find((item) => item.voiceURI === uri);
				const pickName = (name) => {
					const needle = name.toLowerCase();
					return voices.find((item) => item.name.toLowerCase().includes(needle));
				};
				const pickLang = (lang) => {
					const needle = lang.toLowerCase();
					return voices.find((item) => item.lang.toLowerCase().startsWith(needle));
				};
				let chosen;
				if (targetURI !== null && targetURI !== void 0) chosen = pickUri(targetURI);
				if (chosen === void 0 && pref.voiceURI !== null && pref.voiceURI !== "") chosen = pickUri(pref.voiceURI);
				if (chosen === void 0 && pref.voiceName !== "") chosen = pickName(pref.voiceName);
				if (chosen === void 0 && targetName !== void 0 && targetName !== "") chosen = pickName(targetName);
				if (chosen === void 0) chosen = pickLang(char?.lang ?? "zh-CN");
				if (chosen === void 0) chosen = pickLang("zh");
				if (chosen !== void 0) {
					if (chosen.lang !== "") utter.lang = chosen.lang;
					utter.voice = chosen;
				}
				console.log("[read-aloud] voice:", chosen?.name ?? "(browser default)", "lang:", utter.lang);
				if (options?.onend !== void 0) utter.onend = options.onend;
				synth.speak(utter);
				return {
					ok: true,
					voiceName: chosen?.name ?? `浏览器默认（语音列表 ${voices.length} 条）`
				};
			} catch {
				return {
					ok: false,
					voiceName: ""
				};
			}
		}
		/** Speak the approval reminder aloud with the configured voice. */
		function speakNanami() {
			speakText("主人，有授权请求需要你确认啦，快回来看一看！");
		}
		/**
		* Speak through the DEFAULT voice only (no role layer): the settings page's
		* default-voice audition. The endpoint preference still applies when set.
		*/
		async function speakDefaultText(text) {
			const pref = loadVoicePref();
			if (pref.endpoint !== "") try {
				const response = await fetch(pref.endpoint, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ text })
				});
				if (!response.ok) throw new Error(`tts endpoint status ${response.status}`);
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				const audio = new Audio(url);
				const finish = () => {
					URL.revokeObjectURL(url);
				};
				audio.onended = finish;
				audio.onerror = finish;
				await audio.play();
				return;
			} catch {}
			try {
				const synth = window.speechSynthesis;
				if (synth === void 0) return;
				synth.cancel();
				const utter = new SpeechSynthesisUtterance(text);
				utter.lang = "zh-CN";
				utter.rate = pref.rate;
				utter.pitch = pref.pitch;
				const voices = cachedVoices.length > 0 ? cachedVoices : await waitForVoices();
				if (voices.length > 0) cachedVoices = voices;
				const pickUri = (uri) => voices.find((item) => item.voiceURI === uri);
				const pickName = (name) => {
					const needle = name.toLowerCase();
					return voices.find((item) => item.name.toLowerCase().includes(needle));
				};
				const pickLang = (lang) => {
					const needle = lang.toLowerCase();
					return voices.find((item) => item.lang.toLowerCase().startsWith(needle));
				};
				let chosen;
				if (pref.voiceURI !== null && pref.voiceURI !== "") chosen = pickUri(pref.voiceURI);
				if (chosen === void 0 && pref.voiceName !== "") chosen = pickName(pref.voiceName);
				if (chosen === void 0) chosen = pickLang("zh-CN");
				if (chosen === void 0) chosen = pickLang("zh");
				if (chosen !== void 0) {
					if (chosen.lang !== "") utter.lang = chosen.lang;
					utter.voice = chosen;
				}
				synth.speak(utter);
			} catch {}
		}
		/**
		* Per-assistant-message read-aloud action: speaks the message text with the
		* browser's Chinese TTS voice; a second click stops it. The plain-text
		* projection strips markdown and replaces fenced code with a placeholder.
		*/
		function ReadAloudAction(props) {
			const messageId = String(props.messageId);
			const text = props.useSession((snapshot) => {
				const parts = [];
				const walk = (node) => {
					if (node === null || node === void 0 || parts.length > 0) return;
					if (node.kind === "assistant" && String(node.messageId) === messageId) {
						for (const block of node.blocks ?? []) if ((block.kind === "text" || block.type === "text") && typeof block.text === "string") parts.push(block.text);
						return;
					}
					if (typeof node.node === "object" && node.node !== null) walk(node.node);
				};
				if (snapshot !== null && snapshot !== void 0) {
					const legacyNodes = snapshot.legacy?.nodes;
					if (legacyNodes !== void 0) for (const node of legacyNodes) walk(node);
					if (parts.length === 0 && Array.isArray(snapshot.nodes)) for (const node of snapshot.nodes) walk(node);
					if (parts.length === 0 && snapshot.chat !== void 0 && snapshot.chat.nodes !== void 0 && typeof snapshot.chat.nodes.values === "function") for (const node of snapshot.chat.nodes.values()) walk(node);
				}
				return parts.length === 0 ? null : parts.join("\n");
			});
			const [speaking, setSpeaking] = react.default.useState(false);
			const [usedVoice, setUsedVoice] = react.default.useState("");
			const [notice, setNotice] = react.default.useState(null);
			const noticeTimer = react.default.useRef(void 0);
			react.default.useEffect(() => () => {
				if (noticeTimer.current !== void 0) window.clearTimeout(noticeTimer.current);
				try {
					window.speechSynthesis?.cancel();
				} catch {}
			}, []);
			const flash = (glyph) => {
				setNotice(glyph);
				if (noticeTimer.current !== void 0) window.clearTimeout(noticeTimer.current);
				noticeTimer.current = window.setTimeout(() => {
					setNotice(null);
				}, 1600);
			};
			const onClick = async () => {
				if (notice !== null) return;
				const synth = window.speechSynthesis;
				if (synth === void 0) {
					console.log("[read-aloud] speechSynthesis unavailable");
					flash("🔇");
					return;
				}
				if (text === null || text === "") {
					console.log("[read-aloud] no text found for message", messageId);
					flash("❌");
					return;
				}
				if (speaking) {
					synth.cancel();
					setSpeaking(false);
					return;
				}
				try {
					const plain = text.replace(/```[\s\S]*?```/g, "，代码省略，").replace(/[#>*_`~\-[\]()!|]/g, " ").replace(/\s+/g, " ").trim();
					if (plain === "") {
						flash("❌");
						return;
					}
					console.log("[read-aloud] speaking", plain.length, "chars for message", messageId);
					const started = await speakText(plain, { onend: () => {
						setSpeaking(false);
					} });
					if (!started.ok) {
						flash("🔇");
						return;
					}
					setUsedVoice(started.voiceName);
					setSpeaking(true);
				} catch (error) {
					console.log("[read-aloud] failed:", error);
					flash("⚠️");
				}
			};
			const glyph = notice ?? (speaking ? "⏹" : "🔊");
			const title = notice === "❌" ? "未找到消息文本" : notice === "🔇" ? "浏览器不支持语音朗读" : notice === "⚠️" ? "朗读失败" : speaking ? "停止朗读" : usedVoice === "" ? "朗读" : `朗读（上次音色：${usedVoice}）`;
			return react.default.createElement("button", {
				type: "button",
				className: styles_module_css_default.readAloud,
				title,
				"aria-label": title,
				"aria-pressed": speaking,
				onClick
			}, glyph);
		}
		/**
		* Voice settings page (registered in the settings panel): two sections — the
		* day's companion role (card preset plus a per-day override that expires with
		* the date) and the default voice used by every non-roster mode. Both persist
		* in localStorage and feed speakText().
		*/
		function VoiceSettings() {
			const [voices, setVoices] = react.default.useState(() => {
				try {
					return window.speechSynthesis === void 0 ? [] : window.speechSynthesis.getVoices();
				} catch {
					return [];
				}
			});
			const [pref, setPref] = react.default.useState(loadVoicePref);
			const [map, setMap] = react.default.useState(voiceMap);
			const [override, setOverride] = react.default.useState(() => {
				const stored = loadRoleOverride();
				const today = voiceMap?.today ?? null;
				if (stored === null || today === null || stored.date !== localDateKey(/* @__PURE__ */ new Date()) || stored.cardId !== today) return null;
				return stored;
			});
			react.default.useEffect(() => {
				const synth = window.speechSynthesis;
				if (synth === void 0) return;
				const refresh = () => {
					setVoices(synth.getVoices());
				};
				refresh();
				synth.addEventListener("voiceschanged", refresh);
				return () => {
					synth.removeEventListener("voiceschanged", refresh);
				};
			}, []);
			react.default.useEffect(() => {
				let cancelled = false;
				ensureVoiceMap().then((mapValue) => {
					if (cancelled || mapValue === null) return;
					setMap(mapValue);
				});
				return () => {
					cancelled = true;
				};
			}, []);
			const update = (next) => {
				const merged = {
					...pref,
					...next
				};
				setPref(merged);
				saveVoicePref(merged);
			};
			const roleId = map?.today ?? null;
			const roleName = map?.cardName ?? roleId ?? "未加载";
			const card = roleId !== null ? map?.voices[roleId] : void 0;
			const roleRate = override?.rate ?? card?.rate ?? pref.rate;
			const rolePitch = override?.pitch ?? card?.pitch ?? pref.pitch;
			const roleURI = override !== null && override.voiceURI !== void 0 ? override.voiceURI : card?.voiceURI ?? "";
			const updateRole = (next) => {
				if (roleId === null) return;
				const merged = {
					date: localDateKey(/* @__PURE__ */ new Date()),
					cardId: roleId,
					voiceURI: override?.voiceURI,
					voiceName: override?.voiceName,
					rate: override?.rate,
					pitch: override?.pitch,
					...next
				};
				setOverride(merged);
				saveRoleOverride(merged);
			};
			const resetRole = () => {
				clearRoleOverride();
				setOverride(null);
			};
			const zhVoices = voices.filter((item) => item.lang.toLowerCase().startsWith("zh"));
			const listed = zhVoices.length > 0 ? zhVoices : voices;
			return react.default.createElement("div", { className: styles_module_css_default.voicePage }, react.default.createElement("h3", { className: styles_module_css_default.voiceTitle }, "语音朗读（TTS 声音设置）"), react.default.createElement("p", { className: styles_module_css_default.voiceHint }, "浏览器朗读用的是系统语音包：想换更甜的中文声线，去 Windows 设置 → 时间和语言 → 语音，安装「中文(简体)」语音（如 Microsoft 晓晓）；用 Edge 浏览器打开本页面还能选到在线自然语音。"), react.default.createElement("h4", { className: styles_module_css_default.voiceSection }, "扮演角色（小夏模式）"), react.default.createElement("p", { className: styles_module_css_default.voiceHint }, `今天的轮值女主角：${roleName}。下面的调整只对今天有效，明天自动恢复该角色的默认预设。`), react.default.createElement("label", { className: styles_module_css_default.voiceField }, "音色", react.default.createElement("select", {
				className: styles_module_css_default.voiceSelect,
				value: roleURI,
				onChange: (event) => {
					const uri = event.target.value;
					const voice = voices.find((item) => item.voiceURI === uri);
					updateRole(uri === "" ? {
						voiceURI: "",
						voiceName: ""
					} : {
						voiceURI: uri,
						voiceName: voice?.name ?? ""
					});
				}
			}, react.default.createElement("option", { value: "" }, "角色卡预设（自动）"), roleURI !== "" && !listed.some((item) => item.voiceURI === roleURI) ? react.default.createElement("option", { value: roleURI }, "已保存的音色（当前浏览器不可用）") : null, listed.map((item) => react.default.createElement("option", {
				key: item.voiceURI,
				value: item.voiceURI
			}, `${item.name}（${item.lang}）`)))), react.default.createElement("label", { className: styles_module_css_default.voiceField }, `语调 ${rolePitch.toFixed(1)}`, react.default.createElement("input", {
				className: styles_module_css_default.voiceRange,
				type: "range",
				min: .5,
				max: 2,
				step: .1,
				value: String(rolePitch),
				onChange: (event) => {
					updateRole({ pitch: Number(event.target.value) });
				}
			})), react.default.createElement("label", { className: styles_module_css_default.voiceField }, `语速 ${roleRate.toFixed(1)}`, react.default.createElement("input", {
				className: styles_module_css_default.voiceRange,
				type: "range",
				min: .5,
				max: 2,
				step: .1,
				value: String(roleRate),
				onChange: (event) => {
					updateRole({ rate: Number(event.target.value) });
				}
			})), react.default.createElement("div", { className: styles_module_css_default.voiceRow }, react.default.createElement("button", {
				className: styles_module_css_default.voiceTest,
				type: "button",
				onClick: () => {
					speakText("主人，你好呀。我是今天的轮值女主角，这个声音你还满意吗？");
				}
			}, "试听角色声线"), override !== null ? react.default.createElement("button", {
				className: styles_module_css_default.voiceTest,
				type: "button",
				onClick: resetRole
			}, "恢复角色默认") : null), react.default.createElement("h4", { className: styles_module_css_default.voiceSection }, "默认语音（其他模式）"), react.default.createElement("p", { className: styles_module_css_default.voiceHint }, "非轮值场景（如 standard 模式）的消息朗读与提醒使用这里的音色；小夏模式下角色没有预设时也回退到这里。"), react.default.createElement("label", { className: styles_module_css_default.voiceField }, "音色", react.default.createElement("select", {
				className: styles_module_css_default.voiceSelect,
				value: pref.voiceURI ?? "",
				onChange: (event) => {
					const uri = event.target.value;
					const voice = voices.find((item) => item.voiceURI === uri);
					update({
						voiceURI: uri === "" ? null : uri,
						voiceName: uri === "" || voice === void 0 ? "" : voice.name
					});
				}
			}, react.default.createElement("option", { value: "" }, "自动选择（首选中文语音）"), pref.voiceURI !== null && !listed.some((item) => item.voiceURI === pref.voiceURI) ? react.default.createElement("option", { value: pref.voiceURI }, "已保存的音色（当前浏览器不可用）") : null, listed.map((item) => react.default.createElement("option", {
				key: item.voiceURI,
				value: item.voiceURI
			}, `${item.name}（${item.lang}）`))), pref.voiceURI !== null && voices.length > 0 && !voices.some((item) => item.voiceURI === pref.voiceURI) ? react.default.createElement("p", { className: styles_module_css_default.voiceHint }, "注意：已保存的音色在当前浏览器不可用（可能换了浏览器或未安装对应语音包），朗读将回退到自动选择。") : null), react.default.createElement("label", { className: styles_module_css_default.voiceField }, `语速 ${pref.rate.toFixed(1)}`, react.default.createElement("input", {
				className: styles_module_css_default.voiceRange,
				type: "range",
				min: .5,
				max: 2,
				step: .1,
				value: String(pref.rate),
				onChange: (event) => {
					update({ rate: Number(event.target.value) });
				}
			})), react.default.createElement("label", { className: styles_module_css_default.voiceField }, `音调 ${pref.pitch.toFixed(1)}`, react.default.createElement("input", {
				className: styles_module_css_default.voiceRange,
				type: "range",
				min: .5,
				max: 2,
				step: .1,
				value: String(pref.pitch),
				onChange: (event) => {
					update({ pitch: Number(event.target.value) });
				}
			})), react.default.createElement("label", { className: styles_module_css_default.voiceField }, "自定义 TTS 端点（可选：开源引擎自托管，如 Kokoro / Piper / ChatTTS）", react.default.createElement("input", {
				className: styles_module_css_default.voiceSelect,
				type: "text",
				placeholder: "http://127.0.0.1:9880/tts（POST {text} 返回音频）",
				value: pref.endpoint,
				onChange: (event) => {
					update({ endpoint: event.target.value });
				}
			})), react.default.createElement("div", { className: styles_module_css_default.voiceRow }, react.default.createElement("button", {
				className: styles_module_css_default.voiceTest,
				type: "button",
				onClick: () => {
					speakDefaultText("主人，你好呀。这是默认语音，其他模式会使用这个声音。");
				}
			}, "试听默认声线")), react.default.createElement("p", { className: styles_module_css_default.voiceHint }, "设置保存在本浏览器；消息朗读按钮与审批提醒语音都会使用这里的音色。"));
		}
		/**
		* Per-user-message read-aloud action: the owner passes the joined plain text
		* directly, so this button speaks it through the same voice pipeline as the
		* assistant rows.
		*/
		function UserReadAloudAction(props) {
			const text = typeof props.text === "string" ? props.text : "";
			const [speaking, setSpeaking] = react.default.useState(false);
			const [usedVoice, setUsedVoice] = react.default.useState("");
			const [notice, setNotice] = react.default.useState(null);
			const noticeTimer = react.default.useRef(void 0);
			react.default.useEffect(() => () => {
				if (noticeTimer.current !== void 0) window.clearTimeout(noticeTimer.current);
				try {
					window.speechSynthesis?.cancel();
				} catch {}
			}, []);
			const flash = (glyph) => {
				setNotice(glyph);
				if (noticeTimer.current !== void 0) window.clearTimeout(noticeTimer.current);
				noticeTimer.current = window.setTimeout(() => {
					setNotice(null);
				}, 1600);
			};
			const onClick = async () => {
				if (notice !== null || text === "") return;
				if (speaking) {
					try {
						window.speechSynthesis?.cancel();
					} catch {}
					setSpeaking(false);
					return;
				}
				const plain = text.replace(/```[\s\S]*?```/g, "，代码省略，").replace(/[#>*_`~\-[\]()!|]/g, " ").replace(/\s+/g, " ").trim();
				if (plain === "") {
					flash("❌");
					return;
				}
				const started = await speakText(plain, { onend: () => {
					setSpeaking(false);
				} });
				if (!started.ok) {
					flash("🔇");
					return;
				}
				setUsedVoice(started.voiceName);
				setSpeaking(true);
			};
			const glyph = notice ?? (speaking ? "⏹" : "🔊");
			const title = notice === "🔇" ? "浏览器不支持语音朗读" : notice === "⚠️" ? "朗读失败" : speaking ? "停止朗读" : usedVoice === "" ? "朗读" : `朗读（上次音色：${usedVoice}）`;
			return react.default.createElement("button", {
				type: "button",
				className: styles_module_css_default.readAloud,
				title,
				"aria-label": title,
				"aria-pressed": speaking,
				onClick
			}, glyph);
		}
		/** Hard dependencies: theme, slot registry, and the sessions service (turn stop). */
		const inject = [
			"theme",
			"slots",
			"sessions"
		];
		/** Client plugin body: permanent token layer + dock charm + petal overlay. */
		function apply(ctx) {
			ctx.effect(() => ctx.theme.overrideTokens("game-assistant-permanent", SAKURA_TOKENS));
			ctx.effect(() => {
				const synth = window.speechSynthesis;
				if (synth === void 0) return;
				refreshCachedVoices();
				synth.addEventListener("voiceschanged", refreshCachedVoices);
				return () => {
					synth.removeEventListener("voiceschanged", refreshCachedVoices);
				};
			});
			ctx.effect(() => {
				let cancelled = false;
				ensureVoiceMap().then((map) => {
					if (!cancelled && map !== null) voiceMap = map;
				});
				return () => {
					cancelled = true;
				};
			});
			ctx.slots.inject("conversation.composer.dock", () => {
				const disposeCharm = ctx.slots.register({
					name: "conversation.composer.dock",
					id: "assistant-charm",
					order: 50
				}, () => react.default.createElement("div", { className: styles_module_css_default.charm }, react.default.createElement("span", { className: styles_module_css_default.dot }), react.default.createElement("span", null, "小夏在线 · " + greeting())));
				/**
				* Question notifier: when the agent asks the owner to decide (an
				* ask_user_question wait), chime and speak once, then keep chiming
				* quietly until answered. No timeout — the question waits for the owner.
				*/
				function QuestionNotifier(props) {
					const pendingKey = props.useSession((snapshot) => {
						const keys = (snapshot === null || snapshot === void 0 ? [] : snapshot.pending ?? []).filter((p) => p.kind === "question").map((p) => String(p.key));
						return keys.length === 0 ? null : keys.join(",");
					});
					const pending = pendingKey !== null;
					const timers = react.default.useRef({ reminded: /* @__PURE__ */ new Set() });
					react.default.useEffect(() => () => {
						if (timers.current.remind !== void 0) window.clearInterval(timers.current.remind);
					}, []);
					react.default.useEffect(() => {
						if (!pending) {
							timers.current.reminded.clear();
							if (timers.current.remind !== void 0) {
								window.clearInterval(timers.current.remind);
								timers.current.remind = void 0;
							}
							return;
						}
						const fresh = String(pendingKey).split(",").filter((key) => !timers.current.reminded.has(key));
						if (fresh.length > 0) {
							for (const key of fresh) timers.current.reminded.add(key);
							playChime();
							speakText("主人，有个问题需要你拿主意哦，快回来看一看～");
						}
						if (timers.current.remind === void 0) timers.current.remind = window.setInterval(playChime, APPROVAL_REMIND_MS);
					}, [pending, pendingKey]);
					if (!pending) return null;
					return react.default.createElement("div", { className: styles_module_css_default.notifyCharm }, react.default.createElement("span", null, "❓ 小夏在等主人做决定"));
				}
				/**
				* Answer-done notifier: when a full turn settles (the agent finished
				* answering), chime and speak once. A turn is considered done when the
				* completed-turn counter grows after the session was observed running
				* (any time this round — the running flag and the turn counter may land
				* in different snapshots). History replay never fires: it grows the
				* counter while the session is idle, and a session switch resets the
				* baseline.
				*/
				function AnswerDoneNotifier(props) {
					const turnSignal = props.useSession((snapshot) => {
						const s = snapshot === null || snapshot === void 0 ? void 0 : snapshot;
						if (s === void 0 || !(s.turnEnds instanceof Map)) return "0:0";
						let latest = 0;
						for (const turn of s.turnEnds.keys()) if (turn > latest) latest = turn;
						return latest + ":" + (s.running === true ? 1 : 0);
					});
					const prev = react.default.useRef(null);
					const seenRunning = react.default.useRef(false);
					react.default.useEffect(() => {
						prev.current = null;
						seenRunning.current = false;
					}, [props.sessionId]);
					react.default.useEffect(() => {
						const current = turnSignal;
						const was = prev.current;
						prev.current = current;
						if (was === null || was === current) return;
						const [prevTurns, prevRunning] = was.split(":");
						const [curTurns, curRunning] = current.split(":");
						if (prevRunning === "1" || curRunning === "1") seenRunning.current = true;
						if (seenRunning.current && Number(curTurns) > Number(prevTurns)) {
							seenRunning.current = false;
							playChime();
							speakText("主人，回答完成啦～");
						}
					}, [turnSignal]);
					return null;
				}
				/**
				* Job notifier: when a background task settles (completed / failed /
				* killed), chime and speak once per job. Subscribes the SESSIONS LIST
				* store (jobsBySession lives there, not in the per-session snapshot that
				* useSession serves — the composer's session kit only covers pending
				* interactions).
				*/
				function JobNotifier(props) {
					const jobs = react.default.useSyncExternalStore((listener) => ctx.sessions.list.subscribe(listener), () => {
						const state = ctx.sessions.list.getSnapshot();
						const bySession = state === void 0 || state === null ? void 0 : state.jobsBySession;
						return bySession === void 0 || bySession === null ? null : bySession[props.sessionId] ?? null;
					});
					const announced = react.default.useRef(/* @__PURE__ */ new Set());
					react.default.useEffect(() => {
						if (!Array.isArray(jobs)) return;
						for (const job of jobs) {
							if (announced.current.has(job.id)) continue;
							if (job.status !== "completed" && job.status !== "failed" && job.status !== "killed") continue;
							announced.current.add(job.id);
							playChime();
							const label = typeof job.label === "string" && job.label !== "" ? job.label : typeof job.kind === "string" ? job.kind : "任务";
							speakText(job.status === "completed" ? `主人，后台任务「${label}」完成啦！` : job.status === "failed" ? `主人，后台任务「${label}」失败了呢，回来看一看吧。` : `主人，后台任务「${label}」被停止了。`);
						}
					}, [jobs]);
					return null;
				}
				/**
				* Approval watchdog: while an approval question is pending, chime and
				* speak; after APPROVAL_TIMEOUT_MS without an answer, stop the turn.
				*/
				function ApprovalNotifier(props) {
					const pendingKey = props.useSession((snapshot) => {
						const keys = (snapshot === null || snapshot === void 0 ? [] : snapshot.pending ?? []).filter((p) => p.kind === "approval").map((p) => String(p.key));
						return keys.length === 0 ? null : keys.join(",");
					});
					const pending = pendingKey !== null;
					const timers = react.default.useRef({ reminded: /* @__PURE__ */ new Set() });
					react.default.useEffect(() => () => {
						if (timers.current.remind !== void 0) window.clearInterval(timers.current.remind);
						if (timers.current.stop !== void 0) window.clearTimeout(timers.current.stop);
					}, []);
					react.default.useEffect(() => {
						if (!pending) {
							timers.current.reminded.clear();
							if (timers.current.remind !== void 0) {
								window.clearInterval(timers.current.remind);
								timers.current.remind = void 0;
							}
							if (timers.current.stop !== void 0) {
								window.clearTimeout(timers.current.stop);
								timers.current.stop = void 0;
							}
							return;
						}
						const fresh = String(pendingKey).split(",").filter((key) => !timers.current.reminded.has(key));
						if (fresh.length > 0) {
							for (const key of fresh) timers.current.reminded.add(key);
							playChime();
							speakNanami();
						}
						if (timers.current.remind === void 0) timers.current.remind = window.setInterval(playChime, APPROVAL_REMIND_MS);
						if (timers.current.stop === void 0) timers.current.stop = window.setTimeout(() => {
							timers.current.stop = void 0;
							stopTurn(props.sessionId);
						}, APPROVAL_TIMEOUT_MS);
					}, [pending, pendingKey]);
					if (!pending) return null;
					return react.default.createElement("div", { className: styles_module_css_default.notifyCharm }, react.default.createElement("span", null, "🔔 有授权请求等主人确认 · 超时自动停止"));
				}
				/** Stop the in-flight turn (the composer stop-button path); reject leftovers on failure. */
				async function stopTurn(sessionId) {
					try {
						const binding = ctx.sessions.binding(sessionId);
						if (binding === void 0) return;
						const result = await binding.session.cancel();
						if (result !== void 0 && result.ok !== true) throw new Error("cancel returned not-ok");
					} catch {
						try {
							const binding = ctx.sessions.binding(sessionId);
							const snapshot = binding === void 0 ? void 0 : binding.getSnapshot();
							const waits = snapshot === void 0 ? [] : snapshot.pending ?? [];
							for (const wait of waits) {
								if (wait.kind !== "approval") continue;
								try {
									await wait.respond({
										ok: true,
										value: {
											sessionId: wait.sessionId,
											approvalId: wait.payload.approvalId,
											outcome: "rejected"
										}
									});
								} catch {}
							}
						} catch {}
					}
				}
				const disposeNotify = ctx.slots.register({
					name: "conversation.composer.dock",
					id: "assistant-approval-notify",
					order: 60
				}, ApprovalNotifier);
				const disposeQuestion = ctx.slots.register({
					name: "conversation.composer.dock",
					id: "assistant-question-notify",
					order: 61
				}, QuestionNotifier);
				const disposeJob = ctx.slots.register({
					name: "conversation.composer.dock",
					id: "assistant-job-notify",
					order: 62
				}, JobNotifier);
				const disposeAnswer = ctx.slots.register({
					name: "conversation.composer.dock",
					id: "assistant-answer-done-notify",
					order: 63
				}, AnswerDoneNotifier);
				return () => {
					disposeCharm();
					disposeNotify();
					disposeQuestion();
					disposeJob();
					disposeAnswer();
				};
			});
			ctx.slots.inject("conversation.chat.assistant-actions", () => ctx.slots.register({
				name: "conversation.chat.assistant-actions",
				id: "read-aloud",
				order: 5
			}, ReadAloudAction));
			ctx.slots.inject("conversation.chat.user-actions", () => ctx.slots.register({
				name: "conversation.chat.user-actions",
				id: "read-aloud",
				order: 5
			}, UserReadAloudAction));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "voice",
				order: 20,
				label: "语音朗读"
			}, VoiceSettings));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "sakura-petals",
				order: -100
			}, () => react.default.createElement("div", {
				className: styles_module_css_default.petalLayer,
				"aria-hidden": true
			}, Array.from({ length: 8 }, (_, index) => react.default.createElement("span", {
				key: index,
				className: styles_module_css_default.petal,
				style: {
					left: (index * 13 + 3) % 94 + "%",
					animationDelay: -index * 2.3 + "s",
					animationDuration: 11 + index % 5 * 2 + "s"
				}
			})))));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map