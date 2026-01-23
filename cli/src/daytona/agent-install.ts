import type { Sandbox } from "@daytonaio/sdk";
import type { Logger } from "../server/server";
import type { AgentInstallOptions } from "../sandbox/server-provider";

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
  logger.info(`Daytona: agent install options: enabled=${options?.enabled}, packages=${options?.packages?.join(",") ?? "none"}, scripts=${hasScripts ? options?.installScripts?.length : 0}`);

  if (!options?.enabled || (!hasPackages && !hasScripts)) {
    return { success: true, installed: [] };
  }

  logger.info("Daytona: installing coding agents");

  const homeResult = await sandbox.process.executeCommand("printf $HOME");
  const home = homeResult.exitCode === 0 ? homeResult.result.trim() : "/home/daytona";
  const localPrefix = `${home}/.local`;

  const installedItems: string[] = [];
  const failedItems: string[] = [];

  if (hasPackages) {
    const npmCheck = await sandbox.process.executeCommand("command -v npm");
    if (npmCheck.exitCode !== 0) {
      logger.warn("Daytona: npm not available; skipping npm packages");
    } else {
      await sandbox.process.executeCommand(`mkdir -p ${localPrefix}`);

      for (const pkg of options.packages) {
        const installCmd = `npm install -g --prefix ${localPrefix} ${pkg}`;
        logger.info(`Daytona: installing ${pkg}`);

        for (let attempt = 1; attempt <= 2; attempt += 1) {
          const install = await sandbox.process.executeCommand(installCmd, undefined, undefined, 180);
          if (install.exitCode === 0) {
            logger.info(`Daytona: installed ${pkg}`);
            installedItems.push(pkg);
            break;
          }
          if (attempt === 1) {
            logger.warn(`Daytona: ${pkg} install attempt 1 failed; retrying`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            logger.warn(`Daytona: ${pkg} install failed: ${install.result?.slice(-200) ?? "unknown error"}`);
            failedItems.push(pkg);
          }
        }
      }
    }
  }

  if (hasScripts) {
    for (const script of options.installScripts) {
      const shortName = script.split("/").pop()!.split("|")[0].trim() || script.slice(0, 30);
      logger.info(`Daytona: running install script: ${shortName}`);

      // For curl|bash scripts, download first then run for better error capture
      if (script.includes("curl") && script.includes("|")) {
        const urlMatch = script.match(/curl\s+[^\s]+\s+(https?:\/\/[^\s|]+)/);
        if (urlMatch) {
          const url = urlMatch[1];
          const scriptPath = `/tmp/install-${Date.now()}.sh`;
          logger.info(`Daytona: downloading script from ${url}`);

          const download = await sandbox.process.executeCommand(
            `curl -fsSL ${url} -o ${scriptPath} && chmod +x ${scriptPath}`,
            undefined,
            undefined,
            60
          );

          if (download.exitCode !== 0) {
            logger.warn(`Daytona: failed to download script: ${download.result?.slice(-200) ?? "unknown"}`);
            failedItems.push(`script:${shortName}`);
            continue;
          }

          logger.info(`Daytona: running downloaded script`);
          const result = await sandbox.process.executeCommand(
            `bash -x ${scriptPath} 2>&1`,
            undefined,
            undefined,
            180
          );
          logger.info(`Daytona: script exit code: ${result.exitCode}, output (last 800): ${result.result?.slice(-800) ?? "none"}`);

          if (result.exitCode === 0) {
            const verifyResult = await sandbox.process.executeCommand("ls -la ~/.opencode/bin 2>&1 || echo 'opencode bin not found'");
            logger.info(`Daytona: opencode bin after install: ${verifyResult.result?.slice(-300) ?? "none"}`);
            installedItems.push(`script:${shortName}`);
          } else {
            logger.warn(`Daytona: script failed: ${shortName}`);
            failedItems.push(`script:${shortName}`);
          }
          continue;
        }
      }

      // Fallback for other scripts
      const result = await sandbox.process.executeCommand(script, undefined, undefined, 180);
      if (result.exitCode === 0) {
        logger.info(`Daytona: script succeeded: ${shortName}`);
        installedItems.push(`script:${shortName}`);
      } else {
        logger.warn(`Daytona: script failed: ${shortName} - ${result.result?.slice(-200) ?? "unknown error"}`);
        failedItems.push(`script:${shortName}`);
      }
    }
  }

  const totalItems = (options.packages?.length ?? 0) + (options.installScripts?.length ?? 0);
  logger.info(`Daytona: installed ${installedItems.length}/${totalItems} agent items`);

  if (installedItems.length === 0 && totalItems > 0) {
    return { success: false, installed: [], error: `all items failed: ${failedItems.join(", ")}` };
  }

  return { success: true, installed: installedItems };
};
