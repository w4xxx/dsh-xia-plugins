/**
 * Daily rotating companion persona. Reads character cards from a directory,
 * picks one per local calendar day (deterministic), and contributes a
 * system-prompt section that instructs the agent to play that character while
 * keeping the Xia assistant identity. A `roster_pick` tool overrides the
 * in-session pick; every contribution is disposed with the fiber.
 *
 * @module @w4xxx/dsh-gameassist-roster
 */
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "gameassist-roster";
/** The registries this plugin contributes to. */
export declare const inject: string[];
/** Plugin configuration validated by the loader. */
export interface Config {
    /** Directory holding one `*.json` character card per file. */
    cardsDir: string;
}
/** Schemastery validation for {@link Config}. */
export declare const Config: z<Config>;
/** One character card. */
export interface Card {
    id: string;
    name: string;
    source?: string;
    cv?: string;
    role?: string;
    appearance?: string;
    personality?: string[];
    speech?: {
        callsUser?: string;
        style?: string;
        catchphrases?: string[];
    };
    devSkill?: string;
    playbook?: string[];
    taboo?: string[];
    voice?: {
        name?: string;
        voiceURI?: string;
        lang?: string;
        rate?: number;
        pitch?: number;
    };
}
/** Local calendar date key, `YYYY-MM-DD` (rotation boundary = local midnight). */
export declare function localDateKey(date: Date): string;
/** Stable per-day pick over sorted ids: same key → same card; different days scatter. */
export declare function pickFor(ids: readonly string[], key: string): string;
/** Render one card as a compact persona block. */
export declare function renderCard(card: Card): string;
/**
 * Register the daily-roster section and its two tools. Cards load once at
 * apply time; the section re-registers when the day's pick is overridden.
 * @param ctx - plugin context carrying systemPrompt and tools.
 * @param config - the validated plugin configuration.
 */
export declare function apply(ctx: any, config: Config): void;
//# sourceMappingURL=index.d.ts.map