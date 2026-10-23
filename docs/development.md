---
title: "Development"
description: "Local development, test suites, and docs."
path: "development"
order: 140
section: "Project"
meta_title: "Development"
meta_description: "Local development, test suites, and docs."
---

# Development

## Requirements

- **Node.js 26.12.0** for development
- **pnpm 12.14.0** for workspace installs and scripts
- **tmux** for local browser and CLI tests
- **cloudflared** for optional public-tunnel tests
- **Daytona API key + git credentials** for the sandbox integration test (optional)
- **Playwright** for UI e2e tests

## Install

```bash
pnpm run setup
```

The published CLI continues to support Node.js 20+. Development uses the pinned
Node and pnpm versions in `.node-version`, `.nvmrc`, and `package.json`.

## Workspace

| Package             | Purpose                                                    |
| ------------------- | ---------------------------------------------------------- |
| `packages/cli`      | Published `termbridge` CLI and bundled browser application |
| `packages/shared`   | Private terminal protocol types                            |
| `packages/terminal` | Private tmux and in-memory terminal backends               |
| `packages/tunnel`   | Private Cloudflare tunnel adapter                          |
| `packages/ui`       | Private reusable React components and theme utilities      |
| `packages/tsconfig` | Shared TypeScript configuration                            |

External dependencies use the root pnpm catalog; internal dependencies use
`workspace:*`. Relative TypeScript imports include their source extension.

## Run the app

```bash
pnpm dev:beam
```

This builds the CLI, starts the local server on port `8787` (override with `TERMBRIDGE_DEV_PORT`) with the tmux session `codex` (override with `TERMBRIDGE_DEV_SESSION`), and launches the Vite dev UI, which proxies `/__tb` (including WebSockets) to that server. It prints a dev redeem URL to open in the browser. Set `TERMBRIDGE_SKIP_BUILD=1` to skip the CLI build.

### Multiple sessions

```bash
TERMBRIDGE_SESSIONS=2 pnpm dev:beam
```

Or use the shortcut:

```bash
pnpm dev:beam:multi
```

### Local cookie mode

`dev:beam` sets `TERMBRIDGE_INSECURE_COOKIE=1` unless you set it yourself, so session cookies work over plain HTTP. When running the CLI directly without HTTPS, set it explicitly:

```bash
TERMBRIDGE_INSECURE_COOKIE=1 node packages/cli/dist/bin.js --no-tunnel --public-url http://127.0.0.1:8080 --port 8080
```

## Tests

```bash
pnpm test
```

- `test:tooling` tests the shared documentation lint rules.
- `test:mocked` runs unit/integration tests with 100% coverage.
- `test:startup` exercises CLI startup and cleanup without a public tunnel.
- `test:package` installs the packed CLI in a temporary project and checks native
  tmux startup, authentication, and the bundled UI.
- `test:browser` runs real CLI + UI tests locally (tmux + Playwright), including
  terminal input and the proxied application preview. CI runs these without
  Cloudflare or sandbox credentials.
- `test:tunnel` explicitly runs those browser tests through Cloudflare.
- `test:cli` runs browser, startup, and configured Daytona integration tests.
- `test:local-package` validates sandbox archives from the source workspace and
  from an installed CLI without pnpm or lifecycle scripts.
- The Daytona sandbox test in `test:cli` reads its settings only from a `.env` file in a `termbridge-test-app` directory next to this repository (`../termbridge-test-app/.env`). It runs when that file sets `TERMBRIDGE_E2E_DAYTONA=1` and `TERMBRIDGE_DAYTONA_API_KEY`. Set `TERMBRIDGE_SANDBOX_REPO` there to a repository you can clone; the default test repository is private and also needs `TERMBRIDGE_SANDBOX_GIT_USERNAME` and `TERMBRIDGE_SANDBOX_GIT_TOKEN`.

## Quality checks

```bash
pnpm format
pnpm check
pnpm verify
```

`check` runs Oxfmt, strict type-aware Oxlint, workspace and documentation checks,
TypeScript, tests, and builds. `verify` adds CLI/browser integration tests and the
packed consumer smoke test. Stop development processes after use; the package
smoke test cleans its temporary install and isolated tmux server automatically.

## Docs

The docs are plain Markdown files in `docs/`, with frontmatter on every page and `meta.json` files for navigation order. They are published at [termbridge.inline0.dev](https://termbridge.inline0.dev). Validate them with:

```bash
node scripts/check-docs-content.mjs --root docs --expected-docs 16 --expected-nav 3
```

The Docs content workflow runs the same check on pull requests that touch `docs/`.
