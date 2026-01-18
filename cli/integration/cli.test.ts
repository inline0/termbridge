import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket } from "ws";
import type { TerminalServerMessage } from "@termbridge/shared";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cliDir = resolve(rootDir, "cli");
const distBin = resolve(cliDir, "dist/bin.js");

const commandExists = (name: string) =>
  spawnSync("which", [name], { stdio: "ignore" }).status === 0;

const hasDeps = commandExists("tmux") && commandExists("cloudflared");
const maybeDescribe = hasDeps ? describe : describe.skip;

const resolveNodePath = () => {
  if (existsSync(process.execPath)) {
    return process.execPath;
  }

  const result = spawnSync("which", ["node"], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "node";
};

const buildCli = () => {
  const result = spawnSync("bun", ["run", "build"], { cwd: rootDir, stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error("cli build failed");
  }
};

const waitForMatch = (
  child: ChildProcessWithoutNullStreams,
  output: { stdout: string; stderr: string },
  regex: RegExp,
  timeoutMs: number
) =>
  new Promise<RegExpMatchArray>((resolvePromise, reject) => {
    const deadline = Date.now() + timeoutMs;

    const check = () => {
      const match = output.stdout.match(regex) ?? output.stderr.match(regex);

      if (match) {
        cleanup();
        resolvePromise(match);
        return;
      }

      if (Date.now() > deadline) {
        cleanup();
        const summary = [
          `timeout waiting for ${regex.source}`,
          output.stdout ? `stdout:\n${output.stdout}` : "",
          output.stderr ? `stderr:\n${output.stderr}` : ""
        ]
          .filter(Boolean)
          .join("\n");
        reject(new Error(summary));
      }
    };

    const handleExit = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      const summary = [
        `cli exited (${code ?? "unknown"}) ${signal ?? ""}`.trim(),
        output.stdout ? `stdout:\n${output.stdout}` : "",
        output.stderr ? `stderr:\n${output.stderr}` : ""
      ]
        .filter(Boolean)
        .join("\n");
      reject(new Error(summary));
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      clearInterval(intervalId);
      child.off("exit", handleExit);
      child.off("error", handleError);
    };

    const intervalId = setInterval(check, 50);
    child.once("exit", handleExit);
    child.once("error", handleError);
    check();
  });

const waitForWsMessage = (
  socket: WebSocket,
  predicate: (message: TerminalServerMessage) => boolean,
  timeoutMs: number
) =>
  new Promise<TerminalServerMessage>((resolvePromise, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("timeout waiting for websocket message"));
    }, timeoutMs);

    const handleMessage = (payload: WebSocket.RawData) => {
      const text = typeof payload === "string" ? payload : payload.toString();

      try {
        const message = JSON.parse(text) as TerminalServerMessage;

        if (predicate(message)) {
          cleanup();
          resolvePromise(message);
        }
      } catch {
        return;
      }
    };

    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const handleClose = () => {
      cleanup();
      reject(new Error("websocket closed"));
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      socket.off("message", handleMessage);
      socket.off("error", handleError);
      socket.off("close", handleClose);
    };

    socket.on("message", handleMessage);
    socket.on("error", handleError);
    socket.on("close", handleClose);
  });

const stopCli = async (child: ChildProcessWithoutNullStreams | null) => {
  if (!child) {
    return;
  }

  if (child.exitCode !== null) {
    return;
  }

  await new Promise<void>((resolvePromise) => {
    const timeoutId = setTimeout(() => {
      child.kill("SIGKILL");
      resolvePromise();
    }, 10_000);

    child.once("exit", () => {
      clearTimeout(timeoutId);
      resolvePromise();
    });

    child.kill("SIGTERM");
  });
};

maybeDescribe("cli integration", () => {
  let child: ChildProcessWithoutNullStreams | null = null;
  let localUrl = "";
  let token = "";

  beforeAll(async () => {
    buildCli();

    const output = { stdout: "", stderr: "" };
    const sessionName = `termbridge-test-${Date.now()}`;
    const env = { ...process.env, NODE_ENV: "production" };
    const nodePath = resolveNodePath();

    const started = spawn(
      nodePath,
      [distBin, "--no-qr", "--kill-on-exit", "--session", sessionName],
      {
        cwd: cliDir,
        env,
        stdio: ["pipe", "pipe", "pipe"]
      }
    ) as ChildProcessWithoutNullStreams;

    child = started;

    started.stdout.on("data", (data) => {
      output.stdout += data.toString();
    });

    started.stderr.on("data", (data) => {
      output.stderr += data.toString();
    });

    const localMatch = await waitForMatch(
      started,
      output,
      /Local server:\s*(http:\/\/[^\s]+)/,
      30_000
    );
    localUrl = localMatch[1] ?? "";

    const tunnelMatch = await waitForMatch(
      started,
      output,
      /Tunnel URL:\s*(https:\/\/[^\s]+)/,
      45_000
    );
    const tunnelUrl = tunnelMatch[1] ?? "";
    token = tunnelUrl.split("/s/")[1] ?? "";

    if (!localUrl || !token) {
      throw new Error("failed to parse cli output");
    }
  }, 90_000);

  afterAll(async () => {
    await stopCli(child);
  });

  it("serves terminals and streams output", async () => {
    const redeem = await fetch(`${localUrl}/s/${token}`, { redirect: "manual" });
    expect(redeem.status).toBe(302);

    const cookieHeader = redeem.headers.get("set-cookie");
    expect(cookieHeader).toBeTruthy();
    const cookie = (cookieHeader ?? "").split(";")[0];

    const listResponse = await fetch(`${localUrl}/api/terminals`, {
      headers: { Cookie: cookie }
    });

    expect(listResponse.ok).toBe(true);
    const listJson = (await listResponse.json()) as { terminals: { id: string }[] };
    expect(listJson.terminals.length).toBeGreaterThan(0);

    const terminalId = listJson.terminals[0]?.id;
    expect(terminalId).toBeTruthy();

    const wsUrl = `${localUrl.replace("http://", "ws://")}/ws/terminal/${terminalId}`;
    const socket = new WebSocket(wsUrl, { headers: { Cookie: cookie } });

    await waitForWsMessage(
      socket,
      (message) => message.type === "status" && message.state === "connected",
      10_000
    );

    socket.send(JSON.stringify({ type: "input", data: "echo termbridge-test\n" }));

    await waitForWsMessage(
      socket,
      (message) =>
        message.type === "output" && typeof message.data === "string" && message.data.includes("termbridge-test"),
      15_000
    );

    socket.close();
  }, 30_000);
});
