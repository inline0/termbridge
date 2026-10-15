---
title: "Troubleshooting"
description: "Solutions for common issues."
path: "troubleshooting"
order: 150
section: "Help"
meta_title: "Troubleshooting"
meta_description: "Solutions for common issues."
---

# Troubleshooting

## "spawn tmux ENOENT"

tmux isn't installed or isn't in your PATH. Termbridge closes its server and exits with status 1. Install tmux and start it again.

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt install tmux
```

## "spawn cloudflared ENOENT"

Cloudflare's tunnel client isn't installed or isn't in your PATH. This is only required for tunnel mode; `--no-tunnel` and Daytona direct mode do not need cloudflared.

```bash
# macOS
brew install cloudflared
```

For Linux, download from [cloudflare.com/downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).

## Tunnel won't start

A few things to check (skip this if you're using direct sandbox mode):

1. Verify cloudflared works: `cloudflared --version`
2. Make sure you can reach `https://trycloudflare.com`
3. Check if a firewall is blocking outbound connections

If the tunnel fails to start, Termbridge prints the error, stops its server and exits with status 1. It does not fall back to a local-only mode, and the server only listens on `127.0.0.1` by default, so other devices on your network can't reach it either. With `--kill-on-exit`, sessions started during the failed run are closed. Without that flag, tmux sessions remain available for reconnection.

To use Termbridge without the Cloudflare tunnel, run it with `--no-tunnel --public-url <url>` behind your own reverse proxy or tunnel.

## "429 Too Many Requests" from trycloudflare

Cloudflare rate limits account-less tunnels. If you see errors like `429 Too Many Requests`, try:

1. Wait a few minutes and retry
2. Make sure no old `cloudflared` processes are still running
3. Use a named tunnel token (recommended for frequent use)

## Blank screen or "Unable to load terminals"

This usually means the browser has no valid session cookie, for example because it was opened without redeeming a share link, or the tunnel URL changed:

1. Check if the local server is still running
2. Look at the browser console for 401/403 errors
3. Restart Termbridge to get a fresh URL and QR code

## No output in the terminal

The tmux session might not be running:

```bash
# Check if sessions exist
tmux ls
```

If sessions show up but the terminal is blank, try:
- Reloading the page
- Checking that your shell supports `TERM=xterm-256color`

## QR code scans but page is blank

The QR code contains a one-time token. It works once, and only within 90 seconds of Termbridge starting. A used or expired link returns `invalid token`.

Solution: Restart Termbridge to generate a new QR code, and scan it right away.

## node-pty errors about spawn-helper

Termbridge tries to fix this automatically, but if you see permission errors:

```bash
chmod +x node_modules/node-pty/prebuilds/**/spawn-helper
```

## Still stuck?

Open an issue at [github.com/inline0/termbridge](https://github.com/inline0/termbridge/issues) with:
- Your OS and Node.js version
- The error message
- Steps to reproduce
