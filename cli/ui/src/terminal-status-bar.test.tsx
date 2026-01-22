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
        sessionLabel="term-1"
        scrollInfo={{ viewportY: 0, baseY: 0, maxY: 0 }}
      />
    );

    expect(screen.queryByTestId("scroll-status")).toBeNull();
    expect(screen.getByTestId("session-status")).toHaveTextContent("term-1");
    expect(screen.getByTestId("connection-status")).toHaveAttribute("data-state", "connected");
  });

  it("shows scroll status when scrollback exists", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        sessionLabel="term-1"
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
        sessionLabel="term-1"
        scrollInfo={{ viewportY: 10, baseY: 10, maxY: 10 }}
      />
    );

    expect(screen.queryByTestId("scroll-status")).toBeNull();
  });

  it("renders as a static bar when requested", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        sessionLabel="term-1"
        scrollInfo={{ viewportY: 2, baseY: 5, maxY: 10 }}
        position="static"
      />
    );

    const container = screen.getByTestId("connection-status").parentElement;
    expect(container).toHaveClass("relative");
    expect(container).not.toHaveClass("fixed");
  });

  it("uses the scroll override when provided", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        sessionLabel="term-1"
        scrollInfo={{ viewportY: 0, baseY: 0, maxY: 0 }}
        scrollOverride={{ label: "2p", show: true }}
      />
    );

    expect(screen.getByTestId("scroll-status")).toHaveTextContent("2p");
  });

  it("hides scroll when override disables it", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        sessionLabel="term-1"
        scrollInfo={{ viewportY: 5, baseY: 10, maxY: 10 }}
        scrollOverride={{ label: "1l", show: false }}
      />
    );

    expect(screen.queryByTestId("scroll-status")).toBeNull();
  });

  it("hides scroll status when disabled", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        sessionLabel="term-1"
        showScroll={false}
        scrollInfo={{ viewportY: 5, baseY: 10, maxY: 10 }}
      />
    );

    expect(screen.queryByTestId("scroll-status")).toBeNull();
  });

  it("falls back to a generic session label when missing", () => {
    render(
      <TerminalStatusBar
        connectionState="connected"
        hasTerminal
        scrollInfo={{ viewportY: 0, baseY: 0, maxY: 0 }}
      />
    );

    expect(screen.getByTestId("session-status")).toHaveTextContent("Session");
  });

  it("shows no session when terminal is unavailable", () => {
    render(
      <TerminalStatusBar
        connectionState="disconnected"
        hasTerminal={false}
        scrollInfo={{ viewportY: 0, baseY: 0, maxY: 0 }}
      />
    );

    expect(screen.getByTestId("session-status")).toHaveTextContent("No session");
    expect(screen.getByTestId("connection-status")).toHaveTextContent("No session");
  });
});
