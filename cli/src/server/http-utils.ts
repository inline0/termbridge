import type { IncomingMessage, ServerResponse } from "node:http";

export const MAX_HTTP_BODY_SIZE = 64 * 1024;

export const jsonResponse = (response: ServerResponse, status: number, payload: unknown) => {
  const body = JSON.stringify(payload);
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Content-Length", Buffer.byteLength(body));
  response.end(body);
};

export const readJsonBody = async (
  request: IncomingMessage
): Promise<unknown | null | "too_large"> => {
  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  for await (const chunk of request) {
    totalSize += chunk.length;
    if (totalSize > MAX_HTTP_BODY_SIZE) {
      return "too_large";
    }
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8").trim();

  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
};

export const getIp = (request: IncomingMessage) => String(request.socket.remoteAddress);

export const isAllowedOrigin = (
  origin: string | undefined,
  host: string | undefined,
  forwardedHost?: string | null
) => {
  if (!origin || (!host && !forwardedHost)) {
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) {
      return true;
    }
    if (forwardedHost && originHost === forwardedHost) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const resolveForwardedHost = (header: string | string[] | undefined) =>
  Array.isArray(header) ? header[0] : header;
