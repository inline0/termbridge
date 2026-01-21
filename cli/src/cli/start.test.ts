import { describe, expect, it, vi } from "vitest";
import type { TerminalBackend } from "@termbridge/terminal";
import type { Auth } from "../server/auth";
import type { TunnelProvider } from "@termbridge/tunnel";
import type { TerminalRecord, TerminalRegistry } from "../server/terminal-registry";
import type { StartedServer } from "../server/server";
import { startCommand } from "./start";

const createTerminalRegistryStub = (): TerminalRegistry => ({
  add: vi.fn((sessionName: string, label: string, source: "tmux" | "mock") => {
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
