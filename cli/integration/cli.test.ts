import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";

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
  let redeemUrl = "";
  let token = "";
  let sessionName = "";
  let browser: Browser | null = null;

  beforeAll(async () => {
    buildCli();

    const output = { stdout: "", stderr: "" };
    sessionName = `termbridge-test-${Date.now()}`;
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
    redeemUrl = tunnelMatch[1] ?? "";
    token = redeemUrl.split("/s/")[1] ?? "";

    if (!localUrl || !redeemUrl || !token) {
      throw new Error("failed to parse cli output");
    }

    const health = await fetch(`${localUrl}/healthz`);
    if (!health.ok) {
      throw new Error(`health check failed: ${health.status}`);
    }
  }, 90_000);

  afterAll(async () => {
    await stopCli(child);
    if (browser) {
      await browser.close();
    }
  });

  it("renders tmux output in the UI", async () => {
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const responseErrors: string[] = [];
    let websocketUrl = "";
    let resolveStatus: (() => void) | null = null;
    let rejectStatus: ((reason: Error) => void) | null = null;
    const statusPromise = new Promise<void>((resolvePromise, reject) => {
      resolveStatus = resolvePromise;
      rejectStatus = reject;
    });
    let resolveOutput: (() => void) | null = null;
    const outputPromise = new Promise<void>((resolvePromise) => {
      resolveOutput = resolvePromise;
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        responseErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    page.on("websocket", (websocket) => {
      websocketUrl = websocket.url();
      websocket.on("framereceived", (frame) => {
        const payload = typeof frame.payload === "string" ? frame.payload : frame.payload.toString();
        if (payload.includes("\"status\"") && payload.includes("connected")) {
          resolveStatus?.();
        }
        if (payload.includes("\"type\":\"output\"") && payload.includes("termbridge-ui")) {
          resolveOutput?.();
        }
      });
      websocket.on("close", () => {
        rejectStatus?.(new Error("websocket closed"));
      });
    });

    const redeem = await fetch(`${localUrl}/s/${token}`, { redirect: "manual" });
    expect(redeem.status).toBe(302);
    const cookieHeader = redeem.headers.get("set-cookie");
    expect(cookieHeader).toBeTruthy();
    const cookiePair = (cookieHeader ?? "").split(";")[0] ?? "";
    const [name, value] = cookiePair.split("=");
    await context.addCookies([{ name, value, url: localUrl }]);
    const storedCookies = await context.cookies(localUrl);
    expect(storedCookies.some((cookie) => cookie.name === name && cookie.value === value)).toBe(
      true
    );

    try {
      const [terminalsResponse] = await Promise.all([
        page.waitForResponse((response) => response.url().endsWith("/api/terminals")),
        page.goto(`${localUrl}/app`, { waitUntil: "domcontentloaded" })
      ]);
      expect(terminalsResponse.status()).toBe(200);

      await page.waitForSelector(".terminal-host .xterm-rows", { timeout: 45_000 });

      await Promise.race([
        statusPromise,
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("websocket status timeout")), 10_000)
        )
      ]);
    } catch (error) {
      const statusText = await page
        .locator(".terminal-status")
        .textContent()
        .catch(() => null);
      const details = [
        pageErrors.length > 0 ? `page errors:\n${pageErrors.join("\n")}` : "",
        consoleErrors.length > 0 ? `console errors:\n${consoleErrors.join("\n")}` : "",
        responseErrors.length > 0 ? `response errors:\n${responseErrors.join("\n")}` : "",
        websocketUrl ? `websocket url:\n${websocketUrl}` : "",
        statusText ? `terminal status:\n${statusText}` : ""
      ]
        .filter(Boolean)
        .join("\n");
      const message = error instanceof Error ? error.message : String(error);
      throw new Error([message, details].filter(Boolean).join("\n"));
    }

    const sendResult = spawnSync("tmux", ["send-keys", "-t", sessionName, "-l", "echo termbridge-ui"]);
    if (sendResult.status !== 0) {
      throw new Error("tmux send-keys failed");
    }
    spawnSync("tmux", ["send-keys", "-t", sessionName, "C-m"]);

    await Promise.race([
      outputPromise,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("output frame timeout")), 20_000)
      )
    ]);
  }, 60_000);
});
