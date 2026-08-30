import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import z from "@deepseek-ai/schemastery";
//#region lib/types/index.js
/**
* Persistent companion memory. Stores the owner's interests, preferences,
* tasks, and past works in one JSON memory bank on disk, injects a compact
* summary into the system prompt each step, and exposes `memory_read` /
* `memory_update` tools so the assistant can keep the bank current. Every
* contribution is disposed with the fiber.
*
* @module @w4xxx/dsh-gameassist-memory
*/
/** Cordis plugin name used by loader diagnostics. */
const name = "gameassist-memory";
/** The registries this plugin contributes to. */
const inject = ["systemPrompt", "tools"];
/** Schemastery validation for {@link Config}. */
const Config = z.object({ memoryFile: z.string() });
/** Empty bank used when the file is missing or unreadable. */
const EMPTY_MEMORY = {
	interests: [],
	preferences: [],
	profileNotes: "",
	tasks: [],
	works: [],
	updatedAt: ""
};
/** Current ISO timestamp. */
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
/** Split a comma/、/;/-separated line into trimmed non-empty items. */
function splitList(text) {
	return text.split(/[,，、;；\n]/).map((item) => item.trim()).filter((item) => item !== "");
}
/** Render the bank as a compact prompt block. */
function renderMemory(memory) {
	const lines = [];
	if (memory.interests.length > 0) lines.push(`兴趣：${memory.interests.join("、")}`);
	if (memory.preferences.length > 0) lines.push(`喜好/偏好：${memory.preferences.join("、")}`);
	if (memory.profileNotes !== "") lines.push(`备注：${memory.profileNotes}`);
	if (memory.tasks.length > 0) {
		lines.push("任务：");
		for (const task of memory.tasks) lines.push(`- [${task.status ?? "todo"}] ${task.title}${task.notes === void 0 || task.notes === "" ? "" : `（${task.notes}）`}`);
	}
	if (memory.works.length > 0) {
		lines.push("过去作品：");
		for (const work of memory.works) {
			const tech = work.tech === void 0 || work.tech.length === 0 ? "" : `，技术：${work.tech.join("/")}`;
			lines.push(`- ${work.name}${work.kind === void 0 ? "" : `（${work.kind}）`}${work.summary === void 0 ? "" : `：${work.summary}`}${tech}${work.path === void 0 ? "" : `，路径：${work.path}`}${work.status === void 0 ? "" : `，状态：${work.status}`}`);
		}
	}
	return lines.length === 0 ? "（记忆库还是空的）" : lines.join("\n");
}
/** Apply one `memory_update` argument set to a bank, returning a new bank. */
function applyMemoryUpdate(previous, args) {
	const stamp = nowIso();
	const next = {
		interests: args.interests === void 0 ? [...previous.interests] : splitList(args.interests),
		preferences: args.preferences === void 0 ? [...previous.preferences] : splitList(args.preferences),
		profileNotes: args.profileNotes === void 0 ? previous.profileNotes : args.profileNotes,
		tasks: previous.tasks.map((task) => ({ ...task })),
		works: previous.works.map((work) => ({ ...work })),
		updatedAt: stamp
	};
	if (args.removeTaskId !== void 0) next.tasks = next.tasks.filter((task) => task.id !== args.removeTaskId);
	if (args.taskTitle !== void 0 || args.taskStatus !== void 0 || args.taskNotes !== void 0 || args.taskId !== void 0) {
		const existing = args.taskId === void 0 ? void 0 : next.tasks.find((task) => task.id === args.taskId);
		if (existing !== void 0) {
			if (args.taskTitle !== void 0) existing.title = args.taskTitle;
			if (args.taskStatus !== void 0) existing.status = args.taskStatus;
			if (args.taskNotes !== void 0) existing.notes = args.taskNotes;
			existing.updatedAt = stamp;
		} else if (args.taskTitle !== void 0) next.tasks.push({
			id: args.taskId ?? `t${Date.now().toString(36)}`,
			title: args.taskTitle,
			status: args.taskStatus ?? "todo",
			...args.taskNotes === void 0 ? {} : { notes: args.taskNotes },
			updatedAt: stamp
		});
	}
	if (args.removeWorkId !== void 0) next.works = next.works.filter((work) => work.id !== args.removeWorkId);
	if (args.workName !== void 0 || args.workKind !== void 0 || args.workSummary !== void 0 || args.workTech !== void 0 || args.workPath !== void 0 || args.workStatus !== void 0 || args.workId !== void 0) {
		const existing = args.workId === void 0 ? void 0 : next.works.find((work) => work.id === args.workId);
		if (existing !== void 0) {
			if (args.workName !== void 0) existing.name = args.workName;
			if (args.workKind !== void 0) existing.kind = args.workKind;
			if (args.workSummary !== void 0) existing.summary = args.workSummary;
			if (args.workTech !== void 0) existing.tech = splitList(args.workTech);
			if (args.workPath !== void 0) existing.path = args.workPath;
			if (args.workStatus !== void 0) existing.status = args.workStatus;
			existing.updatedAt = stamp;
		} else if (args.workName !== void 0) next.works.push({
			id: args.workId ?? `w${Date.now().toString(36)}`,
			name: args.workName,
			...args.workKind === void 0 ? {} : { kind: args.workKind },
			...args.workSummary === void 0 ? {} : { summary: args.workSummary },
			...args.workTech === void 0 ? {} : { tech: splitList(args.workTech) },
			...args.workPath === void 0 ? {} : { path: args.workPath },
			...args.workStatus === void 0 ? {} : { status: args.workStatus },
			updatedAt: stamp
		});
	}
	return next;
}
/**
* Register the memory section and tools. The bank loads once at apply time;
* the section re-registers after every update so the next steps see fresh
* memory.
* @param ctx - plugin context carrying systemPrompt and tools.
* @param config - the validated plugin configuration.
*/
function apply(ctx, config) {
	const memoryFile = config.memoryFile;
	let memory = { ...EMPTY_MEMORY };
	let disposedSection;
	const registerSection = () => {
		disposedSection?.();
		disposedSection = void 0;
		disposedSection = ctx.systemPrompt.section({
			name: "gameassist:memory",
			order: 11,
			text: [
				"【主人记忆 · 持久化】以下是从记忆库读取的主人信息，请在对话中主动参考：",
				renderMemory(memory),
				"发现主人新的兴趣、喜好、任务或作品时，主动调用 memory_update 工具记录；任务状态变化时及时更新。"
			].join("\n")
		});
	};
	const save = async () => {
		await mkdir(dirname(memoryFile), { recursive: true });
		await writeFile(memoryFile, `${JSON.stringify(memory, null, 2)}\n`, "utf8");
	};
	ctx.effect(() => {
		let settled = false;
		(async () => {
			try {
				memory = JSON.parse(await readFile(memoryFile, "utf8"));
			} catch {
				memory = { ...EMPTY_MEMORY };
			}
			if (!settled) registerSection();
		})();
		return () => {
			settled = true;
			disposedSection?.();
			disposedSection = void 0;
		};
	});
	ctx.effect(() => {
		const disposeRead = ctx.tools.register({
			name: "memory_read",
			description: "Read the persistent memory bank (interests, preferences, tasks, past works).",
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
			execute: async () => renderMemory(memory)
		});
		const disposeUpdate = ctx.tools.register({
			name: "memory_update",
			description: "Update the persistent memory bank: set interests/preferences (comma-separated strings, replace whole list), notes, upsert a task or a work, or remove one by id. Call it whenever you learn something worth remembering.",
			parameters: {
				type: "object",
				properties: {
					interests: { type: "string" },
					preferences: { type: "string" },
					profileNotes: { type: "string" },
					taskId: { type: "string" },
					taskTitle: { type: "string" },
					taskStatus: { type: "string" },
					taskNotes: { type: "string" },
					workId: { type: "string" },
					workName: { type: "string" },
					workKind: { type: "string" },
					workSummary: { type: "string" },
					workTech: { type: "string" },
					workPath: { type: "string" },
					workStatus: { type: "string" },
					removeTaskId: { type: "string" },
					removeWorkId: { type: "string" }
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
				if (!Object.values(args).some((value) => value !== void 0)) return "没有提供任何要更新的内容。可用字段：interests、preferences、profileNotes、taskTitle/taskStatus/taskNotes/taskId、workName/workKind/workSummary/workTech/workPath/workStatus/workId、removeTaskId、removeWorkId。";
				memory = applyMemoryUpdate(memory, args);
				await save();
				registerSection();
				return `记忆已更新（${memory.updatedAt}）：\n\n${renderMemory(memory)}`;
			}
		});
		return () => {
			disposeRead();
			disposeUpdate();
		};
	});
}
//#endregion
export { Config, EMPTY_MEMORY, apply, applyMemoryUpdate, inject, name, nowIso, renderMemory, splitList };
