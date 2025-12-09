/**
 * Dark Mode Toggle - Integration Examples
 *
 * This file demonstrates how to integrate the DarkModeToggle component
 * into various portal headers and layouts.
 */

import DarkModeToggle from './DarkModeToggle';
import ThemeToggle from './ThemeToggle';

/**
 * Example 1: Integration into PortalHeader
 *
 * Add the toggle to the header actions section, typically
 * near the notifications and user menu.
 */
export function PortalHeaderWithDarkMode() {
  return (
    <header className="portal-header">
      <div className="header-container">
        {/* Logo and navigation */}
        <div className="header-brand">...</div>
        <nav className="header-nav">...</nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Search button */}
          <button className="header-action-btn">Search</button>

          {/* Dark Mode Toggle - Add here */}
          <DarkModeToggle showLabel={false} />
          {/* Or use ThemeToggle as alternative */}
          {/* <ThemeToggle showLabel={false} /> */}

          {/* Notifications */}
          <button className="header-action-btn">Notifications</button>

          {/* User menu */}
          <div className="header-user-menu">...</div>
        </div>
      </div>
    </header>
  );
}

/**
 * Example 2: Integration into User Dropdown Menu
 *
 * Add the toggle as a menu item in the user dropdown,
 * typically in the settings section.
 */
export function UserMenuWithDarkMode() {
  return (
    <div className="user-menu-dropdown">
      <div className="user-menu-header">
        <div className="user-name">John Doe</div>
        <div className="user-email">john@ncad.ie</div>
      </div>

      <div className="user-menu-divider" />

      <ul className="user-menu-list">
        <li><a href="/profile">My Profile</a></li>
        <li><a href="/bookings">My Bookings</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>

      <div className="user-menu-divider" />

      {/* Dark Mode Toggle in menu */}
      <div className="user-menu-item">
        <DarkModeToggle showLabel={true} />
      </div>

      <div className="user-menu-divider" />

      <button className="user-menu-logout">Sign Out</button>
    </div>
  );
}

/**
 * Example 3: Integration into Settings Page
 *
 * Add the toggle to a settings/preferences page for more
 * visibility and user control.
 */
export function SettingsPageWithDarkMode() {
  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>Appearance</h2>

        <div className="settings-row">
          <div className="settings-label">
            <h3>Theme</h3>
            <p>Choose your preferred color scheme</p>
          </div>
          <div className="settings-control">
            <DarkModeToggle showLabel={true} />
          </div>
        </div>
      </section>

      {/* Other settings sections... */}
    </div>
  );
}

/**
 * Example 4: Integration with useTheme Hook
 *
 * For custom implementations, use the useTheme hook directly
 * to access dark mode state and toggle function.
 */
import { useTheme } from '../../contexts/ThemeContext';

export function CustomDarkModeControl() {
  const { isDarkMode, toggleDarkMode, canToggleDarkMode } = useTheme();

  // Don't render if portal doesn't support dark mode
  if (!canToggleDarkMode) {
    return null;
  }

  return (
    <div className="custom-theme-control">
      <label htmlFor="dark-mode-switch">
        Dark Mode
      </label>
      <input
        type="checkbox"
        id="dark-mode-switch"
        checked={isDarkMode}
        onChange={toggleDarkMode}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}

/**
 * Example 5: Programmatic Dark Mode Control
 *
 * For advanced use cases where you need to control dark mode
 * programmatically (e.g., based on time of day).
 */
import { useEffect } from 'react';

export function AutoDarkModeByTime() {
  const { setDarkMode, canToggleDarkMode } = useTheme();

  useEffect(() => {
    if (!canToggleDarkMode) return;

    // Check time of day
    const hour = new Date().getHours();
    const shouldBeDark = hour < 6 || hour >= 18;

    // Only auto-set if user hasn't set a preference
    const hasPreference = localStorage.getItem('ncadbook_dark_mode') !== null;
    if (!hasPreference) {
      setDarkMode(shouldBeDark);
    }
  }, [setDarkMode, canToggleDarkMode]);

  return null;
}

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. Ensure ThemeProvider wraps your app in App.jsx or main.jsx:
 *    import { ThemeProvider } from './contexts/ThemeContext';
 *    <ThemeProvider><App /></ThemeProvider>
 *
 * 2. Ensure portal layouts register their type:
 *    import { usePortalTheme } from './contexts/ThemeContext';
 *    usePortalTheme('student'); // or 'staff', 'dept-admin', 'master-admin'
 *
 * 3. Add DarkModeToggle or ThemeToggle to your header/menu:
 *    import DarkModeToggle from './components/common/DarkModeToggle';
 *    <DarkModeToggle showLabel={false} />
 *
 * 4. Ensure theme.css is imported in your main CSS file
 *
 * 5. Test across all portals:
 *    - Student: Should allow toggle
 *    - Staff: Should allow toggle
 *    - Dept Admin: Should allow toggle
 *    - Master Admin: Should NOT show toggle (always dark)
 *
 * 6. Test persistence:
 *    - Toggle dark mode
 *    - Refresh page
 *    - Preference should persist
 *
 * 7. Test system preference detection:
 *    - Clear localStorage: localStorage.removeItem('ncadbook_dark_mode')
 *    - Refresh page
 *    - Should match system preference
 */
