import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StartResult } from "./start";

vi.mock("./start", () => ({
  startCommand: vi.fn()
}));

import { startCommand } from "./start";
import { InkCliView, runInkCli } from "./ink";
import { render } from "ink";
import qrcode from "qrcode-terminal";

vi.mock("ink", () => ({
  render: vi.fn(),
  Box: () => null,
  Text: () => null
}));

vi.mock("qrcode-terminal", () => ({
  default: {
    generate: (_text: string, _options: { small: boolean }, callback: (output: string) => void) =>
      callback("QR")
  }
}));

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

describe("runInkCli", () => {
  const renderMock = vi.mocked(render);
  const baseResult: StartResult = {
    localUrl: "http://127.0.0.1:4000",
    publicUrl: "https://tunnel",
    token: "token",
    stop: async () => undefined
  };

  beforeEach(() => {
    renderMock.mockReset();
    vi.mocked(startCommand).mockReset();
    vi.spyOn(qrcode, "generate").mockClear();
  });

  it("renders the running view with a QR", async () => {
    const rerender = vi.fn();
    const unmount = vi.fn();
    renderMock.mockReturnValue({ rerender, unmount } as never);

    const qrSpy = vi.spyOn(qrcode, "generate");
    const startCommandMock = vi.fn().mockImplementation(async (_options, deps) => {
      deps?.logger?.info("info");
      deps?.logger?.warn("warn");
      deps?.logger?.error("error");
      deps?.qr?.generate("url", { small: true });
      return baseResult;
    });
    const stdout = createStream();
    const stderr = createStream();
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const code = await runInkCli(
      { killOnExit: false, noQr: false, tunnel: "cloudflare" },
      {
        startCommand: startCommandMock,
        process: { stdout, stderr } as unknown as NodeJS.Process,
        logger
      }
    );

    expect(code).toBe(0);
    expect(startCommandMock).toHaveBeenCalled();
    expect(renderMock).toHaveBeenCalled();
    expect(rerender).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
    expect(qrSpy).toHaveBeenCalledWith(
      "https://tunnel/__tb/s/token",
      { small: true },
      expect.any(Function)
    );
  });

  it("covers ink view states", () => {
    const options = { killOnExit: false, noQr: false, tunnel: "cloudflare" as const };

    expect(
      InkCliView({
        state: "starting",
        options
      })
    ).toBeTruthy();

    expect(
      InkCliView({
        state: "running",
        options,
        localUrl: "http://127.0.0.1:4000",
        publicUrl: "https://tunnel",
        redeemUrl: "https://tunnel/__tb/s/token",
        sessionName: "session",
        qr: null
      })
    ).toBeTruthy();

    expect(
      InkCliView({
        state: "running",
        options,
        qr: null
      })
    ).toBeTruthy();

    expect(
      InkCliView({
        state: "running",
        options: { ...options, noQr: true },
        localUrl: "http://127.0.0.1:4000",
        publicUrl: "https://tunnel",
        redeemUrl: "https://tunnel/__tb/s/token",
        sessionName: "session",
        qr: null
      })
    ).toBeTruthy();

    expect(
      InkCliView({
        state: "running",
        options,
        localUrl: "http://127.0.0.1:4000",
        publicUrl: "https://tunnel",
        redeemUrl: "https://tunnel/__tb/s/token",
        sessionName: "session",
        qr: "QR"
      })
    ).toBeTruthy();
  });

  it("uses default deps when none are provided", async () => {
    const rerender = vi.fn();
    renderMock.mockReturnValue({ rerender, unmount: vi.fn() } as never);
    const startCommandMock = vi.mocked(startCommand);
    startCommandMock.mockResolvedValue(baseResult);

    const code = await runInkCli({ killOnExit: false, noQr: true, tunnel: "cloudflare" });

    expect(code).toBe(0);
    expect(startCommandMock).toHaveBeenCalled();
    expect(rerender).toHaveBeenCalled();
  });

  it("supports no-qr mode", async () => {
    const rerender = vi.fn();
    renderMock.mockReturnValue({ rerender, unmount: vi.fn() } as never);

    const generateSpy = vi.spyOn(qrcode, "generate");
    const startCommandMock = vi.fn().mockResolvedValue(baseResult);
    const code = await runInkCli(
      { killOnExit: false, noQr: true, tunnel: "cloudflare", session: "keep" },
      {
        startCommand: startCommandMock,
        process: { stdout: createStream(), stderr: createStream() } as unknown as NodeJS.Process
      }
    );

    expect(code).toBe(0);
    expect(rerender).toHaveBeenCalled();
    expect(generateSpy).not.toHaveBeenCalled();
  });

  it("handles invalid local URLs", async () => {
    const rerender = vi.fn();
    renderMock.mockReturnValue({ rerender, unmount: vi.fn() } as never);

    const startCommandMock = vi.fn().mockResolvedValue({
      ...baseResult,
      localUrl: "invalid-url"
    });

    const code = await runInkCli(
      { killOnExit: false, noQr: false, tunnel: "cloudflare" },
      {
        startCommand: startCommandMock,
        process: { stdout: createStream(), stderr: createStream() } as unknown as NodeJS.Process
      }
    );

    expect(code).toBe(0);
    expect(rerender).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          sessionName: "termbridge"
        })
      })
    );
  });

  it("prints errors and unmounts on failure", async () => {
    const rerender = vi.fn();
    const unmount = vi.fn();
    renderMock.mockReturnValue({ rerender, unmount } as never);

    const stderr = createStream();
    const startCommandMock = vi.fn().mockRejectedValue(new Error("boom"));

    const code = await runInkCli(
      { killOnExit: false, noQr: false, tunnel: "cloudflare" },
      {
        startCommand: startCommandMock,
        process: { stdout: createStream(), stderr } as unknown as NodeJS.Process
      }
    );

    expect(code).toBe(1);
    expect(stderr.output).toContain("boom");
    expect(unmount).toHaveBeenCalled();
  });

  it("handles non-error rejections", async () => {
    const rerender = vi.fn();
    const unmount = vi.fn();
    renderMock.mockReturnValue({ rerender, unmount } as never);

    const stderr = createStream();
    const startCommandMock = vi.fn().mockRejectedValue("bad");

    const code = await runInkCli(
      { killOnExit: false, noQr: false, tunnel: "cloudflare" },
      {
        startCommand: startCommandMock,
        process: { stdout: createStream(), stderr } as unknown as NodeJS.Process
      }
    );

    expect(code).toBe(1);
    expect(stderr.output).toContain("unknown error");
    expect(unmount).toHaveBeenCalled();
  });
});
