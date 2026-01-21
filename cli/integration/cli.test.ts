import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import { waitForTerminalText } from "./terminal-utils";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cliDir = resolve(rootDir, "cli");
const distBin = resolve(cliDir, "dist/bin.js");

const commandExists = (name: string) =>
  spawnSync("which", [name], { stdio: "ignore" }).status === 0;

const hasDeps = commandExists("tmux") && commandExists("cloudflared");
const maybeDescribe = hasDeps ? describe : describe.skip;

const resolveNodePath = () => {
  const result = spawnSync("which", ["node"], { encoding: "utf8" });
  if (result.status === 0 && result.stdout.trim()) {
    return result.stdout.trim();
  }

  if (existsSync(process.execPath)) {
    return process.execPath;
  }

  return "node";
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

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, label: string) =>
  new Promise<T>((resolvePromise, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolvePromise(value);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      }
    );
  });

const logStep = (label: string) => {
  if (process.env.TERMBRIDGE_TEST_DEBUG) {
    process.stdout.write(`[cli integration] ${label}\n`);
  }
};

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
    token = redeemUrl.split("/__tb/s/")[1] ?? "";

    if (!localUrl || !redeemUrl || !token) {
      throw new Error("failed to parse cli output");
    }

    const health = await fetch(`${localUrl}/__tb/healthz`);
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
    browser = await withTimeout(chromium.launch(), 20_000, "chromium.launch");
    logStep("browser launched");
    const context = await browser.newContext();
    logStep("context created");
    const page = await context.newPage();
    logStep("page created");
    await page.addInitScript(() => {
      (window as Window & { __TERMbridgeExposeTerminal?: boolean }).__TERMbridgeExposeTerminal =
        true;
    });
    logStep("init script added");
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
    let outputBuffer = "";

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
        if (payload.includes("\"type\":\"output\"")) {
          try {
            const message = JSON.parse(payload) as { type?: string; data?: string };
            if (message.type === "output" && typeof message.data === "string") {
              if (process.env.TERMBRIDGE_TEST_DEBUG) {
                process.stdout.write(
                  `[cli integration] output chunk ${message.data.length} bytes\n`
                );
              }
              outputBuffer += message.data;
            } else {
              outputBuffer += payload;
            }
          } catch {
            outputBuffer += payload;
          }
          if (outputBuffer.includes("termbridge-ui")) {
            resolveOutput?.();
          }
        }
      });
      websocket.on("close", () => {
        rejectStatus?.(new Error("websocket closed"));
      });
    });

    const redeem = await withTimeout(
      fetch(`${localUrl}/__tb/s/${token}`, { redirect: "manual" }),
      10_000,
      "redeem fetch"
    );
    logStep("token redeemed");
    expect(redeem.status).toBe(302);
    const cookieHeader = redeem.headers.get("set-cookie");
    expect(cookieHeader).toBeTruthy();
    const cookiePair = (cookieHeader ?? "").split(";")[0] ?? "";
    const [name, value] = cookiePair.split("=");
    await context.addCookies([{ name, value, url: localUrl }]);
    logStep("cookies added");
    const storedCookies = await context.cookies(localUrl);
    logStep("cookies verified");
    expect(storedCookies.some((cookie) => cookie.name === name && cookie.value === value)).toBe(
      true
    );

    try {
      const [terminalsResponse] = await Promise.all([
        page.waitForResponse((response) => response.url().endsWith("/__tb/api/terminals")),
        page.goto(`${localUrl}/__tb/app`, { waitUntil: "domcontentloaded" })
      ]);
      logStep("page loaded");
      expect(terminalsResponse.status()).toBe(200);

      await page.waitForSelector(".terminal-host .xterm-screen canvas", { timeout: 45_000 });
      logStep("terminal rows ready");

      await Promise.race([
        statusPromise,
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("websocket status timeout")), 10_000)
        )
      ]);
      logStep("websocket status received");
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
    logStep("tmux output sent");

    await Promise.race([
      outputPromise,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("output frame timeout")), 20_000)
      )
    ]);
    logStep("output frame received");

    await waitForTerminalText(page, /termbridge-ui/, 10_000);
    logStep("terminal text confirmed");
  }, 60_000);
});
