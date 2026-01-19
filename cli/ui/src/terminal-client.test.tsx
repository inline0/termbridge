import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Terminal } from "@xterm/xterm";
import type { FitAddon } from "@xterm/addon-fit";

type WebglAddonStub = {
  dispose: ReturnType<typeof vi.fn>;
  onContextLoss: ReturnType<typeof vi.fn>;
};

let lastWebglAddon: WebglAddonStub | null = null;

vi.mock("@xterm/xterm", () => {
  class Terminal {
    element: HTMLElement | null = null;
    loadAddon = vi.fn();
    open = vi.fn();
    resize = vi.fn();
    scrollToBottom = vi.fn();
    write = vi.fn();
    dispose = vi.fn();
    onData = vi.fn();
  }

  return { Terminal };
});

vi.mock("@xterm/addon-fit", () => {
  class FitAddon {
    fit = vi.fn();
    proposeDimensions = vi.fn(() => ({ cols: 80, rows: 24 }));
  }

  return { FitAddon };
});

vi.mock("@xterm/addon-webgl", () => {
  class WebglAddon {
    dispose = vi.fn();
    onContextLoss = vi.fn();

    constructor() {
      lastWebglAddon = this;
    }
  }

  return { WebglAddon };
});

vi.mock("@xterm/addon-web-links", () => {
  class WebLinksAddon {}

  return { WebLinksAddon };
});

let createTerminalClient: typeof import("./terminal-client").createTerminalClient;
let getWebSocketUrl: typeof import("./terminal-client").getWebSocketUrl;

beforeAll(async () => {
  ({ createTerminalClient, getWebSocketUrl } = await import("./terminal-client"));
});

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

const createWebSocketCtor = (socket: FakeWebSocket) =>
  class WebSocketImpl {
    url: string;

    constructor(url: string) {
      this.url = url;
    }

    addEventListener(
      type: string,
      handler: (event: { data?: unknown }) => void
    ) {
      socket.addEventListener(type, handler);
    }

    send = socket.send;
    close = socket.close;
  } as unknown as typeof WebSocket;

