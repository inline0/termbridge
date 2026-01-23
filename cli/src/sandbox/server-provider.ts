import type { Logger } from "../server/server";

export type SandboxServerStartOptions = {
  repoUrl: string;
  repoBranch?: string;
  repoPath?: string;
  sandboxName?: string;
  public?: boolean;
  deleteOnExit?: boolean;
  gitUsername?: string;
  gitPassword?: string;
  agentEnv?: Record<string, string>;
  agentInstall?: AgentInstallOptions;
  agentAuth?: AgentAuthOptions;
  serverPort: number;
  proxyPort?: number;
  sessionName?: string;
  killOnExit?: boolean;
  hideTerminalSwitcher?: boolean;
  logger?: Logger;
};

export type SandboxServerStartResult = {
  localUrl: string;
  publicUrl: string;
  token: string;
  stop: () => Promise<void>;
};

export type SandboxServerProvider = {
  start: (options: SandboxServerStartOptions) => Promise<SandboxServerStartResult>;
};

export type AgentInstallOptions = {
  enabled: boolean;
  packages: string[];
};

export type AgentAuthSpec = {
  source: string;
  destination?: string;
};

export type AgentAuthOptions = {
  specs: AgentAuthSpec[];
};
