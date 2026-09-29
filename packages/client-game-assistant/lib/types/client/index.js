/**
 * Game-assistant companion skin, browser half. Permanent "sakura" alias-token
 * layer over the active theme, a time-aware charm line in the composer dock,
 * and a pointer-transparent petal overlay. Everything rides the cordis
 * lifecycle: stopping the row removes the token layer, both slot entries, and
 * the injected CSS.
 */
import React from 'react';
import styles from './styles.module.css';
/** Token → per-scheme value pairs layered over the active theme. */
const SAKURA_TOKENS = {
    '--dsw-alias-bg-base': { light: '#fdf7f9', dark: '#171219' },
    '--dsw-alias-bg-layer-1': { light: '#fffafd', dark: '#201824' },
    '--dsw-alias-bg-layer-2': { light: '#f8eef3', dark: '#2a1e2c' },
    '--dsw-alias-bg-overlay': { light: '#fff7fa', dark: '#241a26' },
    '--dsw-alias-border-l1': { light: '#f2dfe7', dark: '#382635' },
    '--dsw-alias-border-l2': { light: '#e3c3d1', dark: '#4c3145' },
    '--dsw-alias-brand-primary': { light: '#e0558f', dark: '#ff7ab8' },
    '--dsw-alias-label-primary': { light: '#3f2b36', dark: '#eee3eb' },
    '--dsw-alias-label-secondary': { light: '#8a6f7c', dark: '#a98fa3' },
    '--dsw-alias-state-error-primary': { light: '#e5484d', dark: '#ff6b70' },
    '--dsw-alias-state-success-primary': { light: '#30a46c', dark: '#55c98a' },
    '--dsw-alias-state-warn-primary': { light: '#e08f26', dark: '#f2b04c' },
    '--dsw-specific-sidebar-fill': { light: '#f6e9ef', dark: '#1d1520' },
};
/** [startHour, endHourExclusive, line] windows; the last window wraps midnight. */
const GREETINGS = [
    [5, 11, '早上好~今天也要元气满满'],
    [11, 17, '下午好~小夏陪你敲代码'],
    [17, 23, '晚上好~写完这段就休息一下吧'],
    [23, 5, '夜深了…小夏在呢，别熬太晚哦'],
];
function greeting() {
    const hour = new Date().getHours();
    const found = GREETINGS.find(([from, to]) => (from < to ? hour >= from && hour < to : hour >= from || hour < to));
    const line = found === undefined ? GREETINGS[1] : found;
    return line[2];
}
/** Notifier cadence: remind-chime interval and unattended stop deadline. */
const APPROVAL_TIMEOUT_MS = 120_000;
const APPROVAL_REMIND_MS = 20_000;
/** Two-tone chime via Web Audio (silent when audio is unavailable or blocked). */
function playChime() {
    try {
        const Ctor = window.AudioContext ?? window.webkitAudioContext;
        if (Ctor === undefined)
            return;
        const audio = new Ctor();
        void audio.resume();
        const tone = (freq, at, dur) => {
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.0001, audio.currentTime + at);
            gain.gain.exponentialRampToValueAtTime(0.22, audio.currentTime + at + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + at + dur);
            osc.connect(gain);
            gain.connect(audio.destination);
            osc.start(audio.currentTime + at);
            osc.stop(audio.currentTime + at + dur + 0.05);
        };
        tone(659.25, 0, 0.18);
        tone(987.77, 0.22, 0.32);
        window.setTimeout(() => { void audio.close(); }, 1600);
    }
    catch { /* audio unavailable — stay silent */ }
}
/** localStorage key for the voice preference (browser-local by design: voices are per machine). */
const VOICE_STORAGE_KEY = 'dsh.gameassist.voice.v1';
/** Xiaomi MiMo built-in voice presets (mimo-v2.5-tts). */
export const MIMO_VOICES = ['冰糖', '茉莉', '苏打', '白桦', 'Mia', 'Chloe', 'Milo', 'Dean'];
/** Volcengine Doubao voice_type presets verified for `seed-tts-2.0` (2026-09-01, resource id must match). */
export const DOUBAO_VOICES = [
    { id: 'zh_female_vv_uranus_bigtts', label: 'vivi 2.0（女声）' },
    { id: 'zh_female_xiaohe_uranus_bigtts', label: '小何（女声）' },
    { id: 'zh_male_m191_uranus_bigtts', label: '云舟（男声）' },
    { id: 'zh_male_taocheng_uranus_bigtts', label: '小天（男声）' },
];
const DEFAULT_VOICE_PREF = {
    voiceURI: null,
    voiceName: '',
    rate: 1.1,
    pitch: 1.1,
    endpoint: '',
    provider: 'browser',
    mimoVoice: '冰糖',
    mimoFormat: 'mp3',
    doubaoVoice: 'zh_female_vv_uranus_bigtts',
    doubaoFormat: 'mp3',
    doubaoSampleRate: 24000,
    doubaoSpeechRate: 0,
    doubaoPitchRate: 0,
    doubaoLoudnessRate: 0,
};
/** Read the persisted voice preference with bounds-guards and a safe default. */
function loadVoicePref() {
    try {
        const raw = window.localStorage.getItem(VOICE_STORAGE_KEY);
        if (raw === null)
            return { ...DEFAULT_VOICE_PREF };
        const parsed = JSON.parse(raw);
        const provider = parsed.provider === 'mimo' || parsed.provider === 'doubao' || parsed.provider === 'endpoint' ? parsed.provider : 'browser';
        return {
            voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : null,
            voiceName: typeof parsed.voiceName === 'string' ? parsed.voiceName : '',
            rate: typeof parsed.rate === 'number' && parsed.rate >= 0.5 && parsed.rate <= 2 ? parsed.rate : 1.1,
            pitch: typeof parsed.pitch === 'number' && parsed.pitch >= 0.5 && parsed.pitch <= 2 ? parsed.pitch : 1.1,
            endpoint: typeof parsed.endpoint === 'string' ? parsed.endpoint : '',
            provider,
            mimoVoice: typeof parsed.mimoVoice === 'string' && parsed.mimoVoice !== '' ? parsed.mimoVoice : DEFAULT_VOICE_PREF.mimoVoice,
            mimoFormat: parsed.mimoFormat === 'wav' || parsed.mimoFormat === 'pcm' ? parsed.mimoFormat : 'mp3',
            doubaoVoice: typeof parsed.doubaoVoice === 'string' && parsed.doubaoVoice !== '' ? parsed.doubaoVoice : DEFAULT_VOICE_PREF.doubaoVoice,
            doubaoFormat: parsed.doubaoFormat === 'pcm' || parsed.doubaoFormat === 'ogg_opus' ? parsed.doubaoFormat : 'mp3',
            doubaoSampleRate: typeof parsed.doubaoSampleRate === 'number' && [8000, 16000, 22050, 24000, 32000, 44100, 48000].includes(parsed.doubaoSampleRate) ? parsed.doubaoSampleRate : 24000,
            doubaoSpeechRate: typeof parsed.doubaoSpeechRate === 'number' && parsed.doubaoSpeechRate >= -50 && parsed.doubaoSpeechRate <= 100 ? parsed.doubaoSpeechRate : 0,
            doubaoPitchRate: typeof parsed.doubaoPitchRate === 'number' && parsed.doubaoPitchRate >= -12 && parsed.doubaoPitchRate <= 12 ? parsed.doubaoPitchRate : 0,
            doubaoLoudnessRate: typeof parsed.doubaoLoudnessRate === 'number' && parsed.doubaoLoudnessRate >= -50 && parsed.doubaoLoudnessRate <= 100 ? parsed.doubaoLoudnessRate : 0,
        };
    }
    catch {
        return { ...DEFAULT_VOICE_PREF };
    }
}
/** Persist the voice preference (best effort — private mode may refuse). */
function saveVoicePref(pref) {
    try {
        window.localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(pref));
    }
    catch { /* non-persistent */ }
}
/** localStorage key for the per-day role-voice override. */
const ROLE_OVERRIDE_KEY = 'dsh.gameassist.role-voice.v1';
/** Local calendar date key, `YYYY-MM-DD` (same boundary as the roster rotation). */
function localDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
/** Read the role-voice override with shape guards (invalid entries degrade to null). */
function loadRoleOverride() {
    try {
        const raw = window.localStorage.getItem(ROLE_OVERRIDE_KEY);
        if (raw === null)
            return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.date !== 'string' || typeof parsed.cardId !== 'string')
            return null;
        return {
            date: parsed.date,
            cardId: parsed.cardId,
            voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : undefined,
            voiceName: typeof parsed.voiceName === 'string' ? parsed.voiceName : undefined,
            rate: typeof parsed.rate === 'number' && parsed.rate >= 0.5 && parsed.rate <= 2 ? parsed.rate : undefined,
            pitch: typeof parsed.pitch === 'number' && parsed.pitch >= 0.5 && parsed.pitch <= 2 ? parsed.pitch : undefined,
        };
    }
    catch {
        return null;
    }
}
/** Persist the role-voice override (best effort). */
function saveRoleOverride(value) {
    try {
        window.localStorage.setItem(ROLE_OVERRIDE_KEY, JSON.stringify(value));
    }
    catch { /* non-persistent */ }
}
/** Drop the role-voice override (back to the card defaults). */
function clearRoleOverride() {
    try {
        window.localStorage.removeItem(ROLE_OVERRIDE_KEY);
    }
    catch { /* non-persistent */ }
}
let voiceMap = null;
/**
 * Module-level voice cache. Browsers populate getVoices() asynchronously —
 * before the first `voiceschanged` event it can return [] and every matcher
 * misses. The cache is warmed at plugin apply and refreshed on every
 * `voiceschanged`, so per-click matching never races the async load.
 */
