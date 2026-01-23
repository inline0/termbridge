import { beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Logger } from "../../server/server";
import { syncAgentAuth } from "./agent-auth";

const createLogger = (): Logger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
});

const createSandbox = () => ({
  process: {
    executeCommand: vi.fn(async (command: string) => {
      if (command.startsWith("printf")) {
        return { exitCode: 0, result: "/home/daytona" };
      }
      return { exitCode: 0, result: "" };
    })
  },
  fs: {
    uploadFiles: vi.fn(async () => undefined)
  }
});

describe("syncAgentAuth", () => {
  let workdir: string;

  beforeEach(async () => {
    workdir = await mkdtemp(join(tmpdir(), "termbridge-auth-"));
  });

  it("skips when no specs are provided", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(sandbox as any, undefined, logger);

    expect(sandbox.process.executeCommand).not.toHaveBeenCalled();
    expect(sandbox.fs.uploadFiles).not.toHaveBeenCalled();
  });

  it("warns when a path is missing", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: join(workdir, "missing") }] },
      logger
    );

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Sandbox (Daytona): auth path missing")
    );
    expect(sandbox.fs.uploadFiles).not.toHaveBeenCalled();
  });

  it("uploads a single file with default destination mapping", async () => {
    const filePath = join(workdir, "auth.json");
    await writeFile(filePath, "token");
    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: filePath }] },
      logger
    );

    expect(sandbox.fs.uploadFiles).toHaveBeenCalledWith([
      {
        source: filePath,
        destination: "/home/daytona/.termbridge/auth/auth.json"
      }
    ]);
    expect(logger.info).toHaveBeenCalledWith("Sandbox (Daytona): synced 1 auth file");
  });

  it("uploads a directory tree with an explicit destination", async () => {
    const dirPath = join(workdir, "config");
    const nestedDir = join(dirPath, "nested");
    await mkdir(nestedDir, { recursive: true });
    const fileA = join(dirPath, "a.json");
    const fileB = join(nestedDir, "b.json");
    await writeFile(fileA, "a");
    await writeFile(fileB, "b");

    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: dirPath, destination: "/home/daytona/.config/agents" }] },
      logger
    );

    const calls = sandbox.fs.uploadFiles.mock.calls as unknown as Array<
      [Array<{ source: string; destination: string }>]
    >;
    const uploads = calls[0]?.[0] ?? [];
    expect(uploads).toEqual(
      expect.arrayContaining([
        { source: fileA, destination: "/home/daytona/.config/agents/a.json" },
        { source: fileB, destination: "/home/daytona/.config/agents/nested/b.json" }
      ])
    );
    expect(logger.info).toHaveBeenCalledWith("Sandbox (Daytona): synced 2 auth files");
  });

  it("skips non-file entries when scanning directories", async () => {
    const dirPath = join(workdir, "config");
    await mkdir(dirPath, { recursive: true });
    const filePath = join(dirPath, "auth.json");
    await writeFile(filePath, "token");
    await symlink(filePath, join(dirPath, "auth-link"));

    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: dirPath, destination: "/home/daytona/.config/agents" }] },
      logger
    );

    expect(sandbox.fs.uploadFiles).toHaveBeenCalledWith([
      { source: filePath, destination: "/home/daytona/.config/agents/auth.json" }
    ]);
  });

  it("falls back to default home when sandbox home lookup fails", async () => {
    const filePath = join(workdir, "auth.json");
    await writeFile(filePath, "token");
    const sandbox = createSandbox();
    sandbox.process.executeCommand.mockImplementation(async (command: string) => {
      if (command.startsWith("printf")) {
        return { exitCode: 1, result: "" };
      }
      return { exitCode: 0, result: "" };
    });
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: filePath, destination: "~/.config/auth.json" }] },
      logger
    );

    expect(sandbox.fs.uploadFiles).toHaveBeenCalledWith([
      {
        source: filePath,
        destination: "/home/daytona/.config/auth.json"
      }
    ]);
  });

  it("expands a home destination shortcut", async () => {
    const filePath = join(workdir, "auth.json");
    await writeFile(filePath, "token");
    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: filePath, destination: "~" }] },
      logger
    );

    expect(sandbox.fs.uploadFiles).toHaveBeenCalledWith([
      {
        source: filePath,
        destination: "/home/daytona"
      }
    ]);
  });

  it("uploads a file under local home to the same relative path", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    const localHome = process.env.HOME ?? workdir;
    const localDir = join(localHome, ".termbridge-agent");
    await mkdir(localDir, { recursive: true });
    const filePath = join(localDir, "auth.json");
    await writeFile(filePath, "token");

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: filePath }] },
      logger
    );

    expect(sandbox.fs.uploadFiles).toHaveBeenCalledWith([
      {
        source: filePath,
        destination: "/home/daytona/.termbridge-agent/auth.json"
      }
    ]);

    await rm(localDir, { recursive: true, force: true });
  });

  it("skips upload when a directory is empty", async () => {
    const emptyDir = join(workdir, "empty");
    await mkdir(emptyDir, { recursive: true });
    const sandbox = createSandbox();
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: emptyDir, destination: "/home/daytona/.config/empty" }] },
      logger
    );

    expect(sandbox.fs.uploadFiles).not.toHaveBeenCalled();
  });

  it("warns when upload fails", async () => {
    const filePath = join(workdir, "auth.json");
    await writeFile(filePath, "token");
    const sandbox = createSandbox();
    sandbox.fs.uploadFiles.mockRejectedValueOnce(new Error("upload error"));
    const logger = createLogger();

    await syncAgentAuth(
      sandbox as any,
      { specs: [{ source: filePath }] },
      logger
    );

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Sandbox (Daytona): auth upload failed")
    );
  });

});
