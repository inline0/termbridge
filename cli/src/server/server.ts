import { createServer as createHttpServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { randomBytes } from "node:crypto";
import { WebSocketServer, WebSocket as WsWebSocket } from "ws";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { WebSocket } from "ws";
import {
  TERMINAL_CONTROL_KEYS,
  type TerminalClientMessage,
  type TerminalControlKey,
  type TerminalServerMessage,
  type TerminalListResponse
} from "@termbridge/shared";
import type { TerminalBackend } from "@termbridge/terminal";
import type { Auth } from "./auth";
import type { RateLimiter } from "./rate-limit";
import type { TerminalRegistry } from "./terminal-registry";
import { createStaticHandler } from "./static";

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
  devProxyUrl?: string; // Remote proxy target URL (preview iframe points to /)
  devProxyHeaders?: Record<string, string>;
};

export type StartedServer = {
  port: number;
  close: () => Promise<void>;
};

const MAX_HTTP_BODY_SIZE = 64 * 1024; // 64KB for HTTP requests
const MAX_WS_MESSAGE_SIZE = 1024 * 1024; // 1MB for WebSocket messages
const MAX_INPUT_LENGTH = 64 * 1024; // 64KB for terminal input

const jsonResponse = (response: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
};

const readJsonBody = async (request: IncomingMessage): Promise<unknown | null | "too_large"> => {
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  for await (const chunk of request) {
    totalSize += chunk.length;
    if (totalSize > MAX_HTTP_BODY_SIZE) {
      return "too_large";
    }
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8").trim();

  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
};

const getIp = (request: IncomingMessage) => String(request.socket.remoteAddress);

const isAllowedOrigin = (origin: string | undefined, host: string | undefined) => {
  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

const allowedControlKeys: Set<TerminalControlKey> = new Set(TERMINAL_CONTROL_KEYS);

export type ParseResult =
  | { ok: true; message: TerminalClientMessage }
  | { ok: false; error: "too_large" | "invalid" };

export const parseClientMessage = (payload: WebSocket.Data): ParseResult => {
  const size =
    typeof payload === "string"
      ? payload.length
      : Array.isArray(payload)
        ? payload.reduce((sum, buf) => sum + buf.length, 0)
        : payload.byteLength;

  if (size > MAX_WS_MESSAGE_SIZE) {
    return { ok: false, error: "too_large" };
  }

  const text =
    typeof payload === "string"
      ? payload
      : Array.isArray(payload)
        ? Buffer.concat(payload).toString()
        : payload.toString();

  try {
    const parsed = JSON.parse(text) as TerminalClientMessage;

    if (parsed.type === "input" && typeof parsed.data === "string") {
      if (parsed.data.length > MAX_INPUT_LENGTH) {
        return { ok: false, error: "too_large" };
      }
      return { ok: true, message: parsed };
    }

    if (
      parsed.type === "resize" &&
      typeof parsed.cols === "number" &&
      typeof parsed.rows === "number"
    ) {
      return { ok: true, message: parsed };
    }

    if (parsed.type === "control" && allowedControlKeys.has(parsed.key)) {
      return { ok: true, message: parsed };
    }

    if (
      parsed.type === "scroll" &&
      (parsed.mode === "lines" || parsed.mode === "pages") &&
      typeof parsed.amount === "number" &&
      Number.isFinite(parsed.amount)
    ) {
      return { ok: true, message: parsed };
    }

    return { ok: false, error: "invalid" };
  } catch {
    return { ok: false, error: "invalid" };
  }
};

const sendWsMessage = (socket: WebSocket, message: TerminalServerMessage) => {
  socket.send(JSON.stringify(message));
};

const createSessionName = () => `termbridge-${randomBytes(4).toString("hex")}`;

export const createAppServer = (deps: ServerDeps) => {
  const staticHandler = createStaticHandler(deps.uiDistPath, "/__tb/app");
  const wss = new WebSocketServer({ noServer: true });
  const connectionInfo = new WeakMap<WebSocket, { sessionName: string }>();
  const hasProxy = typeof deps.proxyPort === "number" || deps.devProxyUrl !== undefined;

  const resolveProxyUrl = (targetPath: string, search: string) => {
    if (typeof deps.proxyPort === "number") {
      return new URL(`http://localhost:${deps.proxyPort}${targetPath}${search}`);
    }
    if (deps.devProxyUrl) {
      try {
        return new URL(`${targetPath}${search}`, deps.devProxyUrl);
      } catch {
        return null;
      }
    }
    return null;
  };

  const proxyRequest = (
    request: IncomingMessage,
    response: ServerResponse,
    targetPath: string,
    search: string
  ) => {
    const targetUrl = resolveProxyUrl(targetPath, search);
    if (!targetUrl) {
      response.statusCode = 502;
      response.end("proxy error");
      return;
    }

    const proxyHeaders = { ...request.headers, ...(deps.devProxyHeaders ?? {}) };
    delete proxyHeaders.cookie;
    delete proxyHeaders.host;
    proxyHeaders.host = targetUrl.host;

    const requestImpl = targetUrl.protocol === "https:" ? httpsRequest : httpRequest;
    const proxyReq = requestImpl(
      targetUrl,
      { method: request.method, headers: proxyHeaders },
      (proxyRes) => {
        response.writeHead(proxyRes.statusCode as number, proxyRes.headers);
        proxyRes.pipe(response);
      }
    );
    proxyReq.on("error", () => {
      response.statusCode = 502;
      response.end("proxy error");
    });
    request.pipe(proxyReq);
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
      response.setHeader("Location", "/__tb/app");
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
      response.setHeader("Location", "/__tb/app");
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
        devProxyUrl: deps.devProxyUrl ?? null
      });
      return;
    }

    const handled = await staticHandler(request, response);

    if (!handled) {
      // If proxy mode is enabled and user is authenticated, proxy to target app
      if (hasProxy && deps.auth.getSessionFromRequest(request)) {
        proxyRequest(request, response, url.pathname, url.search);
        return;
      }

      response.statusCode = 404;
      response.end("not found");
    }
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url as string, `http://${request.headers.host as string}`);

    if (!url.pathname.startsWith("/__tb/ws/terminal/")) {
      // Proxy WebSocket to target app if proxy mode enabled
      if (hasProxy && deps.auth.getSessionFromRequest(request)) {
        let baseUrl: URL | null = null;
        try {
          baseUrl = typeof deps.proxyPort === "number"
            ? new URL(`http://localhost:${deps.proxyPort}`)
            : new URL(deps.devProxyUrl as string);
        } catch {
          socket.destroy();
          return;
        }
        const wsProtocol = baseUrl.protocol === "https:" ? "wss:" : "ws:";
        const targetUrl = new URL(`${url.pathname}${url.search}`, baseUrl);
        targetUrl.protocol = wsProtocol;
        const proxyHeaders = { ...request.headers, ...(deps.devProxyHeaders ?? {}) };
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

    if (!isAllowedOrigin(request.headers.origin, request.headers.host)) {
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

    const session = deps.auth.getSessionFromRequest(request);

    if (!session) {
      socket.destroy();
      return;
    }

    const csrfToken = url.searchParams.get("csrf");

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
      server.listen(port, "127.0.0.1", () => {
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