let cachedVoices = [];
/** Currently-playing browser Audio element from a cloud-TTS call, for the stop path. */
let activeCloudAudio = null;
/** AbortController for the in-flight cloud-TTS fetch, so a second click cancels it. */
let activeCloudController = null;
/** Injected settings scope for the host-held `gameassist-tts` cloud-TTS keys. */
let ttsScope = null;
const TTS_NAMESPACE = 'gameassist-tts';
function refreshCachedVoices() {
    try {
        const synth = window.speechSynthesis;
        if (synth === undefined)
            return;
        const list = synth.getVoices();
        if (list.length > 0)
            cachedVoices = list;
    }
    catch { /* keep previous cache */ }
}
/** Wait (bounded) for the engine to publish its voice list. */
async function waitForVoices(timeoutMs = 1000) {
    try {
        const synth = window.speechSynthesis;
        if (synth === undefined)
            return [];
        const existing = synth.getVoices();
        if (existing.length > 0)
            return existing;
        return await new Promise((resolve) => {
            let settled = false;
            const finish = () => {
                if (settled)
                    return;
                settled = true;
                synth.removeEventListener('voiceschanged', finish);
                window.clearTimeout(timer);
                resolve(synth.getVoices());
            };
            const timer = window.setTimeout(finish, timeoutMs);
            synth.addEventListener('voiceschanged', finish);
        });
    }
    catch {
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
    if (voiceMap !== null)
        return Promise.resolve(voiceMap);
    if (voiceMapLoading !== null)
        return voiceMapLoading;
    const fetchOnce = async () => {
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const response = await fetch('/gameassist/voice-map', { cache: 'no-cache' });
                if (!response.ok)
                    throw new Error(`voice-map status ${response.status}`);
                const map = await response.json();
                voiceMap = map;
                return map;
            }
            catch {
                // Route not ready yet — wait with backoff (300ms, 600ms, 1.2s, 2.4s)
                await new Promise((resolve) => window.setTimeout(resolve, 300 * 2 ** attempt));
            }
        }
        return voiceMap;
    };
    voiceMapLoading = fetchOnce().finally(() => { voiceMapLoading = null; });
    return voiceMapLoading;
}
/**
 * Shared TTS speaker. Priority: a configured custom endpoint (open-source
 * engines like Kokoro/Piper/ChatTTS) → the day's character voice from the
 * roster map → the global voice preference → any Chinese voice → the browser
 * default.
 * @returns false when nothing could speak (callers flash 🔇).
 */
