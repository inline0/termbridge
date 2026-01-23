import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import { focusTerminal, waitForTerminalText } from "./terminal-utils";
import { Daytona } from "@daytonaio/sdk";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const cliDir = resolve(rootDir, "cli");
const distBin = resolve(cliDir, "dist/bin.js");
const testAppDir = resolve(rootDir, "../termbridge-test-app");
const envPath = resolve(testAppDir, ".env");

const commandExists = (name: string) =>
  spawnSync("which", [name], { stdio: "ignore" }).status === 0;

const hasCloudflared = commandExists("cloudflared");
const hasClaudeCli = commandExists("claude");
const hasCodexCli = commandExists("codex");
const hasOpenCodeCli = commandExists("opencode");

const parseEnvFile = (path: string) => {
  if (!existsSync(path)) {
    return {};
  }

  const contents = readFileSync(path, "utf8");
  const result: Record<string, string> = {};

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

const daytonaEnv = parseEnvFile(envPath);
const daytonaRepo =
  daytonaEnv.TERMBRIDGE_DAYTONA_REPO ?? "https://github.com/inline0/termbridge-test-app.git";
const requiresGitAuth = daytonaRepo.includes("github.com/inline0/termbridge-test-app");
const hasGitAuth =
  Boolean(daytonaEnv.TERMBRIDGE_DAYTONA_GIT_TOKEN ?? daytonaEnv.TERMBRIDGE_DAYTONA_GIT_PASSWORD) &&
  Boolean(daytonaEnv.TERMBRIDGE_DAYTONA_GIT_USERNAME);
const hasDaytonaConfig =
  (daytonaEnv.TERMBRIDGE_E2E_DAYTONA === "1" || daytonaEnv.TERMBRIDGE_E2E_DAYTONA === "true") &&
  Boolean(daytonaEnv.DAYTONA_API_KEY) &&
  (!requiresGitAuth || hasGitAuth);

const claudeAuthPath = resolve(homedir(), ".claude.json");
const codexAuthPath = resolve(homedir(), ".codex", "auth.json");
const openCodeAuthPath = resolve(homedir(), ".config", "opencode", "opencode.json");
const hasAgentAuth =
  existsSync(claudeAuthPath) && existsSync(codexAuthPath) && existsSync(openCodeAuthPath);
const hasAgentClis = hasClaudeCli && hasCodexCli && hasOpenCodeCli;
const shouldTestAgents = hasCloudflared && hasDaytonaConfig && hasAgentClis && hasAgentAuth;

const maybeDescribe = hasCloudflared && hasDaytonaConfig ? describe : describe.skip;

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
    process.stdout.write(`[daytona integration] ${label}\n`);
  }
};

const sandboxPrefix = "termbridge-test-";

const createDaytonaClient = () => {
  const apiKey = process.env.DAYTONA_API_KEY ?? daytonaEnv.DAYTONA_API_KEY;
  const apiUrl = process.env.DAYTONA_API_URL ?? daytonaEnv.DAYTONA_API_URL;
  const target = process.env.DAYTONA_TARGET ?? daytonaEnv.DAYTONA_TARGET;

  if (!apiKey) {
    throw new Error("DAYTONA_API_KEY is required for cleanup");
  }

  return new Daytona({ apiKey, apiUrl, target });
};

const cleanupSandboxes = async () => {
  const daytona = createDaytonaClient();
  let page = 1;
  let totalPages = 1;
  let deleted = 0;

  while (page <= totalPages) {
    const result = await daytona.list(undefined, page, 100);
    totalPages = result.totalPages || 1;

    for (const sandbox of result.items) {
      if (!sandbox.name || !sandbox.name.startsWith(sandboxPrefix)) {
        continue;
      }
      const label = sandbox.name || sandbox.id;
      await daytona.delete(sandbox);
      deleted += 1;
      logStep(`deleted sandbox ${label}`);
    }

    page += 1;
  }

  logStep(`cleanup removed ${deleted} sandboxes`);
};

const waitForSandboxByName = async (name: string, timeoutMs = 60_000) => {
  const daytona = createDaytonaClient();
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      return await daytona.get(name);
    } catch (error) {
      lastError = error;
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000));
    }
  }

  throw new Error(
    `sandbox ${name} not found within ${timeoutMs}ms${lastError ? `: ${String(lastError)}` : ""}`
  );
};

const getSandboxPathPrefix = async (
  sandbox: Awaited<ReturnType<typeof waitForSandboxByName>>
) => {
  const npmBin = await sandbox.process.executeCommand("npm bin -g");
  const binPath = npmBin.exitCode === 0 ? npmBin.result.trim() : "";
  return binPath ? `PATH="${binPath}:$PATH"` : "";
};

