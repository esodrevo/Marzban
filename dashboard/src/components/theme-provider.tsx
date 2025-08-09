import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type ColorTheme = 'default' | 'red' | 'rose' | 'orange' | 'green' | 'blue' | 'yellow' | 'violet'
export type Radius = '0' | '0.3rem' | '0.5rem' | '0.75rem'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultRadius?: Radius
  storageKey?: string
  colorStorageKey?: string
  radiusStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  radius: Radius
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  setRadius: (radius: Radius) => void
  resetToDefaults: () => void
  isSystemTheme: boolean
}

const initialState: ThemeProviderState = {
  theme: 'system',
  radius: '0.5rem',
  resolvedTheme: 'light',
  setTheme: () => null,
  setRadius: () => null,
  resetToDefaults: () => null,
  isSystemTheme: true,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Failed to get localStorage item ${key}:`, error)
      return null
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Failed to set localStorage item ${key}:`, error)
      return false
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove localStorage item ${key}:`, error)
      return false
    }
  },
}

// Helper function to get system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultRadius = '0.5rem',
  storageKey = 'theme',
  colorStorageKey = 'color-theme',
  radiusStorageKey = 'radius',
  ...props
}: ThemeProviderProps) {
  // Load initial values from localStorage with fallbacks
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = safeLocalStorage.getItem(storageKey) as Theme
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : defaultTheme
  })

  const [radius, setRadiusState] = useState<Radius>(() => {
    const saved = safeLocalStorage.getItem(radiusStorageKey) as Radius
    return saved && ['0', '0.3rem', '0.5rem', '0.75rem'].includes(saved) ? saved : defaultRadius
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    return theme === 'system' ? getSystemTheme() : theme === 'dark' ? 'dark' : 'light'
  })

  // Apply theme changes to DOM
  const applyTheme = useCallback((themeMode: 'light' | 'dark') => {
    const root = document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    root.classList.add(themeMode)
  }, [])

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const systemTheme = e.matches ? 'dark' : 'light'
        setResolvedTheme(systemTheme)
        applyTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme, radius])

  // Apply theme on mount and theme changes
  useEffect(() => {
    const newResolvedTheme = theme === 'system' ? getSystemTheme() : theme === 'dark' ? 'dark' : 'light'
    setResolvedTheme(newResolvedTheme)
    applyTheme(newResolvedTheme)
  }, [theme, radius, applyTheme])

  // Enhanced setTheme function with error handling and toast
  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (safeLocalStorage.setItem(storageKey, newTheme)) {
        setThemeState(newTheme)

        // Show success toast - this will be handled by the settings page
        // The provider itself shouldn't show toasts to avoid dependency issues
      } else {
        // Fallback: set theme without localStorage
        setThemeState(newTheme)
        console.warn('Failed to save theme to localStorage, changes may not persist')
      }
    },
    [storageKey],
  )

  // Enhanced setRadius function
  const setRadius = useCallback(
    (newRadius: Radius) => {
      if (['0', '0.3rem', '0.5rem', '0.75rem'].includes(newRadius)) {
        if (safeLocalStorage.setItem(radiusStorageKey, newRadius)) {
          setRadiusState(newRadius)
        } else {
          setRadiusState(newRadius)
          console.warn('Failed to save radius to localStorage, changes may not persist')
        }
      } else {
        console.warn(`Invalid radius value: ${newRadius}`)
      }
    },
    [radiusStorageKey],
  )

  // Reset to defaults function
  const resetToDefaults = useCallback(() => {
    safeLocalStorage.removeItem(storageKey)
    safeLocalStorage.removeItem(colorStorageKey)
    safeLocalStorage.removeItem(radiusStorageKey)

    setThemeState(defaultTheme)
    setRadiusState(defaultRadius)
  }, [storageKey, colorStorageKey, radiusStorageKey, defaultTheme, defaultRadius])

  const value: ThemeProviderState = {
    theme,
    radius,
    resolvedTheme,
    setTheme,
    setRadius,
    resetToDefaults,
    isSystemTheme: theme === 'system',
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
