---
title: "Daytona"
description: "Run Termbridge against Daytona sandboxes for cloud terminals and previews."
path: "sandboxes/daytona"
order: 110
section: "Sandboxes"
meta_title: "Daytona"
meta_description: "Run Termbridge against Daytona sandboxes for cloud terminals and previews."
---

# Daytona

Daytona lets Termbridge run your terminal and preview in a cloud sandbox. Use this when you want a reproducible environment, a cloud preview, or to keep your laptop idle.

## Requirements

- A Daytona API key
- A repository URL the sandbox can clone
- Git credentials if the repo is private

## Quick start

Set the backend to Daytona and provide the repo configuration:

```bash
export TERMBRIDGE_BACKEND=sandbox-daytona
export TERMBRIDGE_DAYTONA_API_KEY=your_key
export TERMBRIDGE_SANDBOX_REPO=https://github.com/you/your-repo.git
export TERMBRIDGE_SANDBOX_BRANCH=main
export TERMBRIDGE_SANDBOX_PATH=your-repo
export TERMBRIDGE_SANDBOX_NAME=termbridge-sandbox
export TERMBRIDGE_SANDBOX_PUBLIC=true
export TERMBRIDGE_SANDBOX_PREVIEW_PORT=5173
export TERMBRIDGE_SANDBOX_DELETE_ON_EXIT=true
```

Then run Termbridge as usual:

```bash
npx termbridge
```

Always set `TERMBRIDGE_SANDBOX_REPO` (or `--sandbox-repo`). When it is missing, Termbridge currently falls back to a built-in default repository that is not publicly accessible, so the sandbox is created and the clone fails ([#2](https://github.com/inline0/termbridge/issues/2)).

## Daytona connection

| Variable | Purpose |
| --- | --- |
| `TERMBRIDGE_DAYTONA_API_KEY` | Your Daytona API key |
| `TERMBRIDGE_DAYTONA_API_URL` | API endpoint (default `https://app.daytona.io/api`) |
| `TERMBRIDGE_DAYTONA_TARGET` | Daytona target region (optional) |

These are passed to the Daytona SDK. When one of them is unset, the SDK falls back to its own `DAYTONA_API_KEY`, `DAYTONA_API_URL` or `DAYTONA_TARGET` variable.

## Direct sandbox mode (no tunnel)

Direct mode runs the Termbridge server inside the sandbox and skips Cloudflare entirely. The share URL is the Daytona preview link to the sandboxed server.

```bash
export TERMBRIDGE_BACKEND=sandbox-daytona
export TERMBRIDGE_SANDBOX_DIRECT=true
export TERMBRIDGE_SANDBOX_SERVER_PORT=8080
```

`TERMBRIDGE_SANDBOX_SERVER_PORT` (or `--port`) defaults to `8080`. Direct mode creates a public sandbox unless you set `TERMBRIDGE_SANDBOX_PUBLIC=false`, and the UI hides the terminal switcher.

You can still enable preview by setting `TERMBRIDGE_SANDBOX_PREVIEW_PORT`; in direct mode it is forwarded as the server `--proxy` port.

## Repository cloning

Termbridge will create a sandbox and clone your repo into the sandbox working directory.

Use these settings:

| Variable | Purpose |
| --- | --- |
| `TERMBRIDGE_SANDBOX_REPO` | Repo URL to clone (always set it, see the quick start) |
| `TERMBRIDGE_SANDBOX_BRANCH` | Branch to check out (optional) |
| `TERMBRIDGE_SANDBOX_PATH` | Path for the repo in the sandbox (optional) |
| `TERMBRIDGE_SANDBOX_NAME` | Sandbox name (optional, defaults to `termbridge-<random hex>`) |

If `TERMBRIDGE_SANDBOX_PATH` is not set, Termbridge derives it from the repo name.

## Private repositories

Provide git credentials when cloning private repos:

```bash
export TERMBRIDGE_SANDBOX_GIT_USERNAME=your_github_username
export TERMBRIDGE_SANDBOX_GIT_TOKEN=your_github_token
```

`TERMBRIDGE_SANDBOX_GIT_PASSWORD` is also supported and overrides the token if set.

## Coding agents

Termbridge can install coding agents inside the sandbox and sync your local auth so they are ready immediately.

See the [Coding agents](/docs/sandboxes/coding-agents) guide for the full setup, automatic mode, and security details.

## Preview mode

To show the preview view, set `TERMBRIDGE_SANDBOX_PREVIEW_PORT` to the port your dev server uses inside the sandbox.

For Vite, make sure you bind to all interfaces:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

Termbridge fetches the Daytona preview link and proxies it through the Termbridge server so the preview loads inside the UI.

## Public vs private sandboxes

| Variable | What it does |
| --- | --- |
| `TERMBRIDGE_SANDBOX_PUBLIC=true` | Creates a public sandbox |
| `TERMBRIDGE_SANDBOX_PUBLIC=false` | Creates a private sandbox |

When the variable is unset, sandboxes are private, except in direct mode, where they are public.

For private sandboxes, Termbridge forwards the preview token automatically when proxying the preview.

## Cleanup and lifecycle

To delete sandboxes when Termbridge exits:

```bash
export TERMBRIDGE_SANDBOX_DELETE_ON_EXIT=true
```

For short-lived or test sandboxes, use a prefix:

```bash
export TERMBRIDGE_SANDBOX_NAME=termbridge-test-$(date +%s)
export TERMBRIDGE_SANDBOX_DELETE_ON_EXIT=true
```

This keeps sandbox usage under control and avoids disk quota issues.

## CLI flags

You can also configure Daytona via flags. A flag takes precedence over the matching environment variable.

| Flag | Environment variable | Purpose |
| --- | --- | --- |
| `--backend sandbox-daytona` | `TERMBRIDGE_BACKEND` | Use the Daytona backend |
| `--sandbox-repo <url>` | `TERMBRIDGE_SANDBOX_REPO` | Repo URL |
| `--sandbox-branch <branch>` | `TERMBRIDGE_SANDBOX_BRANCH` | Branch |
| `--sandbox-path <path>` | `TERMBRIDGE_SANDBOX_PATH` | Repo path in sandbox |
| `--sandbox-name <name>` | `TERMBRIDGE_SANDBOX_NAME` | Sandbox name |
| `--sandbox-preview-port <port>` | `TERMBRIDGE_SANDBOX_PREVIEW_PORT` | Preview port |
| `--sandbox-public` | `TERMBRIDGE_SANDBOX_PUBLIC=true` | Create a public sandbox |
| `--sandbox-direct` | `TERMBRIDGE_SANDBOX_DIRECT=true` | Run the server inside the sandbox (no tunnel) |

There is no flag for a private sandbox; use `TERMBRIDGE_SANDBOX_PUBLIC=false`. The built-in `termbridge --help` output still shows `--daytona-*` names and `--backend daytona`, which are rejected ([#1](https://github.com/inline0/termbridge/issues/1)).

## Troubleshooting

**Preview view is blank**
- Ensure the dev server is running inside the sandbox.
- Use `--host 0.0.0.0` so the preview port is reachable.
- Confirm `TERMBRIDGE_SANDBOX_PREVIEW_PORT` matches the dev server port.

**Sandbox creation fails with quota errors**
- Delete old sandboxes in the Daytona dashboard.
- Use `TERMBRIDGE_SANDBOX_DELETE_ON_EXIT=true` for short-lived sessions.

**Repo clone fails**
- Double-check repo URL, branch, and credentials.
- Ensure the Git token has repo read access.
