# dsh-xia-plugins

[中文](README.md) | English

A set of **original DeepSeek Harness (DSH) plugins** built around the "Xia, game-dev assistant" persona: a sakura skin with companion notifications, a tree-shaped knowledge base, a daily character roster, persistent memory, and a global proxy fix.

## Why use it: an anime companion by your side while you make games

The worst part of solo game dev isn't the bugs — it's the **loneliness**. That's what this suite is really about: turning your working session into an adventure with company.

- 🎀 **A new anime heroine every day**: tsundere, genki, kuudere, soft… every day a random anime-style character joins your session with a full persona (personality, catchphrases, speech style, dev specialty) to code with you, break down requirements, and talk world-building. Want someone else? One command.
- 📝 **She remembers you**: your projects, tasks, preferences, and past pitfalls live in persistent memory — no more "who are you again?".
- 📚 **A home for your design docs**: the tree-shaped knowledge base organizes world-building, numbers, story, and character settings into a browsable tree; drag a node into the chat and the agent reads it on demand.
- 🌸 **A workspace with atmosphere**: sakura theme, message read-aloud, approval/job/answer reminders — like having a partner at the desk next to you, nudging you when needed.
- 🌐 **Network pain fixed too**: global-proxy keeps subscription models and overseas services reachable.

**Cards are open**: the repo ships only one fictional original example card; anyone can write their own cards against the roster schema (personality, catchphrases, voice hints all supported) and build their own squad — who keeps you company is up to you.

**Who it's for**: indie game developers working solo, long-form workflow users who want a lighter companion feel, and anime fans. Install, pick the "Xia" preset, and someone is there to work with you from day one.

## Plugins

| Package | Layer | One-liner |
|---|---|---|
| [`@w4xxx/dsh-client-game-assistant`](packages/client-game-assistant/README.en.md) | Web client | Sakura theme, approval/job/answer reminders, read-aloud, voice settings |
| [`@w4xxx/dsh-client-gameassist-knowledge`](packages/client-gameassist-knowledge/README.en.md) | Web client | Knowledge-base 📚 panel with drag-to-cite |
| [`@w4xxx/dsh-gameassist-knowledge`](packages/gameassist-knowledge/README.en.md) | Host | Tree-shaped Markdown knowledge base (data plane + tools + HTTP) |
| [`@w4xxx/dsh-gameassist-memory`](packages/gameassist-memory/README.en.md) | Host (preset) | Single-file persistent memory (interests/tasks/works…) |
| [`@w4xxx/dsh-gameassist-roster`](packages/gameassist-roster/README.en.md) | Host (preset) | Daily character roster + voice-map |
| [`dsh-global-proxy`](packages/global-proxy/README.en.md) | Host (process) | Global undici proxy (fixes Node ignoring the system proxy) |

Every package ships a Chinese `README.md` and an English `README.en.md` with config tables, tool/route/slot inventories, data & security notes, build/test instructions, and known limitations.

## Architecture: DSH checkout overlay

DSH ecosystem dependencies (`@deepseek-ai/cordis`, `@deepseek-ai/schemastery`, `@deepseek-ai/dsh-client-ui-renderer`, …) are **not on npm**, so this repository cannot `pnpm install` them standalone. It therefore works as an **overlay** on a DSH source tree:

- This repo contains only the six plugins' **source, docs, tests, and build configs**;
- Builds and tests run **inside a DSH checkout** (overlay the packages, then run DSH's `pnpm install` + `build:lib:host/client` + vitest);
- As a bonus, every CI run verifies **real compatibility** with official DSH.

## Integration

### Option 1: overlay into a DSH checkout (recommended, for build/test)

```bash
# Sync packages/* into your DSH checkout (Windows)
node scripts/integrate.mjs --checkout D:/mycode/deepseek-harness-master
# Then follow the usual DSH flow: pnpm install && pnpm run build:lib:host && pnpm run build:lib:client
```

`scripts/integrate.mjs` copies the six packages into the checkout's `packages/companion|client` directories per a mapping table (node_modules skipped by default).

### Option 2: profile patch

Insert the plugins you want into `~/.dsh/profiles/web/cordis.patch.yml` (host-layer and web-layer entries differ; see each package README).

### Option 3: runtime injection (dev)

With `dsh-super-injector` installed, use `dev_inject_plugin` with any package directory (containing `package.json` and `lib/`).

## Layout

```
dsh-xia-plugins/
├─ packages/
│  ├─ gameassist-knowledge/        # Host: knowledge-base data plane
│  ├─ gameassist-memory/           # Host: persistent memory
│  ├─ gameassist-roster/           # Host: daily roster (with a fictional example card)
│  ├─ client-game-assistant/       # Web: Xia skin & notifications
│  ├─ client-gameassist-knowledge/ # Web: knowledge-base panel
│  └─ global-proxy/                # Host: global undici proxy
├─ scripts/integrate.mjs           # overlay sync script
├─ LICENSE / NOTICE.md
└─ third-party-licenses/           # Full MIT texts: DeepSeek Harness / Cordis / Schemastery / undici
```

## Release status

- Source distribution only: none of the six packages is published to npm yet;
- Package names use the `@w4xxx` scope (the `@deepseek-ai` scope is not publishable by this project);
- Cards ship **only fictional original examples** (`packages/gameassist-roster/cards/xia.example.json`); no real-work characters are distributed;
- Visuals (petals, chimes) are pure CSS / Web Audio synthesis — no fonts, images, or recordings are bundled.

## License

MIT + NOTICE. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md); third-party license texts live in [third-party-licenses/](third-party-licenses/).
