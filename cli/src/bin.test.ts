import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const runCli = vi.fn();

vi.mock("./cli/run", () => ({
  runCli
}));

describe("bin", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    runCli.mockReset();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it("runs main and sets the exit code", async () => {
    process.env.NODE_ENV = "test";
    runCli.mockResolvedValue(5);

    const { main } = await import("./bin");
    const proc = {
      stdout: { write: vi.fn() },
      stderr: { write: vi.fn() },
      exitCode: 0
    } as unknown as NodeJS.Process;

    await main(["--help"], proc);

    expect(proc.exitCode).toBe(5);
  });

  it("auto-runs outside test mode", async () => {
    process.env.NODE_ENV = "production";
    runCli.mockResolvedValue(0);

    await import("./bin");

    expect(runCli).toHaveBeenCalled();
  });
});
