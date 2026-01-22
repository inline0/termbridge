import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ViewSwitcher } from "./view-switcher";

describe("ViewSwitcher", () => {
  afterEach(() => {
    cleanup();
  });

  it("switches to preview view", () => {
    const onViewChange = vi.fn();
    render(<ViewSwitcher activeView="terminal" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to Preview" }));

    expect(onViewChange).toHaveBeenCalledWith("preview");
  });

  it("switches to terminal view", () => {
    const onViewChange = vi.fn();
    render(<ViewSwitcher activeView="preview" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to Terminal" }));

    expect(onViewChange).toHaveBeenCalledWith("terminal");
  });
});
