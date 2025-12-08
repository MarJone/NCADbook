import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

/**
 * Theme Provider - Light Mode Only
 *
 * All portals now use light mode exclusively.
 * Portal-specific styling is handled via CSS custom properties
 * on the portal containers (e.g., .master-admin-portal uses purple accents).
 */
export function ThemeProvider({ children }) {
  // Portal type detection (will be set by portal layouts)
  const [portalType, setPortalType] = useState(null);

  // Experimental mode flag for progressive rollout
  const [experimentalMode, setExperimentalMode] = useState(true);

  // Theme is always light
  const theme = 'light';

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Set theme attribute - always light
    root.setAttribute('data-theme', 'light');

    // Set experimental mode attribute
    root.setAttribute('data-experimental', experimentalMode.toString());

    // Set portal type for CSS targeting
    if (portalType) {
      root.setAttribute('data-portal', portalType);
    }

    // Remove any dark mode classes
    root.classList.remove('permanent-dark', 'dark-mode');
    root.classList.add('light-mode');

    // Clear any saved theme preference
    localStorage.removeItem('ncad-theme');
  }, [experimentalMode, portalType]);

  // Register portal type (called by portal layouts)
  const registerPortal = useCallback((type) => {
    setPortalType(type);
  }, []);

  // Unregister portal (called on unmount)
  const unregisterPortal = useCallback(() => {
    setPortalType(null);
  }, []);

  const value = {
    // Current theme state - always light
    theme: 'light',
    isDark: false,
    isLight: true,

    // Theme control - disabled (no toggle functionality)
    setTheme: () => {},
    toggleTheme: () => {},
    canToggle: false,
    isThemeLocked: true,

    // Portal management
    portalType,
    registerPortal,
    unregisterPortal,

    // Experimental features
    experimentalMode,
    setExperimentalMode,

    // Utility
    getThemeClass: () => 'light-mode',
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
