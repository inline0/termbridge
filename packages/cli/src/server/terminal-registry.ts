import { randomBytes } from "node:crypto"
import type { TerminalListItem } from "@termbridge/shared"

/**
 * Public terminal metadata paired with its backend session name.
 */
export type TerminalRecord = TerminalListItem & {
  sessionName: string
}

/**
 * In-memory lookup and lifecycle operations for terminal records.
 */
export type TerminalRegistry = {
  add: (
    sessionName: string,
    label: string,
    source: TerminalListItem["source"]
  ) => TerminalRecord
  list: () => TerminalListItem[]
  get: (id: string) => TerminalRecord | null
  remove: (id: string) => void
  getSessionNames: () => string[]
}

const createTerminalId = () => randomBytes(8).toString("hex")

/**
 * Create a registry mapping public terminal IDs to backend sessions.
 * @returns A new empty terminal registry.
 */
export const createTerminalRegistry = (): TerminalRegistry => {
  const terminals = new Map<string, TerminalRecord>()

  const add = (
    sessionName: string,
    label: string,
    source: TerminalListItem["source"]
  ) => {
    const id = createTerminalId()
    const record: TerminalRecord = {
      id,
      label,
      status: "running",
      createdAt: new Date().toISOString(),
      source,
      sessionName,
    }

    terminals.set(id, record)
    return record
  }

  const list = () =>
    Array.from(terminals.values()).map(
      ({ sessionName: _sessionName, ...rest }) => rest
    )

  const get = (id: string) => terminals.get(id) ?? null

  const remove = (id: string) => {
    terminals.delete(id)
  }

  const getSessionNames = () =>
    Array.from(terminals.values()).map((record) => record.sessionName)

  return { add, list, get, remove, getSessionNames }
}
