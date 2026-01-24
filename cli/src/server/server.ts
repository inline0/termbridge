import { createServer as createHttpServer } from "node:http";
import { randomBytes } from "node:crypto";
import { WebSocketServer, WebSocket as WsWebSocket } from "ws";
import type { WebSocket } from "ws";
import type { TerminalListResponse } from "@termbridge/shared";
import type { TerminalBackend } from "@termbridge/terminal";
import type { Auth } from "./auth";
import type { RateLimiter } from "./rate-limit";
import type { TerminalRegistry } from "./terminal-registry";
import { createStaticHandler } from "./static";
import {
  jsonResponse,
  readJsonBody,
  getIp,
  isAllowedOrigin,
  resolveForwardedHost
} from "./http-utils";
import { parseClientMessage, sendWsMessage } from "./ws-utils";
import { proxyRequest, getProxyWebSocketUrl, type ProxyConfig } from "./proxy";

export type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

export type ServerDeps = {
  uiDistPath: string;
  auth: Auth;
  terminalRegistry: TerminalRegistry;
  terminalBackend: TerminalBackend;
  redemptionLimiter: RateLimiter;
  wsLimiter: RateLimiter;
  logger: Logger;
  proxyPort?: number;
  devProxyUrl?: string;
  devProxyHeaders?: Record<string, string>;
  hideTerminalSwitcher?: boolean;
  listenHost?: string;
};

export type StartedServer = {
  port: number;
  close: () => Promise<void>;
};

const createSessionName = () => `termbridge-${randomBytes(4).toString("hex")}`;

export { isAllowedOrigin, resolveForwardedHost } from "./http-utils";
export { parseClientMessage, type ParseResult } from "./ws-utils";

