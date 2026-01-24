import { EventEmitter } from "node:events";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { accessSync, chmodSync, constants as fsConstants } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import * as pty from "node-pty";
import type { TerminalControlKey } from "@termbridge/shared";

const execFile = promisify(execFileCallback);
const requireFromHere = createRequire(import.meta.url);
let spawnHelperChecked = false;

export type TerminalSession = {
  name: string;
  createdAt: Date;
};

export type TerminalPreviewInfo = {
  url: string;
  headers?: Record<string, string>;
};

export type TerminalBackend = {
  createSession: (name: string) => Promise<TerminalSession>;
  write: (sessionName: string, data: string) => Promise<void>;
  resize: (sessionName: string, cols: number, rows: number) => Promise<void>;
  sendControl: (sessionName: string, key: TerminalControlKey) => Promise<void>;
  scroll: (sessionName: string, mode: "lines" | "pages", amount: number) => Promise<void>;
  onOutput: (sessionName: string, callback: (data: string) => void) => () => void;
  closeSession: (sessionName: string) => Promise<void>;
  shutdown?: () => Promise<void>;
  getPreviewUrl?: (port: number) => Promise<string | TerminalPreviewInfo | null>;
};

export type TmuxBackendDeps = {
  execFile?: (file: string, args: string[]) => Promise<{ stdout: string }>;
  spawnPty?: (file: string, args: string[], options: pty.IPtyForkOptions) => pty.IPty;
  env?: NodeJS.ProcessEnv;
  defaultCols?: number;
  defaultRows?: number;
  defaultCwd?: string;
  /** Path prefix to add to PATH in new sessions (e.g., for agent binaries) */
  pathPrefix?: string;
  /** @internal Skip spawn-helper check when using mock spawnPty in tests */
  _skipSpawnHelperCheck?: boolean;
  /** @internal Override platform for spawn-helper checks */
  _platform?: NodeJS.Platform;
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

const defaultDeps: Required<Omit<TmuxBackendDeps, "defaultCwd" | "pathPrefix">> & {
  defaultCwd?: string;
  pathPrefix?: string;
} = {
  execFile: async (file, args) => execFile(file, args),
  spawnPty: pty.spawn,
  env: process.env,
  defaultCols: 80,
  defaultRows: 24,
  defaultCwd: undefined,
  pathPrefix: undefined,
  _skipSpawnHelperCheck: false,
  _platform: process.platform
};

const ensureSpawnHelperExecutable = (platform: NodeJS.Platform) => {
  if (spawnHelperChecked || platform === "win32") {
    return;
  }

  const forceCheck = process.env.TERMBRIDGE_FORCE_SPAWN_HELPER === "1";
  if (!forceCheck && platform !== "darwin") {
    spawnHelperChecked = true;
    return;
  }

  spawnHelperChecked = true;

  try {
    const { loadNativeModule } = requireFromHere("node-pty/lib/utils") as {
      loadNativeModule: (name: string) => { dir: string };
    };
    const native = loadNativeModule("pty");
    const unixTerminalPath = requireFromHere.resolve("node-pty/lib/unixTerminal");
    const helperPath = resolve(dirname(unixTerminalPath), `${native.dir}/spawn-helper`);

    try {
      accessSync(helperPath, fsConstants.X_OK);
    } catch {
      chmodSync(helperPath, 0o755);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`node-pty spawn-helper unavailable: ${message}`);
  }
};

export const createTmuxBackend = (deps: TmuxBackendDeps = {}): TerminalBackend => {
  const runtime = { ...defaultDeps, ...deps };
  const platform = runtime._platform ?? process.platform;
  const sessions = new Map<string, {
    session: TerminalSession;
    pty: pty.IPty | null;
    subscribers: Set<(data: string) => void>;
    cols: number;
    rows: number;
    disposables: Array<{ dispose: () => void }>;
  }>();

  const runTmux = async (args: string[]) => runtime.execFile("tmux", args);

  const setSessionOption = async (name: string, option: string, value: string) => {
    try {
      await runTmux(["set-option", "-t", name, option, value]);
    } catch {
      // Best-effort: sessions stay usable even when tmux refuses an option.
    }
  };

  const createSession = async (name: string) => {
    const existing = sessions.get(name);
    if (existing) {
      return existing.session;
    }

    const newSessionArgs = ["new-session", "-d", "-s", name];
    if (runtime.defaultCwd) {
      newSessionArgs.push("-c", runtime.defaultCwd);
    }

    try {
      await runTmux(newSessionArgs);
    } catch (error) {
      try {
        await runTmux(["has-session", "-t", name]);
      } catch {
        throw error;
      }
    }

    await setSessionOption(name, "status", "off");
    await setSessionOption(name, "status-left", "");
    await setSessionOption(name, "status-right", "");
    await setSessionOption(name, "status-style", "bg=default,fg=default");
    await setSessionOption(name, "message-style", "bg=default,fg=default");
    await setSessionOption(name, "message-command-style", "bg=default,fg=default");

    // Add agent binary paths to PATH in the session
    if (runtime.pathPrefix) {
      try {
        await runTmux([
          "send-keys",
          "-t",
          name,
          `export PATH="${runtime.pathPrefix}:$PATH"`,
          "Enter"
        ]);
        // Clear the screen so user doesn't see the export command
        await runTmux(["send-keys", "-t", name, "clear", "Enter"]);
      } catch {
        // Best-effort: continue even if PATH setup fails
      }
    }

    const session = { name, createdAt: new Date() };
    sessions.set(name, {
      session,
      pty: null,
      subscribers: new Set(),
      cols: runtime.defaultCols,
      rows: runtime.defaultRows,
      disposables: []
    });
    return session;
  };

  const disposePty = (entry: {
    pty: pty.IPty | null;
    disposables: Array<{ dispose: () => void }>;
  }, kill: boolean) => {
    const current = entry.pty;
    entry.pty = null;
    for (const disposable of entry.disposables) {
      disposable.dispose();
    }
    entry.disposables = [];
    if (kill && current) {
      try {
        current.kill();
      } catch {}
    }
  };

  const ensurePty = (entry: {
    session: TerminalSession;
    pty: pty.IPty | null;
    subscribers: Set<(data: string) => void>;
    cols: number;
    rows: number;
    disposables: Array<{ dispose: () => void }>;
  }) => {
    if (entry.pty) {
      return entry.pty;
    }

    if (!runtime._skipSpawnHelperCheck) {
      ensureSpawnHelperExecutable(platform);
    }

    const ptyInstance = runtime.spawnPty("tmux", ["attach-session", "-t", entry.session.name], {
      name: "xterm-256color",
      cols: entry.cols,
      rows: entry.rows,
      env: {
        ...runtime.env,
        TERM: "xterm-256color",
        COLORTERM: "truecolor"
      }
    });

    entry.pty = ptyInstance;
    const dataDisposable = ptyInstance.onData((data) => {
      for (const subscriber of entry.subscribers) {
        subscriber(data);
      }
    });
    const exitDisposable = ptyInstance.onExit(() => {
      disposePty(entry, false);
    });
    entry.disposables = [dataDisposable, exitDisposable];

    return ptyInstance;
  };

  const write = async (sessionName: string, data: string) => {
    if (data.length === 0) {
      return;
    }

    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }
    ensurePty(entry).write(data);
  };

  const sendControl = async (sessionName: string, key: TerminalControlKey) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }

    const controlSequence = controlKeyMap[key];
    ensurePty(entry).write(controlSequence);
  };

  const scroll = async (sessionName: string, mode: "lines" | "pages", amount: number) => {
    if (!Number.isFinite(amount) || amount === 0) {
      return;
    }

    if (!sessions.has(sessionName)) {
      return;
    }

    const direction = amount < 0 ? "up" : "down";
    const command = mode === "pages" ? `page-${direction}` : `scroll-${direction}`;
    const steps = Math.min(50, Math.abs(Math.trunc(amount)));

    try {
      await runTmux(["copy-mode", "-e", "-t", sessionName]);
    } catch {
      return;
    }

    for (let index = 0; index < steps; index += 1) {
      try {
        await runTmux(["send-keys", "-t", sessionName, "-X", command]);
      } catch {
        break;
      }
    }
  };

  const resize = async (sessionName: string, cols: number, rows: number) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return;
    }

    entry.cols = cols;
    entry.rows = rows;
    if (entry.pty) {
      entry.pty.resize(cols, rows);
    }
  };

  const onOutput = (sessionName: string, callback: (data: string) => void) => {
    const entry = sessions.get(sessionName);
    if (!entry) {
      return () => undefined;
    }

    entry.subscribers.add(callback);
    ensurePty(entry);

    return () => {
      entry.subscribers.delete(callback);
      if (entry.subscribers.size === 0) {
        disposePty(entry, true);
      }
    };
  };

  const closeSession = async (sessionName: string) => {
    const entry = sessions.get(sessionName);
    if (entry) {
      disposePty(entry, true);
      sessions.delete(sessionName);
    }

    try {
      await runTmux(["kill-session", "-t", sessionName]);
    } catch {
      return;
    }
  };

  return {
    createSession,
    write,
    resize,
    sendControl,
    scroll,
    onOutput,
    closeSession
  };
};

