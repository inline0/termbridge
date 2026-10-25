import { resolve } from "node:path"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { fail, main, script, type ScriptInput } from "./lib/cli.ts"
import * as Command from "./lib/command.ts"
import { root } from "./lib/paths.ts"

/**
 * Start the prebuilt CLI in direct sandbox mode.
 *
 * @param input - Standard CLI output and preview options.
 * @param directory - Source checkout containing the CLI build.
 * @returns An effect joining the CLI within its process scope.
 */
export const direct = (input: ScriptInput, directory = root) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const app = resolve(directory, "../termbridge-test-app")
    const bin = resolve(directory, "packages/cli/dist/bin.js")
    if (!input.dryRun) {
      if (!(yield* fs.exists(app)))
        return yield* fail(`Missing test app directory at ${app}`)
      if (!(yield* fs.exists(bin)))
        return yield* fail(`Missing CLI build at ${bin}. Run: pnpm build`)
    }
    const sandbox = `test-direct-${Date.now()}`
    yield* Console.log(
      input.json
        ? JSON.stringify({ sandbox, dryRun: input.dryRun })
        : `Starting Daytona direct mode test: ${sandbox}`
    )
    yield* Command.run({
      command: process.execPath,
      args: [bin],
      cwd: app,
      inherit: true,
      env: {
        TERMBRIDGE_SANDBOX_DIRECT: "true",
        TERMBRIDGE_SANDBOX_NAME: sandbox,
        TERMBRIDGE_SANDBOX_DELETE_ON_EXIT: "true",
        TERMBRIDGE_SANDBOX_AGENTS: "claude-code,codex",
      },
    })
  })
/** CLI for the opt-in direct sandbox smoke session. */
export const command = script("test-direct", {
  description: "Run a prebuilt CLI in a temporary direct sandbox.",
  flags: {},
  run: direct,
})
if (import.meta.main) main(command)
