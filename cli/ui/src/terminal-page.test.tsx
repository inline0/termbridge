import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { TerminalPage } from "./terminal-page";

vi.mock("./terminal-client", () => ({
  createTerminalClient: vi.fn()
}));

import { createTerminalClient } from "./terminal-client";

describe("TerminalPage", () => {
  const originalFetch = global.fetch;
  const createTerminalClientMock = vi.mocked(createTerminalClient);

  beforeEach(() => {
    createTerminalClientMock.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  it("shows loading state", async () => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;

    render(<TerminalPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading terminal");
  });

  it("handles empty lists", async () => {
    const response = new Response(JSON.stringify({ terminals: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    render(<TerminalPage />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("No terminals available");
    });
  });

  it("handles errors", async () => {
    const response = new Response("", { status: 500 });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    render(<TerminalPage />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Unable to load terminals");
    });
  });

  it("creates the terminal client for the first session", async () => {
    const destroy = vi.fn();
    createTerminalClientMock.mockReturnValue({ destroy, sendControl: vi.fn() });

    const response = new Response(JSON.stringify({ terminals: [{ id: "term-1" }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    global.fetch = vi.fn(async () => response) as unknown as typeof fetch;

    const { unmount } = render(<TerminalPage />);

    await waitFor(() => {
      expect(createTerminalClientMock).toHaveBeenCalled();
    });

    unmount();
    expect(destroy).toHaveBeenCalled();
  });

  it("avoids state updates after unmount", async () => {
    let resolveFetch: (value: Response) => void = () => undefined;

    global.fetch = vi.fn(() =>
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    ) as typeof fetch;

    const { unmount } = render(<TerminalPage />);
    unmount();

    resolveFetch({
      ok: true,
      json: async () => ({ terminals: [{ id: "term-1" }] })
    } as Response);

    await Promise.resolve();

    expect(createTerminalClientMock).not.toHaveBeenCalled();
  });

  it("ignores errors after unmount", async () => {
    let rejectFetch: (error: Error) => void = () => undefined;

    global.fetch = vi.fn(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        })
    ) as typeof fetch;

    const { unmount } = render(<TerminalPage />);
    unmount();

    rejectFetch(new Error("boom"));
    await Promise.resolve();

    expect(createTerminalClientMock).not.toHaveBeenCalled();
  });
});
