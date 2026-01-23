<p align="center">
  <a href="https://termbridge.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./.github/logo-light.svg">
      <img alt="Termbridge" src="./.github/logo-light.svg" height="50">
    </picture>
  </a>
</p>

<p align="center">
  Access your terminal from anywhere — beam it to your phone with one command
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/termbridge"><img src="https://img.shields.io/npm/v/termbridge.svg" alt="npm version"></a>
  <a href="https://github.com/inline0/termbridge/actions/workflows/ci.yml"><img src="https://github.com/inline0/termbridge/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/inline0/termbridge/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/termbridge.svg" alt="license"></a>
</p>

---

## What is Termbridge?

Termbridge lets you access your local terminal from your phone or any device with a browser. Run one command, scan the QR code, and you're connected.

It works by running a local server that connects to your terminal (via tmux), then creates a secure tunnel so you can access it from anywhere. The mobile-friendly UI makes it easy to type commands and navigate on a small screen.

**Use cases:**
- Run long commands on your laptop while checking progress from your phone
- Access your dev environment from your couch
- Pair program by sharing your terminal with someone else
- Run coding agents (Claude Code, Codex, OpenCode) in cloud sandboxes

## Quick Start

**Prerequisites:**
- Node.js 18+
- [tmux](https://github.com/tmux/tmux) installed
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) installed

```bash
npx termbridge
```

That's it! A QR code appears in your terminal. Scan it with your phone and you're connected.

## Features

