import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright";

export const resolveRepoRoot = () => {
  const cwd = process.cwd();
  if (existsSync(resolve(cwd, "cli", "package.json"))) {
    return cwd;
  }
  const parent = resolve(cwd, "..");
  if (existsSync(resolve(parent, "cli", "package.json"))) {
    return parent;
  }
  return resolve(dirname(fileURLToPath(import.meta.url)), "../..");
};

export const resolveNodePath = () => {
  const result = spawnSync("which", ["node"], { encoding: "utf8" });
  if (result.status === 0 && result.stdout.trim()) {
    return result.stdout.trim();
  }
  if (existsSync(process.execPath)) {
    return process.execPath;
  }
  return "node";
};

export const commandExists = (name: string) =>
  spawnSync("which", [name], { stdio: "ignore" }).status === 0;

export const isPublishedMode = () => process.env.TERMBRIDGE_TEST_PUBLISHED === "1";

export type CliCommand = {
  command: string;
  args: string[];
};

export const resolveCliCommand = (
  nodePath: string,
  distBin: string,
  cliArgs: string[]
): CliCommand => {
  if (isPublishedMode()) {
    return { command: "npx", args: ["termbridge", ...cliArgs] };
  }
  return { command: nodePath, args: [distBin, ...cliArgs] };
};

export const buildCli = (rootDir: string) => {
  if (isPublishedMode()) {
    return;
  }
  const result = spawnSync("bun", ["run", "build"], { cwd: rootDir, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error("cli build failed");
  }
};

export const logStep = (prefix: string, label: string) => {
  if (process.env.TERMBRIDGE_TEST_DEBUG) {
    process.stdout.write(`[${prefix}] ${label}\n`);
  }
};

export const failFastPatterns = [/Tunnel failed/i, /tmux install failed/i];

export const waitForMatch = (
  child: ChildProcessWithoutNullStreams,
  output: { stdout: string; stderr: string },
  regex: RegExp,
  timeoutMs: number,
  additionalFailPatterns: RegExp[] = []
) =>
  new Promise<RegExpMatchArray>((resolvePromise, reject) => {
    const deadline = Date.now() + timeoutMs;
    const allFailPatterns = [...failFastPatterns, ...additionalFailPatterns];

    const check = () => {
      const failMatch = allFailPatterns.find(
        (pattern) => pattern.test(output.stdout) || pattern.test(output.stderr)
      );

      if (failMatch) {
        cleanup();
        const summary = [
          `fail fast: ${failMatch.source}`,
          output.stdout ? `stdout:\n${output.stdout}` : "",
          output.stderr ? `stderr:\n${output.stderr}` : ""
        ]
          .filter(Boolean)
          .join("\n");
        reject(new Error(summary));
        return;
      }

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
      const match = output.stdout.match(regex) ?? output.stderr.match(regex);
      if (match) {
        cleanup();
        resolvePromise(match);
        return;
      }
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

export const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, label: string) =>
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

export const stopCli = async (child: ChildProcessWithoutNullStreams | null) => {
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

export const spawnCli = (
  nodePath: string,
  distBin: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv
) => {
  const output = { stdout: "", stderr: "" };
  const { command, args: spawnArgs } = resolveCliCommand(nodePath, distBin, args);

  const child = spawn(command, spawnArgs, {
    cwd,
    env,
    stdio: ["pipe", "pipe", "pipe"]
  }) as ChildProcessWithoutNullStreams;

  child.stdout.on("data", (data) => {
    output.stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    output.stderr += data.toString();
  });

  return { child, output };
};

export const clickSheetOption = async (page: Page, name: string) => {
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

export type PreviewTestOptions = {
  log?: (message: string) => void;
  iframeSelector?: string;
  headingText?: string;
  counterSelector?: string;
};

export const testPreviewCounter = async (page: Page, options: PreviewTestOptions = {}) => {
  const {
    log,
    iframeSelector = '[data-testid="preview-iframe"]',
    headingText = "Vite + React",
    counterSelector = 'button:has-text("count is")'
  } = options;

  const previewFrame = page.frameLocator(iframeSelector);

  await previewFrame
    .getByRole("heading", { name: headingText })
    .waitFor({ timeout: 30_000 });
  log?.("preview heading confirmed");

  const countButton = previewFrame.locator(counterSelector).first();
  await countButton.waitFor({ timeout: 10_000 });
  const initialText = await countButton.textContent();
  const initialCount = Number.parseInt(initialText?.match(/\d+/)?.[0] ?? "0", 10);

  await countButton.click();

  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const newText = await countButton.textContent();
    const newCount = Number.parseInt(newText?.match(/\d+/)?.[0] ?? "0", 10);
    if (newCount === initialCount + 1) {
      log?.("preview counter interaction confirmed");
      return { initialCount, newCount };
    }
    await page.waitForTimeout(100);
  }

  throw new Error(`counter increment failed: expected ${initialCount + 1}`);
};
