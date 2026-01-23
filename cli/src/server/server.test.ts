import { describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import WebSocket, { WebSocketServer } from "ws";
import { createAuth } from "./auth";
import { createRateLimiter } from "./rate-limit";
import { createTerminalRegistry } from "./terminal-registry";
import { createAppServer, isAllowedOrigin, resolveForwardedHost } from "./server";
import type { TerminalBackend, TerminalSession } from "@termbridge/terminal";

const createTestBackend = () => {
  const callbacks = new Map<string, (data: string) => void>();
  const backend: TerminalBackend & {
    emitOutput: (sessionName: string, data: string) => void;
  } = {
    createSession: vi.fn(async (name: string): Promise<TerminalSession> => ({
      name,
      createdAt: new Date()
    })),
    write: vi.fn(async () => undefined),
    resize: vi.fn(async () => undefined),
    sendControl: vi.fn(async () => undefined),
    scroll: vi.fn(async () => undefined),
    onOutput: (sessionName, callback) => {
      callbacks.set(sessionName, callback);
      return () => callbacks.delete(sessionName);
    },
    closeSession: vi.fn(async () => undefined),
    emitOutput: (sessionName, data) => {
      callbacks.get(sessionName)?.(data);
    }
  };

  return backend;
};

const createServerFixture = async (
  options: {
    redemptionLimit?: number;
    wsLimit?: number;
    proxyPort?: number;
    devProxyUrl?: string;
    devProxyHeaders?: Record<string, string>;
    hideTerminalSwitcher?: boolean;
  } = {}
) => {
  const uiDir = await mkdtemp(join(tmpdir(), "termbridge-ui-"));
  await writeFile(join(uiDir, "index.html"), "index");

  let now = 0;
  const auth = createAuth({
    tokenTtlMs: 60_000,
    sessionIdleMs: 60_000,
    sessionMaxMs: 60_000,
    now: () => now
  });

  const terminalRegistry = createTerminalRegistry();
  const backend = createTestBackend();
  const redemptionLimiter = createRateLimiter({
    limit: options.redemptionLimit ?? 1,
    windowMs: 60_000,
    now: () => now
  });
  const wsLimiter = createRateLimiter({
    limit: options.wsLimit ?? 5,
    windowMs: 60_000,
    now: () => now
  });

  const server = createAppServer({
    uiDistPath: uiDir,
    auth,
    terminalRegistry,
    terminalBackend: backend,
    redemptionLimiter,
    wsLimiter,
    logger: {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined
    },
    proxyPort: options.proxyPort,
    devProxyUrl: options.devProxyUrl,
    devProxyHeaders: options.devProxyHeaders,
    hideTerminalSwitcher: options.hideTerminalSwitcher
  });

  const started = await server.listen(0);

  return {
    baseUrl: `http://127.0.0.1:${started.port}`,
    auth,
    backend,
    terminalRegistry,
    redemptionLimiter,
    advance: (value: number) => {
      now = value;
    },
    close: started.close
  };
};

describe("origin helpers", () => {
  it("allows missing origins", () => {
    expect(isAllowedOrigin(undefined, "example.com", null)).toBe(true);
  });

  it("allows origins when host headers are missing", () => {
    expect(isAllowedOrigin("https://example.com", undefined, undefined)).toBe(true);
  });

  it("allows matching host origins", () => {
    expect(isAllowedOrigin("https://example.com", "example.com", null)).toBe(true);
  });

  it("allows matching forwarded host origins", () => {
    expect(isAllowedOrigin("https://proxy.example", "example.com", "proxy.example")).toBe(true);
  });

  it("rejects mismatched origins", () => {
    expect(isAllowedOrigin("https://evil.example", "example.com", "proxy.example")).toBe(false);
  });

  it("resolves forwarded host headers", () => {
    expect(resolveForwardedHost("forwarded.example")).toBe("forwarded.example");
    expect(resolveForwardedHost(["primary.example", "secondary.example"])).toBe("primary.example");
    expect(resolveForwardedHost(undefined)).toBeUndefined();
  });
});

const TLS_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDsQfJ4TrOfubEC
DlMcobnbMIF276XDIEspNyBaZEKKu0cExSbn5AN/ERT+lD9IBI6C4JVbg7vWogsJ
Sc0mT4UCMDHXX6aUmCdp++QmNop5xJYmd04J/Wl9RY01cDFOypSpXpxpWZYHuCVO
mrYWyUz7NNfci5CIck3gQvC+epPDBtxzg2KRy/Uhhfkm9s5KyL4x3P51KJoYnGTe
2SisLPIOnm60POjAayrxLgWjZ9a668xeKEBv8jFKNSjj8gZTpG8PNymvEKSKwMBv
9pnGOs7Yb1chqOlVmBNf5vpsiY6QWkJn8Qhsk3WKkXt1/mgDqzwa8PQKUzjvWC8O
oxg4g7W9AgMBAAECggEABSast5V1B8xFGfCYrmlaDj60fpSxQdvbuXAZz5ebkunh
gS7l6AlNiG9CBXrvwPDjKMZ0wk7ta7uvZJTlICruWFuliMUKAL7yS0TSPfMMQPqE
Sciiy2QTf2O37jrI34rog7/y/0yUSil2jeGEUmLcv7R+zM0VTaRJP0Z9eFt70bUk
+DJOFXEYCDTczjiuvBEs/YfKmVPAUdmcDWh3yviAJt7Oas3RwhQY1CmXHCHJWgCH
ZpJQrx3A6oXYAtZPhiGHTYeIYqmwwdxOgRdfTp8y2mKXVDkEFid5N7TE56kAZgpz
9VkaQZ00H4LvwwkOX/luQO7Yo4Y70HDjGPJdfwbCAQKBgQD+SjKm0M6ltvw/OEdC
cj3L3gA/i+0/34tYySZmhLhlyRNxehy/PXQOqDhKXrYIeGvHgGGR+rHPCbeMJgBX
U94Qq4pafCH537HVBujNXcTrUvhL9lglVRqeWv1vx0ihpJTBSY0F3jHr3UY8hpTO
jYFjqR770mmJUkUJ2Xq7ZhBCHQKBgQDt2LQtRHD7kznrESLp1JPVp6YZPwvrGHjb
sD1971hwCYghfLsYQDllfsCXcj1dTqohDlwJDkFpxFX7YDSf8z6B6ZOzz+cgW3rT
/Q/05jhP2TZl6tXs/8XKhqqbSkv7qgva0Ge+YwBmg1cAZLckYofN1DN4O0zH0ZUZ
abAqkTDwIQKBgHiP9TPiDBfFihLvO9nlECd4OeXnEbUW55pQxEQW6NZZXz6OBtMk
78GDQC0CeovJjFAqLhhoI6VllgB8g+zjdoWwzwfXksRFqqq1e+rialqoG9DoGyKY
Fua9fSth8K2yulRp6tK9Zi3N218W77Z+oLn/lREP0bmpp9Hjqqzu1waBAoGBAK2x
d8MnHCtclQtpdEm3CE8bI12EgTuqn3gv+Hgjdj47d8KcyDUpkcDhE9yFfPLLI8sI
JYYndvW6f+AXndbBWICfB1JlHbCvnb96K1D5X15Qjj1XheqRzuvb9HN7iom64PVn
BJwwyHYUrFCJPIXBvtM9iGjhRW0XTP9GA3TSmx6BAoGBAPgDln5lnmZHC4XsW7l5
eIGhX4JxUnpOWMyR+y0YTBgmn8hA3tvKO9DTLZTEmL5DTuXZBP2o0Up7CMRFG/AH
cHXITl5PQ9JeprUPdtQkl0+Qf2Yi4dsyKnT8ba7AKAzHmKJY+x1bsvZk8N55hjzd
xjBFzKQTIQXDg9GzyuoTu3w+
-----END PRIVATE KEY-----`;

const TLS_CERT = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUFDi2mpwLTEpp+ECF8ZkbqbwslsMwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MDEyMjIwMTYxN1oXDTI2MDEy
MzIwMTYxN1owFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEA7EHyeE6zn7mxAg5THKG52zCBdu+lwyBLKTcgWmRCirtH
BMUm5+QDfxEU/pQ/SASOguCVW4O71qILCUnNJk+FAjAx11+mlJgnafvkJjaKecSW
JndOCf1pfUWNNXAxTsqUqV6caVmWB7glTpq2FslM+zTX3IuQiHJN4ELwvnqTwwbc
c4Nikcv1IYX5JvbOSsi+Mdz+dSiaGJxk3tkorCzyDp5utDzowGsq8S4Fo2fWuuvM
XihAb/IxSjUo4/IGU6RvDzcprxCkisDAb/aZxjrO2G9XIajpVZgTX+b6bImOkFpC
Z/EIbJN1ipF7df5oA6s8GvD0ClM471gvDqMYOIO1vQIDAQABo1MwUTAdBgNVHQ4E
FgQUdwiX2MG95MbfRGQvUDykvgfBNgswHwYDVR0jBBgwFoAUdwiX2MG95MbfRGQv
UDykvgfBNgswDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAVW8l
3kfXZPuTlCx4O+a9kFG2SyXsEyeDB3Xqt4Q5c1bQXiaSC/yWVeogIY3pg3o4P0Dv
xVTmIPfH1b1ptNn2jwRqy3DglceeQBu8fF1aVyp4kUEMDJPvhfOEEmM8HEtAWag3
t1I9we0r3gLcg4qZbpfCauV0FhqU14kC0XcEtD06Z20nUywGy9JoMSahkSBCZEvn
N4qdCbvasB4GVP+A6mByMbwKAKYeHtzRSoKwxnk3wqsKEdf9N8zx+qjw+QWDaMh3
DY52n/S8fPgVXPCcfU1lsqoFe3DMrqoliluzv78sLs88aRtdyFEY6mOsUrCMcRjq
TCSeOurJVfn5l7beMg==
-----END CERTIFICATE-----`;

const getCookie = (setCookie: string | null) => {
  if (!setCookie) {
    return "";
  }

  return setCookie.split(";")[0] ?? "";
};

const getCsrfToken = async (baseUrl: string, cookie: string) => {
  const response = await fetch(`${baseUrl}/__tb/api/csrf`, { headers: { cookie } });
  const payload = (await response.json()) as { csrfToken: string };
  return payload.csrfToken;
};

describe("createAppServer", () => {
  it("serves health and redirects", async () => {
    const fixture = await createServerFixture();

    const health = await fetch(`${fixture.baseUrl}/__tb/healthz`);
    expect(health.status).toBe(200);

    const redirect = await fetch(`${fixture.baseUrl}/`, { redirect: "manual" });
    expect(redirect.status).toBe(302);

    await fixture.close();
  });

  it("serves the UI", async () => {
    const fixture = await createServerFixture();

    const response = await fetch(`${fixture.baseUrl}/__tb/app/`);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("index");

    await fixture.close();
  });

  it("returns 404 for unknown paths", async () => {
    const fixture = await createServerFixture();

    const response = await fetch(`${fixture.baseUrl}/missing`);
    expect(response.status).toBe(404);

    await fixture.close();
  });

  it("redeems tokens and lists terminals", async () => {
    const fixture = await createServerFixture();

    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    expect(redeem.status).toBe(302);
    expect(cookie).toContain("termbridge_session=");

    fixture.advance(1);
    const session = await fixture.backend.createSession("session-1");
    fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const listResponse = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      headers: { cookie }
    });
    const listPayload = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listPayload.terminals).toHaveLength(1);

    await fixture.close();
  });

  it("preserves share query params in the redirect", async () => {
    const fixture = await createServerFixture();

    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(
      `${fixture.baseUrl}/__tb/s/${token}?DAYTONA_SANDBOX_AUTH_KEY=token-123`,
      { redirect: "manual" }
    );

    expect(redeem.status).toBe(302);
    expect(redeem.headers.get("location")).toBe(
      "/__tb/app?DAYTONA_SANDBOX_AUTH_KEY=token-123"
    );

    await fixture.close();
  });

  it("returns csrf token for authenticated requests", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const csrfResponse = await fetch(`${fixture.baseUrl}/__tb/api/csrf`, { headers: { cookie } });
    const payload = await csrfResponse.json() as { csrfToken: string };

    expect(csrfResponse.status).toBe(200);
    expect(payload.csrfToken).toBeDefined();
    expect(typeof payload.csrfToken).toBe("string");

    await fixture.close();
  });

  it("rejects csrf requests without auth", async () => {
    const fixture = await createServerFixture();

    const csrfResponse = await fetch(`${fixture.baseUrl}/__tb/api/csrf`);
    expect(csrfResponse.status).toBe(401);

    await fixture.close();
  });

  it("rejects non-GET methods on csrf endpoint", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const csrfResponse = await fetch(`${fixture.baseUrl}/__tb/api/csrf`, {
      method: "POST",
      headers: { cookie }
    });
    expect(csrfResponse.status).toBe(404);

    await fixture.close();
  });

  it("blocks unauthorized and rate-limited requests", async () => {
    const fixture = await createServerFixture();

    const unauth = await fetch(`${fixture.baseUrl}/__tb/api/terminals`);
    expect(unauth.status).toBe(401);

    const { token } = fixture.auth.issueToken();
    const first = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    expect(first.status).toBe(302);

    const second = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    expect(second.status).toBe(429);

    await fixture.close();
  });

  it("rejects invalid tokens", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });

    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/invalid`, { redirect: "manual" });
    expect(redeem.status).toBe(401);

    await fixture.close();
  });

  it("creates new terminals", async () => {
    const fixture = await createServerFixture();

    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ name: "custom" })
    });

    const payload = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(payload.label).toBe("custom");

    await fixture.close();
  });

  it("returns 404 for unsupported terminal methods", async () => {
    const fixture = await createServerFixture();

    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const response = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      method: "PUT",
      headers: { cookie }
    });

    expect(response.status).toBe(404);

    await fixture.close();
  });

  it("rejects invalid terminal creation bodies", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: "true"
    });

    expect(createResponse.status).toBe(400);

    await fixture.close();
  });

  it("rejects request bodies that are too large", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const largeBody = JSON.stringify({ name: "x".repeat(100 * 1024) }); // >64KB

    const createResponse = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: largeBody
    });

    expect(createResponse.status).toBe(413);
    expect(await createResponse.text()).toBe("request body too large");

    await fixture.close();
  });

  it("accepts malformed JSON bodies by falling back", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: "{"
    });

    expect(createResponse.status).toBe(201);

    await fixture.close();
  });

  it("creates a terminal with a default name when body is empty", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/__tb/api/terminals`, {
      method: "POST",
      headers: { cookie }
    });

    expect(createResponse.status).toBe(201);
    expect(fixture.backend.createSession).toHaveBeenCalled();

    await fixture.close();
  });

  it("handles websocket connections and messages", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-ws");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      { headers: { cookie } }
    );

    const messages: string[] = [];
    ws.on("message", (data) => messages.push(data.toString()));

    await new Promise((resolve) => ws.on("open", resolve));

    ws.send("{invalid-json");
    ws.send(JSON.stringify({ type: "input", data: "ls" }));
    ws.send(Buffer.from(JSON.stringify({ type: "input", data: "buf" })));
    ws.send(JSON.stringify({ type: "resize", cols: 80, rows: 24 }));
    ws.send(JSON.stringify({ type: "control", key: "ctrl_c" }));
    ws.send(JSON.stringify({ type: "scroll", mode: "pages", amount: -1 }));
    ws.send(JSON.stringify({ type: "control", key: "nope" }));

    fixture.backend.emitOutput(session.name, "output");

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(messages.some((message) => message.includes("connected"))).toBe(true);
    expect(messages.some((message) => message.includes("invalid payload"))).toBe(true);
    expect(messages.some((message) => message.includes("output"))).toBe(true);

    expect(fixture.backend.write).toHaveBeenCalled();
    expect(fixture.backend.resize).toHaveBeenCalled();
    expect(fixture.backend.sendControl).toHaveBeenCalled();
    expect(fixture.backend.scroll).toHaveBeenCalled();

    ws.close();
    await fixture.close();
  });

  it("rejects websocket messages that are too large", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-large");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      { headers: { cookie } }
    );

    const messages: string[] = [];
    ws.on("message", (data) => messages.push(data.toString()));

    await new Promise((resolve) => ws.on("open", resolve));

    // Send input with data that exceeds MAX_INPUT_LENGTH (64KB)
    const largeInput = JSON.stringify({ type: "input", data: "x".repeat(100 * 1024) });
    ws.send(largeInput);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(messages.some((message) => message.includes("message too large"))).toBe(true);

    ws.close();
    await fixture.close();
  });

  it("rejects websocket connections with invalid origins", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-origin");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      { headers: { cookie, origin: "http://evil.test" } }
    );

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket connections with malformed origins", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-bad-origin");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      { headers: { cookie, origin: "not-a-url" } }
    );

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("accepts websocket connections when the origin matches the host", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-origin-ok");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");
    const port = new URL(fixture.baseUrl).port;

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      { headers: { cookie, origin: `http://127.0.0.1:${port}` } }
    );

    await new Promise((resolve) => ws.on("open", resolve));
    ws.close();
    await fixture.close();
  });

  it("accepts websocket connections when the origin matches the forwarded host", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-forwarded-origin");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");
    const port = new URL(fixture.baseUrl).port;

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      {
        headers: {
          cookie,
          origin: "http://forwarded.example",
          "x-forwarded-host": "forwarded.example"
        }
      }
    );

    await new Promise((resolve) => ws.on("open", resolve));
    ws.close();
    await fixture.close();
  });

  it("accepts websocket connections with empty origins", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-empty-origin");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");
    const port = new URL(fixture.baseUrl).port;

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      { headers: { cookie, origin: "" } }
    );

    await new Promise((resolve) => ws.on("open", resolve));
    ws.close();
    await fixture.close();
  });

  it("handles websocket connections when forwarded host is an array", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-forwarded-array");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");
    const port = new URL(fixture.baseUrl).port;

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`,
      {
        headers: {
          cookie,
          origin: "http://forwarded-array.example",
          "x-forwarded-host": ["forwarded-array.example", "extra"] as unknown as string
        }
      }
    );

    await new Promise((resolve) => ws.on("error", resolve));
    ws.close();
    await fixture.close();
  });

  it("rejects websocket connections without a session", async () => {
    const fixture = await createServerFixture();
    const session = await fixture.backend.createSession("session-no-cookie");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}`);

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("accepts websocket connections with csrf tokens even without cookies", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-csrf");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");
    const port = new URL(fixture.baseUrl).port;

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`
    );

    await new Promise((resolve) => ws.on("open", resolve));
    ws.close();
    await fixture.close();
  });

  it("rejects websocket connections without csrf token", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const session = await fixture.backend.createSession("session-no-csrf");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}`, {
      headers: { cookie }
    });

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("falls back to websocket tokens when csrf lookup fails", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const configResponse = await fetch(`${fixture.baseUrl}/__tb/api/config`, {
      headers: { cookie }
    });
    const { wsToken } = (await configResponse.json()) as { wsToken: string };

    const session = await fixture.backend.createSession("session-ws-token");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");
    const port = new URL(fixture.baseUrl).port;

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/__tb/ws/terminal/${record.id}?csrf=bad-token&wsToken=${wsToken}`
    );

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket connections with invalid csrf token", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const session = await fixture.backend.createSession("session-bad-csrf");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}?csrf=invalid-token`, {
      headers: { cookie }
    });

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket connections without a terminal", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/missing?csrf=${csrfToken}`, {
      headers: { cookie }
    });

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket upgrades for other paths", async () => {
    const fixture = await createServerFixture();

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/other`);
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects websocket upgrades without an id", async () => {
    const fixture = await createServerFixture();

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/`);
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects websocket connections when rate limited", async () => {
    const fixture = await createServerFixture({ wsLimit: 1 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));
    const csrfToken = await getCsrfToken(fixture.baseUrl, cookie);

    const session = await fixture.backend.createSession("session-limit");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const wsUrl = `ws://127.0.0.1:${new URL(fixture.baseUrl).port}/__tb/ws/terminal/${record.id}?csrf=${csrfToken}`;
    const first = new WebSocket(wsUrl, { headers: { cookie } });
    await new Promise((resolve) => first.on("open", resolve));

    const second = new WebSocket(wsUrl, { headers: { cookie } });
    await new Promise((resolve) => second.on("error", resolve));

    first.close();
    await fixture.close();
  });

  it("returns config with null proxy values when not configured", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const configResponse = await fetch(`${fixture.baseUrl}/__tb/api/config`, { headers: { cookie } });
    const payload = await configResponse.json() as {
      proxyPort: number | null;
      devProxyUrl: string | null;
      hideTerminalSwitcher: boolean;
      wsToken?: string;
    };

    expect(configResponse.status).toBe(200);
    expect(payload.proxyPort).toBe(null);
    expect(payload.devProxyUrl).toBe(null);
    expect(payload.hideTerminalSwitcher).toBe(false);
    expect(typeof payload.wsToken).toBe("string");

    await fixture.close();
  });

  it("returns config with proxyPort when configured", async () => {
    const fixture = await createServerFixture({ proxyPort: 5173 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const configResponse = await fetch(`${fixture.baseUrl}/__tb/api/config`, { headers: { cookie } });
    const payload = await configResponse.json() as {
      proxyPort: number | null;
      devProxyUrl: string | null;
      hideTerminalSwitcher: boolean;
      wsToken?: string;
    };

    expect(configResponse.status).toBe(200);
    expect(payload.proxyPort).toBe(5173);
    expect(payload.devProxyUrl).toBe(null);
    expect(payload.hideTerminalSwitcher).toBe(false);
    expect(typeof payload.wsToken).toBe("string");

    await fixture.close();
  });

  it("returns config with devProxyUrl when configured", async () => {
    const fixture = await createServerFixture({ devProxyUrl: "https://preview.example" });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const configResponse = await fetch(`${fixture.baseUrl}/__tb/api/config`, { headers: { cookie } });
    const payload = await configResponse.json() as {
      proxyPort: number | null;
      devProxyUrl: string | null;
      hideTerminalSwitcher: boolean;
      wsToken?: string;
    };

    expect(configResponse.status).toBe(200);
    expect(payload.proxyPort).toBe(null);
    expect(payload.devProxyUrl).toBe("https://preview.example");
    expect(payload.hideTerminalSwitcher).toBe(false);
    expect(typeof payload.wsToken).toBe("string");

    await fixture.close();
  });

  it("returns config with terminal switcher hidden when configured", async () => {
    const fixture = await createServerFixture({ hideTerminalSwitcher: true });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const configResponse = await fetch(`${fixture.baseUrl}/__tb/api/config`, { headers: { cookie } });
    const payload = await configResponse.json() as {
      proxyPort: number | null;
      devProxyUrl: string | null;
      hideTerminalSwitcher: boolean;
      wsToken?: string;
    };

    expect(configResponse.status).toBe(200);
    expect(payload.hideTerminalSwitcher).toBe(true);
    expect(typeof payload.wsToken).toBe("string");

    await fixture.close();
  });

  it("rejects config requests without auth", async () => {
    const fixture = await createServerFixture();

    const configResponse = await fetch(`${fixture.baseUrl}/__tb/api/config`);
    expect(configResponse.status).toBe(401);

    await fixture.close();
  });

  it("returns 502 when proxy target is unreachable", async () => {
    const fixture = await createServerFixture({ proxyPort: 59999 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/some-path`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(502);
    expect(await proxyResponse.text()).toBe("proxy error");

    await fixture.close();
  });

  it("returns 502 when devProxyUrl target is unreachable", async () => {
    const fixture = await createServerFixture({ devProxyUrl: "http://127.0.0.1:59999" });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/some-path`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(502);
    expect(await proxyResponse.text()).toBe("proxy error");

    await fixture.close();
  });

  it("returns 502 when devProxyUrl is invalid", async () => {
    const fixture = await createServerFixture({ devProxyUrl: "not a url" });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/some-path`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(502);
    expect(await proxyResponse.text()).toBe("proxy error");

    await fixture.close();
  });

  it("returns 502 when devProxyUrl is empty", async () => {
    const fixture = await createServerFixture({ devProxyUrl: "" });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/some-path`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(502);
    expect(await proxyResponse.text()).toBe("proxy error");

    await fixture.close();
  });

  it("rejects proxy websocket without auth", async () => {
    const fixture = await createServerFixture({ proxyPort: 5173 });

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/some-ws-path`);
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects proxy websocket when proxy not configured", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/some-ws-path`, {
      headers: { cookie }
    });
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects proxy websocket when devProxyUrl is invalid", async () => {
    const fixture = await createServerFixture({ devProxyUrl: "not a url" });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/some-ws-path`, {
      headers: { cookie }
    });
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects proxy websocket when target is unreachable", async () => {
    const fixture = await createServerFixture({ proxyPort: 59999 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/some-ws-path`, {
      headers: { cookie }
    });
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("proxies HTTP requests to target server", async () => {
    const targetServer = createHttpServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("hello from target");
    });
    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({ proxyPort: targetPort });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/some-path`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(200);
    expect(await proxyResponse.text()).toBe("hello from target");

    await fixture.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });

  it("proxies HTTP requests to devProxyUrl", async () => {
    let receivedHeaders: Record<string, string | string[] | undefined> = {};
    const targetServer = createHttpServer((req, res) => {
      receivedHeaders = req.headers;
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("hello from dev proxy");
    });
    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({
      devProxyUrl: `http://127.0.0.1:${targetPort}`,
      devProxyHeaders: {
        "x-daytona-preview-token": "token-123",
        "x-daytona-skip-preview-warning": "true"
      }
    });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(200);
    expect(await proxyResponse.text()).toBe("hello from dev proxy");
    expect(receivedHeaders["x-daytona-preview-token"]).toBe("token-123");
    expect(receivedHeaders["x-daytona-skip-preview-warning"]).toBe("true");

    await fixture.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });

  it("proxies HTTPS requests to devProxyUrl", async () => {
    const targetServer = createHttpsServer({ key: TLS_KEY, cert: TLS_CERT }, (_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("hello from secure proxy");
    });
    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const fixture = await createServerFixture({ devProxyUrl: `https://127.0.0.1:${targetPort}` });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/secure`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(200);
    expect(await proxyResponse.text()).toBe("hello from secure proxy");

    await fixture.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
    if (originalTlsReject === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
    }
  });

  it("proxies HTTP requests with paths preserved", async () => {
    const targetServer = createHttpServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(`path: ${req.url}`);
    });
    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({ proxyPort: targetPort });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/app/page`, { headers: { cookie } });
    expect(proxyResponse.status).toBe(200);
    expect(await proxyResponse.text()).toBe("path: /app/page");

    await fixture.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });

  it("does not rewrite Location headers for external hosts", async () => {
    const targetServer = createHttpServer((_req, res) => {
      res.writeHead(302, { Location: "http://external.example.com/path" });
      res.end();
    });
    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({ proxyPort: targetPort });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const proxyResponse = await fetch(`${fixture.baseUrl}/some-path`, {
      headers: { cookie },
      redirect: "manual"
    });
    expect(proxyResponse.status).toBe(302);
    expect(proxyResponse.headers.get("location")).toBe("http://external.example.com/path");

    await fixture.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });

  it("proxies WebSocket connections to target server", async () => {
    const targetServer = createHttpServer();
    const targetWss = new WebSocketServer({ server: targetServer });
    const messages: string[] = [];

    targetWss.on("connection", (ws) => {
      ws.on("message", (data) => {
        messages.push(data.toString());
        ws.send(`echo: ${data.toString()}`);
      });
    });

    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({ proxyPort: targetPort });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/some-ws-path`, {
      headers: { cookie }
    });

    const clientMessages: string[] = [];
    ws.on("message", (data) => clientMessages.push(data.toString()));

    await new Promise((resolve) => ws.on("open", resolve));

    ws.send("hello");
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(messages).toContain("hello");
    expect(clientMessages).toContain("echo: hello");

    ws.close();
    await fixture.close();
    targetWss.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });

  it("proxies secure WebSocket connections to devProxyUrl", async () => {
    const targetServer = createHttpsServer({ key: TLS_KEY, cert: TLS_CERT });
    const targetWss = new WebSocketServer({ server: targetServer });
    const messages: string[] = [];
    let wsHeaders: Record<string, string | string[] | undefined> = {};

    targetWss.on("connection", (ws, req) => {
      wsHeaders = req.headers;
      ws.on("message", (data) => {
        messages.push(data.toString());
        ws.send(`secure: ${data.toString()}`);
      });
    });

    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const originalTlsReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const fixture = await createServerFixture({
      devProxyUrl: `https://127.0.0.1:${targetPort}`,
      devProxyHeaders: {
        "x-daytona-preview-token": "token-456",
        "x-daytona-skip-preview-warning": "true"
      }
    });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/secure-ws`, {
      headers: { cookie }
    });

    const clientMessages: string[] = [];
    ws.on("message", (data) => clientMessages.push(data.toString()));

    await new Promise((resolve) => ws.on("open", resolve));
    ws.send("hello");
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(messages).toContain("hello");
    expect(clientMessages).toContain("secure: hello");
    expect(wsHeaders["x-daytona-preview-token"]).toBe("token-456");
    expect(wsHeaders["x-daytona-skip-preview-warning"]).toBe("true");

    ws.close();
    await fixture.close();
    targetWss.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
    if (originalTlsReject === undefined) {
      delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    } else {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsReject;
    }
  });

  it("closes client WebSocket when target closes", async () => {
    const targetServer = createHttpServer();
    const targetWss = new WebSocketServer({ server: targetServer });

    targetWss.on("connection", (ws) => {
      ws.close();
    });

    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({ proxyPort: targetPort });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/some-ws-path`, {
      headers: { cookie }
    });

    await new Promise((resolve) => ws.on("close", resolve));

    await fixture.close();
    targetWss.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });

  it("proxies WebSocket with path preserved", async () => {
    const targetServer = createHttpServer();
    const targetWss = new WebSocketServer({ server: targetServer });
    let receivedPath = "";

    targetServer.on("upgrade", (request) => {
      receivedPath = request.url ?? "";
    });

    targetWss.on("connection", (ws) => {
      ws.send("connected");
    });

    await new Promise<void>((resolve) => targetServer.listen(0, "127.0.0.1", resolve));
    const targetPort = (targetServer.address() as { port: number }).port;

    const fixture = await createServerFixture({ proxyPort: targetPort });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/__tb/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/_vite/ws`, {
      headers: { cookie }
    });

    await new Promise((resolve) => ws.on("message", resolve));

    expect(receivedPath).toBe("/_vite/ws");

    ws.close();
    await fixture.close();
    targetWss.close();
    await new Promise<void>((resolve) => targetServer.close(() => resolve()));
  });
});
