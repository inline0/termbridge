# Changelog

## 0.3.17

- Reserve the whole `/__tb/` prefix in proxy mode. A request under `/__tb/`
  that matches no Termbridge route, or uses a method a route does not answer,
  gets `404 not found`, and a WebSocket connection under `/__tb/` outside the
  terminal socket is closed, instead of reaching the dev server.
- Refuse only paths with a `..` segment, literal or percent-encoded, with
  `403 forbidden`. Dots in query strings and file names, such as
  `?range=1..5` or `a..b.txt`, are forwarded to the dev server again.
- The dev server preview guide describes both rules.

## 0.3.16

- Pass the test app repository to the CLI in the Daytona integration tests,
  `test:direct` and the sandbox debug scripts, which stopped with
  `missing sandbox repo` since the Daytona repository became an explicit
  setting. A repository in the test app's `.env` still takes precedence.
- This is the first npm release after 0.3.13 and contains the changes of
  0.3.14 and 0.3.15.

## 0.3.15

- Tagged and released on GitHub only, never published to npm. Its changes ship
  in 0.3.16.
- Point CLI reference links in the README and docs at `/docs/packages/cli`,
  the route the CLI reference page is served from.

## 0.3.14

- Tagged and released on GitHub only, never published to npm. Its changes ship
  in 0.3.16.

- Organize the CLI and its bundled browser UI under `packages/cli` in a pnpm
  workspace with shared dependency catalogs and explicit package boundaries.
- Standardize development on Node.js 26.12.0, pnpm 12.14.0, Oxfmt, Oxlint, and
  TypeScript 7 while preserving Node.js 20+ support for the published CLI.
- Upgrade the Daytona SDK, remove vulnerable legacy tar dependencies, and adapt
  sandbox cleanup to its asynchronous listing API.
- Lock follow-redirects 1.16.2 for the Daytona SDK's HTTP client to resolve
  GHSA-mrwp-f3q8-3g9p.
- Add strict source documentation and workspace checks, consumer tarball tests,
  and CI coverage across supported Node runtime versions.
- Handle asynchronous HTTP failures without unhandled request rejections.
- Close active browser WebSockets before HTTP shutdown and remove all sessions
  owned by a share when `--kill-on-exit` is enabled, including browser-created
  terminals.
- Validate local browser regressions and production dependency audits in CI
  without requiring Cloudflare or sandbox credentials.
- Package direct sandbox deployments with resolved workspace catalogs, preserve
  npm-only packing for installed CLIs, and remove temporary upload archives.
- Declare React type dependencies explicitly so fresh installations pass the
  same strict checks as existing development workspaces.
- Consolidate contributor and agent guidance in `AGENTS.md`.
- Apply the shared inline0 GitHub release title and changelog-link format.
- Expand the dev server preview guide with how the proxy routes requests and
  rewrites headers, the preview iframe's restrictions, `--dev-proxy-url`,
  stable URLs through named tunnels, Daytona tunnel and direct modes, and
  troubleshooting for 404, 502, framing and cookie issues.

## 0.3.13

- Preserve the existing CLI startup, tunnel precedence, and sandbox behavior
  before the workspace modernization.
