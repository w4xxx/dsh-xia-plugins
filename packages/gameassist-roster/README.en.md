# gameassist-roster

[中文](README.md) | English

`gameassist-roster` provides a daily rotating character persona for the Xia game-development assistant. It reads character cards from an external directory, makes a stable local-calendar-day selection, contributes that persona to the system prompt, and exposes roster, temporary override, and voice-map interfaces.

> This package is **not published to npm yet**; this repository distributes source under the project's own `@w4xxx` scope. Use the package name from package.json when composing Loader/preset entries.

## Features and runtime behavior

- At plugin load, the package reads top-level `*.json` files from `cardsDir` in filename order. Each card is read once, malformed JSON files are skipped, and an unreadable directory or no valid cards produces the fallback Xia persona prompt.
- Without a temporary override, it hashes the host process's local `YYYY-MM-DD` calendar date to make a stable selection for the same date and card set.
- System-prompt section `gameassist:roster` at order `10` contains the date, rendered card, and the rule that the underlying identity remains Xia.
- `roster_pick` re-registers the prompt section. Plugin disposal removes the prompt section, tools, and HTTP route.
- The plugin requires the Cordis services `systemPrompt`, `tools`, and `webServer`.

## Configuration and integration

The only config field is `cardsDir: string`. An external absolute path is recommended. Character cards are excluded from the package file list, so the deployment must provide and back up this directory.

Loader/profile patch example:

```yaml
- insert:
    - id: gameassist-roster
      name: '@your-scope/gameassist-roster'
      config:
        cardsDir: 'D:/dsh-data/gameassist/cards'
```

The same row can be mounted by an agent preset's `agent.cordis.yml`:

```yaml
- id: gameassist-roster
  name: '@your-scope/gameassist-roster'
  config:
    cardsDir: 'D:/dsh-data/gameassist/cards'
```

The plugin provides no Cordis service, so it does not need an `isolate` realm. It does, however, register a fixed HTTP path and keep its temporary override in the plugin instance, so one process should not mount multiple instances that compete for that route. The composition must also provide all three required services in the row's visible context.

## Character-card format

Each file is one UTF-8 JSON object. `id` and `name` are required; all other fields are optional:

```json
{
  "id": "example-heroine",
  "name": "Example Character",
  "source": "Work title",
  "cv": "Voice actor",
  "role": "Game-development role",
  "appearance": "Appearance summary",
  "personality": ["Personality trait"],
  "speech": {
    "callsUser": "Master",
    "style": "Speech style",
    "catchphrases": ["Catchphrase"]
  },
  "devSkill": "Development specialty",
  "playbook": ["Role-play direction"],
  "taboo": ["Prohibited portrayal"],
  "voice": {
    "name": "System voice name",
    "voiceURI": "System voice URI",
    "lang": "en-US",
    "rate": 1,
    "pitch": 1
  }
}
```

The implementation uses a TypeScript assertion and does not runtime-validate JSON fields. A parseable card with the wrong structure can fail during use or produce incomplete output. Filenames determine load order, and ids should be unique within the directory.

## Tools and route

### `roster_list`

Takes no arguments. It returns every valid card's id, name, and source, marking the date algorithm's baseline choice with `← 今日`. This marker does not reflect a temporary `roster_pick` override.

### `roster_pick`

Arguments:

- `id?: string`: switch to a specified card; an unknown id returns the available ids.
- `random?: boolean`: whenever `id` is omitted, re-roll randomly and avoid the current card when possible. The implementation does not inspect the boolean value, so `random: false` also re-rolls.

The override is temporary, process-wide state in the plugin instance. It is not session-isolated or persisted, and every session sharing that instance sees the new prompt. It lasts until another pick or plugin unload/process restart; there is no separate operation that restores the day's default.

### `GET /gameassist/voice-map`

Returns:

```json
{
  "today": "example-heroine",
  "cardName": "Example Character",
  "voices": {
    "example-heroine": {
      "name": "System voice name",
      "voiceURI": "System voice URI",
      "lang": "en-US",
      "rate": 1,
      "pitch": 1
    }
  }
}
```

`today` and `cardName` reflect the current override and are both `null` when there is no card. `voices` contains only cards with a `voice` field. The UTF-8 JSON response carries `cache-control: no-cache`; the route itself performs no authentication.

## Prompt, model, and cache effects

The rendered card and fixed role-play rules enter the system prompt on every model request, and both tool schemas are model-visible. Prompt token cost grows with card content. A stable roster preserves the prefix; after `roster_pick` changes the prompt, later requests cannot reuse the old prefix from that section onward. The plugin has no timer: crossing local midnight does not re-register the prompt, so a long-lived process can continue showing the previous day's persona until an override or reload. Without an override, `roster_list` and `/gameassist/voice-map` do recompute from the request-time date.

## Data, persistence, and privacy

The plugin only reads `cardsDir`; it neither modifies cards nor persists the daily pick or temporary override. Card content is sent in model requests, and voice configuration is exposed through an unauthenticated HTTP route to clients that can reach the Web service. Do not put secrets, credentials, or data unsuitable for the model or browser in cards.

Character names, work titles, voice actors, dialogue, likeness descriptions, and voice resources may be subject to copyright, trademark, publicity, or other content/IP rights. The deployer is responsible for creating, distributing, and using cards and related resources. This package ships no character cards and grants no license to third-party content.

## Source, build, and tests

- [`src/index.ts`](src/index.ts): config, date selection, card rendering, prompt, tools, and route.
- [`tests/roster.spec.ts`](tests/roster.spec.ts): date key, stable selection, cross-day scattering, and card-rendering tests.
- [`tsconfig.json`](tsconfig.json) and [`tsdown.config.ts`](tsdown.config.ts): TypeScript emits `lib/types`, then tsdown produces Node ESM `lib/index.js`.

From the repository root:

```sh
pnpm exec vitest run packages/companion/gameassist-roster/tests/roster.spec.ts
pnpm --filter @w4xxx/dsh-gameassist-roster bundle
```

`bundle` expects `lib/types/index.js` to have been emitted first. Use the repository-level `pnpm run build` for a complete build.

## Known Limitations and Deferred Work

- Cards are loaded only when the plugin starts; file additions, removals, and edits do not hot-reload.
- Midnight does not refresh the registered prompt, and a temporary override is not cleared at midnight.
- The temporary override is process-wide rather than per-session, with no persistence or explicit clear operation.
- There is no runtime field validation, duplicate-id check, or content-length limit; only JSON parse failures are skipped.
- The fixed `/gameassist/voice-map` route and process-wide override make multiple mounted instances unsafe.
- Selection depends on load order and the card set; renaming files, adding/removing cards, or duplicate ids can change the outcome.
- Current tests cover pure logic, not a real Loader composition, route lifecycle, or multi-session override behavior.
