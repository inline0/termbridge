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
  Local-first terminal beaming with tmux + Cloudflare tunnel and a mobile-friendly UI
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/termbridge"><img src="https://img.shields.io/npm/v/termbridge.svg" alt="npm version"></a>
  <a href="https://github.com/inline0/termbridge/actions/workflows/ci.yml"><img src="https://github.com/inline0/termbridge/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/inline0/termbridge/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/termbridge.svg" alt="license"></a>
</p>

---

Beam your local terminal to your phone in seconds. Run one command, scan the QR code, and access your terminal from anywhere.

## Features

- **One Command** - `npx termbridge` spins up the server and tunnel
- **Multi-Terminal** - One server, multiple tmux sessions
- **Mobile-First UI** - Single terminal viewport with quick actions
- **Scroll Controls** - Line + page jump actions in the control tray
- **Proxy Mode** - Preview your local dev server alongside the terminal
- **Cloudflare Tunnels** - Secure public URL without router config
- **Direct Sandbox Mode** - Run the server inside a Daytona sandbox (no tunnel)
- **Local by Default** - No remote server required
- **Daytona Sandbox** - Run terminals in a Daytona sandbox (optional preview support)

## Quick Start

Prereqs:
- Node.js 18+
- tmux in PATH
- cloudflared in PATH

```bash
npx termbridge
```

Scan the QR code and open the URL on your phone. The CLI stays running while the tunnel is active.

## CLI usage

```bash
termbridge --port 8080 --session dev --kill-on-exit --no-qr --tunnel cloudflare
```

Flags:
- `--port <port>`: fixed local port (default: random free port)
- `--proxy <port>`: proxy a local dev server through termbridge (shows Terminal/Preview tabs)
- `--session <name>`: tmux session name override
- `--kill-on-exit`: kill tmux sessions on exit
- `--no-qr`: disable QR output
- `--no-tunnel`: disable the tunnel (requires `--public-url`)
- `--public-url <url>`: public URL when no tunnel is used
- `--tunnel cloudflare`: tunnel provider (default)
- `--backend <tmux|daytona>`: terminal backend (defaults to tmux)
- `--daytona-direct`: run the server inside the Daytona sandbox (no tunnel)

## Environment variables

- `TERMBRIDGE_SESSIONS=2`: create multiple tmux sessions on start
- `TERMBRIDGE_INSECURE_COOKIE=1`: allow HTTP cookies for local dev
- `TERMBRIDGE_PROXY_PORT=5174`: proxy port for dev:beam:proxy script
- `TERMBRIDGE_PUBLIC_URL=https://example.com`: public URL when tunnel disabled
- `TERMBRIDGE_TUNNEL=none`: disable the tunnel

### Daytona sandbox mode

Set the backend to Daytona and provide sandbox + repo configuration:

```bash
TERMBRIDGE_BACKEND=daytona
DAYTONA_API_KEY=your_key
DAYTONA_API_URL=https://app.daytona.io/api
TERMBRIDGE_DAYTONA_REPO=https://github.com/inline0/termbridge-test-app.git
TERMBRIDGE_DAYTONA_BRANCH=main
TERMBRIDGE_DAYTONA_PATH=termbridge-test-app
TERMBRIDGE_DAYTONA_NAME=termbridge-sandbox
TERMBRIDGE_DAYTONA_GIT_USERNAME=your_github_username
TERMBRIDGE_DAYTONA_GIT_TOKEN=your_github_token
TERMBRIDGE_DAYTONA_PUBLIC=true
TERMBRIDGE_DAYTONA_PREVIEW_PORT=5173
TERMBRIDGE_DAYTONA_DELETE_ON_EXIT=true
```

### Daytona direct mode (no tunnel)

Run the Termbridge server inside the sandbox and skip Cloudflare entirely:

```bash
TERMBRIDGE_BACKEND=daytona
TERMBRIDGE_DAYTONA_DIRECT=true
TERMBRIDGE_DAYTONA_SERVER_PORT=8080
```

### Sandboxes

For ephemeral sandboxes (tests, CI, short-lived sessions), use a dedicated name prefix and enable automatic cleanup:

```bash
TERMBRIDGE_DAYTONA_NAME=termbridge-test-$(date +%s)
TERMBRIDGE_DAYTONA_DELETE_ON_EXIT=true
```

## Documentation

For full documentation, visit [termbridge.dev](https://termbridge.dev).

## Development

```bash
bun install
bun run dev:beam
bun run test
```

## License

MIT
