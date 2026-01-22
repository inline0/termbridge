import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliDir = resolve(rootDir, "cli");
const port = process.env.TERMBRIDGE_DEV_PORT ?? "8787";
const session = process.env.TERMBRIDGE_DEV_SESSION ?? "codex";
const proxyPort = process.env.TERMBRIDGE_PROXY_PORT;
const devUiOverride = process.env.TERMBRIDGE_DEV_UI;
let devUiOrigin = devUiOverride ? new URL(devUiOverride).origin : "";
let token = "";
let printedDevUrls = false;

const runOnce = (command, args, options = {}) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });

await runOnce("node", [resolve(rootDir, "scripts/clear-dev-cache.mjs")], { cwd: rootDir });

if (process.env.TERMBRIDGE_SKIP_BUILD !== "1") {
  await runOnce("bun", ["run", "--cwd", cliDir, "build"], { cwd: rootDir });
}

const serverEnv = {
  ...process.env,
  TERMBRIDGE_INSECURE_COOKIE: process.env.TERMBRIDGE_INSECURE_COOKIE ?? "1"
};

const serverArgs = [resolve(cliDir, "dist/bin.js"), "--session", session, "--port", port, "--no-qr"];
if (proxyPort) {
  serverArgs.push("--proxy", proxyPort);
  serverArgs.push("--dev-proxy-url", `http://localhost:${proxyPort}`);
}

const server = spawn(
  process.execPath,
  serverArgs,
  { cwd: cliDir, env: serverEnv, stdio: ["inherit", "pipe", "pipe"] }
);

const maybePrintDevUrls = () => {
  if (printedDevUrls || !devUiOrigin || !token) {
    return;
  }

  printedDevUrls = true;
  const redeemUrl = `${devUiOrigin}/__tb/s/${token}`;
  const appUrl = `${devUiOrigin}/__tb/app`;
  process.stdout.write(`Dev redeem URL: ${redeemUrl}\n`);
  process.stdout.write(`Dev app URL: ${appUrl}\n`);
};

const maybePrintDevUrl = (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  const match = text.match(/Tunnel URL:\s*(https?:\/\/[^\s]+)/);
  if (!match) {
    return;
  }

  const nextToken = match[1]?.split("/__tb/s/")[1];
  if (!nextToken) {
    return;
  }

  token = nextToken;
  maybePrintDevUrls();
};

server.stdout.on("data", maybePrintDevUrl);
server.stderr.on("data", (chunk) => process.stderr.write(chunk.toString()));

const viteEnv = {
  ...process.env,
  TERMBRIDGE_DEV_PROXY: `http://127.0.0.1:${port}`
};
const vite = spawn("bun", ["run", "--cwd", cliDir, "ui:dev"], {
  cwd: rootDir,
  env: viteEnv,
  stdio: ["inherit", "pipe", "pipe"]
});

vite.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  if (devUiOrigin) {
    return;
  }

  const match = text.match(/Local:\s*(https?:\/\/[^\s]+)/);
  if (!match) {
    return;
  }

  try {
    devUiOrigin = new URL(match[1]).origin;
  } catch {
    return;
  }

  maybePrintDevUrls();
});

vite.stderr.on("data", (chunk) => process.stderr.write(chunk.toString()));

const shutdown = () => {
  if (server.exitCode === null) {
    server.kill("SIGTERM");
  }
  if (vite.exitCode === null) {
    vite.kill("SIGTERM");
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.on("exit", (code) => {
  if (code !== null && code !== 0) {
    process.exitCode = code;
  }
  shutdown();
});

vite.on("exit", (code) => {
  if (code !== null && code !== 0) {
    process.exitCode = code;
  }
  shutdown();
});
