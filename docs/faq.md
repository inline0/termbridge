---
title: "FAQ"
description: "Quick answers to common questions."
path: "faq"
order: 160
section: "Help"
meta_title: "FAQ"
meta_description: "Quick answers to common questions."
---

# FAQ

## Is my data going through someone else's server?

The Termbridge server and your terminal run on your machine, and there is no Termbridge-operated backend. In the default setup your terminal traffic does pass through Cloudflare: the browser connects over HTTPS to a Cloudflare Quick Tunnel, which forwards it to the `cloudflared` process on your computer (see [Architecture](/docs/architecture)). With a named tunnel it goes through your own Cloudflare account, and with `--no-tunnel` it goes through whatever serves your public URL.

In Daytona sandbox mode the terminal runs in a sandbox in your Daytona account. In direct mode the browser connects through the Daytona preview link instead of Cloudflare.

## How secure is the connection?

- The URL includes a one-time token that works once and expires 90 seconds after startup
- Sessions are protected by HttpOnly cookies
- Tunnel URLs (Cloudflare or a Daytona preview link) use HTTPS; with `--no-tunnel`, encryption depends on the public URL you provide

Sessions don't expire on their own. They are stored in `termbridge/sessions.json` in your system's temp directory, so a browser that redeemed a link keeps access for as long as it can reach the same URL. Delete that file and restart Termbridge to sign every browser out. Don't share the QR code or URL with people you don't trust.

## Can I run multiple terminals at once?

Yes. Start Termbridge with `TERMBRIDGE_SESSIONS=3` (or attach to existing sessions with `--session`) and use the terminal switcher in the UI to jump between them. See [Multiple Terminals](/docs/usage/multiple-terminals).

## Will it work with Claude Code, Codex, or other AI tools?

Absolutely. If it runs in a terminal, Termbridge can stream it. Start your AI coding tool in the tmux session, and you can monitor it from your phone.

## Does it work on Windows?

Not officially. Termbridge is built for macOS and Linux. It might work with WSL, but it's not tested.

## Can I use a different tunnel provider?

Not yet - Cloudflare is the only tunnel provider right now. You can also disable the tunnel entirely or use Daytona direct mode.

## What happens if I close my laptop?

In local mode, the tunnel stays active as long as Termbridge is running. If your computer sleeps or Termbridge exits, the connection closes. Your tmux sessions stay alive though, so you can restart Termbridge and reconnect. In Daytona direct mode, the server runs inside the sandbox, so you can close your laptop and reconnect later.

## Can multiple people connect at once?

Not from a single link. Each run issues one share link, and it works once: whoever opens it first gets the session, and anyone else gets `invalid token`. There is no way to issue a second link without restarting Termbridge.

If you restart and keep the same public URL (a named tunnel or `--public-url`), browsers that connected earlier keep their sessions, so a second person can scan the new code. Everyone connected to the same terminal sees the same output and can type. A Quick Tunnel gets a new URL on every start, so earlier browsers have to scan again.
