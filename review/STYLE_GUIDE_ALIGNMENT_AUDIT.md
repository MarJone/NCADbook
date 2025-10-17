# Style Guide Alignment Audit

**Date:** October 17, 2025
**Status:** Analysis Complete
**Files Compared:**
- Current: [src/styles/design-tokens.css](../src/styles/design-tokens.css)
- Target: [context/style-guide.md](../context/style-guide.md)

---

## Executive Summary

The current `design-tokens.css` file is **missing critical color palette definitions** and has **incomplete typography specifications**. While spacing, shadows, and animation systems are well-defined, they need adjustment to match the style guide's specifications.

### Critical Findings:
1. ❌ **NO COLOR PALETTE** - design-tokens.css contains zero color definitions
2. ⚠️ **INCOMPLETE TYPOGRAPHY** - Font sizes defined but missing line-heights and proper scale
3. ⚠️ **SPACING MISALIGNMENT** - Uses 8pt grid but doesn't match Tailwind scale exactly
4. ⚠️ **BORDER RADIUS DISCREPANCY** - Values don't match style guide specifications
5. ✅ **SHADOW SYSTEM** - Well-defined but needs minor adjustments

---

## 1. Color Palette Discrepancies

### CRITICAL: Missing Entire Color System

**Current State:** design-tokens.css has **ZERO color definitions**

**Required from style-guide.md:**

#### Primary Colors (MISSING)
```css
--color-primary: #1E40AF;      /* Blue 800 */
--color-secondary: #7C3AED;    /* Violet 600 */
--color-accent: #F59E0B;       /* Amber 500 */
```

#### Neutral Scale (MISSING)
```css
--color-white: #FFFFFF;
--color-surface: #F9FAFB;      /* Gray 50 */
--color-border: #E5E7EB;       /* Gray 200 */
--color-subtle: #9CA3AF;       /* Gray 400 */
--color-muted: #6B7280;        /* Gray 500 */
--color-body-text: #374151;    /* Gray 700 */
--color-headings: #111827;     /* Gray 900 */
```

#### Status Colors (MISSING)
```css
--color-success: #10B981;      /* Green 500 */
--color-success-bg: #D1FAE5;   /* Green 100 */
--color-warning: #F59E0B;      /* Amber 500 */
--color-warning-bg: #FEF3C7;   /* Amber 100 */
--color-error: #EF4444;        /* Red 500 */
--color-error-bg: #FEE2E2;     /* Red 100 */
--color-info: #3B82F6;         /* Blue 500 */
--color-info-bg: #DBEAFE;      /* Blue 100 */
```

#### Availability States (MISSING)
```css
--color-available: #10B981;    /* Green 500 */
--color-unavailable: #EF4444;  /* Red 500 */
--color-reserved: #F59E0B;     /* Amber 500 */
--color-maintenance: #6B7280;  /* Gray 500 */
```

**Impact:** HIGH PRIORITY - Without these, components cannot reference design tokens and are likely using hardcoded colors.

---

## 2. Typography Discrepancies

### Font Families

**Current:**
```css
--font-display: 'Space Grotesk', 'GT America', system-ui, sans-serif;
--font-body: 'Inter', 'DM Sans', system-ui, -apple-system, sans-serif;
```

**Style Guide:**
```css
Primary (UI): Inter, system-ui, sans-serif
Headings: Inter, system-ui, sans-serif
Monospace: 'JetBrains Mono', 'Courier New', monospace
```

**Issue:**
- ❌ Current uses "Space Grotesk" for display (not in style guide)
- ❌ Current uses "DM Sans" fallback (not in style guide)
- ❌ Missing monospace font family definition

**Recommendation:**
- Simplify to Inter for both UI and headings
- Add monospace font family

### Font Size Scale

**Current:**
```css
--font-size-xs: 11px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-md: 18px;
--font-size-lg: 20px;
--font-size-xl: 24px;
--font-size-2xl: 32px;
--font-size-3xl: 40px;
--font-size-4xl: 48px;
--font-size-5xl: 64px;
```

