import { fileURLToPath } from "node:url"
/** Absolute paths for source-checkout development tools. */
export const root = fileURLToPath(new URL("../../", import.meta.url))
