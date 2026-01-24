#!/usr/bin/env node

import { Daytona } from "@daytonaio/sdk";
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const testAppDir = resolve(__dirname, "../../termbridge-test-app");

// Load env from test app
config({ path: resolve(testAppDir, ".env") });

const apiKey = process.env.TERMBRIDGE_DAYTONA_API_KEY;
const apiUrl = process.env.TERMBRIDGE_DAYTONA_API_URL;

if (!apiKey) {
  console.error("Missing TERMBRIDGE_DAYTONA_API_KEY");
  process.exit(1);
}

const daytona = new Daytona({ apiKey, apiUrl });

async function main() {
  const sandboxName = `debug-opencode-${Date.now()}`;
  console.log(`Creating sandbox: ${sandboxName}`);

  const sandbox = await daytona.create({ name: sandboxName, public: true });
  await sandbox.start();

  try {
    const homeResult = await sandbox.process.executeCommand("printf $HOME");
    const home = homeResult.result?.trim() || "/home/daytona";
    console.log(`Home: ${home}`);

    // Install all 3 agents via npm with --prefix
    console.log("\n--- Installing agents via npm ---");
    const localPrefix = `${home}/.local`;

    for (const pkg of ["@anthropic-ai/claude-code", "@openai/codex", "opencode-ai"]) {
      console.log(`Installing ${pkg}...`);
      const install = await sandbox.process.executeCommand(
        `npm install -g --prefix ${localPrefix} ${pkg} 2>&1`,
        undefined,
        undefined,
        180
      );
      console.log(`  Exit: ${install.exitCode}`);
      if (install.exitCode !== 0) {
        console.log(`  Error: ${install.result?.slice(-200)}`);
      }
    }

    // Check PATH
    console.log("\n--- Checking binaries ---");
    const pathPrefix = `PATH="${home}/.local/bin:$PATH"`;

    for (const bin of ["claude", "codex", "opencode"]) {
      const check = await sandbox.process.executeCommand(`${pathPrefix} command -v ${bin} || echo "not found"`);
      console.log(`${bin}: ${check.result?.trim()}`);
    }

    // Try running opencode
    console.log("\n--- Testing opencode ---");
    const test = await sandbox.process.executeCommand(
      `${pathPrefix} opencode --version 2>&1 || echo "failed"`,
      undefined,
      undefined,
      30
    );
    console.log(`opencode --version: ${test.result?.trim()}`);

  } finally {
    console.log("\n--- Cleanup ---");
    await sandbox.stop();
    await daytona.delete(sandbox);
    console.log("Sandbox deleted");
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
