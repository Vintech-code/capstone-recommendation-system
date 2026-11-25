import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AdminThemeContext,
  type AdminThemeContextValue,
  type AdminThemeMode,
  type ResolvedTheme,
} from "@/features/admin/theme/admin-theme-state";

const THEME_STORAGE_KEY = "tcc_admin_theme_mode";

function getStoredTheme(): AdminThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore storage access errors
  }
  return "light";
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<AdminThemeMode>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Listen to OS-level preference changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const resolvedTheme: ResolvedTheme =
    themeMode === "system" ? systemTheme : themeMode;

  const setThemeMode = useCallback((mode: AdminThemeMode) => {
    setThemeModeState(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage access errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemeMode]);

  // Apply .dark class to html and body while in the admin workspace
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }

    // Clean up on unmount so student portal is strictly light mode
    return () => {
      root.classList.remove("dark");
      body.classList.remove("dark");
    };
  }, [resolvedTheme]);

  const value = useMemo<AdminThemeContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
      toggleTheme,
    }),
    [themeMode, resolvedTheme, setThemeMode, toggleTheme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export { AdminThemeProvider };

