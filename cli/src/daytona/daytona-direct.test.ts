import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Logger } from "../server/server";
import { createDaytonaSandboxServerProvider } from "./daytona-direct";

const mocks = vi.hoisted(() => {
  const daytonaCreate = vi.fn();
  const daytonaDelete = vi.fn();
  const sandbox = {
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
    git: {
      clone: vi.fn(async () => undefined)
    },
    process: {
      executeCommand: vi.fn(
        async (_command: string, _cwd?: string, _env?: Record<string, string>) => ({
          exitCode: 0
        })
      )
    },
    fs: {
      downloadFile: vi.fn(async (_path: string) => Buffer.from(""))
    },
    getPreviewLink: vi.fn(),
    getSignedPreviewUrl: vi.fn(),
    getWorkDir: vi.fn<() => Promise<string | undefined>>(async () => "/home/daytona")
  };

  return {
    daytonaCreate,
    daytonaDelete,
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

const createLogger = (): Logger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
});

const baseOptions = {
  repoUrl: "https://github.com/inline0/termbridge-test-app.git",
  serverPort: 8080
};

const createProvider = (logger?: Logger) =>
  createDaytonaSandboxServerProvider({ apiKey: "key", apiUrl: "https://api", logger });

const findStartCall = () => {
  const calls = mocks.sandbox.process.executeCommand.mock.calls as Array<unknown[]>;
  return calls.find((call) => String(call[0]).startsWith("nohup"));
};

beforeEach(() => {
  mocks.daytonaCreate.mockReset();
  mocks.daytonaDelete.mockReset();
  mocks.daytonaCreate.mockResolvedValue(mocks.sandbox);
  mocks.daytonaDelete.mockResolvedValue(undefined);
  mocks.sandbox.start.mockReset();
  mocks.sandbox.stop.mockReset();
  mocks.sandbox.stop.mockResolvedValue(undefined);
  mocks.sandbox.git.clone.mockReset();
  mocks.sandbox.process.executeCommand.mockReset();
  mocks.sandbox.process.executeCommand.mockResolvedValue({ exitCode: 0 });
  mocks.sandbox.fs.downloadFile.mockReset();
  mocks.sandbox.getPreviewLink.mockReset();
  mocks.sandbox.getSignedPreviewUrl.mockReset();
  mocks.sandbox.getWorkDir.mockReset();
  mocks.sandbox.getWorkDir.mockResolvedValue("/home/daytona");
});

describe("createDaytonaSandboxServerProvider", () => {
  it("starts the server in the sandbox and returns the share url", async () => {
    vi.useFakeTimers();
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example/", token: "" });
    let shareAttempts = 0;
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        shareAttempts += 1;
        if (shareAttempts === 1) {
          return Buffer.from("");
        }
        return Buffer.from("https://preview.example/__tb/s/token-123");
      }
      if (path.includes(".pid")) {
        return Buffer.from("456");
      }
      throw new Error("missing");
    });

    const provider = createProvider();
    const startPromise = provider.start({
      ...baseOptions,
      proxyPort: 5173,
      sessionName: "session",
      killOnExit: true,
      hideTerminalSwitcher: true
    });
    await vi.advanceTimersByTimeAsync(500);
    const result = await startPromise;
    vi.useRealTimers();

    expect(result.publicUrl).toBe("https://preview.example");
    const startCall = findStartCall();
    expect(startCall?.[0]).toContain("--proxy 5173");
    expect(startCall?.[0]).toContain("--session session");
    expect(startCall?.[0]).toContain("--kill-on-exit");
    expect(startCall?.[2]).toMatchObject({
      TERMBRIDGE_PUBLIC_URL: "https://preview.example",
      TERMBRIDGE_HIDE_TERMINAL_SWITCHER: "1"
    });

    await result.stop();

    expect(mocks.sandbox.process.executeCommand.mock.calls).toContainEqual(["kill 456"]);
    expect(mocks.sandbox.stop).toHaveBeenCalled();
    expect(mocks.daytonaDelete).not.toHaveBeenCalled();
  });

  it("uses the signed preview url when available", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "token" });
    mocks.sandbox.getSignedPreviewUrl.mockResolvedValue({ url: "https://signed.example" });
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://signed.example/__tb/s/token-abc");
      }
      if (path.includes(".pid")) {
        return Buffer.from("not-a-number");
      }
      throw new Error("missing");
    });

    const provider = createProvider();
    const result = await provider.start({
      ...baseOptions,
      repoPath: "/workspace/repo"
    });

    const startCall = findStartCall();
    expect(startCall?.[2]).toMatchObject({
      TERMBRIDGE_PUBLIC_URL: "https://signed.example"
    });
    expect(startCall?.[2]).not.toHaveProperty("TERMBRIDGE_HIDE_TERMINAL_SWITCHER");
    expect(startCall?.[1]).toBe("/workspace/repo");

    await result.stop();
  });

  it("falls back when the signed preview url is empty", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "token" });
    mocks.sandbox.getSignedPreviewUrl.mockResolvedValue({ url: "" });
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/token-empty");
      }
      if (path.includes(".pid")) {
        return Buffer.from("111");
      }
      throw new Error("missing");
    });

    const provider = createProvider();
    const result = await provider.start({ ...baseOptions });

    const startCall = findStartCall();
    expect(startCall?.[2]).toMatchObject({
      TERMBRIDGE_PUBLIC_URL: "https://preview.example"
    });

    await result.stop();
  });

  it("falls back to preview url when signed preview fails", async () => {
    const logger = createLogger();
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "token" });
    mocks.sandbox.getSignedPreviewUrl.mockRejectedValue(new Error("signed failed"));
    mocks.sandbox.getWorkDir.mockResolvedValue(undefined);
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/token-def");
      }
      throw new Error("missing");
    });

    const provider = createProvider(logger);
    const result = await provider.start({
      ...baseOptions,
      repoUrl: "https://example.com/repo"
    });

    const startCall = findStartCall();
    expect(startCall?.[2]).toMatchObject({
      TERMBRIDGE_PUBLIC_URL: "https://preview.example"
    });
    expect(startCall?.[1]).toBe("repo");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Daytona: signed preview url failed")
    );

    await result.stop();
  });

  it("falls back to preview url when signed preview fails with non-errors", async () => {
    const logger = createLogger();
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "token" });
    mocks.sandbox.getSignedPreviewUrl.mockRejectedValue("signed failed");
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/token-nonerror");
      }
      if (path.includes(".pid")) {
        return Buffer.from("333");
      }
      throw new Error("missing");
    });

    const provider = createProvider(logger);
    const result = await provider.start({ ...baseOptions });

    const startCall = findStartCall();
    expect(startCall?.[2]).toMatchObject({
      TERMBRIDGE_PUBLIC_URL: "https://preview.example"
    });
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Daytona: signed preview url failed")
    );

    await result.stop();
  });

  it("falls back to preview url when signed preview fails without a logger", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "token" });
    mocks.sandbox.getSignedPreviewUrl.mockRejectedValue(new Error("signed failed"));
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/token-noop");
      }
      if (path.includes(".pid")) {
        return Buffer.from("222");
      }
      throw new Error("missing");
    });

    const provider = createProvider();
    const result = await provider.start({ ...baseOptions });

    const startCall = findStartCall();
    expect(startCall?.[2]).toMatchObject({
      TERMBRIDGE_PUBLIC_URL: "https://preview.example"
    });

    await result.stop();
  });

  it("installs tmux when missing", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.process.executeCommand.mockImplementation(async (command: string) => {
      if (command.includes("command -v tmux")) {
        return { exitCode: 1 };
      }
      return { exitCode: 0 };
    });
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/token-456");
      }
      if (path.includes(".pid")) {
        return Buffer.from("555");
      }
      throw new Error("missing");
    });

    const logger = createLogger();
    mocks.sandbox.stop.mockRejectedValueOnce(new Error("stop failed"));
    mocks.daytonaDelete.mockRejectedValueOnce(new Error("delete failed"));
    const provider = createProvider(logger);
    const result = await provider.start({ ...baseOptions, deleteOnExit: true });

    expect(logger.info).toHaveBeenCalledWith("Daytona: installing tmux");
    await result.stop();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: stop failed"));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: delete failed"));
  });

  it("cleans up and reports errors when tmux install fails", async () => {
    const logger = createLogger();
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.process.executeCommand.mockImplementation(async (command: string) => {
      if (command.includes("command -v tmux")) {
        return { exitCode: 1 };
      }
      if (command.includes("tmux install failed")) {
        return { exitCode: 1 };
      }
      return { exitCode: 0 };
    });
    mocks.sandbox.stop.mockRejectedValue(new Error("stop failed"));
    mocks.daytonaDelete.mockRejectedValue(new Error("delete failed"));

    const provider = createProvider(logger);

    await expect(
      provider.start({
        ...baseOptions,
        deleteOnExit: true
      })
    ).rejects.toThrow("tmux install failed");

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: stop failed"));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: delete failed"));
  });

  it("cleans up with non-error failures when startup crashes", async () => {
    const logger = createLogger();
    mocks.sandbox.git.clone.mockRejectedValue("clone failed");
    mocks.sandbox.stop.mockRejectedValueOnce("stop failed");
    mocks.daytonaDelete.mockRejectedValueOnce("delete failed");

    const provider = createProvider(logger);

    await expect(provider.start({ ...baseOptions, deleteOnExit: true })).rejects.toBeDefined();

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Daytona: sandbox start failed"));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: stop failed"));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: delete failed"));
  });

  it("skips delete-on-exit cleanup when disabled during failures", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.process.executeCommand.mockImplementation(async (command: string) => {
      if (command.includes("command -v tmux")) {
        return { exitCode: 1 };
      }
      if (command.includes("tmux install failed")) {
        return { exitCode: 1 };
      }
      return { exitCode: 0 };
    });

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow("tmux install failed");
    expect(mocks.daytonaDelete).not.toHaveBeenCalled();
  });

  it("logs non-error delete failures when stopping the sandbox", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/token-stop");
      }
      if (path.includes(".pid")) {
        return Buffer.from("789");
      }
      throw new Error("missing");
    });

    const logger = createLogger();
    const provider = createProvider(logger);
    const result = await provider.start({ ...baseOptions, deleteOnExit: true });
    mocks.sandbox.stop.mockRejectedValueOnce("stop failed");
    mocks.daytonaDelete.mockRejectedValueOnce("delete failed");

    await result.stop();

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: stop failed"));
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Daytona: delete failed"));
  });

  it("fails fast when the sandbox cannot be created", async () => {
    mocks.daytonaCreate.mockRejectedValue(new Error("create failed"));

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow("create failed");
    expect(mocks.sandbox.stop).not.toHaveBeenCalled();
  });

  it("times out when the share url never appears", async () => {
    vi.useFakeTimers();
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.fs.downloadFile.mockRejectedValue(new Error("missing"));

    const provider = createProvider();
    const startPromise = provider.start({ ...baseOptions });
    const assertion = expect(startPromise).rejects.toThrow("share url unavailable");

    await vi.advanceTimersByTimeAsync(90_000);
    await assertion;

    vi.useRealTimers();
  });

  it("rejects invalid share url payloads", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("not-a-url");
      }
      throw new Error("missing");
    });

    const provider = createProvider();

    await expect(
      provider.start({ ...baseOptions, repoUrl: "/" })
    ).rejects.toThrow("invalid share url");
  });

  it("rejects share urls without tokens", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "https://preview.example", token: "" });
    mocks.sandbox.fs.downloadFile.mockImplementation(async (path: string) => {
      if (path.includes("share")) {
        return Buffer.from("https://preview.example/__tb/s/");
      }
      throw new Error("missing");
    });

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow("invalid share url");
  });

  it("rejects blank preview urls", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "   ", token: "" });

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow("missing public url");
  });

  it("rejects missing preview urls", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "", token: "" });

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow(
      "Daytona preview url unavailable"
    );
  });

  it("rejects malformed preview urls", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "not a url", token: "" });

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow("invalid public url");
  });

  it("rejects preview urls with unsupported protocols", async () => {
    mocks.sandbox.getPreviewLink.mockResolvedValue({ url: "ftp://example.com", token: "" });

    const provider = createProvider();

    await expect(provider.start({ ...baseOptions })).rejects.toThrow("invalid public url");
  });
});