export type MemoryBackendSession = {
  name: string;
  createdAt: Date;
};

export type MemoryTerminalBackend = TerminalBackend & {
  emitOutput: (sessionName: string, data: string) => void;
};

export const createMemoryBackend = (): MemoryTerminalBackend => {
  const sessions = new Map<string, MemoryBackendSession>();
  const emitters = new Map<string, EventEmitter>();

  const getEmitter = (sessionName: string) => {
    let emitter = emitters.get(sessionName);

    if (!emitter) {
      emitter = new EventEmitter();
      emitters.set(sessionName, emitter);
    }

    return emitter;
  };

  const createSession = async (name: string) => {
    const existing = sessions.get(name);

    if (existing) {
      return existing;
    }

    const session = { name, createdAt: new Date() };
    sessions.set(name, session);
    getEmitter(name);

    return session;
  };

  const write = async (sessionName: string, data: string) => {
    getEmitter(sessionName).emit("output", data);
  };

  const sendControl = async () => {
    return;
  };

  const resize = async () => {
    return;
  };

  const scroll = async () => {
    return;
  };

  const onOutput = (sessionName: string, callback: (data: string) => void) => {
    const emitter = getEmitter(sessionName);
    const handler = (data: string) => callback(data);

    emitter.on("output", handler);

    return () => {
      emitter.off("output", handler);
    };
  };

  const closeSession = async (sessionName: string) => {
    sessions.delete(sessionName);
    emitters.delete(sessionName);
  };

  const emitOutput = (sessionName: string, data: string) => {
    getEmitter(sessionName).emit("output", data);
  };

  return {
    createSession,
    write,
    resize,
    sendControl,
    scroll,
    onOutput,
    closeSession,
    emitOutput
  };
};