/** Speak through a cloud provider via the same-origin `/gameassist/tts` proxy. Keys stay host-side. */
async function speakViaCloud(pref, text, options) {
    const controller = new AbortController();
    activeCloudController = controller;
    const payload = pref.provider === 'mimo'
        ? { provider: 'mimo', text, voice: pref.mimoVoice, format: pref.mimoFormat }
        : { provider: 'doubao', text, voice: pref.doubaoVoice, format: pref.doubaoFormat, sampleRate: pref.doubaoSampleRate, speechRate: pref.doubaoSpeechRate, pitchRate: pref.doubaoPitchRate, loudnessRate: pref.doubaoLoudnessRate };
    let response;
    try {
        response = await fetch('/gameassist/tts', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
    }
    finally {
        if (activeCloudController === controller)
            activeCloudController = null;
    }
    if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const message = errBody?.message;
        throw new Error(`${pref.provider} tts ${response.status}${message !== undefined ? `: ${message}` : ''}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    // MiMo TTS has no API speed/pitch param, so the 语速 slider controls the
    // client playback rate; Doubao uses its own speech_rate (already applied host-side).
    if (pref.provider === 'mimo')
        audio.playbackRate = Math.min(2, Math.max(0.5, pref.rate));
    activeCloudAudio = audio;
    const finish = () => {
        if (activeCloudAudio === audio)
            activeCloudAudio = null;
        if (activeCloudController === controller)
            activeCloudController = null;
        if (options?.onend !== undefined)
            options.onend();
        URL.revokeObjectURL(url);
    };
    audio.onended = finish;
    audio.onerror = finish;
    await audio.play();
    const label = pref.provider === 'mimo' ? `MiMo:${pref.mimoVoice}` : `豆包:${pref.doubaoVoice}`;
    return { ok: true, voiceName: label };
}
async function speakText(text, options) {
    const pref = loadVoicePref();
    if (pref.provider === 'mimo' || pref.provider === 'doubao') {
        try {
            return await speakViaCloud(pref, text, options);
        }
        catch (error) {
            console.log('[read-aloud] cloud tts failed:', error);
            if (error?.name === 'AbortError')
                return { ok: false, voiceName: '', aborted: true };
            return { ok: false, voiceName: '' };
        }
    }
    if (pref.endpoint !== '') {
        try {
            const response = await fetch(pref.endpoint, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            if (!response.ok)
                throw new Error(`tts endpoint status ${response.status}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            const finish = () => {
                if (options?.onend !== undefined)
                    options.onend();
                URL.revokeObjectURL(url);
            };
            audio.onended = finish;
            audio.onerror = finish;
            await audio.play();
            return { ok: true, voiceName: '自定义端点' };
        }
        catch {
            // endpoint unreachable — fall through to the browser voice
        }
    }
    try {
        await ensureVoiceMap();
        const synth = window.speechSynthesis;
        if (synth === undefined)
            return { ok: false, voiceName: '' };
        const char = voiceMap === null || voiceMap.today === null ? undefined : voiceMap.voices[voiceMap.today];
        // Per-day role override: valid only while its date and card id still match
        // today's companion — tomorrow (or after a roster_pick switch) it expires
        // and the card defaults return.
        const storedOverride = loadRoleOverride();
        const override = char === undefined || storedOverride === null
            || storedOverride.date !== localDateKey(new Date()) || storedOverride.cardId !== voiceMap.today
            ? null
            : storedOverride;
        const rate = override?.rate ?? char?.rate ?? pref.rate;
        const pitch = override?.pitch ?? char?.pitch ?? pref.pitch;
        const targetURI = (override !== null && override.voiceURI !== undefined && override.voiceURI !== '' ? override.voiceURI : char?.voiceURI) ?? pref.voiceURI;
        const targetName = override !== null && override.voiceName !== undefined && override.voiceName !== '' ? override.voiceName : char?.name;
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = rate;
        utter.pitch = pitch;
        const voices = cachedVoices.length > 0 ? cachedVoices : await waitForVoices();
        if (voices.length > 0)
            cachedVoices = voices;
        const pickUri = (uri) => voices.find((item) => item.voiceURI === uri);
        const pickName = (name) => {
            const needle = name.toLowerCase();
            return voices.find((item) => item.name.toLowerCase().includes(needle));
        };
        const pickLang = (lang) => {
            const needle = lang.toLowerCase();
            return voices.find((item) => item.lang.toLowerCase().startsWith(needle));
        };
        // Priority: the day's role override voiceURI → the character card voiceURI
        // → the user's configured default voice (URI, then name — the user's
        // explicit choice always outranks a card's generic name hint) → the card's
        // name → the card's lang → Chinese.
        let chosen;
        if (targetURI !== null && targetURI !== undefined)
            chosen = pickUri(targetURI);
        if (chosen === undefined && pref.voiceURI !== null && pref.voiceURI !== '')
            chosen = pickUri(pref.voiceURI);
        if (chosen === undefined && pref.voiceName !== '')
            chosen = pickName(pref.voiceName);
        if (chosen === undefined && targetName !== undefined && targetName !== '')
            chosen = pickName(targetName);
        if (chosen === undefined)
            chosen = pickLang(char?.lang ?? 'zh-CN');
        if (chosen === undefined)
            chosen = pickLang('zh');
        if (chosen !== undefined) {
            // Engines may discard a voice whose lang disagrees with the utterance's,
            // so sync the utterance lang to the chosen voice before assignment.
            if (chosen.lang !== '')
                utter.lang = chosen.lang;
            utter.voice = chosen;
        }
        console.log('[read-aloud] voice:', chosen?.name ?? '(browser default)', 'lang:', utter.lang);
        if (options?.onend !== undefined)
            utter.onend = options.onend;
        synth.speak(utter);
        return { ok: true, voiceName: chosen?.name ?? `浏览器默认（语音列表 ${voices.length} 条）` };
    }
    catch {
        return { ok: false, voiceName: '' };
    }
}
/** Speak the approval reminder aloud with the configured voice. */
function speakNanami() {
    void speakText('主人，有授权请求需要你确认啦，快回来看一看！');
}
/**
 * Speak through the DEFAULT voice only (no role layer): the settings page's
 * default-voice audition. The endpoint preference still applies when set.
 */
