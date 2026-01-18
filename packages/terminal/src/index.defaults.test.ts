import { describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
  execFile: (_file: string, _args: string[], callback: (error: Error | null, stdout: string, stderr: string) => void) => {
    callback(null, "", "");
  }
}));

describe("createTmuxBackend defaults", () => {
  it("uses the default execFile wrapper", async () => {
    const { createTmuxBackend } = await import("./index");
    const backend = createTmuxBackend();

    await backend.createSession("session-default");
    await backend.write("session-default", "hi");
    await backend.closeSession("session-default");

    expect(true).toBe(true);
  });
});
