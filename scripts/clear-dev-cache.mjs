import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  resolve(rootDir, "cli/node_modules/.vite"),
  resolve(rootDir, "cli/.vite"),
  resolve(rootDir, "node_modules/.vite")
];

await Promise.all(targets.map((target) => rm(target, { recursive: true, force: true })));
