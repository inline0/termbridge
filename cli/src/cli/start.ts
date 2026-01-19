import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { TerminalBackend } from "@termbridge/terminal";
import { createTmuxBackend } from "@termbridge/terminal";
import type { TunnelProvider } from "@termbridge/tunnel";
import { createCloudflaredProvider } from "@termbridge/tunnel";
import type { Auth } from "../server/auth";
import { createAuth } from "../server/auth";
import { createRateLimiter } from "../server/rate-limit";
import type { TerminalRegistry } from "../server/terminal-registry";
import { createTerminalRegistry } from "../server/terminal-registry";
import type { Logger, StartedServer } from "../server/server";
import { createAppServer } from "../server/server";

export type StartOptions = {
  port?: number;
  session?: string;
  killOnExit: boolean;
  noQr: boolean;
  tunnel: "cloudflare";
};

export type StartDeps = {
  logger?: Logger;
  process?: NodeJS.Process;
  createAuth?: () => Auth;
  createTerminalBackend?: () => TerminalBackend;
  createTerminalRegistry?: () => TerminalRegistry;
  createTunnelProvider?: () => TunnelProvider;
  createServer?: (deps: {
    uiDistPath: string;
    auth: Auth;
    terminalRegistry: TerminalRegistry;
    terminalBackend: TerminalBackend;
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
  const terminalBackend = (deps.createTerminalBackend ?? (() => createTmuxBackend()))();
  const terminalRegistry = (deps.createTerminalRegistry ?? (() => createTerminalRegistry()))();
  const tunnelProvider = (deps.createTunnelProvider ?? (() => createCloudflaredProvider()))();

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
    terminalBackend
  });

  const started = await server.listen(options.port ?? 0);
  const localUrl = `http://127.0.0.1:${started.port}`;
  const sessionName = options.session ?? `termbridge-${started.port}`;
  const sessionCount = parseSessionCount(env.TERMBRIDGE_SESSIONS);
  const createdSessions: string[] = [];

  for (let index = 0; index < sessionCount; index += 1) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const nextName = `${sessionName}${suffix}`;
    const session = await terminalBackend.createSession(nextName);
    terminalRegistry.add(session.name, session.name, "tmux");
    createdSessions.push(session.name);
  }

  const { token } = auth.issueToken();

  let publicUrl = "";
  try {
    const result = await tunnelProvider.start(localUrl);
    publicUrl = result.publicUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    logger.error(`Tunnel failed: ${message}`);
    await started.close();
    throw error;
  }

  const redeemUrl = `${publicUrl}/s/${token}`;

  logger.info(`Local server: ${localUrl}`);
  logger.info(`Tunnel URL: ${redeemUrl}`);

  if (!options.noQr && deps.qr) {
    deps.qr.generate(redeemUrl, { small: true });
  } else if (!options.noQr) {
    logger.warn("QR output unavailable");
  }

  const stop = async () => {
    await tunnelProvider.stop();
    await started.close();

    if (options.killOnExit) {
      for (const name of createdSessions) {
        await terminalBackend.closeSession(name);
      }
    }
  };

  const shutdown = () => {
    void stop();
  };

  processRef.on("SIGINT", shutdown);
  processRef.on("SIGTERM", shutdown);

  return { localUrl, publicUrl, token, stop };
};
