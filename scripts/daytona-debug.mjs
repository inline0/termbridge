import { spawnSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliDist = resolve(rootDir, "cli", "dist", "bin.js");
const testAppDir = resolve(rootDir, "..", "termbridge-test-app");
const envPath = resolve(testAppDir, ".env");

const usage = () => {
  console.log("Usage: bun run sandbox:daytona:debug [--direct] [--agent <name>] [--agents <list>] [--preview-port <port>]");
  console.log("  --direct           Run Termbridge inside the sandbox (no tunnel)");
  console.log("  --agent <name>     Single agent (claude|codex|opencode)");
  console.log("  --agents <list>    Comma/space list of agents (default: claude,codex,opencode)");
  console.log("  --preview-port <p> Override preview port (default: 5173)");
};

const parseEnvFile = (path) => {
  if (!existsSync(path)) {
    return {};
  }

  const contents = readFileSync(path, "utf8");
  const result = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key) {
      result[key] = value;
    }
  }

  return result;
};

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
};

if (args.includes("--help")) {
  usage();
  process.exit(0);
}

if (!existsSync(testAppDir)) {
  console.error(`Missing test app directory at ${testAppDir}`);
  process.exit(1);
}

const build = spawnSync("bun", ["run", "build"], { cwd: rootDir, stdio: "inherit" });
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const daytonaEnv = parseEnvFile(envPath);
const direct = args.includes("--direct");
const agent = getArg("--agent");
const agents = getArg("--agents");
const previewPort = getArg("--preview-port") ?? daytonaEnv.TERMBRIDGE_SANDBOX_PREVIEW_PORT ?? "5173";
const sandboxName = `termbridge-debug-${Date.now()}`;

const env = {
  ...process.env,
  ...daytonaEnv,
  NODE_ENV: "production",
  TERMBRIDGE_BACKEND: "sandbox-daytona",
  TERMBRIDGE_SANDBOX_PREVIEW_PORT: previewPort,
  TERMBRIDGE_SANDBOX_DELETE_ON_EXIT: "true",
  TERMBRIDGE_SANDBOX_NAME: sandboxName
};

if (direct) {
  env.TERMBRIDGE_SANDBOX_DIRECT = "true";
}

if (agent) {
  env.TERMBRIDGE_SANDBOX_AGENTS = agent;
} else if (agents) {
  env.TERMBRIDGE_SANDBOX_AGENTS = agents;
} else {
  env.TERMBRIDGE_SANDBOX_AGENTS = env.TERMBRIDGE_SANDBOX_AGENTS ?? "claude-code,codex,opencode";
}

console.log("Starting Daytona sandbox debug session");
console.log(`- Sandbox: ${sandboxName}`);
console.log(`- Direct mode: ${direct ? "on" : "off"}`);
console.log(`- Agents: ${env.TERMBRIDGE_SANDBOX_AGENTS ?? "(none)"}`);
console.log(`- Preview port: ${env.TERMBRIDGE_SANDBOX_PREVIEW_PORT}`);
console.log(`- Repo: ${env.TERMBRIDGE_SANDBOX_REPO ?? "(from env)"}`);

const child = spawn("node", [cliDist], {
  cwd: testAppDir,
  env,
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
