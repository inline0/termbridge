import { describe, expect, it } from "vitest";
import { isValidElement } from "react";
import { App } from "./app";

describe("App", () => {
  it("returns a valid element", () => {
    const element = App();
    expect(isValidElement(element)).toBe(true);
  });
});
