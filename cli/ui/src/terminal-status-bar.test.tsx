import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TerminalStatusBar } from "./terminal-status-bar";

describe("TerminalStatusBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("hides scroll status when no scrollback", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        scrollInfo={{ viewportY: 0, baseY: 0, maxY: 0 }}
      />
    );

    expect(screen.queryByTestId("scroll-status")).toBeNull();
    expect(screen.getByTestId("connection-status")).toHaveAttribute("data-state", "connected");
  });

  it("shows scroll status when scrollback exists", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        scrollInfo={{ viewportY: 5, baseY: 10, maxY: 10 }}
      />
    );

    expect(screen.getByTestId("scroll-status")).toHaveTextContent("Scroll");
    expect(screen.getByTestId("scroll-status")).toHaveTextContent("5 / 10");
  });

  it("hides scroll status when at bottom", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        scrollInfo={{ viewportY: 10, baseY: 10, maxY: 10 }}
      />
    );

    expect(screen.queryByTestId("scroll-status")).toBeNull();
  });
});
