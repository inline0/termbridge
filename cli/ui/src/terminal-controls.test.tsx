import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { MutableRefObject } from "react";
import type { TerminalClient } from "./terminal-client";
import { TerminalControls } from "./terminal-controls";

describe("TerminalControls", () => {
  it("handles missing ResizeObserver when showing actions", async () => {
    const originalResizeObserver = window.ResizeObserver;
    try {
      // @ts-expect-error test coverage for missing ResizeObserver
      window.ResizeObserver = undefined;

      const clientRef = { current: null } as MutableRefObject<TerminalClient | null>;

      render(
        <TerminalControls
          clientRef={clientRef}
          terminals={[
            {
              id: "term-1",
              label: "Terminal 1",
              status: "running",
              createdAt: "2024-01-01T00:00:00.000Z",
              source: "tmux"
            }
          ]}
          activeTerminalId="term-1"
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
});
