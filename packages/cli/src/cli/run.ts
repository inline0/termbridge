import qrcode from "qrcode-terminal"
import type { Logger } from "../server/server.ts"
import { parseArgs } from "./args.ts"
import { helpText } from "./help.ts"
import { runInkCli } from "./ink.tsx"
import { startCommand } from "./start.ts"

/**
 * Process and output streams used by the CLI command runner.
 */
export type RunDeps = {
  stdout?: NodeJS.WritableStream
  stderr?: NodeJS.WritableStream
  process?: NodeJS.Process
}

const createLogger = (
  stdout: NodeJS.WritableStream,
  stderr: NodeJS.WritableStream
): Logger => ({
  info: (message) => stdout.write(`${message}\n`),
  warn: (message) => stderr.write(`${message}\n`),
  error: (message) => stderr.write(`${message}\n`),
})

const shouldUseInk = (stdout: NodeJS.WritableStream | undefined) =>
  Boolean(stdout && "isTTY" in stdout && stdout.isTTY)

/**
 * Dispatch parsed commands and report failures through the configured streams.
 * @param argv - Command-line arguments without the executable prefix.
 * @param deps - Service and runtime overrides.
 * @returns The command exit code.
 */
export const runCli = async (argv: string[], deps: RunDeps = {}) => {
  const stdout = deps.stdout ?? process.stdout
  const stderr = deps.stderr ?? process.stderr
  const processRef = deps.process ?? process

  try {
    const parsed = parseArgs(argv)

    if (parsed.command === "help") {
      stdout.write(helpText)
      return 0
    }

    if (shouldUseInk(stdout)) {
      return await runInkCli(parsed.options, {
        process: processRef,
      })
    }

    await startCommand(parsed.options, {
      process: processRef,
      logger: createLogger(stdout, stderr),
      qr: {
        generate: (text, options) => qrcode.generate(text, options),
      },
    })

    return 0
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error"
    stderr.write(`${message}\n`)
    return 1
  }
}
