import { beforeEach, describe, expect, it, vi } from "vitest"
import { startCommand } from "./start.ts"

const packing = vi.hoisted(() => ({
  cleanup: vi.fn(),
  packLocalCli: vi.fn(),
}))
vi.mock("./local-package.ts", () => ({ packLocalCli: packing.packLocalCli }))

describe("sandbox CLI archive lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    packing.packLocalCli.mockReturnValue({
      path: "/tmp/local-cli.tgz",
      cleanup: packing.cleanup,
    })
  })

  const options = {
    killOnExit: false,
    noQr: true,
    backend: "sandbox-daytona" as const,
    sandboxDirect: true,
    sandboxRepo: "https://example.com/project.git",
  }
  const makeDeps = () => {
    const start = vi.fn(async () => ({
      localUrl: "https://sandbox.example",
      publicUrl: "https://sandbox.example",
      token: "token",
      stop: vi.fn(async () => undefined),
    }))
    return {
      start,
      deps: {
        createSandboxDaytonaProvider: () => ({ start }),
        process: { on: vi.fn() } as unknown as NodeJS.Process,
        logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      },
    }
  }

  it("uploads the packed archive before removing it", async () => {
    const { start, deps } = makeDeps()
    await startCommand(options, deps)
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ localCliPackPath: "/tmp/local-cli.tgz" })
    )
    expect(packing.cleanup).toHaveBeenCalledOnce()
    expect(start.mock.invocationCallOrder[0]).toBeLessThan(
      packing.cleanup.mock.invocationCallOrder[0]
    )
  })

  it("removes the archive when sandbox startup rejects", async () => {
    const { start, deps } = makeDeps()
    start.mockRejectedValueOnce(new Error("sandbox unavailable"))
    await expect(startCommand(options, deps)).rejects.toThrow(
      "sandbox unavailable"
    )
    expect(packing.cleanup).toHaveBeenCalledOnce()
  })
})
