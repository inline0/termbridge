---
title: "Multiple Terminals"
description: "Run several terminal sessions and switch between them."
path: "usage/multiple-terminals"
order: 50
section: "Usage"
meta_title: "Multiple Terminals"
meta_description: "Run several terminal sessions and switch between them."
---

# Multiple Terminals

Termbridge can run multiple terminal sessions simultaneously. One server hosts several tmux sessions, and the UI lets you switch between them.

## How it works

- Termbridge tracks sessions it created or attached to in the current run
- The terminal switcher shows all available sessions
- Switching is instant - no reconnection needed

## Creating multiple sessions

### On startup

Use the `TERMBRIDGE_SESSIONS` environment variable:

```bash
TERMBRIDGE_SESSIONS=3 npx termbridge
```

This creates three sessions: `<base>`, `<base>-2`, and `<base>-3`.

### During development

Use the shortcut script:

```bash
pnpm dev:beam:multi
```

### While Termbridge is running

The UI switches between terminals but has no control for creating one. To get more terminals, restart Termbridge with a higher `TERMBRIDGE_SESSIONS`, or open extra windows inside the tmux session itself (`Ctrl+B` then `c`).

## Switching terminals

1. Tap the terminal icon in the bottom bar
2. A list of available sessions appears
3. Tap one to switch

The switch is instant - your previous session keeps running in the background.

## Use cases

### Build + logs

Run your build in one terminal, tail logs in another:

```bash
# Terminal 1: Build
npm run build

# Terminal 2: Logs
tail -f logs/app.log
```

Switch between them without losing your place.

### Server + client

Run your backend server in one terminal, frontend dev server in another:

```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

### Multiple SSH sessions

Connect to different servers:

```bash
# Terminal 1
ssh user@server1.com

# Terminal 2
ssh user@server2.com
```

Monitor both from your phone.

## Session naming

By default, sessions are named based on the port number. Use `--session` for meaningful names:

```bash
termbridge --session api-server
```

When creating multiple sessions with `TERMBRIDGE_SESSIONS`, the base name is used with numeric suffixes.

## Persistence

- Sessions persist when you disconnect from the UI
- Sessions persist when Termbridge restarts (unless `--kill-on-exit`)
- Use `--session <name>` to reconnect to an existing session
