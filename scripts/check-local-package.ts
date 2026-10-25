import assert from "node:assert/strict"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { packLocalCli } from "../packages/cli/src/cli/local-package.ts"
import { main, script, type ScriptInput } from "./lib/cli.ts"
import * as Command from "./lib/command.ts"

/**
 * Exercise source and installed runtime archive creation.
 *
 * @param input - Standard CLI output and preview options.
 * @returns An effect checking catalog rewriting and installed repacking.
 */
export const checkLocalPackage = (input: ScriptInput) =>
  Effect.scoped(
    Effect.gen(function* () {
      if (input.dryRun) {
        yield* Console.log(
          input.json
            ? JSON.stringify({ dryRun: true, action: "sandbox-archive-smoke" })
            : "Would validate source and installed sandbox archives."
        )
        return
      }
      const fs = yield* FileSystem.FileSystem
      const directory = yield* fs.makeTempDirectoryScoped({
        prefix: "termbridge-local-package-check-",
      })
      const logger = {
        info: console.log,
        warn: console.warn,
        error: console.error,
      }
      const workspace = yield* Effect.acquireRelease(
        Effect.sync(() => packLocalCli(logger)),
        (archive) => Effect.sync(() => archive?.cleanup())
      )
      assert(workspace, "Source workspace did not produce a CLI archive")
      const manifestText = (yield* Command.run({
        command: "tar",
        args: ["-xOf", workspace.path, "package/package.json"],
        mutates: false,
      })).stdout
      assert(
        !manifestText.includes('"catalog:') &&
          !manifestText.includes('"workspace:'),
        "Workspace references were not rewritten"
      )
      yield* Command.run({
        command: "tar",
        args: ["-xzf", workspace.path, "-C", directory],
      })
      const packageRoot = join(directory, "package")
      const manifestPath = join(packageRoot, "package.json")
      const manifest = JSON.parse(
        yield* fs.readFileString(manifestPath, "utf-8")
      ) as { scripts?: Record<string, string> }
      manifest.scripts = { prepack: "node -e 'process.exit(99)'" }
      yield* fs.writeFileString(manifestPath, JSON.stringify(manifest))
      const bin = join(directory, "bin")
      yield* fs.makeDirectory(bin)
      yield* fs.writeFileString(join(bin, "pnpm"), "#!/bin/sh\nexit 99\n")
      yield* fs.chmod(join(bin, "pnpm"), 0o755)
      const originalPath = process.env.PATH
      const installed = yield* Effect.acquireRelease(
        Effect.sync(() => {
          process.env.PATH = `${bin}:${originalPath ?? ""}`
          try {
            return packLocalCli(
              logger,
              pathToFileURL(join(packageRoot, "dist/bin.js")).href
            )
          } finally {
            process.env.PATH = originalPath
          }
        }),
        (archive) => Effect.sync(() => archive?.cleanup())
      )
      assert(
        installed,
        "Installed CLI must repack without pnpm or lifecycle scripts"
      )
      const contents = (yield* Command.run({
        command: "tar",
        args: ["-tzf", installed.path],
        mutates: false,
      })).stdout
      assert.match(contents, /package\/dist\/bin\.js/)
      assert.match(contents, /package\/ui\/dist\/index\.html/)
      yield* Console.log(
        input.json
          ? JSON.stringify({ success: true })
          : "Sandbox archives passed: source catalog rewriting, installed npm-only repack, bundled assets"
      )
    })
  )
/** CLI for the runtime sandbox archive contract check. */
export const command = script("check-local-package", {
  description: "Verify the runtime source and installed archive contracts.",
  flags: {},
  run: checkLocalPackage,
})
if (import.meta.main) main(command)
