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

  it("rejects invalid inputs", () => {
    expect(() => parseArgs(["--port", "bad"]))
      .toThrow("invalid port");
    expect(() => parseArgs(["--port"]))
      .toThrow("invalid port");
    expect(() => parseArgs(["--session"]))
      .toThrow("missing session name");
    expect(() => parseArgs(["--tunnel", "ngrok"]))
      .toThrow("unsupported tunnel provider");
    expect(() => parseArgs(["--unknown"])).toThrow("unknown option");
  });

  it("skips empty arguments", () => {
    const parsed = parseArgs(["", "--no-qr"]);
    expect(parsed.options.noQr).toBe(true);
  });
});
