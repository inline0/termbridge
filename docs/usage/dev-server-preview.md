---
title: "Dev Server Preview"
description: "Preview your local dev server alongside the terminal."
path: "usage/dev-server-preview"
order: 60
section: "Usage"
meta_title: "Dev Server Preview"
meta_description: "Preview your local dev server alongside the terminal."
---

# Dev Server Preview

Termbridge can proxy your local dev server and show it in a Preview view next to the terminal. You run commands in one view and watch the result in the other, on the same public URL, from your phone or any other browser.

This page covers how the proxy routes requests, what the Preview view can and cannot do, how to keep the preview on a stable address, and how preview works with Daytona sandboxes. Every flag mentioned here is listed in the [CLI reference](/docs/packages/cli).

## Quick start

```bash
# Start your dev server (e.g., Vite on port 5173)
cd my-app && npm run dev

# In another terminal, start Termbridge with proxy
termbridge --proxy 5173
```

Scan the QR code or open the share URL. Once the browser is signed in, a **Views** button appears in the bottom bar, and you can switch between **Terminal** and **Preview**.

If the `--proxy` value is missing, zero, negative or not a number, Termbridge stops with `invalid proxy port` before it starts.

## How it works

When you pass `--proxy <port>`, one Termbridge server answers both the terminal UI and your app:

1. Termbridge's own routes stay under `/__tb/`: the share link at `/__tb/s/`, the UI at `/__tb/app`, the API under `/__tb/api/`, the terminal WebSocket under `/__tb/ws/terminal/` and the health check at `/__tb/healthz`.
2. Every other request from a signed-in browser is forwarded to `http://localhost:<port>`, with its method, path, query string and body.
3. The Preview view loads `/` in an iframe, so your app is served through the same public URL as the terminal.

```
Browser → Public URL (tunnel) → Termbridge → Your dev server (localhost:5173)
```

Without `--proxy`, a request for `/` redirects to the terminal UI. With it, `/` belongs to your app, which means you can also open the public URL's root in the signed-in browser to see the app full screen, outside the iframe.

### What the proxy changes

The proxy passes requests and responses through almost untouched. Three things differ from talking to the dev server directly:

- **Only signed-in browsers are proxied.** A request without a valid Termbridge session cookie gets `404 not found` instead of reaching your app. The public URL never exposes your dev server to someone who has not redeemed the share link.
- **The `Cookie` header is removed.** Termbridge's session cookie and any cookies your app set share the public URL's origin, and the proxy strips the whole header before forwarding. Your app never sees the Termbridge session, and it also never receives its own cookies. `Set-Cookie` headers in responses still reach the browser.
- **The `Host` header is rewritten** to the target, for example `localhost:5173`. Dev servers that check the host name see a local request, not the tunnel's host name. Other request headers, such as `Origin` and `User-Agent`, are forwarded as the browser sent them.

Response status codes and headers from your dev server are passed back unchanged. If Termbridge cannot reach the dev server, it answers `502 proxy error`.

Because `/__tb/` is reserved, an app route that starts with `/__tb/` is never forwarded.

## Switching views

1. Tap the **Views** button in the bottom bar
2. Choose **Terminal** or **Preview**
3. The sheet closes and the view changes

The terminal stays connected while the Preview view is open, so output keeps streaming and is there when you switch back. The preview iframe, on the other hand, exists only while the Preview view is open. Each time you open it, your app loads again from `/`, and any route, scroll position or unsaved form state inside the iframe starts over. If you need to stay on one page of the app, open the public URL in a separate browser tab instead.

The **Views** button only appears when a preview target is configured. With [several terminals](/docs/usage/multiple-terminals) open, every terminal uses the same preview target.

## Iframe restrictions

The preview iframe is sandboxed with `allow-same-origin allow-scripts allow-forms allow-popups`. Scripts, forms, same-origin storage and new windows work. Two things do not:

- `alert()`, `confirm()` and `prompt()` are blocked, because modal dialogs are not allowed.
- Links and scripts cannot navigate the top-level page, so the Termbridge UI stays in place.

Your dev server's response headers also apply. A header that forbids framing, such as `X-Frame-Options: DENY` or a `Content-Security-Policy` with `frame-ancestors 'none'`, makes the Preview view stay empty. Open the public URL's root in a tab to check whether the app itself works.

## Hot Module Replacement (HMR)

Vite's HMR works through the proxy. Every WebSocket connection outside `/__tb/` from a signed-in browser is forwarded to your dev server, whatever its path, so the HMR socket connects without extra configuration. Messages pass in both directions, and closing either side closes the other.

Edit your code and the Preview view updates without a reload.

HMR only works when the browser opens its socket on the public URL. If your dev server is configured to connect its HMR client to a different host or port, the browser tries to reach that address directly, which is not reachable through the tunnel.

## Supported frameworks

Any dev server that runs on a local port works:

