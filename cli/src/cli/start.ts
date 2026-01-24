import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { TerminalBackend } from "@termbridge/terminal";
import { createTmuxBackend } from "@termbridge/terminal";
import type { TunnelProvider } from "@termbridge/tunnel";
import { createCloudflaredProvider } from "@termbridge/tunnel";
import type { TerminalListItem } from "@termbridge/shared";
import type { Auth } from "../server/auth";
import { createAuth } from "../server/auth";
import { createRateLimiter } from "../server/rate-limit";
import type { TerminalRegistry } from "../server/terminal-registry";
import { createTerminalRegistry } from "../server/terminal-registry";
import type { Logger, StartedServer } from "../server/server";
import { createAppServer } from "../server/server";
import { createSandboxDaytonaBackend, type SandboxDaytonaBackendOptions } from "../sandbox/daytona/backend";
import { defaultAgentPackages, resolveAutoAgents } from "../sandbox/daytona/agent-auto";
import {
  createSandboxDaytonaServerProvider,
  type SandboxDaytonaProviderOptions
} from "../sandbox/daytona/direct";
import type { SandboxServerProvider } from "../sandbox/server-provider";

export type StartOptions = {
  port?: number;
  proxy?: number;
  devProxyUrl?: string; // Direct URL to proxy target for dev mode (enables HMR in iframe)
  session?: string;
  killOnExit: boolean;
  noQr: boolean;
  tunnel: "cloudflare" | "none";
  tunnelToken?: string;
  tunnelUrl?: string;
  publicUrl?: string;
  backend?: "tmux" | "sandbox-daytona";
  sandboxDirect?: boolean;
  sandboxRepo?: string;
  sandboxBranch?: string;
  sandboxPath?: string;
  sandboxName?: string;
  sandboxPreviewPort?: number;
  sandboxPublic?: boolean;
};

export type StartDeps = {
  logger?: Logger;
  process?: NodeJS.Process;
  createAuth?: () => Auth;
  createTerminalBackend?: () => TerminalBackend;
  createSandboxDaytonaBackend?: (options: SandboxDaytonaBackendOptions) => TerminalBackend;
  createSandboxDaytonaProvider?: (options: SandboxDaytonaProviderOptions) => SandboxServerProvider;
  createTerminalRegistry?: () => TerminalRegistry;
  createTunnelProvider?: () => TunnelProvider;
  createServer?: (deps: {
    uiDistPath: string;
    auth: Auth;
    terminalRegistry: TerminalRegistry;
    terminalBackend: TerminalBackend;
    proxyPort?: number;
    devProxyUrl?: string;
    devProxyHeaders?: Record<string, string>;
    hideTerminalSwitcher?: boolean;
    listenHost?: string;
  }) => { listen: (port: number) => Promise<StartedServer> };
  qr?: {
    generate: (text: string, options: { small: boolean }) => void;
  };
};

export type StartResult = {
  localUrl: string;
  publicUrl: string;
  token: string;
  stop: () => Promise<void>;
};

const resolveUiDistPath = () => {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(currentDir, "../../ui/dist"),
    resolve(currentDir, "../ui/dist"),
    resolve(process.cwd(), "ui/dist"),
    resolve(process.cwd(), "cli/ui/dist")
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
};

const packLocalCli = (logger: Logger) => {
  const cliDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const packageJson = resolve(cliDir, "package.json");
  if (!existsSync(packageJson)) {
    return undefined;
  }

  const result = spawnSync("npm", ["pack"], { cwd: cliDir, encoding: "utf8" });
  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim();
    logger.warn(`Local CLI pack failed${stderr ? ` (${stderr})` : ""}`);
    return undefined;
  }

  const lines = result.stdout?.toString().trim().split(/\r?\n/).filter(Boolean) ?? [];
  const filename = lines[lines.length - 1];
  if (!filename) {
    logger.warn("Local CLI pack failed (no output)");
    return undefined;
  }

  return resolve(cliDir, filename);
};

const createDefaultLogger = (): Logger => ({
  info: (message) => console.log(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message)
});

const parseSessionCount = (value: string | undefined) => {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
};

