import { resolve } from "node:path"
import { config as loadEnv } from "dotenv"
import { runCli } from "./cli/run.ts"

if (process.env.NODE_ENV !== "test") {
  loadEnv({ path: resolve(process.cwd(), ".env") })
}

/**
 * Run the CLI entry point and record its exit code on the process.
 * @param argv - Command-line arguments without the executable prefix.
 * @param proc - Process whose streams and exit status are used.
 */
export const main = async (
  argv: string[] = process.argv.slice(2),
  proc: NodeJS.Process = process
) => {
  const exitCode = await runCli(argv, {
    process: proc,
    stdout: proc.stdout,
    stderr: proc.stderr,
  })
  proc.exitCode = exitCode
}

if (process.env.NODE_ENV !== "test") {
  void main()
}
