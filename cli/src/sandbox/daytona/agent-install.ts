import type { Sandbox } from "@daytonaio/sdk";
import type { Logger } from "../../server/server";
import type { AgentInstallOptions } from "../server-provider";

export type AgentInstallResult = {
  success: boolean;
  installed: string[];
  error?: string;
};

export const installAgents = async (
  sandbox: Sandbox,
  options: AgentInstallOptions | undefined,
  logger: Logger
): Promise<AgentInstallResult> => {
  const hasPackages = (options?.packages?.length ?? 0) > 0;
  const hasScripts = (options?.installScripts?.length ?? 0) > 0;

  if (!options?.enabled || (!hasPackages && !hasScripts)) {
    return { success: true, installed: [] };
  }

  logger.info("Sandbox (Daytona): installing coding agents");

  const homeResult = await sandbox.process.executeCommand("printf $HOME");
  const home = homeResult.exitCode === 0 ? homeResult.result.trim() : "/home/daytona";
  const localPrefix = `${home}/.local`;

  const installedItems: string[] = [];
  const failedItems: string[] = [];

  if (hasPackages) {
    const npmCheck = await sandbox.process.executeCommand("command -v npm");
    if (npmCheck.exitCode !== 0) {
      logger.warn("Sandbox (Daytona): npm not available; skipping npm packages");
    } else {
      await sandbox.process.executeCommand(`mkdir -p ${localPrefix}`);

      for (const pkg of options.packages) {
        const installCmd = `npm install -g --prefix ${localPrefix} ${pkg}`;
        logger.info(`Sandbox (Daytona): installing ${pkg}`);

        for (let attempt = 1; attempt <= 2; attempt += 1) {
          const install = await sandbox.process.executeCommand(installCmd, undefined, undefined, 180);
          if (install.exitCode === 0) {
            logger.info(`Sandbox (Daytona): installed ${pkg}`);
            installedItems.push(pkg);
            break;
          }
          if (attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            logger.warn(`Sandbox (Daytona): ${pkg} install failed`);
            failedItems.push(pkg);
          }
        }
      }
    }
  }

  if (hasScripts) {
    for (const script of options.installScripts) {
      const shortName = script.split("/").pop()!.split("|")[0].trim() || script.slice(0, 30);
      logger.info(`Sandbox (Daytona): running install script: ${shortName}`);

      if (script.includes("curl") && script.includes("|")) {
        const urlMatch = script.match(/curl\s+[^\s]+\s+(https?:\/\/[^\s|]+)/);
        if (urlMatch) {
          const url = urlMatch[1];
          const scriptPath = `/tmp/install-${Date.now()}.sh`;

          const download = await sandbox.process.executeCommand(
            `curl -fsSL ${url} -o ${scriptPath} && chmod +x ${scriptPath}`,
            undefined,
            undefined,
            120
          );

          if (download.exitCode !== 0) {
            const downloadOutput = download.result?.slice(-300) || "(no output)";
            logger.warn(`Sandbox (Daytona): failed to download script: ${shortName}: ${downloadOutput}`);
            failedItems.push(`script:${shortName}`);
            continue;
          }

          const result = await sandbox.process.executeCommand(
            `bash ${scriptPath} 2>&1`,
            undefined,
            undefined,
            180
          );

          if (result.exitCode === 0) {
            installedItems.push(`script:${shortName}`);
          } else {
            const output = result.result?.slice(-500) || "(no output)";
            logger.warn(`Sandbox (Daytona): script failed: ${shortName} (exit ${result.exitCode}): ${output}`);
            failedItems.push(`script:${shortName}`);
          }
          continue;
        }
      }

      const result = await sandbox.process.executeCommand(script, undefined, undefined, 180);
      if (result.exitCode === 0) {
        installedItems.push(`script:${shortName}`);
      } else {
        logger.warn(`Sandbox (Daytona): script failed: ${shortName}`);
        failedItems.push(`script:${shortName}`);
      }
    }
  }

  const totalItems = (options.packages?.length ?? 0) + (options.installScripts?.length ?? 0);
  logger.info(`Sandbox (Daytona): installed ${installedItems.length}/${totalItems} agent items`);

  if (installedItems.length === 0 && totalItems > 0) {
    return { success: false, installed: [], error: `all items failed: ${failedItems.join(", ")}` };
  }

  return { success: true, installed: installedItems };
};
