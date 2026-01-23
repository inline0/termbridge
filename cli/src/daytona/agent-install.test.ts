import { describe, expect, it, vi } from "vitest";
import { installAgents } from "./agent-install";
import type { Logger } from "../server/server";

const createSandbox = () => ({
  process: {
    executeCommand: vi.fn(async (_command: string) => ({ exitCode: 0 }))
  }
});

const createLogger = (): Logger => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
});

describe("installAgents", () => {
  it("skips when disabled", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    await installAgents(sandbox as any, { enabled: false, packages: ["codex"] }, logger);

    expect(sandbox.process.executeCommand).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("skips when packages list is empty", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    await installAgents(sandbox as any, { enabled: true, packages: [] }, logger);

    expect(sandbox.process.executeCommand).not.toHaveBeenCalled();
  });

  it("warns when npm is missing", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand.mockResolvedValueOnce({ exitCode: 1 });

    await installAgents(sandbox as any, { enabled: true, packages: ["codex"] }, logger);

    expect(logger.warn).toHaveBeenCalledWith("Daytona: npm not available; skipping agent install");
    expect(sandbox.process.executeCommand).toHaveBeenCalledTimes(1);
  });

  it("warns when install fails", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand.mockResolvedValueOnce({ exitCode: 0 });
    sandbox.process.executeCommand.mockResolvedValueOnce({ exitCode: 1 });

    await installAgents(sandbox as any, { enabled: true, packages: ["codex"] }, logger);

    expect(logger.warn).toHaveBeenCalledWith("Daytona: agent install failed");
  });

  it("installs packages when npm is available", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    await installAgents(sandbox as any, { enabled: true, packages: ["codex"] }, logger);

    expect(logger.info).toHaveBeenCalledWith("Daytona: installing coding agents");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith("command -v npm");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith("npm install -g codex");
  });
});