**Style Guide (with line-heights):**
```css
Display Large: 4rem (64px) / 1.1 line-height / 700 weight
Display: 3rem (48px) / 1.1 line-height / 700 weight
H1: 2.25rem (36px) / 1.2 line-height / 700 weight
H2: 1.875rem (30px) / 1.3 line-height / 600 weight
H3: 1.5rem (24px) / 1.4 line-height / 600 weight
H4: 1.25rem (20px) / 1.4 line-height / 600 weight
Body Large: 1.125rem (18px) / 1.6 line-height / 400 weight
Body: 1rem (16px) / 1.5 line-height / 400 weight
Body Small: 0.875rem (14px) / 1.5 line-height / 400 weight
Caption: 0.75rem (12px) / 1.4 line-height / 500 weight
```

**Issues:**
- ⚠️ Current has font-size-md (18px) but style guide uses "Body Large" terminology
- ⚠️ Missing H1 size (36px/2.25rem)
- ⚠️ Missing H2 size (30px/1.875rem)
- ❌ **CRITICAL:** No line-height definitions
- ❌ **CRITICAL:** No semantic naming (display-lg, h1, h2, etc.)

### Font Weights

**Current:**
```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**Style Guide:**
```css
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

**Status:** ✅ ALIGNED

### Letter Spacing

**Current:**
```css
--letter-spacing-tight: -0.02em;
--letter-spacing-normal: 0;
--letter-spacing-wide: 0.01em;
```

**Style Guide:** Not explicitly defined

**Status:** ✅ GOOD (reasonable defaults)

---

## 3. Spacing Scale Discrepancies

**Current (8pt grid):**
```css
--space-xs: 4px;      /* 0.25rem */
--space-sm: 8px;      /* 0.5rem */
--space-md: 16px;     /* 1rem */
--space-lg: 24px;     /* 1.5rem */
--space-xl: 32px;     /* 2rem */
--space-2xl: 48px;    /* 3rem */
--space-3xl: 64px;    /* 4rem */
--space-4xl: 96px;    /* 6rem */
```

**Style Guide (Tailwind scale):**
```
0.5:  0.125rem (2px)   ← MISSING
1:    0.25rem (4px)    = space-xs ✅
2:    0.5rem (8px)     = space-sm ✅
3:    0.75rem (12px)   ← MISSING
4:    1rem (16px)      = space-md ✅
6:    1.5rem (24px)    = space-lg ✅
8:    2rem (32px)      = space-xl ✅
12:   3rem (48px)      = space-2xl ✅
16:   4rem (64px)      = space-3xl ✅
24:   6rem (96px)      = space-4xl ✅
```

**Issues:**
- ⚠️ Missing `--space-2xs: 2px` (Tailwind 0.5)
- ⚠️ Missing `--space-md-sm: 12px` (Tailwind 3)
- ⚠️ Not semantically aligned with Tailwind naming

**Recommendation:** Add missing values for complete Tailwind compatibility

---

## 4. Border Radius Discrepancies

**Current:**
```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 20px;
--radius-3xl: 24px;
--radius-full: 9999px;
```

**Style Guide:**
```css
Small: 0.25rem (4px)        - Tags, badges
Default: 0.5rem (8px)       - Buttons, inputs, cards
Large: 0.75rem (12px)       - Modals, major containers
Extra Large: 1rem (16px)    - Feature sections
Full: 9999px                - Pills, circular buttons
```

**Issues:**
- ⚠️ Current has `--radius-sm: 6px` but style guide specifies 8px for "Default"
- ⚠️ Current has extra sizes (2xl: 20px, 3xl: 24px) not in style guide
- ⚠️ Semantic naming doesn't match style guide (small, default, large, extra-large)

**Recommendation:** Align with style guide's 4-tier system (4px, 8px, 12px, 16px, full)

---

## 5. Shadow System Discrepancies

**Current:**
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

**Style Guide (Tailwind):**
```css
sm: Small cards, dropdowns
DEFAULT: Standard cards
md: Elevated panels
lg: Modals, popovers
xl: Hero sections
```

**Status:** ⚠️ MOSTLY ALIGNED
- Current has 6 levels (xs, sm, md, lg, xl, 2xl)
- Style guide expects Tailwind's 5-level system (sm, default, md, lg, xl)
- Shadow values are reasonable but could be tweaked to match Tailwind exactly

**Recommendation:** Use Tailwind's exact shadow values for consistency

---

## 6. Animation & Transitions

**Current:**
```css
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

**Style Guide:**
```css
Fast: 100ms (immediate feedback)
Default: 200ms (standard transitions)
Slow: 300ms (complex animations)

