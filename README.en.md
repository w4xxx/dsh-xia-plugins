# dsh-xia-plugins

[中文](README.md) | English

A set of **original DeepSeek Harness (DSH) plugins** built around the "Xia, game-dev assistant" persona: a sakura skin with companion notifications, a tree-shaped knowledge base, a daily character roster, persistent memory, and a global proxy fix.

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
