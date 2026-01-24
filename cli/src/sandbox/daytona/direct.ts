import { randomBytes } from "node:crypto";
import { stat } from "node:fs/promises";
import { Daytona, type Sandbox } from "@daytonaio/sdk";
import type { Logger } from "../../server/server";
import type {
  SandboxServerProvider,
  SandboxServerStartOptions,
  SandboxServerStartResult
} from "../server-provider";
import { installAgents } from "./agent-install";
import { syncAgentAuth } from "./agent-auth";

export type SandboxDaytonaProviderOptions = {
  apiKey?: string;
  apiUrl?: string;
  target?: string;
  logger?: Logger;
};

const noopLogger: Logger = {
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined
};

const shellEscape = (value: string) => `'${value.replace(/'/g, `'"'"'`)}'`;

const installLocalTermbridge = async (
  sandbox: Sandbox,
  startOptions: SandboxServerStartOptions,
  logger: Logger
) => {
  if (!startOptions.localCliPackPath) {
    return null;
  }

  try {
    const cliStats = await stat(startOptions.localCliPackPath);
    if (!cliStats.isFile()) {
      logger.warn("Sandbox (Daytona): local CLI pack missing; falling back to npx");
      return null;
    }
  } catch {
    logger.warn("Sandbox (Daytona): local CLI pack missing; falling back to npx");
    return null;
  }

  const npmCheck = await sandbox.process.executeCommand("command -v npm");
  if (npmCheck.exitCode !== 0) {
    logger.warn("Sandbox (Daytona): npm not available; falling back to npx");
    return null;
  }

  const remotePackPath = `/tmp/termbridge-${randomBytes(4).toString("hex")}.tgz`;
  await sandbox.fs.uploadFile(startOptions.localCliPackPath, remotePackPath);
  const install = await sandbox.process.executeCommand(
    `npm install -g ${shellEscape(remotePackPath)}`
  );
  if (install.exitCode !== 0) {
    logger.warn("Sandbox (Daytona): local CLI install failed; falling back to npx");
    return null;
  }

  logger.info("Sandbox (Daytona): installed local termbridge package");
  return { useLocal: true };
};

const deriveRepoPath = (repoUrl: string) => {
  const trimmed = repoUrl.replace(/\/$/, "");
  const last = trimmed.split("/").pop();
  if (!last) {
    return "repo";
  }
  return last.endsWith(".git") ? last.slice(0, -4) : last;
};

const normalizePublicUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("missing public url");
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("invalid public url");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid public url");
  }
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureTmux = async (sandbox: Sandbox, logger: Logger) => {
  const check = await sandbox.process.executeCommand("command -v tmux");
  if (check.exitCode === 0) {
    return;
  }

  logger.info("Sandbox (Daytona): installing tmux");

  const sudoCheck = await sandbox.process.executeCommand("command -v sudo");
  const sudoPrefix = sudoCheck.exitCode === 0 ? "sudo -E " : "";
  const env = { DEBIAN_FRONTEND: "noninteractive" };
  const installTimeout = 180;

  const run = async (command: string, allowFailure = false) => {
    const result = await sandbox.process.executeCommand(command, undefined, env, installTimeout);
    if (!allowFailure && result.exitCode !== 0) {
      const detail = result.result?.trim();
      const message = detail
        ? `tmux install failed: ${detail.slice(-1000)}`
        : "tmux install failed";
      throw new Error(message);
    }
    return result;
  };

  const hasCommand = async (name: string) => {
    const result = await sandbox.process.executeCommand(`command -v ${name}`);
    return result.exitCode === 0;
  };

  if (await hasCommand("apt-get")) {
    await run(`${sudoPrefix}apt-get update -o Acquire::Retries=3 -o Acquire::ForceIPv4=true`, true);
    await run(`${sudoPrefix}apt-get install -y tmux`);
    return;
  }

  if (await hasCommand("apk")) {
    await run(`${sudoPrefix}apk add --no-cache tmux`);
    return;
  }

  if (await hasCommand("dnf")) {
    await run(`${sudoPrefix}dnf install -y tmux`);
    return;
  }

  if (await hasCommand("yum")) {
    await run(`${sudoPrefix}yum install -y tmux`);
    return;
  }

  throw new Error("tmux install failed: no supported package manager");
};

