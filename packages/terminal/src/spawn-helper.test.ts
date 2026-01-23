import { describe, expect, it, afterEach, vi } from "vitest";
import { dirname, resolve } from "node:path";
import type { IPty } from "node-pty";

const createPtyStub = () =>
  ({
    onData: vi.fn(() => ({ dispose: vi.fn() })),
    onExit: vi.fn(() => ({ dispose: vi.fn() })),
    write: vi.fn(),
    resize: vi.fn(),
    kill: vi.fn()
  }) as unknown as IPty;

describe("spawn-helper", () => {
  const originalEnv = process.env.TERMBRIDGE_FORCE_SPAWN_HELPER;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.TERMBRIDGE_FORCE_SPAWN_HELPER;
    } else {
      process.env.TERMBRIDGE_FORCE_SPAWN_HELPER = originalEnv;
    }
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("marks spawn-helper as executable when needed", async () => {
    process.env.TERMBRIDGE_FORCE_SPAWN_HELPER = "1";
    const accessSync = vi.fn(() => {
      throw new Error("no access");
    });
    const chmodSync = vi.fn();

    vi.doMock("node:fs", () => ({
      accessSync,
      chmodSync,
      constants: { X_OK: 1 }
    }));

    const loadNativeModule = vi.fn(() => ({ dir: "../prebuilds/darwin-arm64" }));
    const requireFn = Object.assign(
      (id: string) => {
        if (id === "node-pty/lib/utils") {
          return { loadNativeModule };
        }
        throw new Error(`unexpected require: ${id}`);
      },
      {
        resolve: (id: string) => {
          if (id === "node-pty/lib/unixTerminal") {
            return "/fake/node-pty/lib/unixTerminal.js";
          }
          return "/fake/unknown";
        }
      }
    );

    vi.doMock("node:module", () => ({
      createRequire: () => requireFn
    }));

    const { createTmuxBackend } = await import("./index");
    const backend = createTmuxBackend({
      execFile: vi.fn(async () => ({ stdout: "" })),
      spawnPty: vi.fn(() => createPtyStub())
    });

    await backend.createSession("session");
    const unsubscribe = backend.onOutput("session", () => undefined);
    unsubscribe();
    // Call again to cover the idempotent early-return path
    const unsubscribe2 = backend.onOutput("session", () => undefined);
    unsubscribe2();

    expect(accessSync).toHaveBeenCalled();
    expect(chmodSync).toHaveBeenCalledWith(
      resolve(dirname("/fake/node-pty/lib/unixTerminal.js"), "../prebuilds/darwin-arm64/spawn-helper"),
      0o755
    );
  });

  it("surfaces load errors", async () => {
    process.env.TERMBRIDGE_FORCE_SPAWN_HELPER = "1";
    vi.doMock("node:fs", () => ({
      accessSync: vi.fn(),
      chmodSync: vi.fn(),
      constants: { X_OK: 1 }
    }));

    const requireFn = Object.assign(
      () => {
        throw new Error("boom");
      },
      {
        resolve: () => "/fake/node-pty/lib/unixTerminal.js"
      }
    );

    vi.doMock("node:module", () => ({
      createRequire: () => requireFn
    }));

    const { createTmuxBackend } = await import("./index");
    const backend = createTmuxBackend({
      execFile: vi.fn(async () => ({ stdout: "" })),
      spawnPty: vi.fn(() => createPtyStub())
    });

    await backend.createSession("session");

    expect(() => backend.onOutput("session", () => undefined)).toThrow(
      "node-pty spawn-helper unavailable: boom"
    );
  });

  it("stringifies non-error failures", async () => {
    process.env.TERMBRIDGE_FORCE_SPAWN_HELPER = "1";
    vi.doMock("node:fs", () => ({
      accessSync: vi.fn(),
      chmodSync: vi.fn(),
      constants: { X_OK: 1 }
    }));

    const requireFn = Object.assign(
      () => {
        throw "boom";
      },
      {
        resolve: () => "/fake/node-pty/lib/unixTerminal.js"
      }
    );

    vi.doMock("node:module", () => ({
      createRequire: () => requireFn
    }));

    const { createTmuxBackend } = await import("./index");
    const backend = createTmuxBackend({
      execFile: vi.fn(async () => ({ stdout: "" })),
      spawnPty: vi.fn(() => createPtyStub())
    });

    await backend.createSession("session");

    expect(() => backend.onOutput("session", () => undefined)).toThrow(
      "node-pty spawn-helper unavailable: boom"
    );
  });

  it("skips spawn-helper checks on non-darwin by default", async () => {
    delete process.env.TERMBRIDGE_FORCE_SPAWN_HELPER;
    const accessSync = vi.fn();
    const chmodSync = vi.fn();

    vi.doMock("node:fs", () => ({
      accessSync,
      chmodSync,
      constants: { X_OK: 1 }
    }));

    const requireFn = Object.assign(
      () => {
        throw new Error("boom");
      },
      {
        resolve: () => "/fake/node-pty/lib/unixTerminal.js"
      }
    );

    vi.doMock("node:module", () => ({
      createRequire: () => requireFn
    }));

    const { createTmuxBackend } = await import("./index");
    const backend = createTmuxBackend({
      execFile: vi.fn(async () => ({ stdout: "" })),
      spawnPty: vi.fn(() => createPtyStub()),
      _platform: "linux"
    });

    await backend.createSession("session");

    expect(() => backend.onOutput("session", () => undefined)).not.toThrow();
    expect(accessSync).not.toHaveBeenCalled();
    expect(chmodSync).not.toHaveBeenCalled();
  });
});
