# Dark Mode Implementation Guide

This document describes the dark mode toggle functionality implemented for the NCAD Equipment Booking System.

## Overview

The system now supports dark mode toggle for **Student, Staff, and Department Admin portals**. The **Master Admin portal remains always dark** (locked theme).

## Features

- ✅ Portal-aware dark mode (Student, Staff, Dept Admin can toggle; Master Admin is always dark)
- ✅ Preference saved to localStorage
- ✅ System preference detection on first visit
- ✅ Smooth theme transitions using CSS custom properties
- ✅ Full keyboard accessibility (WCAG 2.1 AA compliant)
- ✅ Automatic system preference sync (when no manual preference set)
- ✅ Respects `prefers-reduced-motion` for animations
- ✅ Proper ARIA attributes for screen readers

## Architecture

### Core Components

1. **ThemeContext.jsx** (`src/contexts/ThemeContext.jsx`)
   - Manages global dark mode state
   - Provides `isDarkMode`, `toggleDarkMode`, and `canToggleDarkMode`
   - Detects portal type and locks Master Admin to dark mode
   - Syncs with localStorage and system preferences

2. **DarkModeToggle.jsx** (`src/components/common/DarkModeToggle.jsx`)
   - Primary toggle button component
   - Uses moon/sun emoji icons (🌙/☀️)
   - Optional text label for desktop
   - Hides on portals that don't support toggle

3. **ThemeToggle.jsx** (`src/components/common/ThemeToggle.jsx`)
   - Alternative toggle button component
   - Functionally identical to DarkModeToggle
   - Slightly different visual style

4. **theme.css** (`src/styles/theme.css`)
   - Defines light and dark color palettes
   - Uses CSS custom properties for theme variables
   - Applies `[data-theme="dark"]` selector for dark mode

### Data Flow

```
User clicks toggle
    ↓
toggleDarkMode() in ThemeContext
    ↓
setIsDarkMode(true/false)
    ↓
useEffect updates:
    - document.documentElement.setAttribute('data-theme', 'dark')
    - document.documentElement.classList.add('dark-mode')
    - localStorage.setItem('ncadbook_dark_mode', true)
    ↓
CSS applies [data-theme="dark"] styles
```

## Implementation

### 1. ThemeContext Changes

**File:** `src/contexts/ThemeContext.jsx`

**Key additions:**
- `isDarkMode` state with localStorage initialization
- `canToggleDarkMode` computed from portalType
- `effectiveTheme` that forces dark for Master Admin
- `toggleDarkMode()` and `setDarkMode()` functions
- System preference watcher with mediaQuery listener
- localStorage persistence

**Portal Logic:**
```javascript
const canToggleDarkMode = portalType !== 'master-admin';
const effectiveTheme = portalType === 'master-admin'
  ? 'dark'
  : (isDarkMode ? 'dark' : 'light');
```

### 2. Component Updates

**DarkModeToggle.jsx:**
- Now uses `useTheme()` hook instead of `darkModeService`
- Returns `null` if `!canToggleDarkMode`
- Uses `aria-pressed` for toggle state
- Minimum 44px touch target on mobile

**ThemeToggle.jsx:**
- Updated to match DarkModeToggle functionality
- Provides alternative visual style
- Same accessibility features

### 3. CSS Theme Variables

**theme.css additions:**

**Dark Theme Colors:**
```css
:root {
  --dark-bg-primary: #1F2937;
  --dark-bg-secondary: #111827;
  --dark-bg-tertiary: #374151;
  --dark-text-primary: #F9FAFB;
  --dark-text-secondary: #D1D5DB;
  /* ... more colors */
}
```

**Dark Theme Mapping:**
```css
[data-theme="dark"] {
  --theme-bg-primary: var(--dark-bg-primary);
  --theme-text-primary: var(--dark-text-primary);
  /* ... maps all theme variables to dark variants */
}
```

## Usage

### Basic Integration

**1. In Portal Header:**

