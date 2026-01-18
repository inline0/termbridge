import type { WebSocket } from "ws";
import { describe, expect, it } from "vitest";
import { parseClientMessage } from "./server";

describe("parseClientMessage", () => {
  it("parses string payloads", () => {
    const payload = JSON.stringify({ type: "input", data: "ls" }) as unknown as WebSocket.RawData;
    const message = parseClientMessage(payload);
    expect(message).toEqual({ type: "input", data: "ls" });
  });

  it("parses buffer payloads", () => {
    const payload = Buffer.from(JSON.stringify({ type: "resize", cols: 80, rows: 24 }));
    const message = parseClientMessage(payload);
    expect(message).toEqual({ type: "resize", cols: 80, rows: 24 });
  });

  it("rejects invalid payloads", () => {
    expect(parseClientMessage("{bad" as unknown as WebSocket.RawData)).toBeNull();
    expect(
      parseClientMessage(
        JSON.stringify({ type: "control", key: "bad" }) as unknown as WebSocket.RawData
      )
    ).toBeNull();
  });
});
