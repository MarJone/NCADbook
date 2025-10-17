# Design Tokens Developer Guide

**Version:** 2.0
**Last Updated:** October 17, 2025
**Status:** Production Ready

---

## Table of Contents

1. [Introduction](#introduction)
2. [What Are Design Tokens?](#what-are-design-tokens)
3. [Token Architecture](#token-architecture)
4. [Using Design Tokens](#using-design-tokens)
5. [Token Categories](#token-categories)
6. [Portal-Specific Tokens](#portal-specific-tokens)
7. [Migration Guide](#migration-guide)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

Design tokens are the **single source of truth** for all visual design decisions in the NCAD Equipment Booking System. They ensure consistency, maintainability, and accessibility across all portals.

### Why Design Tokens?

**Before (Hard-coded values):**
```css
.button {
  background: #E85D75;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

**Problems:**
- ❌ Color value repeated across multiple files
- ❌ Changing brand colors requires finding/replacing everywhere
- ❌ Accessibility adjustments require manual updates
- ❌ No guarantee of consistency

**After (Design tokens):**
```css
.button {
  background: var(--color-primary);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```

**Benefits:**
- ✅ Update once, changes everywhere
- ✅ Guaranteed consistency
- ✅ Accessibility built-in (WCAG AA compliant colors)
- ✅ Semantic naming makes intent clear
- ✅ Portal-specific theming automatic

---

## What Are Design Tokens?

Design tokens are **CSS custom properties** (variables) that store design decisions like colors, spacing, typography, and more.

### Core Concept

```css
/* Token definition in design-tokens.css */
:root {
  --color-primary: #1E40AF;
  --space-md: 16px;
}

/* Token usage in components */
.my-component {
  color: var(--color-primary);
  padding: var(--space-md);
}
```

When you update `--color-primary` in one place, **every component using it updates automatically**.

---

## Token Architecture

### File Structure

```
src/styles/
├── design-tokens.css       # Global token definitions (76 tokens)
├── theme-student.css       # Student portal theme
├── theme-staff.css         # Staff portal theme
├── theme-dept-admin.css    # Department admin theme
├── theme-master-admin.css  # Master admin theme
└── components/             # Component styles using tokens
```

### Token Layers

1. **Global Tokens** (`design-tokens.css`)
   - Base colors, spacing, typography
   - Shared across all portals
   - Example: `--color-primary`, `--space-md`

2. **Portal Themes** (`theme-*.css`)
   - Portal-specific overrides
   - Student (coral), Staff (teal), Admin (amber), Master Admin (purple)
   - Example: `--student-accent-primary`, `--staff-accent-primary`

3. **Component Tokens** (component CSS files)
   - Local overrides for specific components
   - Rare, prefer global/portal tokens

---

## Using Design Tokens

### Basic Usage

**✅ Correct:**
```css
.my-component {
  color: var(--color-body-text);
  background: var(--color-surface);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

**❌ Incorrect:**
```css
.my-component {
  color: #374151;
  background: #F9FAFB;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### With Fallbacks (Optional)

```css
.my-component {
  /* Fallback value if token not defined */
  color: var(--color-primary, #1E40AF);
}
```

**Note:** Fallbacks are optional in our system since all tokens are defined globally.

---

## Token Categories

### 1. Color Tokens (24 total)

#### Primary Colors
```css
--color-primary: #1E40AF;        /* Blue 800 - Primary CTA */
--color-secondary: #7C3AED;      /* Violet 600 - Secondary accent */
--color-accent: #F59E0B;         /* Amber 500 - Highlights */
```

#### Neutral Scale (Grays)
```css
--color-white: #FFFFFF;
--color-surface: #F9FAFB;        /* Gray 50 - Background */
--color-border: #E5E7EB;         /* Gray 200 - Borders */
--color-subtle: #9CA3AF;         /* Gray 400 - Subtle text */
--color-muted: #6B7280;          /* Gray 500 - Muted text */
--color-body-text: #374151;      /* Gray 700 - Body text */
--color-headings: #111827;       /* Gray 900 - Headings */
```

#### Status Colors
```css
--color-success: #10B981;        /* Green */
--color-success-bg: #D1FAE5;     /* Light green bg */
--color-warning: #F59E0B;        /* Amber */
--color-warning-bg: #FEF3C7;     /* Light amber bg */
--color-error: #EF4444;          /* Red */
--color-error-bg: #FEE2E2;       /* Light red bg */
--color-info: #3B82F6;           /* Blue */
--color-info-bg: #DBEAFE;        /* Light blue bg */
```

#### Availability States
```css
--color-available: #10B981;      /* Green - Equipment available */
--color-unavailable: #EF4444;    /* Red - Equipment unavailable */
--color-reserved: #F59E0B;       /* Amber - Equipment reserved */
--color-maintenance: #6B7280;    /* Gray - Under maintenance */
```

**Usage Example:**
```css
.status-badge {
  background: var(--color-success-bg);
  color: var(--color-success);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}
```

### 2. Typography Tokens (30 total)

#### Heading Tokens
```css
/* H1 */
--font-size-h1: 2.25rem;         /* 36px */
--line-height-h1: 1.2;
--font-weight-h1: 700;

/* H2 */
--font-size-h2: 1.875rem;        /* 30px */
--line-height-h2: 1.25;
--font-weight-h2: 700;

/* H3-H6 similarly defined */
```

#### Body Text Tokens
```css
--font-size-body: 1rem;          /* 16px */
--line-height-body: 1.5;
--font-weight-body: 400;

--font-size-small: 0.875rem;     /* 14px */
--line-height-small: 1.4;
```

**Usage Example:**
```css
h1 {
  font-size: var(--font-size-h1);
  line-height: var(--line-height-h1);
  font-weight: var(--font-weight-h1);
  color: var(--color-headings);
}

p {
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  color: var(--color-body-text);
}
```

### 3. Spacing Tokens (10 total)

Based on **8pt grid system**, Tailwind-compatible:

```css
--space-2xs: 2px;      /* 0.125rem - Tailwind 0.5 */
--space-xs: 4px;       /* 0.25rem - Tailwind 1 */
--space-sm: 8px;       /* 0.5rem - Tailwind 2 */
--space-md-sm: 12px;   /* 0.75rem - Tailwind 3 */
--space-md: 16px;      /* 1rem - Tailwind 4 */
--space-lg: 24px;      /* 1.5rem - Tailwind 6 */
--space-xl: 32px;      /* 2rem - Tailwind 8 */
--space-2xl: 48px;     /* 3rem - Tailwind 12 */
--space-3xl: 64px;     /* 4rem - Tailwind 16 */
--space-4xl: 96px;     /* 6rem - Tailwind 24 */
```

**Usage Example:**
```css
.card {
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  gap: var(--space-sm);
}
```

### 4. Border Radius Tokens (6 total)

```css
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;   /* Fully rounded (pills, circles) */
```

**Usage Example:**
```css
.button {
  border-radius: var(--radius-md);
}

.avatar {
  border-radius: var(--radius-full);
}
```

### 5. Shadow Tokens (6 total)

Tailwind-aligned elevation system:

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

**Usage Example:**
```css
.card {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-2xl);
}
```

### 6. Focus Ring Tokens (4 total)

WCAG 2.1 AA compliant focus indicators:

```css
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
--focus-ring-color: var(--color-primary);
--focus-ring-opacity: 0.5;
```

**Usage Example:**
```css
button:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  opacity: var(--focus-ring-opacity);
}
```

---

## Portal-Specific Tokens

Each portal has its own theme file with accent colors optimized for WCAG AA accessibility:

### Student Portal (Coral Warmth)

**File:** `theme-student.css`
**Accent Color:** `#C2185B` (Dark Coral - 4.6:1 contrast)

```css
--student-accent-primary: #C2185B;
--student-bg-primary: #FFFFFF;
--student-bg-secondary: #F5F7FA;
--student-bg-tertiary: #FFEEF2;
--student-text-primary: #1A1A1A;
```

### Staff Portal (Teal Trust)

**File:** `theme-staff.css`
**Accent Color:** `#00796B` (Dark Teal - 4.8:1 contrast)

```css
--staff-accent-primary: #00796B;
--staff-bg-primary: #FFFFFF;
--staff-bg-secondary: #E8EEF2;
--staff-bg-tertiary: #E0F2F1;
--staff-text-primary: #212121;
```

### Department Admin (Amber Authority)

**File:** `theme-dept-admin.css`
**Accent Color:** `#BF360C` (Very Dark Amber - 6.4:1 contrast - exceeds AAA!)

```css
--dept-accent-primary: #BF360C;
--dept-bg-primary: #FAFAFA;
--dept-bg-secondary: #CFD8DC;
--dept-bg-tertiary: #FFF8E1;
--dept-text-primary: #1A1A1A;
```

### Master Admin (Purple Authority)

**File:** `theme-master-admin.css`
**Accent Color:** `#7B1FA2` (Dark Purple - 5.2:1 contrast)

```css
--master-accent-primary: #7B1FA2;
--master-bg-primary: #FAFAFA;
--master-bg-secondary: #CFD8DC;
--master-bg-tertiary: #F3E5F5;
--master-text-primary: #1A1A1A;
```

---

## Migration Guide

### Step 1: Identify Hard-Coded Values

**Find all hard-coded values in your component:**
```css
/* BEFORE - Hard-coded values */
.my-component {
  background: #E85D75;           /* 🔴 Hard-coded color */
  padding: 16px 24px;            /* 🔴 Hard-coded spacing */
  border-radius: 8px;            /* 🔴 Hard-coded radius */
  color: #374151;                /* 🔴 Hard-coded text color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* 🔴 Hard-coded shadow */
}
```

### Step 2: Replace with Appropriate Tokens

**Map hard-coded values to semantic tokens:**
```css
/* AFTER - Design tokens */
.my-component {
  background: var(--color-primary);      /* ✅ Semantic color */
  padding: var(--space-md) var(--space-lg);  /* ✅ Spacing scale */
  border-radius: var(--radius-md);       /* ✅ Consistent radius */
  color: var(--color-body-text);         /* ✅ Accessible text color */
  box-shadow: var(--shadow-sm);          /* ✅ Elevation system */
}
```

### Step 3: Test Across All Portals

After migration, test in all 4 portals to ensure consistency:
- Student Portal (http://localhost:5173/NCADbook/student)
- Staff Portal (http://localhost:5173/NCADbook/staff)
- Department Admin (http://localhost:5173/NCADbook/admin with dept admin user)
- Master Admin (http://localhost:5173/NCADbook/admin with master admin user)

### Step 4: Verify Accessibility

Run accessibility audit to ensure WCAG compliance:
```bash
node scripts/accessibility-audit.js
```

**Target:** 0 violations, 100% WCAG 2.1 AA compliance

---

## Best Practices

### ✅ DO

1. **Use semantic tokens**
   ```css
   /* Good - Semantic meaning clear */
   color: var(--color-body-text);
   background: var(--color-surface);
   ```

2. **Prefer global tokens over portal-specific**
   ```css
   /* Good - Works in all portals */
   padding: var(--space-md);

   /* Use portal tokens only when needed */
   color: var(--student-accent-primary);
   ```

3. **Use spacing tokens for ALL spacing**
   ```css
   /* Good */
   margin: var(--space-lg);
   gap: var(--space-sm);
   padding: var(--space-md) var(--space-xl);
   ```

4. **Combine tokens for complex values**
   ```css
   /* Good */
   box-shadow: var(--shadow-md);
   border: 1px solid var(--color-border);
   ```

5. **Comment custom calculations**
   ```css
   /* Good */
   padding-left: calc(var(--space-md) - 1px);  /* Compensate for 2px border */
   ```

### ❌ DON'T

1. **Don't use hard-coded colors**
   ```css
   /* Bad */
   color: #E85D75;
   background: rgb(232, 93, 117);
   ```

2. **Don't use arbitrary spacing values**
   ```css
   /* Bad */
   padding: 13px;  /* Not on 8pt grid */
   margin: 17px;   /* Use tokens instead */
   ```

3. **Don't create local token overrides unnecessarily**
   ```css
   /* Bad - Creates inconsistency */
   .my-component {
     --my-custom-color: #FF0000;
     color: var(--my-custom-color);
   }

   /* Good - Use existing tokens */
   .my-component {
     color: var(--color-error);
   }
   ```

4. **Don't mix tokens and hard-coded values**
   ```css
   /* Bad - Inconsistent approach */
   .my-component {
     padding: var(--space-md);
     margin: 20px;  /* Should be var(--space-lg) */
   }
   ```

---

## Common Patterns

### Pattern 1: Card Component

```css
.card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}

.card-header {
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-h3);
  color: var(--color-headings);
  margin: 0;
}

.card-body {
  color: var(--color-body-text);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
}
```

### Pattern 2: Button Component

```css
.btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary);
  filter: brightness(1.1);
}

.btn-primary:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

### Pattern 3: Form Input

```css
.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-body-text);
  font-size: var(--font-size-body);
  transition: all var(--duration-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
}

.form-input.error {
  border-color: var(--color-error);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

### Pattern 4: Status Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  line-height: 1;
}

.badge-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.badge-error {
  background: var(--color-error-bg);
  color: var(--color-error);
}
```

---

## Troubleshooting

### Issue: Token not showing up

**Problem:** `var(--my-token)` displays as nothing or falls back to default

**Solution:**
1. Check token is defined in `design-tokens.css`
2. Verify CSS file is imported in correct order
3. Check for typos in token name
4. Use browser DevTools to inspect computed styles

### Issue: Portal-specific colors not working

**Problem:** Portal accent color shows as default blue instead of coral/teal/amber/purple

**Solution:**
1. Ensure portal theme file is imported after `design-tokens.css`
2. Check portal wrapper class exists (`.student-portal`, `.staff-portal`, etc.)
3. Verify you're using portal-specific token (e.g., `--student-accent-primary`)

### Issue: Colors look different in different portals

**Problem:** Component looks different in Student vs Staff portal

**Expected behavior:** This is intentional! Each portal has its own theme.

**Solution:**
- Use `--color-primary` for global consistency
- Use `--student-accent-primary` etc. for portal-specific styling

### Issue: Hard-coded rgba values

**Problem:** Old rgba colors still showing

**Solution:** Replace with token-based rgba:
```css
/* Before */
box-shadow: 0 0 0 3px rgba(232, 93, 117, 0.1);

/* After - Extract RGB from token */
box-shadow: 0 0 0 3px rgba(194, 24, 91, 0.1);  /* Matches --color-primary #C2185B */
```

---

## Quick Reference

### Most Common Tokens

**Colors:**
- `--color-primary` - Primary brand color
- `--color-body-text` - Body text color
- `--color-border` - Default border color
- `--color-surface` - Background surface color

**Spacing:**
- `--space-sm` - 8px
- `--space-md` - 16px
- `--space-lg` - 24px
- `--space-xl` - 32px

**Typography:**
- `--font-size-body` - 16px
- `--font-size-h1` - 36px
- `--line-height-body` - 1.5

**Other:**
- `--radius-md` - 8px border radius
- `--shadow-md` - Medium elevation
- `--focus-ring-width` - 2px focus outline

### Portal Accent Colors (WCAG AA Compliant)

- Student: `--student-accent-primary` → `#C2185B` (Coral)
- Staff: `--staff-accent-primary` → `#00796B` (Teal)
- Dept Admin: `--dept-accent-primary` → `#BF360C` (Amber)
- Master Admin: `--master-accent-primary` → `#7B1FA2` (Purple)

---

## Resources

- **Design Tokens File:** `src/styles/design-tokens.css`
- **Style Guide:** `context/style-guide.md`
- **Component Examples:** `src/styles/components-*.css`
- **Accessibility Audit:** Run `node scripts/accessibility-audit.js`

---

## Support

**Questions?** Check:
1. This developer guide
2. Component inventory: `review/COMPONENT_INVENTORY.md`
3. Sprint 1 summary: `review/SPRINT_1_COMPLETE.md`

**Found a missing token?** Create a ticket or update `design-tokens.css` following the naming conventions in this guide.

---

**Happy coding with design tokens! 🎨**
