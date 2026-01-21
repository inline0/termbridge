import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { WebglAddon } from "@xterm/addon-webgl";
import type {
  TerminalClientMessage,
  TerminalControlKey,
  TerminalServerMessage
} from "@termbridge/shared";

export type ConnectionState = "connecting" | "connected" | "disconnected" | "reconnecting";

export type TerminalClient = {
  sendControl: (key: TerminalControlKey) => void;
  sendInput: (data: string) => void;
  destroy: () => void;
  getConnectionState: () => ConnectionState;
  onConnectionStateChange: (callback: (state: ConnectionState) => void) => () => void;
};

export type TerminalClientDeps = {
  createTerminal?: () => Terminal;
  createFitAddon?: () => FitAddon;
  WebSocketImpl?: typeof WebSocket;
  windowRef?: WindowLike;
};

type WindowLike = Window & {
  ResizeObserver?: typeof ResizeObserver;
  WebGLRenderingContext?: typeof WebGLRenderingContext;
};

export const getWebSocketUrl = (terminalId: string, csrfToken: string, windowRef: Window) => {
  const protocol = windowRef.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${windowRef.location.host}/__tb/ws/terminal/${terminalId}?csrf=${encodeURIComponent(csrfToken)}`;
};

const terminalTheme = {
  background: "#0a0a0a",
  foreground: "#e4e4e7",
  cursor: "#e4e4e7",
  cursorAccent: "#09090b",
  selectionBackground: "#3f3f46",
  black: "#18181b",
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#eab308",
  blue: "#3b82f6",
  magenta: "#a855f7",
  cyan: "#06b6d4",
  white: "#e4e4e7",
  brightBlack: "#52525b",
  brightRed: "#f87171",
  brightGreen: "#4ade80",
  brightYellow: "#facc15",
  brightBlue: "#60a5fa",
  brightMagenta: "#c084fc",
  brightCyan: "#22d3ee",
  brightWhite: "#fafafa"
};

const getScrollbarWidth = (terminal: Terminal) => {
  const viewport = terminal.element?.querySelector(".xterm-viewport") as HTMLElement | null;
  if (!viewport) {
    return 0;
  }

  const width = viewport.offsetWidth - viewport.clientWidth;
  return width > 0 ? width : 0;
};

const parseServerMessage = (payload: unknown): TerminalServerMessage | null => {
  if (typeof payload !== "string") {
    return null;
  }

  try {
    return JSON.parse(payload) as TerminalServerMessage;
  } catch {
    return null;
  }
};

export const createTerminalClient = (
  container: HTMLElement,
  terminalId: string,
  csrfToken: string,
  deps: TerminalClientDeps = {}
): TerminalClient => {
  const createTerminal =
    deps.createTerminal ??
    (() =>
      new Terminal({
        allowProposedApi: true,
        cursorBlink: true,
        fontFamily: "Menlo, Monaco, 'Courier New', monospace",
        fontSize: 12,
        lineHeight: 1.2,
        theme: terminalTheme
      }));
  const createFitAddon = deps.createFitAddon ?? (() => new FitAddon());
  const WebSocketImpl = deps.WebSocketImpl ?? WebSocket;
  const windowRef = deps.windowRef ?? window;
  const debugWindow = windowRef as Window & {
    __TERMbridgeExposeTerminal?: boolean;
    __TERMbridgeTerminal?: Terminal;
  };

  const terminal = createTerminal();
  const fitAddon = createFitAddon();
  const webLinksAddon = new WebLinksAddon();
  let webglAddon: WebglAddon | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let resizeRaf: number | null = null;
  let resizeRetryTimeout: number | null = null;
  let resizeRetryCount = 0;
  const resizeRetryLimit = 6;
  let resizeUsingTimeout = false;
  let socketReady = false;
  let lastSize: { cols: number; rows: number } | null = null;
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(webLinksAddon);
  terminal.open(container);

  if (debugWindow.__TERMbridgeExposeTerminal) {
    debugWindow.__TERMbridgeTerminal = terminal;
  }

  let socket: WebSocket | null = null;
  let connectionState: ConnectionState = "connecting";
  const connectionStateCallbacks = new Set<(state: ConnectionState) => void>();
  let reconnectAttempt = 0;
  let reconnectTimeout: number | null = null;
  let destroyed = false;
  const maxReconnectAttempts = 10;
  const baseReconnectDelayMs = 1000;
  const maxReconnectDelayMs = 30000;

  const setConnectionState = (state: ConnectionState) => {
    if (connectionState === state) {
      return;
    }
    connectionState = state;
    for (const callback of connectionStateCallbacks) {
      callback(state);
    }
  };

  const getReconnectDelay = () => {
    const delay = baseReconnectDelayMs * 2 ** reconnectAttempt;
    return Math.min(delay, maxReconnectDelayMs);
  };

  const sendMessage = (message: TerminalClientMessage) => {
    if (!socketReady || !socket) {
      return;
    }

    socket.send(JSON.stringify(message));
  };

  const connectSocket = () => {
    if (destroyed) {
      return;
    }

    socket = new WebSocketImpl(getWebSocketUrl(terminalId, csrfToken, windowRef));

    socket.addEventListener("open", () => {
      socketReady = true;
      reconnectAttempt = 0;
      lastSize = null;
      setConnectionState("connected");
      scheduleResize();
    });

    socket.addEventListener("message", (event) => {
      const message = parseServerMessage(event.data);

      if (!message) {
        return;
      }

      if (message.type === "output") {
        terminal.write(message.data);
      }
    });

    socket.addEventListener("close", () => {
      socketReady = false;

      if (destroyed) {
        setConnectionState("disconnected");
        return;
      }

      if (reconnectAttempt >= maxReconnectAttempts) {
        setConnectionState("disconnected");
        return;
      }

      setConnectionState("reconnecting");
      const delay = getReconnectDelay();
      reconnectAttempt += 1;
      reconnectTimeout = window.setTimeout(() => {
        reconnectTimeout = null;
        connectSocket();
      }, delay) as unknown as number;
    });

    socket.addEventListener("error", () => {
      // Error events precede close events; connection handling is done in the close handler
    });
  };

  connectSocket();

  const applyResize = () => {
    const dims = fitAddon.proposeDimensions();
    const containerWidth = container.clientWidth || terminal.element?.clientWidth || 0;
    const containerHeight = container.clientHeight || terminal.element?.clientHeight || 0;

    if (!dims || dims.cols < 1 || dims.rows < 1 || containerWidth < 1 || containerHeight < 1) {
      scheduleResizeRetry();
      return;
    }

    const scrollbarWidth = getScrollbarWidth(terminal);
    const charWidth = containerWidth / dims.cols;
    const scrollbarCols = Math.ceil(scrollbarWidth / charWidth);
    const cols = Math.max(1, dims.cols - scrollbarCols);
    const rows = dims.rows;

    if (lastSize && lastSize.cols === cols && lastSize.rows === rows) {
      return;
    }

    lastSize = { cols, rows };
    resizeRetryCount = 0;
    terminal.resize(cols, rows);
    terminal.scrollToBottom();
    sendMessage({ type: "resize", cols, rows });
  };

  const cancelScheduledResize = () => {
    if (resizeRetryTimeout !== null) {
      clearTimeout(resizeRetryTimeout);
      resizeRetryTimeout = null;
    }

    if (resizeRaf === null) {
      resizeUsingTimeout = false;
      return;
    }

    if (resizeUsingTimeout) {
      clearTimeout(resizeRaf);
    } else {
      windowRef.cancelAnimationFrame?.(resizeRaf);
    }

    resizeRaf = null;
    resizeUsingTimeout = false;
  };

  const scheduleResize = () => {
    cancelScheduledResize();

    const next = windowRef.requestAnimationFrame;
    if (typeof next === "function") {
      resizeUsingTimeout = false;
      resizeRaf = next(() => {
        resizeRaf = null;
        applyResize();
      });
      return;
    }

    resizeUsingTimeout = true;
    resizeRaf = window.setTimeout(() => {
      resizeRaf = null;
      resizeUsingTimeout = false;
      applyResize();
    }, 16) as unknown as number;
  };

  const scheduleResizeRetry = () => {
    if (resizeRetryCount >= resizeRetryLimit) {
      return;
    }

    resizeRetryCount += 1;
    resizeRetryTimeout = window.setTimeout(() => {
      resizeRetryTimeout = null;
      scheduleResize();
    }, 50) as unknown as number;
  };

  terminal.onData((data) => {
    sendMessage({ type: "input", data });
  });

  windowRef.addEventListener("resize", scheduleResize);

  const ResizeObserverImpl = windowRef.ResizeObserver;
  if (typeof ResizeObserverImpl === "function") {
    const observer = new ResizeObserverImpl(() => {
      scheduleResize();
    });
    resizeObserver = observer;
    observer.observe(container);
  }

  if (typeof windowRef.WebGLRenderingContext !== "undefined") {
    try {
      webglAddon = new WebglAddon();
      webglAddon.onContextLoss(() => {
        webglAddon?.dispose();
        webglAddon = null;
      });
      terminal.loadAddon(webglAddon);
    } catch {}
  }

  scheduleResize();
  const fontReady = windowRef.document?.fonts?.ready;
  if (fontReady) {
    void fontReady.then(() => scheduleResize()).catch(() => undefined);
  }

  const sendControl = (key: TerminalControlKey) => {
    sendMessage({ type: "control", key });
  };

  const sendInput = (data: string) => {
    if (!data) {
      return;
    }

    sendMessage({ type: "input", data });
  };

  const destroy = () => {
    destroyed = true;
    windowRef.removeEventListener("resize", scheduleResize);
    resizeObserver?.disconnect();
    resizeObserver = null;
    cancelScheduledResize();
    if (reconnectTimeout !== null) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    connectionStateCallbacks.clear();
    socket?.close();
    if (webglAddon) {
      try {
        webglAddon.dispose();
      } catch {}
      webglAddon = null;
    }
    terminal.dispose();
  };

  const getConnectionState = () => connectionState;

  const onConnectionStateChange = (callback: (state: ConnectionState) => void) => {
    connectionStateCallbacks.add(callback);
    return () => {
      connectionStateCallbacks.delete(callback);
    };
  };

  return { sendControl, sendInput, destroy, getConnectionState, onConnectionStateChange };
};
