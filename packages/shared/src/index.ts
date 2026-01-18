export const TERMINAL_CONTROL_KEYS = [
  "ctrl_c",
  "esc",
  "tab",
  "up",
  "down",
  "left",
  "right"
] as const;

export type TerminalControlKey = (typeof TERMINAL_CONTROL_KEYS)[number];

export type TerminalInputMessage = {
  type: "input";
  data: string;
};

export type TerminalResizeMessage = {
  type: "resize";
  cols: number;
  rows: number;
};

export type TerminalControlMessage = {
  type: "control";
  key: TerminalControlKey;
};

export type TerminalClientMessage =
  | TerminalInputMessage
  | TerminalResizeMessage
  | TerminalControlMessage;

export type TerminalOutputMessage = {
  type: "output";
  data: string;
};

export const TERMINAL_STATUS_STATES = ["connected", "disconnected", "error"] as const;

export type TerminalStatusMessage = {
  type: "status";
  state: (typeof TERMINAL_STATUS_STATES)[number];
  message?: string;
};

export type TerminalServerMessage =
  | TerminalOutputMessage
  | TerminalStatusMessage;

export type TerminalListItem = {
  id: string;
  label: string;
  status: "running" | "closed";
  createdAt: string;
  source: "tmux" | "mock";
};

export type TerminalListResponse = {
  terminals: TerminalListItem[];
};

export type TerminalCreateRequest = {
  name?: string;
};
