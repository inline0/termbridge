import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createStaticHandler } from "./static";

const createResponse = () => {
  const headers = new Map<string, string>();
  let body = "";
  let statusCode = 0;

  const response = {
    setHeader: (key: string, value: string) => headers.set(key, value),
    end: (payload?: string | Buffer) => {
      body = payload ? payload.toString() : "";
    },
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    }
  } as unknown as ServerResponse;

  return {
    response,
    getBody: () => body,
    getStatus: () => statusCode,
    getHeaders: () => headers
  };
};

const createRequest = (path: string): IncomingMessage =>
  ({
    url: path,
    headers: {
      host: "localhost"
    }
  }) as IncomingMessage;

describe("createStaticHandler", () => {
  it("serves files under the base path", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");
    await writeFile(join(dir, "app.js"), "console.log('ok');");

    const handler = createStaticHandler(dir, "/app");
    const resIndex = createResponse();
    const handledIndex = await handler(createRequest("/app/"), resIndex.response);

    expect(handledIndex).toBe(true);
    expect(resIndex.getStatus()).toBe(200);
    expect(resIndex.getBody()).toBe("index");

    const resFile = createResponse();
    await handler(createRequest("/app/app.js"), resFile.response);

    expect(resFile.getStatus()).toBe(200);
    expect(resFile.getHeaders().get("Content-Type")).toBe("text/javascript");
  });

  it("serves unknown extensions as text", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");
    await writeFile(join(dir, "note.txt"), "note");

    const handler = createStaticHandler(dir, "/app");
    const res = createResponse();
    await handler(createRequest("/app/note.txt"), res.response);

    expect(res.getHeaders().get("Content-Type")).toBe("text/plain");
  });

  it("falls back to index for missing files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "fallback");

    const handler = createStaticHandler(dir, "/app");
    const res = createResponse();
    await handler(createRequest("/app/missing"), res.response);

    expect(res.getBody()).toBe("fallback");
  });

  it("blocks path traversal", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");

    const handler = createStaticHandler(dir, "/app");
    const res = createResponse();
    await handler(createRequest("/app/../secret"), res.response);

    expect(res.getStatus()).toBe(403);
  });

  it("returns false when base path does not match", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");

    const handler = createStaticHandler(dir, "/app");
    const res = createResponse();
    const handled = await handler(createRequest("/other"), res.response);

    expect(handled).toBe(false);
  });

  it("handles base paths with a trailing slash", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");

    const handler = createStaticHandler(dir, "/app/");
    const res = createResponse();
    await handler(createRequest("/app"), res.response);

    expect(res.getStatus()).toBe(200);
  });

  it("defaults to the root path when url is missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");

    const handler = createStaticHandler(dir, "/");
    const res = createResponse();
    const req = { url: undefined, headers: { host: "localhost" } } as IncomingMessage;

    await handler(req, res.response);

    expect(res.getStatus()).toBe(200);
  });

  it("defaults to localhost when the host header is missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    await writeFile(join(dir, "index.html"), "index");

    const handler = createStaticHandler(dir, "/app");
    const res = createResponse();
    const req = { url: "/app/", headers: {} } as IncomingMessage;

    await handler(req, res.response);

    expect(res.getStatus()).toBe(200);
  });

  it("returns 404 when fallback is missing", async () => {
    const dir = await mkdtemp(join(tmpdir(), "termbridge-"));
    const handler = createStaticHandler(dir, "/app");
    const res = createResponse();
    await handler(createRequest("/app/"), res.response);

    expect(res.getStatus()).toBe(404);
  });
});
