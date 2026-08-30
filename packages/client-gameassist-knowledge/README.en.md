# Game-assistant knowledge Client

[中文](README.md) | English

`@w4xxx/dsh-client-gameassist-knowledge` is the Web Client plugin for Xia's game-assistant knowledge base. It contributes a 📚 button, tree panel, and two-zone drag-and-drop citation UI to the conversation input area, inserting path-only or full-body citations into the current draft.

> The `@deepseek-ai/*` package names in this repository are development identifiers. They do not mean these packages have been published to a public npm registry. Public publication should use a scope owned by the maintainer and update configuration and dependency references accordingly.

## Client and Host

This package owns only the browser UI. The companion Host package [`@w4xxx/dsh-gameassist-knowledge`](../../companion/gameassist-knowledge/README.en.md) scans and writes Markdown, registers model tools and a prompt section, and serves `/gameassist/knowledge/tree` and `/gameassist/knowledge/node`. The Client has a hard dependency on those same-origin routes, cannot load a tree or full body without the Host, and has no local fallback.

The package's Node-face `apply()` is empty and only lets the Loader mount the package; the browser face is discovered through `package.json` `dsh.client` metadata and the `./client` export. `./invariant` registers package ownership but installs no runtime relation check because Cordis slot lifetimes own the UI entries.

## Features

- Contributes a 📚 toggle to `conversation.input.left` and a knowledge panel up to 300px high to `conversation.input.dock`.
- Shows multiple libraries as tabs, expandable directories, and Host-provided node titles.
- Provides path-only and full-content node buttons; HTML5 dragging opens a full-screen two-zone drop overlay.
- Path-only format is `〔kb-ref〕library/relative-path`; full-content format adds a `<kb-content>...</kb-content>` block after that line.
- Appends citations to the current draft, writing directly into an empty draft and adding a newline to a non-empty draft. Notices remain for 1.8 seconds.
- Hides both button and panel on the blank-session hero so they do not overlap the workspace picker.
- Uses Web Client theme alias tokens; React, Cordis, and slot infrastructure come from the dynamic Client runtime.

## Requirements

- The Harness Web Client, React 18, and the Cordis slot registry.
- The `@deepseek-ai/dsh-client-ui-theme`, `@deepseek-ai/dsh-client-ui-conversation`, and `@deepseek-ai/dsh-client-ui-layout` Client dependencies listed by `dsh.client.inject` in the manifest.
- Companion Host routes mounted on the same origin.
- Browser support for `fetch`, HTML5 drag-and-drop, `window` events, and timers.

## Loader / Profile patch

First make the local Host and Client workspace packages resolvable by the Web profile, then merge these entries into `$DSH_HOME/profiles/web/cordis.patch.yml`. Do not overwrite unrelated existing patches. The Host entry must configure the actual knowledge root.

```yaml
- insert:
    - id: gameassist-knowledge
      name: '@w4xxx/dsh-gameassist-knowledge'
      config:
        kbRoot: 'E:/knowledge-bases'

    - id: client-gameassist-knowledge
      name: '@w4xxx/dsh-client-gameassist-knowledge'
```

The Client has no runtime configuration fields. `dsh.client.platform` is fixed to `web`, and browser injection dependencies are declared by the package manifest. Use `dsh --profile web --dump-config` to inspect the Loader tree. Source integration also requires a `tsconfig.client.json` reference and a dependency from the carrying bundle; do not launch this package as an independent application.

## Slots and citation formats

| Slot | id | order | Content |
|---|---|---:|---|
| `conversation.input.left` | `gameassist-knowledge` | 20 | 📚 toggle button |
| `conversation.input.dock` | `gameassist-knowledge-panel` | 10 | Tree panel and drag overlay |

The plugin declares only `inject = ['slots']` and uses `ctx.slots.inject()` to wait for slot declaration before registering. Fiber disposal removes both entries.

```text
〔kb-ref〕library/path/node.md
```

```text
〔kb-ref〕library/path/node.md
<kb-content>
# Node title
...
</kb-content>
```

