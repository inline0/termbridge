import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { main, script } from "./lib/cli.ts"

type Manifest = {
  name: string
  type?: string
  private?: boolean
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/** Audit workspace dependencies through the supplied Effect filesystem. */
export const command = script("check-workspace", {
  description: "Validate workspace manifests and dependency cycles.",
  flags: {},
  run: (input) =>
    Effect.gen(function* () {
      const root = new URL("../", import.meta.url)
      const fs = yield* FileSystem.FileSystem
      const read = (url: URL) => fs.readFileString(fileURLToPath(url), "utf-8")
      const paths = (yield* fs.readDirectory(
        fileURLToPath(new URL("packages/", root))
      )).sort()
      const manifests = yield* Effect.forEach(
        paths,
        (path) =>
          Effect.gen(function* () {
            const manifest = JSON.parse(
              yield* read(new URL(`packages/${path}/package.json`, root))
            ) as Manifest
            return { path, manifest }
          }),
        { concurrency: 4 }
      )
      const rootManifest = JSON.parse(
        yield* read(new URL("package.json", root))
      ) as Manifest
      const names = new Set(manifests.map(({ manifest }) => manifest.name))
      const graph = new Map<string, Set<string>>()

      for (const { path, manifest } of [
        { path: ".", manifest: rootManifest },
        ...manifests,
      ]) {
        assert.equal(manifest.type, "module", `${path} must use ES modules`)
        if (manifest.name !== "termbridge") {
          assert.equal(manifest.private, true, `${path} must be private`)
        }
        const dependencies = new Set<string>()
        for (const section of ["dependencies", "devDependencies"] as const) {
          for (const [name, version] of Object.entries(
            manifest[section] ?? {}
          )) {
            const expected = names.has(name) ? "workspace:*" : "catalog:"
            assert.equal(
              version,
              expected,
              `${path}: ${name} must use ${expected}`
            )
            if (names.has(name)) dependencies.add(name)
          }
        }
        graph.set(manifest.name, dependencies)
      }

      const visiting = new Set<string>()
      const visited = new Set<string>()
      const visit = (name: string): void => {
        assert(
          !visiting.has(name),
          `Workspace dependency cycle through ${name}`
        )
        if (visited.has(name)) return
        visiting.add(name)
        for (const dependency of graph.get(name) ?? []) visit(dependency)
        visiting.delete(name)
        visited.add(name)
      }
      for (const name of names) visit(name)

      assert.equal(
        (yield* read(new URL(".node-version", root))).trim(),
        (yield* read(new URL(".nvmrc", root))).trim(),
        "Node version files must agree"
      )
      yield* Console.log(
        input.json
          ? JSON.stringify({ packages: manifests.length, success: true })
          : `Workspace manifests and dependency graph pass: ${manifests.length} packages in ${fileURLToPath(root)}`
      )
    }),
})
if (import.meta.main) main(command)
