import { request as httpRequest } from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"
import { request as httpsRequest } from "node:https"

/**
 * Local port or development URL used for authenticated proxy requests.
 */
export type ProxyConfig = {
  proxyPort?: number
  devProxyUrl?: string
  devProxyHeaders?: Record<string, string>
}

/**
 * Build an upstream HTTP URL from the configured proxy target.
 * @param config - Proxy destination and header configuration.
 * @param targetPath - Upstream request pathname.
 * @param search - Query string including its leading question mark.
 * @returns The upstream URL, or null when no target is configured.
 */
export const resolveProxyUrl = (
  config: ProxyConfig,
  targetPath: string,
  search: string
): URL | null => {
  if (typeof config.proxyPort === "number") {
    return new URL(`http://localhost:${config.proxyPort}${targetPath}${search}`)
  }
  if (config.devProxyUrl) {
    try {
      return new URL(`${targetPath}${search}`, config.devProxyUrl)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Stream a request and response through the configured HTTP proxy.
 * @param config - Proxy destination and header configuration.
 * @param request - Incoming HTTP request.
 * @param response - HTTP response to populate.
 * @param targetPath - Upstream request pathname.
 * @param search - Query string including its leading question mark.
 */
export const proxyRequest = (
  config: ProxyConfig,
  request: IncomingMessage,
  response: ServerResponse,
  targetPath: string,
  search: string
) => {
  const targetUrl = resolveProxyUrl(config, targetPath, search)
  if (!targetUrl) {
    response.statusCode = 502
    response.end("proxy error")
    return
  }

  const proxyHeaders = { ...request.headers, ...(config.devProxyHeaders ?? {}) }
  delete proxyHeaders.cookie
  delete proxyHeaders.host
  proxyHeaders.host = targetUrl.host

  const requestImpl =
    targetUrl.protocol === "https:" ? httpsRequest : httpRequest
  const proxyReq = requestImpl(
    targetUrl,
    { method: request.method, headers: proxyHeaders },
    (proxyRes) => {
      response.writeHead(proxyRes.statusCode as number, proxyRes.headers)
      proxyRes.pipe(response)
    }
  )
  proxyReq.on("error", () => {
    response.statusCode = 502
    response.end("proxy error")
  })
  request.pipe(proxyReq)
}

/**
 * Resolve the configured upstream base URL for WebSocket upgrades.
 * @param config - Proxy destination and header configuration.
 * @returns The upstream URL, or null for an invalid target.
 */
export const getProxyWebSocketUrl = (config: ProxyConfig): URL | null => {
  try {
    if (typeof config.proxyPort === "number") {
      return new URL(`http://localhost:${config.proxyPort}`)
    }
    if (config.devProxyUrl) {
      return new URL(config.devProxyUrl)
    }
  } catch {
    return null
  }
  return null
}
