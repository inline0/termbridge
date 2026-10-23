import { defaultAgentPackages } from "../sandbox/daytona/agent-auto.ts"
import type { Logger } from "../server/server.ts"
import { parseBoolean, parseList } from "../utils/index.ts"

export const defaultAgentEnvKeys = [
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_ORG_ID",
  "OPENAI_ORGANIZATION",
  "OPENAI_PROJECT",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_BASE_URL",
  "CLAUDE_API_KEY",
  "OPENROUTER_API_KEY",
  "OPENROUTER_BASE_URL",
]

/**
 * Collect explicitly supported environment variables for sandbox agents.
 * @param env - Environment variables to inspect.
 * @returns The supported nonempty agent environment variables.
 */
export const collectAgentEnv = (env: Record<string, string | undefined>) => {
  const extraKeys = parseList(env.TERMBRIDGE_SANDBOX_AGENT_ENV)
  const keys = new Set([...defaultAgentEnvKeys, ...extraKeys])
  const entries = Array.from(keys)
    .map((key) => [key, env[key]])
    .filter(
      ([, value]) => typeof value === "string" && value.length > 0
    ) as Array<[string, string]>
  return Object.fromEntries(entries)
}

const packageAliasMap: Record<string, string> = {
  "claude-code": "@anthropic-ai/claude-code",
  codex: "@openai/codex",
  opencode: "opencode",
}

const normalizePackageName = (name: string) =>
  packageAliasMap[name.trim().toLowerCase()] ?? name

/**
 * Combine explicit and detected agent installation settings.
 * @param env - Environment variables to inspect.
 * @param agentEnv - Environment values selected for sandbox agents.
 * @param autoPackages - Packages discovered from local agent installations.
 * @param autoInstallScripts - Setup scripts discovered for local agents.
 * @param hasAutoAgents - Whether local agent detection found any supported
 *   agents.
 * @returns Resolved installation settings.
 */
export const resolveAgentInstall = (
  env: Record<string, string | undefined>,
  agentEnv: Record<string, string>,
  autoPackages: string[],
  autoInstallScripts: string[],
  hasAutoAgents: boolean
) => {
  const installRaw = env.TERMBRIDGE_SANDBOX_AGENT_INSTALL
  const enabled =
    typeof installRaw === "string"
      ? parseBoolean(installRaw)
      : hasAutoAgents || Object.keys(agentEnv).length > 0
  const packages = parseList(env.TERMBRIDGE_SANDBOX_AGENT_PACKAGES).map(
    normalizePackageName
  )
  return {
    enabled,
    packages:
      packages.length > 0
        ? packages
        : autoPackages.length > 0
          ? autoPackages
          : defaultAgentPackages,
    installScripts: autoInstallScripts,
  }
}

/**
 * Combine explicit and detected authentication paths for sandbox agents.
 * @param env - Environment variables to inspect.
 * @param logger - Destination for setup status and failure messages.
 * @param autoSpecs - Authentication paths discovered for local agents.
 * @returns Resolved authentication files and directories.
 */
export const resolveAgentAuth = (
  env: Record<string, string | undefined>,
  logger: Logger,
  autoSpecs: Array<{ source: string; destination?: string }> = []
) => {
  const paths = parseList(env.TERMBRIDGE_SANDBOX_AGENT_AUTH_PATHS)
  const maps = parseList(env.TERMBRIDGE_SANDBOX_AGENT_AUTH_MAPS)
  const specs: Array<{ source: string; destination?: string }> = [
    ...paths.map((source) => ({ source })),
    ...maps.flatMap((entry) => {
      const [rawSource, rawDestination = ""] = entry.split("=", 2)
      const source = rawSource.trim()
      const destination = rawDestination.trim()
      if (!source || !destination) {
        logger.warn(`Skipping invalid auth mapping: ${entry}`)
        return []
      }
      return [{ source, destination }]
    }),
  ]
  const combined = [...specs, ...autoSpecs]
  const seen = new Set<string>()
  const deduped = combined.filter((spec) => {
    const key = `${spec.source}|${spec.destination ?? ""}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })

  return deduped.length > 0 ? { specs: deduped } : undefined
}

/**
 * Select explicitly requested agents or the automatic detection set.
 * @param env - Environment variables to inspect.
 * @returns The requested agent identifiers.
 */
export const resolveAutoAgentNames = (
  env: Record<string, string | undefined>
) => {
  const explicit = parseList(env.TERMBRIDGE_SANDBOX_AGENTS)
  if (explicit.length > 0) {
    return explicit
  }
  const auto = parseBoolean(env.TERMBRIDGE_SANDBOX_AGENT_AUTO)
  return auto ? ["all"] : []
}
