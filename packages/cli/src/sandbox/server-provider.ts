import type { Logger } from "../server/server.ts"

/**
 * Repository, credentials, and lifecycle options for a sandbox server.
 */
export type SandboxServerStartOptions = {
  repoUrl: string
  repoBranch?: string
  repoPath?: string
  sandboxName?: string
  public?: boolean
  deleteOnExit?: boolean
  gitUsername?: string
  gitPassword?: string
  agentEnv?: Record<string, string>
  agentInstall?: AgentInstallOptions
  agentAuth?: AgentAuthOptions
  localCliPackPath?: string
  serverPort: number
  previewPort?: number
  proxyPort?: number
  sessionName?: string
  killOnExit?: boolean
  hideTerminalSwitcher?: boolean
  logger?: Logger
}

/**
 * Share URLs and cleanup handle for a running sandbox server.
 */
export type SandboxServerStartResult = {
  localUrl: string
  publicUrl: string
  token: string
  stop: () => Promise<void>
}

/**
 * Factory contract for starting a remote terminal server.
 */
export type SandboxServerProvider = {
  start: (
    options: SandboxServerStartOptions
  ) => Promise<SandboxServerStartResult>
}

/**
 * Package names and shell scripts used to install sandbox agents.
 */
export type AgentInstallOptions = {
  enabled: boolean
  packages: string[]
  installScripts: string[]
}

/**
 * Local authentication path and its optional remote destination.
 */
export type AgentAuthSpec = {
  source: string
  destination?: string
}

/**
 * Authentication files or directories to copy into the sandbox.
 */
export type AgentAuthOptions = {
  specs: AgentAuthSpec[]
}
