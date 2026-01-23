import { describe, expect, it } from "vitest";
import { parseArgs } from "./args";

describe("parseArgs", () => {
  it("parses defaults", () => {
    const parsed = parseArgs([]);
    expect(parsed.command).toBe("start");
    expect(parsed.options.noQr).toBe(false);
  });

  it("parses flags", () => {
    const parsed = parseArgs([
      "start",
      "--port",
      "3000",
      "--tunnel-token",
      "token",
      "--tunnel-url",
      "https://example.com",
      "--session",
      "session",
      "--kill-on-exit",
      "--no-qr",
      "--tunnel",
      "cloudflare",
      "--no-tunnel",
      "--public-url",
      "https://public.example",
      "--backend",
      "sandbox-daytona",
      "--sandbox-direct",
      "--sandbox-repo",
      "https://github.com/inline0/termbridge-test-app.git",
      "--sandbox-branch",
      "main",
      "--sandbox-path",
      "termbridge-test-app",
      "--sandbox-name",
      "termbridge-sandbox",
      "--sandbox-preview-port",
      "5173",
      "--sandbox-public"
    ]);

    expect(parsed.options.port).toBe(3000);
    expect(parsed.options.tunnelToken).toBe("token");
    expect(parsed.options.tunnelUrl).toBe("https://example.com");
    expect(parsed.options.session).toBe("session");
    expect(parsed.options.killOnExit).toBe(true);
    expect(parsed.options.noQr).toBe(true);
    expect(parsed.options.tunnel).toBe("none");
    expect(parsed.options.publicUrl).toBe("https://public.example");
    expect(parsed.options.backend).toBe("sandbox-daytona");
    expect(parsed.options.sandboxDirect).toBe(true);
    expect(parsed.options.sandboxRepo).toBe("https://github.com/inline0/termbridge-test-app.git");
    expect(parsed.options.sandboxBranch).toBe("main");
    expect(parsed.options.sandboxPath).toBe("termbridge-test-app");
    expect(parsed.options.sandboxName).toBe("termbridge-sandbox");
    expect(parsed.options.sandboxPreviewPort).toBe(5173);
    expect(parsed.options.sandboxPublic).toBe(true);
  });

  it("supports help", () => {
    expect(parseArgs(["help"]).command).toBe("help");
    expect(parseArgs(["--help"]).command).toBe("help");
  });

  it("parses proxy flag", () => {
    const parsed = parseArgs(["--proxy", "5173"]);
    expect(parsed.options.proxy).toBe(5173);
  });

  it("accepts the none tunnel provider", () => {
    const parsed = parseArgs(["--tunnel", "none"]);
    expect(parsed.options.tunnel).toBe("none");
  });

  it("parses dev-proxy-url flag", () => {
    const parsed = parseArgs(["--dev-proxy-url", "http://localhost:5174"]);
    expect(parsed.options.devProxyUrl).toBe("http://localhost:5174");
  });

  it("rejects invalid inputs", () => {
    expect(() => parseArgs(["--port", "bad"]))
      .toThrow("invalid port");
    expect(() => parseArgs(["--port"]))
      .toThrow("invalid port");
    expect(() => parseArgs(["--proxy", "bad"]))
      .toThrow("invalid proxy port");
    expect(() => parseArgs(["--proxy"]))
      .toThrow("invalid proxy port");
    expect(() => parseArgs(["--session"]))
      .toThrow("missing session name");
    expect(() => parseArgs(["--dev-proxy-url"]))
      .toThrow("missing dev proxy URL");
    expect(() => parseArgs(["--tunnel", "ngrok"]))
      .toThrow("unsupported tunnel provider");
    expect(() => parseArgs(["--tunnel-token"]))
      .toThrow("missing tunnel token");
    expect(() => parseArgs(["--tunnel-url"]))
      .toThrow("missing tunnel url");
    expect(() => parseArgs(["--public-url"]))
      .toThrow("missing public url");
    expect(() => parseArgs(["--backend"]))
      .toThrow("missing backend");
    expect(() => parseArgs(["--backend", "invalid"]))
      .toThrow("invalid backend");
    expect(() => parseArgs(["--sandbox-repo"]))
      .toThrow("missing sandbox repo");
    expect(() => parseArgs(["--sandbox-branch"]))
      .toThrow("missing sandbox branch");
    expect(() => parseArgs(["--sandbox-path"]))
      .toThrow("missing sandbox path");
    expect(() => parseArgs(["--sandbox-name"]))
      .toThrow("missing sandbox name");
    expect(() => parseArgs(["--sandbox-preview-port"]))
      .toThrow("missing sandbox preview port");
    expect(() => parseArgs(["--unknown"])).toThrow("unknown option");
  });

  it("skips empty arguments", () => {
    const parsed = parseArgs(["", "--no-qr"]);
    expect(parsed.options.noQr).toBe(true);
  });
});
