import { createContext, useContext } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'tcc-ui-theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.')
  }

  return context
}

export { THEME_STORAGE_KEY, ThemeContext, useTheme }
export type { Theme, ThemeContextValue }
