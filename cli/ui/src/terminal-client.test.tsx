import { describe, expect, it, vi } from "vitest";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";
import { createTerminalClient, getWebSocketUrl } from "./terminal-client";

class FakeWebSocket {
  url: string;
  listeners: Record<string, Array<(event: { data?: unknown }) => void>> = {};
  send = vi.fn();
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, handler: (event: { data?: unknown }) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(handler);
  }

  emit(type: string, data?: unknown) {
    const handlers = this.listeners[type] ?? [];
    handlers.forEach((handler) => {
      handler({ data });
    });
  }
}

class FakeTerminal {
  dataHandler: ((data: string) => void) | null = null;
  loadAddon = vi.fn();
  open = vi.fn();
  write = vi.fn();
  dispose = vi.fn();

  onData(handler: (data: string) => void) {
    this.dataHandler = handler;
  }
}

class FakeFitAddon {
  fit = vi.fn();
  proposeDimensions = vi.fn();
}

describe("terminal-client", () => {
  it("builds websocket URLs", () => {
    const windowRef = {
      location: { protocol: "https:", host: "example.com" }
    } as Window;

    expect(getWebSocketUrl("abc", windowRef)).toBe("wss://example.com/ws/terminal/abc");
  });

  it("connects, resizes, and streams output", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const windowListeners: Record<string, () => void> = {};
    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: (event: string, handler: () => void) => {
        windowListeners[event] = handler;
      },
      removeEventListener: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = vi.fn(() => socket) as unknown as typeof WebSocket;

    const client = createTerminalClient(document.body, "terminal-1", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    terminal.dataHandler?.("ls");
    socket.emit("message", JSON.stringify({ type: "output", data: "ok" }));
    socket.emit("message", "invalid-json");
    socket.emit("message", 10);
    client.sendControl("ctrl_c");

    windowListeners.resize?.();

    expect(socket.send).toHaveBeenCalled();
    expect(terminal.write).toHaveBeenCalledWith("ok");

    client.destroy();
    expect(socket.close).toHaveBeenCalled();
    expect(terminal.dispose).toHaveBeenCalled();
  });

  it("skips resize when dimensions are unavailable", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue(null);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = vi.fn(() => socket) as unknown as typeof WebSocket;

    createTerminalClient(document.body, "terminal-2", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");

    expect(socket.send).not.toHaveBeenCalled();
  });

  it("uses default dependencies when none are provided", () => {
    const originalWebSocket = global.WebSocket;
    const socket = new FakeWebSocket("ws://localhost");

    global.WebSocket = (vi.fn(() => socket) as unknown) as typeof WebSocket;

    const client = createTerminalClient(document.body, "terminal-default");
    socket.emit("open");

    client.destroy();
    global.WebSocket = originalWebSocket;

    expect(socket.send).toHaveBeenCalled();
  });
});
