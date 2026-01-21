import { describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import type { ChildProcessWithoutNullStreams, spawn as spawnCallback } from "node:child_process";
import { createCloudflaredProvider, parseCloudflaredUrl } from "./index";

class FakeChild extends EventEmitter {
  stdout = new EventEmitter();
  stderr = new EventEmitter();
  kill = vi.fn();
}

const createSpawn = (child: FakeChild) =>
  vi.fn((..._args: unknown[]) => child as unknown as ChildProcessWithoutNullStreams) as unknown as
    typeof spawnCallback;

describe("parseCloudflaredUrl", () => {
  it("extracts trycloudflare URLs", () => {
    expect(parseCloudflaredUrl("url https://example.trycloudflare.com"))
      .toBe("https://example.trycloudflare.com");
    expect(parseCloudflaredUrl("no match")).toBeNull();
  });
});

describe("createCloudflaredProvider", () => {
  it("resolves when the URL appears", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");

    child.stdout.emit("data", Buffer.from("starting\n"));
    child.stderr.emit("data", Buffer.from("https://tunnel.trycloudflare.com\n"));

    await expect(startPromise).resolves.toEqual({
      publicUrl: "https://tunnel.trycloudflare.com"
    });

    await provider.stop();
    expect(child.kill).toHaveBeenCalled();
  });

  it("rejects when cloudflared exits early", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");
    child.emit("exit", 1);

    await expect(startPromise).rejects.toThrow("cloudflared exited");
  });

  it("rejects when cloudflared errors", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");
    child.emit("error", new Error("spawn failed"));

    await expect(startPromise).rejects.toThrow("spawn failed");
  });

  it("reports unknown exit codes", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");
    child.emit("exit");

    await expect(startPromise).rejects.toThrow("unknown");
  });

  it("rejects when already running", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");
    child.stdout.emit("data", Buffer.from("https://tunnel.trycloudflare.com\n"));
    await startPromise;

    await expect(provider.start("http://127.0.0.1:3000")).rejects.toThrow(
      "cloudflared already running"
    );
  });

  it("ignores extra url lines and exit after resolving", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");

    child.stdout.emit(
      "data",
      Buffer.from("https://tunnel.trycloudflare.com\nhttps://tunnel.trycloudflare.com\n")
    );
    child.emit("exit", 1);

    await expect(startPromise).resolves.toEqual({
      publicUrl: "https://tunnel.trycloudflare.com"
    });
  });

  it("skips empty lines and trims error history", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000");

    child.stdout.emit("data", Buffer.from("\n"));
    child.stderr.emit("data", Buffer.from("\n"));
    child.stderr.emit(
      "data",
      Buffer.from("err1\nerr2\nerr3\nerr4\nerr5\nerr6\nerr7\n")
    );
    child.emit("exit", 1);

    const error = await startPromise.catch((cause) => cause as Error);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("err2");
    expect(error.message).toContain("err7");
    expect(error.message).not.toContain("err1");
  });

  it("resolves with provided public URL when using token", async () => {
    vi.useFakeTimers();
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    const startPromise = provider.start("http://127.0.0.1:3000", {
      token: "token",
      publicUrl: "https://example.com"
    });

    await vi.runAllTimersAsync();

    await expect(startPromise).resolves.toEqual({
      publicUrl: "https://example.com"
    });

    vi.useRealTimers();
  });

  it("rejects when token is missing a public URL", async () => {
    const child = new FakeChild();
    const spawn = createSpawn(child);
    const provider = createCloudflaredProvider({ spawn });

    await expect(
      provider.start("http://127.0.0.1:3000", { token: "token" })
    ).rejects.toThrow("tunnel public URL required");
  });

  it("ignores stop when not started", async () => {
    const provider = createCloudflaredProvider();

    await provider.stop();
  });
});
