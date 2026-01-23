import { randomBytes } from "node:crypto";
import { Daytona, type Sandbox } from "@daytonaio/sdk";
import type { Logger } from "../server/server";
import type {
  SandboxServerProvider,
  SandboxServerStartOptions,
  SandboxServerStartResult
} from "../sandbox/server-provider";
import { installAgents } from "./agent-install";

export type DaytonaSandboxProviderOptions = {
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

  logger.info("Daytona: installing tmux");
  const installScript = [
    "set -e",
    "SUDO=\"\"",
    "if command -v sudo >/dev/null 2>&1; then SUDO=\"sudo\"; fi",
    "if command -v apt-get >/dev/null 2>&1; then $SUDO apt-get update -y && $SUDO apt-get install -y tmux;",
    "elif command -v apk >/dev/null 2>&1; then $SUDO apk add --no-cache tmux;",
    "elif command -v dnf >/dev/null 2>&1; then $SUDO dnf install -y tmux;",
    "elif command -v yum >/dev/null 2>&1; then $SUDO yum install -y tmux;",
    "else echo 'tmux install failed: no supported package manager'; exit 1; fi"
  ].join(" ");

  const result = await sandbox.process.executeCommand(installScript);
  if (result.exitCode !== 0) {
    throw new Error("tmux install failed");
  }
};

const resolvePreviewUrl = async (
  sandbox: Sandbox,
  port: number,
  logger: Logger
): Promise<string> => {
  const preview = await sandbox.getPreviewLink(port);
  if (!preview.url) {
    throw new Error("Daytona preview url unavailable");
  }

  if (preview.token) {
    try {
      const signed = await sandbox.getSignedPreviewUrl(port, 60 * 60 * 24);
      if (signed.url) {
        return signed.url;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      logger.warn(`Daytona: signed preview url failed (${message})`);
    }
  }

  return preview.url;
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
  const trimmed = shareUrl.trim();
  const marker = "/__tb/s/";
  const index = trimmed.indexOf(marker);
  if (index === -1) {
    throw new Error("invalid share url");
  }
  const publicUrl = trimmed.slice(0, index);
  const token = trimmed.slice(index + marker.length);
  if (!publicUrl || !token) {
    throw new Error("invalid share url");
  }
  return { publicUrl, token };
};

const buildEnv = (values: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => typeof value === "string" && value.length > 0)
  ) as Record<string, string>;

export const createDaytonaSandboxServerProvider = (
  options: DaytonaSandboxProviderOptions = {}
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
        logger.info(`Daytona: creating sandbox ${name}`);
        const sandbox = await daytona.create({ name, public: startOptions.public });
        sandboxRef = sandbox;
        await sandbox.start();

        const repoPath = startOptions.repoPath ?? deriveRepoPath(startOptions.repoUrl);
        logger.info(`Daytona: cloning ${startOptions.repoUrl}`);
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
        await installAgents(sandbox, startOptions.agentInstall, logger);

        const publicUrl = normalizePublicUrl(
          await resolvePreviewUrl(sandbox, startOptions.serverPort, logger)
        );

        const runId = randomBytes(4).toString("hex");
        const shareFile = `/tmp/termbridge-share-${runId}.txt`;
        const pidFile = `/tmp/termbridge-${runId}.pid`;
        const logFile = `/tmp/termbridge-${runId}.log`;

        const args = [
          "npx",
          "termbridge",
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
          TERMBRIDGE_HIDE_TERMINAL_SWITCHER: startOptions.hideTerminalSwitcher ? "1" : undefined,
          ...startOptions.agentEnv
        });

        const startCommand = `nohup ${args.join(" ")} > ${logFile} 2>&1 & echo $! > ${pidFile}`;
        await sandbox.process.executeCommand(startCommand, repoDir, env);

        logger.info("Daytona: waiting for share url");
        const shareUrl = await readShareUrl(sandbox, shareFile, 90_000);
        const parsed = parseShareUrl(shareUrl);

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
            logger.warn(`Daytona: stop failed (${message})`);
          }

          if (startOptions.deleteOnExit) {
            try {
              await daytona.delete(sandbox);
            } catch (error) {
              const message = error instanceof Error ? error.message : "unknown error";
              logger.warn(`Daytona: delete failed (${message})`);
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
        logger.error(`Daytona: sandbox start failed (${message})`);
        if (sandboxRef) {
          try {
            await sandboxRef.stop();
          } catch (stopError) {
            const message = stopError instanceof Error ? stopError.message : "unknown error";
            baseLogger.warn(`Daytona: stop failed (${message})`);
          }

          if (startOptions.deleteOnExit) {
            try {
              await daytona.delete(sandboxRef);
            } catch (deleteError) {
              const message = deleteError instanceof Error ? deleteError.message : "unknown error";
              baseLogger.warn(`Daytona: delete failed (${message})`);
            }
          }
        }

        throw error;
      }
    }
  };
};
