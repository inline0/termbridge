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
  console.log("Listing all sandboxes...");

  let page = 1;
  let totalPages = 1;
  let deleted = 0;
  let failed = 0;
  const allSandboxes = [];

  while (page <= totalPages) {
    const result = await daytona.list(undefined, page, 100);
    totalPages = result.totalPages || 1;
    allSandboxes.push(...result.items);
    page++;
  }

  if (allSandboxes.length === 0) {
    console.log("No sandboxes found.");
    return;
  }

  console.log(`Found ${allSandboxes.length} sandbox(es):\n`);

  for (const sandbox of allSandboxes) {
    const name = sandbox.name || sandbox.id;
    console.log(`  - ${name} (${sandbox.state})`);
  }

  console.log("\nDeleting all sandboxes...\n");

  for (const sandbox of allSandboxes) {
    const name = sandbox.name || sandbox.id;
    try {
      console.log(`Deleting ${name}...`);
      await daytona.delete(sandbox);
      deleted++;
      console.log(`  ✓ deleted`);
    } catch (err) {
      failed++;
      console.log(`  ✗ failed: ${err.message}`);
    }
  }

  console.log(`\nDone. Deleted: ${deleted}, Failed: ${failed}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
