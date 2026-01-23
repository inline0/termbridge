import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { readdir, stat } from "node:fs/promises";
import type { Sandbox } from "@daytonaio/sdk";
import type { Logger } from "../server/server";
import type { AgentAuthOptions, AgentAuthSpec } from "../sandbox/server-provider";

const expandHome = (value: string, home: string) => {
  if (value === "~") {
    return home;
  }
  if (value.startsWith("~/")) {
    return join(home, value.slice(2));
  }
  return value;
};

const resolveDestination = (
  spec: AgentAuthSpec,
  sourcePath: string,
  localHome: string,
  remoteHome: string
) => {
  if (spec.destination) {
    return expandHome(spec.destination, remoteHome);
  }

  if (sourcePath.startsWith(localHome)) {
    const rel = relative(localHome, sourcePath);
    return join(remoteHome, rel);
  }

  return join(remoteHome, ".termbridge", "auth", basename(sourcePath));
};

const collectFiles = async (root: string): Promise<string[]> => {
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(join(root, entry.name))));
      continue;
    }
    if (entry.isFile()) {
      files.push(join(root, entry.name));
    }
  }

  return files;
};

const shellEscape = (value: string) => `'${value.replace(/'/g, `'"'"'`)}'`;

const resolveRemoteHome = async (sandbox: Sandbox) => {
  const response = await sandbox.process.executeCommand("printf $HOME");
  if (response.exitCode === 0 && response.result.trim()) {
    return response.result.trim();
  }
  return "/home/daytona";
};

export const syncAgentAuth = async (
  sandbox: Sandbox,
  options: AgentAuthOptions | undefined,
  logger: Logger
) => {
  if (!options || options.specs.length === 0) {
    return;
  }

  const localHome = homedir();
  const remoteHome = await resolveRemoteHome(sandbox);
  const uploads: Array<{ source: string; destination: string }> = [];
  const mkdirs = new Set<string>();

  for (const spec of options.specs) {
    const sourcePath = resolve(expandHome(spec.source, localHome));
    let stats: Awaited<ReturnType<typeof stat>>;
    try {
      stats = await stat(sourcePath);
    } catch {
      continue;
    }

    const destinationRoot = resolveDestination(spec, sourcePath, localHome, remoteHome);
    if (stats.isDirectory()) {
      const files = await collectFiles(sourcePath);
      for (const file of files) {
        const rel = relative(sourcePath, file);
        const destination = join(destinationRoot, rel);
        uploads.push({ source: file, destination });
        mkdirs.add(dirname(destination));
      }
      continue;
    }

    uploads.push({ source: sourcePath, destination: destinationRoot });
    mkdirs.add(dirname(destinationRoot));
  }

  if (uploads.length === 0) {
    return;
  }

  for (const dir of mkdirs) {
    await sandbox.process.executeCommand(`mkdir -p ${shellEscape(dir)}`);
  }

  try {
    await sandbox.fs.uploadFiles(uploads);
    logger.info(`Daytona: synced ${uploads.length} auth file${uploads.length === 1 ? "" : "s"}`);
  } catch (error) {
    logger.warn(`Daytona: auth upload failed: ${error}`);
  }
};
