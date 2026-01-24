import { homedir } from "node:os";
import type { Logger } from "../../server/server";
import type { AgentAuthSpec } from "../server-provider";
import { resolvePath, safeStat } from "../../utils";

export type AgentId = "claude-code" | "codex" | "opencode";

type AgentDefinition = {
  packages: string[];
  installScript?: string;
  authFiles: string[];
  authDirs: string[];
};

const agentDefinitions: Record<AgentId, AgentDefinition> = {
  "claude-code": {
    packages: ["@anthropic-ai/claude-code"],
    authFiles: ["~/.claude/.credentials.json"],
    // Avoid syncing entire ~/.config/claude as it may contain large session data
    authDirs: []
  },
  codex: {
    packages: ["@openai/codex"],
    authFiles: ["~/.codex/auth.json"],
    // Avoid syncing entire ~/.codex as it contains history and caches
    authDirs: []
  },
  opencode: {
    packages: ["opencode-ai"],
    // OpenCode uses free models and doesn't require auth
    authFiles: [],
    authDirs: []
  }
};

const agentAliasMap: Record<string, AgentId> = {
  "claude-code": "claude-code",
  "@anthropic-ai/claude-code": "claude-code",
  codex: "codex",
  "@openai/codex": "codex",
  opencode: "opencode"
};

const normalizeAgentName = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "" ) {
    return null;
  }
  if (normalized === "all" || normalized === "auto" || normalized === "*") {
    return "all" as const;
  }
  return agentAliasMap[normalized] ?? null;
};

export const resolveAutoAgents = (
  names: string[],
  logger: Logger,
  options: { home?: string; definitions?: Record<AgentId, AgentDefinition> } = {}
) => {
  if (names.length === 0) {
    return { agents: [] as AgentId[], packages: [], installScripts: [], authSpecs: [] as AgentAuthSpec[] };
  }

  const selected = new Set<AgentId>();
  let useAll = false;

  for (const name of names) {
    const normalized = normalizeAgentName(name);
    if (!normalized) {
      logger.warn(`Unknown agent selection: ${name}`);
      continue;
    }
    if (normalized === "all") {
      useAll = true;
      continue;
    }
    selected.add(normalized);
  }

  if (useAll) {
    for (const agent of Object.keys(agentDefinitions) as AgentId[]) {
      selected.add(agent);
    }
  }

  const agents = Array.from(selected);
  if (agents.length === 0) {
    return { agents, packages: [], installScripts: [], authSpecs: [] as AgentAuthSpec[] };
  }

  const definitions = options.definitions ?? agentDefinitions;
  const packages = new Set<string>();
  const installScripts: string[] = [];
  const authSpecs: AgentAuthSpec[] = [];
  const home = options.home ?? homedir();

  for (const agent of agents) {
    const definition = definitions[agent];
    for (const pkg of definition.packages) {
      packages.add(pkg);
    }
    if (definition.installScript) {
      installScripts.push(definition.installScript);
    }

    const foundFiles: string[] = [];
    const foundDirs: string[] = [];

    for (const candidate of definition.authFiles) {
      const resolved = resolvePath(candidate, home);
      const stats = safeStat(resolved);
      if (stats?.isFile()) {
        foundFiles.push(resolved);
      }
    }

    for (const candidate of definition.authDirs) {
      const resolved = resolvePath(candidate, home);
      const stats = safeStat(resolved);
      if (stats?.isDirectory()) {
        foundDirs.push(resolved);
      }
    }

    const sources = foundFiles.length > 0 ? foundFiles : foundDirs;
    if (sources.length === 0) {
      logger.warn(`Sandbox (Daytona): no auth files found for ${agent}`);
      continue;
    }

    for (const source of sources) {
      authSpecs.push({ source });
    }
  }

  return { agents, packages: Array.from(packages), installScripts, authSpecs };
};

export const defaultAgentPackages = [
  "@anthropic-ai/claude-code",
  "@openai/codex"
];
