import { describe, expect, it } from "vitest";
import type { IncomingMessage } from "node:http";
import { createAuth, SESSION_COOKIE_NAME } from "./auth";
import { createRateLimiter } from "./rate-limit";

const createRequest = (cookie: string | undefined) =>
  ({
    headers: {
      cookie
    }
  }) as IncomingMessage;

describe("createAuth", () => {
  it("issues and redeems tokens", () => {
    let now = 0;
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000,
      now: () => now
    });

    const { token } = auth.issueToken();
    const session = auth.redeemToken(token, "ip");

    expect(session).not.toBeNull();
    expect(auth.redeemToken(token, "ip")).toBeNull();

    now = 6000;
    expect(auth.getSession(session?.id ?? "")).toBeNull();
  });

  it("rejects expired tokens", () => {
    let now = 0;
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000,
      now: () => now
    });

    const { token } = auth.issueToken();
    now = 2000;
    expect(auth.redeemToken(token, "ip")).toBeNull();
  });

  it("respects the redeem rate limiter", () => {
    const now = 0;
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => now });
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000,
      redeemLimiter: limiter,
      now: () => now
    });

    const first = auth.issueToken();
    const second = auth.issueToken();

    expect(auth.redeemToken(first.token, "ip")).not.toBeNull();
    expect(auth.redeemToken(second.token, "ip")).toBeNull();
  });

  it("expires sessions by idle and max age", () => {
    let now = 0;
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 2000,
      sessionMaxMs: 3000,
      now: () => now
    });

    const { token } = auth.issueToken();
    const session = auth.redeemToken(token, "ip");

    now = 2500;
    expect(auth.getSession(session?.id ?? "")).toBeNull();

    now = 0;
    const second = auth.redeemToken(auth.issueToken().token, "ip");
    now = 3500;
    expect(auth.getSession(second?.id ?? "")).toBeNull();
  });

  it("reads session cookies from requests", () => {
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000
    });

    const { token } = auth.issueToken();
    const session = auth.redeemToken(token, "ip");
    const cookieValue = `${SESSION_COOKIE_NAME}=${session?.id}`;

    expect(auth.getSessionFromRequest(createRequest(cookieValue))).not.toBeNull();
    expect(auth.getSessionFromRequest(createRequest(undefined))).toBeNull();
    expect(auth.getSessionFromRequest(createRequest(`${cookieValue}; =ignored`))).not.toBeNull();
    expect(auth.getSession("missing")).toBeNull();
  });

  it("formats session cookies", () => {
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000
    });

    const cookie = auth.createSessionCookie("abc");
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=abc`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("omits secure cookies when disabled", () => {
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000,
      cookieSecure: false
    });

    const cookie = auth.createSessionCookie("abc");
    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=abc`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).not.toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("verifies CSRF tokens", () => {
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000
    });

    const { token } = auth.issueToken();
    const session = auth.redeemToken(token, "ip");

    expect(session).not.toBeNull();
    expect(auth.verifyCsrfToken(session!.id, session!.csrfToken)).toBe(true);
    expect(auth.verifyCsrfToken(session!.id, "wrong-token")).toBe(false);
    expect(auth.verifyCsrfToken("non-existent-session", "any-token")).toBe(false);
  });

  it("issues and redeems websocket tokens", () => {
    let now = 0;
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000,
      now: () => now
    });

    const session = auth.redeemToken(auth.issueToken().token, "ip");
    expect(session).not.toBeNull();

    const { token: wsToken } = auth.issueWsToken(session!.id);
    expect(auth.redeemWsToken(wsToken)?.id).toBe(session!.id);

    expect(auth.redeemWsToken(wsToken)).toBeNull();
    expect(auth.redeemWsToken("missing")).toBeNull();
  });

  it("rejects expired websocket tokens", () => {
    let now = 0;
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000,
      now: () => now
    });

    const session = auth.redeemToken(auth.issueToken().token, "ip");
    expect(session).not.toBeNull();

    const { token: wsToken } = auth.issueWsToken(session!.id);
    now = 200_000;
    expect(auth.redeemWsToken(wsToken)).toBeNull();
  });

  it("looks up sessions by CSRF token", () => {
    const auth = createAuth({
      tokenTtlMs: 1000,
      sessionIdleMs: 5000,
      sessionMaxMs: 10_000
    });

    const session = auth.redeemToken(auth.issueToken().token, "ip");
    expect(session).not.toBeNull();

    expect(auth.getSessionByCsrfToken?.(session!.csrfToken)?.id).toBe(session!.id);
    expect(auth.getSessionByCsrfToken?.("missing")).toBeNull();
  });
});
