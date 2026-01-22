export type CliOptions = {
  port?: number;
  proxy?: number;
  devProxyUrl?: string;
  session?: string;
  killOnExit: boolean;
  noQr: boolean;
  tunnel: "cloudflare";
  tunnelToken?: string;
  tunnelUrl?: string;
  backend?: "tmux" | "daytona";
  daytonaRepo?: string;
  daytonaBranch?: string;
  daytonaPath?: string;
  daytonaSandboxName?: string;
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

    if (current === "--proxy") {
      const proxy = parseNumber(args.shift());

      if (!proxy || proxy <= 0) {
        throw new Error("invalid proxy port");
      }

      options.proxy = proxy;
      continue;
    }

    if (current === "--dev-proxy-url") {
      const url = args.shift();

      if (!url) {
        throw new Error("missing dev proxy URL");
      }

      options.devProxyUrl = url;
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

    if (current === "--tunnel-token") {
      const token = args.shift();

      if (!token) {
        throw new Error("missing tunnel token");
      }

      options.tunnelToken = token;
      continue;
    }

    if (current === "--tunnel-url") {
      const url = args.shift();

      if (!url) {
        throw new Error("missing tunnel url");
      }

      options.tunnelUrl = url;
      continue;
    }

    if (current === "--backend") {
      const backend = args.shift();

      if (!backend) {
        throw new Error("missing backend");
      }

      if (backend !== "tmux" && backend !== "daytona") {
        throw new Error("invalid backend");
      }

      options.backend = backend;
      continue;
    }

    if (current === "--daytona-repo") {
      const repo = args.shift();

      if (!repo) {
        throw new Error("missing daytona repo");
      }

      options.daytonaRepo = repo;
      continue;
    }

    if (current === "--daytona-branch") {
      const branch = args.shift();

      if (!branch) {
        throw new Error("missing daytona branch");
      }

      options.daytonaBranch = branch;
      continue;
    }

    if (current === "--daytona-path") {
      const path = args.shift();

      if (!path) {
        throw new Error("missing daytona path");
      }

      options.daytonaPath = path;
      continue;
    }

    if (current === "--daytona-name") {
      const name = args.shift();

      if (!name) {
        throw new Error("missing daytona name");
      }

      options.daytonaSandboxName = name;
      continue;
    }

    throw new Error(`unknown option: ${current}`);
  }

  return { command, options };
};
