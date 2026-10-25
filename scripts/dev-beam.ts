import { resolve } from "node:path"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import { clearCaches } from "./clear-dev-cache.ts"
import { main, script, type ScriptInput } from "./lib/cli.ts"
import * as Command from "./lib/command.ts"
import { root } from "./lib/paths.ts"

/**
 * Resolve developer URLs after both processes have announced.
 *
 * @param origin - Browser development server origin.
 * @param token - CLI share token.
 * @returns The redeem and application URLs, or undefined while waiting.
 */
export const devUrls = (origin: string, token: string) =>
  origin && token
    ? {
        redeem: `${origin}/__tb/s/${token}`,
        app: `${origin}/__tb/app`,
      }
    : undefined
/**
 * Run the CLI and Vite in one cancellation scope.
 *
 * @param input - Standard CLI output and preview options.
 * @param env - Development configuration from the environment.
 * @param directory - Source checkout to build and run.
 * @returns An effect that joins both subprocesses when either exits.
 */
export const dev = (input: ScriptInput, env = process.env, directory = root) =>
  Effect.gen(function* () {
    const cli = resolve(directory, "packages/cli")
    const port = env.TERMBRIDGE_DEV_PORT ?? "8787"
    const session = env.TERMBRIDGE_DEV_SESSION ?? "codex"
    const proxy = env.TERMBRIDGE_PROXY_PORT
    let origin = env.TERMBRIDGE_DEV_UI
      ? new URL(env.TERMBRIDGE_DEV_UI).origin
      : ""
    let token = ""
    let printed = false
    const pending = { cli: "", vite: "" }
    const output =
      (source: "cli" | "vite") =>
      (text: string, channel: "stdout" | "stderr") =>
        Effect.gen(function* () {
          yield* Effect.sync(() => {
            ;(input.json ? process.stderr : process[channel]).write(
              input.json
                ? `${JSON.stringify({ source, channel, text })}\n`
                : text
            )
          })
          if (channel === "stderr") return
          pending[source] += text
          for (const line of pending[source].split("\n").slice(0, -1)) {
            const url = line.match(
              source === "cli"
                ? /Tunnel URL:\s*(https?:\/\/[^\s]+)/
                : /Local:\s*(https?:\/\/[^\s]+)/
            )?.[1]
            if (url && source === "cli")
              token = url.split("/__tb/s/")[1] ?? token
            if (url && source === "vite" && !origin) {
              try {
                origin = new URL(url).origin
              } catch {
                continue
              }
            }
          }
          pending[source] = pending[source].split("\n").at(-1) ?? ""
          const urls = devUrls(origin, token)
          if (urls && !printed) {
            printed = true
            yield* Console.log(
              input.json
                ? JSON.stringify(urls)
                : `Dev redeem URL: ${urls.redeem}\nDev app URL: ${urls.app}`
            )
          }
        })
    yield* clearCaches(input, directory)
    if (env.TERMBRIDGE_SKIP_BUILD !== "1")
      yield* Command.run({
        command: "pnpm",
        args: ["--dir", cli, "build"],
        cwd: directory,
        inherit: true,
      })
    const args = [
      resolve(cli, "dist/bin.js"),
      "--session",
      session,
      "--port",
      port,
      "--no-qr",
    ]
    if (proxy)
      args.push(
        "--proxy",
        proxy,
        "--dev-proxy-url",
        `http://localhost:${proxy}`
      )
    const calls: Command.CommandCall[] = [
      {
        command: process.execPath,
        args,
        cwd: cli,
        env: {
          TERMBRIDGE_INSECURE_COOKIE: env.TERMBRIDGE_INSECURE_COOKIE ?? "1",
        },
        capture: false,
        stdin: "inherit",
        onOutput: output("cli"),
      },
      {
        command: "pnpm",
        args: ["--dir", cli, "ui:dev"],
        cwd: directory,
        env: { TERMBRIDGE_DEV_PROXY: `http://127.0.0.1:${port}` },
        capture: false,
        stdin: "inherit",
        onOutput: output("vite"),
      },
    ]
    // The first exit, successful or failed, interrupts and joins its sibling.
    if (input.dryRun) yield* Effect.forEach(calls, Command.run)
    else yield* Effect.raceAllFirst(calls.map(Command.run))
  })
/** CLI for the terminal and browser development pair. */
export const command = script("dev-beam", {
  description: "Run the CLI and Vite together, cleaning both up on exit.",
  flags: {},
  run: (input) => dev(input),
})
if (import.meta.main) main(command)
