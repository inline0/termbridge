import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Logger } from "../server/server";

const mocks = vi.hoisted(() => {
  const daytonaCreate = vi.fn();
  const daytonaDelete = vi.fn();
  const createPty = vi.fn();
  const getPreviewLink = vi.fn();
  const sandbox = {
    start: vi.fn(async () => undefined),
    git: {
      clone: vi.fn(async () => undefined)
    },
    process: {
      createPty
    },
    getPreviewLink,
    stop: vi.fn(async () => undefined)
  };

  return {
    daytonaCreate,
    daytonaDelete,
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

      delete(...args: Parameters<typeof mocks.daytonaDelete>) {
        return mocks.daytonaDelete(...args);
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

    mocks.daytonaCreate.mockReset();
    mocks.daytonaCreate.mockResolvedValue(mocks.sandbox);
    mocks.daytonaDelete.mockReset();
    mocks.daytonaDelete.mockResolvedValue(undefined);
    mocks.sandbox.start.mockClear();
    mocks.sandbox.git.clone.mockClear();
    mocks.sandbox.getPreviewLink.mockReset();
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

    let resolvePty!: (value: typeof ptyHandle) => void;
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
    resolvePty(ptyHandle);
    await createPromise;

    await backend.createSession("session-deferred");
    await backend.write("session-deferred", "pwd\n");

    await backend.closeSession("session-deferred");
    onData?.(Buffer.from("ignored"));

    mocks.sandbox.getPreviewLink.mockResolvedValueOnce({
      url: "https://preview",
      token: "t",
      sandboxId: "id"
    });
    const previewInfo = await backend.getPreviewUrl?.(3000);
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
    expect(previewInfo).toEqual({
      url: "https://preview",
      headers: {
        "x-daytona-preview-token": "t",
        "x-daytona-skip-preview-warning": "true"
      }
    });
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

  it("deletes the sandbox when deleteOnExit is enabled", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      deleteOnExit: true,
      logger
    });

    await backend.createSession("session-delete");

    await backend.shutdown?.();

    expect(mocks.daytonaDelete).toHaveBeenCalledWith(mocks.sandbox);
  });

  it("logs when sandbox delete fails", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      deleteOnExit: true,
      logger
    });

    await backend.createSession("session-delete-fail");

    mocks.daytonaDelete.mockRejectedValueOnce(new Error("delete fail"));
    await backend.shutdown?.();

    expect(logger.warn).toHaveBeenCalledWith("Daytona: delete failed (delete fail)");
  });

  it("logs non-error sandbox delete failures", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      deleteOnExit: true,
      logger
    });

    await backend.createSession("session-delete-nonerror");

    mocks.daytonaDelete.mockRejectedValueOnce("delete boom");
    await backend.shutdown?.();

    expect(logger.warn).toHaveBeenCalledWith("Daytona: delete failed (unknown error)");
  });

  it("returns null and logs when preview URL fails", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      logger
    });

    await backend.createSession("session-preview");

    mocks.sandbox.getPreviewLink.mockRejectedValueOnce(new Error("preview fail"));
    const previewUrl = await backend.getPreviewUrl?.(8080);

    expect(previewUrl).toBe(null);
    expect(logger.warn).toHaveBeenCalled();
  });

  it("returns null when the preview response has no url", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      logger
    });

    await backend.createSession("session-preview-null");
    mocks.sandbox.getPreviewLink.mockResolvedValueOnce({
      url: undefined,
      token: "token",
      sandboxId: "id"
    });

    const previewUrl = await backend.getPreviewUrl?.(3000);

    expect(previewUrl).toBe(null);
  });

  it("attaches the preview token header when present", async () => {
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      logger: createLogger()
    });

    await backend.createSession("session-preview-token");
    mocks.sandbox.getPreviewLink.mockResolvedValueOnce({
      url: "https://preview.example",
      token: "token-123",
      sandboxId: "id"
    });

    const previewInfo = await backend.getPreviewUrl?.(4000);

    expect(previewInfo).toEqual({
      url: "https://preview.example",
      headers: {
        "x-daytona-preview-token": "token-123",
        "x-daytona-skip-preview-warning": "true"
      }
    });
  });

  it("returns preview info even when the url is not parseable", async () => {
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      logger: createLogger()
    });

    await backend.createSession("session-preview-invalid");
    mocks.sandbox.getPreviewLink.mockResolvedValueOnce({
      url: "not a url",
      token: "token-123",
      sandboxId: "id"
    });

    const previewInfo = await backend.getPreviewUrl?.(4000);

    expect(previewInfo).toEqual({
      url: "not a url",
      headers: {
        "x-daytona-preview-token": "token-123",
        "x-daytona-skip-preview-warning": "true"
      }
    });
  });

  it("returns the preview url when no token is provided", async () => {
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      logger: createLogger()
    });

    await backend.createSession("session-preview-notoken");
    mocks.sandbox.getPreviewLink.mockResolvedValueOnce({
      url: "https://preview.example",
      token: undefined,
      sandboxId: "id"
    });

    const previewInfo = await backend.getPreviewUrl?.(4000);

    expect(previewInfo).toEqual({
      url: "https://preview.example",
      headers: { "x-daytona-skip-preview-warning": "true" }
    });
  });

  it("logs non-error preview failures", async () => {
    const logger = createLogger();
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      logger
    });

    await backend.createSession("session-preview-nonerror");
    mocks.sandbox.getPreviewLink.mockRejectedValueOnce("preview boom");

    const previewUrl = await backend.getPreviewUrl?.(4000);

    expect(previewUrl).toBe(null);
    expect(logger.warn).toHaveBeenCalledWith("Daytona: preview failed (unknown error)");
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

  it("passes the public flag to sandbox creation", async () => {
    const backend = createDaytonaBackend({
      repoUrl: "https://github.com/inline0/termbridge-test-app.git",
      public: true,
      logger: createLogger()
    });

    await backend.createSession("session-public");

    expect(mocks.daytonaCreate).toHaveBeenCalledWith(
      expect.objectContaining({ public: true })
    );
  });
});