class FakeTerminal {
  dataHandler: ((data: string) => void) | null = null;
  element?: HTMLElement | null;
  loadAddon = vi.fn();
  open = vi.fn();
  resize = vi.fn();
  scrollToBottom = vi.fn();
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
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(document.body, "terminal-1", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    terminal.dataHandler?.("ls");
    socket.emit("message", JSON.stringify({ type: "output", data: "ok" }));
    socket.emit("message", JSON.stringify({ type: "status", state: "connected" }));
    socket.emit("message", "invalid-json");
    socket.emit("message", 10);
    client.sendControl("ctrl_c");
    client.sendInput("echo hi");

    windowListeners.resize?.();

    expect(socket.send).toHaveBeenCalled();
    expect(terminal.write).toHaveBeenCalledWith("ok");

    client.destroy();
    expect(socket.close).toHaveBeenCalled();
    expect(terminal.dispose).toHaveBeenCalled();
  });

  it("does not send empty input payloads", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(document.body, "terminal-input-empty", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    client.sendInput("ls");
    const sendCount = socket.send.mock.calls.length;
    client.sendInput("");

    expect(socket.send.mock.calls.length).toBe(sendCount);

    client.destroy();
  });

  it("sizes to the container on open", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const viewport = document.createElement("div");
    Object.defineProperty(viewport, "offsetWidth", { value: 100 });
    Object.defineProperty(viewport, "clientWidth", { value: 90 });

    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: 120 });
    Object.defineProperty(element, "clientHeight", { value: 60 });
    element.querySelector = vi.fn(() => viewport);
    terminal.element = element;

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 60 });
    document.body.appendChild(container);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-size", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");

    expect(terminal.resize).toHaveBeenCalledWith(73, 24);
    const sentMessages = vi.mocked(socket.send).mock.calls.map(([payload]) => payload);
    const resizePayload = sentMessages
      .map((payload) => {
        if (typeof payload !== "string") {
          return null;
        }
        try {
          return JSON.parse(payload);
        } catch {
          return null;
        }
      })
      .find((message) => message?.type === "resize");
    expect(resizePayload).toEqual({ type: "resize", cols: 73, rows: 24 });

    client.destroy();
  });

  it("resizes after fonts are ready", async () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValueOnce(null).mockReturnValue({ cols: 80, rows: 24 });

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 80 });
    document.body.appendChild(container);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn(),
      document: {
        fonts: {
          ready: Promise.resolve()
        }
      }
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-fonts", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    await Promise.resolve();

    expect(terminal.resize).toHaveBeenCalledWith(80, 24);

    client.destroy();
  });

  it("ignores font readiness failures", async () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 80 });
    document.body.appendChild(container);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn(),
      document: {
        fonts: {
          ready: Promise.reject(new Error("font load failed"))
        }
      }
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-fonts-error", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(terminal.resize).toHaveBeenCalledWith(80, 24);

    client.destroy();
  });

  it("does not send until the socket is ready", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(document.body, "terminal-wait", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    client.sendControl("ctrl_c");

    expect(socket.send).not.toHaveBeenCalled();

    client.destroy();
  });

  it("uses timeout scheduling when RAF is unavailable", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 10 });

    const viewport = document.createElement("div");
    Object.defineProperty(viewport, "offsetWidth", { value: 100 });
    Object.defineProperty(viewport, "clientWidth", { value: 100 });

    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: 100 });
    element.querySelector = vi.fn(() => viewport);
    terminal.element = element;

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 80 });
    document.body.appendChild(container);

    const windowListeners: Record<string, () => void> = {};
    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: (event: string, handler: () => void) => {
        windowListeners[event] = handler;
      },
      removeEventListener: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-timeout", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    vi.runAllTimers();

    expect(terminal.resize).toHaveBeenCalledWith(80, 10);

    const resizeCalls = vi.mocked(terminal.resize).mock.calls.length;
    windowListeners.resize?.();
    vi.runAllTimers();
    expect(terminal.resize).toHaveBeenCalledTimes(resizeCalls);

    windowListeners.resize?.();
    client.destroy();
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips resize when dimensions are unavailable", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue(null);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(document.body, "terminal-2", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");

    expect(socket.send).not.toHaveBeenCalled();

    client.destroy();
  });

  it("retries sizing until dimensions are available", () => {
    vi.useFakeTimers();

    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions
      .mockReturnValueOnce(null)
      .mockReturnValue({ cols: 80, rows: 24 });

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 80 });
    document.body.appendChild(container);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-retry", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    vi.runAllTimers();

    expect(terminal.resize).toHaveBeenCalledWith(80, 24);

    client.destroy();
    vi.useRealTimers();
  });

  it("stops retrying after the limit", () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");

    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue(null);

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 80 });
    document.body.appendChild(container);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-retry-limit", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    vi.runAllTimers();

    const retryCalls = setTimeoutSpy.mock.calls.filter(([, delay]) => delay === 50).length;
    expect(retryCalls).toBe(6);
    expect(terminal.resize).not.toHaveBeenCalled();

    client.destroy();
    setTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });

  it("uses default dependencies when none are provided", () => {
    const originalWebSocket = global.WebSocket;
    const socket = new FakeWebSocket("ws://localhost");

    global.WebSocket = createWebSocketCtor(socket);

    const client = createTerminalClient(document.body, "terminal-default");
    socket.emit("open");
    client.sendControl("ctrl_c");

    client.destroy();
    global.WebSocket = originalWebSocket;

    expect(socket.send).toHaveBeenCalled();
  });

  it("exposes the terminal when the debug flag is set", () => {
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      __TERMbridgeExposeTerminal: true
    } as unknown as Window & {
      __TERMbridgeExposeTerminal?: boolean;
      __TERMbridgeTerminal?: Terminal;
    };

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(document.body, "terminal-debug", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    expect(windowRef.__TERMbridgeTerminal).toBe(terminal);

    client.destroy();
  });

  it("uses resize observers and webgl when available", () => {
    lastWebglAddon = null;
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const viewport = document.createElement("div");
    Object.defineProperty(viewport, "offsetWidth", { value: 100 });
    Object.defineProperty(viewport, "clientWidth", { value: 90 });

    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", { value: 120 });
    element.appendChild(viewport);
    element.querySelector = vi.fn(() => viewport);
    terminal.element = element;

    const container = document.createElement("div");
    Object.defineProperty(container, "clientWidth", { value: 120 });
    Object.defineProperty(container, "clientHeight", { value: 80 });
    document.body.appendChild(container);

    let resizeCallback: ((entries: unknown[], observer: unknown) => void) | null = null;
    const resizeObserverInstances: Array<{ disconnect: ReturnType<typeof vi.fn> }> = [];

    class FakeResizeObserver {
      disconnect = vi.fn();
      observe = vi.fn();

      constructor(callback: (entries: unknown[], observer: unknown) => void) {
        resizeCallback = callback;
        resizeObserverInstances.push(this);
      }
    }

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn(),
      ResizeObserver: FakeResizeObserver,
      WebGLRenderingContext: function WebGLRenderingContext() {}
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-webgl", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    const callback = resizeCallback as unknown as ((entries: unknown[], observer: unknown) => void) | null;
    callback?.(
      [{ contentRect: container.getBoundingClientRect() } as ResizeObserverEntry],
      resizeObserverInstances[0] as unknown as ResizeObserver
    );
    if (!lastWebglAddon) {
      throw new Error("expected webgl addon");
    }
    const webglAddon = lastWebglAddon as unknown as WebglAddonStub;
    const onContextLoss = webglAddon.onContextLoss.mock.calls[0]?.[0] as
      | (() => void)
      | undefined;
    onContextLoss?.();
    client.destroy();

    expect(resizeObserverInstances[0]?.disconnect).toHaveBeenCalled();
    expect(webglAddon.onContextLoss).toHaveBeenCalled();
    expect(webglAddon.dispose).toHaveBeenCalled();
  });

  it("disposes the webgl addon on destroy", () => {
    lastWebglAddon = null;
    const terminal = new FakeTerminal();
    const fitAddon = new FakeFitAddon();
    fitAddon.proposeDimensions.mockReturnValue({ cols: 80, rows: 24 });

    const container = document.createElement("div");
    document.body.appendChild(container);

    const windowRef = {
      location: { protocol: "http:", host: "localhost" },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
      cancelAnimationFrame: vi.fn(),
      WebGLRenderingContext: function WebGLRenderingContext() {}
    } as unknown as Window;

    const socket = new FakeWebSocket("ws://localhost");
    const WebSocketImpl = createWebSocketCtor(socket);

    const client = createTerminalClient(container, "terminal-webgl-destroy", {
      createTerminal: () => terminal as unknown as Terminal,
      createFitAddon: () => fitAddon as unknown as FitAddon,
      WebSocketImpl,
      windowRef
    });

    socket.emit("open");
    client.destroy();

    if (!lastWebglAddon) {
      throw new Error("expected webgl addon");
    }
    const webglAddon = lastWebglAddon as unknown as WebglAddonStub;
    expect(webglAddon.dispose).toHaveBeenCalled();
  });
});
