import type { IncomingMessage, ServerResponse } from "node:http"

export const MAX_HTTP_BODY_SIZE = 64 * 1024

/**
 * Write a JSON response with its status and content headers.
 * @param response - HTTP response to populate.
 * @param status - HTTP response status code.
 * @param payload - Incoming data to validate or serialize.
 */
export const jsonResponse = (
  response: ServerResponse,
  status: number,
  payload: unknown
) => {
  const body = JSON.stringify(payload)
  response.statusCode = status
  response.setHeader("Content-Type", "application/json")
  response.setHeader("Content-Length", Buffer.byteLength(body))
  response.end(body)
}

/**
 * Read a bounded JSON request body without accepting oversized payloads.
 * @param request - Incoming HTTP request.
 * @returns Parsed JSON, null for invalid input, or "too_large".
 */
export const readJsonBody = async (
  request: IncomingMessage
): Promise<unknown> => {
  const chunks: Uint8Array[] = []
  let totalSize = 0

  for await (const chunk of request) {
    totalSize += chunk.length
    if (totalSize > MAX_HTTP_BODY_SIZE) {
      return "too_large"
    }
    chunks.push(chunk)
  }

  const body = Buffer.concat(chunks).toString("utf8").trim()

  if (!body) {
    return null
  }

  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}

/**
 * Read the remote peer address without trusting forwarded IP headers.
 * @param request - Incoming HTTP request.
 * @returns The remote socket address as a string.
 */
export const getIp = (request: IncomingMessage) =>
  String(request.socket.remoteAddress)

/**
 * Check whether a WebSocket origin matches a direct or forwarded host.
 * @param origin - Origin header supplied by the browser.
 * @param host - Direct host header of the request.
 * @param forwardedHost - Optional host forwarded by the trusted tunnel.
 * @returns Whether the origin is accepted for this request.
 */
export const isAllowedOrigin = (
  origin: string | undefined,
  host: string | undefined,
  forwardedHost?: string | null
) => {
  if (!origin || (!host && !forwardedHost)) {
    return true
  }

  try {
    const originHost = new URL(origin).host
    if (host && originHost === host) {
      return true
    }
    if (forwardedHost && originHost === forwardedHost) {
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Select the first value of a possibly repeated forwarded-host header.
 * @param header - Single or repeated forwarded-host header.
 * @returns The first forwarded host, when provided.
 */
export const resolveForwardedHost = (header: string | string[] | undefined) =>
  Array.isArray(header) ? header[0] : header
