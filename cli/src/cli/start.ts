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
import { createDaytonaBackend, type DaytonaBackendOptions } from "../daytona/daytona-backend";
import {
  createDaytonaSandboxServerProvider,
  type DaytonaSandboxProviderOptions
} from "../daytona/daytona-direct";
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
  backend?: "tmux" | "daytona";
  daytonaDirect?: boolean;
  daytonaRepo?: string;
  daytonaBranch?: string;
  daytonaPath?: string;
  daytonaSandboxName?: string;
  daytonaPreviewPort?: number;
  daytonaPublic?: boolean;
};

export type StartDeps = {
  logger?: Logger;
  process?: NodeJS.Process;
  createAuth?: () => Auth;
  createTerminalBackend?: () => TerminalBackend;
  createDaytonaBackend?: (options: DaytonaBackendOptions) => TerminalBackend;
  createSandboxProvider?: (options: DaytonaSandboxProviderOptions) => SandboxServerProvider;
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

const resolveBackendMode = (value: string | undefined): "tmux" | "daytona" => {
  if (!value) {
    return "tmux";
  }

  if (value === "tmux" || value === "daytona") {
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
  const auth = (deps.createAuth ?? (() =>
    createAuth({
      tokenTtlMs: 90_000,
      sessionIdleMs: 30 * 60_000,
      sessionMaxMs: 8 * 60 * 60_000,
      cookieSecure: !insecureCookie
    })))();
  const backendMode = resolveBackendMode(options.backend ?? env.TERMBRIDGE_BACKEND);
  const daytonaDirect = options.daytonaDirect ?? parseBoolean(env.TERMBRIDGE_DAYTONA_DIRECT);
  const publicUrlOverride = options.publicUrl ?? env.TERMBRIDGE_PUBLIC_URL;
  const hideTerminalSwitcher = parseBoolean(env.TERMBRIDGE_HIDE_TERMINAL_SWITCHER);
  const tmuxCwd = env.TERMBRIDGE_TMUX_CWD;
  const daytonaRepo =
    options.daytonaRepo ??
    env.TERMBRIDGE_DAYTONA_REPO ??
    "https://github.com/inline0/termbridge-test-app.git";
  const daytonaPreviewPort =
    options.daytonaPreviewPort ?? parseOptionalNumber(env.TERMBRIDGE_DAYTONA_PREVIEW_PORT);
  const daytonaPublic = options.daytonaPublic ?? parseBoolean(env.TERMBRIDGE_DAYTONA_PUBLIC);
  const daytonaDeleteOnExit = parseBoolean(env.TERMBRIDGE_DAYTONA_DELETE_ON_EXIT);
  const daytonaConfig: DaytonaBackendOptions = {
    apiKey: env.DAYTONA_API_KEY,
    apiUrl: env.DAYTONA_API_URL,
    target: env.DAYTONA_TARGET,
    repoUrl: daytonaRepo,
    repoBranch: options.daytonaBranch ?? env.TERMBRIDGE_DAYTONA_BRANCH,
    repoPath: options.daytonaPath ?? env.TERMBRIDGE_DAYTONA_PATH ?? deriveRepoPath(daytonaRepo),
    sandboxName: options.daytonaSandboxName ?? env.TERMBRIDGE_DAYTONA_NAME,
    public: daytonaPublic,
    deleteOnExit: daytonaDeleteOnExit,
    gitUsername: env.TERMBRIDGE_DAYTONA_GIT_USERNAME,
    gitPassword: env.TERMBRIDGE_DAYTONA_GIT_PASSWORD ?? env.TERMBRIDGE_DAYTONA_GIT_TOKEN,
    logger
  };

  if (backendMode === "daytona" && daytonaDirect) {
    const serverPort =
      options.port ?? parseOptionalNumber(env.TERMBRIDGE_DAYTONA_SERVER_PORT) ?? 8080;
    const proxyPort = options.proxy ?? daytonaPreviewPort;
    const sandboxProvider = (deps.createSandboxProvider ?? createDaytonaSandboxServerProvider)({
      apiKey: daytonaConfig.apiKey,
      apiUrl: daytonaConfig.apiUrl,
      target: daytonaConfig.target,
      logger
    });

    const result = await sandboxProvider.start({
      repoUrl: daytonaConfig.repoUrl,
      repoBranch: daytonaConfig.repoBranch,
      repoPath: daytonaConfig.repoPath,
      sandboxName: daytonaConfig.sandboxName,
      public: daytonaConfig.public,
      deleteOnExit: daytonaConfig.deleteOnExit,
      gitUsername: daytonaConfig.gitUsername,
      gitPassword: daytonaConfig.gitPassword,
      serverPort,
      proxyPort,
      sessionName: options.session,
      killOnExit: options.killOnExit,
      hideTerminalSwitcher: true,
      logger
    });

    const redeemUrl = `${result.publicUrl}/__tb/s/${result.token}`;
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
  const terminalBackend =
    backendMode === "daytona"
      ? (deps.createDaytonaBackend ?? createDaytonaBackend)(daytonaConfig)
      : (deps.createTerminalBackend ?? (() => createTmuxBackend({ defaultCwd: tmuxCwd })))();
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

  if (!devProxyUrl && backendMode === "daytona" && daytonaPreviewPort) {
    const previewInfo = await terminalBackend.getPreviewUrl?.(daytonaPreviewPort);
    if (previewInfo) {
      if (typeof previewInfo === "string") {
        devProxyUrl = previewInfo;
      } else {
        devProxyUrl = previewInfo.url;
        devProxyHeaders = previewInfo.headers;
      }
    } else {
      logger.warn("Daytona: preview URL unavailable");
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
    hideTerminalSwitcher
  });

  const started = await server.listen(options.port ?? 0);
  const localUrl = `http://127.0.0.1:${started.port}`;
  const sessionName = options.session ?? `termbridge-${started.port}`;
  const sessionCount = parseSessionCount(env.TERMBRIDGE_SESSIONS);
  const createdSessions: string[] = [];
  const terminalSource: TerminalListItem["source"] =
    backendMode === "daytona" ? "daytona" : "tmux";

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

  const redeemUrl = `${publicUrl}/__tb/s/${token}`;
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
