import type { WebSocket } from "ws";
import { describe, expect, it } from "vitest";
import { parseClientMessage } from "./server";

describe("parseClientMessage", () => {
  it("parses string payloads", () => {
    const payload = JSON.stringify({ type: "input", data: "ls" }) as unknown as WebSocket.RawData;
    const result = parseClientMessage(payload);
    expect(result).toEqual({ ok: true, message: { type: "input", data: "ls" } });
  });

  it("parses buffer payloads", () => {
    const payload = Buffer.from(JSON.stringify({ type: "resize", cols: 80, rows: 24 }));
    const result = parseClientMessage(payload);
    expect(result).toEqual({ ok: true, message: { type: "resize", cols: 80, rows: 24 } });
  });

  it("parses buffer array payloads", () => {
    const json = JSON.stringify({ type: "control", key: "ctrl_c" });
    const payload = [Buffer.from(json.slice(0, 10)), Buffer.from(json.slice(10))];
    const result = parseClientMessage(payload);
    expect(result).toEqual({ ok: true, message: { type: "control", key: "ctrl_c" } });
  });

  it("rejects invalid payloads", () => {
    expect(parseClientMessage("{bad" as unknown as WebSocket.RawData)).toEqual({
      ok: false,
      error: "invalid"
    });
    expect(
      parseClientMessage(
        JSON.stringify({ type: "control", key: "bad" }) as unknown as WebSocket.RawData
      )
    ).toEqual({ ok: false, error: "invalid" });
  });

  it("rejects messages that are too large", () => {
    const largeData = "x".repeat(2 * 1024 * 1024); // 2MB
    const payload = largeData as unknown as WebSocket.RawData;
    const result = parseClientMessage(payload);
    expect(result).toEqual({ ok: false, error: "too_large" });
  });

  it("rejects input data that is too large", () => {
    const largeInput = "x".repeat(100 * 1024); // 100KB
    const payload = JSON.stringify({ type: "input", data: largeInput }) as unknown as WebSocket.RawData;
    const result = parseClientMessage(payload);
    expect(result).toEqual({ ok: false, error: "too_large" });
  });
});
