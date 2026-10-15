import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import {
  createMemoryBackend,
  type TerminalBackend,
} from "@termbridge/terminal";
import { createAuth } from "../server/auth";
import { parseArgs } from "./args";
import { helpText } from "./help";
import { startCommand } from "./start";

const setup = (env: NodeJS.ProcessEnv = {}) => {
  const terminalBackend: TerminalBackend = createMemoryBackend();
  const closeSession = vi.spyOn(terminalBackend, "closeSession");
  const shutdown = vi.fn(async () => undefined);
  terminalBackend.shutdown = shutdown;
  const close = vi.fn(async () => undefined);
  const listen = vi.fn(async () => ({ port: 49152, close }));
  const tunnelProvider = {
    start: vi.fn(async () => ({ publicUrl: "https://tunnel.example" })),
    stop: vi.fn(async () => undefined),
  };
  const processRef = Object.assign(new EventEmitter(), {
    env,
  }) as NodeJS.Process;
  const deps = {
    process: processRef,
    createAuth: () =>
      createAuth({
        tokenTtlMs: 90000,
        sessionIdleMs: 1800000,
        sessionMaxMs: 28800000,
      }),
    createServer: () => ({ listen }),
    createTerminalBackend: () => terminalBackend,
    createSandboxDaytonaBackend: vi.fn(() => terminalBackend),
    createSandboxDaytonaProvider: vi.fn(),
    createTunnelProvider: () => tunnelProvider,
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
  const options = parseArgs(["--no-qr", "--kill-on-exit"]).options;
  return {
    deps,
    options,
    terminalBackend,
    closeSession,
    shutdown,
    close,
    listen,
    tunnelProvider,
    processRef,
  };
};

describe("startup regressions", () => {
  it.each([
    [["--no-tunnel"], "cloudflare", false],
    [["--tunnel", "none"], "cloudflare", false],
    [["--tunnel", "cloudflare"], "none", true],
    [[], "none", false],
    [[], undefined, true],
  ] as const)("resolves tunnel flags %j before env %s", async (flags, tunnel, usesTunnel) => {
    const context = setup({ TERMBRIDGE_TUNNEL: tunnel });
    const { options } = parseArgs([
      ...flags,
      "--public-url",
      "http://127.0.0.1:49152",
      "--no-qr",
    ]);
    const result = await startCommand(options, context.deps);
    expect(context.tunnelProvider.start).toHaveBeenCalledTimes(
      usesTunnel ? 1 : 0,
    );
    await result.stop();
  });

  it.each([
    false,
    true,
  ])("rejects a missing repo before starting Daytona (direct %s)", async (direct) => {
    const context = setup({ TERMBRIDGE_BACKEND: "sandbox-daytona" });
    await expect(
      startCommand({ ...context.options, sandboxDirect: direct }, context.deps),
    ).rejects.toThrow("missing sandbox repo");
    expect(context.deps.createSandboxDaytonaBackend).not.toHaveBeenCalled();
    expect(context.deps.createSandboxDaytonaProvider).not.toHaveBeenCalled();
    expect(context.listen).not.toHaveBeenCalled();
  });

  it("rejects a blank repo and accepts a repo from the environment", async () => {
    const context = setup({ TERMBRIDGE_SANDBOX_REPO: "  " });
    const options = { ...context.options, backend: "sandbox-daytona" as const };
    await expect(startCommand(options, context.deps)).rejects.toThrow(
      "missing sandbox repo",
    );
    context.processRef.env.TERMBRIDGE_SANDBOX_REPO =
      "https://example.com/project.git";
    const result = await startCommand(options, context.deps);
    expect(context.deps.createSandboxDaytonaBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        repoUrl: "https://example.com/project.git",
        repoPath: "project",
      }),
    );
    await result.stop();
  });

  it("stops a direct sandbox if its returned public URL is invalid", async () => {
    const context = setup();
    const stop = vi.fn(async () => {
      throw new Error("cleanup failed");
    });
    const createSandboxDaytonaProvider = () => ({
      start: async () => ({
        localUrl: "https://sandbox.example",
        publicUrl: "invalid",
        token: "token",
        stop,
      }),
    });
    await expect(
      startCommand(
        {
          ...context.options,
          backend: "sandbox-daytona",
          sandboxDirect: true,
          sandboxRepo: "https://example.com/project.git",
        },
        { ...context.deps, createSandboxDaytonaProvider },
      ),
    ).rejects.toThrow("invalid public url");
    expect(stop).toHaveBeenCalledOnce();
  });

  it("closes the listener when creating the first session fails", async () => {
    const context = setup();
    vi.spyOn(context.terminalBackend, "createSession").mockRejectedValue(
      new Error("tmux missing"),
    );
    await expect(startCommand(context.options, context.deps)).rejects.toThrow(
      "tmux missing",
    );
    expect(context.close).toHaveBeenCalledOnce();
    expect(context.shutdown).toHaveBeenCalledOnce();
    expect(context.processRef.listenerCount("SIGINT")).toBe(0);
  });

  it("cleans up earlier sessions when a later session fails", async () => {
    const context = setup({ TERMBRIDGE_SESSIONS: "3" });
    vi.spyOn(context.terminalBackend, "createSession")
      .mockResolvedValueOnce({ name: "first", createdAt: new Date() })
      .mockResolvedValueOnce({ name: "second", createdAt: new Date() })
      .mockRejectedValueOnce(new Error("third failed"));
    await expect(startCommand(context.options, context.deps)).rejects.toThrow(
      "third failed",
    );
    expect(context.closeSession.mock.calls).toEqual([["first"], ["second"]]);
    expect(context.close).toHaveBeenCalledOnce();
  });

  it("keeps closing resources when tunnel cleanup fails and preserves the startup error", async () => {
    const context = setup();
    context.tunnelProvider.start.mockRejectedValue(new Error("tunnel missing"));
    context.tunnelProvider.stop.mockRejectedValue(new Error("stop failed"));
    context.close.mockRejectedValue(new Error("close failed"));
    context.closeSession.mockRejectedValue(new Error("session cleanup failed"));
    await expect(startCommand(context.options, context.deps)).rejects.toThrow(
      "tunnel missing",
    );
    expect(context.close).toHaveBeenCalledOnce();
    expect(context.closeSession).toHaveBeenCalledOnce();
    expect(context.shutdown).toHaveBeenCalledOnce();
  });

  it("shuts down the backend if binding the listener fails", async () => {
    const context = setup();
    context.listen.mockRejectedValue(new Error("port in use"));
    await expect(startCommand(context.options, context.deps)).rejects.toThrow(
      "port in use",
    );
    expect(context.shutdown).toHaveBeenCalledOnce();
    expect(context.close).not.toHaveBeenCalled();
  });

  it("makes shutdown idempotent", async () => {
    const context = setup();
    const result = await startCommand(context.options, context.deps);
    await Promise.all([result.stop(), result.stop()]);
    expect(context.closeSession).toHaveBeenCalledOnce();
    expect(context.close).toHaveBeenCalledOnce();
    expect(context.shutdown).toHaveBeenCalledOnce();
  });

  it("documents only options accepted by the argument parser", () => {
    const values: Record<string, string> = {
      "--port": "3000",
      "--proxy": "3001",
      "--dev-proxy-url": "http://localhost:3001",
      "--tunnel-token": "token",
      "--tunnel-url": "https://example.com",
      "--public-url": "https://example.com",
      "--session": "test",
      "--backend": "sandbox-daytona",
      "--sandbox-repo": "https://example.com/repo.git",
      "--sandbox-branch": "main",
      "--sandbox-path": "/repo",
      "--sandbox-name": "test",
      "--sandbox-preview-port": "3001",
      "--tunnel": "none",
    };
    for (const flag of helpText.match(/--[a-z-]+/g) ?? []) {
      const args = values[flag] ? [flag, values[flag]] : [flag];
      expect(() => parseArgs(args)).not.toThrow();
    }
    expect(helpText).toContain("tmux | sandbox-daytona");
  });
});