```jsx
import DarkModeToggle from '../components/common/DarkModeToggle';

export function PortalHeader() {
  return (
    <header>
      <div className="header-actions">
        <button>Search</button>

        {/* Add dark mode toggle */}
        <DarkModeToggle showLabel={false} />

        <button>Notifications</button>
      </div>
    </header>
  );
}
```

**2. In User Menu:**

```jsx
<div className="user-dropdown">
  <ul>
    <li><Link to="/profile">Profile</Link></li>
    <li><Link to="/settings">Settings</Link></li>
  </ul>

  <div className="menu-divider" />

  {/* Add dark mode toggle */}
  <DarkModeToggle showLabel={true} />
</div>
```

**3. In Settings Page:**

```jsx
<section className="settings-section">
  <h2>Appearance</h2>
  <div className="settings-row">
    <div className="settings-label">
      <h3>Theme</h3>
      <p>Choose your preferred color scheme</p>
    </div>
    <DarkModeToggle showLabel={true} />
  </div>
</section>
```

### Advanced: Custom Implementation

```jsx
import { useTheme } from '../contexts/ThemeContext';

export function CustomThemeControl() {
  const {
    isDarkMode,
    toggleDarkMode,
    canToggleDarkMode,
    portalType
  } = useTheme();

  if (!canToggleDarkMode) {
    return <p>Theme locked for {portalType}</p>;
  }

  return (
    <label>
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleDarkMode}
      />
      Dark Mode
    </label>
  );
}
```

## Testing

### Manual Testing Checklist

**Student Portal:**
- [ ] Dark mode toggle visible in header
- [ ] Clicking toggle switches theme
- [ ] Preference persists after refresh
- [ ] Clearing localStorage reverts to system preference
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Screen reader announces "Switch to dark/light mode"

**Staff Portal:**
- [ ] Same as Student Portal

**Department Admin Portal:**
- [ ] Same as Student Portal

**Master Admin Portal:**
- [ ] Toggle NOT visible (always dark)
- [ ] Theme locked to dark
- [ ] No localStorage key created
- [ ] Console warning if toggle attempted programmatically

### Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

Test at viewports:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1440px

### Accessibility Testing

**Keyboard Navigation:**
1. Tab to dark mode toggle
2. Press Enter to toggle
3. Verify focus ring visible (3px, high contrast)
4. Verify ARIA attributes update

**Screen Reader:**
1. Navigate to toggle with screen reader
2. Verify announces "Button, Switch to dark mode, not pressed"
3. Activate toggle
4. Verify announces "Button, Switch to light mode, pressed"

**Color Contrast:**
- Run axe DevTools
- Verify all text meets 4.5:1 contrast ratio
- Verify UI components meet 3:1 contrast ratio

## Styling Custom Components

To make custom components dark-mode aware, use theme CSS variables:

```css
.my-component {
  background: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-light);
}

.my-component:hover {
  background: var(--theme-bg-secondary);
}
```

**Available Theme Variables:**

**Backgrounds:**
- `--theme-bg-primary`
- `--theme-bg-secondary`
- `--theme-bg-tertiary`
- `--theme-bg-elevated`

**Text:**
- `--theme-text-primary`
- `--theme-text-secondary`
- `--theme-text-tertiary`
- `--theme-text-inverse`

**Accents:**
- `--theme-accent-primary`
- `--theme-accent-primary-hover`
- `--theme-accent-secondary`
- `--theme-accent-tertiary`

**Borders:**
- `--theme-border-light`
- `--theme-border-medium`
- `--theme-border-dark`

**Status:**
- `--theme-success` / `--theme-success-bg` / `--theme-success-text`
- `--theme-warning` / `--theme-warning-bg` / `--theme-warning-text`
- `--theme-error` / `--theme-error-bg` / `--theme-error-text`
- `--theme-info` / `--theme-info-bg` / `--theme-info-text`

**Shadows:**
- `--theme-shadow-sm`
- `--theme-shadow-md`
- `--theme-shadow-lg`
- `--theme-shadow-xl`

## Portal-Specific Considerations

### Student Portal
- Primary use case: Extended evening/night study sessions
- Toggle placement: Header actions (icon only on mobile)
- Default: Light mode (unless system prefers dark)

