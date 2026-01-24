import type { WebSocket } from "ws";
import {
  TERMINAL_CONTROL_KEYS,
  type TerminalClientMessage,
  type TerminalControlKey,
  type TerminalServerMessage
} from "@termbridge/shared";

export const MAX_WS_MESSAGE_SIZE = 1024 * 1024;
export const MAX_INPUT_LENGTH = 64 * 1024;

const allowedControlKeys: Set<TerminalControlKey> = new Set(TERMINAL_CONTROL_KEYS);

export type ParseResult =
  | { ok: true; message: TerminalClientMessage }
  | { ok: false; error: "too_large" | "invalid" };

export const parseClientMessage = (payload: WebSocket.Data): ParseResult => {
  const size =
    typeof payload === "string"
      ? payload.length
      : Array.isArray(payload)
        ? payload.reduce((sum, buf) => sum + buf.length, 0)
        : payload.byteLength;

  if (size > MAX_WS_MESSAGE_SIZE) {
    return { ok: false, error: "too_large" };
  }

  const text =
    typeof payload === "string"
      ? payload
      : Array.isArray(payload)
        ? Buffer.concat(payload).toString()
        : payload.toString();

  try {
    const parsed = JSON.parse(text) as TerminalClientMessage;

    if (parsed.type === "input" && typeof parsed.data === "string") {
      if (parsed.data.length > MAX_INPUT_LENGTH) {
        return { ok: false, error: "too_large" };
      }
      return { ok: true, message: parsed };
    }

    if (
      parsed.type === "resize" &&
      typeof parsed.cols === "number" &&
      typeof parsed.rows === "number"
    ) {
      return { ok: true, message: parsed };
    }

    if (parsed.type === "control" && allowedControlKeys.has(parsed.key)) {
      return { ok: true, message: parsed };
    }

    if (
      parsed.type === "scroll" &&
      (parsed.mode === "lines" || parsed.mode === "pages") &&
      typeof parsed.amount === "number" &&
      Number.isFinite(parsed.amount)
    ) {
      return { ok: true, message: parsed };
    }

    return { ok: false, error: "invalid" };
  } catch {
    return { ok: false, error: "invalid" };
  }
};

export const sendWsMessage = (socket: WebSocket, message: TerminalServerMessage) => {
  socket.send(JSON.stringify(message));
};
