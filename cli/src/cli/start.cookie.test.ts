import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TerminalBackend } from "@termbridge/terminal";
import type { TerminalListItem } from "@termbridge/shared";
import type { Auth } from "../server/auth";
import type { TerminalRecord, TerminalRegistry } from "../server/terminal-registry";
import type { StartedServer } from "../server/server";
import { startCommand, type StartOptions } from "./start";

const authMocks = vi.hoisted(() => ({
  createAuth: vi.fn()
}));

vi.mock("../server/auth", () => ({
  createAuth: (...args: Parameters<typeof authMocks.createAuth>) =>
    authMocks.createAuth(...args)
}));

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

const createTerminalBackendStub = (): TerminalBackend => ({
  createSession: vi.fn(async (name) => ({ name, createdAt: new Date() })),
  write: vi.fn(async () => undefined),
  resize: vi.fn(async () => undefined),
  sendControl: vi.fn(async () => undefined),
  scroll: vi.fn(async () => undefined),
  onOutput: () => () => undefined,
  closeSession: vi.fn(async () => undefined)
});

const createServerStub = () => ({
  listen: vi.fn(async (): Promise<StartedServer> => ({
    port: 4010,
    close: vi.fn(async () => undefined)
  }))
});

const authStub: Auth = {
  issueToken: () => ({ token: "token" }),
  issueWsToken: () => ({ token: "ws-token" }),
  redeemWsToken: () => null,
  redeemToken: () => null,
  getSession: () => null,
  getSessionFromRequest: () => null,
  createSessionCookie: () => "",
  verifyCsrfToken: () => false
};

const runStart = async (env: NodeJS.ProcessEnv, overrides: Partial<StartOptions> = {}) => {
  const options: StartOptions = {
    killOnExit: false,
    noQr: true,
    tunnel: "none",
    publicUrl: "https://public.example",
    backend: "tmux",
    ...overrides
  };

  const result = await startCommand(options, {
    createServer: createServerStub,
    createTerminalBackend: createTerminalBackendStub,
    createTerminalRegistry: createTerminalRegistryStub,
    process: { on: vi.fn(), env } as unknown as NodeJS.Process,
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  });

  await result.stop();
};

describe("startCommand cookie sameSite", () => {
  beforeEach(() => {
    authMocks.createAuth.mockReset();
    authMocks.createAuth.mockReturnValue(authStub);
  });

  it("uses explicit SameSite=None", async () => {
    await runStart({ TERMBRIDGE_COOKIE_SAMESITE: "none" });
    expect(authMocks.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({ cookieSameSite: "None" })
    );
  });

  it("uses explicit SameSite=Strict", async () => {
    await runStart({ TERMBRIDGE_COOKIE_SAMESITE: "strict" });
    expect(authMocks.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({ cookieSameSite: "Strict" })
    );
  });

  it("uses explicit SameSite=Lax", async () => {
    await runStart({ TERMBRIDGE_COOKIE_SAMESITE: "lax" });
    expect(authMocks.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({ cookieSameSite: "Lax" })
    );
  });

  it("defaults to SameSite=None for daytona direct", async () => {
    await runStart({}, { daytonaDirect: true });
    expect(authMocks.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({ cookieSameSite: "None" })
    );
  });

  it("defaults to SameSite=Lax otherwise", async () => {
    await runStart({}, { daytonaDirect: false });
    expect(authMocks.createAuth).toHaveBeenCalledWith(
      expect.objectContaining({ cookieSameSite: "Lax" })
    );
  });
});
