/** TTS engine the read-aloud pipeline speaks through. */
export type VoiceProvider = 'browser' | 'endpoint' | 'mimo' | 'doubao';
/** Xiaomi MiMo built-in voice presets (mimo-v2.5-tts). */
export declare const MIMO_VOICES: readonly ["冰糖", "茉莉", "苏打", "白桦", "Mia", "Chloe", "Milo", "Dean"];
/** Volcengine Doubao voice_type presets verified for `seed-tts-2.0` (2026-09-01, resource id must match). */
export declare const DOUBAO_VOICES: ReadonlyArray<{
    id: string;
    label: string;
}>;
/** Hard dependencies: theme, slot registry, the sessions service (turn stop), and the ui-session pending-interaction store. */
export declare const inject: string[];
/** Client plugin body: permanent token layer + dock charm + petal overlay. */
export declare function apply(ctx: any): void;
//# sourceMappingURL=index.d.ts.map