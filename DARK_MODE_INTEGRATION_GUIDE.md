# Dark Mode Toggle - Quick Integration Guide

## 🎯 Goal
Add a dark mode toggle button to the Student, Staff, and Dept Admin portal headers.

## ✅ Status
All code is implemented and ready. You just need to **add the component to your headers**.

---

## 📋 Integration Steps

### Step 1: Verify ThemeProvider (Likely Already Done)

Check if `App.jsx` or `main.jsx` has ThemeProvider:

```jsx
// src/App.jsx or src/main.jsx
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app routes and components */}
    </ThemeProvider>
  );
}
```

**✅ If already wrapped:** Move to Step 2
**❌ If not wrapped:** Add the ThemeProvider wrapper

---

### Step 2: Add Dark Mode Toggle to PortalHeader

**File to modify:** `src/components/layout/PortalHeader.jsx`

**Current structure** (around line 125-163):
```jsx
{/* Actions */}
<div className="header-actions">
  {/* Search Trigger */}
  <button className="header-action-btn" onClick={onSearchOpen}>
    <Search size={20} />
    <span className="header-shortcut">/</span>
  </button>

  {/* Command Palette (Master Admin only) */}
  {portalType === 'master-admin' && (
    <button className="header-action-btn" onClick={onCommandPaletteOpen}>
      <Command size={20} />
      <span className="header-shortcut">
        <kbd>⌘</kbd><kbd>K</kbd>
      </span>
    </button>
  )}

  {/* Notifications */}
  <button className="header-action-btn header-notifications">
    <Bell size={20} />
    {notificationCount > 0 && (
      <span className="header-badge">
        {notificationCount > 9 ? '9+' : notificationCount}
      </span>
    )}
  </button>

  {/* User Menu */}
  <div className="header-user-menu-container">
    {/* ... */}
  </div>

  {/* Mobile Menu Toggle */}
  <button className="header-mobile-toggle" onClick={handleMobileMenuToggle}>
    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
</div>
```

**Add these changes:**

**1. Import DarkModeToggle at the top:**
```jsx
import DarkModeToggle from '../common/DarkModeToggle';
```

**2. Add the toggle button after Notifications, before User Menu:**
```jsx
{/* Actions */}
<div className="header-actions">
  {/* Search Trigger */}
  <button className="header-action-btn" onClick={onSearchOpen}>
    <Search size={20} />
    <span className="header-shortcut">/</span>
  </button>

  {/* Command Palette (Master Admin only) */}
  {portalType === 'master-admin' && (
    <button className="header-action-btn" onClick={onCommandPaletteOpen}>
      <Command size={20} />
      <span className="header-shortcut">
        <kbd>⌘</kbd><kbd>K</kbd>
      </span>
    </button>
  )}

  {/* Notifications */}
  <button className="header-action-btn header-notifications">
    <Bell size={20} />
    {notificationCount > 0 && (
      <span className="header-badge">
        {notificationCount > 9 ? '9+' : notificationCount}
      </span>
    )}
  </button>

  {/* ⭐ ADD THIS: Dark Mode Toggle */}
  <DarkModeToggle showLabel={false} />

  {/* User Menu */}
  <div className="header-user-menu-container">
    {/* ... */}
  </div>

  {/* Mobile Menu Toggle */}
  <button className="header-mobile-toggle" onClick={handleMobileMenuToggle}>
    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
  </button>
</div>
```

**That's it!** The component automatically:
- Shows on Student, Staff, Dept Admin
- Hides on Master Admin
- Shows label on desktop
- Hides label on mobile (icon only)
- Saves preference to localStorage
- Detects system preference

---

### Step 3: Test the Implementation

**Start dev server:**
```bash
npm run dev
```

**Navigate to portals and test:**

**✅ Student Portal:** `http://localhost:5175/NCADbook/student`
- Should see moon icon (🌙) in header
- Click to toggle dark mode
- Refresh - preference should persist

**✅ Staff Portal:** `http://localhost:5175/NCADbook/staff`
- Same as Student Portal

**✅ Dept Admin:** `http://localhost:5175/NCADbook/dept-admin`
- Same as Student Portal

**❌ Master Admin:** `http://localhost:5175/NCADbook/master-admin`
- Should NOT see toggle (always dark)

---

## 🎨 Visual Preview

### Desktop (1440px)
```
┌─────────────────────────────────────────────────────┐
│  NCAD    Student Portal          🔍  🌙  🔔  👤    │
└─────────────────────────────────────────────────────┘
          Search  Toggle  Bell  User
```

### Mobile (375px)
```
┌─────────────────────────┐
│  NCAD   🔍 🌙 🔔 👤 ☰  │
└─────────────────────────┘
```

---

## 🔧 Customization Options

### Show Label on Desktop
```jsx
<DarkModeToggle showLabel={true} />
```
Result: Button shows "Dark" or "Light" text next to icon

### Add Custom Class
```jsx
<DarkModeToggle className="my-custom-class" />
```

