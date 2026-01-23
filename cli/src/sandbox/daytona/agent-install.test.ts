import { describe, expect, it, vi } from "vitest";
import { installAgents } from "./agent-install";
import type { Logger } from "../../server/server";

const createSandbox = () => ({
  process: {
    executeCommand: vi.fn(async (_command: string) => ({ exitCode: 0, result: "/home/daytona" }))
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

    const result = await installAgents(sandbox as any, { enabled: false, packages: ["codex"], installScripts: [] }, logger);

    expect(result).toEqual({ success: true, installed: [] });
    expect(sandbox.process.executeCommand).not.toHaveBeenCalled();
  });

  it("skips when packages and scripts are empty", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    const result = await installAgents(sandbox as any, { enabled: true, packages: [], installScripts: [] }, logger);

    expect(result).toEqual({ success: true, installed: [] });
    expect(sandbox.process.executeCommand).not.toHaveBeenCalled();
  });

  it("skips npm when npm is missing but still runs scripts", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 1, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: ["codex"], installScripts: ["curl install.sh | bash"] },
      logger
    );

    expect(result.success).toBe(true);
    expect(result.installed).toContain("script:curl install.sh");
    expect(logger.warn).toHaveBeenCalledWith("Sandbox (Daytona): npm not available; skipping npm packages");
  });

  it("returns error when all installs fail", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 1, result: "npm ERR! error" })
      .mockResolvedValueOnce({ exitCode: 1, result: "npm ERR! error" });

    const result = await installAgents(sandbox as any, { enabled: true, packages: ["codex"], installScripts: [] }, logger);

    expect(result.success).toBe(false);
    expect(result.error).toContain("codex");
  });

  it("reports script failures in the error", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 1, result: "script error" });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["curl fail.sh | bash"] },
      logger
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("script:curl fail.sh");
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("script failed"));
  });

  it("installs packages with local prefix when npm is available", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();

    const result = await installAgents(sandbox as any, { enabled: true, packages: ["codex"], installScripts: [] }, logger);

    expect(result).toEqual({ success: true, installed: ["codex"] });
    expect(logger.info).toHaveBeenCalledWith("Sandbox (Daytona): installing coding agents");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith("printf $HOME");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith("command -v npm");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith("mkdir -p /home/daytona/.local");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith(
      "npm install -g --prefix /home/daytona/.local codex",
      undefined,
      undefined,
      180
    );
  });

  it("falls back to default home when home detection fails", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 1, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" });

    const result = await installAgents(sandbox as any, { enabled: true, packages: ["codex"], installScripts: [] }, logger);

    expect(result.success).toBe(true);
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith("mkdir -p /home/daytona/.local");
  });

  it("handles npm failures with missing result", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 1, result: null as any })
      .mockResolvedValueOnce({ exitCode: 1, result: null as any });

    const result = await installAgents(sandbox as any, { enabled: true, packages: ["codex"], installScripts: [] }, logger);

    expect(result.success).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("codex install failed"));
  });

  it("handles script failures with missing result", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 1, result: null as any });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["install.sh"] },
      logger
    );

    expect(result.success).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("script failed: install.sh"));
  });

  it("extracts script name from path with pipes", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["https://example.com/install.sh | bash"] },
      logger
    );

    expect(result.success).toBe(true);
    expect(result.installed[0]).toBe("script:install.sh");
  });

  it("handles undefined packages and scripts in options", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: undefined, installScripts: ["test.sh"] } as any,
      logger
    );

    expect(result.success).toBe(true);
    expect(result.installed).toContain("script:test.sh");
  });

  it("handles undefined installScripts in options", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: ["codex"], installScripts: undefined } as any,
      logger
    );

    expect(result.success).toBe(true);
    expect(result.installed).toContain("codex");
  });

  it("falls back to script slice for scripts with no name", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" });

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["| bash"] },
      logger
    );

    expect(result.success).toBe(true);
    expect(result.installed[0]).toBe("script:| bash");
  });

  it("downloads and executes curl scripts", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" }) // curl download
      .mockResolvedValueOnce({ exitCode: 0, result: "" }); // bash execute

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["curl -fsSL https://example.com/install.sh | bash"] },
      logger
    );

    expect(result.success).toBe(true);
    expect(result.installed[0]).toBe("script:install.sh");
    expect(sandbox.process.executeCommand).toHaveBeenCalledWith(
      expect.stringMatching(/curl -fsSL https:\/\/example\.com\/install\.sh -o \/tmp\/install-\d+\.sh && chmod \+x/),
      undefined,
      undefined,
      60
    );
  });

  it("reports curl download failure", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 1, result: "curl: (22) HTTP 404" }); // curl download fails

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["curl -fsSL https://example.com/missing.sh | bash"] },
      logger
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("script:missing.sh");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Sandbox (Daytona): failed to download script")
    );
  });

  it("reports curl script execution failure", async () => {
    const sandbox = createSandbox();
    const logger = createLogger();
    sandbox.process.executeCommand
      .mockResolvedValueOnce({ exitCode: 0, result: "/home/daytona" })
      .mockResolvedValueOnce({ exitCode: 0, result: "" }) // curl download ok
      .mockResolvedValueOnce({ exitCode: 1, result: "script error" }); // bash execute fails

    const result = await installAgents(
      sandbox as any,
      { enabled: true, packages: [], installScripts: ["curl -fsSL https://example.com/bad.sh | bash"] },
      logger
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("script:bad.sh");
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Sandbox (Daytona): script failed")
    );
  });
});
