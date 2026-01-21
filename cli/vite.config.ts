import { resolve } from "node:path";
import { defineConfig, createLogger } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const devProxy = process.env.TERMBRIDGE_DEV_PROXY;

const logger = createLogger();
const originalWarn = logger.warn.bind(logger);
const originalError = logger.error.bind(logger);
logger.warn = (msg, options) => {
  if (msg.includes("ws proxy error")) return;
  originalWarn(msg, options);
};
logger.error = (msg, options) => {
  if (msg.includes("ws proxy error")) return;
  originalError(msg, options);
};

const proxy = devProxy
  ? {
      "/__tb": { target: devProxy, ws: true },
      "^/(?!__tb/app)": {
        target: devProxy,
        bypass: (req: { url?: string }) => {
          const path = req.url ?? "/";
          if (
            path.startsWith("/__tb/app") ||
            path.startsWith("/node_modules/.vite") ||
            path.startsWith("/src/") ||
            path === "/@vite/client" ||
            path.startsWith("/@vite/")
          ) {
            return path;
          }
          return undefined;
        }
      }
    }
  : undefined;

export default defineConfig({
  root: resolve(__dirname, "ui"),
  base: "/__tb/app/",
  plugins: [tailwindcss(), react()],
  customLogger: devProxy ? logger : undefined,
  server: { port: 5000, ...(proxy ? { proxy } : {}) },
  build: {
    outDir: resolve(__dirname, "ui/dist"),
    emptyOutDir: true
  }
});
