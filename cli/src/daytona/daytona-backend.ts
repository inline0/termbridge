import { randomBytes } from "node:crypto";
import { Daytona, type PtyHandle, type Sandbox } from "@daytonaio/sdk";
import type { TerminalBackend, TerminalSession } from "@termbridge/terminal";
import type { TerminalControlKey } from "@termbridge/shared";
import type { Logger } from "../server/server";
import { installAgents } from "./agent-install";

type DaytonaSessionEntry = {
  session: TerminalSession;
  handle: PtyHandle | null;
  subscribers: Set<(data: string) => void>;
  cols: number;
  rows: number;
};

export type DaytonaBackendOptions = {
  apiKey?: string;
  apiUrl?: string;
  target?: string;
  repoUrl: string;
  repoBranch?: string;
  repoPath?: string;
  sandboxName?: string;
  public?: boolean;
  deleteOnExit?: boolean;
  gitUsername?: string;
  gitPassword?: string;
  agentEnv?: Record<string, string>;
  agentInstall?: { enabled: boolean; packages: string[] };
  logger?: Logger;
};

const controlKeyMap: Record<TerminalControlKey, string> = {
  ctrl_c: "\x03",
  esc: "\x1b",
  tab: "\t",
  up: "\x1b[A",
  down: "\x1b[B",
  left: "\x1b[D",
  right: "\x1b[C"
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

export const createDaytonaBackend = (options: DaytonaBackendOptions): TerminalBackend => {
  const logger = options.logger ?? noopLogger;
  const sessions = new Map<string, DaytonaSessionEntry>();
  const daytona = new Daytona({
    apiKey: options.apiKey,
    apiUrl: options.apiUrl,
    target: options.target
  });

  let sandboxRef: Sandbox | null = null;
  let sandboxInit: Promise<{ sandbox: Sandbox; repoPath: string }> | null = null;

  const ensureSandbox = async () => {
    if (!sandboxInit) {
      sandboxInit = (async () => {
        try {
          const name = options.sandboxName ?? `termbridge-${randomBytes(4).toString("hex")}`;
          logger.info(`Daytona: creating sandbox ${name}`);
          const sandbox = await daytona.create({ name, public: options.public });
          await sandbox.start();
          const repoPath = options.repoPath ?? deriveRepoPath(options.repoUrl);
          logger.info(`Daytona: cloning ${options.repoUrl}`);
          await sandbox.git.clone(
            options.repoUrl,
            repoPath,
            options.repoBranch,
            undefined,
            options.gitUsername,
            options.gitPassword
          );
          await installAgents(sandbox, options.agentInstall, logger);
          sandboxRef = sandbox;
          logger.info(`Daytona: repo ready at ${repoPath}`);
          return { sandbox, repoPath };
        } catch (error) {
          const message = error instanceof Error ? error.message : "unknown error";
          logger.error(`Daytona: sandbox init failed (${message})`);
          throw error;
        }
      })();
    }

    return sandboxInit;
  };

  const ensurePty = async (entry: DaytonaSessionEntry) => {
    if (entry.handle) {
      return entry.handle;
    }

    const { sandbox, repoPath } = await ensureSandbox();
    const handle = await sandbox.process.createPty({
      id: entry.session.name,
      cwd: repoPath,
      cols: entry.cols,
      rows: entry.rows,
      envs: {
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        ...(options.agentEnv ?? {})
      },
      onData: (data) => {
        if (!sessions.has(entry.session.name)) {
          return;
        }
        const text = Buffer.from(data).toString("utf8");
        if (!text) {
          return;
        }
        for (const subscriber of entry.subscribers) {
          subscriber(text);
        }
      }
    });

    await handle.waitForConnection();
    entry.handle = handle;
    return handle;
  };

  const createSession = async (name: string) => {
    const existing = sessions.get(name);
    if (existing) {
      return existing.session;
    }

    const entry: DaytonaSessionEntry = {
      session: { name, createdAt: new Date() },
      handle: null,
      subscribers: new Set(),
      cols: 80,
      rows: 24
    };
    sessions.set(name, entry);

    await ensurePty(entry);

    return entry.session;
  };

  const write = async (sessionName: string, data: string) => {
    if (!data) {
      return;
    }

    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }

    const handle = await ensurePty(entry);
    await handle.sendInput(data);
  };

  const resize = async (sessionName: string, cols: number, rows: number) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }

    entry.cols = cols;
    entry.rows = rows;

    if (!entry.handle) {
      return;
    }

    await entry.handle.resize(cols, rows);
  };

  const sendControl = async (sessionName: string, key: TerminalControlKey) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }

    const handle = await ensurePty(entry);
    const controlSequence = controlKeyMap[key];
    await handle.sendInput(controlSequence);
  };

  const scroll = async (_sessionName: string, _mode: "lines" | "pages", _amount: number) => {
    return;
  };

  const onOutput = (sessionName: string, callback: (data: string) => void) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return () => undefined;
    }

    entry.subscribers.add(callback);
    return () => {
      entry.subscribers.delete(callback);
    };
  };

  const closeSession = async (sessionName: string) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }

    sessions.delete(sessionName);
    if (entry.handle) {
      try {
        await entry.handle.kill();
      } catch {}
      try {
        await entry.handle.disconnect();
      } catch {}
    }
  };

  const shutdown = async () => {
    const names = Array.from(sessions.keys());
    await Promise.all(names.map((name) => closeSession(name)));

    if (!sandboxRef) {
      return;
    }

    try {
      await sandboxRef.stop();
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      logger.warn(`Daytona: stop failed (${message})`);
    }

    if (options.deleteOnExit) {
      try {
        await daytona.delete(sandboxRef);
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        logger.warn(`Daytona: delete failed (${message})`);
      }
    }
  };

  return {
    createSession,
    write,
    resize,
    sendControl,
    scroll,
    onOutput,
    closeSession,
    shutdown,
    getPreviewUrl: async (port: number) => {
      const { sandbox } = await ensureSandbox();
      try {
        const preview = await sandbox.getPreviewLink(port);
        if (!preview.url) {
          return null;
        }
        const headers: Record<string, string> = {};
        if (preview.token) {
          headers["x-daytona-preview-token"] = preview.token;
        }
        headers["x-daytona-skip-preview-warning"] = "true";
        return { url: preview.url, headers };
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error";
        logger.warn(`Daytona: preview failed (${message})`);
        return null;
      }
    }
  };
};
