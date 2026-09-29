import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import z from "@deepseek-ai/schemastery";
//#region lib/types/index.js
/**
* Daily rotating companion persona. Reads character cards from a directory,
* picks one per local calendar day (deterministic), and contributes a
* system-prompt section that instructs the agent to play that character while
* keeping the Xia assistant identity. A `roster_pick` tool overrides the
* in-session pick; every contribution is disposed with the fiber.
*
* @module @deepseek-ai/dsh-gameassist-roster
*/
/** Cordis plugin name used by loader diagnostics. */
const name = "gameassist-roster";
/** Cloud-TTS proxy settings namespace, editable in DSH 设置 → 插件配置. */
const TTS_NAMESPACE = "gameassist-tts";
const DEFAULT_TTS = {
	mimoApiKey: "",
	mimoBaseURL: "https://api.xiaomimimo.com/v1",
	doubaoApiKey: "",
	doubaoResourceId: "seed-tts-2.0",
	doubaoSampleRate: 24e3
};
const TtsSchema = z.object({
	mimoApiKey: z.string().role("secret").default(""),
	mimoBaseURL: z.string().default(DEFAULT_TTS.mimoBaseURL),
	doubaoApiKey: z.string().role("secret").default(""),
	doubaoResourceId: z.string().default(DEFAULT_TTS.doubaoResourceId),
	doubaoSampleRate: z.number().default(DEFAULT_TTS.doubaoSampleRate)
});
/** Live source thunk set by installSettingsSection; falls back to defaults. */
let currentTts = () => DEFAULT_TTS;
/** Synthesize with Xiaomi MiMo (OpenAI-compatible audio-completions). */
async function synthMimo(text, voice, format, apiKey, baseURL) {
	const endpoint = `${(apiKey.trim().startsWith("tp-") ? "https://token-plan-cn.xiaomimimo.com/v1" : baseURL).replace(/\/+$/, "")}/chat/completions`;
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			authorization: `Bearer ${apiKey.trim()}`,
			"content-type": "application/json",
			accept: "application/json"
		},
		body: JSON.stringify({
			model: "mimo-v2.5-tts",
			messages: [{
				role: "user",
				content: "请忠实朗读原文，根据文本语气自然表达，不添加或改写内容。"
			}, {
				role: "assistant",
				content: text
			}],
			audio: {
				format,
				voice
			},
			stream: false
		})
	});
	const parsed = await response.json().catch(() => null);
	if (!response.ok) throw new Error(`MiMo TTS HTTP ${response.status}`);
	const audioBase64 = parsed?.choices?.[0]?.message?.audio?.data;
	if (typeof audioBase64 !== "string" || audioBase64.length === 0) throw new Error("MiMo 响应无音频数据");
	return Buffer.from(audioBase64, "base64");
}
/** Synthesize with Volcengine Doubao V3 (SSE stream, base64 audio chunks). */
async function synthDoubao(text, voice, format, sampleRate, speechRate, pitchRate, loudnessRate, apiKey, resourceId) {
	const headers = {
		"content-type": "application/json",
		"x-api-resource-id": resourceId,
		"x-api-request-id": randomUUID(),
		"x-api-key": apiKey.trim()
	};
	const audioParams = {
		format,
		speech_rate: speechRate,
		loudness_rate: loudnessRate
	};
	if (format === "mp3" || format === "ogg_opus") audioParams.bit_rate = 64e3;
	const body = {
		user: { uid: "dsh-gameassist" },
		req_params: {
			text,
			speaker: voice,
			sample_rate: sampleRate,
			audio_params: audioParams,
			additions: JSON.stringify({
				post_process: { pitch: pitchRate },
				disable_markdown_filter: true,
				enable_latex_tn: true,
				latex_parser: "v2"
			})
		}
	};
	const response = await fetch("https://openspeech.bytedance.com/api/v3/tts/unidirectional/sse", {
		method: "POST",
		headers,
		body: JSON.stringify(body)
	});
	if (!response.ok) throw new Error(`豆包 TTS HTTP ${response.status}`);
	const sseText = await response.text();
	const chunks = [];
	for (const line of sseText.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("data:")) continue;
		let d;
		try {
			d = JSON.parse(trimmed.slice(5).trim());
		} catch {
			continue;
		}
		if (d.code !== 0 && d.code !== 2e7) throw new Error(`豆包 TTS code ${d.code}: ${d.message ?? ""}`);
		if (typeof d.data === "string" && d.data.length > 0) chunks.push(Buffer.from(d.data, "base64"));
	}
	if (chunks.length === 0) throw new Error("豆包 TTS 无音频数据");
	return Buffer.concat(chunks);
}
function readJsonBody(req, max) {
	return new Promise((resolve, reject) => {
		let size = 0;
		let done = false;
		const chunks = [];
		req.on("data", (chunk) => {
			if (done) return;
			size += chunk.length;
			if (size > max) {
				done = true;
				reject(/* @__PURE__ */ new Error("request-body-too-large"));
				req.destroy?.();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => {
			if (done) return;
			done = true;
			try {
				resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
			} catch (error) {
				reject(error);
			}
		});
		req.on("error", (error) => {
			if (!done) {
				done = true;
				reject(error);
			}
		});
	});
}
function json(res, status, obj) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(obj));
}
/**
* Register one HTTP route when the host actually serves HTTP.
*
* The Electron desktop shell ships without a `webServer`, so every route in
* this plugin is optional: without one the plugin still mounts its prompt
* section and its `roster_pick` / `roster_tts` tools, and only the browser-side
* conveniences (voice map, same-origin TTS proxy) are absent.
* @param ctx - plugin context that may or may not carry a `webServer`.
* @param route - the route definition forwarded verbatim when a server exists.
* @returns a disposer that is always safe to call.
*/
function registerRoute(ctx, route) {
	let webServer = ctx?.reflect?.get?.("webServer", false);
	if (webServer === void 0 || webServer === null) try {
		webServer = ctx?.webServer;
	} catch {
		webServer = void 0;
	}
	if (webServer === void 0 || webServer === null) return () => {};
	try {
		const dispose = webServer.register(route);
		return typeof dispose === "function" ? dispose : () => {};
	} catch {
		return () => {};
	}
}
/**
* The registries this plugin contributes to.
*
* `webServer` stays optional: the Electron desktop shell ships without one, and
* a hard dependency there would stop the plugin from loading at all. The TTS
* proxy routes are registered opportunistically at runtime instead.
*/
const inject = ["systemPrompt", "tools"];
/**
* Default character-card directory, resolved at load time.
*
* @returns the absolute directory path, overridable with `DSH_ROSTER_CARDS_DIR`.
*/
function defaultCardsDir() {
	const fromEnv = process.env.DSH_ROSTER_CARDS_DIR;
	if (fromEnv !== void 0 && fromEnv.trim().length > 0) return resolve(fromEnv.trim());
	return resolve("E:/myaicode/characters");
}
/** Schemastery validation for {@link Config}. */
const Config = z.object({ cardsDir: z.string().default(defaultCardsDir()) });
/** Local calendar date key, `YYYY-MM-DD` (rotation boundary = local midnight). */
function localDateKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
/** Stable per-day pick over sorted ids: same key → same card; different days scatter. */
function pickFor(ids, key) {
	let hash = 0;
	for (let i = 0; i < key.length; i += 1) hash = hash * 31 + key.charCodeAt(i) >>> 0;
	return ids[hash % ids.length];
}
/** Render one card as a compact persona block. */
function renderCard(card) {
	const lines = [`【${card.name}】${card.source === void 0 ? "" : ` —— 出自 ${card.source}`}`];
	if (card.cv !== void 0) lines.push(`声优：${card.cv}`);
	if (card.role !== void 0) lines.push(`游戏开发职责：${card.role}`);
	if (card.appearance !== void 0) lines.push(`外貌：${card.appearance}`);
	if (card.personality !== void 0 && card.personality.length > 0) lines.push(`性格：${card.personality.join("；")}`);
	if (card.speech !== void 0) {
		if (card.speech.callsUser !== void 0) lines.push(`称呼主人：${card.speech.callsUser}`);
		if (card.speech.style !== void 0) lines.push(`说话风格：${card.speech.style}`);
		if (card.speech.catchphrases !== void 0 && card.speech.catchphrases.length > 0) lines.push(`口头禅：${card.speech.catchphrases.join("、")}`);
	}
	if (card.devSkill !== void 0) lines.push(`开发专长：${card.devSkill}`);
	if (card.playbook !== void 0 && card.playbook.length > 0) lines.push(`扮演要点：\n- ${card.playbook.join("\n- ")}`);
	if (card.taboo !== void 0 && card.taboo.length > 0) lines.push(`禁止事项：\n- ${card.taboo.join("\n- ")}`);
	return lines.join("\n");
}
/**
* Register the daily-roster section and its two tools. Cards load once at
* apply time; the section re-registers when the day's pick is overridden.
* @param ctx - plugin context carrying systemPrompt and tools.
* @param config - the validated plugin configuration.
*/
function apply(ctx, config) {
	const cardsDir = config.cardsDir;
	let cards = [];
	let overrideId;
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.installSection(ctx, TTS_NAMESPACE, TtsSchema, DEFAULT_TTS, {
			setSource: (thunk) => {
				currentTts = thunk;
			},
			onChange: () => {}
		});
	});
	const current = () => {
		if (cards.length === 0) return void 0;
		const id = overrideId === void 0 ? pickFor(cards.map((card) => card.id), localDateKey(/* @__PURE__ */ new Date())) : overrideId;
		return cards.find((card) => card.id === id) ?? cards[0];
	};
	const sectionText = () => {
		const card = current();
		if (card === void 0) return `【每日随机女主角】角色卡目录为空或不可读（cardsDir: ${cardsDir}）。今天以小夏本来的身份陪伴主人。`;
		return [
			`【每日随机女主角 · ${localDateKey(/* @__PURE__ */ new Date())}】`,
			"今天你要扮演的角色：",
			"",
			renderCard(card),
			"",
			"扮演规则：你的底层身份仍是「小夏」（聪明伶俐、体贴温柔的游戏开发助手妹子），",
			"但今天全程以这位角色的性格、语气、口癖与称呼方式回应主人，并继续使用全部工具协助主人开发游戏；",
			"角色设定与工程严谨不冲突。若主人想换角色，调用 roster_pick 工具（支持指定 id 或随机）。"
		].join("\n");
	};
	let disposedSection;
	const disposeSection = () => {
		disposedSection?.();
		disposedSection = void 0;
	};
	const registerSection = () => {
		disposeSection();
		disposedSection = ctx.systemPrompt.section({
			name: "gameassist:roster",
			order: 10,
			text: sectionText()
		});
	};
	ctx.effect(() => {
		let settled = false;
		(async () => {
			try {
				const files = (await readdir(cardsDir)).filter((file) => file.endsWith(".json")).sort();
				const loaded = [];
				for (const file of files) try {
					loaded.push(JSON.parse(await readFile(join(cardsDir, file), "utf8")));
				} catch {}
				cards = loaded;
			} catch {
				cards = [];
			}
			if (!settled) registerSection();
		})();
		return () => {
			settled = true;
			disposeSection();
		};
	});
	ctx.effect(() => {
		const disposeRoute = registerRoute(ctx, {
			kind: "exact",
			path: "/gameassist/voice-map",
			handler: (_req, res) => {
				const voices = {};
				for (const card of cards) if (card.voice !== void 0) voices[card.id] = card.voice;
				const today = current();
				const body = JSON.stringify({
					today: today?.id ?? null,
					cardName: today?.name ?? null,
					voices
				});
				res.writeHead(200, {
					"content-type": "application/json; charset=utf-8",
					"cache-control": "no-cache"
				});
				res.end(body);
			}
		});
		return () => {
			disposeRoute();
		};
	});
	ctx.effect(() => {
		const disposeRoute = registerRoute(ctx, {
			kind: "exact",
			path: "/gameassist/tts",
			async handler(req, res) {
				if (req.method !== "POST") {
					res.setHeader("allow", "POST");
					json(res, 405, { error: "method-not-allowed" });
					return;
				}
				let body;
				try {
					body = await readJsonBody(req, 1024 * 1024);
				} catch {
					json(res, 400, { error: "invalid-json" });
					return;
				}
				const text = typeof body.text === "string" ? body.text.trim() : "";
				const provider = typeof body.provider === "string" ? body.provider : "";
				const voice = typeof body.voice === "string" && body.voice.trim() !== "" ? body.voice.trim() : null;
				if (text.length === 0) {
					json(res, 400, { error: "text-required" });
					return;
				}
				const tts = currentTts();
				try {
					let audio;
					if (provider === "mimo") {
						if (tts.mimoApiKey.trim().length === 0) {
							json(res, 409, { error: "mimo-api-key-not-configured" });
							return;
						}
						audio = await synthMimo(text, voice ?? "冰糖", "mp3", tts.mimoApiKey, tts.mimoBaseURL);
					} else if (provider === "doubao") {
						if (tts.doubaoApiKey.trim().length === 0) {
							json(res, 409, { error: "doubao-api-key-not-configured" });
							return;
						}
						audio = await synthDoubao(text, voice ?? "zh_female_vv_uranus_bigtts", "mp3", Number(body.sampleRate ?? tts.doubaoSampleRate), Number(body.speechRate ?? 0), Number(body.pitchRate ?? 0), Number(body.loudnessRate ?? 0), tts.doubaoApiKey, tts.doubaoResourceId);
					} else {
						json(res, 400, { error: "unsupported-provider" });
						return;
					}
					res.writeHead(200, {
						"content-type": "audio/mpeg",
						"cache-control": "no-cache"
					});
					res.end(audio);
				} catch (error) {
					json(res, 502, {
						error: "provider-error",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}
		});
		return () => {
			disposeRoute();
		};
	});
	ctx.effect(() => {
		const disposeRoute = registerRoute(ctx, {
			kind: "exact",
			path: "/gameassist/doubao-voices",
			async handler(_req, res) {
				try {
					const html = await readFile("E:/myaicode/tools/doubao-voice-finder.html", "utf8");
					res.writeHead(200, {
						"content-type": "text/html; charset=utf-8",
						"cache-control": "no-cache"
					});
					res.end(html);
				} catch (error) {
					json(res, 500, {
						error: "voice-page-unavailable",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}
		});
		return () => {
			disposeRoute();
		};
	});
	ctx.effect(() => {
		const disposeList = ctx.tools.register({
			name: "roster_list",
			description: "List every character card in the daily companion roster.",
			parameters: {
				type: "object",
				properties: {}
			},
			output: {
				schema: { type: "string" },
				render(_a, v) {
					return [{
						type: "text",
						text: v
					}];
				}
			},
			execute: async () => {
				if (cards.length === 0) return "角色卡目录为空或不可读。";
				const today = pickFor(cards.map((card) => card.id), localDateKey(/* @__PURE__ */ new Date()));
				return cards.map((card) => `${card.id} — ${card.name}（${card.source ?? "出处未知"}）${card.id === today ? " ← 今日" : ""}`).join("\n");
			}
		});
		const disposePick = ctx.tools.register({
			name: "roster_pick",
			description: "Override or re-roll today's companion character: pass an id, or random=true to pick a different one.",
			parameters: {
				type: "object",
				properties: {
					id: { type: "string" },
					random: { type: "boolean" }
				}
			},
			output: {
				schema: { type: "string" },
				render(_a, v) {
					return [{
						type: "text",
						text: v
					}];
				}
			},
			execute: async (args) => {
				if (cards.length === 0) return "角色卡目录为空或不可读。";
				if (args.id !== void 0) {
					const found = cards.find((card) => card.id === args.id);
					if (found === void 0) return `没有找到角色 "${args.id}"。可用：${cards.map((card) => card.id).join("、")}`;
					overrideId = found.id;
				} else {
					const currentId = current()?.id;
					const others = cards.filter((card) => card.id !== currentId);
					const pool = others.length > 0 ? others : cards;
					overrideId = pool[Math.floor(Math.random() * pool.length)].id;
				}
				registerSection();
				const card = current();
				return card === void 0 ? "切换失败。" : `已切换为今日角色：\n\n${renderCard(card)}`;
			}
		});
		return () => {
			disposeList();
			disposePick();
		};
	});
}
//#endregion
export { Config, apply, defaultCardsDir, inject, localDateKey, name, pickFor, renderCard };
