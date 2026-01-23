import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createServer, type Server } from "node:http";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser } from "playwright";
import {
  redeemShareUrl,
  sendTerminalInputAndWait,
  waitForLocatorText,
  waitForTerminalConnected,
  waitForTerminalText
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
  clickSheetOption
} from "./cli-test-utils";

const rootDir = resolveRepoRoot();
const cliDir = resolve(rootDir, "cli");
const distBin = resolve(cliDir, "dist/bin.js");

const buildCli = () => buildCliUtil(rootDir);
const logStep = (label: string) => logStepUtil("cli integration", label);
const waitForMatch = waitForMatchUtil;

const _hasDeps = commandExists("tmux") && commandExists("cloudflared");
const maybeDescribe = describe;

maybeDescribe("cli integration", () => {
  let child: ChildProcessWithoutNullStreams | null = null;
  let localUrl = "";
  let redeemUrl = "";
  let publicBase: URL | null = null;
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
    publicBase = parseShareUrl(redeemUrl).baseUrl;

    if (!localUrl || !redeemUrl || !publicBase) {
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

    const { baseUrl } = await redeemShareUrl(context, redeemUrl, {
      fallbackBaseUrl: new URL(localUrl),
      log: logStep
    });
    logStep("token redeemed");
    publicBase = baseUrl;
    const storedCookies = await context.cookies(publicBase.toString());
    logStep("cookies verified");
    expect(storedCookies.length > 0).toBe(
      true
    );

    try {
      const [terminalsResponse] = await Promise.all([
        page.waitForResponse((response) => response.url().endsWith("/__tb/api/terminals")),
        page.goto(buildUrl(publicBase, "__tb/app"), { waitUntil: "domcontentloaded" })
      ]);
      logStep("page loaded");
      expect(terminalsResponse.status()).toBe(200);

      await waitForTerminalConnected(page, 45_000);
      logStep("terminal connected");

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

    await sendTerminalInputAndWait(page, "echo termbridge-ui", /termbridge-ui/, 20_000);
    logStep("terminal input confirmed");
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

const testPageHtml = `<!DOCTYPE html>
<html>
<head><title>Test App</title></head>
<body>
<h1>Vite + React</h1>
<button id="counter">count is 0</button>
<script>
let count = 0;
document.getElementById('counter').onclick = () => {
  count++;
  document.getElementById('counter').textContent = 'count is ' + count;
};
</script>
</body>
</html>`;

const createTestServer = (port: number) =>
  new Promise<Server>((resolvePromise) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(testPageHtml);
    });
    server.listen(port, () => resolvePromise(server));
  });

const getAvailablePort = () =>
  new Promise<number>((resolvePromise, reject) => {
    const server = createServer();
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        const port = address.port;
        server.close(() => resolvePromise(port));
      } else {
        reject(new Error("failed to get port"));
      }
    });
  });

maybeDescribe("cli integration (proxy mode)", () => {
  let child: ChildProcessWithoutNullStreams | null = null;
  let testServer: Server | null = null;
  let localUrl = "";
  let redeemUrl = "";
  let publicBase: URL | null = null;
  let browser: Browser | null = null;

  beforeAll(async () => {
    buildCli();

    const proxyPort = await getAvailablePort();
    testServer = await createTestServer(proxyPort);
    logStep(`test server started on port ${proxyPort}`);

    const output = { stdout: "", stderr: "" };
    const sessionName = `termbridge-proxy-test-${Date.now()}`;
    const env = { ...process.env, NODE_ENV: "production" };
    const nodePath = resolveNodePath();

    const started = spawn(
      nodePath,
      [distBin, "--no-qr", "--kill-on-exit", "--session", sessionName, "--proxy", String(proxyPort)],
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
    publicBase = parseShareUrl(redeemUrl).baseUrl;

    if (!localUrl || !redeemUrl || !publicBase) {
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
    if (testServer) {
      await new Promise<void>((resolvePromise) => testServer!.close(() => resolvePromise()));
    }
  });

  it(
    "renders proxy preview with counter interaction",
    async () => {
      browser = await withTimeout(chromium.launch(), 20_000, "chromium.launch");
      logStep("browser launched");
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addInitScript(() => {
        (window as Window & { __TERMbridgeExposeTerminal?: boolean }).__TERMbridgeExposeTerminal =
          true;
      });

      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const responseErrors: string[] = [];

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

      const { baseUrl } = await redeemShareUrl(context, redeemUrl, {
        fallbackBaseUrl: new URL(localUrl),
        log: logStep
      });
      publicBase = baseUrl;
      logStep("token redeemed");

      try {
        const [terminalsResponse] = await Promise.all([
          page.waitForResponse((response) => response.url().endsWith("/__tb/api/terminals")),
          page.goto(buildUrl(publicBase, "__tb/app"), { waitUntil: "domcontentloaded" })
        ]);
        logStep("page loaded");
        expect(terminalsResponse.status()).toBe(200);

        await waitForTerminalConnected(page, 45_000);
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
          statusText ? `terminal status:\n${statusText}` : ""
        ]
          .filter(Boolean)
          .join("\n");
        const message = error instanceof Error ? error.message : String(error);
        throw new Error([message, details].filter(Boolean).join("\n"));
      }

      await clickSheetOption(page, "Views");
      await clickSheetOption(page, "Switch to Preview");
      logStep("preview view selected");

      try {
        const previewFrame = page.frameLocator('[data-testid="preview-iframe"]');

        await previewFrame
          .getByRole("heading", { name: "Vite + React" })
          .waitFor({ timeout: 30_000 });
        logStep("preview confirmed");

        const countButton = previewFrame.getByRole("button", { name: /count is/i });
        await countButton.waitFor({ timeout: 10_000 });
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
          responseErrors.length > 0 ? `response errors:\n${responseErrors.join("\n")}` : "",
          previewBodyText ? `preview frame text:\n${previewBodyText}` : "",
          previewHtmlSnippet ? `preview frame html:\n${previewHtmlSnippet}` : ""
        ]
          .filter(Boolean)
          .join("\n");
        const message = error instanceof Error ? error.message : String(error);
        throw new Error([message, details].filter(Boolean).join("\n"));
      }
    },
    120_000
  );
});
