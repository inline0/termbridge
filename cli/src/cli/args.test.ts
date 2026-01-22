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
      "--backend",
      "daytona",
      "--daytona-repo",
      "https://github.com/inline0/termbridge-test-app.git",
      "--daytona-branch",
      "main",
      "--daytona-path",
      "termbridge-test-app",
      "--daytona-name",
      "termbridge-sandbox",
      "--daytona-preview-port",
      "5173",
      "--daytona-public"
    ]);

    expect(parsed.options.port).toBe(3000);
    expect(parsed.options.tunnelToken).toBe("token");
    expect(parsed.options.tunnelUrl).toBe("https://example.com");
    expect(parsed.options.session).toBe("session");
    expect(parsed.options.killOnExit).toBe(true);
    expect(parsed.options.noQr).toBe(true);
    expect(parsed.options.tunnel).toBe("cloudflare");
    expect(parsed.options.backend).toBe("daytona");
    expect(parsed.options.daytonaRepo).toBe("https://github.com/inline0/termbridge-test-app.git");
    expect(parsed.options.daytonaBranch).toBe("main");
    expect(parsed.options.daytonaPath).toBe("termbridge-test-app");
    expect(parsed.options.daytonaSandboxName).toBe("termbridge-sandbox");
    expect(parsed.options.daytonaPreviewPort).toBe(5173);
    expect(parsed.options.daytonaPublic).toBe(true);
  });

  it("supports help", () => {
    expect(parseArgs(["help"]).command).toBe("help");
    expect(parseArgs(["--help"]).command).toBe("help");
  });

  it("parses proxy flag", () => {
    const parsed = parseArgs(["--proxy", "5173"]);
    expect(parsed.options.proxy).toBe(5173);
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
    expect(() => parseArgs(["--backend"]))
      .toThrow("missing backend");
    expect(() => parseArgs(["--backend", "invalid"]))
      .toThrow("invalid backend");
    expect(() => parseArgs(["--daytona-repo"]))
      .toThrow("missing daytona repo");
    expect(() => parseArgs(["--daytona-branch"]))
      .toThrow("missing daytona branch");
    expect(() => parseArgs(["--daytona-path"]))
      .toThrow("missing daytona path");
    expect(() => parseArgs(["--daytona-name"]))
      .toThrow("missing daytona name");
    expect(() => parseArgs(["--daytona-preview-port"]))
      .toThrow("missing daytona preview port");
    expect(() => parseArgs(["--unknown"])).toThrow("unknown option");
  });

  it("skips empty arguments", () => {
    const parsed = parseArgs(["", "--no-qr"]);
    expect(parsed.options.noQr).toBe(true);
  });
});
