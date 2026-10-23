# Changelog

## Unreleased

- Organize the CLI and its bundled browser UI under `packages/cli` in a pnpm
  workspace with shared dependency catalogs and explicit package boundaries.
- Standardize development on Node.js 26.12.0, pnpm 12.14.0, Oxfmt, Oxlint, and
  TypeScript 7 while preserving Node.js 20+ support for the published CLI.
- Upgrade the Daytona SDK, remove vulnerable legacy tar dependencies, and adapt
  sandbox cleanup to its asynchronous listing API.
- Add strict source documentation and workspace checks, consumer tarball tests,
  and CI coverage across supported Node runtime versions.
- Handle asynchronous HTTP failures without unhandled request rejections.
- Close active browser WebSockets before HTTP shutdown and remove all sessions
  owned by a share when `--kill-on-exit` is enabled, including browser-created
  terminals.
- Apply the shared inline0 GitHub release title and changelog-link format.

## 0.3.13

- Preserve the existing CLI startup, tunnel precedence, and sandbox behavior
  before the workspace modernization.
