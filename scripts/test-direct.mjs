#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const testAppDir = resolve(rootDir, "../termbridge-test-app");
const distBin = resolve(rootDir, "cli/dist/bin.js");

if (!existsSync(testAppDir)) {
  console.error(`Missing test app directory at ${testAppDir}`);
  process.exit(1);
}

if (!existsSync(distBin)) {
  console.error(`Missing CLI build at ${distBin}`);
  console.error("Run: bun run build");
  process.exit(1);
}

const sandboxName = `test-direct-${Date.now()}`;

const env = {
  ...process.env,
  TERMBRIDGE_SANDBOX_DIRECT: "true",
  TERMBRIDGE_SANDBOX_NAME: sandboxName,
  TERMBRIDGE_SANDBOX_DELETE_ON_EXIT: "true",
  TERMBRIDGE_SANDBOX_AGENTS: "claude-code,codex,opencode",
};

console.log("Starting Daytona direct mode test...");
console.log(`- Working dir: ${testAppDir}`);
console.log(`- Sandbox: ${sandboxName}`);
console.log(`- Agents: claude-code, codex, opencode`);
console.log(`- Preview: port 5173 (from .env)`);
console.log("");

const child = spawn("node", [distBin], {
  cwd: testAppDir,
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
