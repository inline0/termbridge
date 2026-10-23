import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { Logger } from "../server/server.ts"

type Manifest = {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/** Temporary CLI archive and the operation that removes it. */
export type LocalCliPack = { path: string; cleanup: () => void }

/**
 * Pack the running CLI for upload to a sandbox without retaining a tarball.
 * Workspace catalogs require pnpm; installed packages use npm without scripts.
 * @param logger - Destination for packaging failures.
 * @param sourceUrl - Source or bundled module URL used to locate the package.
 * @returns A temporary archive and cleanup handle, or undefined on failure.
 */
export const packLocalCli = (
  logger: Logger,
  sourceUrl: string = import.meta.url
): LocalCliPack | undefined => {
  const currentDir = dirname(fileURLToPath(sourceUrl))
  const candidates = [resolve(currentDir, ".."), resolve(currentDir, "../..")]
  for (const cliDir of candidates) {
    const packageJson = join(cliDir, "package.json")
    if (!existsSync(packageJson)) continue
    const manifest = JSON.parse(readFileSync(packageJson, "utf8")) as Manifest
    if (manifest.name !== "termbridge") continue

    const workspace = Object.values({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    }).some((version) => /^(catalog|workspace):/.test(version))
    const directory = mkdtempSync(join(tmpdir(), "termbridge-local-pack-"))
    const cleanup = () => rmSync(directory, { recursive: true, force: true })
    try {
      const result = spawnSync(
        workspace ? "pnpm" : "npm",
        [
          "pack",
          "--pack-destination",
          directory,
          ...(workspace ? [] : ["--ignore-scripts"]),
        ],
        { cwd: cliDir, encoding: "utf8" }
      )
      if (result.status !== 0) {
        throw new Error(
          result.stderr?.toString().trim() || "pack command failed"
        )
      }
      const filename = readdirSync(directory).find((name) =>
        name.endsWith(".tgz")
      )
      if (!filename) throw new Error("no tarball produced")
      return { path: join(directory, filename), cleanup }
    } catch (error) {
      cleanup()
      logger.warn(`Local CLI pack failed (${String(error)})`)
      return undefined
    }
  }
  return undefined
}