const runSandboxCommand = async (
  sandbox: Awaited<ReturnType<typeof waitForSandboxByName>>,
  command: string,
  label: string,
  timeoutSec = 120,
  pathPrefix = ""
) => {
  logStep(`run ${label}`);
  const prefixedCommand = pathPrefix ? `${pathPrefix} ${command}` : command;
  const result = await withTimeout(
    sandbox.process.executeCommand(prefixedCommand, undefined, undefined, timeoutSec),
    (timeoutSec + 10) * 1000,
    label
  );
  if (result.exitCode !== 0) {
    const output = `${result.result ?? ""}`.slice(0, 400);
    throw new Error(`${label} failed (${result.exitCode}): ${output}`);
  }
  return `${result.result ?? ""}`;
};

const clickSheetOption = async (page: Page, name: string) => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const option = page.getByRole("button", { name });
    try {
      await option.scrollIntoViewIfNeeded();
      await option.click({ force: true });
      return;
    } catch (error) {
      if (attempt >= 5) {
        throw error;
      }
      await page.waitForTimeout(250);
    }
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

maybeDescribe("daytona integration", () => {
  let child: ChildProcessWithoutNullStreams | null = null;
  let localUrl = "";
  let token = "";
  let browser: Browser | null = null;
  let sandboxName = "";

  beforeAll(async () => {
    if (!existsSync(testAppDir)) {
      throw new Error(`missing test app directory at ${testAppDir}`);
    }

    await cleanupSandboxes();

    buildCli();

    const output = { stdout: "", stderr: "" };
    const sessionName = `termbridge-daytona-${Date.now()}`;
    sandboxName = `${sandboxPrefix}${Date.now()}`;
    const env = {
      ...process.env,
      NODE_ENV: "production",
      TERMBRIDGE_DAYTONA_DELETE_ON_EXIT: "true",
      TERMBRIDGE_DAYTONA_NAME: sandboxName,
      ...(shouldTestAgents
        ? {
            TERMBRIDGE_DAYTONA_AGENTS: "claude,codex,opencode"
          }
        : {})
    };
    const nodePath = resolveNodePath();

    const started = spawn(
      nodePath,
      [distBin, "--no-qr", "--kill-on-exit", "--session", sessionName],
      {
        cwd: testAppDir,
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
      60_000
    );
    localUrl = localMatch[1] ?? "";

    const tunnelMatch = await waitForMatch(
      started,
      output,
      /Tunnel URL:\s*(https:\/\/[^\s]+)/,
      90_000
    );
    const redeemUrl = tunnelMatch[1] ?? "";
    token = redeemUrl.split("/__tb/s/")[1] ?? "";

    if (!localUrl || !token) {
      throw new Error("failed to parse cli output");
    }

    const health = await fetch(`${localUrl}/__tb/healthz`);
    if (!health.ok) {
      throw new Error(`health check failed: ${health.status}`);
    }
  }, 180_000);

  afterAll(async () => {
    await stopCli(child);
    if (browser) {
      await browser.close();
    }
  });

  afterEach(async () => {
    if (!shouldTestAgents) {
      await cleanupSandboxes();
    }
  });

  it(
    "renders the Vite preview in the UI",
    async () => {
      browser = await withTimeout(chromium.launch(), 30_000, "chromium.launch");
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
      });

      let devProxyUrl: string | null = null;
      let previewStatus: number | null = null;
      let previewSnippet = "";

      const redeem = await withTimeout(
        fetch(`${localUrl}/__tb/s/${token}`, { redirect: "manual" }),
        15_000,
        "redeem fetch"
      );
      logStep("token redeemed");
      expect(redeem.status).toBe(302);
      const cookieHeader = redeem.headers.get("set-cookie");
      expect(cookieHeader).toBeTruthy();
      const cookiePair = (cookieHeader ?? "").split(";")[0] ?? "";
      const [name, value] = cookiePair.split("=");
      await context.addCookies([{ name, value, url: localUrl }]);

      try {
        const [terminalsResponse] = await Promise.all([
          page.waitForResponse((response) => response.url().endsWith("/__tb/api/terminals")),
          page.goto(`${localUrl}/__tb/app`, { waitUntil: "domcontentloaded" })
        ]);
        logStep("page loaded");
        expect(terminalsResponse.status()).toBe(200);

        await page.waitForSelector(".terminal-host .xterm-screen canvas", { timeout: 60_000 });
        logStep("terminal rows ready");

        await page.waitForSelector(
          '[data-testid="connection-status"][data-state="connected"]',
          { timeout: 30_000 }
        );
        logStep("connection status ready");
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

      await focusTerminal(page);
      await page.keyboard.type(
        "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
      );
      await page.keyboard.press("Enter");
      logStep("vite dev server command sent");

      await waitForTerminalText(page, /(Local|Network):\s+http:\/\/.*5173/, 180_000);
      logStep("vite dev server ready");

      try {
        const configResponse = await fetch(`${localUrl}/__tb/api/config`, {
          headers: { cookie: cookiePair }
        });
        if (configResponse.ok) {
          const configPayload = (await configResponse.json()) as {
            devProxyUrl: string | null;
          };
          devProxyUrl = configPayload.devProxyUrl ?? null;
          logStep(`dev proxy url: ${devProxyUrl ?? "null"}`);
        } else {
          logStep(`config response status: ${configResponse.status}`);
        }

        const previewResponse = await fetch(`${localUrl}/`, {
          headers: { cookie: cookiePair }
        });
        previewStatus = previewResponse.status;
        const text = await previewResponse.text();
        previewSnippet = text.slice(0, 400);
        logStep(`preview response status: ${previewStatus}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logStep(`preview check failed: ${message}`);
      }

      await clickSheetOption(page, "Views");
      await clickSheetOption(page, "Switch to Preview");
      logStep("preview view selected");

      try {
        const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');
        const maybeProceed = previewFrame.getByRole("button", {
          name: /continue|proceed|open/i
        });
        if (
          await maybeProceed
            .isVisible({ timeout: 5_000 })
            .catch(() => false)
        ) {
          await maybeProceed.click();
        }

        await previewFrame
          .getByRole("heading", { name: "Vite + React" })
          .waitFor({ timeout: 120_000 });
        logStep("preview confirmed");
      } catch (error) {
        let previewBodyText = "";
        let previewHtmlSnippet = "";
        try {
          const iframeHandle = await page.locator('[data-testid="preview-iframe"]').elementHandle();
          const frame = iframeHandle ? await iframeHandle.contentFrame() : null;
          if (frame) {
            previewBodyText = await frame.evaluate(
              () => document.body?.innerText?.slice(0, 400) ?? ""
            );
            previewHtmlSnippet = await frame.evaluate(
              () => document.body?.innerHTML?.slice(0, 400) ?? ""
            );
          }
        } catch {}

        const details = [
          pageErrors.length > 0 ? `page errors:\n${pageErrors.join("\n")}` : "",
          consoleErrors.length > 0 ? `console errors:\n${consoleErrors.join("\n")}` : "",
          devProxyUrl ? `dev proxy url:\n${devProxyUrl}` : "",
          previewStatus !== null ? `preview status:\n${previewStatus}` : "",
          previewSnippet ? `preview body snippet:\n${previewSnippet}` : "",
          previewBodyText ? `preview frame text:\n${previewBodyText}` : "",
          previewHtmlSnippet ? `preview frame html:\n${previewHtmlSnippet}` : "",
          responseErrors.length > 0 ? `response errors:\n${responseErrors.join("\n")}` : ""
        ]
          .filter(Boolean)
          .join("\n");
        const message = error instanceof Error ? error.message : String(error);
        throw new Error([message, details].filter(Boolean).join("\n"));
      }
    },
    240_000
  );

  const maybeAgentIt = shouldTestAgents ? it : it.skip;
  maybeAgentIt(
    "runs coding agent CLIs in the sandbox with synced auth",
    async () => {
      const sandbox = await waitForSandboxByName(sandboxName, 120_000);
      const pathPrefix = await getSandboxPathPrefix(sandbox);
      const availability = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v claude && ${pathPrefix ? `${pathPrefix} ` : ""}command -v codex && ${pathPrefix ? `${pathPrefix} ` : ""}command -v opencode`
      );
      if (availability.exitCode !== 0) {
        logStep("agent CLIs not available in sandbox; skipping test");
        return;
      }

      const claudeOutput = await runSandboxCommand(
        sandbox,
        'claude -p "Respond with exactly OK." --no-session-persistence',
        "claude",
        180,
        pathPrefix
      );
      expect(claudeOutput).toMatch(/ok/i);

      const codexOutput = await runSandboxCommand(
        sandbox,
        'codex exec --full-auto "Respond with exactly OK."',
        "codex",
        180,
        pathPrefix
      );
      expect(codexOutput).toMatch(/ok/i);

      const opencodeOutput = await runSandboxCommand(
        sandbox,
        'opencode run "Respond with exactly OK."',
        "opencode",
        180,
        pathPrefix
      );
      expect(opencodeOutput).toMatch(/ok/i);
    },
    300_000
  );
});
