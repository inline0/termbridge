import { statSync } from "node:fs"
import { resolve } from "node:path"

/**
 * Expand a leading tilde using the provided home directory.
 * @param value - Raw option value to parse or normalize.
 * @param home - Home directory used for tilde expansion.
 * @returns The path with a leading home shortcut expanded.
 */
export const expandHome = (value: string, home: string): string => {
  if (value === "~") {
    return home
  }
  if (value.startsWith("~/")) {
    return `${home}/${value.slice(2)}`
  }
  return value
}

/**
 * Resolve a path after expanding its home-directory shortcut.
 * @param value - Raw option value to parse or normalize.
 * @param home - Home directory used for tilde expansion.
 * @returns The absolute filesystem path.
 */
export const resolvePath = (value: string, home: string): string =>
  resolve(expandHome(value, home))

/**
 * Inspect a filesystem path without throwing for inaccessible entries.
 * @param path - Filesystem path to inspect.
 * @returns File metadata or null when the path cannot be inspected.
 */
export const safeStat = (path: string): ReturnType<typeof statSync> | null => {
  try {
    return statSync(path)
  } catch {
    return null
  }
}
