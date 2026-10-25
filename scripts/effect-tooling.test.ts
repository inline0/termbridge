import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Effect from "effect/Effect"
import { auditDocumentation, loadDocumentation } from "./check-docs-content.ts"
import { clearCaches } from "./clear-dev-cache.ts"
import { parseEnvFile } from "./daytona-debug.ts"
import { dev, devUrls } from "./dev-beam.ts"
import { runtimeLayer } from "./lib/cli.ts"
import * as Command from "./lib/command.ts"

const live = <A, E>(effect: Effect.Effect<A, E, Command.Command>) =>
  Effect.runPromise(
    effect.pipe(Effect.provide(runtimeLayer({ json: false, dryRun: false })))
  )

test("cache clearing previews preserve files and live runs remove every declared cache", async () => {
  const root = mkdtempSync(join(tmpdir(), "termbridge-cache-"))
  const cache = join(root, "packages/cli/node_modules/.vite")
  try {
    mkdirSync(cache, { recursive: true })
    writeFileSync(join(cache, "stale"), "stale")
    await Effect.runPromise(
      clearCaches({ json: true, dryRun: true }, root).pipe(
        Effect.provide(NodeServices.layer)
      )
    )
    assert.ok(existsSync(cache))
    await Effect.runPromise(
      clearCaches({ json: true, dryRun: false }, root).pipe(
        Effect.provide(NodeServices.layer)
      )
    )
    assert.equal(existsSync(cache), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("a failing development process interrupts and joins its sibling", async () => {
  const root = mkdtempSync(join(tmpdir(), "termbridge-dev-"))
  let siblingClosed = false
  let calls = 0
  try {
    const failure = await Effect.runPromise(
      dev(
        { json: true, dryRun: false },
        { TERMBRIDGE_SKIP_BUILD: "1" },
        root
      ).pipe(
        Effect.provideService(Command.Command, {
          run: () => {
            calls++
            return calls === 1
              ? Effect.sleep("30 millis").pipe(
                  Effect.andThen(
                    Effect.fail(
                      new Command.CommandFailed({
                        exitCode: 8,
                        message: "fixture",
                      })
                    )
                  )
                )
              : Effect.never.pipe(
                  Effect.ensuring(
                    Effect.sync(() => {
                      siblingClosed = true
                    })
                  )
                )
          },
        }),
        Effect.provide(NodeServices.layer),
        Effect.flip
      )
    )
    assert.ok(failure instanceof Command.CommandFailed)
    assert.equal(failure.exitCode, 8)
    assert.equal(siblingClosed, true)
    assert.equal(calls, 2)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("the command scope kills a child that ignores SIGTERM", async () => {
  const root = mkdtempSync(join(tmpdir(), "termbridge-child-"))
  const file = join(root, "pid")
  try {
    await live(
      Command.run({
        command: process.execPath,
        args: [
          "-e",
          `require('node:fs').writeFileSync(${JSON.stringify(file)},String(process.pid));process.on('SIGTERM',()=>{});setInterval(()=>{},1000)`,
        ],
      }).pipe(
        Effect.timeout("500 millis"),
        Effect.catchCause(() => Effect.void)
      )
    )
    assert.ok(existsSync(file))
    assert.throws(() => process.kill(Number(readFileSync(file, "utf8")), 0), {
      code: "ESRCH",
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("environment parsing and development URLs preserve the existing options", () => {
  assert.deepEqual(
    parseEnvFile("#comment\nA=value=with=equals\n B = trimmed \ninvalid"),
    { A: "value=with=equals", B: "trimmed" }
  )
  assert.equal(devUrls("", "token"), undefined)
  assert.deepEqual(devUrls("https://dev.local", "token"), {
    redeem: "https://dev.local/__tb/s/token",
    app: "https://dev.local/__tb/app",
  })
})

test("every migrated CLI provides help and a preview without credentials, network or builds", () => {
  for (const name of [
    "check-package",
    "check-local-package",
    "clear-dev-cache",
    "dev-beam",
    "daytona-debug",
    "sandbox-cleanup",
    "test-direct",
    "check-workspace",
  ]) {
    const help = spawnSync(process.execPath, [`scripts/${name}.ts`, "--help"], {
      encoding: "utf8",
      timeout: 10000,
    })
    assert.equal(help.status, 0, `${name}: ${help.stderr}`)
    for (const flag of ["--json", "--dry-run", "--log-level"])
      assert.ok(help.stdout.includes(flag))
    const preview = spawnSync(
      process.execPath,
      [`scripts/${name}.ts`, "--dry-run", "--json"],
      { encoding: "utf8", timeout: 10000 }
    )
    assert.equal(preview.status, 0, `${name}: ${preview.stderr}`)
    assert.ok(
      preview.stdout
        .trim()
        .split("\n")
        .every((line) => JSON.parse(line))
    )
  }
})

test("JSON child output is structured stderr and previews redact environment values", () => {
  const call = (args: string[]) =>
    spawnSync(
      process.execPath,
      ["scripts/fixtures/command-fixture.ts", ...args],
      { encoding: "utf8", timeout: 10000 }
    )
  const result = call(["--json"])
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), { success: true })
  assert.match(result.stderr, /child output/)
  assert.ok(
    result.stderr
      .trim()
      .split("\n")
      .every((line) => JSON.parse(line).text)
  )
  assert.equal(call(["--code", "7"]).status, 7)
  const preview = call(["--dry-run", "--json"])
  assert.equal(preview.status, 0, preview.stderr)
  assert.ok(!preview.stderr.includes("never-log-this"))
})

test("development previews record both child commands", () => {
  const preview = spawnSync(
    process.execPath,
    ["scripts/dev-beam.ts", "--dry-run", "--json"],
    { encoding: "utf8", timeout: 10000 }
  )
  assert.equal(preview.status, 0, preview.stderr)
  assert.match(preview.stderr, /dist\/bin\.js/)
  assert.match(preview.stderr, /ui:dev/)
})

test("documentation snapshots retain relative links outside the content root", async () => {
  const checkout = mkdtempSync(join(tmpdir(), "inline0-external-docs-"))
  const root = join(checkout, "docs")
  try {
    mkdirSync(root)
    writeFileSync(join(checkout, "README.md"), "Repository readme.")
    writeFileSync(join(checkout, "asset.txt"), "Repository asset.")
    writeFileSync(join(root, "meta.json"), '{"pages":["index"]}')
    writeFileSync(
      join(root, "index.md"),
      "---\ntitle: Test\ndescription: Test\npath: /test\norder: 0\nmeta_title: Test\nmeta_description: Test\n---\n[Readme](../README.md)\n[Asset](../asset.txt)\n"
    )
    const tree = await Effect.runPromise(
      loadDocumentation(root).pipe(
        Effect.provide(runtimeLayer({ json: false, dryRun: false }))
      )
    )
    assert.deepEqual(auditDocumentation(root, tree, 1, 1).problems, [])
  } finally {
    rmSync(checkout, { recursive: true, force: true })
  }
})
