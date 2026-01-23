import { beforeEach, describe, expect, it, vi } from "vitest";
import * as fsPromises from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TerminalBackend } from "@termbridge/terminal";
import type { TerminalListItem } from "@termbridge/shared";
import type { Auth } from "../server/auth";
import type { TunnelProvider } from "@termbridge/tunnel";
import type { TerminalRecord, TerminalRegistry } from "../server/terminal-registry";
import type { StartedServer } from "../server/server";
const daytonaMocks = vi.hoisted(() => ({
  createDaytonaBackend: vi.fn()
}));

const daytonaDirectMocks = vi.hoisted(() => ({
  createDaytonaSandboxProvider: vi.fn()
}));

const fsMocks = vi.hoisted(() => ({
  writeFile: vi.fn()
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  if (!fsMocks.writeFile.getMockImplementation()) {
    fsMocks.writeFile.mockImplementation(actual.writeFile);
  }
  return {
    ...actual,
    writeFile: (...args: Parameters<typeof actual.writeFile>) => fsMocks.writeFile(...args)
  };
});

vi.mock("../daytona/daytona-backend", () => ({
  createDaytonaBackend: daytonaMocks.createDaytonaBackend
}));

vi.mock("../daytona/daytona-direct", () => ({
  createDaytonaSandboxServerProvider: daytonaDirectMocks.createDaytonaSandboxProvider
}));

import { startCommand } from "./start";

const createTerminalRegistryStub = (): TerminalRegistry => ({
  add: vi.fn((sessionName: string, label: string, source: TerminalListItem["source"]) => {
    const record = {
      id: "id",
      label,
      status: "running",
      createdAt: new Date().toISOString(),
      source,
      sessionName
    } satisfies TerminalRecord;
    return record;
  }),
  list: vi.fn(() => []),
  get: vi.fn(() => null),
  remove: vi.fn(() => undefined),
  getSessionNames: vi.fn(() => [])
});

describe("startCommand", () => {
  beforeEach(() => {
    daytonaMocks.createDaytonaBackend.mockReset();
    daytonaDirectMocks.createDaytonaSandboxProvider.mockReset();
    fsMocks.writeFile.mockClear();
  });

  it("starts and stops the stack", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4010,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const signals: Record<string, () => void> = {};
    const processRef = {
      on: (signal: string, handler: () => void) => {
        signals[signal] = handler;
        return processRef;
      }
    } as NodeJS.Process;

    const qr = { generate: vi.fn() };

    const result = await startCommand(
      { killOnExit: true, noQr: false, tunnel: "cloudflare" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        qr,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(listen).toHaveBeenCalled();
    expect(qr.generate).toHaveBeenCalled();

    await result.stop();

    expect(tunnelProvider.stop).toHaveBeenCalled();
    expect(terminalBackend.closeSession).toHaveBeenCalled();

    signals.SIGINT?.();
  });

  it("skips the tunnel when disabled and uses the provided public url", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4011,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "none", publicUrl: "https://public.example" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(result.publicUrl).toBe("https://public.example");
    await result.stop();
  });

  it("normalizes public urls when the tunnel is disabled", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4013,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "none", publicUrl: "https://public.example/" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(result.publicUrl).toBe("https://public.example");
    await result.stop();
  });

  it("uses sandbox provider when daytona direct mode is enabled", async () => {
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token-123",
      stop: vi.fn(async () => undefined)
    }));
    const createSandboxProvider = vi.fn(() => ({ start }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaDirect: true
      },
      {
        createSandboxProvider,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(createSandboxProvider).toHaveBeenCalled();
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ serverPort: 8080, hideTerminalSwitcher: true })
    );
    expect(result.publicUrl).toBe("https://sandbox.example");
  });

  it("uses the default daytona sandbox provider when none is supplied", async () => {
    const stop = vi.fn(async () => undefined);
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token-default",
      stop
    }));
    daytonaDirectMocks.createDaytonaSandboxProvider.mockReturnValue({ start });

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        backend: "daytona",
        daytonaDirect: true
      },
      {
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(daytonaDirectMocks.createDaytonaSandboxProvider).toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
    await result.stop();
  });

  it("emits a QR code in daytona direct mode when available", async () => {
    const stop = vi.fn(async () => undefined);
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token-qr",
      stop
    }));
    const createSandboxProvider = vi.fn(() => ({ start }));
    const qr = { generate: vi.fn() };
    const signals: Record<string, () => void> = {};
    const processRef = {
      on: (signal: string, handler: () => void) => {
        signals[signal] = handler;
        return processRef;
      }
    } as NodeJS.Process;

    await startCommand(
      {
        killOnExit: false,
        noQr: false,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaDirect: true
      },
      {
        createSandboxProvider,
        process: processRef,
        qr,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(qr.generate).toHaveBeenCalledWith(
      "https://sandbox.example/__tb/s/token-qr",
      { small: true }
    );
    signals.SIGINT?.();
    expect(stop).toHaveBeenCalled();
  });

  it("warns when QR output is unavailable in daytona direct mode", async () => {
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token-warn",
      stop: vi.fn(async () => undefined)
    }));
    const createSandboxProvider = vi.fn(() => ({ start }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await startCommand(
      {
        killOnExit: false,
        noQr: false,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaDirect: true
      },
      {
        createSandboxProvider,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("QR output unavailable");
  });

  it("requires a public url when the tunnel is disabled", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4020,
      close: vi.fn(async () => undefined)
    }));

    await expect(
      startCommand(
        { killOnExit: false, noQr: true, tunnel: "none" },
        {
          createServer: () => ({ listen }),
          createTerminalBackend: () => ({
            createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
            write: vi.fn(async () => undefined),
            resize: vi.fn(async () => undefined),
            sendControl: vi.fn(async () => undefined),
            scroll: vi.fn(async () => undefined),
            onOutput: () => () => undefined,
            closeSession: vi.fn(async () => undefined)
          }),
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createAuth: () => ({
            issueToken: () => ({ token: "token" }),
            redeemToken: () => null,
            getSession: () => null,
            getSessionFromRequest: () => null,
            createSessionCookie: () => "",
            verifyCsrfToken: () => false
          }),
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          process: { on: vi.fn() } as unknown as NodeJS.Process
        }
      )
    ).rejects.toThrow("public url required when tunnel disabled");
  });

  it("rejects tunnel tokens when the tunnel is disabled", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4021,
      close: vi.fn(async () => undefined)
    }));

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "none",
          publicUrl: "https://public.example",
          tunnelToken: "token"
        },
        {
          createServer: () => ({ listen }),
          createTerminalBackend: () => ({
            createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
            write: vi.fn(async () => undefined),
            resize: vi.fn(async () => undefined),
            sendControl: vi.fn(async () => undefined),
            scroll: vi.fn(async () => undefined),
            onOutput: () => () => undefined,
            closeSession: vi.fn(async () => undefined)
          }),
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createAuth: () => ({
            issueToken: () => ({ token: "token" }),
            redeemToken: () => null,
            getSession: () => null,
            getSessionFromRequest: () => null,
            createSessionCookie: () => "",
            verifyCsrfToken: () => false
          }),
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          process: { on: vi.fn() } as unknown as NodeJS.Process
        }
      )
    ).rejects.toThrow("tunnel token/url not supported when tunnel disabled");
  });

  it("rejects invalid public urls when the tunnel is disabled", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4022,
      close: vi.fn(async () => undefined)
    }));

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "none",
          publicUrl: "ftp://example.com"
        },
        {
          createServer: () => ({ listen }),
          createTerminalBackend: () => ({
            createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
            write: vi.fn(async () => undefined),
            resize: vi.fn(async () => undefined),
            sendControl: vi.fn(async () => undefined),
            scroll: vi.fn(async () => undefined),
            onOutput: () => () => undefined,
            closeSession: vi.fn(async () => undefined)
          }),
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createAuth: () => ({
            issueToken: () => ({ token: "token" }),
            redeemToken: () => null,
            getSession: () => null,
            getSessionFromRequest: () => null,
            createSessionCookie: () => "",
            verifyCsrfToken: () => false
          }),
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          process: { on: vi.fn() } as unknown as NodeJS.Process
        }
      )
    ).rejects.toThrow("invalid public url");
  });

  it("rejects malformed public urls when the tunnel is disabled", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4023,
      close: vi.fn(async () => undefined)
    }));

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "none",
          publicUrl: "not-a-url"
        },
        {
          createServer: () => ({ listen }),
          createTerminalBackend: () => ({
            createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
            write: vi.fn(async () => undefined),
            resize: vi.fn(async () => undefined),
            sendControl: vi.fn(async () => undefined),
            scroll: vi.fn(async () => undefined),
            onOutput: () => () => undefined,
            closeSession: vi.fn(async () => undefined)
          }),
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createAuth: () => ({
            issueToken: () => ({ token: "token" }),
            redeemToken: () => null,
            getSession: () => null,
            getSessionFromRequest: () => null,
            createSessionCookie: () => "",
            verifyCsrfToken: () => false
          }),
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          process: { on: vi.fn() } as unknown as NodeJS.Process
        }
      )
    ).rejects.toThrow("invalid public url");
  });

  it("writes the share url to a file when configured", async () => {
    const tempDir = await fsPromises.mkdtemp(join(tmpdir(), "termbridge-share-"));
    const sharePath = join(tempDir, "share.txt");
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4024,
      close: vi.fn(async () => undefined)
    }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const processRef = {
      env: { TERMBRIDGE_SHARE_FILE: sharePath },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "none", publicUrl: "https://public.example" },
      {
        createServer: () => ({ listen }),
        createAuth: () => auth,
        createTerminalBackend: () => ({
          createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
          write: vi.fn(async () => undefined),
          resize: vi.fn(async () => undefined),
          sendControl: vi.fn(async () => undefined),
          scroll: vi.fn(async () => undefined),
          onOutput: () => () => undefined,
          closeSession: vi.fn(async () => undefined)
        }),
        createTerminalRegistry: () => createTerminalRegistryStub(),
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    const contents = await fsPromises.readFile(sharePath, "utf8");
    expect(contents.trim()).toBe("https://public.example/__tb/s/token");

    await result.stop();
    await fsPromises.rm(tempDir, { recursive: true, force: true });
  });

  it("logs when share file writes fail", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4025,
      close: vi.fn(async () => undefined)
    }));

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const processRef = {
      env: { TERMBRIDGE_SHARE_FILE: join("/tmp", "missing-dir", "share.txt") },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "none", publicUrl: "https://public.example" },
      {
        createServer: () => ({ listen }),
        createAuth: () => auth,
        createTerminalBackend: () => ({
          createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
          write: vi.fn(async () => undefined),
          resize: vi.fn(async () => undefined),
          sendControl: vi.fn(async () => undefined),
          scroll: vi.fn(async () => undefined),
          onOutput: () => () => undefined,
          closeSession: vi.fn(async () => undefined)
        }),
        createTerminalRegistry: () => createTerminalRegistryStub(),
        process: processRef,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Share file write failed"));
    await result.stop();
  });

  it("logs unknown errors when share file writes fail without an Error", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4026,
      close: vi.fn(async () => undefined)
    }));

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const sharePath = join(tmpdir(), "termbridge-share-nonerror.txt");
    const processRef = {
      env: { TERMBRIDGE_SHARE_FILE: sharePath },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    fsMocks.writeFile.mockRejectedValueOnce("nope");

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "none", publicUrl: "https://public.example" },
      {
        createServer: () => ({ listen }),
        createAuth: () => auth,
        createTerminalBackend: () => ({
          createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
          write: vi.fn(async () => undefined),
          resize: vi.fn(async () => undefined),
          sendControl: vi.fn(async () => undefined),
          scroll: vi.fn(async () => undefined),
          onOutput: () => () => undefined,
          closeSession: vi.fn(async () => undefined)
        }),
        createTerminalRegistry: () => createTerminalRegistryStub(),
        process: processRef,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Share file write failed (unknown error)")
    );
    await result.stop();
  });

  it("rejects invalid tunnel providers from env", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4026,
      close: vi.fn(async () => undefined)
    }));

    const processRef = {
      env: { TERMBRIDGE_TUNNEL: "bogus" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    await expect(
      startCommand(
        { killOnExit: false, noQr: true, tunnel: "cloudflare" },
        {
          createServer: () => ({ listen }),
          createTerminalBackend: () => ({
            createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
            write: vi.fn(async () => undefined),
            resize: vi.fn(async () => undefined),
            sendControl: vi.fn(async () => undefined),
            scroll: vi.fn(async () => undefined),
            onOutput: () => () => undefined,
            closeSession: vi.fn(async () => undefined)
          }),
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createAuth: () => ({
            issueToken: () => ({ token: "token" }),
            redeemToken: () => null,
            getSession: () => null,
            getSessionFromRequest: () => null,
            createSessionCookie: () => "",
            verifyCsrfToken: () => false
          }),
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          process: processRef
        }
      )
    ).rejects.toThrow("invalid tunnel provider");
  });

  it("fails when the tunnel provider is unavailable", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4027,
      close: vi.fn(async () => undefined)
    }));

    await expect(
      startCommand(
        { killOnExit: false, noQr: true, tunnel: "cloudflare" },
        {
          createServer: () => ({ listen }),
          createTerminalBackend: () => ({
            createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
            write: vi.fn(async () => undefined),
            resize: vi.fn(async () => undefined),
            sendControl: vi.fn(async () => undefined),
            scroll: vi.fn(async () => undefined),
            onOutput: () => () => undefined,
            closeSession: vi.fn(async () => undefined)
          }),
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createAuth: () => ({
            issueToken: () => ({ token: "token" }),
            redeemToken: () => null,
            getSession: () => null,
            getSessionFromRequest: () => null,
            createSessionCookie: () => "",
            verifyCsrfToken: () => false
          }),
          createTunnelProvider: () => null as unknown as TunnelProvider,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
          process: { on: vi.fn() } as unknown as NodeJS.Process
        }
      )
    ).rejects.toThrow("tunnel provider unavailable");
  });

  it("defaults to the cloudflare tunnel when no tunnel option is set", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4028,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const result = await startCommand(
      { killOnExit: false, noQr: true } as StartOptions,
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(tunnelProvider.start).toHaveBeenCalled();
    await result.stop();
  });

  it("uses the daytona backend when configured", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4012,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app"
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createDaytonaBackend).toHaveBeenCalled();
    expect(terminalRegistry.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      "daytona"
    );
  });

  it("passes agent env and default install to the daytona backend", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4030,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            OPENAI_API_KEY: "openai-key",
            TERMBRIDGE_DAYTONA_AGENT_ENV: "CUSTOM_TOKEN",
            CUSTOM_TOKEN: "custom-value"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(createDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        agentEnv: {
          OPENAI_API_KEY: "openai-key",
          CUSTOM_TOKEN: "custom-value"
        },
        agentInstall: {
          enabled: true,
          packages: ["@anthropic-ai/claude-code", "@openai/codex", "opencode"]
        }
      })
    );

    await result.stop();
  });

  it("respects agent install env and packages override in daytona direct mode", async () => {
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token-agent",
      stop: vi.fn(async () => undefined)
    }));
    daytonaDirectMocks.createDaytonaSandboxProvider.mockReturnValue({ start });

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        backend: "daytona",
        daytonaDirect: true
      },
      {
        process: {
          env: {
            ANTHROPIC_API_KEY: "anthropic-key",
            TERMBRIDGE_DAYTONA_AGENT_INSTALL: "0",
            TERMBRIDGE_DAYTONA_AGENT_PACKAGES: "codex,opencode"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        agentEnv: { ANTHROPIC_API_KEY: "anthropic-key" },
        agentInstall: { enabled: false, packages: ["codex", "opencode"] }
      })
    );
  });

  it("uses the default daytona backend factory when none is provided", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4012,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    daytonaMocks.createDaytonaBackend.mockReturnValue(terminalBackend);

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(daytonaMocks.createDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({ repoPath: "termbridge-test-app" })
    );
  });

  it("derives the daytona repo path and calls shutdown", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4013,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined),
      shutdown: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "/"
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({ repoPath: "repo" })
    );
    expect(terminalBackend.shutdown).toHaveBeenCalled();
  });

  it("uses daytona preview URL when configured", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4020,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined),
      getPreviewUrl: vi.fn(async () => ({
        url: "https://preview.example",
        headers: { "x-daytona-preview-token": "token", "x-daytona-skip-preview-warning": "true" }
      }))
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git",
        daytonaPreviewPort: 5173
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createServer).toHaveBeenCalledWith(
      expect.objectContaining({
        devProxyUrl: "https://preview.example",
        devProxyHeaders: {
          "x-daytona-preview-token": "token",
          "x-daytona-skip-preview-warning": "true"
        }
      })
    );
    expect(terminalBackend.getPreviewUrl).toHaveBeenCalledWith(5173);
  });

  it("supports legacy preview url strings", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4024,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined),
      getPreviewUrl: vi.fn(async () => "https://legacy-preview.example")
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git",
        daytonaPreviewPort: 5173
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createServer).toHaveBeenCalledWith(
      expect.objectContaining({ devProxyUrl: "https://legacy-preview.example" })
    );
  });

  it("warns when the daytona preview URL cannot be resolved", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4021,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined),
      getPreviewUrl: vi.fn(async () => null)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const processRef = {
      env: { TERMBRIDGE_DAYTONA_PREVIEW_PORT: "5173" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger
      }
    );

    await result.stop();

    expect(logger.warn).toHaveBeenCalledWith("Daytona: preview URL unavailable");
  });

  it("ignores invalid preview port values from env", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4023,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined),
      getPreviewUrl: vi.fn(async () => "https://preview.example")
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      env: { TERMBRIDGE_DAYTONA_PREVIEW_PORT: "not-a-number" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(terminalBackend.getPreviewUrl).not.toHaveBeenCalled();
  });

  it("passes public env variants to the daytona backend", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4022,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    for (const value of ["1", "true", "yes"]) {
      createDaytonaBackend.mockClear();
      const processRef = {
        env: { TERMBRIDGE_DAYTONA_PUBLIC: value },
        on: vi.fn()
      } as unknown as NodeJS.Process;

      const result = await startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          backend: "daytona",
          daytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
        },
        {
          createServer,
          createAuth: () => auth,
          createDaytonaBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          process: processRef,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      );

      await result.stop();

      expect(createDaytonaBackend).toHaveBeenCalledWith(
        expect.objectContaining({ public: true })
      );
    }
  });

  it("passes delete-on-exit env flag to the daytona backend", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4025,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      env: { TERMBRIDGE_DAYTONA_DELETE_ON_EXIT: "true" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "daytona",
        daytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({ deleteOnExit: true })
    );
  });

  it("rejects invalid backend values", async () => {
    const createServer = vi.fn(() => ({
      listen: vi.fn(async (): Promise<StartedServer> => ({
        port: 4014,
        close: vi.fn(async () => undefined)
      }))
    }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const processRef = {
      env: { TERMBRIDGE_BACKEND: "invalid" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    await expect(
      startCommand(
        { killOnExit: false, noQr: true, tunnel: "cloudflare" },
        {
          createServer,
          createAuth: () => auth,
          process: processRef,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      )
    ).rejects.toThrow("invalid backend");
  });

  it("skips qr output when disabled", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4011,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const qr = { generate: vi.fn() };

    await startCommand(
      { killOnExit: false, noQr: true, tunnel: "cloudflare" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        qr,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(qr.generate).not.toHaveBeenCalled();
    expect(terminalBackend.closeSession).not.toHaveBeenCalled();
  });

  it("uses port and session overrides", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 5050,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "cloudflare", port: 7777, session: "custom" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(listen).toHaveBeenCalledWith(7777);
    expect(terminalBackend.createSession).toHaveBeenCalledWith("custom");

    await result.stop();
  });

  it("requires a port when using a tunnel token", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 5051,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          tunnelToken: "token",
          tunnelUrl: "https://example.com"
        },
        {
          createServer,
          createAuth: () => auth,
          createTerminalBackend: () => terminalBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      )
    ).rejects.toThrow("port required when using tunnel token");
  });

  it("requires a tunnel url when using a tunnel token", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 5052,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          port: 5052,
          tunnelToken: "token"
        },
        {
          createServer,
          createAuth: () => auth,
          createTerminalBackend: () => terminalBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      )
    ).rejects.toThrow("tunnel url required when using tunnel token");
  });

  it("rejects invalid tunnel url strings", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 5054,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          port: 5054,
          tunnelToken: "token",
          tunnelUrl: "not-a-url"
        },
        {
          createServer,
          createAuth: () => auth,
          createTerminalBackend: () => terminalBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      )
    ).rejects.toThrow("invalid tunnel url");
  });

  it("rejects non-http tunnel url protocols", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 5055,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          port: 5055,
          tunnelToken: "token",
          tunnelUrl: "ftp://example.com"
        },
        {
          createServer,
          createAuth: () => auth,
          createTerminalBackend: () => terminalBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      )
    ).rejects.toThrow("invalid tunnel url");
  });

  it("passes token and url to the tunnel provider", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 5053,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://example.com" })),
      stop: vi.fn(async () => undefined)
    };

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        port: 5053,
        tunnelToken: "token",
        tunnelUrl: "https://example.com/"
      },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(tunnelProvider.start).toHaveBeenCalledWith("http://127.0.0.1:5053", {
      token: "token",
      publicUrl: "https://example.com"
    });
  });

  it("creates multiple sessions when configured", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 6060,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      env: { TERMBRIDGE_SESSIONS: "3" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    await startCommand(
      { killOnExit: false, noQr: true, tunnel: "cloudflare", session: "dev" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(terminalBackend.createSession).toHaveBeenNthCalledWith(1, "dev");
    expect(terminalBackend.createSession).toHaveBeenNthCalledWith(2, "dev-2");
    expect(terminalBackend.createSession).toHaveBeenNthCalledWith(3, "dev-3");
    expect(terminalBackend.createSession).toHaveBeenCalledTimes(3);
    expect(terminalRegistry.add).toHaveBeenCalledTimes(3);
  });

  it("ignores invalid session counts", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 6061,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      env: { TERMBRIDGE_SESSIONS: "nope" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    await startCommand(
      { killOnExit: false, noQr: true, tunnel: "cloudflare", session: "single" },
      {
        createServer,
        createAuth: () => auth,
        createTerminalBackend: () => terminalBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(terminalBackend.createSession).toHaveBeenCalledTimes(1);
    expect(terminalBackend.createSession).toHaveBeenCalledWith("single");
  });

  it("cleans up when the tunnel fails", async () => {
    const close = vi.fn(async () => undefined);
    const createServer = vi.fn(() => ({
      listen: vi.fn(async (): Promise<StartedServer> => ({ port: 4020, close }))
    }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      redeemToken: () => null,
      getSession: () => null,
      getSessionFromRequest: () => null,
      createSessionCookie: () => "",
      verifyCsrfToken: () => false
    };

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const terminalRegistry = createTerminalRegistryStub();

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => {
        throw new Error("tunnel failed");
      }),
      stop: vi.fn(async () => undefined)
    };

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await expect(
      startCommand(
        { killOnExit: false, noQr: false, tunnel: "cloudflare" },
        {
          createServer,
          createAuth: () => auth,
          createTerminalBackend: () => terminalBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          logger
        }
      )
    ).rejects.toThrow("tunnel failed");

    expect(close).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it("uses default logger and server factory", async () => {
    const consoleInfo = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const terminalBackend: TerminalBackend = {
      createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
      write: vi.fn(async () => undefined),
      resize: vi.fn(async () => undefined),
      sendControl: vi.fn(async () => undefined),
      scroll: vi.fn(async () => undefined),
      onOutput: () => () => undefined,
      closeSession: vi.fn(async () => undefined)
    };

    const tunnelProvider: TunnelProvider = {
      start: vi.fn(async (_url: string, _options?: unknown) => ({ publicUrl: "https://tunnel" })),
      stop: vi.fn(async () => undefined)
    };

    const processRef = {
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const result = await startCommand(
      { killOnExit: false, noQr: true, tunnel: "cloudflare" },
      {
        createTerminalBackend: () => terminalBackend,
        createTunnelProvider: () => tunnelProvider,
        process: processRef
      }
    );

    await result.stop();

    expect(consoleInfo).toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    consoleInfo.mockRestore();
    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });
});
