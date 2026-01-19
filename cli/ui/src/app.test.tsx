import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

describe("App", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    window.localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
    cleanup();
  });

  it("applies the stored theme", async () => {
    global.fetch = vi.fn(() => new Promise(() => undefined)) as typeof fetch;
    window.localStorage.setItem("termbridge.theme", "dark");

    const { App } = await import("./app");
    render(<App />);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });

  it("reads and writes stored theme values", async () => {
    const { getStoredTheme, setStoredTheme } = await import("./app");

    window.localStorage.setItem("termbridge.theme", "not-a-theme");
    expect(getStoredTheme()).toBeNull();

    setStoredTheme("light");
    expect(window.localStorage.getItem("termbridge.theme")).toBe("light");
  });

  it("handles missing window globals safely", async () => {
    const { getStoredTheme, setStoredTheme } = await import("./app");
    const originalWindow = window;

    vi.stubGlobal("window", undefined);

    try {
      expect(getStoredTheme()).toBeNull();
      expect(() => setStoredTheme("dark")).not.toThrow();
    } finally {
      vi.stubGlobal("window", originalWindow);
    }
  });
});
