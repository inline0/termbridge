import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { packLocalCli } from "../packages/cli/src/cli/local-package.ts"

const directory = mkdtempSync(join(tmpdir(), "termbridge-local-package-check-"))
const logger = { info: console.log, warn: console.warn, error: console.error }
const workspace = packLocalCli(logger)
let installed: ReturnType<typeof packLocalCli>
try {
  assert(workspace, "Source workspace did not produce a CLI archive")
  const manifestText = execFileSync(
    "tar",
    ["-xOf", workspace.path, "package/package.json"],
    { encoding: "utf8" }
  )
  assert(
    !manifestText.includes('"catalog:') &&
      !manifestText.includes('"workspace:'),
    "Workspace references were not rewritten"
  )
  execFileSync("tar", ["-xzf", workspace.path, "-C", directory])
  const packageRoot = join(directory, "package")
  const manifestPath = join(packageRoot, "package.json")
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    scripts?: Record<string, string>
  }
  manifest.scripts = { prepack: "node -e 'process.exit(99)'" }
  writeFileSync(manifestPath, JSON.stringify(manifest))
  const binDirectory = join(directory, "bin")
  mkdirSync(binDirectory)
  writeFileSync(join(binDirectory, "pnpm"), "#!/bin/sh\nexit 99\n", {
    mode: 0o755,
  })
  const originalPath = process.env.PATH
  process.env.PATH = `${binDirectory}:${originalPath}`
  try {
    installed = packLocalCli(
      logger,
      pathToFileURL(join(packageRoot, "dist", "bin.js")).href
    )
  } finally {
    process.env.PATH = originalPath
  }
  assert(
    installed,
    "Installed CLI must repack without pnpm or lifecycle scripts"
  )
  const contents = execFileSync("tar", ["-tzf", installed.path], {
    encoding: "utf8",
  })
  assert.match(contents, /package\/dist\/bin\.js/)
  assert.match(contents, /package\/ui\/dist\/index\.html/)
  console.log(
    "Sandbox archives passed: source catalog rewriting, installed npm-only repack, bundled assets"
  )
} finally {
  installed?.cleanup()
  workspace?.cleanup()
  rmSync(directory, { recursive: true, force: true })
}