A path-only citation relies on the model later using the Host's `kb_read`; a full-content citation puts the Host-returned body directly into the user draft.

## Routes and cache behavior

- `GET /gameassist/knowledge/tree` is requested when the panel opens and when refresh is clicked, with `cache: 'no-store'`. A successful response updates module-level `treeCache`.
- `GET /gameassist/knowledge/node?path=...` is requested for a full-content citation, encoding the combined path with `encodeURIComponent` and using `cache: 'no-store'`.
- A failed tree request returns the most recent module-level cache; without one, current UI data remains. A failed node request has no cache fallback and shows a failure notice.
- Panel-open state and tree cache are module-level and are not isolated per session. The mounted panel's active library, expanded rows, drag state, and notice state are local React state.

## Data and security

The Client does not access the filesystem directly and does not persist libraries. It trusts Host JSON and inserts node bodies into the draft as plain text; React text rendering does not interpret titles or bodies as HTML. A full-content citation sends the complete node body to the current conversation, so users should inspect the draft before sending, and Host deployments must restrict sensitive libraries and route access.

Routes are relative URLs and therefore target the current GUI origin. The Client adds no authentication, CSRF protection, content-size check, schema validation, or permission filter; those responsibilities belong to the Host, Web Server, and deployment boundary. The Host's path protection is lexical, so symbolic links or Windows junctions can escape `kbRoot`; see the Host README security section.

## Development, build, and test

Run from the repository root:

```sh
pnpm --filter @w4xxx/dsh-client-gameassist-knowledge bundle
pnpm --filter @w4xxx/dsh-client-gameassist-knowledge watch
pnpm exec vitest run packages/client/gameassist-knowledge/tests/apply.client.spec.ts
pnpm exec tsc -b packages/client/gameassist-knowledge/tsconfig.json
```

`bundle` uses the shared `clientBundle` preset to produce `lib/index.js`, `lib/invariant.js`, and the dynamic browser artifact `lib/client.js`. `watch` only rebuilds this package; live GUI updates also require the Web development rebuild chain from the same checkout. Tests verify `inject`, both slot registrations, and disposal cleanup; they do not cover fetch, rendering, clicks, drag-and-drop, or multi-session behavior.

## Model Experience

### Knowledge citations in user messages

#### What the model sees

The Client itself registers no system prompt or model tool. It affects model input indirectly: path-only mode adds `〔kb-ref〕library/path.md` to the user draft, while full-content mode also adds a `<kb-content>` block and the complete node body. The interpretation convention and `kb_read` capability come from the companion Host.

#### Token effect

Direct token cost is zero when the panel is closed or no citation is inserted. Path-only mode adds one short reference line; full-content mode adds the path, tags, and complete body, with cost growing with node length. Content reaches the conversation only after the user sends the modified draft.

#### KV Cache effect

A sent citation appends new user-message content and does not modify previously recorded messages. It normally preserves the earlier reusable prefix while increasing later request length; editing an unsent draft has no model or KV-cache effect. Provider cache availability and eviction remain outside this package.

## Known Limitations and Deferred Work

- **Host-route dependency** — without `/gameassist/knowledge/tree` and `/gameassist/knowledge/node`, the tree and full-content mode are unavailable; there is no offline backend or standalone error page.
- **Module-level state spans sessions** — the panel toggle and tree cache are shared by the browser module rather than isolated per session.
- **Narrow test coverage** — current tests cover only slot lifecycle, not network failure, draft insertion, accessibility, drag-and-drop, or real Web composition.
- **No Client configuration or runtime validation** — routes are fixed, responses receive only minimal field checks, and Host/Client version mismatch can appear as an empty tree or read failure.
- **Inherited Host filesystem risk** — the Client can request Host-exposed nodes; the Host applies only lexical path protection, so deployments must address symlink/junction escape.
- **Public package identity is undecided** — `@deepseek-ai` is only a repository development identifier; public registry publication must use a maintainer-owned scope and update Host/Client, patch, and manifest references.
