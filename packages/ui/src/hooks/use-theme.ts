import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export interface UseThemeOptions {
  /** Get the stored theme. Return null if no theme is stored. */
  getStoredTheme: () => Promise<Theme | null> | Theme | null;
  /** Save the theme to storage */
  setStoredTheme: (theme: Theme) => Promise<void> | void;
}

export function useTheme({ getStoredTheme, setStoredTheme }: UseThemeOptions) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isLoading, setIsLoading] = useState(true);
  const appliedTheme = useRef<string | null>(null);

  useEffect(() => {
    Promise.resolve(getStoredTheme()).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
      setIsLoading(false);
    });
  }, [getStoredTheme]);

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    if (isLoading) return;
    if (appliedTheme.current === resolvedTheme) return;
    appliedTheme.current = resolvedTheme;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme, isLoading]);

  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newResolved = getSystemTheme();
      if (appliedTheme.current === newResolved) return;
      appliedTheme.current = newResolved;
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newResolved);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme);
      await setStoredTheme(newTheme);
    },
    [setStoredTheme],
  );

  return useMemo(
    () => ({ theme, setTheme, resolvedTheme, isLoading }),
    [theme, setTheme, resolvedTheme, isLoading],
  );
}
