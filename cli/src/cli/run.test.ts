import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("./start", () => ({
  startCommand: vi.fn()
}));

import { runCli } from "./run";
import { startCommand, type StartResult } from "./start";

const createStream = () => {
  const chunks: string[] = [];
  return {
    write: (text: string) => {
      chunks.push(text);
    },
    get output() {
      return chunks.join("");
    }
  } as NodeJS.WritableStream & { output: string };
};

describe("runCli", () => {
  const startCommandMock = vi.mocked(startCommand);
  const baseResult = {
    localUrl: "http://127.0.0.1:1234",
    publicUrl: "https://tunnel",
    token: "token",
    stop: async () => undefined
  } satisfies StartResult;

  beforeEach(() => {
    startCommandMock.mockReset();
  });

  it("prints help", async () => {
    const stdout = createStream();
    const stderr = createStream();

    const code = await runCli(["--help"], { stdout, stderr, process });

    expect(code).toBe(0);
    expect(stdout.output).toContain("termbridge");
  });

  it("starts the command", async () => {
    const stdout = createStream();
    const stderr = createStream();
    startCommandMock.mockResolvedValue(baseResult);

    const code = await runCli([], { stdout, stderr, process });

    expect(code).toBe(0);
    expect(startCommandMock).toHaveBeenCalled();
  });

  it("uses process defaults when streams are missing", async () => {
    startCommandMock.mockResolvedValue(baseResult);

    const code = await runCli([]);

    expect(code).toBe(0);
    expect(startCommandMock).toHaveBeenCalled();
  });

  it("wires logger callbacks", async () => {
    const stdout = createStream();
    const stderr = createStream();
    startCommandMock.mockImplementation(async (_options, deps) => {
      deps?.logger?.info("info");
      deps?.logger?.warn("warn");
      deps?.logger?.error("error");
      deps?.qr?.generate("url", { small: true });
      return baseResult;
    });

    const code = await runCli([], { stdout, stderr, process });

    expect(code).toBe(0);
    expect(stdout.output).toContain("info");
    expect(stderr.output).toContain("warn");
    expect(stderr.output).toContain("error");
  });

  it("reports errors", async () => {
    const stdout = createStream();
    const stderr = createStream();
    startCommandMock.mockRejectedValue(new Error("boom"));

    const code = await runCli([], { stdout, stderr, process });

    expect(code).toBe(1);
    expect(stderr.output).toContain("boom");
  });

  it("handles non-error rejections", async () => {
    const stderr = createStream();
    startCommandMock.mockRejectedValue("bad");

    const code = await runCli([], { stderr, stdout: createStream(), process });

    expect(code).toBe(1);
    expect(stderr.output).toContain("unknown error");
  });
});
