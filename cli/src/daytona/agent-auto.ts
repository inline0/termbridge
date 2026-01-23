import { homedir } from "node:os";
import { resolve } from "node:path";
import { statSync } from "node:fs";
import type { Logger } from "../server/server";
import type { AgentAuthSpec } from "../sandbox/server-provider";

export type AgentId = "claude" | "codex" | "opencode";

type AgentDefinition = {
  packages: string[];
  installScript?: string;
  authFiles: string[];
  authDirs: string[];
};

const agentDefinitions: Record<AgentId, AgentDefinition> = {
  claude: {
    packages: ["@anthropic-ai/claude-code"],
    // OAuth credentials are stored in macOS Keychain, extract with:
    // security find-generic-password -s "Claude Code-credentials" -w > ~/.claude/.credentials.json
    authFiles: ["~/.claude/.credentials.json"],
    authDirs: ["~/.config/claude"]
  },
  codex: {
    packages: ["@openai/codex"],
    authFiles: ["~/.codex/auth.json"],
    authDirs: ["~/.config/codex", "~/.codex"]
  },
  opencode: {
    packages: [],
    installScript: "curl -fsSL https://opencode.ai/install | bash",
    authFiles: ["~/.config/opencode/opencode.json"],
    authDirs: ["~/.config/opencode"]
  }
};

const agentAliasMap: Record<string, AgentId> = {
  claude: "claude",
  "claude-code": "claude",
  "@anthropic-ai/claude-code": "claude",
  codex: "codex",
  "@openai/codex": "codex",
  opencode: "opencode"
};

const expandHome = (value: string, home: string) => {
  if (value === "~") {
    return home;
  }
  if (value.startsWith("~/")) {
    return `${home}/${value.slice(2)}`;
  }
  return value;
};

const resolvePath = (value: string, home: string) => resolve(expandHome(value, home));

const safeStat = (path: string) => {
  try {
    return statSync(path);
  } catch {
    return null;
  }
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
      logger.warn(`Daytona: no auth files found for ${agent}`);
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
