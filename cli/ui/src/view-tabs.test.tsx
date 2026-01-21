import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ViewTabs } from "./view-tabs";

describe("ViewTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders terminal and preview tabs", () => {
    render(<ViewTabs activeView="terminal" onViewChange={() => undefined} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Terminal" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Preview" })).toBeInTheDocument();
  });

  it("shows terminal tab as selected when activeView is terminal", () => {
    render(<ViewTabs activeView="terminal" onViewChange={() => undefined} />);

    expect(screen.getByRole("tab", { name: "Terminal" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "false");
  });

  it("shows preview tab as selected when activeView is preview", () => {
    render(<ViewTabs activeView="preview" onViewChange={() => undefined} />);

    expect(screen.getByRole("tab", { name: "Terminal" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("aria-selected", "true");
  });

  it("calls onViewChange with terminal when Terminal tab is clicked", () => {
    const onViewChange = vi.fn();
    render(<ViewTabs activeView="preview" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Terminal" }));

    expect(onViewChange).toHaveBeenCalledWith("terminal");
  });

  it("calls onViewChange with preview when Preview tab is clicked", () => {
    const onViewChange = vi.fn();
    render(<ViewTabs activeView="terminal" onViewChange={onViewChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Preview" }));

    expect(onViewChange).toHaveBeenCalledWith("preview");
  });
});