const resolvePreviewUrl = async (
  sandbox: Sandbox,
  port: number,
  _logger: Logger
): Promise<string> => {
  const preview = await sandbox.getPreviewLink(port);
  if (!preview.url) {
    throw new Error("Daytona preview url unavailable");
  }

  const withPreviewToken = (value: string) => {
    if (!preview.token) {
      return value;
    }
    try {
      const parsed = new URL(value);
      if (!parsed.searchParams.has("token")) {
        parsed.searchParams.set("token", preview.token);
      }
      return parsed.toString();
    } catch {
      return value;
    }
  };
  return withPreviewToken(preview.url);
};

const readShareUrl = async (sandbox: Sandbox, path: string, timeoutMs: number) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const contents = await sandbox.fs.downloadFile(path);
      const text = contents.toString("utf8").trim();
      if (text) {
        return text.split(/\s+/)[0]!;
      }
    } catch {
      // ignore missing file
    }
    await delay(500);
  }

  throw new Error("share url unavailable");
};

const parseShareUrl = (shareUrl: string) => {
  let parsed: URL;
  try {
    parsed = new URL(shareUrl.trim());
  } catch {
    throw new Error("invalid share url");
  }

  const marker = "/__tb/s/";
  const index = parsed.pathname.indexOf(marker);
  if (index === -1) {
    throw new Error("invalid share url");
  }
  const token = parsed.pathname.slice(index + marker.length);
  if (!token) {
    throw new Error("invalid share url");
  }

  const basePath = parsed.pathname.slice(0, index);
  const normalizedPath = basePath || "/";
  parsed.pathname = normalizedPath;
  parsed.hash = "";
  let publicUrl = parsed.toString();
  if (normalizedPath === "/" && parsed.search) {
    publicUrl = `${parsed.origin}${parsed.search}`;
  } else if (publicUrl.endsWith("/")) {
    publicUrl = publicUrl.slice(0, -1);
  }
  return { publicUrl, token };
};

const buildEnv = (values: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => typeof value === "string" && value.length > 0)
  ) as Record<string, string>;

