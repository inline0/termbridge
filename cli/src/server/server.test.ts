import { describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import WebSocket from "ws";
import { createAuth } from "./auth";
import { createRateLimiter } from "./rate-limit";
import { createTerminalRegistry } from "./terminal-registry";
import { createAppServer } from "./server";
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

const createServerFixture = async (options: { redemptionLimit?: number; wsLimit?: number } = {}) => {
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
    }
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

const getCookie = (setCookie: string | null) => {
  if (!setCookie) {
    return "";
  }

  return setCookie.split(";")[0] ?? "";
};

describe("createAppServer", () => {
  it("serves health and redirects", async () => {
    const fixture = await createServerFixture();

    const health = await fetch(`${fixture.baseUrl}/healthz`);
    expect(health.status).toBe(200);

    const redirect = await fetch(`${fixture.baseUrl}/`, { redirect: "manual" });
    expect(redirect.status).toBe(302);

    await fixture.close();
  });

  it("serves the UI", async () => {
    const fixture = await createServerFixture();

    const response = await fetch(`${fixture.baseUrl}/app/`);
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
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    expect(redeem.status).toBe(302);
    expect(cookie).toContain("termbridge_session=");

    fixture.advance(1);
    const session = await fixture.backend.createSession("session-1");
    fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const listResponse = await fetch(`${fixture.baseUrl}/api/terminals`, {
      headers: { cookie }
    });
    const listPayload = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(listPayload.terminals).toHaveLength(1);

    await fixture.close();
  });

  it("blocks unauthorized and rate-limited requests", async () => {
    const fixture = await createServerFixture();

    const unauth = await fetch(`${fixture.baseUrl}/api/terminals`);
    expect(unauth.status).toBe(401);

    const { token } = fixture.auth.issueToken();
    const first = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    expect(first.status).toBe(302);

    const second = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    expect(second.status).toBe(429);

    await fixture.close();
  });

  it("rejects invalid tokens", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });

    const redeem = await fetch(`${fixture.baseUrl}/s/invalid`, { redirect: "manual" });
    expect(redeem.status).toBe(401);

    await fixture.close();
  });

  it("creates new terminals", async () => {
    const fixture = await createServerFixture();

    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/api/terminals`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: JSON.stringify({ name: "custom" })
    });

    const payload = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(payload.label).toBe("custom");

    await fixture.close();
  });

  it("rejects invalid terminal creation bodies", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/api/terminals`, {
      method: "POST",
      headers: { cookie, "content-type": "application/json" },
      body: "true"
    });

    expect(createResponse.status).toBe(400);

    await fixture.close();
  });

  it("accepts malformed JSON bodies by falling back", async () => {
    const fixture = await createServerFixture({ redemptionLimit: 5 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/api/terminals`, {
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
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const createResponse = await fetch(`${fixture.baseUrl}/api/terminals`, {
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
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const session = await fixture.backend.createSession("session-ws");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/${record.id}`,
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
    ws.send(JSON.stringify({ type: "control", key: "nope" }));

    fixture.backend.emitOutput(session.name, "output");

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(messages.some((message) => message.includes("connected"))).toBe(true);
    expect(messages.some((message) => message.includes("invalid payload"))).toBe(true);
    expect(messages.some((message) => message.includes("output"))).toBe(true);

    expect(fixture.backend.write).toHaveBeenCalled();
    expect(fixture.backend.resize).toHaveBeenCalled();
    expect(fixture.backend.sendControl).toHaveBeenCalled();

    ws.close();
    await fixture.close();
  });

  it("rejects websocket connections with invalid origins", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const session = await fixture.backend.createSession("session-origin");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/${record.id}`,
      { headers: { cookie, origin: "http://evil.test" } }
    );

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket connections with malformed origins", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const session = await fixture.backend.createSession("session-bad-origin");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/${record.id}`,
      { headers: { cookie, origin: "not-a-url" } }
    );

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket connections without a session", async () => {
    const fixture = await createServerFixture();
    const session = await fixture.backend.createSession("session-no-cookie");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/${record.id}`);

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket connections without a terminal", async () => {
    const fixture = await createServerFixture();
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/missing`, {
      headers: { cookie }
    });

    await new Promise((resolve) => ws.on("error", resolve));
    await fixture.close();
  });

  it("rejects websocket upgrades for other paths", async () => {
    const fixture = await createServerFixture();

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/other`);
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects websocket upgrades without an id", async () => {
    const fixture = await createServerFixture();

    const ws = new WebSocket(`ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/`);
    await new Promise((resolve) => ws.on("error", resolve));

    await fixture.close();
  });

  it("rejects websocket connections when rate limited", async () => {
    const fixture = await createServerFixture({ wsLimit: 1 });
    const { token } = fixture.auth.issueToken();
    const redeem = await fetch(`${fixture.baseUrl}/s/${token}`, { redirect: "manual" });
    const cookie = getCookie(redeem.headers.get("set-cookie"));

    const session = await fixture.backend.createSession("session-limit");
    const record = fixture.terminalRegistry.add(session.name, session.name, "tmux");

    const wsUrl = `ws://127.0.0.1:${new URL(fixture.baseUrl).port}/ws/terminal/${record.id}`;
    const first = new WebSocket(wsUrl, { headers: { cookie } });
    await new Promise((resolve) => first.on("open", resolve));

    const second = new WebSocket(wsUrl, { headers: { cookie } });
    await new Promise((resolve) => second.on("error", resolve));

    first.close();
    await fixture.close();
  });
});
