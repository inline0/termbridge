import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { pathToFileURL } from "node:url"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { packLocalCli } from "./local-package.ts"

const childProcessMocks = vi.hoisted(() => ({
  spawnSync:
    vi.fn<
      (
        command: string,
        args: string[],
        options: { cwd: string; encoding: string }
      ) => { status: number | null; stderr?: string }
    >(),
}))
vi.mock("node:child_process", () => ({
  spawnSync: childProcessMocks.spawnSync,
}))

let directory: string
const outputs = new Set<string>()
const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
const makePackage = (layout: "source" | "bundled", manifest: object) => {
  writeFileSync(join(directory, "package.json"), JSON.stringify(manifest))
  const modulePath = join(
    directory,
    layout === "source" ? "src/cli/local-package.ts" : "dist/bin.js"
  )
  mkdirSync(dirname(modulePath), { recursive: true })
  return pathToFileURL(modulePath).href
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "termbridge-pack-test-"))
  vi.clearAllMocks()
  childProcessMocks.spawnSync.mockImplementation((_command, args) => {
    const destination = args[2]
    outputs.add(destination)
    writeFileSync(join(destination, "termbridge.tgz"), "archive")
    return { status: 0 }
  })
})
afterEach(() => {
  rmSync(directory, { recursive: true, force: true })
  for (const output of outputs) rmSync(output, { recursive: true, force: true })
  outputs.clear()
})

describe("packLocalCli", () => {
  it("finds source workspace manifests and packs their catalog dependencies with pnpm", () => {
    const url = makePackage("source", {
      name: "termbridge",
      dependencies: { react: "catalog:" },
      devDependencies: { "@termbridge/shared": "workspace:*" },
    })
    const packed = packLocalCli(logger, url)
    expect.assert(packed)
    expect(childProcessMocks.spawnSync).toHaveBeenCalledWith(
      "pnpm",
      ["pack", "--pack-destination", dirname(packed.path)],
      { cwd: directory, encoding: "utf8" }
    )
    expect(existsSync(packed.path)).toBe(true)
    packed.cleanup()
    expect(existsSync(dirname(packed.path))).toBe(false)
  })

  it("uses npm without lifecycle scripts for an installed bundled CLI", () => {
    const url = makePackage("bundled", {
      name: "termbridge",
      dependencies: { react: "19.3.1" },
      scripts: { prepack: "pnpm build" },
    })
    const packed = packLocalCli(logger, url)
    expect.assert(packed)
    expect(childProcessMocks.spawnSync).toHaveBeenCalledWith(
      "npm",
      ["pack", "--pack-destination", dirname(packed.path), "--ignore-scripts"],
      { cwd: directory, encoding: "utf8" }
    )
    packed.cleanup()
  })

  it("ignores unrelated manifests while locating the CLI", () => {
    const url = makePackage("source", { name: "termbridge" })
    writeFileSync(
      join(directory, "src", "package.json"),
      '{"name":"unrelated"}'
    )
    const packed = packLocalCli(logger, url)
    expect.assert(packed)
    packed.cleanup()
  })

  it("returns no archive when no CLI manifest is present", () => {
    expect(
      packLocalCli(
        logger,
        pathToFileURL(join(directory, "src/cli/local-package.ts")).href
      )
    ).toBeUndefined()
    expect(childProcessMocks.spawnSync).not.toHaveBeenCalled()
  })

  it.each(["pack failed", "", undefined])(
    "cleans a failed pack with stderr %s",
    (stderr) => {
      const url = makePackage("bundled", { name: "termbridge" })
      childProcessMocks.spawnSync.mockImplementation((_command, args) => {
        outputs.add(args[2])
        return { status: 1, stderr }
      })
      expect(packLocalCli(logger, url)).toBeUndefined()
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(stderr || "pack command failed")
      )
      for (const output of outputs) expect(existsSync(output)).toBe(false)
    }
  )

  it("does not trust successful output without an actual archive", () => {
    const url = makePackage("bundled", { name: "termbridge" })
    childProcessMocks.spawnSync.mockImplementation((_command, args) => {
      outputs.add(args[2])
      writeFileSync(join(args[2], "output.txt"), "not an archive")
      return { status: 0 }
    })
    expect(packLocalCli(logger, url)).toBeUndefined()
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("no tarball produced")
    )
    for (const output of outputs) expect(existsSync(output)).toBe(false)
  })
})
