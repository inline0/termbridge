import { rm } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const targets = [
  resolve(rootDir, "packages/cli/node_modules/.vite"),
  resolve(rootDir, "packages/cli/.vite"),
  resolve(rootDir, "node_modules/.vite"),
]

await Promise.all(
  targets.map((target) => rm(target, { recursive: true, force: true }))
)
