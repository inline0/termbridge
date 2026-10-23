/**
 * Parse a finite numeric option or report a missing or invalid value.
 * @param value - Raw option value to parse or normalize.
 * @returns The parsed number or null.
 */
export const parseNumber = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

/**
 * Parse an optional numeric option without a null result.
 * @param value - Raw option value to parse or normalize.
 * @returns The parsed number or undefined.
 */
export const parseOptionalNumber = (
  value: string | undefined
): number | undefined => {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Recognize enabled values in a boolean environment option.
 * @param value - Raw option value to parse or normalize.
 * @returns Whether the option enables the feature.
 */
export const parseBoolean = (value: string | undefined): boolean => {
  if (!value) {
    return false
  }
  const normalized = value.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes"
}

/**
 * Split a comma- or whitespace-separated option into nonempty entries.
 * @param value - Raw option value to parse or normalize.
 * @returns The nonempty list entries.
 */
export const parseList = (value: string | undefined): string[] => {
  if (!value) {
    return []
  }
  return value
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

/**
 * Validate a positive integer session count, defaulting to one.
 * @param value - Raw option value to parse or normalize.
 * @returns The requested number of sessions.
 */
export const parseSessionCount = (value: string | undefined): number => {
  if (!value) {
    return 1
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}
