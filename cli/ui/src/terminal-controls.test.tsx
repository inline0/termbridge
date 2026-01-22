import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { MutableRefObject } from "react";
import type { ConnectionState, TerminalClient } from "./terminal-client";
import { TerminalControls } from "./terminal-controls";

describe("TerminalControls", () => {
  const baseTerminal = {
    id: "term-1",
    label: "Terminal 1",
    status: "running" as const,
    createdAt: "2024-01-01T00:00:00.000Z",
    source: "tmux" as const
  };

  const createClient = (overrides: Partial<TerminalClient> = {}): TerminalClient => ({
    sendControl: vi.fn(),
    sendInput: vi.fn(),
    sendScroll: vi.fn(),
    destroy: vi.fn(),
    getConnectionState: vi.fn<() => ConnectionState>(() => "connected"),
    onConnectionStateChange: vi.fn(() => () => undefined),
    scrollLines: vi.fn(),
    scrollPages: vi.fn(),
    scrollToTop: vi.fn(),
    scrollToBottom: vi.fn(),
    scrollToLine: vi.fn(),
    getScrollInfo: vi.fn(() => ({ viewportY: 0, baseY: 0, maxY: 0 })),
    onScroll: vi.fn(() => () => undefined),
    ...overrides
  });

  afterEach(() => {
    cleanup();
  });

  it("handles missing ResizeObserver when showing actions", async () => {
    const originalResizeObserver = window.ResizeObserver;
    try {
      // @ts-expect-error test coverage for missing ResizeObserver
      window.ResizeObserver = undefined;

      const clientRef = { current: null } as MutableRefObject<TerminalClient | null>;

      render(
        <TerminalControls
          clientRef={clientRef}
          terminals={[baseTerminal]}
          activeTerminalId="term-1"
          activeView="terminal"
          onViewChange={() => undefined}
          listState="ready"
          onSelectTerminal={() => undefined}
        />
      );

      fireEvent.click(screen.getByLabelText("Add"));

      expect(await screen.findByTestId("terminal-actions-scroll")).toBeInTheDocument();
    } finally {
      window.ResizeObserver = originalResizeObserver;
    }
  });

  it("routes scroll actions through tmux", () => {
    const client = createClient();
    const clientRef = { current: client } as MutableRefObject<TerminalClient | null>;
    const onScrollAction = vi.fn();

    render(
      <TerminalControls
        clientRef={clientRef}
        terminals={[baseTerminal]}
        activeTerminalId="term-1"
        activeTerminalSource="tmux"
        activeView="terminal"
        onViewChange={() => undefined}
        onScrollAction={onScrollAction}
        listState="ready"
        onSelectTerminal={() => undefined}
      />
    );

    fireEvent.click(screen.getByLabelText("Add"));
    fireEvent.click(screen.getByRole("button", { name: "Page Up" }));

    expect(onScrollAction).toHaveBeenCalledWith("pages", -1);
    expect(client.sendScroll).toHaveBeenCalledWith("pages", -1);
  });

  it("uses xterm scrollback when available", () => {
    const client = createClient({
      getScrollInfo: vi.fn(() => ({ viewportY: 0, baseY: 10, maxY: 10 }))
    });
    const clientRef = { current: client } as MutableRefObject<TerminalClient | null>;

    render(
      <TerminalControls
        clientRef={clientRef}
        terminals={[baseTerminal]}
        activeTerminalId="term-1"
        activeTerminalSource="mock"
        activeView="terminal"
        onViewChange={() => undefined}
        listState="ready"
        onSelectTerminal={() => undefined}
      />
    );

    fireEvent.click(screen.getByLabelText("Add"));
    fireEvent.click(screen.getByRole("button", { name: "Line Up" }));
    fireEvent.click(screen.getByRole("button", { name: "Page Down" }));

    expect(client.scrollLines).toHaveBeenCalledWith(-1);
    expect(client.scrollPages).toHaveBeenCalledWith(1);
  });

  it("falls back to scroll commands when no scrollback", () => {
    const client = createClient({
      getScrollInfo: vi.fn(() => ({ viewportY: 0, baseY: 0, maxY: 0 }))
    });
    const clientRef = { current: client } as MutableRefObject<TerminalClient | null>;

    render(
      <TerminalControls
        clientRef={clientRef}
        terminals={[baseTerminal]}
        activeTerminalId="term-1"
        activeTerminalSource="mock"
        activeView="terminal"
        onViewChange={() => undefined}
        listState="ready"
        onSelectTerminal={() => undefined}
      />
    );

    fireEvent.click(screen.getByLabelText("Add"));
    fireEvent.click(screen.getByRole("button", { name: "Line Up" }));

    expect(client.sendScroll).toHaveBeenCalledWith("lines", -1);
  });
});
