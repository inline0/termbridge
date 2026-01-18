# PRD: Termbridge OSS MVP (Bun Monorepo, Local-Only + External Tunnel)

## 0) Inspiration
Implementation should take inspiration from **`fabrikat/inline0/monorepo`** for monorepo layout, Bun workflows, and engineering conventions.

---

## 1) Product summary
Termbridge is an open-source CLI that runs entirely on the user’s machine. It starts a local web server that serves a browser UI and a WebSocket endpoint. The browser UI provides an interactive terminal using xterm.js and lets the user pick from multiple local terminal sessions. A tunnel provider (initially Cloudflare Quick Tunnel via `cloudflared`) exposes the local server on a public HTTPS URL. Termbridge prints that URL and an ASCII QR code so the user can open the terminal on a mobile device.

There is no Termbridge-operated backend server. Authentication and session management are handled locally.

---

## 2) Goals
- One command to start: local server, tmux session, tunnel.
- Mobile-first: QR scan opens a working terminal UI.
- Correct terminal behavior: ANSI and TUIs work (xterm.js rendering).
- One server, multiple terminals with in-app selection and switching.
- No managed backend: local-only server plus third-party tunnel transport.
- Secure defaults given a public URL: one-time token exchange and cookie sessions.

## 3) Non-goals (MVP)
- Port proxying or exposing arbitrary localhost ports.
- Multi-user, sharing, teams, accounts, billing.
- Background daemon/service mode; the CLI must stay running.
- File transfer and terminal recording.
- Cloudflare Access automation.

---

## 4) Target user
A single developer who wants quick mobile access to their local terminal session.

---

## 5) Prerequisites and dependencies
### Runtime (end users)
- Node.js 18+ (for `npx termbridge`).
- tmux in PATH.
- cloudflared in PATH (Cloudflare Quick Tunnel).
- macOS or Linux (Windows optional for MVP).

### Development
- Bun for workspace installs, builds, and tests.
- tmux and cloudflared for end-to-end testing.
- Biome (via `bunx @biomejs/biome`) and TypeScript for linting and type checks.

### Install hints
- macOS (Homebrew): `brew install node tmux cloudflared` (and `brew install bun` for development).
- Linux: install `node` and `tmux` via your package manager; install Bun and cloudflared via their official installers.

---

## 6) User flow
1. User runs `npx termbridge`.
2. CLI starts a local HTTP server on `127.0.0.1:<port>`.
3. CLI creates or attaches to one or more tmux sessions.
4. CLI generates a one-time token and starts a tunnel to the local server.
5. CLI prints a public URL of the form `https://<public-host>/s/<token>` and renders an ASCII QR code.
6. User opens the URL on mobile. The local server redeems the token, sets a secure cookie, and redirects to the app.
7. The app loads, shows a list of available terminals (and optional create), and connects via WebSocket to stream terminal I/O for the selected session.

---

## 7) Architecture
### Processes
- `termbridge` (Node process)
  - local HTTP server (serves UI assets)
  - local WebSocket server (terminal I/O)
  - tmux integration (session creation and persistence)
  - terminal registry (tracks available sessions for selection)
  - auth (one-time token redemption and cookie session issuance)
- tunnel provider child process
  - `cloudflared tunnel --url http://127.0.0.1:<port>`

### Data flow
Browser (mobile) ↔ Public URL (tunnel) ↔ Local HTTP/WS server ↔ selected tmux session.

---

## 8) Repo structure and conventions (single publishable CLI + packages)
### Workspace
- Bun workspaces for development with `cli` and `packages/*`.
- Root files: `package.json`, `bun.lock`, `biome.json`, `tsconfig.json`.
- Single publishable package lives in `cli/` to keep everything in one place.

### Structure
```
termbridge/
├── cli/
│   ├── src/cli/      # CLI entrypoint and orchestration
│   ├── src/server/   # local HTTP + WS server and auth
│   ├── ui/           # xterm.js app source
│   └── ui/dist/      # built UI assets served by server
├── packages/
│   ├── shared/       # protocol types and shared helpers
│   ├── terminal/     # tmux backend + PTY/pipe adapters
│   ├── tunnel/       # tunnel providers (cloudflared)
│   └── tsconfig/     # shared TS config (base.json)
├── package.json
├── biome.json
├── tsconfig.json     # extends packages/tsconfig/base.json
└── bun.lock
```

