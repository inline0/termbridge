import type { Sandbox } from "@daytonaio/sdk";

export type SandboxLike = Pick<Sandbox, "process">;

export const getSandboxPathPrefix = async (sandbox: SandboxLike) => {
  const homeResult = await sandbox.process.executeCommand("printf $HOME");
  const home = homeResult.exitCode === 0 ? homeResult.result.trim() : "/home/daytona";
  const localBin = `${home}/.local/bin`;
  const npmBin = await sandbox.process.executeCommand("npm bin -g");
  const globalBin = npmBin.exitCode === 0 ? npmBin.result.trim() : "";

  const paths = [localBin, globalBin].filter(Boolean).join(":");
  return paths ? `PATH="${paths}:$PATH"` : "";
};

export const runSandboxCommand = async (
  sandbox: SandboxLike,
  command: string,
  label: string,
  timeoutSec = 120,
  pathPrefix = "",
  log?: (message: string) => void
) => {
  log?.(`run ${label}`);
  const prefixedCommand = pathPrefix ? `${pathPrefix} ${command}` : command;
  const result = await sandbox.process.executeCommand(prefixedCommand, undefined, undefined, timeoutSec);
  if (result.exitCode !== 0) {
    const output = `${result.result ?? ""}`.slice(0, 400);
    throw new Error(`${label} failed (${result.exitCode}): ${output}`);
  }
  return `${result.result ?? ""}`;
};

export type AgentTestResult = {
  available: boolean;
  passed?: boolean;
  error?: string;
};

export type AgentTestOptions = {
  pathPrefix?: string;
  log?: (message: string) => void;
  requireClaude?: boolean;
  requireCodex?: boolean;
  requireOpencode?: boolean;
};

export const testAgentCLIs = async (
  sandbox: SandboxLike,
  options: AgentTestOptions = {}
): Promise<Record<string, AgentTestResult>> => {
  const { pathPrefix = "", log, requireClaude = true, requireCodex = true, requireOpencode = true } = options;
  const results: Record<string, AgentTestResult> = {};

  const checkAvailable = async (name: string) => {
    const check = await sandbox.process.executeCommand(
      `${pathPrefix ? `${pathPrefix} ` : ""}command -v ${name}`
    );
    return check.exitCode === 0;
  };

  const claudeAvailable = await checkAvailable("claude");
  const codexAvailable = await checkAvailable("codex");
  const opencodeAvailable = await checkAvailable("opencode");

  log?.(`claude: ${claudeAvailable}, codex: ${codexAvailable}, opencode: ${opencodeAvailable}`);

  if (requireClaude && !claudeAvailable) {
    throw new Error("Required agent CLI 'claude' not available");
  }
  if (requireCodex && !codexAvailable) {
    throw new Error("Required agent CLI 'codex' not available");
  }
  if (requireOpencode && !opencodeAvailable) {
    throw new Error("Required agent CLI 'opencode' not available");
  }

  if (claudeAvailable) {
    results.claude = { available: true };
    try {
      const output = await runSandboxCommand(
        sandbox,
        'claude -p "Respond with exactly OK." --no-session-persistence',
        "claude",
        180,
        pathPrefix,
        log
      );
      results.claude.passed = /ok/i.test(output);
      log?.("claude passed");
    } catch (error) {
      results.claude.passed = false;
      results.claude.error = error instanceof Error ? error.message : String(error);
    }
  }

  if (codexAvailable) {
    results.codex = { available: true };
    try {
      const output = await runSandboxCommand(
        sandbox,
        'codex exec --full-auto --skip-git-repo-check "Respond with exactly OK."',
        "codex",
        180,
        pathPrefix,
        log
      );
      results.codex.passed = /ok/i.test(output);
      log?.("codex passed");
    } catch (error) {
      results.codex.passed = false;
      results.codex.error = error instanceof Error ? error.message : String(error);
    }
  }

  if (opencodeAvailable) {
    results.opencode = { available: true };
    try {
      const output = await runSandboxCommand(
        sandbox,
        'opencode run "Respond with exactly OK."',
        "opencode",
        180,
        pathPrefix,
        log
      );
      results.opencode.passed = /ok/i.test(output);
      log?.("opencode passed");
    } catch (error) {
      results.opencode.passed = false;
      results.opencode.error = error instanceof Error ? error.message : String(error);
    }
  } else {
    results.opencode = { available: false };
    // If we got here without throwing, requireOpencode was false
    log?.("opencode not available (not required)");
  }

  return results;
};
