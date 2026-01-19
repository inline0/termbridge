import { describe, expect, it } from "vitest";
import * as ui from "./index";

describe("ui index exports", () => {
  it("re-exports the public surface", () => {
    expect(typeof ui.Button).toBe("function");
    expect(typeof ui.Input).toBe("function");
    expect(typeof ui.Textarea).toBe("function");
    expect(typeof ui.getSystemTheme).toBe("function");
    expect(typeof ui.useTheme).toBe("function");
    expect(typeof ui.cn).toBe("function");
  });
});