const parseBoolean = (value: string | undefined) => {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const parseOptionalNumber = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseList = (value: string | undefined) => {
  if (!value) {
    return [];
  }
  return value
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const defaultAgentEnvKeys = [
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_ORG_ID",
  "OPENAI_ORGANIZATION",
  "OPENAI_PROJECT",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_BASE_URL",
  "CLAUDE_API_KEY",
  "OPENROUTER_API_KEY",
  "OPENROUTER_BASE_URL"
];

const collectAgentEnv = (env: Record<string, string | undefined>) => {
  const extraKeys = parseList(env.TERMBRIDGE_SANDBOX_AGENT_ENV);
  const keys = new Set([...defaultAgentEnvKeys, ...extraKeys]);
  const entries = Array.from(keys)
    .map((key) => [key, env[key]])
    .filter(([, value]) => typeof value === "string" && value.length > 0) as Array<
    [string, string]
  >;
  return Object.fromEntries(entries);
};

const packageAliasMap: Record<string, string> = {
  "claude-code": "@anthropic-ai/claude-code",
  codex: "@openai/codex",
  opencode: "opencode"
};

const normalizePackageName = (name: string) => packageAliasMap[name.trim().toLowerCase()] ?? name;

const resolveAgentInstall = (
  env: Record<string, string | undefined>,
  agentEnv: Record<string, string>,
  autoPackages: string[],
  autoInstallScripts: string[],
  hasAutoAgents: boolean
) => {
  const installRaw = env.TERMBRIDGE_SANDBOX_AGENT_INSTALL;
  const enabled =
    typeof installRaw === "string"
      ? parseBoolean(installRaw)
      : hasAutoAgents || Object.keys(agentEnv).length > 0;
  const packages = parseList(env.TERMBRIDGE_SANDBOX_AGENT_PACKAGES).map(normalizePackageName);
  return {
    enabled,
    packages: packages.length > 0 ? packages : autoPackages.length > 0 ? autoPackages : defaultAgentPackages,
    installScripts: autoInstallScripts
  };
};

const resolveAgentAuth = (
  env: Record<string, string | undefined>,
  logger: Logger,
  autoSpecs: Array<{ source: string; destination?: string }> = []
) => {
  const paths = parseList(env.TERMBRIDGE_SANDBOX_AGENT_AUTH_PATHS);
  const maps = parseList(env.TERMBRIDGE_SANDBOX_AGENT_AUTH_MAPS);
  const specs: Array<{ source: string; destination?: string }> = [
    ...paths.map((source) => ({ source })),
    ...maps.flatMap((entry) => {
      const [rawSource, rawDestination = ""] = entry.split("=", 2);
      const source = rawSource.trim();
      const destination = rawDestination.trim();
      if (!source || !destination) {
        logger.warn(`Skipping invalid auth mapping: ${entry}`);
        return [];
      }
      return [{ source, destination }];
    })
  ];
  const combined = [...specs, ...autoSpecs];
  const seen = new Set<string>();
  const deduped = combined.filter((spec) => {
    const key = `${spec.source}|${spec.destination ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return deduped.length > 0 ? { specs: deduped } : undefined;
};

const resolveAutoAgentNames = (env: Record<string, string | undefined>) => {
  const explicit = parseList(env.TERMBRIDGE_SANDBOX_AGENTS);
  if (explicit.length > 0) {
    return explicit;
  }
  const auto = parseBoolean(env.TERMBRIDGE_SANDBOX_AGENT_AUTO);
  return auto ? ["all"] : [];
};

const resolveBackendMode = (value: string | undefined): "tmux" | "sandbox-daytona" => {
  if (!value) {
    return "tmux";
  }

  if (value === "tmux" || value === "sandbox-daytona") {
    return value;
  }

  throw new Error("invalid backend");
};

const deriveRepoPath = (repoUrl: string) => {
  const trimmed = repoUrl.replace(/\/$/, "");
  const last = trimmed.split("/").pop();
  if (!last) {
    return "repo";
  }
  return last.endsWith(".git") ? last.slice(0, -4) : last;
};

const normalizePublicUrl = (value: string) => {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("invalid tunnel url");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid tunnel url");
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const normalizeExternalUrl = (value: string) => {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("invalid public url");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid public url");
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const buildShareUrl = (publicUrl: string, token: string) => {
  let parsed: URL;

  try {
    parsed = new URL(publicUrl);
  } catch {
    throw new Error("invalid public url");
  }

  const basePath = parsed.pathname.endsWith("/") ? parsed.pathname : `${parsed.pathname}/`;
  parsed.pathname = `${basePath}__tb/s/${token}`;
  parsed.hash = "";
  return parsed.toString();
};

const resolveTunnelMode = (value: string | undefined): "cloudflare" | "none" => {
  if (!value) {
    return "cloudflare";
  }

  if (value === "cloudflare" || value === "none") {
    return value;
  }

  throw new Error("invalid tunnel provider");
};

const maybeWriteShareFile = async (path: string | undefined, url: string, logger: Logger) => {
  if (!path) {
    return;
  }

  try {
    await writeFile(path, url, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    logger.warn(`Share file write failed (${message})`);
  }
};

export const startCommand = async (
  options: StartOptions,
  deps: StartDeps = {}
): Promise<StartResult> => {
  const logger = deps.logger ?? createDefaultLogger();
  const processRef = deps.process ?? process;
  const env = processRef.env ?? {};
  const insecureCookie =
    env.TERMBRIDGE_INSECURE_COOKIE === "1" || env.TERMBRIDGE_INSECURE_COOKIE === "true";
  const sandboxDirect = options.sandboxDirect ?? parseBoolean(env.TERMBRIDGE_SANDBOX_DIRECT);
  const cookieSameSiteRaw = env.TERMBRIDGE_COOKIE_SAMESITE?.trim().toLowerCase();
  const cookieSameSite =
    cookieSameSiteRaw === "none"
      ? "None"
      : cookieSameSiteRaw === "strict"
        ? "Strict"
        : cookieSameSiteRaw === "lax"
          ? "Lax"
          : sandboxDirect && !insecureCookie
            ? "None"
            : "Lax";
  const auth = (deps.createAuth ?? (() =>
    createAuth({
      tokenTtlMs: 90_000,
      sessionIdleMs: Infinity,
      sessionMaxMs: Infinity,
      cookieSecure: !insecureCookie,
      cookieSameSite
    })))();
  const backendMode = resolveBackendMode(options.backend ?? env.TERMBRIDGE_BACKEND);
  const publicUrlOverride = options.publicUrl ?? env.TERMBRIDGE_PUBLIC_URL;
  const hideTerminalSwitcher = parseBoolean(env.TERMBRIDGE_HIDE_TERMINAL_SWITCHER);
  const tmuxCwd = env.TERMBRIDGE_TMUX_CWD;
  const listenHost = env.TERMBRIDGE_HOST?.trim() || undefined;
  const agentEnv = collectAgentEnv(env);
  const autoAgentNames = resolveAutoAgentNames(env);
  const autoAgents = resolveAutoAgents(autoAgentNames, logger);
  const agentInstall = resolveAgentInstall(env, agentEnv, autoAgents.packages, autoAgents.installScripts, autoAgents.agents.length > 0);
  const agentAuth = resolveAgentAuth(env, logger, autoAgents.authSpecs);
  const sandboxRepo =
    options.sandboxRepo ??
    env.TERMBRIDGE_SANDBOX_REPO ??
    "https://github.com/inline0/termbridge-test-app.git";
  const sandboxPreviewPort =
    options.sandboxPreviewPort ?? parseOptionalNumber(env.TERMBRIDGE_SANDBOX_PREVIEW_PORT);
  const sandboxPublicEnv = env.TERMBRIDGE_SANDBOX_PUBLIC;
  const sandboxPublicOverride =
    options.sandboxPublic ??
    (sandboxPublicEnv ? parseBoolean(sandboxPublicEnv) : undefined);
  const sandboxPublic = sandboxDirect
    ? (sandboxPublicOverride ?? true)
    : (sandboxPublicOverride ?? false);
  const sandboxDeleteOnExit = parseBoolean(env.TERMBRIDGE_SANDBOX_DELETE_ON_EXIT);
  const sandboxConfig: SandboxDaytonaBackendOptions = {
    apiKey: env.TERMBRIDGE_DAYTONA_API_KEY,
    apiUrl: env.TERMBRIDGE_DAYTONA_API_URL,
    target: env.TERMBRIDGE_DAYTONA_TARGET,
    repoUrl: sandboxRepo,
    repoBranch: options.sandboxBranch ?? env.TERMBRIDGE_SANDBOX_BRANCH,
    repoPath: options.sandboxPath ?? env.TERMBRIDGE_SANDBOX_PATH ?? deriveRepoPath(sandboxRepo),
    sandboxName: options.sandboxName ?? env.TERMBRIDGE_SANDBOX_NAME,
    public: sandboxPublic,
    deleteOnExit: sandboxDeleteOnExit,
    gitUsername: env.TERMBRIDGE_SANDBOX_GIT_USERNAME,
    gitPassword: env.TERMBRIDGE_SANDBOX_GIT_PASSWORD ?? env.TERMBRIDGE_SANDBOX_GIT_TOKEN,
    agentEnv,
    agentInstall,
    agentAuth,
    logger
  };

  if (backendMode === "sandbox-daytona" && sandboxDirect) {
    const serverPort =
      options.port ?? parseOptionalNumber(env.TERMBRIDGE_SANDBOX_SERVER_PORT) ?? 8080;
    const proxyPort = options.proxy ?? sandboxPreviewPort;
    const localCliPackPath = packLocalCli(logger);
    const sandboxProvider = (deps.createSandboxDaytonaProvider ?? createSandboxDaytonaServerProvider)({
      apiKey: sandboxConfig.apiKey,
      apiUrl: sandboxConfig.apiUrl,
      target: sandboxConfig.target,
      logger
    });

    const result = await sandboxProvider.start({
      repoUrl: sandboxConfig.repoUrl,
      repoBranch: sandboxConfig.repoBranch,
      repoPath: sandboxConfig.repoPath,
      sandboxName: sandboxConfig.sandboxName,
      public: sandboxConfig.public,
      deleteOnExit: sandboxConfig.deleteOnExit,
      gitUsername: sandboxConfig.gitUsername,
      gitPassword: sandboxConfig.gitPassword,
      agentEnv: sandboxConfig.agentEnv,
      agentInstall: sandboxConfig.agentInstall,
      agentAuth: sandboxConfig.agentAuth,
      localCliPackPath,
      serverPort,
      previewPort: sandboxPreviewPort,
      proxyPort,
      sessionName: options.session,
      killOnExit: options.killOnExit,
      hideTerminalSwitcher: true,
      logger
    });

    const redeemUrl = buildShareUrl(result.publicUrl, result.token);
    logger.info(`Public URL: ${result.publicUrl}`);
    logger.info(`Share URL: ${redeemUrl}`);

    if (!options.noQr && deps.qr) {
      deps.qr.generate(redeemUrl, { small: true });
    } else if (!options.noQr) {
      logger.warn("QR output unavailable");
    }

    const shutdown = () => {
      void result.stop();
    };
    processRef.on("SIGINT", shutdown);
    processRef.on("SIGTERM", shutdown);

    return result;
  }

  const tunnelMode = resolveTunnelMode(env.TERMBRIDGE_TUNNEL ?? options.tunnel);
  const tmuxPathPrefix = env.TERMBRIDGE_TMUX_PATH_PREFIX ?? undefined;
  const terminalBackend =
    backendMode === "sandbox-daytona"
      ? (deps.createSandboxDaytonaBackend ?? createSandboxDaytonaBackend)(sandboxConfig)
      : (deps.createTerminalBackend ?? (() => createTmuxBackend({ defaultCwd: tmuxCwd, pathPrefix: tmuxPathPrefix })))();
  const terminalRegistry = (deps.createTerminalRegistry ?? (() => createTerminalRegistry()))();
  const tunnelProvider =
    tunnelMode === "cloudflare"
      ? (deps.createTunnelProvider ?? (() => createCloudflaredProvider()))()
      : null;
  const tunnelTokenRaw = options.tunnelToken ?? env.TERMBRIDGE_TUNNEL_TOKEN;
  const tunnelToken = tunnelTokenRaw?.trim() || undefined;
  const tunnelUrlRaw = options.tunnelUrl ?? env.TERMBRIDGE_TUNNEL_URL;
  const tunnelUrl = tunnelToken && tunnelUrlRaw ? normalizePublicUrl(tunnelUrlRaw) : undefined;
  let devProxyUrl = options.devProxyUrl;
  let devProxyHeaders: Record<string, string> | undefined;
  let publicUrl = "";

  if (tunnelMode === "none") {
    if (!publicUrlOverride) {
      throw new Error("public url required when tunnel disabled");
    }

    if (tunnelToken || tunnelUrlRaw) {
      throw new Error("tunnel token/url not supported when tunnel disabled");
    }

    publicUrl = normalizeExternalUrl(publicUrlOverride);
  }

  if (!devProxyUrl && backendMode === "sandbox-daytona" && sandboxPreviewPort) {
    const previewInfo = await terminalBackend.getPreviewUrl?.(sandboxPreviewPort);
    if (previewInfo) {
      if (typeof previewInfo === "string") {
        devProxyUrl = previewInfo;
      } else {
        devProxyUrl = previewInfo.url;
        devProxyHeaders = previewInfo.headers;
      }
    } else {
      logger.warn("Sandbox (Daytona): preview URL unavailable");
    }
  }

  if (tunnelMode === "cloudflare" && tunnelToken && !options.port) {
    throw new Error("port required when using tunnel token");
  }

  if (tunnelMode === "cloudflare" && tunnelToken && !tunnelUrl) {
    throw new Error("tunnel url required when using tunnel token");
  }

  const wsLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
  const serverFactory = deps.createServer ?? ((serverDeps) =>
    createAppServer({
      ...serverDeps,
      redemptionLimiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
      wsLimiter,
      logger
    }));

  const server = serverFactory({
    uiDistPath: resolveUiDistPath(),
    auth,
    terminalRegistry,
    terminalBackend,
    proxyPort: options.proxy,
    devProxyUrl,
    devProxyHeaders,
    hideTerminalSwitcher,
    listenHost
  });

  const started = await server.listen(options.port ?? 0);
  const localUrl = `http://127.0.0.1:${started.port}`;
  const sessionName = options.session ?? `termbridge-${started.port}`;
  const sessionCount = parseSessionCount(env.TERMBRIDGE_SESSIONS);
  const createdSessions: string[] = [];
  const terminalSource: TerminalListItem["source"] =
    backendMode === "sandbox-daytona" ? "sandbox" : "tmux";

  for (let index = 0; index < sessionCount; index += 1) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const nextName = `${sessionName}${suffix}`;
    const session = await terminalBackend.createSession(nextName);
    terminalRegistry.add(session.name, session.name, terminalSource);
    createdSessions.push(session.name);
  }

  const { token } = auth.issueToken();

  if (tunnelMode === "cloudflare") {
    if (!tunnelProvider) {
      throw new Error("tunnel provider unavailable");
    }
    try {
      const result = await tunnelProvider.start(localUrl, {
        token: tunnelToken,
        publicUrl: tunnelUrl
      });
      publicUrl = result.publicUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      logger.error(`Tunnel failed: ${message}`);
      await started.close();
      throw error;
    }
  }

  const redeemUrl = buildShareUrl(publicUrl, token);
  await maybeWriteShareFile(env.TERMBRIDGE_SHARE_FILE, redeemUrl, logger);

  logger.info(`Local server: ${localUrl}`);
  if (tunnelMode === "cloudflare") {
    logger.info(`Tunnel URL: ${redeemUrl}`);
  } else {
    logger.info(`Public URL: ${publicUrl}`);
    logger.info(`Share URL: ${redeemUrl}`);
  }

  if (!options.noQr && deps.qr) {
    deps.qr.generate(redeemUrl, { small: true });
  } else if (!options.noQr) {
    logger.warn("QR output unavailable");
  }

  const stop = async () => {
    if (tunnelProvider) {
      await tunnelProvider.stop();
    }
    await started.close();

    if (options.killOnExit) {
      for (const name of createdSessions) {
        await terminalBackend.closeSession(name);
      }
    }

    if (terminalBackend.shutdown) {
      await terminalBackend.shutdown();
    }
  };

  const shutdown = () => {
    void stop();
  };

  processRef.on("SIGINT", shutdown);
  processRef.on("SIGTERM", shutdown);

  return { localUrl, publicUrl, token, stop };
};
