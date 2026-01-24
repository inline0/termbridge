import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import {
  redeemShareUrl,
  sendTerminalInputAndWait,
  waitForTerminalConnected,
  waitForTerminalText,
  waitForLocatorText
} from "./terminal-utils";
import { buildUrl, parseShareUrl } from "./share-utils";
import {
  resolveRepoRoot,
  resolveNodePath,
  commandExists,
  buildCli as buildCliUtil,
  logStep as logStepUtil,
  waitForMatch as waitForMatchUtil,
  withTimeout,
  stopCli,
  clickSheetOption,
  resolveCliCommand
} from "./cli-test-utils";
import {
  getSandboxPathPrefix,
  runSandboxCommand as runSandboxCommandUtil,
  runSandboxCommandViaPty
} from "./sandbox-utils";
import { Daytona } from "@daytonaio/sdk";

const rootDir = resolveRepoRoot();
const cliDir = resolve(rootDir, "cli");
const distBin = resolve(cliDir, "dist/bin.js");
const testAppDir = resolve(rootDir, "../termbridge-test-app");
const envPath = resolve(testAppDir, ".env");

const buildCli = () => buildCliUtil(rootDir);
const logStep = (label: string) => logStepUtil("daytona integration", label);
const daytonaFailPatterns = [/Daytona: sandbox start failed/i];

const _hasCloudflared = commandExists("cloudflared");
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
  daytonaEnv.TERMBRIDGE_SANDBOX_REPO ?? "https://github.com/inline0/termbridge-test-app.git";
const requiresGitAuth = daytonaRepo.includes("github.com/inline0/termbridge-test-app");
const hasGitAuth =
  Boolean(daytonaEnv.TERMBRIDGE_SANDBOX_GIT_TOKEN ?? daytonaEnv.TERMBRIDGE_SANDBOX_GIT_PASSWORD) &&
  Boolean(daytonaEnv.TERMBRIDGE_SANDBOX_GIT_USERNAME);
const hasDaytonaConfig =
  (daytonaEnv.TERMBRIDGE_E2E_DAYTONA === "1" || daytonaEnv.TERMBRIDGE_E2E_DAYTONA === "true") &&
  Boolean(daytonaEnv.TERMBRIDGE_DAYTONA_API_KEY) &&
  (!requiresGitAuth || hasGitAuth);

if (process.env.TERMBRIDGE_TEST_DEBUG) {
  const envFileExists = existsSync(envPath);
  const e2eFlag = daytonaEnv.TERMBRIDGE_E2E_DAYTONA ?? "(unset)";
  process.stdout.write(
    `[daytona integration] envPath=${envPath} exists=${envFileExists} e2e=${e2eFlag} requiresGitAuth=${requiresGitAuth} hasGitAuth=${hasGitAuth} hasDaytonaConfig=${hasDaytonaConfig}\n`
  );
}

// Auth file paths that termbridge actually syncs to sandbox
const claudeAuthPath = resolve(homedir(), ".claude", ".credentials.json");
const codexAuthPath = resolve(homedir(), ".codex", "auth.json");
// OpenCode uses free models and doesn't require auth
const hasAgentAuth = existsSync(claudeAuthPath) && existsSync(codexAuthPath);
const hasAgentClis = hasClaudeCli && hasCodexCli && hasOpenCodeCli;
const shouldTestAgents = hasDaytonaConfig && hasAgentClis && hasAgentAuth;

const describeDaytonaDirect = describe.sequential;
const describeDaytonaTunnel = describe.sequential;

const waitForMatch = (
  child: ChildProcessWithoutNullStreams,
  output: { stdout: string; stderr: string },
  regex: RegExp,
  timeoutMs: number
) => waitForMatchUtil(child, output, regex, timeoutMs, daytonaFailPatterns);


const sandboxPrefix = "termbridge-test-";

const createDaytonaClient = () => {
  const apiKey = process.env.TERMBRIDGE_DAYTONA_API_KEY ?? daytonaEnv.TERMBRIDGE_DAYTONA_API_KEY;
  const apiUrl = process.env.TERMBRIDGE_DAYTONA_API_URL ?? daytonaEnv.TERMBRIDGE_DAYTONA_API_URL;
  const target = process.env.TERMBRIDGE_DAYTONA_TARGET ?? daytonaEnv.TERMBRIDGE_DAYTONA_TARGET;

  if (!apiKey) {
    throw new Error("TERMBRIDGE_DAYTONA_API_KEY is required for cleanup");
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
      let attempt = 0;
      while (attempt < 3) {
        attempt += 1;
        try {
          await daytona.delete(sandbox);
          deleted += 1;
          logStep(`deleted sandbox ${label}`);
          break;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (/state change in progress/i.test(message)) {
            if (attempt >= 3) {
              logStep(`skip delete ${label} (${message})`);
              break;
            }
            await new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000));
            continue;
          }
          throw error;
        }
      }
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

