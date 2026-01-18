import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { App } from "./app";

describe("App", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  it("renders the router shell", () => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading terminal");
  });
});
