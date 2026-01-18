export type CliOptions = {
  port?: number;
  session?: string;
  killOnExit: boolean;
  noQr: boolean;
  tunnel: "cloudflare";
};

export type ParsedArgs = {
  command: "start" | "help";
  options: CliOptions;
};

const parseNumber = (value: string | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const parseArgs = (argv: string[]): ParsedArgs => {
  const args = [...argv];
  let command: ParsedArgs["command"] = "start";

  if (args[0] && !args[0].startsWith("-")) {
    command = args.shift() === "help" ? "help" : "start";
  }

  const options: CliOptions = {
    killOnExit: false,
    noQr: false,
    tunnel: "cloudflare"
  };

  while (args.length > 0) {
    const current = args.shift();

    if (!current) {
      continue;
    }

    if (current === "--help" || current === "-h") {
      command = "help";
      continue;
    }

    if (current === "--port") {
      const port = parseNumber(args.shift());

      if (!port || port <= 0) {
        throw new Error("invalid port");
      }

      options.port = port;
      continue;
    }

    if (current === "--session") {
      const session = args.shift();

      if (!session) {
        throw new Error("missing session name");
      }

      options.session = session;
      continue;
    }

    if (current === "--kill-on-exit") {
      options.killOnExit = true;
      continue;
    }

    if (current === "--no-qr") {
      options.noQr = true;
      continue;
    }

    if (current === "--tunnel") {
      const tunnel = args.shift();

      if (tunnel !== "cloudflare") {
        throw new Error("unsupported tunnel provider");
      }

      options.tunnel = "cloudflare";
      continue;
    }

    throw new Error(`unknown option: ${current}`);
  }

  return { command, options };
};
