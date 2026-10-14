---
title: "CLI Reference"
description: "All the flags and options you might need."
path: "cli"
order: 120
section: "Reference"
meta_title: "CLI Reference"
meta_description: "All the flags and options you might need."
---

# CLI Reference

## Basic usage

Just run the command - no arguments needed:

```bash
npx termbridge
```

This starts everything: local server, tmux session, and the default Cloudflare tunnel.

Running `termbridge` without a subcommand is equivalent to `termbridge start`.

You can also run `termbridge start` explicitly with all flags:

```bash
termbridge start --port 8080 --proxy 5173 --session dev --kill-on-exit --no-qr --tunnel cloudflare
```

## Flags

| Flag | What it does | Default |
|------|--------------|---------|
| `--port <port>` | Use a specific port instead of a random one | Random |
| `--proxy <port>` | Proxy a local dev server (enables Terminal/Preview views) | - |
| `--session <name>` | Name your tmux session | Auto-generated |
| `--kill-on-exit` | Clean up tmux sessions when Termbridge exits | Off |
| `--no-qr` | Don't print the QR code (useful for scripts) | Off |
| `--no-tunnel` | Disable the tunnel (requires `--public-url`) | Off |
| `--public-url <url>` | Public URL when tunnel is disabled | - |
| `--tunnel <provider>` | Tunnel provider (`cloudflare` or `none`) | cloudflare |
| `--tunnel-token <token>` | Use a named Cloudflare Tunnel token (requires `--port`) | - |
| `--tunnel-url <url>` | Public URL for the named tunnel (required with `--tunnel-token`) | - |
| `--backend <backend>` | Terminal backend (`tmux` or `sandbox-daytona`) | tmux |
| `--sandbox-repo <url>` | Repo URL to clone into the Daytona sandbox | - |
| `--sandbox-branch <branch>` | Branch to check out in the sandbox | - |
| `--sandbox-path <path>` | Repo path in the sandbox | Derived from the repo name |
| `--sandbox-name <name>` | Sandbox name | Random `termbridge-<hex>` |
| `--sandbox-preview-port <port>` | Preview port in the sandbox | - |
| `--sandbox-public` | Create a public sandbox | Off (on in direct mode) |
| `--sandbox-direct` | Run the server inside the Daytona sandbox (no tunnel) | Off |
| `--dev-proxy-url <url>` | Proxy preview traffic to this URL instead of `localhost:<proxy port>` (used by the dev scripts) | - |
| `-h`, `--help` | Print the help text | - |

Any other option fails with `unknown option: <flag>`. There is no `--version` flag.

