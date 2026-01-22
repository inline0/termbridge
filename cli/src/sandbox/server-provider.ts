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
