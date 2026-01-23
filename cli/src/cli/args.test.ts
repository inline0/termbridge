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
      "--sandbox-daytona-direct",
      "--sandbox-daytona-repo",
      "https://github.com/inline0/termbridge-test-app.git",
      "--sandbox-daytona-branch",
      "main",
      "--sandbox-daytona-path",
      "termbridge-test-app",
      "--sandbox-daytona-name",
      "termbridge-sandbox",
      "--sandbox-daytona-preview-port",
      "5173",
      "--sandbox-daytona-public"
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
    expect(parsed.options.sandboxDaytonaDirect).toBe(true);
    expect(parsed.options.sandboxDaytonaRepo).toBe("https://github.com/inline0/termbridge-test-app.git");
    expect(parsed.options.sandboxDaytonaBranch).toBe("main");
    expect(parsed.options.sandboxDaytonaPath).toBe("termbridge-test-app");
    expect(parsed.options.sandboxDaytonaName).toBe("termbridge-sandbox");
    expect(parsed.options.sandboxDaytonaPreviewPort).toBe(5173);
    expect(parsed.options.sandboxDaytonaPublic).toBe(true);
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
    expect(() => parseArgs(["--sandbox-daytona-repo"]))
      .toThrow("missing sandbox daytona repo");
    expect(() => parseArgs(["--sandbox-daytona-branch"]))
      .toThrow("missing sandbox daytona branch");
    expect(() => parseArgs(["--sandbox-daytona-path"]))
      .toThrow("missing sandbox daytona path");
    expect(() => parseArgs(["--sandbox-daytona-name"]))
      .toThrow("missing sandbox daytona name");
    expect(() => parseArgs(["--sandbox-daytona-preview-port"]))
      .toThrow("missing sandbox daytona preview port");
    expect(() => parseArgs(["--unknown"])).toThrow("unknown option");
  });

  it("skips empty arguments", () => {
    const parsed = parseArgs(["", "--no-qr"]);
    expect(parsed.options.noQr).toBe(true);
  });
});
