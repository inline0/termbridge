import { describe, expect, it, vi } from "vitest";
import { createMemoryBackend, createTmuxBackend } from "./index";

describe("createTmuxBackend", () => {
  it("runs tmux commands", async () => {
    const calls: string[][] = [];
    const captureOutputs: Array<string | undefined> = [
      "hello",
      "hello",
      "hello world",
      "hello world"
    ];
    const cursorOutputs = ["0 0", "3 0", "11 0", "11 0"];
    let captureIndex = 0;
    let cursorIndex = 0;
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      calls.push(args);
      if (args[0] === "capture-pane") {
        const stdout = captureOutputs[captureIndex];
        captureIndex += 1;
        return { stdout: stdout as string };
      }

      if (args[0] === "display-message") {
        const stdout = cursorOutputs[cursorIndex] ?? "0 0";
        cursorIndex += 1;
        return { stdout };
      }

      return { stdout: "" };
    });

    const intervals: Array<() => void> = [];
    const setIntervalMock = (handler: () => void) => {
      intervals.push(handler);
      return handler as unknown as NodeJS.Timeout;
    };

    const clearIntervalMock = vi.fn();

    const backend = createTmuxBackend({
      execFile,
      setInterval: setIntervalMock,
      clearInterval: clearIntervalMock,
      pollIntervalMs: 1
    });

    await backend.createSession("session");
    await backend.write("session", "");
    await backend.write("session", "ls");
    await backend.resize("session", 80, 24);
    await backend.sendControl("session", "ctrl_c");

    const outputsReceived: string[] = [];
    const unsubscribe = backend.onOutput("session", (data) => outputsReceived.push(data));

    intervals[0]?.();
    intervals[0]?.();
    intervals[0]?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    await backend.closeSession("session");

    expect(calls).toContainEqual(["new-session", "-d", "-s", "session"]);
    expect(calls).toContainEqual(["send-keys", "-t", "session", "-l", "ls"]);
    expect(calls).toContainEqual(["resize-window", "-t", "session", "-x", "80", "-y", "24"]);
    expect(calls).toContainEqual(["send-keys", "-t", "session", "C-c"]);
    expect(calls).toContainEqual(["capture-pane", "-ep", "-t", "session"]);
    expect(calls).toContainEqual([
      "display-message",
      "-p",
      "-t",
      "session",
      "#{cursor_x} #{cursor_y}"
    ]);
    expect(outputsReceived).toEqual([
      "\x1b[2J\x1b[Hhello\x1b[1;1H",
      "\x1b[1;4H",
      "\x1b[2J\x1b[Hhello world\x1b[1;12H"
    ]);
  });

  it("handles polling errors and close failures", async () => {
    const execFile = vi.fn(async () => {
      throw new Error("tmux error");
    });

    const backend = createTmuxBackend({
      execFile,
      setInterval: (handler) => {
        handler();
        return handler as unknown as NodeJS.Timeout;
      },
      clearInterval: () => undefined,
      pollIntervalMs: 1
    });

    const unsubscribe = backend.onOutput("session", () => undefined);
    unsubscribe();

    await backend.closeSession("session");
  });

  it("defaults cursor positions when tmux reports invalid values", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "capture-pane") {
        return { stdout: "hello" };
      }

      if (args[0] === "display-message") {
        return { stdout: "oops" };
      }

      return { stdout: "" };
    });

    const intervals: Array<() => void> = [];
    const setIntervalMock = (handler: () => void) => {
      intervals.push(handler);
      return handler as unknown as NodeJS.Timeout;
    };

    const backend = createTmuxBackend({
      execFile,
      setInterval: setIntervalMock,
      clearInterval: () => undefined,
      pollIntervalMs: 1
    });

    const outputsReceived: string[] = [];
    const unsubscribe = backend.onOutput("session", (data) => outputsReceived.push(data));

    intervals[0]?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    expect(outputsReceived[0]).toBe("\x1b[2J\x1b[Hhello\x1b[1;1H");
  });

  it("handles missing tmux output fields", async () => {
    const execFile = vi.fn(async (_file: string, args: string[]) => {
      if (args[0] === "capture-pane" || args[0] === "display-message") {
        return {} as { stdout: string };
      }

      return { stdout: "" };
    });

    const intervals: Array<() => void> = [];
    const setIntervalMock = (handler: () => void) => {
      intervals.push(handler);
      return handler as unknown as NodeJS.Timeout;
    };

    const backend = createTmuxBackend({
      execFile,
      setInterval: setIntervalMock,
      clearInterval: () => undefined,
      pollIntervalMs: 1
    });

    const outputsReceived: string[] = [];
    const unsubscribe = backend.onOutput("session", (data) => outputsReceived.push(data));

    intervals[0]?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    unsubscribe();

    expect(outputsReceived).toEqual([]);
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
    await backend.closeSession("session");

    expect(outputs).toEqual(["hello", "world"]);
  });
});
