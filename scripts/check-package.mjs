import assert from "node:assert/strict"
import { execFileSync, spawn } from "node:child_process"
import { once } from "node:events"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { createServer } from "node:net"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { setTimeout as delay } from "node:timers/promises"

const directory = await mkdtemp(join(tmpdir(), "termbridge-package-"))
const env = { ...process.env, TMUX_TMPDIR: directory, SHELL: "/bin/sh" }
for (const key of Object.keys(env)) {
  if (key.startsWith("TERMBRIDGE_") || key === "TMUX") delete env[key]
}
env.TERMBRIDGE_INSECURE_COOKIE = "1"
let child
try {
  const tarball = process.argv[2]
    ? resolve(process.argv[2])
    : join(directory, "termbridge.tgz")
  if (!process.argv[2]) {
    execFileSync("pnpm", ["--filter", "termbridge", "pack", "--out", tarball], {
      stdio: "inherit",
    })
  }
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify({
      private: true,
      allowScripts: { "node-pty": true, protobufjs: true },
    })
  )
  execFileSync("npm", ["install", "--no-audit", "--no-fund", tarball], {
    cwd: directory,
    stdio: "inherit",
  })
  const installed = join(directory, "node_modules", "termbridge")
  const manifest = JSON.parse(
    await readFile(join(installed, "package.json"), "utf8")
  )
  assert.equal(manifest.name, "termbridge")
  for (const version of Object.values(manifest.dependencies)) {
    assert(!/^(workspace|catalog):/.test(version))
  }
  const bin = join(installed, "dist", "bin.js")
  const help = execFileSync(process.execPath, [bin, "--help"], {
    encoding: "utf8",
    env,
  })
  assert.match(help, /termbridge/)
  const listener = createServer()
  listener.listen(0, "127.0.0.1")
  await once(listener, "listening")
  const address = listener.address()
  assert(address && typeof address === "object")
  const port = address.port
  await new Promise((resolveClose) => listener.close(resolveClose))
  const base = `http://127.0.0.1:${port}`
  child = spawn(
    process.execPath,
    [
      bin,
      "--no-tunnel",
      "--public-url",
      base,
      "--port",
      String(port),
      "--session",
      "package-smoke",
      "--kill-on-exit",
      "--no-qr",
    ],
    {
      cwd: directory,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    }
  )
  let output = ""
  child.stdout.on("data", (data) => {
    output += data.toString()
  })
  let errors = ""
  child.stderr.on("data", (data) => {
    errors += data.toString()
  })
  const deadline = Date.now() + 15_000
  let ready = false
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Packed CLI exited: ${errors}`)
    try {
      ready = (await fetch(`${base}/__tb/healthz`)).ok
      if (ready && /http:\/\/127\.0\.0\.1:\d+\/__tb\/s\/[^\s]+/.test(output))
        break
    } catch {}
    await delay(100)
  }
  assert(ready, "Packed CLI did not become ready")
  const share = output.match(/http:\/\/127\.0\.0\.1:\d+\/__tb\/s\/[^\s]+/)?.[0]
  assert(share, "Packed CLI did not print a share URL")
  const redeemed = await fetch(share, { redirect: "manual" })
  assert.equal(redeemed.status, 302)
  const cookie = redeemed.headers.get("set-cookie")?.split(";")[0]
  assert(cookie, "Share redemption did not create a session")
  const headers = { cookie }
  const page = await fetch(`${base}/__tb/app`, { headers })
  assert.equal(page.status, 200)
  const html = await page.text()
  assert.match(html, /<div id="root"><\/div>/)
  const assets = [
    ...html.matchAll(/(?:src|href)="(\/__tb\/app\/assets\/[^"]+)"/g),
  ]
  assert(assets.length > 0, "Packed UI has no asset references")
  for (const [, path] of assets) {
    const asset = await fetch(`${base}${path}`, { headers })
    assert.equal(asset.status, 200)
    assert.match(
      asset.headers.get("content-type") ?? "",
      path.endsWith(".css") ? /text\/css/ : /javascript/
    )
  }
  const terminals = await fetch(`${base}/__tb/api/terminals`, { headers })
  assert.equal(terminals.status, 200)
  assert.equal((await terminals.json()).terminals.length, 1)
  console.log(
    `Packed CLI passed on ${process.version}: help, startup, auth, UI, tmux`
  )
} finally {
  if (child?.exitCode === null && child.signalCode === null) {
    const closed = once(child, "close")
    child.kill("SIGINT")
    const force = setTimeout(() => child.kill("SIGKILL"), 5_000)
    try {
      await closed
    } finally {
      clearTimeout(force)
    }
  }
  try {
    execFileSync("tmux", ["kill-server"], { env, stdio: "ignore" })
  } catch {}
  await rm(directory, { recursive: true, force: true })
}
