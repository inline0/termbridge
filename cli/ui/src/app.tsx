import { RouterProvider } from "@tanstack/react-router";
import { type Theme, useTheme } from "@termbridge/ui";
import { router } from "./router";

const THEME_STORAGE_KEY = "termbridge.theme";

const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : null;
};

const setStoredTheme = (theme: Theme) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const App = () => {
  useTheme({ getStoredTheme, setStoredTheme });
  return <RouterProvider router={router} />;
};
