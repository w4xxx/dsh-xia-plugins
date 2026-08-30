# Game-assistant knowledge Host

[中文](README.md) | English

`@w4xxx/dsh-gameassist-knowledge` is the Host plugin for Xia's game-assistant knowledge base. It interprets a filesystem directory as tree-shaped Markdown libraries, registers a compact system-prompt index and the `kb_list`, `kb_read`, and `kb_write` model tools, and provides HTTP routes to the companion Client panel.

> The `@deepseek-ai/*` package names in this repository are development identifiers. They do not mean these packages have been published to a public npm registry. Public publication should use a scope owned by the maintainer and update configuration and dependency references accordingly.

## Host and Client

This package owns the data, filesystem access, model tools, prompt, and Web routes. The companion browser package [`@w4xxx/dsh-client-gameassist-knowledge`](../../client/gameassist-knowledge/README.en.md) only owns the UI and depends on this package's `/gameassist/knowledge/tree` and `/gameassist/knowledge/node` routes; the Client has no offline or independent data backend. Both packages must be mounted in the same Web profile for the Client to work completely.

## Features

- Each non-hidden first-level directory under `kbRoot` is a library; directories are branches, `.md` files are nodes, and hidden entries and non-Markdown files are excluded.
- A node title comes from its first `# heading`, with UTF-8 BOM support, and falls back to the file name. A library title comes from its `README.md` heading and falls back to the directory name when the README is unavailable.
- Scan results put directories first and sort peers by name with the Chinese locale; empty directories do not appear.
- The scan ceiling is 512 KiB per node; larger files do not enter the tree. The read tool and node route read a requested file, while the write tool rejects content over that ceiling.
- Cordis effects own all registrations; unloading the fiber disposes the prompt section, routes, and tools.

## Requirements

- A Harness Host supporting ESM and the Node.js `es2024` target.
- Cordis, Schemastery, and a plugin tree providing the `systemPrompt`, `tools`, and `webServer` services.
- An absolute `kbRoot` path readable and writable by the Host process.
- The companion Client package and a Web profile when using the browser panel.

## Loader / Profile patch

First make this local workspace package resolvable by the target profile, then merge the following entry into `$DSH_HOME/profiles/<profile>/cordis.patch.yml`. Do not overwrite unrelated existing patches. A profile patch does not resolve relative modules from this repository, so the example uses the package name.

```yaml
- insert:
    - id: gameassist-knowledge
      name: '@w4xxx/dsh-gameassist-knowledge'
      config:
        kbRoot: 'E:/knowledge-bases'
```

For the Web GUI, also add the companion Client entry:

```yaml
- insert:
    - id: client-gameassist-knowledge
      name: '@w4xxx/dsh-client-gameassist-knowledge'
```

Use `dsh --profile web --dump-config` to inspect the final plugin tree. In source integration, `tsconfig.host.json` references this package. It is not an independent application entry point and must be loaded through a `dsh` profile.

## Configuration

| Field | Type | Required | Behavior |
|---|---|---:|---|
| `kbRoot` | `string` | Yes | Absolute knowledge-root path; each first-level child directory is a library. The current schema validates only that it is a string, not that it is absolute, present, or writable. |

A missing or unreadable root produces an empty scan rather than a load failure. Writing a node recursively creates its parent directories.

## Tools, routes, and prompt

### Model tools

- `kb_list()` rescans and returns the complete tree, titles, and paths for every library without node bodies.
- `kb_read({ path })` reads one complete node; `path` has the form `library/directory/node`, and `.md` is optional. A successful result starts with `〔kb-node〕library/relative-path`.
- `kb_write({ path, content, title? })` creates or overwrites a node and recursively creates directories. If the body has no Markdown level-one heading and a non-empty `title` is supplied, it prepends `# title`.

