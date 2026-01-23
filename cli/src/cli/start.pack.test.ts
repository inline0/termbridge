import { beforeEach, describe, expect, it, vi } from "vitest";

const childProcessMocks = vi.hoisted(() => ({
  spawnSync: vi.fn()
}));

const fsMocks = vi.hoisted(() => ({
  existsSync: vi.fn()
}));

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    spawnSync: (...args: Parameters<typeof childProcessMocks.spawnSync>) =>
      childProcessMocks.spawnSync(...args)
  };
});

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  return {
    ...actual,
    existsSync: (...args: Parameters<typeof fsMocks.existsSync>) => fsMocks.existsSync(...args)
  };
});

import { startCommand } from "./start";

describe("packLocalCli", () => {
  beforeEach(() => {
    childProcessMocks.spawnSync.mockReset();
    fsMocks.existsSync.mockReset();
    childProcessMocks.spawnSync.mockReturnValue({ status: 0, stdout: "termbridge-0.0.0.tgz\n" });
    fsMocks.existsSync.mockReturnValue(true);
  });

  it("warns when npm pack fails", async () => {
    childProcessMocks.spawnSync.mockReturnValue({ status: 1, stderr: "boom" });
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token",
      stop: vi.fn(async () => undefined)
    }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider: () => ({ start }),
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Local CLI pack failed"));
  });

  it("warns when npm pack fails without stderr output", async () => {
    childProcessMocks.spawnSync.mockReturnValue({ status: 1, stderr: "" });
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token",
      stop: vi.fn(async () => undefined)
    }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider: () => ({ start }),
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("Local CLI pack failed");
  });

  it("warns when npm pack produces no output", async () => {
    childProcessMocks.spawnSync.mockReturnValue({ status: 0, stdout: "" });
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token",
      stop: vi.fn(async () => undefined)
    }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider: () => ({ start }),
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("Local CLI pack failed (no output)");
  });

  it("warns when npm pack returns undefined output", async () => {
    childProcessMocks.spawnSync.mockReturnValue({ status: 0, stdout: undefined });
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token",
      stop: vi.fn(async () => undefined)
    }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider: () => ({ start }),
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("Local CLI pack failed (no output)");
  });

  it("passes the packed CLI path to the sandbox provider", async () => {
    childProcessMocks.spawnSync.mockReturnValue({ status: 0, stdout: "termbridge-0.0.0.tgz\n" });
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token",
      stop: vi.fn(async () => undefined)
    }));

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider: () => ({ start }),
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        localCliPackPath: expect.stringContaining("termbridge-0.0.0.tgz")
      })
    );
  });
});
