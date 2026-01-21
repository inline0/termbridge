import { describe, expect, it, vi, beforeEach } from "vitest";
import type { StartedServer } from "../server/server";
import type { TerminalBackend } from "@termbridge/terminal";
import type { TunnelProvider } from "@termbridge/tunnel";

const { existsSync } = vi.hoisted(() => ({
  existsSync: vi.fn(() => false)
}));

vi.mock("node:fs", () => ({
  existsSync
}));

const terminalBackend: TerminalBackend = {
  createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
  write: vi.fn(async () => undefined),
  resize: vi.fn(async () => undefined),
  sendControl: vi.fn(async () => undefined),
  onOutput: () => () => undefined,
  closeSession: vi.fn(async () => undefined)
};

const tunnelProvider: TunnelProvider = {
  start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
  stop: vi.fn(async () => undefined)
};

vi.mock("@termbridge/terminal", () => ({
  createTmuxBackend: vi.fn(() => terminalBackend)
}));

vi.mock("@termbridge/tunnel", () => ({
  createCloudflaredProvider: vi.fn(() => tunnelProvider)
}));

import { startCommand } from "./start";

describe("startCommand defaults", () => {
  beforeEach(() => {
    tunnelProvider.start = vi.fn(async () => ({ publicUrl: "https://tunnel" }));
    tunnelProvider.stop = vi.fn(async () => undefined);
  });

  it("uses default backend factories", async () => {
    const consoleInfo = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4040,
      close: vi.fn(async () => undefined)
    }));

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const result = await startCommand(
      { killOnExit: false, noQr: false, tunnel: "cloudflare" },
      {
        createServer: () => ({ listen }),
        process: processRef
      }
    );

    await result.stop();

    expect(terminalBackend.createSession).toHaveBeenCalled();
    expect(tunnelProvider.start).toHaveBeenCalled();

    consoleInfo.mockRestore();
    consoleWarn.mockRestore();
  });

  it("finds existing ui dist path", async () => {
    existsSync.mockImplementation((path: string) => path.includes("ui/dist"));
    const consoleInfo = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4041,
      close: vi.fn(async () => undefined)
    }));

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const result = await startCommand(
      { killOnExit: false, noQr: false, tunnel: "cloudflare" },
      {
        createServer: () => ({ listen }),
        process: processRef
      }
    );

    await result.stop();
    existsSync.mockReturnValue(false);

    consoleInfo.mockRestore();
    consoleWarn.mockRestore();
  });

  it("logs tunnel failures with the default logger", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    tunnelProvider.start = vi.fn(async () => {
      throw new Error("boom");
    });

    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4050,
      close: vi.fn(async () => undefined)
    }));

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    await expect(
      startCommand(
        { killOnExit: false, noQr: false, tunnel: "cloudflare" },
        {
          createServer: () => ({ listen }),
          process: processRef
        }
      )
    ).rejects.toThrow("boom");

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("handles non-error tunnel failures", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    tunnelProvider.start = vi.fn(async () => {
      throw "bad";
    });

    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4051,
      close: vi.fn(async () => undefined)
    }));

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    await expect(
      startCommand(
        { killOnExit: false, noQr: false, tunnel: "cloudflare" },
        {
          createServer: () => ({ listen }),
          process: processRef
        }
      )
    ).rejects.toBe("bad");

    expect(consoleError).toHaveBeenCalledWith("Tunnel failed: unknown error");
    consoleError.mockRestore();
  });
});