async function speakDefaultText(text) {
    const pref = loadVoicePref();
    if (pref.provider === 'mimo' || pref.provider === 'doubao') {
        try {
            await speakViaCloud(pref, text);
        }
        catch (error) {
            console.log('[read-aloud] default cloud tts failed:', error);
        }
        return;
    }
    if (pref.endpoint !== '') {
        try {
            const response = await fetch(pref.endpoint, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            if (!response.ok)
                throw new Error(`tts endpoint status ${response.status}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            const finish = () => { URL.revokeObjectURL(url); };
            audio.onended = finish;
            audio.onerror = finish;
            await audio.play();
            return;
        }
        catch {
            // endpoint unreachable — fall through to the browser voice
        }
    }
    try {
        const synth = window.speechSynthesis;
        if (synth === undefined)
            return;
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-CN';
        utter.rate = pref.rate;
        utter.pitch = pref.pitch;
        const voices = cachedVoices.length > 0 ? cachedVoices : await waitForVoices();
        if (voices.length > 0)
            cachedVoices = voices;
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
        if (pref.voiceURI !== null && pref.voiceURI !== '')
            chosen = pickUri(pref.voiceURI);
        if (chosen === undefined && pref.voiceName !== '')
            chosen = pickName(pref.voiceName);
        if (chosen === undefined)
            chosen = pickLang('zh-CN');
        if (chosen === undefined)
            chosen = pickLang('zh');
        if (chosen !== undefined) {
            if (chosen.lang !== '')
                utter.lang = chosen.lang;
            utter.voice = chosen;
        }
        synth.speak(utter);
    }
    catch { /* stay silent */ }
}
/**
 * Per-assistant-message read-aloud action: speaks the message text with the
 * browser's Chinese TTS voice; a second click stops it. The plain-text
 * projection strips markdown and replaces fenced code with a placeholder.
 */
function ReadAloudAction(props) {
    const messageId = String(props.messageId);
    // DSH 0.1.2-alpha.1: session-scoped slots inject `useChat` (ChatSnapshot),
    // not `useSession`. ChatSnapshot carries the flat ConversationNode list
    // under `legacy.nodes`; assistant nodes there have kind 'assistant' plus
    // messageId/blocks. Fall back to the view store and old shapes for older
    // checkouts.
    const useChat = props.useChat ?? props.useSession;
    const text = useChat((snapshot) => {
        const parts = [];
        const collect = (node) => {
            if (node === null || node === undefined || parts.length > 0)
                return;
            if (node.kind === 'assistant' && String(node.messageId) === messageId) {
                for (const block of node.blocks ?? []) {
                    if ((block.kind === 'text' || block.type === 'text') && typeof block.text === 'string')
                        parts.push(block.text);
                }
            }
        };
        if (snapshot !== null && snapshot !== undefined) {
            const legacyNodes = snapshot.legacy?.nodes;
            if (legacyNodes !== undefined) {
                for (const node of legacyNodes)
                    collect(node);
            }
            if (parts.length === 0 && snapshot.nodes !== undefined && typeof snapshot.nodes.values === 'function') {
                for (const viewNode of snapshot.nodes.values()) {
                    const final = viewNode?.data?.finalNode;
                    if (final !== undefined && final !== null)
                        collect(final);
                }
            }
            if (parts.length === 0 && Array.isArray(snapshot.nodes)) {
                for (const node of snapshot.nodes)
                    collect(node);
            }
            if (parts.length === 0 && snapshot.chat !== undefined && snapshot.chat.nodes !== undefined && typeof snapshot.chat.nodes.values === 'function') {
                for (const viewNode of snapshot.chat.nodes.values()) {
                    const final = viewNode?.data?.finalNode;
                    if (final !== undefined && final !== null)
                        collect(final);
                }
            }
        }
        return parts.length === 0 ? null : parts.join('\n');
    });
    const [speaking, setSpeaking] = React.useState(false);
    const [usedVoice, setUsedVoice] = React.useState('');
    const [notice, setNotice] = React.useState(null);
    const noticeTimer = React.useRef(undefined);
    React.useEffect(() => () => {
        if (noticeTimer.current !== undefined)
            window.clearTimeout(noticeTimer.current);
        try {
            window.speechSynthesis?.cancel();
        }
        catch { /* nothing to cancel */ }
    }, []);
    const flash = (glyph) => {
        setNotice(glyph);
        if (noticeTimer.current !== undefined)
            window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => { setNotice(null); }, 1600);
    };
    const onClick = async () => {
        if (notice !== null)
            return;
        if (speaking) {
            // Stop path: cancel browser synth, abort any in-flight cloud fetch, pause playback.
            try {
                window.speechSynthesis?.cancel();
            }
            catch { /* nothing */ }
            activeCloudController?.abort();
            activeCloudController = null;
            if (activeCloudAudio !== null) {
                activeCloudAudio.pause();
                activeCloudAudio = null;
            }
            setSpeaking(false);
            return;
        }
        if (text === null || text === '') {
            console.log('[read-aloud] no text found for message', messageId);
            flash('❌');
            return;
        }
        const { provider } = loadVoicePref();
        const needsBrowser = provider !== 'mimo' && provider !== 'doubao' && provider !== 'endpoint';
        if (needsBrowser && window.speechSynthesis === undefined) {
            console.log('[read-aloud] speechSynthesis unavailable');
            flash('🔇');
            return;
        }
        const plain = text
            .replace(/```[\s\S]*?```/g, '，代码省略，')
            .replace(/[#>*_`~\-[\]()!|]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (plain === '') {
            flash('❌');
            return;
        }
        console.log('[read-aloud] speaking', plain.length, 'chars for message', messageId);
        setSpeaking(true);
        const started = await speakText(plain, { onend: () => { setSpeaking(false); } });
        if (!started.ok) {
            setSpeaking(false);
            if (!started.aborted)
                flash('🔇');
            return;
        }
        setUsedVoice(started.voiceName);
    };
    const glyph = notice ?? (speaking ? '⏹' : '🔊');
    const title = notice === '❌' ? '未找到消息文本'
        : notice === '🔇' ? '浏览器不支持语音朗读'
            : notice === '⚠️' ? '朗读失败'
                : speaking ? '停止朗读'
                    : usedVoice === '' ? '朗读' : `朗读（上次音色：${usedVoice}）`;
    return React.createElement('button', {
        type: 'button',
        className: styles.readAloud,
        title,
        'aria-label': title,
        'aria-pressed': speaking,
        onClick,
    }, glyph);
}
/**
 * Voice settings page (registered in the settings panel): two sections — the
 * day's companion role (card preset plus a per-day override that expires with
 * the date) and the default voice used by every non-roster mode. Both persist
 * in localStorage and feed speakText().
 */
/**
 * Cloud-TTS credential editor for the host-held `gameassist-tts` namespace.
 * Keys are written write-only (role 'secret' redacts them from responses), so
 * the inputs start blank and a save pushes any non-empty value server-side.
 */
function CloudKeysPanel(props) {
    const provider = props.provider;
    const [ready, setReady] = React.useState(false);
    const [mimoKey, setMimoKey] = React.useState('');
    const [doubaoKey, setDoubaoKey] = React.useState('');
    const [mimoBase, setMimoBase] = React.useState('https://api.xiaomimimo.com/v1');
    const [doubaoRes, setDoubaoRes] = React.useState('seed-tts-2.0');
    const [sampleRate, setSampleRate] = React.useState('24000');
    const [saved, setSaved] = React.useState(false);
    React.useEffect(() => {
        if (ttsScope === null)
            return;
        const refresh = () => { setReady(ttsScope.getSnapshot().status === 'ready'); };
        refresh();
        const un = ttsScope.subscribe(() => refresh());
        return () => { un(); };
    }, []);
    const save = async () => {
        if (ttsScope === null)
            return;
        try {
            if (provider === 'mimo') {
                if (mimoKey.trim() !== '')
                    await ttsScope.set('mimoApiKey', mimoKey.trim());
                if (mimoBase.trim() !== '')
                    await ttsScope.set('mimoBaseURL', mimoBase.trim());
            }
            else if (provider === 'doubao') {
                if (doubaoKey.trim() !== '')
                    await ttsScope.set('doubaoApiKey', doubaoKey.trim());
                if (doubaoRes.trim() !== '')
                    await ttsScope.set('doubaoResourceId', doubaoRes.trim());
                if (sampleRate.trim() !== '' && !Number.isNaN(Number(sampleRate)))
                    await ttsScope.set('doubaoSampleRate', Number(sampleRate));
            }
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2000);
        }
        catch (error) {
            console.log('[tts] cloud keys save failed', error);
        }
    };
    return React.createElement('div', { 'data-tts-ready': ready ? '1' : '0' }, React.createElement('p', { className: styles.voiceHint }, provider === 'mimo'
        ? 'MiMo 密钥存在服务器、不返回浏览器；填好点保存即可。'
        : '豆包密钥存在服务器、不返回浏览器；填好点保存即可。'), provider === 'mimo'
        ? React.createElement(React.Fragment, null, React.createElement('label', { className: styles.voiceField }, 'MiMo API Key', React.createElement('input', {
            className: styles.voiceSelect, type: 'password', placeholder: 'sk- 或 tp- 开头',
            value: mimoKey,
            onChange: (event) => { setMimoKey(event.target.value); },
        })), React.createElement('label', { className: styles.voiceField }, 'MiMo 端点（可选）', React.createElement('input', {
            className: styles.voiceSelect, type: 'text',
            value: mimoBase,
            onChange: (event) => { setMimoBase(event.target.value); },
        })))
        : null, provider === 'doubao'
        ? React.createElement(React.Fragment, null, React.createElement('label', { className: styles.voiceField }, '豆包 API Key', React.createElement('input', {
            className: styles.voiceSelect, type: 'password', placeholder: '控制台 API Key（UUID）',
            value: doubaoKey,
            onChange: (event) => { setDoubaoKey(event.target.value); },
        })), React.createElement('label', { className: styles.voiceField }, '豆包资源 ID（可选）', React.createElement('input', {
            className: styles.voiceSelect, type: 'text',
            value: doubaoRes,
            onChange: (event) => { setDoubaoRes(event.target.value); },
        })), React.createElement('label', { className: styles.voiceField }, '豆包采样率（可选）', React.createElement('input', {
            className: styles.voiceSelect, type: 'number',
            value: sampleRate,
            onChange: (event) => { setSampleRate(event.target.value); },
        })))
        : null, React.createElement('div', { className: styles.voiceRow }, React.createElement('button', {
        className: styles.voiceTest, type: 'button',
        onClick: () => { void save(); },
    }, saved ? '已保存' : '保存密钥')));
}
function VoiceSettings() {
    const [voices, setVoices] = React.useState(() => {
        try {
            return window.speechSynthesis === undefined ? [] : window.speechSynthesis.getVoices();
        }
        catch {
            return [];
        }
    });
    const [pref, setPref] = React.useState(loadVoicePref);
    const [map, setMap] = React.useState(voiceMap);
    const [override, setOverride] = React.useState(() => {
        const stored = loadRoleOverride();
        const today = voiceMap?.today ?? null;
        if (stored === null || today === null || stored.date !== localDateKey(new Date()) || stored.cardId !== today)
            return null;
        return stored;
    });
    React.useEffect(() => {
        const synth = window.speechSynthesis;
        if (synth === undefined)
            return;
        const refresh = () => { setVoices(synth.getVoices()); };
        refresh();
        synth.addEventListener('voiceschanged', refresh);
        return () => { synth.removeEventListener('voiceschanged', refresh); };
    }, []);
    // Fetch the role map fresh on mount so the page shows today's companion.
    // ensureVoiceMap retries while the host route is still registering, so the
    // settings page never locks onto a 404-triggered empty map.
    React.useEffect(() => {
        let cancelled = false;
        void ensureVoiceMap().then((mapValue) => {
            if (cancelled || mapValue === null)
                return;
            setMap(mapValue);
        });
        return () => { cancelled = true; };
    }, []);
    const update = (next) => {
        const merged = { ...pref, ...next };
        setPref(merged);
        saveVoicePref(merged);
    };
    const roleId = map?.today ?? null;
    const roleName = map?.cardName ?? roleId ?? '未加载';
    const card = roleId !== null ? map?.voices[roleId] : undefined;
    const roleRate = override?.rate ?? card?.rate ?? pref.rate;
    const rolePitch = override?.pitch ?? card?.pitch ?? pref.pitch;
    const roleURI = override !== null && override.voiceURI !== undefined ? override.voiceURI : (card?.voiceURI ?? '');
    const updateRole = (next) => {
        if (roleId === null)
            return;
        const merged = {
            date: localDateKey(new Date()),
            cardId: roleId,
            voiceURI: override?.voiceURI,
            voiceName: override?.voiceName,
            rate: override?.rate,
            pitch: override?.pitch,
            ...next,
        };
        setOverride(merged);
        saveRoleOverride(merged);
    };
    const resetRole = () => {
        clearRoleOverride();
        setOverride(null);
    };
    const zhVoices = voices.filter((item) => item.lang.toLowerCase().startsWith('zh'));
    const listed = zhVoices.length > 0 ? zhVoices : voices;
    return React.createElement('div', { className: styles.voicePage }, React.createElement('h3', { className: styles.voiceTitle }, '语音朗读（TTS 声音设置）'), React.createElement('p', { className: styles.voiceHint }, '浏览器朗读用的是系统语音包：想换更甜的中文声线，去 Windows 设置 → 时间和语言 → 语音，安装「中文(简体)」语音（如 Microsoft 晓晓）；用 Edge 浏览器打开本页面还能选到在线自然语音。'), React.createElement('h4', { className: styles.voiceSection }, '朗读引擎（音源）'), React.createElement('p', { className: styles.voiceHint }, '选择朗读用的引擎。云端引擎（MiMo / 豆包）的 API Key 在「设置 → 插件配置 → 语音合成」里配置，Key 只存服务器、不进浏览器。'), React.createElement('label', { className: styles.voiceField }, '引擎', React.createElement('select', {
        className: styles.voiceSelect,
        value: pref.provider,
        onChange: (event) => { update({ provider: event.target.value }); },
    }, React.createElement('option', { value: 'browser' }, '浏览器语音（speechSynthesis）'), React.createElement('option', { value: 'endpoint' }, '自定义 TTS 端点（自托管）'), React.createElement('option', { value: 'mimo' }, '小米 MiMo（云端）'), React.createElement('option', { value: 'doubao' }, '豆包（火山引擎 · 云端）'))), pref.provider === 'mimo'
        ? React.createElement(React.Fragment, null, React.createElement('label', { className: styles.voiceField }, '音色', React.createElement('select', {
            className: styles.voiceSelect,
            value: pref.mimoVoice,
            onChange: (event) => { update({ mimoVoice: event.target.value }); },
        }, MIMO_VOICES.map((voiceName) => React.createElement('option', { key: voiceName, value: voiceName }, voiceName)))), React.createElement('label', { className: styles.voiceField }, '音频格式', React.createElement('select', {
            className: styles.voiceSelect,
            value: pref.mimoFormat,
            onChange: (event) => { update({ mimoFormat: event.target.value }); },
        }, React.createElement('option', { value: 'mp3' }, 'MP3'), React.createElement('option', { value: 'wav' }, 'WAV'), React.createElement('option', { value: 'pcm' }, 'PCM'))))
        : null, pref.provider === 'doubao'
        ? React.createElement(React.Fragment, null, React.createElement('label', { className: styles.voiceField }, '音色', React.createElement('select', {
            className: styles.voiceSelect,
            value: DOUBAO_VOICES.some((item) => item.id === pref.doubaoVoice) ? pref.doubaoVoice : '__custom__',
            onChange: (event) => { update({ doubaoVoice: event.target.value }); },
        }, DOUBAO_VOICES.map((item) => React.createElement('option', { key: item.id, value: item.id }, item.label)), React.createElement('option', { value: '__custom__' }, '自定义音色 id…'))), pref.doubaoVoice !== '' && !DOUBAO_VOICES.some((item) => item.id === pref.doubaoVoice)
            ? React.createElement('label', { className: styles.voiceField }, '自定义 voice_type', React.createElement('input', {
                className: styles.voiceSelect,
                type: 'text',
                value: pref.doubaoVoice,
                onChange: (event) => { update({ doubaoVoice: event.target.value }); },
            }))
            : null, React.createElement('label', { className: styles.voiceField }, '采样率', React.createElement('select', {
            className: styles.voiceSelect,
            value: String(pref.doubaoSampleRate),
            onChange: (event) => { update({ doubaoSampleRate: Number(event.target.value) }); },
        }, [8000, 16000, 22050, 24000, 32000, 44100, 48000].map((sr) => React.createElement('option', { key: sr, value: String(sr) }, `${sr} Hz`)))), React.createElement('label', { className: styles.voiceField }, `语速 ${pref.doubaoSpeechRate}`, React.createElement('input', {
            className: styles.voiceRange, type: 'range', min: -50, max: 100, step: 1,
            value: String(pref.doubaoSpeechRate),
            onChange: (event) => { update({ doubaoSpeechRate: Number(event.target.value) }); },
        })), React.createElement('label', { className: styles.voiceField }, `音调 ${pref.doubaoPitchRate}`, React.createElement('input', {
            className: styles.voiceRange, type: 'range', min: -12, max: 12, step: 1,
            value: String(pref.doubaoPitchRate),
            onChange: (event) => { update({ doubaoPitchRate: Number(event.target.value) }); },
        })), React.createElement('label', { className: styles.voiceField }, `音量 ${pref.doubaoLoudnessRate}`, React.createElement('input', {
            className: styles.voiceRange, type: 'range', min: -50, max: 100, step: 1,
            value: String(pref.doubaoLoudnessRate),
            onChange: (event) => { update({ doubaoLoudnessRate: Number(event.target.value) }); },
        })), React.createElement('p', { className: styles.voiceHint }, React.createElement('a', {
            className: styles.voiceSelect,
            href: '/gameassist/doubao-voices',
            target: '_blank',
            rel: 'noreferrer',
        }, '📖 打开豆包音色对照表（选好后复制 voice_type 粘到上面的「自定义 voice_type」）')))
        : null, React.createElement('div', { className: styles.voiceRow }, React.createElement('button', {
        className: styles.voiceTest,
        type: 'button',
        onClick: () => { void speakDefaultText('主人，你好呀。这是当前引擎的声音，这个声线你喜欢吗？'); },
    }, '试听当前引擎')), React.createElement(CloudKeysPanel, { provider: pref.provider }), React.createElement('h4', { className: styles.voiceSection }, '扮演角色（小夏模式）'), React.createElement('p', { className: styles.voiceHint }, `今天的轮值女主角：${roleName}。下面的调整只对今天有效，明天自动恢复该角色的默认预设。`), React.createElement('label', { className: styles.voiceField }, '音色', React.createElement('select', {
        className: styles.voiceSelect,
        value: roleURI,
        onChange: (event) => {
            const uri = event.target.value;
            const voice = voices.find((item) => item.voiceURI === uri);
            updateRole(uri === '' ? { voiceURI: '', voiceName: '' } : { voiceURI: uri, voiceName: voice?.name ?? '' });
        },
    }, React.createElement('option', { value: '' }, '角色卡预设（自动）'), roleURI !== '' && !listed.some((item) => item.voiceURI === roleURI)
        ? React.createElement('option', { value: roleURI }, '已保存的音色（当前浏览器不可用）')
        : null, listed.map((item) => React.createElement('option', { key: item.voiceURI, value: item.voiceURI }, `${item.name}（${item.lang}）`)))), React.createElement('label', { className: styles.voiceField }, `语调 ${rolePitch.toFixed(1)}`, React.createElement('input', {
        className: styles.voiceRange,
        type: 'range',
        min: 0.5,
        max: 2,
        step: 0.1,
        value: String(rolePitch),
        onChange: (event) => { updateRole({ pitch: Number(event.target.value) }); },
    })), React.createElement('label', { className: styles.voiceField }, `语速 ${roleRate.toFixed(1)}`, React.createElement('input', {
        className: styles.voiceRange,
        type: 'range',
        min: 0.5,
        max: 2,
        step: 0.1,
        value: String(roleRate),
        onChange: (event) => { updateRole({ rate: Number(event.target.value) }); },
    })), React.createElement('div', { className: styles.voiceRow }, React.createElement('button', {
        className: styles.voiceTest,
        type: 'button',
        onClick: () => { void speakText('主人，你好呀。我是今天的轮值女主角，这个声音你还满意吗？'); },
    }, '试听角色声线'), override !== null
        ? React.createElement('button', { className: styles.voiceTest, type: 'button', onClick: resetRole }, '恢复角色默认')
        : null), React.createElement('h4', { className: styles.voiceSection }, '默认语音（其他模式）'), React.createElement('p', { className: styles.voiceHint }, '非轮值场景（如 standard 模式）的消息朗读与提醒使用这里的音色；小夏模式下角色没有预设时也回退到这里。'), React.createElement('label', { className: styles.voiceField }, '音色', React.createElement('select', {
        className: styles.voiceSelect,
        value: pref.voiceURI ?? '',
        onChange: (event) => {
            const uri = event.target.value;
            const voice = voices.find((item) => item.voiceURI === uri);
            update({ voiceURI: uri === '' ? null : uri, voiceName: uri === '' || voice === undefined ? '' : voice.name });
        },
    }, React.createElement('option', { value: '' }, '自动选择（首选中文语音）'), pref.voiceURI !== null && !listed.some((item) => item.voiceURI === pref.voiceURI)
        ? React.createElement('option', { value: pref.voiceURI }, '已保存的音色（当前浏览器不可用）')
        : null, listed.map((item) => React.createElement('option', { key: item.voiceURI, value: item.voiceURI }, `${item.name}（${item.lang}）`))), pref.voiceURI !== null && voices.length > 0 && !voices.some((item) => item.voiceURI === pref.voiceURI)
        ? React.createElement('p', { className: styles.voiceHint }, '注意：已保存的音色在当前浏览器不可用（可能换了浏览器或未安装对应语音包），朗读将回退到自动选择。')
        : null), React.createElement('label', { className: styles.voiceField }, `语速 ${pref.rate.toFixed(1)}`, React.createElement('input', {
        className: styles.voiceRange,
        type: 'range',
        min: 0.5,
        max: 2,
        step: 0.1,
        value: String(pref.rate),
        onChange: (event) => { update({ rate: Number(event.target.value) }); },
    })), React.createElement('label', { className: styles.voiceField }, `音调 ${pref.pitch.toFixed(1)}`, React.createElement('input', {
        className: styles.voiceRange,
        type: 'range',
        min: 0.5,
        max: 2,
        step: 0.1,
        value: String(pref.pitch),
        onChange: (event) => { update({ pitch: Number(event.target.value) }); },
    })), React.createElement('label', { className: styles.voiceField }, '自定义 TTS 端点（可选：开源引擎自托管，如 Kokoro / Piper / ChatTTS）', React.createElement('input', {
        className: styles.voiceSelect,
        type: 'text',
        placeholder: 'http://127.0.0.1:9880/tts（POST {text} 返回音频）',
        value: pref.endpoint,
        onChange: (event) => { update({ endpoint: event.target.value }); },
    })), React.createElement('div', { className: styles.voiceRow }, React.createElement('button', {
        className: styles.voiceTest,
        type: 'button',
        onClick: () => { void speakDefaultText('主人，你好呀。这是默认语音，其他模式会使用这个声音。'); },
    }, '试听默认声线')), React.createElement('p', { className: styles.voiceHint }, '设置保存在本浏览器；消息朗读按钮与审批提醒语音都会使用这里的音色。'));
}
/**
 * Per-user-message read-aloud action: the owner passes the joined plain text
 * directly, so this button speaks it through the same voice pipeline as the
 * assistant rows.
 */
function UserReadAloudAction(props) {
    const text = typeof props.text === 'string' ? props.text : '';
    const [speaking, setSpeaking] = React.useState(false);
    const [usedVoice, setUsedVoice] = React.useState('');
    const [notice, setNotice] = React.useState(null);
    const noticeTimer = React.useRef(undefined);
    React.useEffect(() => () => {
        if (noticeTimer.current !== undefined)
            window.clearTimeout(noticeTimer.current);
        try {
            window.speechSynthesis?.cancel();
        }
        catch { /* nothing to cancel */ }
    }, []);
    const flash = (glyph) => {
        setNotice(glyph);
        if (noticeTimer.current !== undefined)
            window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => { setNotice(null); }, 1600);
    };
    const onClick = async () => {
        if (notice !== null || text === '')
            return;
        if (speaking) {
            try {
                window.speechSynthesis?.cancel();
            }
            catch { /* nothing */ }
            activeCloudController?.abort();
            activeCloudController = null;
            if (activeCloudAudio !== null) {
                activeCloudAudio.pause();
                activeCloudAudio = null;
            }
            setSpeaking(false);
            return;
        }
        const plain = text
            .replace(/```[\s\S]*?```/g, '，代码省略，')
            .replace(/[#>*_`~\-[\]()!|]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (plain === '') {
            flash('❌');
            return;
        }
        setSpeaking(true);
        const started = await speakText(plain, { onend: () => { setSpeaking(false); } });
        if (!started.ok) {
            setSpeaking(false);
            if (!started.aborted)
                flash('🔇');
            return;
        }
        setUsedVoice(started.voiceName);
    };
    const glyph = notice ?? (speaking ? '⏹' : '🔊');
    const title = notice === '🔇' ? '浏览器不支持语音朗读'
        : notice === '⚠️' ? '朗读失败'
            : speaking ? '停止朗读'
                : usedVoice === '' ? '朗读' : `朗读（上次音色：${usedVoice}）`;
    return React.createElement('button', {
        type: 'button',
        className: styles.readAloud,
        title,
        'aria-label': title,
        'aria-pressed': speaking,
        onClick,
    }, glyph);
}
/** Hard dependencies: theme, slot registry, the sessions service (turn stop), and the ui-session pending-interaction store. */
export const inject = ['theme', 'slots', 'sessions', 'uiSession', 'settingsScope'];
/** Client plugin body: permanent token layer + dock charm + petal overlay. */
export function apply(ctx) {
    ttsScope = ctx.settingsScope.bind({ namespace: TTS_NAMESPACE });
    ctx.effect(() => ctx.theme.overrideTokens('game-assistant-permanent', SAKURA_TOKENS));
    ctx.effect(() => {
        const synth = window.speechSynthesis;
        if (synth === undefined)
            return;
        refreshCachedVoices();
        synth.addEventListener('voiceschanged', refreshCachedVoices);
        return () => { synth.removeEventListener('voiceschanged', refreshCachedVoices); };
    });
    ctx.effect(() => {
        let cancelled = false;
        void ensureVoiceMap().then((map) => { if (!cancelled && map !== null)
            voiceMap = map; });
        return () => { cancelled = true; };
    });
    ctx.slots.inject('conversation.composer.dock', () => {
        const disposeCharm = ctx.slots.register({ name: 'conversation.composer.dock', id: 'assistant-charm', order: 50 }, () => React.createElement('div', { className: styles.charm }, React.createElement('span', { className: styles.dot }), React.createElement('span', null, '小夏在线 · ' + greeting())));
        /**
         * Question notifier: when the agent asks the owner to decide (an
         * ask_user_question wait), chime and speak once, then keep chiming
         * quietly until answered. No timeout — the question waits for the owner.
         * DSH 0.1.2-alpha.1 moved pending interactions out of the per-session
         * snapshot into the uiSession pendingInteractions map, so this subscribes
         * that store directly instead of a slot-injected session hook.
         */
        function QuestionNotifier(props) {
            const sessionId = props?.sessionId ?? props?.session?.sessionId;
            const pendingKey = React.useSyncExternalStore((listener) => ctx.uiSession.pendingInteractions.subscribe(listener), () => {
                const map = ctx.uiSession.pendingInteractions.getSnapshot();
                if (map === undefined || map === null || sessionId === undefined)
                    return null;
                const entry = map.get(sessionId);
                return entry !== undefined && entry !== null && entry.kind === 'question' ? String(entry.key) : null;
            });
            const pending = pendingKey !== null;
            const timers = React.useRef({ reminded: new Set() });
            React.useEffect(() => () => {
                if (timers.current.remind !== undefined)
                    window.clearInterval(timers.current.remind);
            }, []);
            React.useEffect(() => {
                if (!pending) {
                    timers.current.reminded.clear();
                    if (timers.current.remind !== undefined) {
                        window.clearInterval(timers.current.remind);
                        timers.current.remind = undefined;
                    }
                    return;
                }
                const fresh = String(pendingKey).split(',').filter((key) => !timers.current.reminded.has(key));
                if (fresh.length > 0) {
                    for (const key of fresh)
                        timers.current.reminded.add(key);
                    playChime();
                    void speakText('主人，有个问题需要你拿主意哦，快回来看一看～');
                }
                if (timers.current.remind === undefined) {
                    timers.current.remind = window.setInterval(playChime, APPROVAL_REMIND_MS);
                }
            }, [pending, pendingKey]);
            if (!pending)
                return null;
            return React.createElement('div', { className: styles.notifyCharm }, React.createElement('span', null, '❓ 小夏在等主人做决定'));
        }
        /**
         * Answer-done notifier: when a full turn settles (the agent finished
         * answering), chime and speak once. DSH 0.1.2-alpha.1 exposes session
         * activity through the sessions list store (`running` + `updatedAt`);
         * a turn is considered done when the session flips from running to idle
         * and its updatedAt moved — history replay never fires because it never
         * flips running, and a session switch resets the baseline.
         */
        function AnswerDoneNotifier(props) {
            const sessionId = props?.sessionId ?? props?.session?.sessionId;
            const signal = React.useSyncExternalStore((listener) => ctx.sessions.list.subscribe(listener), () => {
                const state = ctx.sessions.list.getSnapshot();
                const summary = state === undefined || state === null || sessionId === undefined ? undefined : state.byId?.[sessionId];
                if (summary === undefined || summary === null)
                    return '0';
                return summary.running === true ? '1' : '0';
            });
            const prev = React.useRef(null);
            const seenRunning = React.useRef(false);
            React.useEffect(() => {
                // A different session gets a fresh baseline (no cross-session fire).
                prev.current = null;
                seenRunning.current = false;
            }, [props?.sessionId ?? props?.session?.sessionId]);
            React.useEffect(() => {
                const current = signal;
                const was = prev.current;
                prev.current = current;
                if (was === null || was === current)
                    return;
                if (was === '1' || current === '1')
                    seenRunning.current = true;
                // Fire on the running → idle falling edge. `updatedAt` is not reliable
                // here: it can advance mid-answer (content streaming) and stay put on
                // the final flip, so the edge alone is the signal. History replay never
                // fires because it never flips running.
                if (seenRunning.current && was === '1' && current === '0') {
                    seenRunning.current = false;
                    playChime();
                    void speakText('主人，回答完成啦～');
                }
            }, [signal]);
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
            const jobs = React.useSyncExternalStore((listener) => ctx.sessions.list.subscribe(listener), () => {
                const state = ctx.sessions.list.getSnapshot();
                const bySession = state === undefined || state === null ? undefined : state.jobsBySession;
                const sessionId = props?.sessionId ?? props?.session?.sessionId;
                return bySession === undefined || bySession === null || sessionId === undefined ? null : (bySession[sessionId] ?? null);
            });
            const announced = React.useRef(new Set());
            React.useEffect(() => {
                if (!Array.isArray(jobs))
                    return;
                for (const job of jobs) {
                    if (announced.current.has(job.id))
                        continue;
                    if (job.status !== 'completed' && job.status !== 'failed' && job.status !== 'killed')
                        continue;
                    announced.current.add(job.id);
                    playChime();
                    const line = job.status === 'completed'
                        ? '主人，后台任务完成啦！'
                        : job.status === 'failed'
                            ? '主人，后台任务失败了呢，回来看一看吧。'
                            : '主人，后台任务被停止了。';
                    void speakText(line);
                }
            }, [jobs]);
            return null;
        }
        /**
         * Approval watchdog: while an approval question is pending, chime and
         * speak; after APPROVAL_TIMEOUT_MS without an answer, stop the turn.
         */
        function ApprovalNotifier(props) {
            const sessionId = props?.sessionId ?? props?.session?.sessionId;
            const pendingKey = React.useSyncExternalStore((listener) => ctx.uiSession.pendingInteractions.subscribe(listener), () => {
                const map = ctx.uiSession.pendingInteractions.getSnapshot();
                if (map === undefined || map === null || sessionId === undefined)
                    return null;
                const entry = map.get(sessionId);
                return entry !== undefined && entry !== null && entry.kind === 'approval' ? String(entry.key) : null;
            });
            const pending = pendingKey !== null;
            const timers = React.useRef({ reminded: new Set() });
            React.useEffect(() => () => {
                if (timers.current.remind !== undefined)
                    window.clearInterval(timers.current.remind);
                if (timers.current.stop !== undefined)
                    window.clearTimeout(timers.current.stop);
            }, []);
            React.useEffect(() => {
                if (!pending) {
                    timers.current.reminded.clear();
                    if (timers.current.remind !== undefined) {
                        window.clearInterval(timers.current.remind);
                        timers.current.remind = undefined;
                    }
                    if (timers.current.stop !== undefined) {
                        window.clearTimeout(timers.current.stop);
                        timers.current.stop = undefined;
                    }
                    return;
                }
                const fresh = String(pendingKey).split(',').filter((key) => !timers.current.reminded.has(key));
                if (fresh.length > 0) {
                    for (const key of fresh)
                        timers.current.reminded.add(key);
                    playChime();
                    speakNanami();
                }
                if (timers.current.remind === undefined) {
                    timers.current.remind = window.setInterval(playChime, APPROVAL_REMIND_MS);
                }
                if (timers.current.stop === undefined) {
                    timers.current.stop = window.setTimeout(() => {
                        timers.current.stop = undefined;
                        void stopTurn(sessionId);
                    }, APPROVAL_TIMEOUT_MS);
                }
            }, [pending, pendingKey]);
            if (!pending)
                return null;
            return React.createElement('div', { className: styles.notifyCharm }, React.createElement('span', null, '🔔 有授权请求等主人确认 · 超时自动停止'));
        }
        /** Stop the in-flight turn (the composer stop-button path); reject leftovers on failure. */
        async function stopTurn(sessionId) {
            try {
                const binding = ctx.sessions.binding(sessionId);
                if (binding === undefined)
                    return;
                const result = await binding.session.cancel();
                if (result !== undefined && result.ok !== true)
                    throw new Error('cancel returned not-ok');
            }
            catch {
                try {
                    const binding = ctx.sessions.binding(sessionId);
                    const snapshot = binding === undefined ? undefined : binding.getSnapshot();
                    const waits = snapshot === undefined ? [] : snapshot.pending ?? [];
                    for (const wait of waits) {
                        if (wait.kind !== 'approval')
                            continue;
                        try {
                            await wait.respond({ ok: true, value: { sessionId: wait.sessionId, approvalId: wait.payload.approvalId, outcome: 'rejected' } });
                        }
                        catch { /* already settled */ }
                    }
                }
                catch { /* best effort */ }
            }
        }
        const disposeNotify = ctx.slots.register({ name: 'conversation.composer.dock', id: 'assistant-approval-notify', order: 60 }, ApprovalNotifier);
        const disposeQuestion = ctx.slots.register({ name: 'conversation.composer.dock', id: 'assistant-question-notify', order: 61 }, QuestionNotifier);
        const disposeJob = ctx.slots.register({ name: 'conversation.composer.dock', id: 'assistant-job-notify', order: 62 }, JobNotifier);
        const disposeAnswer = ctx.slots.register({ name: 'conversation.composer.dock', id: 'assistant-answer-done-notify', order: 63 }, AnswerDoneNotifier);
        return () => {
            disposeCharm();
            disposeNotify();
            disposeQuestion();
            disposeJob();
            disposeAnswer();
        };
    });
    ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({ name: 'conversation.chat.assistant-actions', id: 'read-aloud', order: 5 }, ReadAloudAction));
    ctx.slots.inject('conversation.chat.user-actions', () => ctx.slots.register({ name: 'conversation.chat.user-actions', id: 'read-aloud', order: 5 }, UserReadAloudAction));
    ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'voice', order: 20, label: '语音朗读' }, VoiceSettings));
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: 'sakura-petals', order: -100 }, () => React.createElement('div', { className: styles.petalLayer, 'aria-hidden': true }, Array.from({ length: 8 }, (_, index) => React.createElement('span', {
        key: index,
        className: styles.petal,
        style: {
            left: ((index * 13 + 3) % 94) + '%',
            animationDelay: (-index * 2.3) + 's',
            animationDuration: (11 + (index % 5) * 2) + 's',
        },
    })))));
}
//# sourceMappingURL=index.js.map