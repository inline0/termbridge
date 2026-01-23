export type CliOptions = {
  port?: number;
  proxy?: number;
  devProxyUrl?: string;
  session?: string;
  killOnExit: boolean;
  noQr: boolean;
  tunnel: "cloudflare" | "none";
  tunnelToken?: string;
  tunnelUrl?: string;
  publicUrl?: string;
  backend?: "tmux" | "sandbox-daytona";
  sandboxDaytonaDirect?: boolean;
  sandboxDaytonaRepo?: string;
  sandboxDaytonaBranch?: string;
  sandboxDaytonaPath?: string;
  sandboxDaytonaName?: string;
  sandboxDaytonaPreviewPort?: number;
  sandboxDaytonaPublic?: boolean;
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

    if (current === "--no-tunnel") {
      options.tunnel = "none";
      continue;
    }

    if (current === "--tunnel") {
      const tunnel = args.shift();

      if (tunnel !== "cloudflare" && tunnel !== "none") {
        throw new Error("unsupported tunnel provider");
      }

      options.tunnel = tunnel;
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

    if (current === "--public-url") {
      const url = args.shift();

      if (!url) {
        throw new Error("missing public url");
      }

      options.publicUrl = url;
      continue;
    }

    if (current === "--backend") {
      const backend = args.shift();

      if (!backend) {
        throw new Error("missing backend");
      }

      if (backend !== "tmux" && backend !== "sandbox-daytona") {
        throw new Error("invalid backend");
      }

      options.backend = backend;
      continue;
    }

    if (current === "--sandbox-daytona-repo") {
      const repo = args.shift();

      if (!repo) {
        throw new Error("missing sandbox daytona repo");
      }

      options.sandboxDaytonaRepo = repo;
      continue;
    }

    if (current === "--sandbox-daytona-branch") {
      const branch = args.shift();

      if (!branch) {
        throw new Error("missing sandbox daytona branch");
      }

      options.sandboxDaytonaBranch = branch;
      continue;
    }

    if (current === "--sandbox-daytona-path") {
      const path = args.shift();

      if (!path) {
        throw new Error("missing sandbox daytona path");
      }

      options.sandboxDaytonaPath = path;
      continue;
    }

    if (current === "--sandbox-daytona-name") {
      const name = args.shift();

      if (!name) {
        throw new Error("missing sandbox daytona name");
      }

      options.sandboxDaytonaName = name;
      continue;
    }

    if (current === "--sandbox-daytona-preview-port") {
      const port = parseNumber(args.shift());

      if (!port || port <= 0) {
        throw new Error("missing sandbox daytona preview port");
      }

      options.sandboxDaytonaPreviewPort = port;
      continue;
    }

    if (current === "--sandbox-daytona-public") {
      options.sandboxDaytonaPublic = true;
      continue;
    }

    if (current === "--sandbox-daytona-direct") {
      options.sandboxDaytonaDirect = true;
      options.tunnel = "none";
      continue;
    }

    throw new Error(`unknown option: ${current}`);
  }

  return { command, options };
};
