import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

vi.mock("./terminal-client", () => ({
  createTerminalClient: vi.fn(() => ({
    destroy: vi.fn(),
    sendControl: vi.fn(),
    sendInput: vi.fn()
  }))
}));

import { createTerminalClient } from "./terminal-client";

describe("router", () => {
  afterEach(() => {
    cleanup();
  });

  const makeTerminal = (id: string) => ({
    id,
    label: `Terminal ${id}`,
    status: "running",
    createdAt: "2024-01-01T00:00:00.000Z",
    source: "tmux"
  });

  it("renders the index route", async () => {
    window.history.pushState({}, "", "/app/");
    const response = new Response(JSON.stringify({ terminals: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("No terminals available");
    });
  });

  it("renders the terminal route", async () => {
    window.history.pushState({}, "", "/app/terminal/term-1");
    const response = new Response(JSON.stringify({ terminals: [makeTerminal("term-1")] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(vi.mocked(createTerminalClient)).toHaveBeenCalled();
    });
  });
});
