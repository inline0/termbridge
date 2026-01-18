import { spawn as spawnCallback } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

export type TunnelProvider = {
  start: (localUrl: string) => Promise<{ publicUrl: string }>;
  stop: () => Promise<void>;
};

export type CloudflaredDeps = {
  spawn?: typeof spawnCallback;
};

export const parseCloudflaredUrl = (line: string) => {
  const match = line.match(/https:\/\/[^\s]+trycloudflare\.com/);
  return match?.[0] ?? null;
};

const readLines = (data: string, carry: string, onLine: (line: string) => void) => {
  const combined = carry + data;
  const lines = combined.split("\n");
  const remainder = lines.pop() as string;

  for (const line of lines) {
    onLine(line);
  }

  return remainder;
};

export const createCloudflaredProvider = (deps: CloudflaredDeps = {}): TunnelProvider => {
  const spawn = deps.spawn ?? spawnCallback;
  let child: ChildProcessWithoutNullStreams | null = null;

  const start = (localUrl: string) => {
    if (child) {
      return Promise.reject(new Error("cloudflared already running"));
    }

    child = spawn("cloudflared", ["tunnel", "--url", localUrl]);

    let stdoutCarry = "";
    let stderrCarry = "";

    return new Promise<{ publicUrl: string }>((resolve, reject) => {
      const handleLine = (line: string) => {
        const url = parseCloudflaredUrl(line);

        if (url) {
          resolve({ publicUrl: url });
        }
      };

      const handleOutput = (data: Buffer, isStdout: boolean) => {
        if (isStdout) {
          stdoutCarry = readLines(data.toString(), stdoutCarry, handleLine);
        } else {
          stderrCarry = readLines(data.toString(), stderrCarry, handleLine);
        }
      };

      child?.stdout.on("data", (data) => handleOutput(data, true));
      child?.stderr.on("data", (data) => handleOutput(data, false));
      child?.once("error", (error) => reject(error));
      child?.once("exit", (code) => {
        reject(new Error(`cloudflared exited (${code ?? "unknown"})`));
      });
    });
  };

  const stop = async () => {
    if (!child) {
      return;
    }

    child.kill("SIGTERM");
    child = null;
  };

  return { start, stop };
};
