import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";

const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const getContentType = (filePath: string) => contentTypes[extname(filePath)] ?? "text/plain";

export type StaticHandler = (request: IncomingMessage, response: ServerResponse) => Promise<boolean>;

export const createStaticHandler = (uiDistPath: string, basePath: string): StaticHandler => {
  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

  return async (request, response) => {
    const rawPath = request.url ?? "/";
    const url = new URL(rawPath, `http://${request.headers.host ?? "localhost"}`);

    if (rawPath.includes("..")) {
      response.statusCode = 403;
      response.end("forbidden");
      return true;
    }

    if (!url.pathname.startsWith(normalizedBase)) {
      return false;
    }

    const relative = url.pathname.slice(normalizedBase.length) || "/";
    const filePath = relative === "/" ? "/index.html" : relative;
    const absolutePath = resolve(uiDistPath, `.${filePath}`);

    try {
      const payload = await readFile(absolutePath);
      response.statusCode = 200;
      response.setHeader("Content-Type", getContentType(absolutePath));
      response.end(payload);
      return true;
    } catch {
      try {
        const fallback = await readFile(resolve(uiDistPath, "index.html"));
        response.statusCode = 200;
        response.setHeader("Content-Type", "text/html");
        response.end(fallback);
        return true;
      } catch {
        response.statusCode = 404;
        response.end("not found");
        return true;
      }
    }
  };
};
