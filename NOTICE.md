# NOTICE

## Original portions

Copyright (c) 2026 w4xxx

The original business logic, plugin behavior, documentation, and tests in this
repository are provided under the MIT License (see `LICENSE`), unless a file
states otherwise.

## Portions adapted from DeepSeek Harness

Copyright (c) 2026 DeepSeek, licensed under the MIT License.

The following scaffolding and integration surface was adapted from the
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) project:

- Cordis plugin shape: `name` / `inject` / `apply` / `ctx.effect` lifecycle;
- Tool, system-prompt, web-server, theme, and slot registration structures;
- Client-plugin conventions: empty host `apply`, `invariant` companion,
  `clientBundle(...)`, package manifests, and test skeletons.

See `third-party-licenses/DeepSeek-Harness-MIT.txt` for the full MIT text.

## Third-party runtime dependencies

When distributing the built packages, the following upstream projects are
included or referenced and their licenses must be preserved:

| Component | Project | License | Notice file |
|---|---|---|---|
| `@deepseek-ai/cordis` | Cordis (fork), © 2021-present Shigma | MIT | `third-party-licenses/Cordis-MIT.txt` |
| `@deepseek-ai/schemastery` | Schemastery (fork), © 2021-present Shigma | MIT | `third-party-licenses/Schemastery-MIT.txt` |
| `undici` (global-proxy) | undici, © Matteo Collina and undici contributors | MIT | `third-party-licenses/Undici-MIT.txt` |

## Independent project statement

This project is an independent community project. It is not affiliated with,
endorsed by, or sponsored by DeepSeek, any anime/manga/game rightsholder,
voice actor, Microsoft, OpenAI, Zhipu, or any external service mentioned in the
documentation. Trademarks and character names referenced in examples belong to
their respective owners and are used for identification purposes only.

## Character cards

The `packages/gameassist-roster/cards/` directory ships **only** fictional
example cards created by the project owner. Real-world character cards are
never distributed with this repository; users are responsible for the content
and licensing of any cards they create or install themselves.
