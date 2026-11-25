import { createContext, useContext } from "react";

type AdminThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface AdminThemeContextValue {
  themeMode: AdminThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: AdminThemeMode) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

function useAdminTheme(): AdminThemeContextValue {
  const context = useContext(AdminThemeContext);
  if (!context) {
    return {
      themeMode: "light",
      resolvedTheme: "light",
      setThemeMode: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}

export {
  AdminThemeContext,
  useAdminTheme,
  type AdminThemeContextValue,
  type AdminThemeMode,
  type ResolvedTheme,
};
