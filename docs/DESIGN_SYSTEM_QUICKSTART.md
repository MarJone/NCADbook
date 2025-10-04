# Design System - Quick Start Guide

**⚡ Get started in 5 minutes**

---

## ✅ Phase 1 Complete - What's New

You now have a **comprehensive design system** with:

### 🎨 **4 Portal Themes**
- **Student:** Coral (#E85D75) - Warm & playful
- **Staff:** Teal (#26A69A) - Professional & balanced
- **Dept Admin:** Amber (#FFA726) - Authoritative & compact
- **Master Admin:** Purple (#7B1FA2) - Dark mode command center

### 📦 **New Files Created**
```
src/styles/
├── design-system.css          ← Main import (already added to main.css)
├── design-tokens.css          ← Foundation: spacing, shadows, etc.
├── theme-student.css          ← Student: Coral Warmth
├── theme-staff.css            ← Staff: Teal Trust
├── theme-dept-admin.css       ← Dept Admin: Amber Authority
├── theme-master-admin.css     ← Master Admin: Purple Power
└── role-colors-new.css        ← Portal activation

docs/
├── DESIGN_SYSTEM_GUIDE.md     ← Full documentation
└── DESIGN_SYSTEM_IMPLEMENTATION.md ← Implementation summary
```

---

## 🚀 How to Use (3 Steps)

### 1. Wrap your portal in theme class

```jsx
// Student Portal
<div className="student-portal">
  <YourComponent />
</div>

// Staff Portal
<div className="staff-portal">
  <YourComponent />
</div>

// Dept Admin
<div className="admin-portal">
  <YourComponent />
</div>

// Master Admin
<div className="master-admin-portal">
  <YourComponent />
</div>
```

### 2. Use design tokens instead of hardcoded values

```css
/* ❌ Old way */
.my-component {
  padding: 24px;
  margin: 16px;
  border-radius: 12px;
  color: #E85D75;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* ✅ New way */
.my-component {
  padding: var(--space-lg);              /* 24px */
  margin: var(--space-md);               /* 16px */
  border-radius: var(--radius-lg);       /* 12px */
  color: var(--role-accent-primary);     /* Portal color */
  box-shadow: var(--shadow-md);          /* Elevation */
}
```

### 3. Use portal-specific component classes

```jsx
{/* Student Portal */}
<button className="btn-primary student-action-btn">
  Book Equipment
</button>

{/* Staff Portal */}
<button className="btn-primary staff-action-btn">
  Manage Booking
</button>

{/* Admin Portals */}
<button className="btn-primary admin-action-btn">
  Approve Request
</button>
```

---

## 📏 Design Token Cheat Sheet

### Spacing (8pt Grid)
```css
--space-xs: 4px       --space-sm: 8px
--space-md: 16px      --space-lg: 24px
--space-xl: 32px      --space-2xl: 48px
--space-3xl: 64px     --space-4xl: 96px
```

### Border Radius
```css
--radius-sm: 6px      --radius-md: 8px
--radius-lg: 12px     --radius-xl: 16px
--radius-2xl: 20px    --radius-full: 9999px
```

### Shadows
```css
--shadow-sm: subtle   --shadow-md: moderate
--shadow-lg: large    --shadow-xl: extra large
```

### Animations
```css
--duration-instant: 100ms
--duration-fast: 150ms
--duration-normal: 250ms
--duration-slow: 350ms

--ease-out-quad: smooth
--ease-in-out: balanced
--ease-bounce: playful
```

---

## 🎯 Portal-Specific Sizes

| Element | Student | Staff | Dept Admin | Master Admin |
|---------|---------|-------|------------|--------------|
| **Button Height** | 48px | 40px | 36px | 32px |
| **Input Height** | 52px | 44px | 38px | 34px |
| **Card Padding** | 24px | 20px | 16px | 12px |
| **Card Gap** | 48px | 24px | 20px | 16px |
| **Section Gap** | 64px | 48px | 32px | 24px |

---

## 🎨 Portal Color Reference

### Student Portal (Coral Warmth)
```css
--student-accent-primary: #E85D75;     /* Vibrant Coral */
--student-bg-primary: #FFFFFF;
--student-bg-secondary: #F5F7FA;
--student-bg-tertiary: #FFEEF2;        /* Coral tint */
```

### Staff Portal (Teal Trust)
```css
--staff-accent-primary: #26A69A;       /* Teal */
--staff-bg-primary: #FFFFFF;
--staff-bg-secondary: #E8EEF2;
--staff-bg-tertiary: #E0F2F1;          /* Teal tint */
```

### Department Admin (Amber Authority)
```css
--dept-accent-primary: #FFA726;        /* Amber/Gold */
--dept-bg-primary: #FAFAFA;
--dept-bg-secondary: #CFD8DC;
--dept-bg-tertiary: #FFF8E1;           /* Amber tint */
```

### Master Admin (Purple Power - Dark Mode)
```css
--master-accent-primary: #7B1FA2;      /* Deep Purple */
--master-bg-primary: #212121;          /* Dark gray */
--master-bg-secondary: #2D2D2D;
--master-text-primary: rgba(255,255,255,0.95);
```

---

## 💡 Quick Tips

1. **Always use tokens:** `var(--space-lg)` not `24px`
2. **Use portal classes:** `.student-portal`, `.staff-portal`, etc.
3. **Test dark mode:** Master Admin uses dark background
4. **Check contrast:** Staff teal and Dept amber need darker shades for text
5. **Follow 8pt grid:** All spacing = multiples of 4px

---

## ⚠️ Common Mistakes

### ❌ Missing portal wrapper
```jsx
{/* Wrong - no theme applied */}
<YourComponent />

{/* Right - theme applied */}
<div className="student-portal">
  <YourComponent />
</div>
```

### ❌ Hardcoded colors
```css
/* Wrong */
color: #E85D75;

/* Right */
color: var(--student-accent-primary);
```

### ❌ Wrong component class
```jsx
{/* Wrong - mixing themes */}
<div className="student-portal">
  <button className="staff-action-btn">Click</button>
</div>

{/* Right - matching theme */}
<div className="student-portal">
  <button className="student-action-btn">Click</button>
</div>
```

---

## 🔍 Testing Your Changes

### Dev Server Running
✅ **Server URL:** [http://localhost:5177/](http://localhost:5177/)

### Quick Visual Test
1. Open each portal in browser
2. Check colors match theme
3. Test button hover states
4. Verify spacing looks correct
5. Test responsive at different widths

### Accessibility Check
1. Tab through interface (focus visible?)
2. Check color contrast (use DevTools)
3. Test with screen reader
4. Verify touch targets >= 44px

---

## 📚 Full Documentation

For complete details, see:

- **[DESIGN_SYSTEM_GUIDE.md](./docs/DESIGN_SYSTEM_GUIDE.md)** - Full documentation
- **[DESIGN_SYSTEM_IMPLEMENTATION.md](./DESIGN_SYSTEM_IMPLEMENTATION.md)** - Implementation summary

---

## 🎉 What's Next?

### Immediate
- ✅ Foundation complete
- ✅ Dev server running
- ⏳ Test in browser
- ⏳ Verify themes load

### Short-Term
- ⏳ Migrate Student Portal components
- ⏳ Migrate Staff Portal components
- ⏳ Migrate Admin Portal components
- ⏳ Run accessibility audit

### Long-Term
- ⏳ Create component library
- ⏳ Add visual regression tests
- ⏳ Optimize bundle size
- ⏳ Production deployment

---

## ❓ Need Help?

1. **Check the full guide:** `docs/DESIGN_SYSTEM_GUIDE.md`
2. **Look at theme files:** See examples in `src/styles/theme-*.css`
3. **Test in isolation:** Create simple test page first
4. **Check browser console:** Look for CSS errors

---

**Current Status:** ✅ Phase 1 Complete - Foundation Ready

**Next Step:** Open [http://localhost:5177/](http://localhost:5177/) and test!

**Save Point Created:** `savepoint-before-major-changes` (git tag)
