import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Logger } from "../server/server";

const mocks = vi.hoisted(() => {
  const daytonaCreate = vi.fn();
  const createPty = vi.fn();
  const sandbox = {
    start: vi.fn(async () => undefined),
    git: {
      clone: vi.fn(async () => undefined)
    },
    process: {
      createPty
    },
    stop: vi.fn(async () => undefined)
  };

  return {
    daytonaCreate,
    createPty,
    sandbox
  };
});

const DaytonaMock = vi.hoisted(
  () =>
    class DaytonaMock {
      create(...args: Parameters<typeof mocks.daytonaCreate>) {
        return mocks.daytonaCreate(...args);
      }
    }
);

vi.mock("@daytonaio/sdk", () => ({
  Daytona: DaytonaMock
}));

import { createDaytonaBackend } from "./daytona-backend";

const createLogger = (): Logger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
});

describe("createDaytonaBackend", () => {
  let onData: ((data: Uint8Array) => void) | null;
  let ptyHandle: {
    waitForConnection: ReturnType<typeof vi.fn>;
    sendInput: ReturnType<typeof vi.fn>;
    resize: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    kill: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    onData = null;
    ptyHandle = {
      waitForConnection: vi.fn(async () => undefined),
      sendInput: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      disconnect: vi.fn(async () => undefined),
      kill: vi.fn(async () => undefined)
    };

    mocks.daytonaCreate.mockResolvedValue(mocks.sandbox);
    mocks.sandbox.start.mockClear();
    mocks.sandbox.git.clone.mockClear();
    mocks.sandbox.stop.mockClear();
    mocks.createPty.mockReset();
    mocks.createPty.mockImplementation(async (options) => {
      onData = options.onData;
      return ptyHandle;
    });
  });

  it("creates a sandbox, clones the repo, and streams output", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      repoBranch: "main",
      logger
    });

    await backend.createSession("session-1");

    const output = vi.fn();
    const unsubscribe = backend.onOutput("session-1", output);

    onData?.(new Uint8Array());
    onData?.(Buffer.from("hello"));

    expect(output).toHaveBeenCalledWith("hello");

    await backend.write("session-1", "ls\n");
    await backend.createSession("session-1");
    await backend.write("session-1", "");
    await backend.sendControl("session-1", "ctrl_c");
    await backend.resize("session-1", 120, 40);
    await backend.scroll("session-1", "lines", 1);

    unsubscribe();

    await backend.closeSession("session-1");
    await backend.createSession("session-2");

    expect(mocks.daytonaCreate).toHaveBeenCalled();
    expect(mocks.sandbox.start).toHaveBeenCalled();
    expect(mocks.sandbox.git.clone).toHaveBeenCalledWith(
      "https://github.com/inline0/termbridge-test-app.git",
      "termbridge-test-app",
      "main",
      undefined,
      undefined,
      undefined
    );
    expect(ptyHandle.sendInput).toHaveBeenCalledWith("ls\n");
    expect(ptyHandle.sendInput).toHaveBeenCalledWith("\x03");
    expect(ptyHandle.resize).toHaveBeenCalledWith(120, 40);
    expect(ptyHandle.kill).toHaveBeenCalled();
    expect(ptyHandle.disconnect).toHaveBeenCalled();
  });

  it("handles missing entries, deferred pty creation, and shutdown", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "/",
      logger
    });

    const noop = backend.onOutput("missing", () => undefined);
    noop();

    await backend.write("missing", "data");
    await backend.sendControl("missing", "esc");
    await backend.resize("missing", 10, 10);
    await backend.scroll("missing", "pages", -1);
    await backend.closeSession("missing");

    await backend.shutdown?.();

    let resolvePty: ((value: typeof ptyHandle) => void) | null = null;
    const deferred = new Promise<typeof ptyHandle>((resolve) => {
      resolvePty = resolve;
    });

    mocks.createPty.mockImplementationOnce(async (options) => {
      onData = options.onData;
      return deferred;
    });

    const createPromise = backend.createSession("session-deferred");
    await backend.resize("session-deferred", 90, 30);
    await backend.closeSession("session-deferred");
    resolvePty?.(ptyHandle);
    await createPromise;

    await backend.createSession("session-deferred");
    await backend.write("session-deferred", "pwd\n");

    await backend.closeSession("session-deferred");
    onData?.(Buffer.from("ignored"));

    mocks.sandbox.stop.mockRejectedValueOnce("boom");
    await backend.shutdown?.();

    expect(mocks.sandbox.git.clone).toHaveBeenCalledWith(
      "/",
      "repo",
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(logger.warn).toHaveBeenCalled();
  });

  it("executes noop logger paths", async () => {
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git"
    });

    await backend.createSession("session-noop");

    mocks.sandbox.stop.mockRejectedValueOnce(new Error("stop failed"));
    await backend.shutdown?.();

    mocks.sandbox.git.clone.mockRejectedValueOnce(new Error("clone failed"));
    const failingBackend = createDaytonaBackend({
      repoUrl: "https://example.com/repo.git"
    });

    await expect(failingBackend.createSession("session-error")).rejects.toThrow("clone failed");

    mocks.sandbox.git.clone.mockRejectedValueOnce("clone failure");
    const failingBackendNonError = createDaytonaBackend({
      repoUrl: "https://example.com/other.git"
    });
    await expect(failingBackendNonError.createSession("session-error-2")).rejects.toBe(
      "clone failure"
    );
  });

  it("derives repo names without .git suffix", async () => {
    const backend = createDaytonaBackend({
      repoUrl: "https://example.com/repo",
      logger: createLogger()
    });

    await backend.createSession("session-path");

    expect(mocks.sandbox.git.clone).toHaveBeenCalledWith(
      "https://example.com/repo",
      "repo",
      undefined,
      undefined,
      undefined,
      undefined
    );
  });
});
