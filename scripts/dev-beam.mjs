import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliDir = resolve(rootDir, "cli");
const port = process.env.TERMBRIDGE_DEV_PORT ?? "8787";
const session = process.env.TERMBRIDGE_DEV_SESSION ?? "codex";
const devUiBase = process.env.TERMBRIDGE_DEV_UI ?? "http://127.0.0.1:5173";

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

if (process.env.TERMBRIDGE_SKIP_BUILD !== "1") {
  await runOnce("bun", ["run", "--cwd", cliDir, "build"], { cwd: rootDir });
}

const serverEnv = {
  ...process.env,
  TERMBRIDGE_INSECURE_COOKIE: process.env.TERMBRIDGE_INSECURE_COOKIE ?? "1"
};

const server = spawn(
  process.execPath,
  [resolve(cliDir, "dist/bin.js"), "--session", session, "--port", port, "--no-qr"],
  { cwd: cliDir, env: serverEnv, stdio: ["inherit", "pipe", "pipe"] }
);

let printedDevUrl = false;
const maybePrintDevUrl = (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  if (printedDevUrl) {
    return;
  }

  const match = text.match(/Tunnel URL:\s*(https?:\/\/[^\s]+)/);
  if (!match) {
    return;
  }

  const token = match[1]?.split("/s/")[1];
  if (!token) {
    return;
  }

  printedDevUrl = true;
  const redeemUrl = `${devUiBase}/s/${token}`;
  const appUrl = `${devUiBase}/app`;
  process.stdout.write(`Dev redeem URL: ${redeemUrl}\n`);
  process.stdout.write(`Dev app URL: ${appUrl}\n`);
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
  stdio: "inherit"
});

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
