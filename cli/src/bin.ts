import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { runCli } from "./cli/run";

if (process.env.NODE_ENV !== "test") {
  loadEnv({ path: resolve(process.cwd(), ".env") });
}

export const main = async (
  argv: string[] = process.argv.slice(2),
  proc: NodeJS.Process = process
) => {
  const exitCode = await runCli(argv, { process: proc, stdout: proc.stdout, stderr: proc.stderr });
  proc.exitCode = exitCode;
};

if (process.env.NODE_ENV !== "test") {
  void main();
}
