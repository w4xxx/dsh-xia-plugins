/**
 * Persistent companion memory. Stores the owner's interests, preferences,
 * tasks, and past works in one JSON memory bank on disk, injects a compact
 * summary into the system prompt each step, and exposes `memory_read` /
 * `memory_update` tools so the assistant can keep the bank current. Every
 * contribution is disposed with the fiber.
 *
 * @module @w4xxx/dsh-gameassist-memory
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name used by loader diagnostics. */
export const name = 'gameassist-memory';
/** The registries this plugin contributes to. */
export const inject = ['systemPrompt', 'tools'];
/** Schemastery validation for {@link Config}. */
export const Config = z.object({
    memoryFile: z.string(),
    maxNoteChars: z.number().default(200),
    maxSummaryChars: z.number().default(120),
});
/** Empty bank used when the file is missing or unreadable. */
export const EMPTY_MEMORY = {
    interests: [],
    preferences: [],
    profileNotes: '',
    tasks: [],
    works: [],
    updatedAt: '',
};
/** Current ISO timestamp. */
export function nowIso() {
    return new Date().toISOString();
}
/** Split a comma/、/;/-separated line into trimmed non-empty items. */
export function splitList(text) {
    return text.split(/[,，、;；\n]/).map(item => item.trim()).filter(item => item !== '');
}
/** Render a single text field, clipped to `max` characters when set. */
export function clipText(text, max) {
    if (max === undefined || text.length <= max)
        return text;
    return `${text.slice(0, max)}…`;
}
/** Render the bank as a compact prompt block. */
export function renderMemory(memory, options = {}) {
    const lines = [];
    if (memory.interests.length > 0)
        lines.push(`兴趣：${memory.interests.join('、')}`);
    if (memory.preferences.length > 0)
        lines.push(`喜好/偏好：${memory.preferences.join('、')}`);
    if (memory.profileNotes !== '')
        lines.push(`备注：${memory.profileNotes}`);
    if (memory.tasks.length > 0) {
        lines.push('任务：');
        for (const task of memory.tasks) {
            const notes = task.notes === undefined || task.notes === '' ? '' : `（${clipText(task.notes, options.maxNoteChars)}）`;
            lines.push(`- [${task.status ?? 'todo'}] ${task.title}${notes}`);
        }
    }
    if (memory.works.length > 0) {
        lines.push('过去作品：');
        for (const work of memory.works) {
            const tech = work.tech === undefined || work.tech.length === 0 ? '' : `，技术：${work.tech.join('/')}`;
            const summary = work.summary === undefined || work.summary === '' ? '' : `：${clipText(work.summary, options.maxSummaryChars)}`;
            lines.push(`- ${work.name}${work.kind === undefined ? '' : `（${work.kind}）`}${summary}${tech}${work.path === undefined ? '' : `，路径：${work.path}`}${work.status === undefined ? '' : `，状态：${work.status}`}`);
        }
    }
    return lines.length === 0 ? '（记忆库还是空的）' : lines.join('\n');
}
/** Apply one `memory_update` argument set to a bank, returning a new bank. */
export function applyMemoryUpdate(previous, args) {
    const stamp = nowIso();
    const next = {
        interests: args.interests === undefined ? [...previous.interests] : splitList(args.interests),
        preferences: args.preferences === undefined ? [...previous.preferences] : splitList(args.preferences),
        profileNotes: args.profileNotes === undefined ? previous.profileNotes : args.profileNotes,
        tasks: previous.tasks.map(task => ({ ...task })),
        works: previous.works.map(work => ({ ...work })),
        updatedAt: stamp,
    };
    if (args.removeTaskId !== undefined) {
        next.tasks = next.tasks.filter(task => task.id !== args.removeTaskId);
    }
    if (args.taskTitle !== undefined || args.taskStatus !== undefined || args.taskNotes !== undefined || args.taskId !== undefined) {
        const existing = args.taskId === undefined ? undefined : next.tasks.find(task => task.id === args.taskId);
        if (existing !== undefined) {
            if (args.taskTitle !== undefined)
                existing.title = args.taskTitle;
            if (args.taskStatus !== undefined)
                existing.status = args.taskStatus;
            if (args.taskNotes !== undefined)
                existing.notes = args.taskNotes;
            existing.updatedAt = stamp;
        }
        else if (args.taskTitle !== undefined) {
            next.tasks.push({
                id: args.taskId ?? `t${Date.now().toString(36)}`,
                title: args.taskTitle,
                status: args.taskStatus ?? 'todo',
                ...(args.taskNotes === undefined ? {} : { notes: args.taskNotes }),
                updatedAt: stamp,
            });
        }
    }
    if (args.removeWorkId !== undefined) {
        next.works = next.works.filter(work => work.id !== args.removeWorkId);
    }
    if (args.workName !== undefined || args.workKind !== undefined || args.workSummary !== undefined || args.workTech !== undefined || args.workPath !== undefined || args.workStatus !== undefined || args.workId !== undefined) {
        const existing = args.workId === undefined ? undefined : next.works.find(work => work.id === args.workId);
        if (existing !== undefined) {
            if (args.workName !== undefined)
                existing.name = args.workName;
            if (args.workKind !== undefined)
                existing.kind = args.workKind;
            if (args.workSummary !== undefined)
                existing.summary = args.workSummary;
            if (args.workTech !== undefined)
                existing.tech = splitList(args.workTech);
            if (args.workPath !== undefined)
                existing.path = args.workPath;
            if (args.workStatus !== undefined)
                existing.status = args.workStatus;
            existing.updatedAt = stamp;
        }
        else if (args.workName !== undefined) {
            next.works.push({
                id: args.workId ?? `w${Date.now().toString(36)}`,
                name: args.workName,
                ...(args.workKind === undefined ? {} : { kind: args.workKind }),
                ...(args.workSummary === undefined ? {} : { summary: args.workSummary }),
                ...(args.workTech === undefined ? {} : { tech: splitList(args.workTech) }),
                ...(args.workPath === undefined ? {} : { path: args.workPath }),
                ...(args.workStatus === undefined ? {} : { status: args.workStatus }),
                updatedAt: stamp,
            });
        }
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
export function apply(ctx, config) {
    const memoryFile = config.memoryFile;
    let memory = { ...EMPTY_MEMORY };
    const renderOptions = {
        maxNoteChars: config.maxNoteChars ?? 200,
        maxSummaryChars: config.maxSummaryChars ?? 120,
    };
    let disposedSection;
    const registerSection = () => {
        disposedSection?.();
        disposedSection = undefined;
        const summary = renderMemory(memory, renderOptions);
        const full = renderMemory(memory);
        const truncated = summary !== full;
        disposedSection = ctx.systemPrompt.section({
            name: 'gameassist:memory',
            order: 11,
            text: [
                '【主人记忆 · 持久化】以下是从记忆库读取的主人信息，请在对话中主动参考：',
                summary,
                ...(truncated ? ['（长文本已按配置截断，完整内容可随时调用 memory_read 工具查看）'] : []),
                '发现主人新的兴趣、喜好、任务或作品时，主动调用 memory_update 工具记录；任务状态变化时及时更新。',
            ].join('\n'),
        });
    };
    const save = async () => {
        await mkdir(dirname(memoryFile), { recursive: true });
        await writeFile(memoryFile, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
    };
    ctx.effect(() => {
        let settled = false;
        void (async () => {
            try {
                memory = JSON.parse(await readFile(memoryFile, 'utf8'));
            }
            catch {
                memory = { ...EMPTY_MEMORY };
            }
            if (!settled)
                registerSection();
        })();
        return () => {
            settled = true;
            disposedSection?.();
            disposedSection = undefined;
        };
    });
    ctx.effect(() => {
        const disposeRead = ctx.tools.register({
            name: 'memory_read',
            description: 'Read the full persistent memory bank (interests, preferences, tasks, past works). Unlike the injected system-prompt summary, this returns the complete untruncated content even when maxNoteChars/maxSummaryChars are configured.',
            parameters: { type: 'object', properties: {} },
            output: { schema: { type: 'string' }, render(_a, v) { return [{ type: 'text', text: v }]; } },
            execute: async () => renderMemory(memory),
        });
        const disposeUpdate = ctx.tools.register({
            name: 'memory_update',
            description: 'Update the persistent memory bank: set interests/preferences (comma-separated strings, replace whole list), notes, upsert a task or a work, or remove one by id. Call it whenever you learn something worth remembering.',
            parameters: {
                type: 'object',
                properties: {
                    interests: { type: 'string' },
                    preferences: { type: 'string' },
                    profileNotes: { type: 'string' },
                    taskId: { type: 'string' },
                    taskTitle: { type: 'string' },
                    taskStatus: { type: 'string' },
                    taskNotes: { type: 'string' },
                    workId: { type: 'string' },
                    workName: { type: 'string' },
                    workKind: { type: 'string' },
                    workSummary: { type: 'string' },
                    workTech: { type: 'string' },
                    workPath: { type: 'string' },
                    workStatus: { type: 'string' },
                    removeTaskId: { type: 'string' },
                    removeWorkId: { type: 'string' },
                },
            },
            output: { schema: { type: 'string' }, render(_a, v) { return [{ type: 'text', text: v }]; } },
            execute: async (args) => {
                const changed = Object.values(args).some(value => value !== undefined);
                if (!changed)
                    return '没有提供任何要更新的内容。可用字段：interests、preferences、profileNotes、taskTitle/taskStatus/taskNotes/taskId、workName/workKind/workSummary/workTech/workPath/workStatus/workId、removeTaskId、removeWorkId。';
                memory = applyMemoryUpdate(memory, args);
                await save();
                registerSection();
                return `记忆已更新（${memory.updatedAt}）：\n\n${renderMemory(memory)}`;
            },
        });
        return () => {
            disposeRead();
            disposeUpdate();
        };
    });
}
//# sourceMappingURL=index.js.map