# @w4xxx/dsh-client-game-assistant

[中文](README.md) | English

## Overview

The **Web UI layer** of the “Xia” game-dev assistant: a permanent sakura theme (token override), a time-aware composer charm, a pointer-transparent petal overlay, plus companion notifications and TTS — approval-request reminders, background-job completion reminders, answer-done reminders, message read-aloud buttons, and voice settings (per-character voice / default voice / custom TTS endpoint).

> This package is pure UI/interaction (its Host `apply` is empty) and provides **no agent backend**; `/gameassist/voice-map` data comes from the companion `@w4xxx/dsh-gameassist-roster`.

## Install

This package is **not published to npm yet**; this repository distributes source under the project's own `@w4xxx` scope. Mount as a Web bundle:

```yaml
- insert:
    - id: ui-game-assistant
      name: '@w4xxx/dsh-client-game-assistant'
```

Build: `pnpm --filter @w4xxx/dsh-client-game-assistant run bundle` (or `pnpm run build:lib:client` from the repo root); hard-refresh the browser (Ctrl+F5) after changes.

## Configuration

No mount-time config; preferences live in browser `localStorage`:

| Key | Contents |
|---|---|
| `dsh.gameassist.voice.v1` | Default voice preference (TTS endpoint/voice/rate/pitch) |
| `dsh.gameassist.role-voice.v1` | Per-day character-voice override (auto-rolls back next day) |

## Features

- **Sakura theme**: overrides `:root` theme tokens (`game-assistant-permanent`), permanent.
- **Composer charm**: time-aware widget in the input bar.
- **Petal layer**: `shell.overlay`, pointer-transparent decoration.
- **Approval reminders**: chime while an approval is pending, repeats every **20 s**; auto-cancels the turn after **120 s** without an answer.
- **Job-done reminders**: notify once per background job reaching a terminal state (completed/failed/killed).
- **Answer-done reminders**: fire when `running` goes true→false and the turn count grows (guards against historical replay).
- **Read-aloud**: speaker buttons on assistant/user messages via the speakText pipeline: custom endpoint → today's character voice → default voice.
- **Voice settings**: two sections in `settings.section` — character voice (today only) and default voice; supports a custom open-source TTS endpoint (e.g. `http://127.0.0.1:9880/tts`, POST `{text}` returns audio).

## Data & security

- Voice preferences stay in browser localStorage only (per machine/browser); nothing server-side.
- TTS requests go to the endpoint you configure (same-origin or CORS-allowed); the text is sent to that endpoint.
- Reminders/roster copy depends on roster's `/gameassist/voice-map`; without the roster plugin these features degrade.

## Development

```bash
pnpm exec vitest run packages/client/game-assistant/tests/apply.client.spec.ts
```

(jsdom environment; asserts inject `theme/slots/sessions` and registration behavior.)

## Known limitations

- TTS depends on the host browser and CORS; the custom endpoint's protocol must match.
- The “today's character” voice override is localStorage-scoped and does not sync across devices.
- The 120 s approval auto-cancel is **per-turn** semantics, not a global setting.

## License

MIT (final terms per the standalone repo's LICENSE/NOTICE).
