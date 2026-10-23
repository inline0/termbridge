import { RouterProvider } from "@tanstack/react-router"
import { type Theme, useTheme } from "@termbridge/ui"
import { router } from "./router.tsx"

const THEME_STORAGE_KEY = "termbridge.theme"

/**
 * Read a valid theme preference from browser storage.
 * @returns The stored theme, or null when absent or unavailable.
 */
export const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : null
}

/**
 * Persist the theme preference when browser storage is available.
 * @param theme - Theme preference to persist.
 */
export const setStoredTheme = (theme: Theme) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

/**
 * Render the application router and apply the stored theme preference.
 * @returns The rendered interface.
 */
export const App = () => {
  useTheme({ getStoredTheme, setStoredTheme })
  return <RouterProvider router={router} />
}
