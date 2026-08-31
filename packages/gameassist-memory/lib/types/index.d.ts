/**
 * Persistent companion memory. Stores the owner's interests, preferences,
 * tasks, and past works in one JSON memory bank on disk, injects a compact
 * summary into the system prompt each step, and exposes `memory_read` /
 * `memory_update` tools so the assistant can keep the bank current. Every
 * contribution is disposed with the fiber.
 *
 * @module @w4xxx/dsh-gameassist-memory
 */
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "gameassist-memory";
/** The registries this plugin contributes to. */
export declare const inject: string[];
/** Plugin configuration validated by the loader. */
export interface Config {
    /** Absolute path of the JSON memory bank file. */
    memoryFile: string;
    /**
     * Truncate each task's notes to this many characters in the injected
     * system-prompt summary. Omit to keep notes unbounded; set `0` to hide
     * notes entirely. Full notes stay available through `memory_read`.
     */
    maxNoteChars?: number;
    /**
     * Truncate each work's summary to this many characters in the injected
     * system-prompt summary. Omit to keep summaries unbounded; set `0` to
     * hide summaries entirely. Full summaries stay available through
     * `memory_read`.
     */
    maxSummaryChars?: number;
}
/** Schemastery validation for {@link Config}. */
export declare const Config: z<Config>;
/** One remembered task. */
export interface Task {
    id: string;
    title: string;
    status: string;
    notes?: string;
    updatedAt?: string;
}
/** One remembered past work. */
export interface Work {
    id: string;
    name: string;
    kind?: string;
    summary?: string;
    tech?: string[];
    path?: string;
    status?: string;
    updatedAt?: string;
}
/** The memory bank document. */
export interface Memory {
    interests: string[];
    preferences: string[];
    profileNotes: string;
    tasks: Task[];
    works: Work[];
    updatedAt: string;
}
/** Arguments of the `memory_update` tool (all optional; strings are split lists). */
export interface MemoryUpdateArgs {
    interests?: string;
    preferences?: string;
    profileNotes?: string;
    taskId?: string;
    taskTitle?: string;
    taskStatus?: string;
    taskNotes?: string;
    workId?: string;
    workName?: string;
    workKind?: string;
    workSummary?: string;
    workTech?: string;
    workPath?: string;
    workStatus?: string;
    removeTaskId?: string;
    removeWorkId?: string;
}
/** Empty bank used when the file is missing or unreadable. */
export declare const EMPTY_MEMORY: Memory;
/** Current ISO timestamp. */
export declare function nowIso(): string;
/** Split a comma/、/;/-separated line into trimmed non-empty items. */
export declare function splitList(text: string): string[];
/** Options controlling how {@link renderMemory} renders the bank. */
export interface RenderOptions {
    /** Truncate each task's notes to at most this many characters. */
    maxNoteChars?: number;
    /** Truncate each work's summary to at most this many characters. */
    maxSummaryChars?: number;
}
/** Render a single text field, clipped to `max` characters when set. */
export declare function clipText(text: string, max: number | undefined): string;
/** Render the bank as a compact prompt block. */
export declare function renderMemory(memory: Memory, options?: RenderOptions): string;
/** Apply one `memory_update` argument set to a bank, returning a new bank. */
export declare function applyMemoryUpdate(previous: Memory, args: MemoryUpdateArgs): Memory;
/** Fixed guidance appended to the injected memory section. */
export declare const RECORD_INSTRUCTION: string;
/**
 * Register the memory section and tools. The bank loads once at apply time;
 * the section re-registers after every update so the next steps see fresh
 * memory.
 * @param ctx - plugin context carrying systemPrompt and tools.
 * @param config - the validated plugin configuration.
 */
export declare function apply(ctx: any, config: Config): void;
//# sourceMappingURL=index.d.ts.map