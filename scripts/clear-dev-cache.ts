import { join } from "node:path"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { main, script, type ScriptInput } from "./lib/cli.ts"
import { root } from "./lib/paths.ts"

/**
 * Remove or preview the workspace Vite caches.
 *
 * @param input - Standard CLI output and preview options.
 * @param directory - Source checkout containing the caches.
 * @returns An effect removing caches or printing their planned paths.
 */
export const clearCaches = (input: ScriptInput, directory = root) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const targets = [
      "packages/cli/node_modules/.vite",
      "packages/cli/.vite",
      "node_modules/.vite",
    ].map((path) => join(directory, path))
    if (!input.dryRun)
      yield* Effect.forEach(
        targets,
        (path) => fs.remove(path, { recursive: true, force: true }),
        { concurrency: 3 }
      )
    yield* Console.log(
      input.json
        ? JSON.stringify({ targets, dryRun: input.dryRun })
        : `Vite caches ${input.dryRun ? "would be cleared" : "cleared"}.`
    )
  })
/** CLI for clearing the three source-workspace Vite caches. */
export const command = script("clear-dev-cache", {
  description: "Remove stale Vite development caches.",
  flags: {},
  run: clearCaches,
})
if (import.meta.main) main(command)
