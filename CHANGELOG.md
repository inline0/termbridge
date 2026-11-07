# Changelog

## 0.3.15

- Point CLI reference links in the README and docs at `/docs/packages/cli`,
  the route the CLI reference page is served from.

## 0.3.14

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
