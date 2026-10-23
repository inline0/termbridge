/**
 * Normalize a public share URL and require HTTP or HTTPS.
 * @param value - Raw option value to parse or normalize.
 * @returns A normalized HTTP or HTTPS URL.
 */
export const normalizePublicUrl = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error("missing public url")
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error("invalid public url")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid public url")
  }

  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
}

/**
 * Add a single-use redemption token to a public server URL.
 * @param publicUrl - Public base URL of the shared server.
 * @param token - Single-use share token.
 * @returns A URL that redeems the supplied token.
 */
export const buildShareUrl = (publicUrl: string, token: string): string => {
  let parsed: URL

  try {
    parsed = new URL(publicUrl)
  } catch {
    throw new Error("invalid public url")
  }

  const basePath = parsed.pathname.endsWith("/")
    ? parsed.pathname
    : `${parsed.pathname}/`
  parsed.pathname = `${basePath}__tb/s/${token}`
  parsed.hash = ""
  return parsed.toString()
}

/**
 * Derive a repository directory name from its clone URL.
 * @param repoUrl - Repository clone URL.
 * @returns The repository name without a trailing .git suffix.
 */
export const deriveRepoPath = (repoUrl: string): string => {
  const trimmed = repoUrl.replace(/\/$/, "")
  const last = trimmed.split("/").pop()
  if (!last) {
    return "repo"
  }
  return last.endsWith(".git") ? last.slice(0, -4) : last
}
