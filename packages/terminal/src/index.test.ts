import { describe, expect, it, vi } from "vitest";
import type { IPty } from "node-pty";
import { createMemoryBackend, createTmuxBackend } from "./index";

class FakePty {
  dataHandlers: Array<(data: string) => void> = [];
  exitHandlers: Array<(event: { exitCode: number }) => void> = [];
  write = vi.fn();
  resize = vi.fn();
  kill = vi.fn();

  onData(handler: (data: string) => void) {
    this.dataHandlers.push(handler);
    return {
      dispose: vi.fn(() => {
        this.dataHandlers = this.dataHandlers.filter((entry) => entry !== handler);
      })
    };
  }

  onExit(handler: (event: { exitCode: number }) => void) {
    this.exitHandlers.push(handler);
    return {
      dispose: vi.fn(() => {
        this.exitHandlers = this.exitHandlers.filter((entry) => entry !== handler);
      })
    };
  }

  emitData(data: string) {
    for (const handler of this.dataHandlers) {
      handler(data);
    }
  }

  emitExit() {
    for (const handler of this.exitHandlers) {
      handler({ exitCode: 0 });
    }
  }
}

describe("createTmuxBackend", () => {
  it("streams tmux output through a pty", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const ptyInstance = new FakePty();
    const spawnPty = vi.fn(() => ptyInstance as unknown as IPty);

    const backend = createTmuxBackend({
      execFile,
      spawnPty,
      env: { TEST_ENV: "1" },
      defaultCols: 80,
      defaultRows: 24,
      _skipSpawnHelperCheck: true
    });

    await backend.createSession("session");

    const outputs: string[] = [];
    const unsubscribe = backend.onOutput("session", (data) => outputs.push(data));

    ptyInstance.emitData("hello");
    await backend.write("session", "");
    await backend.write("session", "ls");
    await backend.sendControl("session", "ctrl_c");
    await backend.scroll("session", "pages", -1);
    await backend.resize("session", 120, 30);
    unsubscribe();

    expect(execFile).toHaveBeenCalledWith("tmux", ["new-session", "-d", "-s", "session"]);
    expect(execFile).toHaveBeenCalledWith("tmux", ["set-option", "-t", "session", "status", "off"]);
    expect(execFile).toHaveBeenCalledWith("tmux", ["copy-mode", "-e", "-t", "session"]);
    expect(execFile).toHaveBeenCalledWith("tmux", ["send-keys", "-t", "session", "-X", "page-up"]);
    expect(spawnPty).toHaveBeenCalledWith(
      "tmux",
      ["attach-session", "-t", "session"],
      expect.objectContaining({
        name: "xterm-256color",
        cols: 80,
        rows: 24,
        env: expect.objectContaining({
          TERM: "xterm-256color",
          COLORTERM: "truecolor",
          TEST_ENV: "1"
        })
      })
    );
    expect(outputs).toEqual(["hello"]);
    expect(ptyInstance.write).toHaveBeenCalledWith("ls");
    expect(ptyInstance.write).toHaveBeenCalledWith("\x03");
    expect(ptyInstance.resize).toHaveBeenCalledWith(120, 30);
    expect(ptyInstance.kill).toHaveBeenCalled();
  });

  it("reuses an existing session entry", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const backend = createTmuxBackend({
      execFile,
      spawnPty: vi.fn(() => new FakePty() as unknown as IPty)
    });

    const first = await backend.createSession("session");
    const second = await backend.createSession("session");

    expect(second).toBe(first);
    expect(execFile).toHaveBeenCalledTimes(2);
  });

  it("stores resize requests before attach", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const ptyInstance = new FakePty();
    const spawnPty = vi.fn(() => ptyInstance as unknown as IPty);
    const backend = createTmuxBackend({
      execFile,
      spawnPty,
      _skipSpawnHelperCheck: true
    });

    await backend.createSession("session");
    await backend.resize("session", 120, 40);
    backend.onOutput("session", () => undefined);

    expect(spawnPty).toHaveBeenCalledWith(
      "tmux",
      ["attach-session", "-t", "session"],
      expect.objectContaining({ cols: 120, rows: 40 })
    );
  });

  it("bails when copy-mode fails", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "copy-mode") {
        throw new Error("copy-mode failed");
      }
      return { stdout: "" };
    });
    const backend = createTmuxBackend({ execFile, _skipSpawnHelperCheck: true, spawnPty: vi.fn() });

    await backend.createSession("session");
    await backend.scroll("session", "pages", -1);

    const sendKeysCalls = execFile.mock.calls.filter(([_file, args]) => args[0] === "send-keys");
    expect(sendKeysCalls).toHaveLength(0);
  });

  it("stops scrolling when send-keys fails", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "send-keys") {
        throw new Error("send-keys failed");
      }
      return { stdout: "" };
    });
    const backend = createTmuxBackend({ execFile, _skipSpawnHelperCheck: true, spawnPty: vi.fn() });

    await backend.createSession("session");
    await backend.scroll("session", "lines", -2);

    const sendKeysCalls = execFile.mock.calls.filter(([_file, args]) => args[0] === "send-keys");
    expect(sendKeysCalls).toHaveLength(1);
  });

  it("ignores scroll requests with invalid amounts", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const backend = createTmuxBackend({ execFile, _skipSpawnHelperCheck: true, spawnPty: vi.fn() });

    await backend.createSession("session");
    await backend.scroll("session", "pages", 0);
    await backend.scroll("session", "pages", Number.NaN);

    expect(execFile).not.toHaveBeenCalledWith("tmux", expect.arrayContaining(["copy-mode"]));
    expect(execFile).not.toHaveBeenCalledWith("tmux", expect.arrayContaining(["send-keys"]));
  });

  it("scrolls down when the amount is positive", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const spawnPty = vi.fn(() => new FakePty() as unknown as IPty);
    const backend = createTmuxBackend({ execFile, _skipSpawnHelperCheck: true, spawnPty });

    await backend.createSession("session");
    await backend.scroll("session", "pages", 1);

    expect(execFile).toHaveBeenCalledWith("tmux", ["send-keys", "-t", "session", "-X", "page-down"]);
  });

  it("accepts existing tmux sessions", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "new-session") {
        throw new Error("duplicate session");
      }
      return { stdout: "" };
    });
    const backend = createTmuxBackend({ execFile });

    const session = await backend.createSession("session");

    expect(session.name).toBe("session");
    expect(execFile).toHaveBeenCalledWith("tmux", ["has-session", "-t", "session"]);
    expect(execFile).toHaveBeenCalledWith("tmux", ["set-option", "-t", "session", "status", "off"]);
  });

  it("throws when tmux sessions cannot be created", async () => {
    const error = new Error("tmux failed");
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "new-session") {
        throw error;
      }
      if (args[0] === "has-session") {
        throw new Error("missing");
      }
      return { stdout: "" };
    });
    const backend = createTmuxBackend({ execFile });

    await expect(backend.createSession("session")).rejects.toThrow("tmux failed");
  });

  it("continues when tmux status option fails", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "set-option") {
        throw new Error("status failed");
      }
      return { stdout: "" };
    });
    const backend = createTmuxBackend({ execFile });

    const session = await backend.createSession("session");

    expect(session.name).toBe("session");
  });

  it("no-ops for unknown sessions", async () => {
    const backend = createTmuxBackend({
      execFile: vi.fn(async () => ({ stdout: "" })),
      spawnPty: vi.fn(() => new FakePty() as unknown as IPty),
      _skipSpawnHelperCheck: true
    });

    const unsubscribe = backend.onOutput("missing", () => undefined);
    unsubscribe();

    await backend.write("missing", "hi");
    await backend.sendControl("missing", "esc");
    await backend.resize("missing", 10, 5);
    await backend.scroll("missing", "lines", 1);
    await backend.closeSession("missing");

    expect(true).toBe(true);
  });

  it("restarts when the pty exits", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const firstPty = new FakePty();
    const secondPty = new FakePty();
    const ptyInstances = [firstPty, secondPty];
    const spawnPty = vi.fn(() => ptyInstances.shift() as unknown as IPty);

    const backend = createTmuxBackend({
      execFile,
      spawnPty,
      _skipSpawnHelperCheck: true
    });

    await backend.createSession("session");

    const outputs: string[] = [];
    const unsubscribe = backend.onOutput("session", (data) => outputs.push(data));
    firstPty.emitExit();
    unsubscribe();

    backend.onOutput("session", () => undefined);

    expect(spawnPty).toHaveBeenCalledTimes(2);
  });

  it("keeps the pty alive with multiple subscribers", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const ptyInstance = new FakePty();
    const spawnPty = vi.fn(() => ptyInstance as unknown as IPty);
    const backend = createTmuxBackend({
      execFile,
      spawnPty,
      _skipSpawnHelperCheck: true
    });

    await backend.createSession("session");

    const unsubscribeFirst = backend.onOutput("session", () => undefined);
    const unsubscribeSecond = backend.onOutput("session", () => undefined);

    unsubscribeFirst();

    expect(ptyInstance.kill).not.toHaveBeenCalled();

    unsubscribeSecond();
  });

  it("closes sessions and detaches", async () => {
    const execFile = vi.fn(async () => ({ stdout: "" }));
    const ptyInstance = new FakePty();
    const spawnPty = vi.fn(() => ptyInstance as unknown as IPty);

    const backend = createTmuxBackend({
      execFile,
      spawnPty,
      _skipSpawnHelperCheck: true
    });

    await backend.createSession("session");
    backend.onOutput("session", () => undefined);

    await backend.closeSession("session");

    expect(ptyInstance.kill).toHaveBeenCalled();
    expect(execFile).toHaveBeenCalledWith("tmux", ["kill-session", "-t", "session"]);
  });

  it("swallows tmux close errors", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "kill-session") {
        throw new Error("tmux close failed");
      }
      return { stdout: "" };
    });
    const backend = createTmuxBackend({ execFile });

    await backend.closeSession("session");
  });
});

describe("createMemoryBackend", () => {
  it("creates sessions and emits output", async () => {
    const backend = createMemoryBackend();

    const session = await backend.createSession("session");
    const sessionAgain = await backend.createSession("session");

    expect(sessionAgain).toBe(session);

    const outputs: string[] = [];
    const unsubscribe = backend.onOutput("session", (data) => outputs.push(data));

    await backend.write("session", "hello");
    backend.emitOutput("session", "world");

    unsubscribe();
    await backend.sendControl("session", "esc");
    await backend.resize("session", 80, 24);
    await backend.scroll("session", "lines", 1);
    await backend.closeSession("session");

    expect(outputs).toEqual(["hello", "world"]);
  });
});