### Staff Portal
- Primary use case: Long admin sessions during work hours
- Toggle placement: Header actions + user menu
- Default: Light mode (professional appearance)

### Department Admin Portal
- Primary use case: Equipment management throughout day
- Toggle placement: Header actions + settings page
- Default: Light mode

### Master Admin Portal
- **Always dark** - no toggle
- Rationale: Consistent with command-line/power-user aesthetic
- Purple accent colors in dark theme
- No localStorage preference saved

## Troubleshooting

### Toggle not appearing

**Check:**
1. Is ThemeProvider wrapping your app?
2. Is portal registered? `usePortalTheme('student')`
3. Are you in Master Admin? (toggle hidden by design)
4. Console errors?

### Preference not persisting

**Check:**
1. localStorage available? (not in incognito/private mode)
2. Browser blocking localStorage?
3. Console error when saving?

### Theme not applying

**Check:**
1. `data-theme` attribute on `<html>`? Inspect in DevTools
2. `theme.css` imported?
3. CSS custom properties defined?
4. Component using `var(--theme-*)` variables?

### System preference not detected

**Check:**
1. Browser supports `window.matchMedia`?
2. System has dark mode preference set?
3. Manual preference overriding system? Clear localStorage

## Files Modified/Created

### Modified:
- `src/contexts/ThemeContext.jsx` - Added dark mode state and logic
- `src/components/common/DarkModeToggle.jsx` - Updated to use ThemeContext
- `src/components/common/ThemeToggle.jsx` - Updated to use ThemeContext
- `src/components/common/ThemeToggle.css` - Added dark mode styles
- `src/styles/theme.css` - Added dark theme variables and mappings

### Created:
- `src/components/common/DarkModeToggle.css` - Toggle button styles
- `src/components/common/DarkModeToggle.example.jsx` - Integration examples
- `DARK_MODE_IMPLEMENTATION.md` - This documentation

### Not Modified (still exists):
- `src/services/darkMode.service.js` - Legacy service (can be removed or kept for backwards compatibility)

## Future Enhancements

### Phase 2 (Optional):
- [ ] Theme picker (light, dark, auto)
- [ ] Scheduled theme switching (auto dark at 6pm)
- [ ] Per-portal preference (different theme per portal)
- [ ] High contrast mode
- [ ] Custom theme colors
- [ ] Theme preview before applying

### Phase 3 (Advanced):
- [ ] Smooth theme transition animation
- [ ] Theme sync across tabs (BroadcastChannel API)
- [ ] Respect `prefers-contrast` media query
- [ ] Theme export/import (settings backup)

## API Reference

### ThemeContext

```typescript
interface ThemeContext {
  // Current state
  theme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  isDarkMode: boolean;

  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Permissions
  canToggleDarkMode: boolean;
  canToggle: boolean;
  isThemeLocked: boolean;

  // Portal
  portalType: 'student' | 'staff' | 'dept-admin' | 'master-admin' | null;
  registerPortal: (type: string) => void;
  unregisterPortal: () => void;

  // Utilities
  experimentalMode: boolean;
  setExperimentalMode: (enabled: boolean) => void;
  getThemeClass: () => 'light-mode' | 'dark-mode';
}
```

### useTheme Hook

```jsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const {
    isDarkMode,        // boolean: current dark mode state
    toggleDarkMode,    // function: toggle dark mode
    canToggleDarkMode, // boolean: can this portal toggle?
    portalType         // string: current portal type
  } = useTheme();

  // ...
}
```

### usePortalTheme Hook

```jsx
import { usePortalTheme } from './contexts/ThemeContext';

function StudentLayout() {
  // Registers this layout as 'student' portal
  const theme = usePortalTheme('student');

  // Returns same as useTheme() but auto-registers portal
  return <div>{/* ... */}</div>;
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review `DarkModeToggle.example.jsx`
3. Inspect browser console for errors
4. Check localStorage: `localStorage.getItem('ncadbook_dark_mode')`
5. Verify `data-theme` attribute: `document.documentElement.getAttribute('data-theme')`

---

**Last Updated:** 2025-12-09
**Version:** 1.0.0
**Author:** Claude Code