A flag wins over its environment variable, with one exception: `TERMBRIDGE_TUNNEL` currently overrides `--tunnel` and `--no-tunnel` ([#5](https://github.com/inline0/termbridge/issues/5)).

> **Note**
> The built-in `termbridge --help` output still lists `--daytona-*` flags and `--backend tmux | daytona`. Those names are rejected; use the `--sandbox-*` flags and `--backend sandbox-daytona` from the table above ([#1](https://github.com/inline0/termbridge/issues/1)).

## Examples

### Attach to an existing tmux session

If you already have a tmux session running:

```bash
termbridge --session my-session
```

### Fixed port and custom session

```bash
termbridge --port 8080 --session codex
```

### Clean exit (no leftover sessions)

```bash
termbridge --kill-on-exit
```

### Scripting (no QR output)

```bash
termbridge --no-qr
```

### Proxy a Vite dev server

```bash
# Start your Vite app first
cd my-app && npm run dev  # runs on port 5173

# Then start Termbridge with proxy
termbridge --proxy 5173
```

Use the **Views** button to switch between Terminal and Preview. Preview loads your app through the proxy with HMR support.

### Named Cloudflare tunnel (token-based)

If you have a Cloudflare account and want to avoid trycloudflare rate limits:

```bash
termbridge --port 8080 --tunnel-token <TOKEN> --tunnel-url https://term.example.com
```

### Disable the tunnel (bring your own public URL)

```bash
termbridge --no-tunnel --public-url https://example.com
```

## Environment variables

Termbridge reads environment variables from the shell and from a `.env` file in the directory you run it from. Variables already set in the shell take precedence over the `.env` file.

### Core settings

| Variable | What it does |
|----------|--------------|
| `TERMBRIDGE_SESSIONS=2` | Create multiple tmux sessions on startup |
| `TERMBRIDGE_TMUX_CWD=/path` | Working directory for new tmux sessions |
| `TERMBRIDGE_PUBLIC_URL=https://example.com` | Public URL when tunnel is disabled |
| `TERMBRIDGE_TUNNEL=none` | Disable the tunnel |
| `TERMBRIDGE_TUNNEL_TOKEN=<token>` | Named tunnel token (requires `TERMBRIDGE_TUNNEL_URL`) |
| `TERMBRIDGE_TUNNEL_URL=https://term.example.com` | Public URL for the named tunnel |

### Advanced

Daytona direct mode sets these for the server it runs inside the sandbox. You can also set them yourself.

| Variable | What it does |
|----------|--------------|
| `TERMBRIDGE_HOST=0.0.0.0` | Address the server binds to (default `127.0.0.1`). The printed local URL always shows `127.0.0.1`. |
| `TERMBRIDGE_COOKIE_SAMESITE=lax` | `SameSite` value of the session cookie: `lax`, `strict` or `none` (default `Lax`, or `None` in direct mode) |
| `TERMBRIDGE_SHARE_FILE=/path/share-url.txt` | Also write the share URL to this file |
| `TERMBRIDGE_HIDE_TERMINAL_SWITCHER=1` | Hide the terminal switcher in the UI |
| `TERMBRIDGE_TMUX_PATH_PREFIX=/path/bin` | Prepend this to `PATH` in each tmux session Termbridge starts or attaches to (typed into the session as an `export` command) |

### Development

| Variable | What it does |
|----------|--------------|
| `TERMBRIDGE_INSECURE_COOKIE=1` | Allow HTTP cookies (local dev only) |
| `TERMBRIDGE_PROXY_PORT=5173` | Proxy port for dev:beam:proxy script |
| `TERMBRIDGE_DEV_UI=http://127.0.0.1:5000` | Override Vite dev UI URL |
| `TERMBRIDGE_DEV_PORT=3000` | Override Termbridge server port in dev (default `8787`) |
| `TERMBRIDGE_DEV_SESSION=codex` | tmux session name for `dev:beam` (default `codex`) |
| `TERMBRIDGE_SKIP_BUILD=1` | Skip the CLI build in `dev:beam` |

### Sandbox (Daytona)

| Variable | What it does |
|----------|--------------|
| `TERMBRIDGE_BACKEND=sandbox-daytona` | Use the Daytona sandbox backend |
| `TERMBRIDGE_SANDBOX_DIRECT=true` | Run Termbridge inside the sandbox |
| `TERMBRIDGE_SANDBOX_SERVER_PORT=8080` | Port for the sandboxed server |
| `TERMBRIDGE_SANDBOX_AGENTS=claude-code,codex` | Auto-install + sync auth for agents |
| `TERMBRIDGE_SANDBOX_AGENT_ENV=...` | Extra env vars to forward |
| `TERMBRIDGE_SANDBOX_AGENT_AUTH_PATHS=...` | Local auth files to sync |

For full Daytona configuration, see the [Daytona guide](/docs/sandboxes/daytona).

## Stopping Termbridge

Press `Ctrl+C` in the terminal where Termbridge is running. This:

- Closes the tunnel (if enabled)
- Stops the local server
- Keeps tmux sessions alive (unless you used `--kill-on-exit`)

Your tmux sessions persist by default, so you can reconnect later.
