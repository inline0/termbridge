import { resolve } from "node:path"
import { Daytona } from "@daytonaio/sdk"
import { parse } from "dotenv"
import * as Console from "effect/Console"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Layer from "effect/Layer"
import { fail, main, script, type ScriptInput } from "./lib/cli.ts"
import { root } from "./lib/paths.ts"

type Sandbox = Awaited<ReturnType<Daytona["get"]>>
/** Replaceable gateway for sandbox enumeration and deletion. */
export class Sandboxes extends Context.Service<
  Sandboxes,
  {
    readonly list: Effect.Effect<ReadonlyArray<Sandbox>, unknown>
    readonly remove: (sandbox: Sandbox) => Effect.Effect<void, unknown>
  }
>()("termbridge/scripts/Sandboxes") {}
const live = Layer.effect(
  Sandboxes,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = resolve(root, "../termbridge-test-app/.env")
    const loaded = (yield* fs.exists(path))
      ? parse(yield* fs.readFileString(path, "utf-8"))
      : {}
    const apiKey =
      process.env.TERMBRIDGE_DAYTONA_API_KEY ||
      loaded.TERMBRIDGE_DAYTONA_API_KEY
    const apiUrl =
      process.env.TERMBRIDGE_DAYTONA_API_URL ||
      loaded.TERMBRIDGE_DAYTONA_API_URL
    if (!apiKey) return yield* fail("Missing TERMBRIDGE_DAYTONA_API_KEY")
    const client = new Daytona({ apiKey, apiUrl })
    return {
      list: Effect.tryPromise(async () => {
        const results: Sandbox[] = []
        for await (const sandbox of client.list()) results.push(sandbox)
        return results
      }),
      remove: (sandbox: Sandbox) =>
        Effect.tryPromise(() => client.delete(sandbox)),
    }
  })
)
/**
 * Delete enumerated sandboxes through the supplied gateway.
 *
 * @param input - Standard CLI output options.
 * @returns An effect reporting deletion counts and any partial failure.
 */
export const cleanup = (input: ScriptInput) =>
  Effect.gen(function* () {
    const gateway = yield* Sandboxes
    const sandboxes = yield* gateway.list
    let deleted = 0
    let failed = 0
    for (const sandbox of sandboxes) {
      const result = yield* gateway.remove(sandbox).pipe(Effect.result)
      if (result._tag === "Success") deleted++
      else {
        failed++
        yield* Console.error(`Failed to delete ${sandbox.name || sandbox.id}`)
      }
    }
    yield* Console.log(
      input.json
        ? JSON.stringify({ deleted, failed })
        : `Done. Deleted: ${deleted}, Failed: ${failed}`
    )
    if (failed) return yield* fail(`${failed} sandbox deletion(s) failed.`)
  })
/**
 * CLI for deleting sandboxes; preview requires no credentials or network
 * calls.
 */
export const command = script("sandbox-cleanup", {
  description:
    "Delete all sandboxes visible to the configured Daytona account.",
  flags: {},
  run: (input) =>
    input.dryRun
      ? Console.log(
          input.json
            ? JSON.stringify({ dryRun: true, action: "delete-all-sandboxes" })
            : "Would list and delete all configured Daytona sandboxes."
        )
      : cleanup(input).pipe(Effect.provide(live)),
})
if (import.meta.main) main(command)