### Build and packaging
- UI build outputs to `cli/ui/dist`.
- Server serves `cli/ui/dist` as static assets.
- `cli` is publishable to npm with a `bin` entry for `termbridge`; `npx termbridge` runs `start` by default.
- CLI runtime must be Node-compatible (avoid Bun-only APIs; bundle if needed).
- Shared packages export TypeScript directly (no build step), matching inline0 conventions.

### Scripts and workflow
- Prefer root scripts that call `bun run --cwd cli` or `bun run --cwd packages/<name>`.
- Use Biome from root: `bunx @biomejs/biome check --write`.

---

## 9) Functional requirements

### 9.1 CLI commands
#### `termbridge` (no subcommand)
- Defaults to `termbridge start`, so `npx termbridge` just works.

#### `termbridge start`
- Starts local server, terminal registry, and tunnel.
- Creates or attaches to an initial tmux session; additional sessions are selectable in the UI.
- Prints:
  - public URL for token redemption
  - ASCII QR code
  - local port, tmux session name, and tunnel provider
- Remains running until Ctrl+C.
- Shutdown behavior:
  - stop tunnel process
  - default: leave tmux session running

#### Flags (MVP)
- `--port <port>`: fixed local port (default: random free port).
- `--session <name>`: tmux session name override (default: autogenerated).
- `--kill-on-exit`: kill tmux session on exit (default: false).
- `--no-qr`: disable QR printing.
- `--tunnel cloudflare`: tunnel provider selection (default: cloudflare). Design for pluggable providers.

### 9.2 Local HTTP server
#### Static UI
- Serve UI at `/app` (or `/`).
- SPA fallback to `index.html`.

#### One-time token redemption
- `GET /s/:token`
  - validate: token exists, not expired, not consumed
  - create browser session and set cookie
  - mark token consumed atomically
  - redirect to `/app`

#### Health endpoint
- `GET /healthz` returns `200`.

### 9.3 Terminal list and selection
- `GET /api/terminals`
  - returns list of available terminals `{ id, label, status, createdAt, source }`
  - only for authenticated sessions
- `POST /api/terminals`
  - creates a new tmux session and adds it to the registry
  - optional body: `{ name?: string }`
- The server maintains an in-memory registry of terminals created or attached by this Termbridge instance.
- The UI can only select terminals from this list; unknown IDs are rejected.

### 9.4 WebSocket terminal endpoint
- Endpoint: `WS /ws/terminal/:terminalId`
- Authentication: valid cookie session required.
- Server validates that `terminalId` exists in the registry for the authenticated session.

#### Protocol (JSON)
Client → Server:
- `input`: `{ "type": "input", "data": "<string>" }`
- `resize` (optional MVP): `{ "type": "resize", "cols": <number>, "rows": <number> }`
- `control`: `{ "type": "control", "key": "ctrl_c"|"esc"|"tab"|"up"|"down"|"left"|"right" }`

Server → Client:
- `output`: `{ "type": "output", "data": "<string>" }`
- `status`: `{ "type": "status", "state": "connected"|"disconnected"|"error", "message"?: "<string>" }`

`packages/shared` must define the protocol and terminal list types and keep them in sync between server and UI.

### 9.5 Terminal backend (tmux)
- tmux is a runtime dependency.
- Behavior:
  - list and track termbridge-managed sessions for selection
  - map `terminalId` to tmux session name and keep raw names server-side
  - create session if missing: `tmux new-session -d -s <sessionName>`
  - send input: either
    - preferred: PTY streaming (true keystrokes) with tmux for persistence, or
    - acceptable MVP: line-based input via `tmux send-keys` and a bottom input bar
  - stream output:
    - preferred: `tmux pipe-pane` to a file/FIFO and tail
    - acceptable MVP: poll `tmux capture-pane -p` and diff to emit new output

MVP acceptance: near-real-time output for typical commands. TUIs must render correctly if keystroke streaming is implemented.

---

