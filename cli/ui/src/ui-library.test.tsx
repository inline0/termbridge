import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { Textarea, getSystemTheme, useTheme } from "@termbridge/ui";
import { useEffect } from "react";

type ThemeState = ReturnType<typeof useTheme>;

type ThemeProbeProps = {
  getStoredTheme: () => ThemeState["theme"] | null;
  setStoredTheme: (theme: ThemeState["theme"]) => void;
  onReady: (state: ThemeState) => void;
};

const ThemeProbe = ({ getStoredTheme, setStoredTheme, onReady }: ThemeProbeProps) => {
  const state = useTheme({ getStoredTheme, setStoredTheme });

  useEffect(() => {
    if (!state.isLoading) {
      onReady(state);
    }
  }, [state, onReady]);

  return null;
};

describe("ui library", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove("light", "dark");
  });

  it("renders a textarea with custom classes", () => {
    render(<Textarea data-testid="textarea" className="test-class" />);

    const textarea = screen.getByTestId("textarea");
    expect(textarea).toHaveAttribute("data-slot", "textarea");
    expect(textarea).toHaveClass("test-class");
  });

  it("updates the resolved theme on system changes", async () => {
    let prefersDark = false;
    const changeHandlers: Array<(event: MediaQueryListEvent) => void> = [];
    const removeEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: prefersDark,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: (event: string, handler: (event: MediaQueryListEvent) => void) => {
        if (event === "change") {
          changeHandlers.push(handler);
        }
      },
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    let snapshot: ThemeState | null = null;
    const onReady = (state: ThemeState) => {
      snapshot = state;
    };

    const { unmount } = render(
      <ThemeProbe getStoredTheme={() => null} setStoredTheme={vi.fn()} onReady={onReady} />
    );

    await waitFor(() => {
      expect(snapshot).not.toBeNull();
    });

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(changeHandlers.length).toBeGreaterThan(0);

    prefersDark = true;
    changeHandlers.forEach((handler) => handler(new Event("change") as MediaQueryListEvent));

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    await act(async () => {
      await snapshot?.setTheme("dark");
    });

    changeHandlers.forEach((handler) => handler(new Event("change") as MediaQueryListEvent));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", changeHandlers[0]);
  });

  it("persists theme changes via setTheme", async () => {
    let snapshot: ThemeState | null = null;
    const onReady = (state: ThemeState) => {
      snapshot = state;
    };
    const setStoredTheme = vi.fn();

    render(
      <ThemeProbe getStoredTheme={() => "dark"} setStoredTheme={setStoredTheme} onReady={onReady} />
    );

    await waitFor(() => {
      expect(snapshot?.theme).toBe("dark");
    });

    await act(async () => {
      await snapshot?.setTheme("light");
    });

    expect(setStoredTheme).toHaveBeenCalledWith("light");
  });

  it("defaults to light when window is unavailable", () => {
    const originalWindow = window;
    vi.stubGlobal("window", undefined);

    try {
      expect(getSystemTheme()).toBe("light");
    } finally {
      vi.stubGlobal("window", originalWindow);
    }
  });
});
