import { describe, expect, it } from "vitest";
import { TERMINAL_CONTROL_KEYS, TERMINAL_STATUS_STATES } from "./index";

describe("shared constants", () => {
  it("exports terminal control keys", () => {
    expect(TERMINAL_CONTROL_KEYS).toContain("ctrl_c");
    expect(TERMINAL_CONTROL_KEYS).toContain("left");
  });

  it("exports terminal status states", () => {
    expect(TERMINAL_STATUS_STATES).toEqual(["connected", "disconnected", "error"]);
  });
});
