import { useCallback, useEffect, useMemo, useRef, useState } from "react"

/**
 * Stored light, dark, or operating-system theme preference.
 */
export type Theme = "light" | "dark" | "system"

/**
 * Read the operating system color scheme with an SSR-safe default.
 * @returns The light or dark color scheme.
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/**
 * Storage callbacks for reading and writing a theme preference.
 */
export interface UseThemeOptions {
  /** Get the stored theme. Return null if no theme is stored. */
  getStoredTheme: () => Promise<Theme | null> | Theme | null
  /** Save the theme to storage */
  setStoredTheme: (theme: Theme) => Promise<void> | void
}

/**
 * Load, apply, and persist the selected theme and system preference.
 * @returns The current theme, resolved scheme, and update operation.
 */
export function useTheme({ getStoredTheme, setStoredTheme }: UseThemeOptions) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [isLoading, setIsLoading] = useState(true)
  const appliedTheme = useRef<string | null>(null)

  useEffect(() => {
    void Promise.resolve(getStoredTheme()).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored)
      }
      setIsLoading(false)
    })
  }, [getStoredTheme])

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme

  useEffect(() => {
    if (isLoading) return
    if (appliedTheme.current === resolvedTheme) return
    appliedTheme.current = resolvedTheme
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme, isLoading])

  useEffect(() => {
    if (theme !== "system") return
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const newResolved = getSystemTheme()
      if (appliedTheme.current === newResolved) return
      appliedTheme.current = newResolved
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(newResolved)
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setTheme = useCallback(
    async (newTheme: Theme) => {
      setThemeState(newTheme)
      await setStoredTheme(newTheme)
    },
    [setStoredTheme]
  )

  return useMemo(
    () => ({ theme, setTheme, resolvedTheme, isLoading }),
    [theme, setTheme, resolvedTheme, isLoading]
  )
}
