import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import * as fsPromises from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import type { TerminalBackend } from "@termbridge/terminal";
import type { TerminalListItem } from "@termbridge/shared";
import type { Auth } from "../server/auth";
import type { TunnelProvider } from "@termbridge/tunnel";
import type { TerminalRecord, TerminalRegistry } from "../server/terminal-registry";
import type { StartedServer } from "../server/server";
const daytonaMocks = vi.hoisted(() => ({
  createSandboxDaytonaBackend: vi.fn()
}));

const sandboxDaytonaDirectMocks = vi.hoisted(() => ({
  createSandboxDaytonaServerProvider: vi.fn()
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

vi.mock("../sandbox/daytona/backend", () => ({
  createSandboxDaytonaBackend: daytonaMocks.createSandboxDaytonaBackend
}));

vi.mock("../sandbox/daytona/direct", () => ({
  createSandboxDaytonaServerProvider: sandboxDaytonaDirectMocks.createSandboxDaytonaServerProvider
}));

import { startCommand } from "./start";
import type { StartOptions } from "./start";

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
    daytonaMocks.createSandboxDaytonaBackend.mockReset();
    sandboxDaytonaDirectMocks.createSandboxDaytonaServerProvider.mockReset();
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
    const createSandboxDaytonaProvider = vi.fn(() => ({ start }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(createSandboxDaytonaProvider).toHaveBeenCalled();
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
    sandboxDaytonaDirectMocks.createSandboxDaytonaServerProvider.mockReturnValue({ start });

    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(sandboxDaytonaDirectMocks.createSandboxDaytonaServerProvider).toHaveBeenCalled();
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
    const createSandboxDaytonaProvider = vi.fn(() => ({ start }));
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
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider,
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
    const createSandboxDaytonaProvider = vi.fn(() => ({ start }));
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    await startCommand(
      {
        killOnExit: false,
        noQr: false,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        createSandboxDaytonaProvider,
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("QR output unavailable");
  });

  it("rejects invalid public urls from the sandbox provider in direct mode", async () => {
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "not-a-url",
      token: "token-invalid",
      stop: vi.fn(async () => undefined)
    }));
    const createSandboxDaytonaProvider = vi.fn(() => ({ start }));

    await expect(
      startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          backend: "sandbox-daytona",
          sandboxDaytonaDirect: true
        },
        {
          createSandboxDaytonaProvider,
          process: { on: vi.fn() } as unknown as NodeJS.Process,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      )
    ).rejects.toThrow("invalid public url");
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
            issueWsToken: () => ({ token: "ws-token" }),
            redeemWsToken: () => null,
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
            issueWsToken: () => ({ token: "ws-token" }),
            redeemWsToken: () => null,
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
            issueWsToken: () => ({ token: "ws-token" }),
            redeemWsToken: () => null,
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
            issueWsToken: () => ({ token: "ws-token" }),
            redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

  it("writes share urls when public url includes query params", async () => {
    const tempDir = await fsPromises.mkdtemp(join(tmpdir(), "termbridge-share-query-"));
    const sharePath = join(tempDir, "share.txt");
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4024,
      close: vi.fn(async () => undefined)
    }));
    const auth: Auth = {
      issueToken: () => ({ token: "token-query" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      { killOnExit: false, noQr: true, tunnel: "none", publicUrl: "https://public.example?token=abc" },
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
    expect(contents.trim()).toBe("https://public.example/__tb/s/token-query?token=abc");

    await result.stop();
    await fsPromises.rm(tempDir, { recursive: true, force: true });
  });

  it("writes share urls when public url includes a trailing slash path", async () => {
    const tempDir = await fsPromises.mkdtemp(join(tmpdir(), "termbridge-share-path-"));
    const sharePath = join(tempDir, "share.txt");
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4026,
      close: vi.fn(async () => undefined)
    }));
    const auth: Auth = {
      issueToken: () => ({ token: "token-path" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      {
        killOnExit: false,
        noQr: true,
        tunnel: "none",
        publicUrl: "https://public.example/prefix/"
      },
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
    expect(contents.trim()).toBe("https://public.example/prefix/__tb/s/token-path");

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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
            issueWsToken: () => ({ token: "ws-token" }),
            redeemWsToken: () => null,
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
            issueWsToken: () => ({ token: "ws-token" }),
            redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createSandboxDaytonaBackend).toHaveBeenCalled();
    expect(terminalRegistry.add).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      "sandbox"
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            OPENAI_API_KEY: "openai-key",
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_ENV: "CUSTOM_TOKEN",
            CUSTOM_TOKEN: "custom-value",
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTH_PATHS: "/tmp/claude/auth.json"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        agentEnv: {
          OPENAI_API_KEY: "openai-key",
          CUSTOM_TOKEN: "custom-value"
        },
        agentInstall: {
          enabled: true,
          packages: ["@anthropic-ai/claude-code", "@openai/codex"],
          installScripts: []
        },
        agentAuth: {
          specs: [{ source: "/tmp/claude/auth.json" }]
        }
      })
    );

    await result.stop();
  });

  it("enables agent install when explicit agents are set even without auth files", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4036,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            TERMBRIDGE_SANDBOX_DAYTONA_AGENTS: "claude"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        agentInstall: {
          enabled: true,
          packages: ["@anthropic-ai/claude-code"],
          installScripts: []
        }
      })
    );

    await result.stop();
  });

  it("dedupes repeated auth paths", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4037,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTH_PATHS: "/tmp/auth.json,/tmp/auth.json"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        agentAuth: {
          specs: [{ source: "/tmp/auth.json" }]
        }
      })
    );

    await result.stop();
  });

  const localClaudeAuth = join(homedir(), ".claude", ".credentials.json");
  const localCodexAuth = join(homedir(), ".codex", "auth.json");
  const localOpenCodeAuth = join(homedir(), ".config", "opencode", "opencode.json");
  const hasLocalAgents =
    existsSync(localClaudeAuth) && existsSync(localCodexAuth) && existsSync(localOpenCodeAuth);
  (hasLocalAgents ? it : it.skip)(
    "auto configures agent packages and auth when agents list is provided",
    async () => {
      const listen = vi.fn(async (): Promise<StartedServer> => ({
        port: 4033,
        close: vi.fn(async () => undefined)
      }));
      const createServer = vi.fn(() => ({ listen }));

      const auth: Auth = {
        issueToken: () => ({ token: "token" }),
        issueWsToken: () => ({ token: "ws-token" }),
        redeemWsToken: () => null,
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

      const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

      const result = await startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          backend: "sandbox-daytona",
          sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
        },
        {
          createServer,
          createAuth: () => auth,
          createSandboxDaytonaBackend,
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createTunnelProvider: () => ({
            start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
            stop: vi.fn(async () => undefined)
          }),
          process: {
            env: {
              TERMBRIDGE_SANDBOX_DAYTONA_AGENTS: "claude,codex,opencode"
            },
            on: vi.fn()
          } as unknown as NodeJS.Process,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      );

      expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
        expect.objectContaining({
          agentInstall: {
            enabled: true,
            packages: ["@anthropic-ai/claude-code", "@openai/codex"],
            installScripts: ["curl -fsSL https://opencode.ai/install | bash"]
          },
          agentAuth: {
            specs: [
              { source: localClaudeAuth },
              { source: localCodexAuth },
              { source: localOpenCodeAuth }
            ]
          }
        })
      );

      await result.stop();
    }
  );

  const hasCodexAuth = existsSync(localCodexAuth);
  (hasCodexAuth ? it : it.skip)(
    "dedupes auto and manual auth specs",
    async () => {
      const listen = vi.fn(async (): Promise<StartedServer> => ({
        port: 4034,
        close: vi.fn(async () => undefined)
      }));
      const createServer = vi.fn(() => ({ listen }));

      const auth: Auth = {
        issueToken: () => ({ token: "token" }),
        issueWsToken: () => ({ token: "ws-token" }),
        redeemWsToken: () => null,
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

      const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

      const result = await startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          backend: "sandbox-daytona",
          sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
        },
        {
          createServer,
          createAuth: () => auth,
          createSandboxDaytonaBackend,
          createTerminalRegistry: () => createTerminalRegistryStub(),
          createTunnelProvider: () => ({
            start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
            stop: vi.fn(async () => undefined)
          }),
          process: {
            env: {
              TERMBRIDGE_SANDBOX_DAYTONA_AGENTS: "codex",
              TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTH_PATHS: localCodexAuth
            },
            on: vi.fn()
          } as unknown as NodeJS.Process,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      );

      expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
        expect.objectContaining({
          agentAuth: {
            specs: [{ source: localCodexAuth }]
          }
        })
      );

      await result.stop();
    }
  );

  it("enables agent auto mode when requested", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4035,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTO: "1"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        agentInstall: {
          enabled: true,
          packages: ["@anthropic-ai/claude-code", "@openai/codex"],
          installScripts: ["curl -fsSL https://opencode.ai/install | bash"]
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
    sandboxDaytonaDirectMocks.createSandboxDaytonaServerProvider.mockReturnValue({ start });

    await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaDirect: true
      },
      {
        process: {
          env: {
            ANTHROPIC_API_KEY: "anthropic-key",
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_INSTALL: "0",
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_PACKAGES: "codex,opencode",
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTH_MAPS: "/tmp/auth.json=/home/daytona/.config/claude/auth.json"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        agentEnv: { ANTHROPIC_API_KEY: "anthropic-key" },
        agentInstall: { enabled: false, packages: ["codex", "opencode"], installScripts: [] },
        agentAuth: {
          specs: [
            {
              source: "/tmp/auth.json",
              destination: "/home/daytona/.config/claude/auth.json"
            }
          ]
        }
      })
    );
  });

  it("skips invalid agent auth mappings", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4031,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTH_MAPS: "missing"
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("Skipping invalid auth mapping: missing");
    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.not.objectContaining({
        agentAuth: expect.anything()
      })
    );

    await result.stop();
  });

  it("skips auth mappings with empty destinations", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4032,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => createTerminalRegistryStub(),
        createTunnelProvider: () => ({
          start: vi.fn(async () => ({ publicUrl: "https://tunnel" })),
          stop: vi.fn(async () => undefined)
        }),
        process: {
          env: {
            TERMBRIDGE_SANDBOX_DAYTONA_AGENT_AUTH_MAPS: "foo=   "
          },
          on: vi.fn()
        } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(logger.warn).toHaveBeenCalledWith("Skipping invalid auth mapping: foo=");
    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.not.objectContaining({
        agentAuth: expect.anything()
      })
    );

    await result.stop();
  });

  it("uses the default daytona backend factory when none is provided", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4012,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    daytonaMocks.createSandboxDaytonaBackend.mockReturnValue(terminalBackend);

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
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
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

    expect(daytonaMocks.createSandboxDaytonaBackend).toHaveBeenCalledWith(
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "/"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git",
        sandboxDaytonaPreviewPort: 5173
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git",
        sandboxDaytonaPreviewPort: 5173
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      env: { TERMBRIDGE_SANDBOX_DAYTONA_PREVIEW_PORT: "5173" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger
      }
    );

    await result.stop();

    expect(logger.warn).toHaveBeenCalledWith("Sandbox (Daytona): preview URL unavailable");
  });

  it("ignores invalid preview port values from env", async () => {
    const listen = vi.fn(async (): Promise<StartedServer> => ({
      port: 4023,
      close: vi.fn(async () => undefined)
    }));
    const createServer = vi.fn(() => ({ listen }));

    const auth: Auth = {
      issueToken: () => ({ token: "token" }),
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      env: { TERMBRIDGE_SANDBOX_DAYTONA_PREVIEW_PORT: "not-a-number" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    for (const value of ["1", "true", "yes"]) {
      createSandboxDaytonaBackend.mockClear();
      const processRef = {
        env: { TERMBRIDGE_SANDBOX_DAYTONA_PUBLIC: value },
        on: vi.fn()
      } as unknown as NodeJS.Process;

      const result = await startCommand(
        {
          killOnExit: false,
          noQr: true,
          tunnel: "cloudflare",
          backend: "sandbox-daytona",
          sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
        },
        {
          createServer,
          createAuth: () => auth,
          createSandboxDaytonaBackend,
          createTerminalRegistry: () => terminalRegistry,
          createTunnelProvider: () => tunnelProvider,
          process: processRef,
          logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
        }
      );

      await result.stop();

      expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      env: { TERMBRIDGE_SANDBOX_DAYTONA_DELETE_ON_EXIT: "true" },
      on: vi.fn()
    } as unknown as NodeJS.Process;

    const createSandboxDaytonaBackend = vi.fn(() => terminalBackend);

    const result = await startCommand(
      {
        killOnExit: false,
        noQr: true,
        tunnel: "cloudflare",
        backend: "sandbox-daytona",
        sandboxDaytonaRepo: "https://github.com/inline0/termbridge-test-app.git"
      },
      {
        createServer,
        createAuth: () => auth,
        createSandboxDaytonaBackend,
        createTerminalRegistry: () => terminalRegistry,
        createTunnelProvider: () => tunnelProvider,
        process: processRef,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
      }
    );

    await result.stop();

    expect(createSandboxDaytonaBackend).toHaveBeenCalledWith(
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
      issueWsToken: () => ({ token: "ws-token" }),
      redeemWsToken: () => null,
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
