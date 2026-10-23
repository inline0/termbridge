export const TERMINAL_CONTROL_KEYS = [
  "ctrl_c",
  "esc",
  "tab",
  "up",
  "down",
  "left",
  "right",
] as const

/**
 * Supported special keys sent to a terminal session.
 */
export type TerminalControlKey = (typeof TERMINAL_CONTROL_KEYS)[number]

/**
 * Client request to write text into a terminal.
 */
export type TerminalInputMessage = {
  type: "input"
  data: string
}

/**
 * Client request to change terminal columns and rows.
 */
export type TerminalResizeMessage = {
  type: "resize"
  cols: number
  rows: number
}

/**
 * Client request to send a special terminal key.
 */
export type TerminalControlMessage = {
  type: "control"
  key: TerminalControlKey
}

/**
 * Units used for scrolling terminal history.
 */
export type TerminalScrollMode = "lines" | "pages"

/**
 * Client request to scroll terminal history by lines or pages.
 */
export type TerminalScrollMessage = {
  type: "scroll"
  mode: TerminalScrollMode
  amount: number
}

/**
 * Validated WebSocket messages accepted from terminal clients.
 */
export type TerminalClientMessage =
  | TerminalInputMessage
  | TerminalResizeMessage
  | TerminalControlMessage
  | TerminalScrollMessage

/**
 * Terminal output streamed from the server to a browser.
 */
export type TerminalOutputMessage = {
  type: "output"
  data: string
}

export const TERMINAL_STATUS_STATES = [
  "connected",
  "disconnected",
  "error",
] as const

/**
 * Connection state and optional status detail sent to a browser.
 */
export type TerminalStatusMessage = {
  type: "status"
  state: (typeof TERMINAL_STATUS_STATES)[number]
  message?: string
}

/**
 * WebSocket messages emitted by the terminal server.
 */
export type TerminalServerMessage =
  | TerminalOutputMessage
  | TerminalStatusMessage

/**
 * Public metadata used to display a terminal in the selector.
 */
export type TerminalListItem = {
  id: string
  label: string
  status: "running" | "closed"
  createdAt: string
  source: "tmux" | "mock" | "sandbox"
}

/**
 * Response payload listing the available terminal sessions.
 */
export type TerminalListResponse = {
  terminals: TerminalListItem[]
}

/**
 * Optional display name for a newly created terminal.
 */
export type TerminalCreateRequest = {
  name?: string
}