## 10) UI requirements (xterm.js)
### Layout
- Main area: xterm viewport.
- Terminal list or picker for selecting a session.
- Bottom: optional input bar for sending a full line.
- Mobile toolbar: minimum buttons for `Ctrl+C`, `Esc`, `Tab`, and arrow keys.

### Behavior
- Stream output into xterm.
- Fetch terminal list, allow switching, and optionally create new sessions.
- Reconnect support: show disconnected state and allow retry.
- Mobile viewport handling: respond to on-screen keyboard changes and call fit logic.

### Tech
- TypeScript.
- xterm + fit addon.
- WebSocket to `/ws/terminal/:terminalId` with cookie authentication.

---

## 11) Security requirements (local-only, public URL)
The tunnel URL is public. Security must not depend on URL secrecy alone.

### One-time token
- Randomness: at least 128 bits.
- Encoding: base64url.
- TTL: 60–120 seconds.
- Single use with atomic consume.
- Store only token hashes server-side (SHA-256).

### Cookie session
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Lax`.
- Cookie contains an opaque session ID only.
- Server-side session store: in-memory is acceptable for MVP.
- TTL: idle timeout 30 minutes; absolute max 8 hours.

### Request hardening
- Rate limit `/s/:token` redemption (per IP).
- Rate limit WebSocket connect attempts (per IP).
- Enforce WebSocket origin checks.
- Add basic CSP for UI routes (no inline scripts).
- Validate `terminalId` against the authenticated session registry; never accept arbitrary tmux session names.

### Local binding
- Local server binds only to `127.0.0.1`.

---

## 12) Tunnel provider requirements (Cloudflare Quick Tunnel)
- Provider: `cloudflared` quick tunnel.
- CLI must:
  - detect `cloudflared` in PATH or provide clear setup instructions
  - start: `cloudflared tunnel --url http://127.0.0.1:<port>`
  - parse the public HTTPS URL from `cloudflared` output
  - stop the tunnel process on exit

Provider interface should be pluggable for future support of ngrok, localtunnel, etc.

---

## 13) Logging and telemetry
- No external telemetry.
- Local logs only:
  - startup steps
  - tunnel URL
  - token redemption success/fail
  - WS connect/disconnect
- Do not log terminal content by default.

---

## 14) Acceptance criteria
- `npx termbridge` works on macOS and Linux (Windows optional for MVP).
- CLI prints a public URL and ASCII QR.
- Scanning QR opens the UI and authenticates via one-time token without manual login.
- Terminal output streams to xterm.
- User can execute at least line-based commands reliably.
- Ctrl+C from UI interrupts a running command.
- UI lists multiple terminals and the user can switch between them.
- Token cannot be redeemed twice; expired tokens are rejected.
- Browser refresh reconnects while the CLI remains running.
- If CLI exits, tunnel closes and the UI cannot interact.

---

## 15) Implementation guidance
- Keep clear module boundaries:
  - orchestration (`cli/src/cli`)
  - HTTP/WS server and auth (`cli/src/server`)
  - tmux adapter (`packages/terminal`)
  - tunnel adapter (`packages/tunnel`)
  - shared types and protocol (`packages/shared`)
  - UI (`cli/ui`)

Recommended interfaces:
- `TunnelProvider.start(localUrl): Promise<{ publicUrl: string }>`
- `TunnelProvider.stop(): Promise<void>`
- `TerminalBackend.createOrAttach(sessionName): Promise<{ sessionId: string }>`
- `TerminalBackend.write(data): void`
- `TerminalBackend.onOutput(cb): unsubscribe`

---

## 16) Open questions (do not block MVP)
- True interactive keystrokes: implement PTY streaming or defer to line-send.
- Default tmux lifecycle: leave running vs kill on exit.
- Session exposure: list only termbridge-created sessions vs all local tmux sessions.
- Bundling `cloudflared` vs requiring preinstall.

---

## 17) Deliverables
- Bun monorepo with a single publishable `cli/` package and internal packages: `terminal`, `tunnel`, `shared`.
- Working `termbridge start` command.
- UI build embedded and served by local server.
- Cloudflare quick tunnel integration.
- README covering prerequisites (tmux, cloudflared), usage, and security notes.
