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
  csrfToken: string;
  createdAt: number;
  lastSeen: number;
};

export type AuthOptions = {
  tokenTtlMs: number;
  sessionIdleMs: number;
  sessionMaxMs: number;
  redeemLimiter?: RateLimiter;
  cookieSecure?: boolean;
  cookieSameSite?: "Lax" | "None" | "Strict";
  now?: () => number;
};

export type Auth = {
  issueToken: () => { token: string };
  issueWsToken: (sessionId: string) => { token: string };
  redeemToken: (token: string, ip: string) => SessionRecord | null;
  redeemWsToken: (token: string) => SessionRecord | null;
  getSession: (sessionId: string) => SessionRecord | null;
  getSessionByCsrfToken?: (csrfToken: string) => SessionRecord | null;
  getSessionFromRequest: (request: IncomingMessage) => SessionRecord | null;
  createSessionCookie: (sessionId: string) => string;
  verifyCsrfToken: (sessionId: string, csrfToken: string) => boolean;
};

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const createSessionId = () => randomBytes(18).toString("base64url");

const createCsrfToken = () => randomBytes(24).toString("base64url");

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
  cookieSecure,
  cookieSameSite,
  now
}: AuthOptions): Auth => {
  const clock = now ?? (() => Date.now());
  const secureCookie = cookieSecure ?? true;
  const resolvedSameSite = cookieSameSite ?? "Lax";
  const tokens = new Map<string, TokenRecord>();
  const wsTokens = new Map<string, { sessionId: string; expiresAt: number }>();
  const sessions = new Map<string, SessionRecord>();
  const wsTokenTtlMs = 2 * 60_000;

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

  const issueWsToken = (sessionId: string) => {
    const token = randomBytes(18).toString("base64url");
    wsTokens.set(token, { sessionId, expiresAt: clock() + wsTokenTtlMs });
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
      csrfToken: createCsrfToken(),
      createdAt: clock(),
      lastSeen: clock()
    };

    sessions.set(session.id, session);
    return session;
  };

  const redeemWsToken = (token: string) => {
    const record = wsTokens.get(token);
    if (!record) {
      return null;
    }
    if (record.expiresAt <= clock()) {
      wsTokens.delete(token);
      return null;
    }
    return getSession(record.sessionId);
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

  const getSessionByCsrfToken = (csrfToken: string) => {
    for (const session of sessions.values()) {
      if (session.csrfToken === csrfToken) {
        return getSession(session.id);
      }
    }
    return null;
  };

  const createSessionCookie = (sessionId: string) => {
    const parts = [
      `${SESSION_COOKIE_NAME}=${sessionId}`,
      "Path=/",
      "HttpOnly",
      `SameSite=${resolvedSameSite}`
    ];

    if (secureCookie) {
      parts.splice(3, 0, "Secure");
    }

    return parts.join("; ");
  };

  const verifyCsrfToken = (sessionId: string, csrfToken: string) => {
    const session = sessions.get(sessionId);
    if (!session) {
      return false;
    }
    return session.csrfToken === csrfToken;
  };

  return {
    issueToken,
    issueWsToken,
    redeemToken,
    redeemWsToken,
    getSession,
    getSessionByCsrfToken,
    getSessionFromRequest,
    createSessionCookie,
    verifyCsrfToken
  };
};
