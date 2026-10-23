import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

type Manifest = {
  name: string
  type?: string
  private?: boolean
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const root = new URL("../", import.meta.url)
const paths = (await readdir(new URL("packages/", root))).sort()
const manifests = await Promise.all(
  paths.map(async (path) => {
    const manifest = JSON.parse(
      await readFile(new URL(`packages/${path}/package.json`, root), "utf8")
    ) as Manifest
    return { path, manifest }
  })
)
const rootManifest = JSON.parse(
  await readFile(new URL("package.json", root), "utf8")
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
    for (const [name, version] of Object.entries(manifest[section] ?? {})) {
      const expected = names.has(name) ? "workspace:*" : "catalog:"
      assert.equal(version, expected, `${path}: ${name} must use ${expected}`)
      if (names.has(name)) dependencies.add(name)
    }
  }
  graph.set(manifest.name, dependencies)
}

const visiting = new Set<string>()
const visited = new Set<string>()
const visit = (name: string): void => {
  assert(!visiting.has(name), `Workspace dependency cycle through ${name}`)
  if (visited.has(name)) return
  visiting.add(name)
  for (const dependency of graph.get(name) ?? []) visit(dependency)
  visiting.delete(name)
  visited.add(name)
}
for (const name of names) visit(name)

assert.equal(
  (await readFile(new URL(".node-version", root), "utf8")).trim(),
  (await readFile(new URL(".nvmrc", root), "utf8")).trim(),
  "Node version files must agree"
)
console.log(
  `Workspace manifests and dependency graph pass: ${manifests.length} packages in ${fileURLToPath(root)}`
)
