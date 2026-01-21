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
      "--session",
      "session",
      "--kill-on-exit",
      "--no-qr",
      "--tunnel",
      "cloudflare"
    ]);

    expect(parsed.options.port).toBe(3000);
    expect(parsed.options.session).toBe("session");
    expect(parsed.options.killOnExit).toBe(true);
    expect(parsed.options.noQr).toBe(true);
    expect(parsed.options.tunnel).toBe("cloudflare");
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
    expect(() => parseArgs(["--unknown"])).toThrow("unknown option");
  });

  it("skips empty arguments", () => {
    const parsed = parseArgs(["", "--no-qr"]);
    expect(parsed.options.noQr).toBe(true);
  });
});
