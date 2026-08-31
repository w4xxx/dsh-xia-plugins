# gameassist-memory

[中文](README.md) | English

`gameassist-memory` provides a small persistent memory bank for the Xia game-development assistant. It stores interests, preferences, notes, tasks, and past works in one JSON file, contributes a summary to the system prompt, and exposes read and update tools.

> This package is **not published to npm yet**; this repository distributes source under the project's own `@w4xxx` scope. Use the package name from package.json when composing Loader/preset entries.

## Features and runtime behavior

- At plugin load, the package reads `memoryFile` once. A missing, unreadable, or unparsable file starts with an empty in-memory bank.
- System-prompt section `gameassist:memory` at order `11` renders the current summary and tells the assistant to record new information and task-status changes.
- `memory_update` changes memory, writes the JSON file, and re-registers the prompt section, so the next model request sees the new content.
- Plugin disposal removes the prompt section and both tools.
- The plugin requires the Cordis services `systemPrompt` and `tools`.

## Configuration and integration

Config fields:

- `memoryFile: string` (required): the absolute path to one JSON memory file. Saving recursively creates its parent directory.
- `maxNoteChars: number` (optional): max characters kept per task `notes` in the injected system-prompt summary. Default `200`; set `0` to hide notes entirely. Full content stays available through `memory_read`.
- `maxSummaryChars: number` (optional): max characters kept per work `summary` in the injected system-prompt summary. Default `120`; set `0` to hide summaries entirely. Full content stays available through `memory_read`.

> Truncation only affects the injected prompt summary. The on-disk file always keeps the full content, and `memory_read` always returns it in full — so a large memory bank no longer inflates every request's token cost, and details are one tool call away.

Loader/profile patch example:

```yaml
- insert:
    - id: gameassist-memory
      name: '@your-scope/gameassist-memory'
      config:
        memoryFile: 'D:/dsh-data/gameassist/memory.json'
        maxNoteChars: 200
        maxSummaryChars: 120
```

Agent preset `agent.cordis.yml` example:

```yaml
- id: gameassist-memory
  name: '@your-scope/gameassist-memory'
  config:
    memoryFile: 'D:/dsh-data/gameassist/memory.json'
    maxNoteChars: 200
    maxSummaryChars: 120
```

The plugin provides no Cordis service, so it does not need an `isolate` realm. Multiple presets or Loader rows pointing to one file still hold independent in-memory copies with no cross-instance coordination. Mount one writer only, or configure a separate file per instance.

## JSON data format

The file is one UTF-8 JSON object. Successful saves use two-space indentation and one trailing newline:

```json
{
  "interests": ["game development", "anime"],
  "preferences": ["communicate in English"],
  "profileNotes": "Call the user Master.",
  "tasks": [
    {
      "id": "forum-game",
      "title": "Advance the forum game",
      "status": "doing",
      "notes": "Polish the first battle",
      "updatedAt": "2026-08-30T00:00:00.000Z"
    }
  ],
  "works": [
    {
      "id": "my-forum-game",
      "name": "My Forum Game",
      "kind": "game",
      "summary": "A forum-themed game",
      "tech": ["Godot 4.7", "GDScript"],
      "path": "D:/projects/my-forum-game",
      "status": "in development",
      "updatedAt": "2026-08-30T00:00:00.000Z"
    }
  ],
  "updatedAt": "2026-08-30T00:00:00.000Z"
}
```

The implementation only applies a TypeScript assertion to parsed JSON; it performs no runtime schema validation or migration. A parseable file with missing or incorrectly typed fields can fail during prompt rendering or update.

## Tools and update semantics

### `memory_read`

Takes no arguments and returns the current in-memory summary. It does not re-read the file.

### `memory_update`

Every field is optional, but the call must provide at least one value other than `undefined`:

- `interests`, `preferences`: split on English/Chinese commas, ideographic comma, semicolons, or newlines. **Providing a field replaces the whole list**; an empty string clears it rather than appending.
- `profileNotes`: replaces the whole note; an empty string clears it.
- `taskId`, `taskTitle`, `taskStatus`, `taskNotes`: update by `taskId`. If the id is not found, creation requires `taskTitle`; omission of an id generates a `t...` id, and a new task defaults to status `todo`.
- `removeTaskId`: remove a task by id.
- `workId`, `workName`, `workKind`, `workSummary`, `workTech`, `workPath`, `workStatus`: update by `workId`. If the id is not found, creation requires `workName`; omission of an id generates a `w...` id.
- `workTech`: like interests and preferences, providing it replaces that work's entire technology list; an empty string clears it.
- `removeWorkId`: remove a work by id.

Removal happens before upsert in the same call, so deleting an id while also supplying enough fields to create can recreate that id. Every effective update refreshes the document `updatedAt`; a task or work that is created or actually updated also receives its own timestamp. Status strings are not restricted to an enum.

## Prompt, model, and cache effects

The rendered summary and fixed recording instruction enter the system prompt on every model request, and both tool schemas are model-visible. Token cost grows linearly with interests, tasks, works, and note length; **the injected summary is truncated by default** (`maxNoteChars`/`maxSummaryChars`, 200/120 chars) so oversized entries do not enter the prompt — call `memory_read` for full content. Stable memory preserves the prefix. After `memory_update` changes the prompt, later requests cannot reuse the old prefix from that section onward. The tool result also returns the complete updated summary to the current conversation.

## Persistence, privacy, and security

All memory is stored in **one JSON file** at `memoryFile`. Saving directly overwrites the target with `writeFile`; it does not use a temporary file plus atomic replacement and has no file lock, transaction, concurrent-write merge, or cross-process synchronization. Process interruption, disk failure, or competing writers can leave a truncated file or lose updates. Back it up externally and ensure there is only one writer.

The file can contain personal preferences, project paths, tasks, works, and free-form notes. Its summary is sent to the selected model and can appear in tool results, session logs, or UI. Store it in an access-controlled location, avoid credentials and unnecessary sensitive data, and **do not commit a private memory file to version control**. Repositories and plugin packages should contain only sanitized examples.

## Source, build, and tests

- [`src/index.ts`](src/index.ts): config, data types, rendering, update semantics, file I/O, and tool registration.
- [`tests/memory.spec.ts`](tests/memory.spec.ts): list splitting, whole-list replacement, task upsert/removal, and work-rendering tests.
- [`tsconfig.json`](tsconfig.json) and [`tsdown.config.ts`](tsdown.config.ts): TypeScript emits `lib/types`, then tsdown produces Node ESM `lib/index.js`.

From the repository root:

```sh
pnpm exec vitest run packages/companion/gameassist-memory/tests/memory.spec.ts
pnpm --filter @w4xxx/dsh-gameassist-memory bundle
```

`bundle` expects `lib/types/index.js` to have been emitted first. Use the repository-level `pnpm run build` for a complete build.

## Known Limitations and Deferred Work

- The package supports one complete JSON document only, with no multi-user namespaces, query index, or history.
- The file is read only at plugin load; external edits do not hot-reload, and `memory_read` does not re-read disk.
- Writes are non-atomic and unlocked; concurrent tool calls, plugin instances, or processes can overwrite each other or corrupt the file.
- Loaded data has no schema validation, size limit, or migration; any read/parse error silently falls back to empty memory.
- Interests, preferences, and `workTech` use whole-list replacement, with no single-item append/remove operation.
- The prompt summary is truncated by default (`maxNoteChars`/`maxSummaryChars`) but still performs no redaction or access control; full content always stays on disk.
- Current tests cover pure update logic, not a real Loader composition, file-I/O failures, concurrent writes, or plugin lifecycle.
