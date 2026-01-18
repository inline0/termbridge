import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts"],
  format: ["esm"],
  platform: "node",
  target: "node18",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  noExternal: ["@termbridge/shared", "@termbridge/terminal", "@termbridge/tunnel"],
  splitting: false,
  banner: {
    js: "#!/usr/bin/env node"
  }
});
