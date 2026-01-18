import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: resolve(__dirname, "ui"),
  base: "/app/",
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "ui/dist"),
    emptyOutDir: true
  }
});
