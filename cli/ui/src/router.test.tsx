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

describe("router", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the terminal route", async () => {
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
});
