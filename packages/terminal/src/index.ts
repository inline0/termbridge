import { EventEmitter } from "node:events";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import type { TerminalControlKey } from "@termbridge/shared";

const execFile = promisify(execFileCallback);

export type TerminalSession = {
  name: string;
  createdAt: Date;
};

export type TerminalBackend = {
  createSession: (name: string) => Promise<TerminalSession>;
  write: (sessionName: string, data: string) => Promise<void>;
  resize: (sessionName: string, cols: number, rows: number) => Promise<void>;
  sendControl: (sessionName: string, key: TerminalControlKey) => Promise<void>;
  onOutput: (sessionName: string, callback: (data: string) => void) => () => void;
  closeSession: (sessionName: string) => Promise<void>;
};

export type TmuxBackendDeps = {
  execFile?: (file: string, args: string[]) => Promise<{ stdout: string }>;
  setInterval?: (handler: () => void, timeout: number) => NodeJS.Timeout;
  clearInterval?: (intervalId: NodeJS.Timeout) => void;
  pollIntervalMs?: number;
};

const controlKeyMap: Record<TerminalControlKey, string> = {
  ctrl_c: "C-c",
  esc: "Escape",
  tab: "Tab",
  up: "Up",
  down: "Down",
  left: "Left",
  right: "Right"
};

const defaultDeps: Required<TmuxBackendDeps> = {
  execFile: async (file, args) => execFile(file, args),
  setInterval,
  clearInterval,
  pollIntervalMs: 120
};

export const createTmuxBackend = (deps: TmuxBackendDeps = {}): TerminalBackend => {
  const runtime = { ...defaultDeps, ...deps };

  const runTmux = async (args: string[]) => runtime.execFile("tmux", args);

  const createSession = async (name: string) => {
    await runTmux(["new-session", "-d", "-s", name]);
    return { name, createdAt: new Date() };
  };

  const write = async (sessionName: string, data: string) => {
    if (data.length === 0) {
      return;
    }

    await runTmux(["send-keys", "-t", sessionName, "-l", data]);
  };

  const sendControl = async (sessionName: string, key: TerminalControlKey) => {
    await runTmux(["send-keys", "-t", sessionName, controlKeyMap[key]]);
  };

  const resize = async (sessionName: string, cols: number, rows: number) => {
    await runTmux([
      "resize-pane",
      "-t",
      sessionName,
      "-x",
      String(cols),
      "-y",
      String(rows)
    ]);
  };

  const onOutput = (sessionName: string, callback: (data: string) => void) => {
    let lastOutput = "";

    const poll = async () => {
      try {
        const { stdout } = await runTmux(["capture-pane", "-p", "-t", sessionName]);
        const next = stdout ?? "";
        const delta = next.startsWith(lastOutput) ? next.slice(lastOutput.length) : next;

        if (delta.length > 0) {
          callback(delta);
        }

        lastOutput = next;
      } catch {
        lastOutput = "";
      }
    };

    void poll();
    const intervalId = runtime.setInterval(() => {
      void poll();
    }, runtime.pollIntervalMs);

    return () => {
      runtime.clearInterval(intervalId);
    };
  };

  const closeSession = async (sessionName: string) => {
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
    onOutput,
    closeSession,
    emitOutput
  };
};
