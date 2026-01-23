import type { Sandbox } from "@daytonaio/sdk";
import type { Logger } from "../server/server";
import type { AgentInstallOptions } from "../sandbox/server-provider";

export const installAgents = async (
  sandbox: Sandbox,
  options: AgentInstallOptions | undefined,
  logger: Logger
) => {
  if (!options?.enabled || options.packages.length === 0) {
    return;
  }

  logger.info("Daytona: installing coding agents");

  const npmCheck = await sandbox.process.executeCommand("command -v npm");
  if (npmCheck.exitCode !== 0) {
    logger.warn("Daytona: npm not available; skipping agent install");
    return;
  }

  const install = await sandbox.process.executeCommand(`npm install -g ${options.packages.join(" ")}`);
  if (install.exitCode !== 0) {
    logger.warn("Daytona: agent install failed");
  }
};