| Framework        | Command       | Default Port |
| ---------------- | ------------- | ------------ |
| Vite             | `npm run dev` | 5173         |
| Next.js          | `npm run dev` | 3000         |
| Create React App | `npm start`   | 3000         |
| Nuxt             | `npm run dev` | 3000         |
| SvelteKit        | `npm run dev` | 5173         |

Match the `--proxy` port to your dev server's port. Termbridge connects to `localhost`, so the dev server has to accept connections there.

## Proxying a URL instead of a port

`--dev-proxy-url <url>` points the proxy at a full URL instead of `localhost:<port>`. Paths and query strings are resolved against that URL, `https://` targets are supported, and WebSocket upgrades use `wss://` for them. Use it when the dev server is not on `localhost`, for example on another address of your machine.

```bash
termbridge --dev-proxy-url http://127.0.0.1:5173
```

If you pass both flags, `--proxy` wins and `--dev-proxy-url` is ignored for routing.

## Keep the preview on a stable URL

With the default Quick Tunnel, the public URL changes every time Termbridge starts, so the preview address changes with it. A [named tunnel](/docs/usage/named-tunnels) keeps one host name across restarts, which is useful when you reload the preview on a phone many times a day or share it with someone:

```bash
termbridge --port 8080 --proxy 5173 \
  --tunnel-token <TOKEN> --tunnel-url https://term.example.com
```

`--port` is the port Termbridge listens on and the one your Cloudflare host name points to. `--proxy` is your dev server's port. They must be different.

If you already run your own reverse proxy, `--no-tunnel --public-url <url>` works with `--proxy` the same way.

## Use cases

### Mobile testing

Test your responsive design on a real phone:

```bash
termbridge --proxy 5173
```

Scan the QR code and the app renders in your phone's own browser engine, with the terminal one tap away. The [mobile controls](/docs/usage/mobile-controls) page covers the control bar for keys and scrolling.

### Full-stack development

Run commands in the terminal while watching your app:

1. Watch build output in Terminal view
2. See your app in Preview view
3. Switch between them with a tap
4. Keep working from your phone or tablet

This pairs well with [AI coding tools](/docs/usage/ai-coding-tools): an agent edits code in the terminal, and HMR shows the result in Preview.

### Demo your work

The person you show the app to needs their own signed-in session. A plain public URL without a session gets `404 not found`, and each run issues one share link that works once. See [Can multiple people connect at once?](/docs/faq) in the FAQ for how to let a second person in. Once connected, they see both your running app (Preview) and your terminal session (Terminal), and they can type in the terminal too.

## Sandbox mode

With the [Daytona backend](/docs/sandboxes/daytona), your dev server runs inside the sandbox. Set the port it listens on there:

```bash
export TERMBRIDGE_SANDBOX_PREVIEW_PORT=5173
```

`--sandbox-preview-port <port>` does the same from the command line. Make sure the dev server binds to all interfaces:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

What happens next depends on the mode:

- **Tunnel mode** (the default for `--backend sandbox-daytona`): Termbridge runs on your machine, fetches the sandbox's Daytona preview link for that port and proxies Preview requests to it. For private sandboxes it sends the preview token as a header, so the browser never needs it. If Daytona returns no link, Termbridge prints `Sandbox (Daytona): preview URL unavailable` and starts without a preview.
- **Direct mode** (`--sandbox-direct`): Termbridge runs inside the sandbox, and the preview port is passed to that server as its `--proxy` port. Requests go to the dev server inside the sandbox without leaving it.

In both modes the Preview view, the **Views** button and HMR behave as described above.

## Troubleshooting

### Preview shows a blank page

- Make sure your dev server is running
- Check that the port matches `--proxy`
- Open the public URL's root in a tab. `502 proxy error` means Termbridge could not reach the dev server; a working page means a framing header is blocking the iframe (see [Iframe restrictions](#iframe-restrictions))
- For sandbox mode, use `--host 0.0.0.0` so the port is reachable

### "not found" instead of the app

The browser has no Termbridge session. Redeem the share link first, or restart Termbridge for a new one. The [troubleshooting guide](/docs/troubleshooting) covers expired and already used links.

### Logged out of your app in the preview

Your app's cookies are not forwarded, because the proxy removes the `Cookie` header. Cookie-based sign-in inside the app does not survive through the proxy. Test those flows against the dev server directly, or use token-based auth in development.

### HMR not working

- Verify your dev server supports HMR
- Check the browser console for WebSocket errors
- Make sure the HMR client connects to the page's own host, not a fixed port or host name

### CORS errors

Requests from your app to its own paths are same-origin through the proxy. Requests to other origins still go straight from the browser, so CORS applies to them as usual:

- Configure your dev server's CORS settings
- Or route those requests through your dev server's own proxy, so they stay on the same origin

For problems with the tunnel, tmux or the share link itself, see the [troubleshooting guide](/docs/troubleshooting).
