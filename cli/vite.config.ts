import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
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

let daytonaSdkVersion = "0.0.0";
try {
  const candidates = [
    resolve(__dirname, "node_modules/@daytonaio/sdk/package.json"),
    resolve(__dirname, "../node_modules/@daytonaio/sdk/package.json")
  ];
  const packageJsonPath = candidates.find((candidate) => existsSync(candidate));
  if (packageJsonPath) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version?: string };
    if (packageJson.version) {
      daytonaSdkVersion = packageJson.version;
    }
  }
} catch {}

export default defineConfig({
  root: resolve(__dirname, "ui"),
  base: "/__tb/app/",
  plugins: [tailwindcss(), react()],
  customLogger: devProxy ? logger : undefined,
  define: {
    __DAYTONA_SDK_VERSION__: JSON.stringify(daytonaSdkVersion)
  },
  server: { port: 5000, ...(proxy ? { proxy } : {}) },
  build: {
    outDir: resolve(__dirname, "ui/dist"),
    emptyOutDir: true
  }
});
