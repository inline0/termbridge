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
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    if (typeof window !== "undefined") {
      window.fetch = originalFetch;
    }
    cleanup();
    vi.mocked(createTerminalClient).mockClear();
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
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ terminals: [] })
    })) as unknown as typeof fetch;
    global.fetch = fetchMock;
    if (typeof window !== "undefined") {
      window.fetch = fetchMock;
    }

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("No terminals available");
    });
  });

  it("renders the terminal route", async () => {
    window.history.pushState({}, "", "/app/terminal/term-1");
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ terminals: [makeTerminal("term-1")] })
    })) as unknown as typeof fetch;
    global.fetch = fetchMock;
    if (typeof window !== "undefined") {
      window.fetch = fetchMock;
    }

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(vi.mocked(createTerminalClient)).toHaveBeenCalled();
    });
  });
});
