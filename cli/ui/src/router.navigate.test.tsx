import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";

vi.mock("./terminal-page", () => ({
  TerminalPage: ({
    terminalId,
    onSelectTerminal
  }: {
    terminalId?: string | null;
    onSelectTerminal?: (terminalId: string) => void;
  }) => (
    <div>
      <div data-testid="terminal-id">{terminalId ?? "none"}</div>
      <button type="button" onClick={() => onSelectTerminal?.("term-2")}>
        Select terminal
      </button>
    </div>
  )
}));

describe("router navigation", () => {
  afterEach(() => {
    cleanup();
  });

  const renderRouter = async () => {
    const { router } = await import("./router");
    render(<RouterProvider router={router} />);
    return router;
  };

  it("navigates from the index route when a terminal is selected", async () => {
    const router = await renderRouter();
    await router.navigate({ to: "/" });

    fireEvent.click(screen.getByRole("button", { name: "Select terminal" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/app/terminal/term-2");
    });
  });

  it("navigates from the terminal route when another terminal is selected", async () => {
    const router = await renderRouter();
    await router.navigate({ to: "/terminal/$terminalId", params: { terminalId: "term-1" } });

    fireEvent.click(screen.getByRole("button", { name: "Select terminal" }));

    await waitFor(() => {
      expect(window.location.pathname).toBe("/app/terminal/term-2");
    });
  });
});
