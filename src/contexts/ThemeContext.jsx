import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const DARK_MODE_KEY = 'ncadbook_dark_mode';

/**
 * Theme Provider - Dark Mode Support
 *
 * Supports dark mode toggle for Student, Staff, and Dept Admin portals.
 * Master Admin portal is always dark (locked).
 * Portal-specific styling is handled via CSS custom properties.
 */
export function ThemeProvider({ children }) {
  // Portal type detection (will be set by portal layouts)
  const [portalType, setPortalType] = useState(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    try {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Check system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Experimental mode flag for progressive rollout
  const [experimentalMode, setExperimentalMode] = useState(true);

  // Determine if current portal can toggle dark mode
  const canToggleDarkMode = portalType !== 'master-admin';

  // Determine effective theme (master-admin is always dark)
  const effectiveTheme = portalType === 'master-admin' ? 'dark' : (isDarkMode ? 'dark' : 'light');
  const effectiveIsDark = portalType === 'master-admin' ? true : isDarkMode;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set theme attribute
    root.setAttribute('data-theme', effectiveTheme);

    // Set experimental mode attribute
    root.setAttribute('data-experimental', experimentalMode.toString());

    // Set portal type for CSS targeting
    if (portalType) {
      root.setAttribute('data-portal', portalType);
    }

    // Apply theme classes
    if (effectiveIsDark) {
      root.classList.remove('light-mode');
      root.classList.add('dark-mode');
      if (portalType === 'master-admin') {
        root.classList.add('permanent-dark');
      }
    } else {
      root.classList.remove('dark-mode', 'permanent-dark');
      root.classList.add('light-mode');
    }

    // Save preference (only for portals that can toggle)
    if (canToggleDarkMode) {
      try {
        localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDarkMode));
      } catch (error) {
        console.error('Failed to save dark mode preference:', error);
      }
    }
  }, [effectiveTheme, effectiveIsDark, experimentalMode, portalType, isDarkMode, canToggleDarkMode]);

  // Watch for system preference changes (only if no manual preference set)
  useEffect(() => {
    if (!window.matchMedia || !canToggleDarkMode) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      // Only update if user hasn't set a manual preference
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [canToggleDarkMode]);

  // Register portal type (called by portal layouts)
  const registerPortal = useCallback((type) => {
    setPortalType(type);
  }, []);

  // Unregister portal (called on unmount)
  const unregisterPortal = useCallback(() => {
    setPortalType(null);
  }, []);

  // Toggle dark mode (only for portals that support it)
  const toggleDarkMode = useCallback(() => {
    if (!canToggleDarkMode) {
      console.warn('Dark mode toggle not available for this portal');
      return;
    }
    setIsDarkMode(prev => !prev);
  }, [canToggleDarkMode]);

  // Set dark mode explicitly
  const setDarkMode = useCallback((enabled) => {
    if (!canToggleDarkMode) {
      console.warn('Dark mode toggle not available for this portal');
      return;
    }
    setIsDarkMode(enabled);
  }, [canToggleDarkMode]);

  const value = {
    // Current theme state
    theme: effectiveTheme,
    isDark: effectiveIsDark,
    isLight: !effectiveIsDark,

    // Dark mode control
    isDarkMode: effectiveIsDark,
    toggleDarkMode,
    setDarkMode,
    canToggleDarkMode,

    // Legacy theme control (for backwards compatibility)
    setTheme: (newTheme) => {
      if (canToggleDarkMode) {
        setIsDarkMode(newTheme === 'dark');
      }
    },
    toggleTheme: toggleDarkMode,
    canToggle: canToggleDarkMode,
    isThemeLocked: !canToggleDarkMode,

    // Portal management
    portalType,
    registerPortal,
    unregisterPortal,

    // Experimental features
    experimentalMode,
    setExperimentalMode,

    // Utility
    getThemeClass: () => effectiveIsDark ? 'dark-mode' : 'light-mode',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook for portal registration
 * Call this in your portal layout component
 *
 * @param {string} portalType - 'student' | 'staff' | 'dept-admin' | 'master-admin'
 */
export function usePortalTheme(portalType) {
  const { registerPortal, unregisterPortal, ...themeContext } = useTheme();

  useEffect(() => {
    registerPortal(portalType);
    return () => unregisterPortal();
  }, [portalType, registerPortal, unregisterPortal]);

  return themeContext;
}

export default ThemeContext;