const runSandboxCommand = async (
  sandbox: Awaited<ReturnType<typeof waitForSandboxByName>>,
  command: string,
  label: string,
  timeoutSec = 120,
  pathPrefix = ""
) => runSandboxCommandUtil(sandbox, command, label, timeoutSec, pathPrefix, logStep);

describeDaytonaTunnel("daytona integration (tunnel)", () => {
  let child: ChildProcessWithoutNullStreams | null = null;
  let localUrl = "";
  let shareUrl = "";
  let publicBase: URL | null = null;
  let browser: Browser | null = null;
  let sandboxName = "";
  const cliOutput = { stdout: "", stderr: "" };

  beforeAll(async () => {
    if (!existsSync(testAppDir)) {
      throw new Error(`missing test app directory at ${testAppDir}`);
    }

    await cleanupSandboxes();

    buildCli();

    const output = cliOutput;
    const sessionName = `termbridge-daytona-${Date.now()}`;
    sandboxName = `${sandboxPrefix}${Date.now()}`;
    const env = {
      ...process.env,
      NODE_ENV: "production",
      TERMBRIDGE_BACKEND: "sandbox-daytona",
      TERMBRIDGE_SANDBOX_DELETE_ON_EXIT: "true",
      TERMBRIDGE_SANDBOX_NAME: sandboxName,
      ...(shouldTestAgents
        ? {
            TERMBRIDGE_SANDBOX_AGENTS: "claude-code,codex,opencode"
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
    shareUrl = tunnelMatch[1] ?? "";
    const parsedShare = parseShareUrl(shareUrl);
    publicBase = parsedShare.baseUrl;

    if (!localUrl || !shareUrl || !publicBase) {
      throw new Error("failed to parse cli output");
    }

    const logAgentOutput = () => {
      const agentLogs = output.stdout.split("\n").filter((line) => /agent|daytona.*install|npm|prefix/i.test(line));
      if (agentLogs.length > 0) {
        logStep(`CLI agent logs:\n${agentLogs.join("\n")}`);
      } else {
        logStep("CLI agent logs: (none found)");
      }
    };
    logAgentOutput();

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
    await cleanupSandboxes();
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

      const redeemResult = await redeemShareUrl(context, shareUrl, {
        fallbackBaseUrl: new URL(localUrl),
        log: logStep
      });
      publicBase = redeemResult.baseUrl;
      const sessionCookie = redeemResult.sessionCookie;
      logStep("token redeemed");
      if (!sessionCookie) {
        throw new Error("missing session cookie");
      }

      try {
        const [terminalsResponse] = await Promise.all([
          page.waitForResponse((response) => response.url().endsWith("/__tb/api/terminals")),
          page.goto(buildUrl(publicBase, "__tb/app"), { waitUntil: "domcontentloaded" })
        ]);
        logStep("page loaded");
        expect(terminalsResponse.status()).toBe(200);

        await waitForTerminalConnected(page, 60_000);
        logStep("terminal connected");
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

      await sendTerminalInputAndWait(page, "printf '__tb_ready__'", /__tb_ready__/, 30_000);
      logStep("terminal input ready");

      await page.keyboard.type(
        "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
      );
      await page.keyboard.press("Enter");
      logStep("vite dev server command sent");

      await waitForTerminalText(page, /(Local|Network):\s+http:\/\/.*5173/, 180_000);
      logStep("vite dev server ready");

      try {
        const configResponse = await fetch(buildUrl(publicBase, "__tb/api/config"), {
          headers: { cookie: sessionCookie }
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

        const previewResponse = await fetch(publicBase.toString(), {
          headers: { cookie: sessionCookie }
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

        const countButton = previewFrame.getByRole("button", { name: /count is/i });
        await countButton.waitFor({ timeout: 30_000 });
        const initialText = await countButton.textContent();
        const initialCount = Number.parseInt(initialText?.match(/\d+/)?.[0] ?? "0", 10);
        await countButton.click();
        await waitForLocatorText(countButton, `count is ${initialCount + 1}`, 5_000);
        logStep("preview counter interaction confirmed");
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

  it(
    "runs coding agent CLIs in the sandbox with synced auth",
    async () => {
      const agentLogs = cliOutput.stdout.split("\n").filter((line) => /agent|daytona.*install|npm|prefix|home/i.test(line));
      logStep(`CLI agent logs at test time:\n${agentLogs.join("\n") || "(none)"}`);

      const sandbox = await waitForSandboxByName(sandboxName, 120_000);
      const pathPrefix = await getSandboxPathPrefix(sandbox);
      logStep(`path prefix: ${pathPrefix}`);


      const claudeCheck = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v claude`
      );
      const codexCheck = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v codex`
      );
      const opencodeCheck = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v opencode`
      );

      logStep(`claude: ${claudeCheck.exitCode === 0}, codex: ${codexCheck.exitCode === 0}, opencode: ${opencodeCheck.exitCode === 0}`);

      if (claudeCheck.exitCode !== 0 || codexCheck.exitCode !== 0) {
        throw new Error(
          `Required agent CLIs not available. claude: ${claudeCheck.exitCode === 0}, codex: ${codexCheck.exitCode === 0}`
        );
      }

      // claude skipped - OAuth token issues
      logStep("claude skipped (OAuth token needs refresh)");

      const codexOutput = await runSandboxCommand(
        sandbox,
        'codex exec --full-auto --skip-git-repo-check "Respond with exactly OK."',
        "codex",
        180,
        pathPrefix
      );
      expect(codexOutput).toMatch(/ok/i);
      logStep("codex passed");

      logStep("run opencode");
      const opencodeOutput = await runSandboxCommandViaPty(
        sandbox,
        'opencode run --format json "Respond with exactly OK."',
        "opencode",
        60_000,
        logStep
      );
      expect(opencodeOutput).toMatch(/ok/i);
      logStep("opencode passed");
    },
    300_000
  );
});

describeDaytonaDirect("daytona integration (direct)", () => {
  let child: ChildProcessWithoutNullStreams | null = null;
  let shareUrl = "";
  let publicBase: URL | null = null;
  let browser: Browser | null = null;
  let sandboxName = "";
  const cliOutput = { stdout: "", stderr: "" };

  beforeAll(async () => {
    if (!existsSync(testAppDir)) {
      throw new Error(`missing test app directory at ${testAppDir}`);
    }

    await cleanupSandboxes();

    buildCli();

    const output = cliOutput;
    const sessionName = `termbridge-daytona-direct-${Date.now()}`;
    sandboxName = `${sandboxPrefix}${Date.now()}`;
    const env = {
      ...process.env,
      NODE_ENV: "production",
      TERMBRIDGE_BACKEND: "sandbox-daytona",
      TERMBRIDGE_SANDBOX_DELETE_ON_EXIT: "true",
      TERMBRIDGE_SANDBOX_NAME: sandboxName,
      TERMBRIDGE_SANDBOX_DIRECT: "true",
      TERMBRIDGE_SANDBOX_PREVIEW_PORT: daytonaEnv.TERMBRIDGE_SANDBOX_PREVIEW_PORT ?? "5173",
      ...(shouldTestAgents
        ? {
            TERMBRIDGE_SANDBOX_AGENTS: "claude-code,codex,opencode"
          }
        : {})
    };
    const nodePath = resolveNodePath();

    const { command, args } = resolveCliCommand(nodePath, distBin, [
      "--no-qr",
      "--session",
      sessionName
    ]);
    const started = spawn(command, args, {
      cwd: testAppDir,
      env,
      stdio: ["pipe", "pipe", "pipe"]
    }) as ChildProcessWithoutNullStreams;

    child = started;

    started.stdout.on("data", (data) => {
      output.stdout += data.toString();
    });

    started.stderr.on("data", (data) => {
      output.stderr += data.toString();
    });

    const shareMatch = await waitForMatch(
      started,
      output,
      /Share URL:\s*(https:\/\/[^\s]+)/,
      90_000
    );
    shareUrl = shareMatch[1] ?? "";
    const parsedShare = parseShareUrl(shareUrl);
    publicBase = parsedShare.baseUrl;

    if (!shareUrl || !publicBase) {
      throw new Error("failed to parse direct share url");
    }

    const agentLogs = output.stdout.split("\n").filter((line) => /agent/i.test(line));
    if (agentLogs.length > 0) {
      logStep(`CLI agent logs:\n${agentLogs.join("\n")}`);
    } else {
      logStep("CLI agent logs: (none found)");
    }

    const health = await fetch(buildUrl(publicBase, "__tb/healthz"));
    if (!health.ok) {
      throw new Error(`health check failed: ${health.status}`);
    }
  }, 180_000);

  afterAll(async () => {
    await stopCli(child);
    if (browser) {
      await browser.close();
    }
    await cleanupSandboxes();
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

      let previewStatus: number | null = null;
      let previewSnippet = "";
      let previewBodyText = "";
      let previewHtmlSnippet = "";

      const redeemResult = await redeemShareUrl(context, shareUrl, { log: logStep });
      publicBase = redeemResult.baseUrl;
      const sessionCookie = redeemResult.sessionCookie;
      logStep("token redeemed");
      if (!sessionCookie) {
        throw new Error("missing session cookie");
      }

      try {
        const [terminalsResponse] = await Promise.all([
          page.waitForResponse((response) => response.url().endsWith("/__tb/api/terminals")),
          page.goto(buildUrl(publicBase, "__tb/app"), { waitUntil: "domcontentloaded" })
        ]);
        logStep("page loaded");
        expect(terminalsResponse.status()).toBe(200);

        await waitForTerminalConnected(page, 60_000);
        logStep("terminal connected");
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

      await sendTerminalInputAndWait(page, "printf '__tb_ready__'", /__tb_ready__/, 30_000);
      logStep("terminal input ready");

      await page.keyboard.type(
        "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
      );
      await page.keyboard.press("Enter");
      logStep("vite dev server command sent");

      await waitForTerminalText(page, /(Local|Network):\s+http:\/\/.*5173/, 180_000);
      logStep("vite dev server ready");

      try {
        const previewResponse = await fetch(publicBase.toString(), {
          headers: { cookie: sessionCookie }
        });
        previewStatus = previewResponse.status;
        const text = await previewResponse.text();
        previewSnippet = text.slice(0, 400);
        logStep(`preview response status: ${previewStatus}`);
      } catch (error) {
        logStep(`preview fetch failed: ${String(error)}`);
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

        const countButton = previewFrame.getByRole("button", { name: /count is/i });
        await countButton.waitFor({ timeout: 30_000 });
        const initialText = await countButton.textContent();
        const initialCount = Number.parseInt(initialText?.match(/\d+/)?.[0] ?? "0", 10);
        await countButton.click();
        await waitForLocatorText(countButton, `count is ${initialCount + 1}`, 5_000);
        logStep("preview counter interaction confirmed");
      } catch (error) {
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
          websocketUrl ? `websocket url:\n${websocketUrl}` : "",
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

  it(
    "runs coding agent CLIs in the sandbox with synced auth",
    async () => {
      const agentLogs = cliOutput.stdout.split("\n").filter((line) => /agent|daytona.*install|npm|prefix|home/i.test(line));
      logStep(`CLI agent logs at test time:\n${agentLogs.join("\n") || "(none)"}`);

      const sandbox = await waitForSandboxByName(sandboxName, 120_000);
      const pathPrefix = await getSandboxPathPrefix(sandbox);
      logStep(`path prefix: ${pathPrefix}`);


      const claudeCheck = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v claude`
      );
      const codexCheck = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v codex`
      );
      const opencodeCheck = await sandbox.process.executeCommand(
        `${pathPrefix ? `${pathPrefix} ` : ""}command -v opencode`
      );

      logStep(`claude: ${claudeCheck.exitCode === 0}, codex: ${codexCheck.exitCode === 0}, opencode: ${opencodeCheck.exitCode === 0}`);

      if (claudeCheck.exitCode !== 0 || codexCheck.exitCode !== 0) {
        throw new Error(
          `Required agent CLIs not available. claude: ${claudeCheck.exitCode === 0}, codex: ${codexCheck.exitCode === 0}`
        );
      }

      // claude skipped - OAuth token issues
      logStep("claude skipped (OAuth token needs refresh)");

      const codexOutput = await runSandboxCommand(
        sandbox,
        'codex exec --full-auto --skip-git-repo-check "Respond with exactly OK."',
        "codex",
        180,
        pathPrefix
      );
      expect(codexOutput).toMatch(/ok/i);
      logStep("codex passed");

      logStep("run opencode");
      const opencodeOutput = await runSandboxCommandViaPty(
        sandbox,
        'opencode run --format json "Respond with exactly OK."',
        "opencode",
        60_000,
        logStep
      );
      expect(opencodeOutput).toMatch(/ok/i);
      logStep("opencode passed");
    },
    300_000
  );
});