### Use Alternative Component
```jsx
import ThemeToggle from '../common/ThemeToggle';

<ThemeToggle showLabel={false} />
```
(Functionally identical, slightly different styling)

---

## 🎨 Styling the Toggle

If you want to customize the appearance, edit:
```
src/components/common/DarkModeToggle.css
```

**Key CSS classes:**
- `.dark-mode-toggle` - Main button
- `.mode-icon` - Icon container
- `.mode-label` - Text label
- `[aria-pressed="true"]` - Active/pressed state

---

## 🧪 Testing Checklist

After integration, verify:

**Functionality:**
- [ ] Toggle appears in Student, Staff, Dept Admin headers
- [ ] Toggle does NOT appear in Master Admin
- [ ] Clicking toggle switches theme
- [ ] Page background color changes
- [ ] Text color changes
- [ ] Preference persists after refresh

**Accessibility:**
- [ ] Can Tab to toggle button
- [ ] Can press Enter to activate
- [ ] Focus ring visible when focused
- [ ] ARIA label announces "Switch to dark/light mode"

**Responsive:**
- [ ] Desktop: Shows icon + label (if enabled)
- [ ] Mobile: Shows icon only
- [ ] Touch target is 44x44px minimum

**Cross-Browser:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## 🐛 Troubleshooting

### Issue: Toggle doesn't appear

**Check:**
1. Is `PortalHeader.jsx` imported and used?
2. Is portal type registered in layout?
3. Are you testing Master Admin? (won't show by design)

**Debug:**
Open browser console and run:
```javascript
document.documentElement.getAttribute('data-portal')
// Should return: 'student', 'staff', 'dept-admin', or 'master-admin'
```

### Issue: Toggle appears but doesn't work

**Check:**
1. Console for errors
2. ThemeProvider wrapping app

**Debug:**
```javascript
localStorage.getItem('ncadbook_dark_mode')
// Should return: "true", "false", or null
```

### Issue: Theme doesn't persist

**Check:**
1. Not in incognito/private mode (localStorage disabled)
2. Browser not blocking localStorage

**Debug:**
```javascript
// Try manually setting
localStorage.setItem('ncadbook_dark_mode', 'true');
// Then refresh page
```

### Issue: Styles not updating

**Check:**
1. `theme.css` imported in main CSS file
2. Components using `var(--theme-*)` variables

**Debug:**
```javascript
// Check if data-theme attribute is set
document.documentElement.getAttribute('data-theme')
// Should return: 'light' or 'dark'

// Check CSS variable value
getComputedStyle(document.documentElement).getPropertyValue('--theme-bg-primary')
// Should return different values for light vs dark
```

---

## 📚 Additional Resources

**Full Documentation:**
- [DARK_MODE_IMPLEMENTATION.md](DARK_MODE_IMPLEMENTATION.md)

**Examples:**
- [DarkModeToggle.example.jsx](src/components/common/DarkModeToggle.example.jsx)

**Tests:**
- [tests/dark-mode.spec.js](tests/dark-mode.spec.js)

**Changes Summary:**
- [DARK_MODE_CHANGES_SUMMARY.md](DARK_MODE_CHANGES_SUMMARY.md)

---

## 🚀 Quick Start Command

**1. Add to PortalHeader.jsx:**
```jsx
import DarkModeToggle from '../common/DarkModeToggle';

// In JSX, add after Notifications button:
<DarkModeToggle showLabel={false} />
```

**2. Test:**
```bash
npm run dev
```

**3. Navigate to:**
```
http://localhost:5175/NCADbook/student
```

**4. Look for 🌙 icon in header and click it!**

---

## ✅ Success Criteria

You'll know it's working when:

1. **Student/Staff/Dept Admin portals:**
   - Moon icon (🌙) visible in header
   - Clicking switches to sun icon (☀️)
   - Background changes from white to dark gray
   - Text changes from dark to light
   - Refreshing page keeps the selected theme

2. **Master Admin portal:**
   - No toggle visible
   - Always dark theme
   - Cannot be changed

---

## 💡 Pro Tips

**Tip 1: Add to User Menu**
For better discoverability, also add to user dropdown:
```jsx
<div className="header-user-dropdown-divider" />
<div style={{ padding: '8px 16px' }}>
  <DarkModeToggle showLabel={true} />
</div>
```

**Tip 2: Add to Settings Page**
Create a dedicated settings section:
```jsx
<section className="settings-section">
  <h2>Appearance</h2>
  <div className="settings-row">
    <div>
      <h3>Theme</h3>
      <p>Choose your preferred color scheme</p>
    </div>
    <DarkModeToggle showLabel={true} />
  </div>
</section>
```

**Tip 3: Keyboard Shortcut**
Add a global keyboard shortcut for power users:
```jsx
// In a useEffect
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      toggleDarkMode();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [toggleDarkMode]);
```

---

**Ready to go? Add the import and component to PortalHeader.jsx and you're done!** 🎉

---

**Questions?**
Check [DARK_MODE_IMPLEMENTATION.md](DARK_MODE_IMPLEMENTATION.md) for comprehensive documentation.
