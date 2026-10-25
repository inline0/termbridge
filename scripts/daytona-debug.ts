import { resolve } from "node:path"
import * as Flag from "effect/cli/Flag"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { fail, main, script, type ScriptInput } from "./lib/cli.ts"
import * as Command from "./lib/command.ts"
import { root } from "./lib/paths.ts"

/**
 * Parse the test application simple key=value environment.
 *
 * @param text - Environment-file contents.
 * @returns A map of trimmed environment keys and values.
 */
export const parseEnvFile = (text: string) =>
  Object.fromEntries(
    text.split(/\r?\n/).flatMap((line) => {
      const trimmed = line.trim()
      const index = trimmed.indexOf("=")
      return trimmed && !trimmed.startsWith("#") && index > 0
        ? [[trimmed.slice(0, index).trim(), trimmed.slice(index + 1).trim()]]
        : []
    })
  )
/** Flags shared by sandbox debug modes. */
export interface DebugInput extends ScriptInput {
  readonly direct: boolean
  readonly agent: string
  readonly agents: string
  readonly previewPort: string
}
/**
 * Start one scoped sandbox debug session.
 *
 * @param input - Debug flags and standard CLI options.
 * @param directory - Source checkout to build.
 * @returns An effect joining the CLI without logging authentication values.
 */
export const debug = (input: DebugInput, directory = root) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const app = resolve(directory, "../termbridge-test-app")
    if (!input.dryRun && !(yield* fs.exists(app)))
      return yield* fail(`Missing test app directory at ${app}`)
    yield* Command.run({
      command: "pnpm",
      args: ["run", "build"],
      cwd: directory,
      inherit: true,
    })
    const envPath = resolve(app, ".env")
    const loaded =
      !input.dryRun && (yield* fs.exists(envPath))
        ? parseEnvFile(yield* fs.readFileString(envPath, "utf-8"))
        : {}
    const env: Record<string, string> = {
      ...loaded,
      NODE_ENV: "production",
      TERMBRIDGE_BACKEND: "sandbox-daytona",
      TERMBRIDGE_SANDBOX_PREVIEW_PORT:
        input.previewPort || loaded.TERMBRIDGE_SANDBOX_PREVIEW_PORT || "5173",
      TERMBRIDGE_SANDBOX_DELETE_ON_EXIT: "true",
      TERMBRIDGE_SANDBOX_NAME: `termbridge-debug-${Date.now()}`,
      TERMBRIDGE_SANDBOX_AGENTS:
        input.agent ||
        input.agents ||
        loaded.TERMBRIDGE_SANDBOX_AGENTS ||
        process.env.TERMBRIDGE_SANDBOX_AGENTS ||
        "claude-code,codex,opencode",
      ...(input.direct ? { TERMBRIDGE_SANDBOX_DIRECT: "true" } : {}),
    }
    yield* Console.log(
      input.json
        ? JSON.stringify({
            sandbox: env.TERMBRIDGE_SANDBOX_NAME,
            direct: input.direct,
            dryRun: input.dryRun,
          })
        : `Starting Daytona sandbox debug session: ${env.TERMBRIDGE_SANDBOX_NAME}`
    )
    yield* Command.run({
      command: process.execPath,
      args: [resolve(directory, "packages/cli/dist/bin.js")],
      cwd: app,
      env,
      inherit: true,
    })
  })
/** CLI for interactive Daytona sandbox debugging. */
export const command = script("daytona-debug", {
  description: "Build and start a temporary Daytona debug session.",
  flags: {
    direct: Flag.Boolean("direct").pipe(Flag.withDefault(false)),
    agent: Flag.String("agent").pipe(Flag.withDefault("")),
    agents: Flag.String("agents").pipe(Flag.withDefault("")),
    previewPort: Flag.String("preview-port").pipe(Flag.withDefault("")),
  },
  run: debug,
})
if (import.meta.main) main(command)
