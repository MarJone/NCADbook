import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * Enhanced Theme Provider with Portal-Aware Theming
 *
 * Features:
 * - Master Admin: Permanent dark mode (cannot toggle)
 * - Other portals: Light default with dark mode toggle
 * - System preference detection
 * - Experimental mode flag for progressive rollout
 * - Smooth theme transitions
 */
export function ThemeProvider({ children }) {
  // Portal type detection (will be set by portal layouts)
  const [portalType, setPortalType] = useState(null);

  // Experimental mode flag
  const [experimentalMode, setExperimentalMode] = useState(true);

  // Theme state with smart defaults
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('ncad-theme');
    if (savedTheme) return savedTheme;

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Master Admin is always dark - determine effective theme
  const isThemeLocked = portalType === 'master-admin';
  const effectiveTheme = isThemeLocked ? 'dark' : theme;
  const canToggle = !isThemeLocked;

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only auto-switch if no saved preference and not Master Admin
      if (!localStorage.getItem('ncad-theme') && !isThemeLocked) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isThemeLocked]);

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

    // Add permanent-dark class for Master Admin
    if (isThemeLocked) {
      root.classList.add('permanent-dark');
    } else {
      root.classList.remove('permanent-dark');
    }

    // Add transition class for smooth theme changes
    root.classList.add('theme-transitioning');
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);

    // Save to localStorage (only if not Master Admin)
    if (!isThemeLocked) {
      localStorage.setItem('ncad-theme', theme);
    }

    return () => clearTimeout(timeout);
  }, [effectiveTheme, experimentalMode, portalType, isThemeLocked, theme]);

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    if (isThemeLocked) {
      console.warn('Theme toggle is disabled for Master Admin portal');
      return;
    }
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, [isThemeLocked]);

  // Set specific theme
  const setThemeValue = useCallback((newTheme) => {
    if (isThemeLocked && newTheme !== 'dark') {
      console.warn('Master Admin portal can only use dark theme');
      return;
    }
    setTheme(newTheme);
  }, [isThemeLocked]);

  // Register portal type (called by portal layouts)
  const registerPortal = useCallback((type) => {
    setPortalType(type);
  }, []);

  // Unregister portal (called on unmount)
  const unregisterPortal = useCallback(() => {
    setPortalType(null);
  }, []);

  const value = {
    // Current theme state
    theme: effectiveTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',

    // Theme control
    setTheme: setThemeValue,
    toggleTheme,
    canToggle,
    isThemeLocked,

    // Portal management
    portalType,
    registerPortal,
    unregisterPortal,

    // Experimental features
    experimentalMode,
    setExperimentalMode,

    // Utility
    getThemeClass: () => effectiveTheme === 'dark' ? 'dark-mode' : 'light-mode',
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
