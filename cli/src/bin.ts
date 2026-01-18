import { runCli } from "./cli/run";

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
