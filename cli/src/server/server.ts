import { createServer as createHttpServer } from "node:http";
import { randomBytes } from "node:crypto";
import { WebSocketServer } from "ws";
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
};

export type StartedServer = {
  port: number;
  close: () => Promise<void>;
};

const jsonResponse = (response: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
};

const readJsonBody = async (request: IncomingMessage) => {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request) {
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

export const parseClientMessage = (payload: WebSocket.RawData): TerminalClientMessage | null => {
  const text = typeof payload === "string" ? payload : payload.toString();

  try {
    const parsed = JSON.parse(text) as TerminalClientMessage;

    if (parsed.type === "input" && typeof parsed.data === "string") {
      return parsed;
    }

    if (
      parsed.type === "resize" &&
      typeof parsed.cols === "number" &&
      typeof parsed.rows === "number"
    ) {
      return parsed;
    }

    if (parsed.type === "control" && allowedControlKeys.has(parsed.key)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
};

const sendWsMessage = (socket: WebSocket, message: TerminalServerMessage) => {
  socket.send(JSON.stringify(message));
};

const createSessionName = () => `termbridge-${randomBytes(4).toString("hex")}`;

export const createAppServer = (deps: ServerDeps) => {
  const staticHandler = createStaticHandler(deps.uiDistPath, "/app");
  const wss = new WebSocketServer({ noServer: true });
  const connectionInfo = new WeakMap<WebSocket, { sessionName: string }>();

  const server = createHttpServer(async (request, response) => {
    const url = new URL(request.url as string, `http://${request.headers.host as string}`);

    if (request.method === "GET" && url.pathname === "/healthz") {
      response.statusCode = 200;
      response.end("ok");
      return;
    }

    if (request.method === "GET" && url.pathname === "/") {
      response.statusCode = 302;
      response.setHeader("Location", "/app");
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/s/")) {
      const token = url.pathname.slice(3);
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
      response.setHeader("Location", "/app");
      response.end();
      return;
    }

    if (url.pathname === "/api/terminals") {
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

    const handled = await staticHandler(request, response);

    if (!handled) {
      response.statusCode = 404;
      response.end("not found");
    }
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url as string, `http://${request.headers.host as string}`);

    if (!url.pathname.startsWith("/ws/terminal/")) {
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
      const message = parseClientMessage(payload);

      if (!message) {
        sendWsMessage(socket, {
          type: "status",
          state: "error",
          message: "invalid payload"
        });
        return;
      }

      if (message.type === "input") {
        void deps.terminalBackend.write(info.sessionName, message.data);
        return;
      }

      if (message.type === "resize") {
        void deps.terminalBackend.resize(info.sessionName, message.cols, message.rows);
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
