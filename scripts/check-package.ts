import assert from "node:assert/strict"
import { createServer } from "node:net"
import { delimiter, dirname, join, resolve } from "node:path"
import * as Argument from "effect/cli/Argument"
import * as Flag from "effect/cli/Flag"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { fail, main, script, type ScriptInput } from "./lib/cli.ts"
import * as Command from "./lib/command.ts"
import * as Http from "./lib/http.ts"
import { root } from "./lib/paths.ts"

/**
 * Consumer smoke check options, including an older Node runtime to exercise.
 */
export interface PackageInput extends ScriptInput {
  readonly tarball: string
  readonly node: string
}
const availablePort = Effect.tryPromise(
  () =>
    new Promise<number>((resolvePort, reject) => {
      const server = createServer()
      server.once("error", reject)
      server.listen(0, "127.0.0.1", () => {
        const address = server.address()
        if (!address || typeof address === "string") {
          server.close()
          reject(new Error("Missing listener address"))
          return
        }
        server.close((error) =>
          error ? reject(error) : resolvePort(address.port)
        )
      })
    })
)
/**
 * Exercise an isolated packed consumer with scoped cleanup.
 *
 * @param input - Tarball, consumer runtime and standard CLI options.
 * @returns An effect verifying CLI, authentication, UI assets and tmux.
 */
export const checkPackage = (input: PackageInput) =>
  Effect.scoped(
    Effect.gen(function* () {
      if (input.dryRun) {
        yield* Console.log(
          input.json
            ? JSON.stringify({
                dryRun: true,
                action: "pack-install-smoke",
                node: input.node,
              })
            : "Would pack, install and exercise the CLI in a temporary consumer."
        )
        return
      }
      const fs = yield* FileSystem.FileSystem
      const directory = yield* fs.makeTempDirectoryScoped({
        prefix: "termbridge-package-",
      })
      const env: Record<string, string | undefined> = {
        ...process.env,
        TMUX_TMPDIR: directory,
        SHELL: "/bin/sh",
      }
      for (const key of Object.keys(env))
        if (key.startsWith("TERMBRIDGE_") || key === "TMUX")
          env[key] = undefined
      env.TERMBRIDGE_INSECURE_COOKIE = "1"
      yield* Effect.addFinalizer(() =>
        Command.run({
          command: "tmux",
          args: ["kill-server"],
          env,
          check: false,
        }).pipe(Effect.catchCause(() => Effect.void))
      )
      const tarball = input.tarball
        ? resolve(input.tarball)
        : join(directory, "termbridge.tgz")
      if (!input.tarball)
        yield* Command.run({
          command: "pnpm",
          args: ["--filter", "termbridge", "pack", "--out", tarball],
          cwd: root,
          inherit: true,
        })
      yield* fs.writeFileString(
        join(directory, "package.json"),
        JSON.stringify({
          private: true,
          allowScripts: { "node-pty": true, protobufjs: true },
        })
      )
      yield* Command.run({
        command: "npm",
        args: ["install", "--no-audit", "--no-fund", tarball],
        env: {
          ...env,
          PATH: `${dirname(input.node)}${delimiter}${process.env.PATH ?? ""}`,
        },
        cwd: directory,
        inherit: true,
      })
      const installed = join(directory, "node_modules/termbridge")
      const manifest = JSON.parse(
        yield* fs.readFileString(join(installed, "package.json"), "utf-8")
      ) as { name: string; dependencies: Record<string, string> }
      assert.equal(manifest.name, "termbridge")
      for (const version of Object.values(manifest.dependencies))
        assert(!/^(workspace|catalog):/.test(version))
      const bin = join(installed, "dist/bin.js")
      const help = yield* Command.run({
        command: input.node,
        args: [bin, "--help"],
        env,
        mutates: false,
      })
      assert.match(help.stdout, /termbridge/)
      const port = yield* availablePort
      const base = `http://127.0.0.1:${port}`
      let output = ""
      let errors = ""
      let stopped = false
      yield* Command.run({
        command: input.node,
        args: [
          bin,
          "--no-tunnel",
          "--public-url",
          base,
          "--port",
          String(port),
          "--session",
          "package-smoke",
          "--kill-on-exit",
          "--no-qr",
        ],
        cwd: directory,
        env,
        capture: false,
        onOutput: (text, channel) =>
          Effect.sync(() => {
            if (channel === "stdout") output += text
            else errors += text
          }),
      }).pipe(
        Effect.ensuring(
          Effect.sync(() => {
            stopped = true
          })
        ),
        Effect.forkScoped
      )
      const deadline = Date.now() + 15_000
      let ready = false
      while (Date.now() < deadline) {
        if (stopped) return yield* fail(`Packed CLI exited: ${errors}`)
        ready = yield* Http.request(`${base}/__tb/healthz`).pipe(
          Effect.map((response) => response.ok),
          Effect.catchCause(() => Effect.succeed(false))
        )
        if (ready && /http:\/\/127\.0\.0\.1:\d+\/__tb\/s\/[^\s]+/.test(output))
          break
        yield* Effect.sleep("100 millis")
      }
      assert(ready, "Packed CLI did not become ready")
      const share = output.match(
        /http:\/\/127\.0\.0\.1:\d+\/__tb\/s\/[^\s]+/
      )?.[0]
      assert(share, "Packed CLI did not print a share URL")
      const redeemed = yield* Http.request(share, { redirect: "manual" })
      assert.equal(redeemed.status, 302)
      const cookie = redeemed.headers.get("set-cookie")?.split(";")[0]
      assert(cookie, "Share redemption did not create a session")
      const headers = { cookie }
      const page = yield* Http.request(`${base}/__tb/app`, { headers })
      assert.equal(page.status, 200)
      const html = yield* Effect.tryPromise(() => page.text())
      assert.match(html, /<div id="root"><\/div>/)
      const assets = [
        ...html.matchAll(/(?:src|href)="(\/__tb\/app\/assets\/[^"]+)"/g),
      ]
      assert(assets.length > 0, "Packed UI has no asset references")
      for (const [, path] of assets) {
        const asset = yield* Http.request(`${base}${path}`, { headers })
        assert.equal(asset.status, 200)
        assert.match(
          asset.headers.get("content-type") ?? "",
          path.endsWith(".css") ? /text\/css/ : /javascript/
        )
      }
      const terminals = yield* Http.request(`${base}/__tb/api/terminals`, {
        headers,
      })
      assert.equal(terminals.status, 200)
      const payload = (yield* Effect.tryPromise(() => terminals.json())) as {
        terminals: unknown[]
      }
      assert.equal(payload.terminals.length, 1)
      yield* Console.log(
        input.json
          ? JSON.stringify({ success: true, node: input.node })
          : `Packed CLI passed: help, startup, auth, UI, tmux (${input.node})`
      )
    })
  )
/**
 * CLI for packed consumer smoke testing, independent of the tested Node
 * version.
 */
export const command = script("check-package", {
  description: "Exercise a packed CLI as an isolated consumer.",
  flags: {
    tarball: Argument.String("tarball").pipe(Argument.withDefault("")),
    node: Flag.String("node").pipe(Flag.withDefault(process.execPath)),
  },
  run: (input) => checkPackage(input).pipe(Effect.provide(Http.layer)),
})
if (import.meta.main) main(command)
