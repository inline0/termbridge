import { randomBytes, createHash } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { RateLimiter } from "./rate-limit";

export const SESSION_COOKIE_NAME = "termbridge_session";

export type TokenRecord = {
  hash: string;
  expiresAt: number;
  consumed: boolean;
};

export type SessionRecord = {
  id: string;
  createdAt: number;
  lastSeen: number;
};

export type AuthOptions = {
  tokenTtlMs: number;
  sessionIdleMs: number;
  sessionMaxMs: number;
  redeemLimiter?: RateLimiter;
  now?: () => number;
};

export type Auth = {
  issueToken: () => { token: string };
  redeemToken: (token: string, ip: string) => SessionRecord | null;
  getSession: (sessionId: string) => SessionRecord | null;
  getSessionFromRequest: (request: IncomingMessage) => SessionRecord | null;
  createSessionCookie: (sessionId: string) => string;
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const createSessionId = () => randomBytes(18).toString("base64url");

const parseCookies = (cookieHeader: string | undefined) => {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");

    if (!name) {
      continue;
    }

    cookies[name] = rest.join("=");
  }

  return cookies;
};

export const createAuth = ({
  tokenTtlMs,
  sessionIdleMs,
  sessionMaxMs,
  redeemLimiter,
  now
}: AuthOptions): Auth => {
  const clock = now ?? (() => Date.now());
  const tokens = new Map<string, TokenRecord>();
  const sessions = new Map<string, SessionRecord>();

  const issueToken = () => {
    const token = randomBytes(16).toString("base64url");
    const record: TokenRecord = {
      hash: hashToken(token),
      expiresAt: clock() + tokenTtlMs,
      consumed: false
    };

    tokens.set(record.hash, record);

    return { token };
  };

  const redeemToken = (token: string, ip: string) => {
    if (redeemLimiter && !redeemLimiter.allow(ip)) {
      return null;
    }

    const record = tokens.get(hashToken(token));

    if (!record || record.consumed || record.expiresAt <= clock()) {
      return null;
    }

    record.consumed = true;

    const session: SessionRecord = {
      id: createSessionId(),
      createdAt: clock(),
      lastSeen: clock()
    };

    sessions.set(session.id, session);
    return session;
  };

  const getSession = (sessionId: string) => {
    const session = sessions.get(sessionId);

    if (!session) {
      return null;
    }

    const nowMs = clock();

    if (nowMs - session.createdAt > sessionMaxMs) {
      sessions.delete(sessionId);
      return null;
    }

    if (nowMs - session.lastSeen > sessionIdleMs) {
      sessions.delete(sessionId);
      return null;
    }

    session.lastSeen = nowMs;
    return session;
  };

  const getSessionFromRequest = (request: IncomingMessage) => {
    const cookies = parseCookies(request.headers.cookie);
    const sessionId = cookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      return null;
    }

    return getSession(sessionId);
  };

  const createSessionCookie = (sessionId: string) =>
    `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax`;

  return {
    issueToken,
    redeemToken,
    getSession,
    getSessionFromRequest,
    createSessionCookie
  };
};
