import { describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveAutoAgents } from "./agent-auto";

const createLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
});

describe("resolveAutoAgents", () => {
  it("returns empty data when no agents are requested", () => {
    const logger = createLogger();
    const result = resolveAutoAgents([], logger, { home: "/tmp" });

    expect(result).toEqual({ agents: [], packages: [], installScripts: [], authSpecs: [] });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("collects agent auth files from a custom home", async () => {
    const home = await mkdtemp(join(tmpdir(), "termbridge-agent-"));
    const claudeAuth = join(home, ".claude", ".credentials.json");
    const codexAuth = join(home, ".codex", "auth.json");

    await mkdir(join(home, ".claude"), { recursive: true });
    await writeFile(claudeAuth, "{}");
    await mkdir(join(home, ".codex"), { recursive: true });
    await writeFile(codexAuth, "{}");

    const logger = createLogger();
    const result = resolveAutoAgents(["claude-code", "codex", "opencode"], logger, { home });

    expect(result.packages).toEqual([
      "@anthropic-ai/claude-code",
      "@openai/codex",
      "opencode-ai"
    ]);
    expect(result.installScripts).toEqual([]);
    // OpenCode doesn't require auth, so only claude and codex have auth specs
    expect(result.authSpecs).toEqual([
      { source: claudeAuth },
      { source: codexAuth }
    ]);
    // OpenCode warns because it has no auth config (by design - uses free model)
    expect(logger.warn).toHaveBeenCalledWith("Sandbox (Daytona): no auth files found for opencode");
  });

  it("expands home when an auth dir uses a tilde path", async () => {
    const home = await mkdtemp(join(tmpdir(), "termbridge-agent-tilde-"));
    const logger = createLogger();
    const result = resolveAutoAgents(
      ["claude-code"],
      logger,
      {
        home,
        definitions: {
          "claude-code": { packages: ["@anthropic-ai/claude-code"], authFiles: [], authDirs: ["~"] },
          codex: { packages: ["@openai/codex"], authFiles: [], authDirs: [] },
          opencode: { packages: [], authFiles: [], authDirs: [] }
        }
      }
    );

    expect(result.authSpecs).toEqual([{ source: home }]);
  });

  it("skips non-existent auth directories", async () => {
    const home = await mkdtemp(join(tmpdir(), "termbridge-agent-nodir-"));
    const logger = createLogger();
    const result = resolveAutoAgents(
      ["claude-code"],
      logger,
      {
        home,
        definitions: {
          "claude-code": { packages: ["@anthropic-ai/claude-code"], authFiles: [], authDirs: ["~/nonexistent-dir"] },
          codex: { packages: ["@openai/codex"], authFiles: [], authDirs: [] },
          opencode: { packages: [], authFiles: [], authDirs: [] }
        }
      }
    );

    // No auth specs since the directory doesn't exist
    expect(result.authSpecs).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Sandbox (Daytona): no auth files found for claude-code");
  });

  it("keeps absolute auth paths intact", async () => {
    const home = await mkdtemp(join(tmpdir(), "termbridge-agent-abs-"));
    const absAuth = join(home, "abs-auth.json");
    await writeFile(absAuth, "{}");
    const logger = createLogger();
    const result = resolveAutoAgents(
      ["codex"],
      logger,
      {
        home,
        definitions: {
          "claude-code": { packages: ["@anthropic-ai/claude-code"], authFiles: [], authDirs: [] },
          codex: { packages: ["@openai/codex"], authFiles: [absAuth], authDirs: [] },
          opencode: { packages: [], authFiles: [], authDirs: [] }
        }
      }
    );

    expect(result.authSpecs).toEqual([{ source: absAuth }]);
  });

  it("expands all agents when requested", () => {
    const logger = createLogger();
    const result = resolveAutoAgents(["all"], logger, { home: "/tmp" });

    expect(result.agents.sort()).toEqual(["claude-code", "codex", "opencode"]);
  });

  it("warns when auth files are missing for a selected agent", () => {
    const logger = createLogger();
    const result = resolveAutoAgents(["codex"], logger, { home: "/tmp" });

    expect(result.authSpecs).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Sandbox (Daytona): no auth files found for codex");
  });

  it("warns on unknown agent names", () => {
    const logger = createLogger();
    const result = resolveAutoAgents(["unknown"], logger, { home: "/tmp" });

    expect(result.agents).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Unknown agent selection: unknown");
  });

  it("warns on empty agent names", () => {
    const logger = createLogger();
    const result = resolveAutoAgents([""], logger, { home: "/tmp" });

    expect(result.agents).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Unknown agent selection: ");
  });

  it("collects install scripts from custom definitions", () => {
    const logger = createLogger();
    const result = resolveAutoAgents(
      ["opencode"],
      logger,
      {
        home: "/tmp",
        definitions: {
          "claude-code": { packages: [], authFiles: [], authDirs: [] },
          codex: { packages: [], authFiles: [], authDirs: [] },
          opencode: {
            packages: [],
            installScript: "curl -fsSL https://example.com/install | bash",
            authFiles: [],
            authDirs: []
          }
        }
      }
    );

    expect(result.installScripts).toEqual(["curl -fsSL https://example.com/install | bash"]);
  });
});
