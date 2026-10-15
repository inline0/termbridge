import assert from "node:assert/strict";
import {
  spawn,
  execFileSync,
  type ChildProcessWithoutNullStreams,
} from "node:child_process";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const bin = resolve("cli/dist/bin.js");
const tmux = execFileSync("which", ["tmux"], { encoding: "utf8" }).trim();
const node = process.execPath;
const freePort = () =>
  new Promise<number>((resolvePort, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert(address && typeof address === "object");
      server.close(() => resolvePort(address.port));
    });
  });

describe("CLI startup without external services", () => {
  let directory: string;
  let child: ChildProcessWithoutNullStreams | undefined;
  let env: NodeJS.ProcessEnv;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "termbridge-startup-"));
    env = {
      ...process.env,
      PATH: directory,
      NODE_ENV: "production",
      SHELL: "/bin/sh",
      TMUX_TMPDIR: directory,
    };
    delete env.TMUX;
    for (const key of Object.keys(env)) {
      if (key.startsWith("TERMBRIDGE_")) delete env[key];
    }
  });

  afterEach(async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      child.kill("SIGKILL");
      await new Promise<void>((resolveExit) =>
        child?.once("close", () => resolveExit()),
      );
    }
    // Only this test's isolated tmux server is addressed.
    try {
      execFileSync(tmux, ["kill-server"], { env, stdio: "ignore" });
    } catch {}
    await rm(directory, { recursive: true, force: true });
    child = undefined;
  });

  const start = (args: string[]) => {
    child = spawn(node, [bin, ...args], {
      cwd: directory,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const output = { stdout: "", stderr: "" };
    child.stdout.on("data", (data) => {
      output.stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      output.stderr += data.toString();
    });
    const closed = new Promise<number | null>((resolveExit, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`CLI did not exit: ${output.stderr}`)),
        10000,
      );
      child?.once("close", (code) => {
        clearTimeout(timeout);
        resolveExit(code);
      });
      child?.once("error", reject);
    });
    return { output, closed };
  };

  it("exits and releases its port when tmux is missing", async () => {
    const port = await freePort();
    const { output, closed } = start([
      "--no-tunnel",
      "--public-url",
      `http://127.0.0.1:${port}`,
      "--port",
      String(port),
      "--no-qr",
    ]);
    expect(await closed).toBe(1);
    expect(output.stderr).toContain("spawn tmux ENOENT");
    const listener = createServer();
    await new Promise<void>((resolveListen, reject) => {
      listener.on("error", reject);
      listener.listen(port, "127.0.0.1", resolveListen);
    });
    await new Promise<void>((resolveClose) =>
      listener.close(() => resolveClose()),
    );
  });

  it("closes tmux sessions when the tunnel cannot start", async () => {
    await symlink(tmux, join(directory, "tmux"));
    const { output, closed } = start([
      "--session",
      "startup-failure",
      "--kill-on-exit",
      "--no-qr",
    ]);
    expect(await closed).toBe(1);
    expect(output.stderr).toContain("spawn cloudflared ENOENT");
    expect(() =>
      execFileSync(tmux, ["has-session", "-t", "startup-failure"], {
        env,
        stdio: "ignore",
      }),
    ).toThrow();
  });

  it.each([
    { flags: ["--no-tunnel"] },
    { flags: ["--tunnel", "none"] },
  ])("honors explicit tunnel flags $flags over the environment", async ({
    flags,
  }) => {
    await symlink(tmux, join(directory, "tmux"));
    env.TERMBRIDGE_TUNNEL = "cloudflare";
    const port = await freePort();
    const { output, closed } = start([
      ...flags,
      "--public-url",
      `http://127.0.0.1:${port}`,
      "--port",
      String(port),
      "--session",
      "startup-success",
      "--kill-on-exit",
      "--no-qr",
    ]);
    const ready = async () => {
      for (let attempt = 0; attempt < 100; attempt++) {
        try {
          if (!output.stdout.includes("Local server:"))
            throw new Error("Still starting");
          const health = await fetch(`http://127.0.0.1:${port}/__tb/healthz`);
          if (health.ok) return;
        } catch {}
        await new Promise((resolveWait) => setTimeout(resolveWait, 50));
      }
      throw new Error("CLI did not become ready");
    };
    await ready();
    child?.kill("SIGTERM");
    expect(await closed).toBe(0);
    expect(() =>
      execFileSync(tmux, ["has-session", "-t", "startup-success"], {
        env,
        stdio: "ignore",
      }),
    ).toThrow();
  });

  it.each([
    { flags: [] },
    { flags: ["--sandbox-direct"] },
  ])("requires a repo before starting Daytona $flags", async ({ flags }) => {
    const { output, closed } = start([
      "--backend",
      "sandbox-daytona",
      ...flags,
      "--no-qr",
    ]);
    expect(await closed).toBe(1);
    expect(output.stderr).toContain("missing sandbox repo");
  });
});
