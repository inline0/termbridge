import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, createLogger } from "vite"

const devProxy = process.env.TERMBRIDGE_DEV_PROXY

const logger = createLogger()
const originalWarn = logger.warn.bind(logger)
const originalError = logger.error.bind(logger)
logger.warn = (msg, options) => {
  if (msg.includes("ws proxy error")) return
  originalWarn(msg, options)
}
logger.error = (msg, options) => {
  if (msg.includes("ws proxy error")) return
  originalError(msg, options)
}

const proxy = devProxy
  ? {
      "/__tb": { target: devProxy, ws: true },
      "^/(?!__tb/app)": {
        target: devProxy,
        bypass: (req: { url?: string }) => {
          const path = req.url ?? "/"
          if (
            path.startsWith("/__tb/app") ||
            path.startsWith("/node_modules/.vite") ||
            path.startsWith("/src/") ||
            path === "/@vite/client" ||
            path.startsWith("/@vite/")
          ) {
            return path
          }
          return undefined
        },
      },
    }
  : undefined

let daytonaSdkVersion = "0.0.0"
try {
  const require = createRequire(import.meta.url)
  const packageJson = JSON.parse(
    readFileSync(require.resolve("@daytonaio/sdk/package.json"), "utf8")
  ) as { version?: string }
  if (packageJson.version) daytonaSdkVersion = packageJson.version
} catch {}

export default defineConfig({
  root: resolve(import.meta.dirname, "ui"),
  base: "/__tb/app/",
  plugins: [tailwindcss(), react()],
  customLogger: devProxy ? logger : undefined,
  define: {
    __DAYTONA_SDK_VERSION__: JSON.stringify(daytonaSdkVersion),
  },
  server: { port: 5000, ...(proxy ? { proxy } : {}) },
  build: {
    outDir: resolve(import.meta.dirname, "ui/dist"),
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "terminal", test: /node_modules\/@xterm\// },
            {
              name: "react",
              test: /node_modules\/(react|react-dom|scheduler)\//,
            },
          ],
        },
      },
    },
  },
})
