import { spawn as spawnCallback } from "node:child_process"
import type { ChildProcessWithoutNullStreams } from "node:child_process"

/**
 * Named-tunnel credentials, public URL, and output logger.
 */
export type TunnelStartOptions = {
  token?: string
  publicUrl?: string
  log?: (line: string, stream: "stdout" | "stderr") => void
}

/**
 * Lifecycle contract for exposing a local server through a tunnel.
 */
export type TunnelProvider = {
  start: (
    localUrl: string,
    options?: TunnelStartOptions
  ) => Promise<{ publicUrl: string }>
  stop: () => Promise<void>
}

/**
 * Process-spawning dependency for the cloudflared adapter.
 */
export type CloudflaredDeps = {
  spawn?: typeof spawnCallback
}

/**
 * Extract a temporary Cloudflare tunnel URL from process output.
 * @param line - Output line emitted by cloudflared.
 * @returns The extracted public URL, or null when absent.
 */
export const parseCloudflaredUrl = (line: string) => {
  const match = line.match(/https:\/\/[^\s]+trycloudflare\.com/)
  return match?.[0] ?? null
}

const readLines = (
  data: string,
  carry: string,
  onLine: (line: string) => void
) => {
  const combined = carry + data
  const lines = combined.split("\n")
  const remainder = lines.pop() as string

  for (const line of lines) {
    onLine(line)
  }

  return remainder
}

const normalizeLine = (line: string) => line.trim()

/**
 * Manage a cloudflared process and resolve its public tunnel URL.
 * @param deps - Service and runtime overrides.
 * @returns Tunnel startup and shutdown operations.
 */
export const createCloudflaredProvider = (
  deps: CloudflaredDeps = {}
): TunnelProvider => {
  const spawn = deps.spawn ?? spawnCallback
  let child: ChildProcessWithoutNullStreams | null = null

  const start = (localUrl: string, options: TunnelStartOptions = {}) => {
    if (child) {
      return Promise.reject(new Error("cloudflared already running"))
    }

    const token = options.token?.trim()
    const publicUrl = options.publicUrl?.trim()

    if (token && !publicUrl) {
      return Promise.reject(
        new Error("tunnel public URL required when using tunnel token")
      )
    }

    const args = token
      ? ["tunnel", "run", "--token", token]
      : ["tunnel", "--url", localUrl]
    child = spawn("cloudflared", args)

    let stdoutCarry = ""
    let stderrCarry = ""
    const errorLines: string[] = []

    return new Promise<{ publicUrl: string }>((resolve, reject) => {
      let resolved = false
      let resolveTimer: NodeJS.Timeout | null = null

      const resolveOnce = (url: string) => {
        if (resolved) {
          return
        }
        resolved = true
        if (resolveTimer) {
          clearTimeout(resolveTimer)
          resolveTimer = null
        }
        resolve({ publicUrl: url })
      }

      const handleLine = (line: string) => {
        const cleaned = normalizeLine(line)
        if (!cleaned) {
          return
        }

        options.log?.(cleaned, "stdout")
        const url = parseCloudflaredUrl(cleaned)

        if (url) {
          resolveOnce(url)
        }
      }

      const handleOutput = (data: Buffer, isStdout: boolean) => {
        if (isStdout) {
          stdoutCarry = readLines(data.toString(), stdoutCarry, handleLine)
        } else {
          stderrCarry = readLines(data.toString(), stderrCarry, (line) => {
            const cleaned = normalizeLine(line)
            if (!cleaned) {
              return
            }
            options.log?.(cleaned, "stderr")
            errorLines.push(cleaned)
            if (errorLines.length > 6) {
              errorLines.shift()
            }

            const url = parseCloudflaredUrl(cleaned)
            if (url) {
              resolveOnce(url)
            }
          })
        }
      }

      child?.stdout.on("data", (data) => handleOutput(data, true))
      child?.stderr.on("data", (data) => handleOutput(data, false))
      child?.once("error", (error) => reject(error))
      child?.once("exit", (code) => {
        if (resolved) {
          return
        }

        const suffix =
          errorLines.length > 0 ? `: ${errorLines.join(" | ")}` : ""
        reject(new Error(`cloudflared exited (${code ?? "unknown"})${suffix}`))
      })

      if (token && publicUrl) {
        resolveTimer = setTimeout(() => resolveOnce(publicUrl), 1200)
      }
    })
  }

  const stop = async () => {
    if (!child) {
      return
    }

    child.kill("SIGTERM")
    child = null
  }

  return { start, stop }
}
