---
title: "Overview"
description: "Learn how to get the most out of Termbridge."
path: "usage"
order: 30
section: "Usage"
meta_title: "Overview"
meta_description: "Learn how to get the most out of Termbridge."
---

# Usage

Once you're up and running, these guides will help you unlock Termbridge's full potential.

### [Mobile Controls](/docs/usage/mobile-controls)

On-screen buttons and tips for phone/tablet use

### [Multiple Terminals](/docs/usage/multiple-terminals)

Run several sessions and switch between them

### [Dev Server Preview](/docs/usage/dev-server-preview)

Preview your Vite app alongside the terminal

### [Named Tunnels](/docs/usage/named-tunnels)

Use your own Cloudflare tunnel to avoid rate limits

### [AI Coding Tools](/docs/usage/ai-coding-tools)

Monitor Claude Code, Codex, and other agents remotely


## Quick tips

- **Landscape mode**: Rotate your phone for more screen space with TUIs
- **tmux commands work**: `Ctrl+B` shortcuts function as normal
- **Auto-reconnect**: If you lose connection, just refresh the page
- **Session persistence**: tmux sessions survive Termbridge restarts (unless you use `--kill-on-exit`)

## Limitations

- **Single PTY**: Multiple viewers see the same terminal and can all type
- **Tunnel required**: Without a tunnel (or sandbox direct mode), you need your own public URL
- **Cloudflare only**: Currently the only tunnel provider (or use `--no-tunnel` / sandbox direct mode)
