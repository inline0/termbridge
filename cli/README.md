# Termbridge

Local-first terminal beaming with tmux + Cloudflare tunnel and a mobile-friendly UI.

## Quick start

Prereqs:
- Node.js 18+
- tmux in PATH
- cloudflared in PATH

Run:

```bash
npx termbridge
```

Scan the QR code and open the URL on your phone. The CLI stays running while the tunnel is active.

## Documentation

Visit `https://termbridge.dev` for the full docs, architecture notes, and troubleshooting.

## CLI usage

```bash
termbridge --port 8080 --session dev --kill-on-exit --no-qr --tunnel cloudflare
```

Flags:
- `--port <port>`: fixed local port (default: random free port)
- `--session <name>`: tmux session name override
- `--kill-on-exit`: kill tmux sessions on exit
- `--no-qr`: disable QR output
- `--tunnel cloudflare`: tunnel provider (default)

## Environment variables

- `TERMBRIDGE_SESSIONS=2`: create multiple tmux sessions on start
- `TERMBRIDGE_INSECURE_COOKIE=1`: allow HTTP cookies for local dev
- `TERMBRIDGE_DEV_UI=http://127.0.0.1:5173`: override Vite dev UI URL

## Development

```bash
bun install
bun run dev:beam
bun run dev:beam:multi
bun run test
```

## Troubleshooting

- `tmux` not found: install `tmux` and ensure it is on your PATH.
- `cloudflared` not found: install Cloudflare's tunnel client and ensure it is on your PATH.
- `node-pty` issues: ensure the spawn-helper binary is executable (Termbridge attempts to fix this automatically).

## License

MIT
