import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const devProxy = process.env.TERMBRIDGE_DEV_PROXY;
const proxy = devProxy
  ? {
      "/api": { target: devProxy, changeOrigin: true },
      "/ws": { target: devProxy, ws: true },
      "/s": { target: devProxy, changeOrigin: true },
      "/healthz": { target: devProxy, changeOrigin: true }
    }
  : undefined;

export default defineConfig({
  root: resolve(__dirname, "ui"),
  base: "/app/",
  plugins: [react()],
  server: proxy ? { proxy } : undefined,
  build: {
    outDir: resolve(__dirname, "ui/dist"),
    emptyOutDir: true
  }
});
