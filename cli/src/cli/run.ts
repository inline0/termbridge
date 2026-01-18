import qrcode from "qrcode-terminal";
import { parseArgs } from "./args";
import { helpText } from "./help";
import { startCommand } from "./start";
import type { Logger } from "../server/server";

export type RunDeps = {
  stdout?: NodeJS.WritableStream;
  stderr?: NodeJS.WritableStream;
  process?: NodeJS.Process;
};

const createLogger = (stdout: NodeJS.WritableStream, stderr: NodeJS.WritableStream): Logger => ({
  info: (message) => stdout.write(`${message}\n`),
  warn: (message) => stderr.write(`${message}\n`),
  error: (message) => stderr.write(`${message}\n`)
});

export const runCli = async (argv: string[], deps: RunDeps = {}) => {
  const stdout = deps.stdout ?? process.stdout;
  const stderr = deps.stderr ?? process.stderr;
  const processRef = deps.process ?? process;

  try {
    const parsed = parseArgs(argv);

    if (parsed.command === "help") {
      stdout.write(helpText);
      return 0;
    }

    await startCommand(parsed.options, {
      process: processRef,
      logger: createLogger(stdout, stderr),
      qr: {
        generate: (text, options) => qrcode.generate(text, options)
      }
    });

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    stderr.write(`${message}\n`);
    return 1;
  }
};
