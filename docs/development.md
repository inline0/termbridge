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

- **Bun** for workspace installs and scripts
- **Node.js 20+**
- **tmux** and **cloudflared** for end-to-end tests
- **Daytona API key + git credentials** for the sandbox integration test (optional)
- **Playwright** for UI e2e tests

## Install

```bash
bun install
```

## Run the app

```bash
bun run dev:beam
```

This builds the CLI, starts the local server on port `8787` (override with `TERMBRIDGE_DEV_PORT`) with the tmux session `codex` (override with `TERMBRIDGE_DEV_SESSION`), and launches the Vite dev UI, which proxies `/__tb` (including WebSockets) to that server. It prints a dev redeem URL to open in the browser. Set `TERMBRIDGE_SKIP_BUILD=1` to skip the CLI build.

### Multiple sessions

```bash
TERMBRIDGE_SESSIONS=2 bun run dev:beam
```

Or use the shortcut:

```bash
bun run dev:beam:multi
```

### Local cookie mode

`dev:beam` sets `TERMBRIDGE_INSECURE_COOKIE=1` unless you set it yourself, so session cookies work over plain HTTP. When running the CLI directly without HTTPS, set it explicitly:

```bash
TERMBRIDGE_INSECURE_COOKIE=1 node cli/dist/bin.js --no-tunnel --public-url http://127.0.0.1:8080 --port 8080
```

## Tests

```bash
bun run test
```

- `test:mocked` runs unit/integration tests with 100% coverage.
- `test:cli` runs real CLI + UI e2e tests (tmux + cloudflared + Playwright).
- The Daytona sandbox test in `test:cli` reads its settings only from a `.env` file in a `termbridge-test-app` directory next to this repository (`../termbridge-test-app/.env`). It runs when that file sets `TERMBRIDGE_E2E_DAYTONA=1` and `TERMBRIDGE_DAYTONA_API_KEY`. Set `TERMBRIDGE_SANDBOX_REPO` there to a repository you can clone; the default test repository is private and also needs `TERMBRIDGE_SANDBOX_GIT_USERNAME` and `TERMBRIDGE_SANDBOX_GIT_TOKEN`.

## Docs

The docs are plain Markdown files in `docs/`, with frontmatter on every page and `meta.json` files for navigation order. They are published at [termbridge.inline0.dev](https://termbridge.inline0.dev). Validate them with:

```bash
node scripts/check-docs-content.mjs --root docs --expected-docs 16 --expected-nav 3
```

The Docs content workflow runs the same check on pull requests that touch `docs/`.