Default: ease-in-out (CSS default)
Enter: ease-out (elements appearing)
Exit: ease-in (elements disappearing)
```

**Issues:**
- ⚠️ `--duration-normal: 250ms` but style guide specifies 200ms as default
- ⚠️ `--duration-slow: 350ms` but style guide specifies 300ms
- ⚠️ Missing semantic names for enter/exit easing functions
- ✅ Has `--ease-bounce` which is good for microinteractions

**Recommendation:** Adjust duration values to match style guide, add semantic easing names

---

## 7. Responsive Breakpoints

**Current:**
```css
--breakpoint-mobile: 320px;
--breakpoint-mobile-lg: 480px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-desktop-lg: 1440px;
--breakpoint-desktop-xl: 1920px;
--breakpoint-4k: 2560px;
```

**Style Guide (Tailwind):**
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

**Issues:**
- ⚠️ Current has 7 breakpoints, Tailwind has 5
- ⚠️ Current has 320px and 480px (not in Tailwind)
- ⚠️ Missing Tailwind's `sm: 640px` breakpoint
- ⚠️ `--breakpoint-desktop-xl: 1920px` doesn't match Tailwind's `xl: 1280px`

**Status:** MISALIGNED but intentional for project needs (desktop-first 1440px design)

**Recommendation:** Keep current breakpoints but add Tailwind equivalents for compatibility

---

## 8. Additional Missing Specifications

### Focus States
**Style Guide specifies:**
```css
Focus Ring: ring-2 ring-offset-2 ring-blue-500
Keyboard Focus: Always visible
High contrast: 3:1 contrast ratio minimum
```

**Current:** Not defined in design-tokens.css

**Recommendation:** Add focus ring tokens:
```css
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
--focus-ring-color: var(--color-primary);
```

### Touch Targets
**Current:**
```css
--touch-target-min: 44px;
--touch-target-comfortable: 48px;
--touch-target-spacious: 56px;
```

**Style Guide:**
```
Minimum: 44x44px
Preferred: 48x48px
```

**Status:** ✅ WELL DEFINED (includes bonus "spacious" option)

### Z-Index Scale
**Current:**
```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

**Style Guide:** Not explicitly defined

**Status:** ✅ WELL DEFINED (excellent layering system)

---

## Implementation Priority

### 🔴 CRITICAL (Do First)
1. **Add complete color palette** (primary, secondary, neutrals, status, availability)
2. **Add line-height tokens** for all typography sizes
3. **Add semantic typography tokens** (display-lg, h1, h2, etc.)
4. **Simplify font families** to match style guide (Inter only)
5. **Add monospace font family**

### 🟡 HIGH PRIORITY (Do Next)
6. **Adjust animation durations** (250ms → 200ms, 350ms → 300ms)
7. **Add missing spacing values** (2px, 12px)
8. **Simplify border radius** to 4-tier system
9. **Add focus ring tokens**
10. **Align shadow values** with Tailwind

### 🟢 NICE TO HAVE (Do Later)
11. Add semantic easing function names (--ease-enter, --ease-exit)
12. Add Tailwind-compatible breakpoint aliases
13. Document legacy compatibility mappings

---

## Recommended Next Steps

1. **Create backup branch** (if not already done)
2. **Update design-tokens.css** with all color definitions
3. **Add semantic typography tokens** with line-heights
4. **Test visual regression** on key pages
5. **Update component CSS** to use new tokens
6. **Run accessibility audit** to verify contrast ratios
7. **Document token usage** in component examples

---

## Appendix: Token Naming Convention

### Current Approach
Uses descriptive names: `--space-md`, `--radius-lg`, `--shadow-xl`

### Style Guide Approach
Uses Tailwind-inspired utility classes but expects CSS custom properties

### Recommendation
**Adopt hybrid approach:**
- Keep descriptive token names for CSS (`--color-primary`, `--space-lg`)
- Map to semantic component tokens (`--button-bg-primary: var(--color-primary)`)
- Maintain backward compatibility aliases for legacy code

---

## Files to Update

1. **[src/styles/design-tokens.css](../src/styles/design-tokens.css)** - Add all missing tokens
2. **[src/styles/design-system.css](../src/styles/design-system.css)** - Update component styles to use new tokens
3. **Portal theme files** - Update to reference aligned color palette
4. **Component CSS files** - Replace hardcoded values with tokens

---

**Audit completed by:** Claude Code
**Date:** October 17, 2025
**Status:** Ready for implementation
