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
    const claudeAuth = join(home, ".claude.json");
    const codexAuth = join(home, ".codex", "auth.json");
    const opencodeAuth = join(home, ".config", "opencode", "opencode.json");

    await writeFile(claudeAuth, "{}");
    await mkdir(join(home, ".codex"), { recursive: true });
    await writeFile(codexAuth, "{}");
    await mkdir(join(home, ".config", "opencode"), { recursive: true });
    await writeFile(opencodeAuth, "{}");

    const logger = createLogger();
    const result = resolveAutoAgents(["claude", "codex", "opencode"], logger, { home });

    expect(result.packages).toEqual([
      "@anthropic-ai/claude-code",
      "@openai/codex"
    ]);
    expect(result.installScripts).toEqual([
      "curl -fsSL https://opencode.ai/install | bash"
    ]);
    expect(result.authSpecs).toEqual([
      { source: claudeAuth },
      { source: codexAuth },
      { source: opencodeAuth }
    ]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("expands home when an auth dir uses a tilde path", async () => {
    const home = await mkdtemp(join(tmpdir(), "termbridge-agent-tilde-"));
    const logger = createLogger();
    const result = resolveAutoAgents(
      ["claude"],
      logger,
      {
        home,
        definitions: {
          claude: { packages: ["@anthropic-ai/claude-code"], authFiles: [], authDirs: ["~"] },
          codex: { packages: ["@openai/codex"], authFiles: [], authDirs: [] },
          opencode: { packages: [], authFiles: [], authDirs: [] }
        }
      }
    );

    expect(result.authSpecs).toEqual([{ source: home }]);
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
          claude: { packages: ["@anthropic-ai/claude-code"], authFiles: [], authDirs: [] },
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

    expect(result.agents.sort()).toEqual(["claude", "codex", "opencode"]);
  });

  it("warns when auth files are missing for a selected agent", () => {
    const logger = createLogger();
    const result = resolveAutoAgents(["codex"], logger, { home: "/tmp" });

    expect(result.authSpecs).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith("Daytona: no auth files found for codex");
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
});