export const createAppServer = (deps: ServerDeps) => {
  const staticHandler = createStaticHandler(deps.uiDistPath, "/__tb/app");
  const wss = new WebSocketServer({ noServer: true });
  const connectionInfo = new WeakMap<WebSocket, { sessionName: string }>();
  const hasProxy = typeof deps.proxyPort === "number" || deps.devProxyUrl !== undefined;
  const proxyConfig: ProxyConfig = {
    proxyPort: deps.proxyPort,
    devProxyUrl: deps.devProxyUrl,
    devProxyHeaders: deps.devProxyHeaders
  };

  const server = createHttpServer(async (request, response) => {
    const url = new URL(request.url as string, `http://${request.headers.host as string}`);

    if (request.method === "GET" && url.pathname === "/__tb/healthz") {
      response.statusCode = 200;
      response.end("ok");
      return;
    }

    if (request.method === "GET" && url.pathname === "/" && !hasProxy) {
      response.statusCode = 302;
      response.setHeader("Location", `/__tb/app${url.search}`);
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/__tb/s/")) {
      const token = url.pathname.slice("/__tb/s/".length);
      const ip = getIp(request);

      if (!deps.redemptionLimiter.allow(ip)) {
        response.statusCode = 429;
        response.end("rate limited");
        return;
      }

      const session = deps.auth.redeemToken(token, ip);

      if (!session) {
        response.statusCode = 401;
        response.end("invalid token");
        return;
      }

      response.statusCode = 302;
      response.setHeader("Set-Cookie", deps.auth.createSessionCookie(session.id));
      response.setHeader("Location", `/__tb/app${url.search}`);
      response.end();
      return;
    }

    if (url.pathname === "/__tb/api/csrf") {
      const session = deps.auth.getSessionFromRequest(request);

      if (!session) {
        response.statusCode = 401;
        response.end("unauthorized");
        return;
      }

      if (request.method === "GET") {
        jsonResponse(response, 200, { csrfToken: session.csrfToken });
        return;
      }

      response.statusCode = 404;
      response.end("not found");
      return;
    }

    if (url.pathname === "/__tb/api/terminals") {
      const session = deps.auth.getSessionFromRequest(request);

      if (!session) {
        response.statusCode = 401;
        response.end("unauthorized");
        return;
      }

      if (request.method === "GET") {
        const payload: TerminalListResponse = { terminals: deps.terminalRegistry.list() };
        jsonResponse(response, 200, payload);
        return;
      }

      if (request.method === "POST") {
        const body = await readJsonBody(request);

        if (body === "too_large") {
          response.statusCode = 413;
          response.end("request body too large");
          return;
        }

        if (body && typeof body !== "object") {
          response.statusCode = 400;
          response.end("invalid body");
          return;
        }

        const name =
          body && typeof (body as { name?: unknown }).name === "string"
            ? (body as { name: string }).name
            : createSessionName();

        const created = await deps.terminalBackend.createSession(name);
        const record = deps.terminalRegistry.add(created.name, created.name, "tmux");
        jsonResponse(response, 201, record);
        return;
      }
    }

    if (request.method === "GET" && url.pathname === "/__tb/api/config") {
      const session = deps.auth.getSessionFromRequest(request);

      if (!session) {
        response.statusCode = 401;
        response.end("unauthorized");
        return;
      }

      jsonResponse(response, 200, {
        proxyPort: deps.proxyPort ?? null,
        devProxyUrl: deps.devProxyUrl ?? null,
        hideTerminalSwitcher: Boolean(deps.hideTerminalSwitcher),
        wsToken: deps.auth.issueWsToken(session.id).token
      });
      return;
    }

    const handled = await staticHandler(request, response);

    if (!handled) {
      if (hasProxy && deps.auth.getSessionFromRequest(request)) {
        proxyRequest(proxyConfig, request, response, url.pathname, url.search);
        return;
      }

      response.statusCode = 404;
      response.end("not found");
    }
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url as string, `http://${request.headers.host as string}`);

    if (!url.pathname.startsWith("/__tb/ws/terminal/")) {
      if (hasProxy && deps.auth.getSessionFromRequest(request)) {
        const baseUrl = getProxyWebSocketUrl(proxyConfig);
        if (!baseUrl) {
          socket.destroy();
          return;
        }
        const wsProtocol = baseUrl.protocol === "https:" ? "wss:" : "ws:";
        const targetUrl = new URL(`${url.pathname}${url.search}`, baseUrl);
        targetUrl.protocol = wsProtocol;
        const proxyHeaders = { ...request.headers, ...(proxyConfig.devProxyHeaders ?? {}) };
        delete proxyHeaders.cookie;
        delete proxyHeaders.host;
        proxyHeaders.host = targetUrl.host;

        const proxyWs = new WsWebSocket(targetUrl.toString(), { headers: proxyHeaders });

        proxyWs.on("open", () => {
          wss.handleUpgrade(request, socket, head, (clientWs) => {
            clientWs.on("message", (data) => proxyWs.send(data));
            proxyWs.on("message", (data) => clientWs.send(data));
            clientWs.on("close", () => proxyWs.close());
            proxyWs.on("close", () => clientWs.close());
          });
        });

        proxyWs.on("error", () => {
          socket.destroy();
        });

        return;
      }

      socket.destroy();
      return;
    }

    const forwardedHostHeader = request.headers["x-forwarded-host"];
    const forwardedHost = resolveForwardedHost(forwardedHostHeader);
    const hasDaytonaAuth =
      url.searchParams.has("DAYTONA_SANDBOX_AUTH_KEY") || url.searchParams.has("token");
    if (!hasDaytonaAuth && !isAllowedOrigin(request.headers.origin, request.headers.host, forwardedHost)) {
      socket.destroy();
      return;
    }

    const terminalId = url.pathname.split("/").pop();

    if (!terminalId) {
      socket.destroy();
      return;
    }

    const ip = getIp(request);

    if (!deps.wsLimiter.allow(ip)) {
      socket.destroy();
      return;
    }

    const csrfToken = url.searchParams.get("csrf");
    const wsToken = url.searchParams.get("wsToken");
    let session = deps.auth.getSessionFromRequest(request);

    if (!session && csrfToken) {
      session = deps.auth.getSessionByCsrfToken?.(csrfToken) ?? null;
    }

    if (!session && wsToken) {
      session = deps.auth.redeemWsToken(wsToken);
    }

    if (!session) {
      socket.destroy();
      return;
    }

    if (!csrfToken || !deps.auth.verifyCsrfToken(session.id, csrfToken)) {
      socket.destroy();
      return;
    }

    const record = deps.terminalRegistry.get(terminalId);

    if (!record) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      connectionInfo.set(ws, { sessionName: record.sessionName });
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (socket) => {
    const info = connectionInfo.get(socket) as { sessionName: string };

    sendWsMessage(socket, { type: "status", state: "connected" });

    const unsubscribe = deps.terminalBackend.onOutput(info.sessionName, (data) => {
      sendWsMessage(socket, { type: "output", data });
    });

    socket.on("message", (payload) => {
      const result = parseClientMessage(payload);

      if (!result.ok) {
        sendWsMessage(socket, {
          type: "status",
          state: "error",
          message: result.error === "too_large" ? "message too large" : "invalid payload"
        });
        return;
      }

      const message = result.message;

      if (message.type === "input") {
        void deps.terminalBackend.write(info.sessionName, message.data);
        return;
      }

      if (message.type === "resize") {
        void deps.terminalBackend.resize(info.sessionName, message.cols, message.rows);
        return;
      }

      if (message.type === "scroll") {
        void deps.terminalBackend.scroll(info.sessionName, message.mode, message.amount);
        return;
      }

      void deps.terminalBackend.sendControl(info.sessionName, message.key);
    });

    socket.on("close", () => {
      unsubscribe();
    });
  });

  const listen = (port: number) =>
    new Promise<StartedServer>((resolve, _reject) => {
      const host = deps.listenHost?.trim() || "127.0.0.1";
      server.listen(port, host, () => {
        const address = server.address() as { port: number };

        resolve({
          port: address.port,
          close: async () => {
            await new Promise<void>((closeResolve) => server.close(() => closeResolve()));
            wss.close();
          }
        });
      });
    });

  return { listen };
};
