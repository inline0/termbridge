import { describe, expect, it } from "vitest";
import { createTerminalRegistry } from "./terminal-registry";

describe("createTerminalRegistry", () => {
  it("adds, lists, and removes terminals", () => {
    const registry = createTerminalRegistry();
    const record = registry.add("session-1", "Session 1", "tmux");

    const list = registry.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(record.id);
    expect(list[0]).not.toHaveProperty("sessionName");

    const stored = registry.get(record.id);
    expect(stored?.sessionName).toBe("session-1");

    registry.remove(record.id);
    expect(registry.list()).toHaveLength(0);
  });

  it("exposes session names", () => {
    const registry = createTerminalRegistry();
    registry.add("a", "A", "tmux");
    registry.add("b", "B", "tmux");

    expect(registry.getSessionNames()).toEqual(["a", "b"]);
  });
});