- **One command** — `npx termbridge` does everything
- **Mobile-first UI** — designed for phones, works everywhere
- **Multi-terminal** — switch between tmux sessions
- **Proxy mode** — preview your local dev server alongside the terminal
- **Secure by default** — Cloudflare tunnel with one-time tokens
- **Cloud sandboxes** — run terminals in [Daytona](https://daytona.io) sandboxes (optional)
- **Coding agents** — auto-install Claude Code, Codex, or OpenCode in sandboxes

## CLI Options

```bash
termbridge [options]
```

| Option | Description |
|--------|-------------|
| `--port <port>` | Use a specific local port (default: random) |
| `--proxy <port>` | Proxy a local dev server (shows Terminal/Preview tabs) |
| `--session <name>` | Name for the tmux session |
| `--kill-on-exit` | Kill tmux sessions when termbridge exits |
| `--no-qr` | Don't show the QR code |
| `--no-tunnel` | Disable the tunnel (use with `--public-url`) |
| `--public-url <url>` | Your own public URL (when tunnel disabled) |
| `--backend <mode>` | `tmux` (default) or `sandbox-daytona` |

### Proxy Mode

Preview your local dev server alongside the terminal:

```bash
# If your app runs on port 5173
termbridge --proxy 5173
```

The UI shows Terminal and Preview tabs. Great for mobile testing!

## Environment Variables

### Basic Configuration

| Variable | Description |
|----------|-------------|
| `TERMBRIDGE_SESSIONS=2` | Create multiple tmux sessions on start |
| `TERMBRIDGE_TMUX_CWD=/path` | Working directory for tmux sessions |
| `TERMBRIDGE_PUBLIC_URL=<url>` | Public URL when tunnel is disabled |
| `TERMBRIDGE_TUNNEL=none` | Disable the Cloudflare tunnel |

### Security (Development Only)

| Variable | Description |
|----------|-------------|
| `TERMBRIDGE_INSECURE_COOKIE=1` | Allow HTTP cookies (for local dev without HTTPS) |

---

## Daytona Sandboxes

Instead of running terminals locally, you can run them in [Daytona](https://daytona.io) cloud sandboxes. This is useful for:

- Running coding agents without cluttering your local machine
- Isolated environments for experiments
- Sharing terminals that persist even if your laptop sleeps

### Setup

1. Get a Daytona API key from [app.daytona.io](https://app.daytona.io)
2. Set the environment variables:

```bash
# Required
export TERMBRIDGE_BACKEND=sandbox-daytona
export TERMBRIDGE_DAYTONA_API_KEY=your_api_key
export TERMBRIDGE_SANDBOX_REPO=https://github.com/you/your-repo.git

# Optional
export TERMBRIDGE_DAYTONA_API_URL=https://app.daytona.io/api
export TERMBRIDGE_SANDBOX_BRANCH=main
export TERMBRIDGE_SANDBOX_NAME=my-sandbox
export TERMBRIDGE_SANDBOX_PUBLIC=true
export TERMBRIDGE_SANDBOX_DELETE_ON_EXIT=true
```

Then run:

```bash
termbridge
```

### Sandbox Environment Variables

| Variable | Description |
|----------|-------------|
| **Daytona API** | |
| `TERMBRIDGE_DAYTONA_API_KEY` | Your Daytona API key (required) |
| `TERMBRIDGE_DAYTONA_API_URL` | API endpoint (default: `https://app.daytona.io/api`) |
| **Repository** | |
| `TERMBRIDGE_SANDBOX_REPO` | Git repo URL to clone (required) |
| `TERMBRIDGE_SANDBOX_BRANCH` | Branch to checkout |
| `TERMBRIDGE_SANDBOX_PATH` | Path inside sandbox (default: derived from repo name) |
| **Sandbox Settings** | |
| `TERMBRIDGE_SANDBOX_NAME` | Name for the sandbox |
| `TERMBRIDGE_SANDBOX_PUBLIC` | Make sandbox publicly accessible (`true`/`false`) |
| `TERMBRIDGE_SANDBOX_DELETE_ON_EXIT` | Delete sandbox when termbridge exits |
| `TERMBRIDGE_SANDBOX_PREVIEW_PORT` | Port for preview proxy (e.g., `5173`) |
| **Git Auth** (for private repos) | |
| `TERMBRIDGE_SANDBOX_GIT_USERNAME` | Git username |
| `TERMBRIDGE_SANDBOX_GIT_TOKEN` | Git token or password |

### Direct Mode (No Tunnel)

Run the Termbridge server **inside** the sandbox instead of locally. This skips Cloudflare and uses Daytona's built-in preview URLs:

```bash
export TERMBRIDGE_SANDBOX_DIRECT=true
export TERMBRIDGE_SANDBOX_SERVER_PORT=8080  # optional
```

---

## Coding Agents

Termbridge can auto-install and configure coding agents in Daytona sandboxes:

- **Claude Code** (`@anthropic-ai/claude-code`)
- **Codex** (`@openai/codex`)
- **OpenCode** (via install script)

### Auto Setup

```bash
export TERMBRIDGE_SANDBOX_AGENTS=claude-code,codex,opencode
```

This will:
1. Install the agent CLIs in the sandbox
2. Sync your local auth files to the sandbox (so agents are already logged in)

### Agent Environment Variables

| Variable | Description |
|----------|-------------|
| `TERMBRIDGE_SANDBOX_AGENTS` | Agents to install: `claude-code`, `codex`, `opencode`, or `all` |
| `TERMBRIDGE_SANDBOX_AGENT_ENV` | Extra env vars to pass to agents (comma-separated keys) |
| `TERMBRIDGE_SANDBOX_AGENT_AUTH_PATHS` | Additional auth files to sync |
| `TERMBRIDGE_SANDBOX_AGENT_AUTH_MAPS` | Auth file mappings (`local=remote`) |

---

## Development

```bash
# Install dependencies
bun install

# Run in dev mode (with hot reload)
bun run dev:beam

# Run tests
bun run test
```

### Development Environment Variables

These are only used during development:

| Variable | Description |
|----------|-------------|
| `TERMBRIDGE_DEV_PORT` | Override server port |
| `TERMBRIDGE_DEV_UI` | Override Vite dev UI URL |
| `TERMBRIDGE_DEV_SESSION` | Session name for dev |
| `TERMBRIDGE_SKIP_BUILD` | Skip build step |

### Testing

| Variable | Description |
|----------|-------------|
| `TERMBRIDGE_E2E_DAYTONA=1` | Enable Daytona integration tests |
| `TERMBRIDGE_TEST_DEBUG=1` | Enable debug logging in tests |

The Daytona E2E tests require a `.env` file in the [termbridge-test-app](https://github.com/inline0/termbridge-test-app) repo (sibling directory).

---

## Documentation

Full documentation at [termbridge.dev](https://termbridge.dev).

## License

MIT