User paths accept `/` or `\`, reject empty segments, `.` and `..`, and gain a `.md` suffix when omitted. Library names accept word characters, CJK unified ideographs, hyphens, dots, and spaces.

### HTTP routes

- `GET /gameassist/knowledge/tree` returns `{ libraries }` JSON with `cache-control: no-cache`. An initially empty cache is refreshed before responding; with existing data it responds with the current snapshot and then refreshes asynchronously.
- `GET /gameassist/knowledge/node?path=<library/relative-path>` returns the node title and body; an invalid path returns 400, a missing or unreadable node returns 404, and success includes `cache-control: no-cache`.

The routes contain no package-level authentication or authorization and rely on the deployment boundary of the Web Server that carries them.

### System prompt

The plugin registers the `gameassist:knowledge` section at order `12`. It contains fixed Chinese usage instructions plus a compact index of library names, library titles, total node counts, and each library's top-level entries. Bodies enter context only through a tool call or a full-content Client citation.

## Data and security

Libraries are ordinary UTF-8 Markdown files below `kbRoot`; there is no database, versioning, locking, atomic write, identity isolation, or concurrent-conflict handling. `kb_write` overwrites the target directly. Deployments must provide backups, filesystem permissions, a trusted-user boundary, and a concurrent-write policy. The HTTP node route returns bodies to callers that can reach its Web Server, and the model tools can read or write nodes accessible to the Host process.

Path protection is lexical: the implementation rejects `.`, `..`, and resolved paths lexically outside the library, but it does not resolve and validate real paths. A symbolic link or Windows junction under `kbRoot` can let reads, scans, or writes escape the intended root. Use only a trusted tree without such reparse points, or apply filesystem isolation above this plugin.

Host diagnostics are **off by default**; set the `DSH_KB_DIAG_FILE` environment variable to an absolute path to enable them (write failures are silently ignored and never break the plugin).

## Development, build, and test

Run from the repository root:

```sh
pnpm --filter @w4xxx/dsh-gameassist-knowledge bundle
pnpm exec vitest run packages/companion/gameassist-knowledge/tests/knowledge.spec.ts
pnpm exec tsc -b packages/companion/gameassist-knowledge/tsconfig.json
```

`bundle` uses `tsdown.config.ts` to bundle `lib/types/index.js` into the Node ESM artifact `lib/index.js`. Tests cover BOM/title handling, path parsing and lexical traversal protection, scanning, counting, and text rendering; they do not start a real Loader, Web Server, or companion Client.

## Model Experience

### System-prompt knowledge index

#### What the model sees

The model sees fixed Chinese knowledge-base instructions and a compact library-level index generated from the current scan. The index lists only library names, titles, total node counts, and top-level directories or file names, not node bodies. The section is registered after scanning; later refreshes update the in-memory tree but do not re-register the existing prompt section, so the prompt index can retain the initial scan for one plugin lifetime.

#### Token effect

This is a fixed instruction plus a data-dependent index present whenever requests are assembled. Cost grows with library count and top-level entry count, not with deep directories or body lengths. Bodies enter later messages on demand only through `kb_read` results or Client `<kb-content>` citations.

#### KV Cache effect

While the plugin is stable, this section has a fixed system-prompt order and can form a reusable prefix. Reloading the plugin, changing the index present at the initial scan, or changing an earlier prompt section changes the prefix; ordinary body edits do not rewrite the registered section during the same plugin lifetime. Provider cache availability and eviction remain outside this package.

### Tool schemas and results

#### What the model sees

The model sees three Chinese tool schemas: parameterless `kb_list`, `kb_read` with required string `path`, and `kb_write` with required `path` and `content` plus optional `title`. Executions add a complete tree, a node body, or a write status as tool results.

#### Token effect

The tool schemas add fixed cost to each request where they are available. Results are conditional: `kb_list` grows with the complete tree, `kb_read` grows with the node body, and `kb_write` returns a short status. Body text in tool arguments also contributes to model output and later history.

#### KV Cache effect

Stable tool schemas preserve that part of a reusable request prefix; mounting, unmounting, or changing tool definitions changes it. Tool calls and results append to session history rather than replacing the earlier prefix, while increasing later request length. Provider cache availability and eviction remain outside this package.

## Known Limitations and Deferred Work

- **Diagnostics off by default** — logs are written only when `DSH_KB_DIAG_FILE` is set; the path is a deployment choice and should not point into a public directory.
- **Path protection does not resolve real paths** — lexical checks cannot stop symbolic-link or junction escape; deployments must use trusted directories or external isolation.
- **No built-in authentication or transactional writes** — routes rely on the Web Server access boundary, and writes directly overwrite without locks, atomic commit, versions, or conflict detection.
- **Prompt index can become stale** — tools and routes refresh the in-memory tree, but the registered system-prompt section is generated only after the initial asynchronous scan.
- **The size-limit units differ** — scanning applies the 512 KiB ceiling to filesystem bytes, while writing compares JavaScript string length and labels it as bytes.
- **Public package identity is undecided** — `@deepseek-ai` is only a repository development identifier; public registry publication must use a maintainer-owned scope and update every Host/Client reference.
