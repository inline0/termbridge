import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import type {
  TerminalClientMessage,
  TerminalControlKey,
  TerminalServerMessage
} from "@termbridge/shared";

export type TerminalClient = {
  sendControl: (key: TerminalControlKey) => void;
  destroy: () => void;
};

export type TerminalClientDeps = {
  createTerminal?: () => Terminal;
  createFitAddon?: () => FitAddon;
  WebSocketImpl?: typeof WebSocket;
  windowRef?: Window;
};

export const getWebSocketUrl = (terminalId: string, windowRef: Window) => {
  const protocol = windowRef.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${windowRef.location.host}/ws/terminal/${terminalId}`;
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
  deps: TerminalClientDeps = {}
): TerminalClient => {
  const createTerminal = deps.createTerminal ?? (() => new Terminal());
  const createFitAddon = deps.createFitAddon ?? (() => new FitAddon());
  const WebSocketImpl = deps.WebSocketImpl ?? WebSocket;
  const windowRef = deps.windowRef ?? window;

  const terminal = createTerminal();
  const fitAddon = createFitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(container);

  const socket = new WebSocketImpl(getWebSocketUrl(terminalId, windowRef));

  const sendMessage = (message: TerminalClientMessage) => {
    socket.send(JSON.stringify(message));
  };

  const handleResize = () => {
    fitAddon.fit();
    const dims = fitAddon.proposeDimensions();

    if (!dims) {
      return;
    }

    sendMessage({ type: "resize", cols: dims.cols, rows: dims.rows });
  };

  terminal.onData((data) => {
    sendMessage({ type: "input", data });
  });

  socket.addEventListener("open", () => {
    handleResize();
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

  windowRef.addEventListener("resize", handleResize);

  const sendControl = (key: TerminalControlKey) => {
    sendMessage({ type: "control", key });
  };

  const destroy = () => {
    windowRef.removeEventListener("resize", handleResize);
    socket.close();
    terminal.dispose();
  };

  return { sendControl, destroy };
};