export const createSandboxDaytonaServerProvider = (
  options: SandboxDaytonaProviderOptions = {}
): SandboxServerProvider => {
  const baseLogger = options.logger ?? noopLogger;
  const daytona = new Daytona({
    apiKey: options.apiKey,
    apiUrl: options.apiUrl,
    target: options.target
  });

  return {
    start: async (startOptions: SandboxServerStartOptions): Promise<SandboxServerStartResult> => {
      const logger = startOptions.logger ?? baseLogger;
      let sandboxRef: Sandbox | null = null;

      try {
        const name =
          startOptions.sandboxName ?? `termbridge-${randomBytes(4).toString("hex")}`;
        logger.info(`Sandbox (Daytona): creating sandbox ${name}`);
        const sandbox = await daytona.create({ name, public: startOptions.public });
        sandboxRef = sandbox;
        await sandbox.start();

        const repoPath = startOptions.repoPath ?? deriveRepoPath(startOptions.repoUrl);
        logger.info(`Sandbox (Daytona): cloning ${startOptions.repoUrl}`);
        await sandbox.git.clone(
          startOptions.repoUrl,
          repoPath,
          startOptions.repoBranch,
          undefined,
          startOptions.gitUsername,
          startOptions.gitPassword
        );

        const workDir = await sandbox.getWorkDir();
        const repoDir = repoPath.startsWith("/")
          ? repoPath
          : workDir
            ? `${workDir.replace(/\/$/, "")}/${repoPath}`
            : repoPath;

        await ensureTmux(sandbox, logger);
        const agentResult = await installAgents(sandbox, startOptions.agentInstall, logger);
        await syncAgentAuth(sandbox, startOptions.agentAuth, logger);

        const localCli = await installLocalTermbridge(sandbox, startOptions, logger);

        // Get home directory for agent binary paths
        const homeResult = await sandbox.process.executeCommand("printf $HOME");
        const home = homeResult.exitCode === 0 && homeResult.result ? homeResult.result.trim() : "/home/daytona";

        // Build PATH with agent binary locations (npm packages with --prefix ~/.local)
        const agentPathPrefix = agentResult.installed.length > 0 ? `${home}/.local/bin` : "";

        const publicUrl = normalizePublicUrl(
          await resolvePreviewUrl(sandbox, startOptions.serverPort, logger)
        );

        const runId = randomBytes(4).toString("hex");
        const shareFile = `/tmp/termbridge-share-${runId}.txt`;
        const pidFile = `/tmp/termbridge-${runId}.pid`;
        const logFile = `/tmp/termbridge-${runId}.log`;

        const args = [
          ...(localCli ? ["termbridge"] : ["npx", "termbridge"]),
          "start",
          "--port",
          String(startOptions.serverPort),
          "--no-qr",
          "--tunnel",
          "none"
        ];

        if (startOptions.proxyPort) {
          args.push("--proxy", String(startOptions.proxyPort));
        }

        if (startOptions.previewPort) {
          args.push("--dev-proxy-url", `http://127.0.0.1:${startOptions.previewPort}`);
        }

        if (startOptions.sessionName) {
          args.push("--session", startOptions.sessionName);
        }

        if (startOptions.killOnExit) {
          args.push("--kill-on-exit");
        }

        const env = buildEnv({
          TERMBRIDGE_BACKEND: "tmux",
          TERMBRIDGE_PUBLIC_URL: publicUrl,
          TERMBRIDGE_SHARE_FILE: shareFile,
          TERMBRIDGE_TMUX_CWD: repoDir,
          TERMBRIDGE_HOST: "0.0.0.0",
          TERMBRIDGE_COOKIE_SAMESITE: "none",
          TERMBRIDGE_HIDE_TERMINAL_SWITCHER: startOptions.hideTerminalSwitcher ? "1" : undefined,
          TERMBRIDGE_TMUX_PATH_PREFIX: agentPathPrefix || undefined,
          ...startOptions.agentEnv
        });

        const startCommand = `nohup ${args.join(" ")} > ${logFile} 2>&1 & echo $! > ${pidFile}`;
        await sandbox.process.executeCommand(startCommand, repoDir, env);

        logger.info("Sandbox (Daytona): waiting for share url");
        const shareUrl = await readShareUrl(sandbox, shareFile, 90_000);
        let parsed: { publicUrl: string; token: string };
        try {
          parsed = parseShareUrl(shareUrl);
        } catch {
          throw new Error(`invalid share url: ${shareUrl}`);
        }

        const stop = async () => {
          try {
            const pidBuffer = await sandbox.fs.downloadFile(pidFile);
            const pid = Number.parseInt(pidBuffer.toString("utf8").trim(), 10);
            if (Number.isFinite(pid)) {
              await sandbox.process.executeCommand(`kill ${pid}`);
            }
          } catch {}

          try {
            await sandbox.stop();
          } catch (error) {
            const message = error instanceof Error ? error.message : "unknown error";
            logger.warn(`Sandbox (Daytona): stop failed (${message})`);
          }

          if (startOptions.deleteOnExit) {
            try {
              await daytona.delete(sandbox);
            } catch (error) {
              const message = error instanceof Error ? error.message : "unknown error";
              logger.warn(`Sandbox (Daytona): delete failed (${message})`);
            }
          }
        };

        return {
          localUrl: parsed.publicUrl,
          publicUrl: parsed.publicUrl,
          token: parsed.token,
          stop
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        logger.error(`Sandbox (Daytona): sandbox start failed (${message})`);
        if (sandboxRef) {
          try {
            await sandboxRef.stop();
          } catch (stopError) {
            const message = stopError instanceof Error ? stopError.message : "unknown error";
            baseLogger.warn(`Sandbox (Daytona): stop failed (${message})`);
          }

          if (startOptions.deleteOnExit) {
            try {
              await daytona.delete(sandboxRef);
            } catch (deleteError) {
              const message = deleteError instanceof Error ? deleteError.message : "unknown error";
              baseLogger.warn(`Sandbox (Daytona): delete failed (${message})`);
            }
          }
        }

        throw error;
      }
    }
  };
};
