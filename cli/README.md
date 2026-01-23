# Termbridge

Access your terminal from anywhere — beam it to your phone with one command.

## Quick Start

**Prerequisites:** Node.js 18+, [tmux](https://github.com/tmux/tmux), [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

```bash
npx termbridge
```

Scan the QR code and you're connected!

## What It Does

Termbridge runs a local server that connects to your terminal (via tmux), then creates a secure Cloudflare tunnel. Access your terminal from your phone or any browser.

**Features:**
- Mobile-first UI with quick actions
- Multi-terminal support (switch between tmux sessions)
- Proxy mode to preview your dev server alongside the terminal
- Optional Daytona sandbox support for cloud terminals
- Coding agent integration (Claude Code, Codex, OpenCode)

## CLI Options

```bash
termbridge [options]
```

| Option | Description |
|--------|-------------|
| `--port <port>` | Use a specific local port |
| `--proxy <port>` | Proxy a local dev server |
| `--session <name>` | Name for the tmux session |
| `--kill-on-exit` | Kill tmux sessions on exit |
| `--no-qr` | Don't show the QR code |
| `--backend <mode>` | `tmux` (default) or `sandbox-daytona` |

## Documentation

Full documentation, environment variables, and Daytona sandbox setup at [termbridge.dev](https://termbridge.dev) or see the [GitHub README](https://github.com/inline0/termbridge).

## License

MIT
