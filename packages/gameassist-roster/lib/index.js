import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import z from "@deepseek-ai/schemastery";
//#region lib/types/index.js
/**
* Daily rotating companion persona. Reads character cards from a directory,
* picks one per local calendar day (deterministic), and contributes a
* system-prompt section that instructs the agent to play that character while
* keeping the Xia assistant identity. A `roster_pick` tool overrides the
* in-session pick; every contribution is disposed with the fiber.
*
* @module @w4xxx/dsh-gameassist-roster
*/
/** Cordis plugin name used by loader diagnostics. */
const name = "gameassist-roster";
/** The registries this plugin contributes to. */
const inject = [
	"systemPrompt",
	"tools",
	"webServer"
];
/** Schemastery validation for {@link Config}. */
const Config = z.object({ cardsDir: z.string() });
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
		const disposeRoute = ctx.webServer.register({
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
export { Config, apply, inject, localDateKey, name, pickFor, renderCard };
