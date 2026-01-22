import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SheetOptionButton, SheetTriggerButton } from "./selection-sheet";

describe("selection-sheet", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders trigger button and forwards clicks", () => {
    const onClick = vi.fn();
    render(
      <SheetTriggerButton
        label="Views"
        icon={<span aria-hidden="true">icon</span>}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Views" }));

    expect(onClick).toHaveBeenCalled();
  });

  it("renders option button details and triggers callbacks", () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();

    render(
      <SheetOptionButton
        label="Terminal"
        description="Run commands"
        ariaLabel="Select Terminal"
        onClick={onClick}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Select Terminal" }));

    expect(onClick).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByText("Run commands")).toBeInTheDocument();
  });

  it("falls back to label and omits description when not provided", () => {
    render(<SheetOptionButton label="Preview" active={false} />);

    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    expect(screen.queryByText("Run commands")).toBeNull();
  });
});
