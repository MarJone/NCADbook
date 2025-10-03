# NCAD Styling Sub-Agent Specification

**Purpose:** Apply NCAD's official design language to the Equipment Booking System frontend, ensuring visual consistency with the main NCAD website while maintaining all existing functionality.

**Source Analysis:** Based on comprehensive analysis of https://www.ncad.ie/ performed on 2025-10-02

## Design Language Overview

**Visual Tone:** Modern, dynamic, vibrant
**Layout Philosophy:** Flexbox-based with minimal grid usage
**Visual Effects:** Minimal shadows, dynamic transitions
**Responsive Approach:** Mobile-first with progressive enhancement

---

## Core Design System

### 1. Typography System

#### Font Stack
```css
/* Primary Font Family */
--font-primary: 'proxima-nova', 'Helvetica', 'Arial', sans-serif;
--font-secondary: 'Helvetica', 'Arial', sans-serif;
```

**Implementation:**
- Use Proxima Nova from Adobe Fonts (Typekit): https://use.typekit.net/qpk8hon.css
- Fallback to system fonts: Helvetica → Arial → sans-serif

#### Font Size Scale
```css
/* Based on NCAD's most common sizes */
--font-size-xs: 12px;
--font-size-sm: 13px;
--font-size-base: 15px;   /* Base size, most common */
--font-size-md: 16px;
--font-size-lg: 1.067em;  /* ~16px at base 15px */
--font-size-xl: 1.133em;  /* ~17px */
--font-size-2xl: 1.2em;   /* ~18px */
--font-size-3xl: 1.267em; /* ~19px */
```

#### Font Weights
```css
--font-weight-light: 300;    /* Most common on NCAD */
--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

#### Line Heights
```css
--line-height-tight: 1em;
--line-height-base: 24px;    /* Most common for body text */
--line-height-relaxed: 1.333em;
```

**Usage Guidelines:**
- **Headings:** Use font-weight 300 (light) or 700 (bold)
- **Body Text:** Use font-weight 400 (regular), line-height 24px
- **Emphasis:** Use font-weight 600 (semibold) or 700 (bold)
- **Small Text:** 12-13px for metadata, helper text

---

### 2. Color Palette

#### Primary Brand Colors
```css
/* NCAD Red - Primary Brand Color */
--color-primary: #ad424d;
--color-primary-hover: #9a3a44;
--color-primary-light: #c35660;

/* NCAD Blue - Secondary Brand Color */
--color-secondary: #006792;
--color-secondary-hover: #005577;
--color-secondary-light: #0080b0;
```

#### Neutral Colors
```css
/* Grays - Used extensively for text and borders */
--color-gray-dark: #000000;
--color-gray-700: #222222;
--color-gray-600: #666666;  /* Common text color */
--color-gray-400: #b8b8b8;
--color-gray-200: #e0e0e0;
--color-white: #ffffff;
```

#### Semantic Colors
```css
/* Success, Warning, Error (maintain existing functionality colors) */
--color-success: #28a745;
--color-warning: #ffc107;
--color-error: #dc3545;
--color-info: #006792;  /* Use NCAD blue */
```

#### Background Colors
```css
--bg-primary: #ffffff;
--bg-secondary: #f5f5f5;
--bg-dark: #000000;
--bg-overlay: rgba(50, 50, 50, 0.7);  /* NCAD's modal overlay */
```

#### Text Colors
```css
--text-primary: #666666;     /* Primary body text */
--text-heading: #000000;     /* Headings */
--text-light: #ffffff;       /* Light text on dark backgrounds */
--text-muted: #b8b8b8;       /* Muted/disabled text */
```

**Color Usage Guidelines:**
- **Primary Actions:** Use #ad424d (NCAD Red) for primary buttons, CTAs, active states
- **Secondary Actions:** Use #006792 (NCAD Blue) for links, secondary buttons
- **Body Text:** Use #666666 for main content
- **Headings:** Use #000000 for high contrast
- **Backgrounds:** Predominantly white (#ffffff) with light gray (#f5f5f5) for cards/sections

---

### 3. Spacing System

#### Spacing Scale
```css
/* Based on NCAD's most common spacing values */
--spacing-0: 0;
--spacing-xs: 2px;
--spacing-sm: 4px;
--spacing-md: 10px;
--spacing-lg: 20px;
--spacing-xl: 25px;
--spacing-2xl: 30px;
```

#### Spacing Patterns
```css
/* Common padding patterns from NCAD */
--padding-button: 10px 20px;
--padding-card: 20px;
--padding-section: 25px 0 15px 0;
--padding-list-item: 13px 0 8px 0;
```

#### Margin Patterns
```css
--margin-section: 25px 0 15px 0;
--margin-element: 20px;
--margin-small: 4px;
```

**Spacing Guidelines:**
- **Consistent Rhythm:** Use 20px/25px for major sections
- **Compact Elements:** Use 10px for internal spacing
- **Fine Tuning:** Use 2px/4px for tight adjustments
- **Touch Targets:** Minimum 44px height for mobile buttons (padding + content)

---

### 4. Layout System

#### Display Properties
```css
/* NCAD primarily uses flexbox with minimal grid */
.flex-container {
  display: flex;
}

.inline-block {
  display: inline-block;
}

/* Grid usage is minimal - use flexbox as default */
```

#### Flexbox Patterns
```css
/* Common NCAD flexbox patterns */
.flex-row {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.flex-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

#### Container Widths
```css
/* NCAD uses percentage-based containers */
--container-full: 100%;
--container-constrained: 1200px;  /* For wide desktop layouts */
```

**Layout Guidelines:**
- **Prefer Flexbox:** NCAD uses flexbox over grid (7:1 ratio)
- **Fluid Layouts:** Use percentages and max-widths rather than fixed widths
- **Mobile-First:** Start with single-column, expand to multi-column on larger screens

---

### 5. Border Radius & Visual Style

#### Border Radius Scale
```css
--radius-none: 0;         /* Most common on NCAD */
--radius-sm: 2px;         /* Subtle rounding */
--radius-md: 5px;         /* Moderate rounding */
--radius-full: 100%;      /* Circular elements */
```

**Usage:**
- **Buttons:** 2px border-radius (subtle)
- **Cards:** 2-5px border-radius
- **Avatars/Icons:** 100% for circular
- **Default:** 0 (sharp corners are common on NCAD)

---

### 6. Shadows & Depth

#### Box Shadow Scale
```css
/* NCAD uses minimal shadows */
--shadow-none: none;
--shadow-subtle: 0 3px 9px rgba(0, 0, 0, 0.5);  /* NCAD's primary shadow */
--shadow-strong: 0 4px 12px rgba(0, 0, 0, 0.6); /* For modals/overlays */
```

#### Text Shadows
```css
--text-shadow-none: none;  /* NCAD doesn't use text shadows */
```

**Shadow Guidelines:**
- **Minimal Usage:** Use shadows sparingly
- **Modals/Overlays:** Apply subtle shadow (0 3px 9px rgba(0, 0, 0, 0.5))
- **Cards:** Consider no shadow or very subtle shadow
- **Hover States:** No shadow change (use color/transform instead)

---

### 7. Transitions & Animations

#### Transition Timing
```css
/* NCAD's transition patterns */
--easing-standard: cubic-bezier(0.25, 0.1, 0.25, 1);  /* NCAD's easing */
--easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
--duration-fast: 0.2s;
--duration-standard: 0.3s;
```

#### Transition Properties
```css
/* Common NCAD transitions */
.transition-color {
  transition: color var(--easing-standard);
}

.transition-transform {
  transition: transform 0.3s ease-out;
}

.transition-all {
  transition: all 0.2s var(--easing-standard);
}

.transition-border {
  transition: border 0.25s linear;
}
```

**Animation Guidelines:**
- **Subtle Movements:** Use color and transform transitions
- **Duration:** Keep transitions quick (0.2-0.3s)
- **Properties:** Primarily transition color, transform, filter
- **Hover Effects:** Apply color changes, not shadows or heavy effects

---

### 8. Button Styles

#### Primary Button (NCAD Red)
```css
.btn-primary {
  background-color: #ad424d;
  color: #ffffff;
  font-family: 'proxima-nova', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 20px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  min-height: 44px; /* Touch target */
}

.btn-primary:hover {
  background-color: #9a3a44;
}

.btn-primary:active {
  background-color: #8a3339;
}
```

#### Secondary Button (NCAD Blue)
```css
.btn-secondary {
  background-color: #006792;
  color: #ffffff;
  font-family: 'proxima-nova', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 20px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  min-height: 44px;
}

.btn-secondary:hover {
  background-color: #005577;
}
```

#### Outline Button
```css
.btn-outline {
  background-color: transparent;
  color: #ad424d;
  font-family: 'proxima-nova', sans-serif;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 20px;
  border: 2px solid #ad424d;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  min-height: 44px;
}

.btn-outline:hover {
  background-color: #ad424d;
  color: #ffffff;
}
```

---

### 9. Form Styles

#### Input Fields
```css
.form-input {
  font-family: 'proxima-nova', sans-serif;
  font-size: 15px;
  color: #666666;
  background-color: #ffffff;
  border: 1px solid #b8b8b8;
  border-radius: 2px;
  padding: 10px;
  width: 100%;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #006792;
}

.form-input::placeholder {
  color: #b8b8b8;
}
```

#### Labels
```css
.form-label {
  font-family: 'proxima-nova', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
  display: block;
}
```

#### Select Dropdowns
```css
.form-select {
  font-family: 'proxima-nova', sans-serif;
  font-size: 15px;
  color: #666666;
  background-color: #ffffff;
  border: 1px solid #b8b8b8;
  border-radius: 2px;
  padding: 10px;
  width: 100%;
  cursor: pointer;
}
```

---

### 10. Card Styles

#### Standard Card
```css
.card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  padding: 20px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
```

#### Equipment Card (Mobile-First)
```css
.equipment-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s ease;
}

.equipment-card:hover {
  border-color: #ad424d;
}

.equipment-card-image {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 2px;
}

.equipment-card-title {
  font-family: 'proxima-nova', sans-serif;
  font-size: 1.067em;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.equipment-card-description {
  font-family: 'proxima-nova', sans-serif;
  font-size: 13px;
  color: #666666;
  line-height: 24px;
}
```

---

### 11. Navigation Styles

#### Top Navigation Bar
```css
.nav-bar {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-link {
  font-family: 'proxima-nova', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #666666;
  text-decoration: none;
  padding: 10px 20px;
  transition: color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.nav-link:hover {
  color: #ad424d;
}

.nav-link.active {
  color: #ad424d;
  font-weight: 600;
}
```

---

### 12. Table Styles

#### Standard Table
```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'proxima-nova', sans-serif;
  font-size: 15px;
}

.table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
}

.table th {
  padding: 13px 10px;
  text-align: left;
  font-weight: 600;
  color: #000000;
}

.table td {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
  color: #666666;
}

.table tbody tr:hover {
  background-color: #f5f5f5;
}
```

---

### 13. Modal/Overlay Styles

#### Modal Container
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(50, 50, 50, 0.7);  /* NCAD's overlay */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);
  padding: 25px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  font-family: 'proxima-nova', sans-serif;
  font-size: 1.267em;
  font-weight: 700;
  color: #000000;
  margin-bottom: 20px;
}
```

---

### 14. Badge/Status Indicators

#### Status Badges
```css
.badge {
  font-family: 'proxima-nova', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 2px;
  display: inline-block;
  line-height: 1em;
}

.badge-success {
  background-color: #28a745;
  color: #ffffff;
}

.badge-warning {
  background-color: #ffc107;
  color: #000000;
}

.badge-error {
  background-color: #ad424d;
  color: #ffffff;
}

.badge-info {
  background-color: #006792;
  color: #ffffff;
}
```

---

### 15. Responsive Breakpoints

```css
/* Mobile-first approach - NCAD's methodology */
/* Base styles: 320px - 768px (mobile) */

/* Tablet: 768px - 1024px */
@media (min-width: 768px) {
  /* 2-column grids, larger spacing */
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  /* 3-column grids, max-width containers */
}
```

---

## Implementation Strategy

### Phase 1: Core Styles Setup
1. **Load Proxima Nova Font**
   - Add Typekit CSS link to index.html: `<link rel="stylesheet" href="https://use.typekit.net/qpk8hon.css">`

2. **Create CSS Custom Properties**
   - Create `src/styles/ncad-variables.css` with all design tokens
   - Import into main.css

3. **Update Base Styles**
   - Apply font-family to body
   - Set default colors and typography
   - Reset margins/paddings to NCAD standards

### Phase 2: Component Styling
1. **Update Button Components**
   - Apply NCAD button styles to all buttons
   - Ensure proper color usage (red primary, blue secondary)

2. **Update Form Components**
   - Apply NCAD input/select/label styles
   - Ensure focus states use NCAD blue

3. **Update Card Components**
   - Equipment cards
   - Booking cards
   - Dashboard widgets

4. **Update Navigation**
   - Header navigation
   - Sidebar navigation (admin)
   - Breadcrumbs

### Phase 3: Layout Adjustments
1. **Portal Layouts**
   - Student portal
   - Admin portal
   - Staff portal

2. **Page-Level Styles**
   - Dashboard pages
   - Equipment browse
   - Booking management
   - Admin sections

### Phase 4: Fine-Tuning
1. **Responsive Testing**
   - Test on mobile (320px - 768px)
   - Test on tablet (768px - 1024px)
   - Test on desktop (1024px+)

2. **Accessibility Check**
   - Verify color contrast ratios
   - Ensure keyboard navigation works
   - Test with screen readers

3. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge

---

## File-by-File Implementation Checklist

### Files to Update

#### 1. `src/styles/main.css`
- [ ] Import Proxima Nova font
- [ ] Add NCAD CSS custom properties
- [ ] Update base typography
- [ ] Update global colors
- [ ] Apply NCAD spacing scale

#### 2. `src/styles/buttons.css` (or equivalent)
- [ ] Update button styles (primary, secondary, outline)
- [ ] Apply NCAD red/blue colors
- [ ] Update hover/active states
- [ ] Ensure touch targets (44px min height)

#### 3. `src/styles/forms.css` (or equivalent)
- [ ] Update input field styles
- [ ] Update select dropdown styles
- [ ] Update label styles
- [ ] Update focus states (NCAD blue)

#### 4. `src/styles/cards.css` (or equivalent)
- [ ] Update equipment card styles
- [ ] Update booking card styles
- [ ] Apply NCAD border-radius (2px)
- [ ] Update hover effects

#### 5. `src/styles/navigation.css` (or equivalent)
- [ ] Update header navigation
- [ ] Update sidebar navigation
- [ ] Update active link styles (NCAD red)

#### 6. Component-Specific Files
- [ ] `StudentDashboard.jsx` - Apply NCAD styles
- [ ] `EquipmentBrowse.jsx` - Update equipment grid/cards
- [ ] `AdminLayout.jsx` - Update admin portal styling
- [ ] `BookingModal.jsx` - Update modal styles
- [ ] Any other component with inline styles

---

## Testing Checklist

### Visual Consistency
- [ ] All buttons use NCAD red (#ad424d) or blue (#006792)
- [ ] All text uses Proxima Nova font family
- [ ] Font sizes match NCAD scale (15px base)
- [ ] Spacing is consistent (20px/25px major sections, 10px internal)
- [ ] Border radius is subtle (2px) or none

### Color Usage
- [ ] Primary actions use NCAD red (#ad424d)
- [ ] Links use NCAD blue (#006792)
- [ ] Body text uses #666666
- [ ] Headings use #000000
- [ ] Backgrounds are white or light gray

### Responsive Behavior
- [ ] Mobile (320px - 768px) displays properly
- [ ] Tablet (768px - 1024px) uses appropriate layouts
- [ ] Desktop (1024px+) shows multi-column layouts
- [ ] Touch targets are 44px minimum on mobile

### Functionality Preservation
- [ ] All booking workflows function correctly
- [ ] Admin approval workflows work
- [ ] Equipment browsing/filtering works
- [ ] Modal interactions work
- [ ] Form submissions work
- [ ] Navigation functions properly

### Accessibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works throughout
- [ ] Focus states are visible
- [ ] ARIA labels are present
- [ ] Screen reader compatibility

---

## Success Criteria

1. **Visual Consistency:** All pages visually match NCAD's design language
2. **Functionality Preserved:** Zero breaking changes to existing features
3. **Responsive:** Flawless display on mobile, tablet, desktop
4. **Performance:** No performance degradation
5. **Accessibility:** Maintains WCAG 2.2 AA compliance
6. **Brand Alignment:** Colors, typography, spacing match NCAD.ie

---

## Notes for Implementation

- **Do NOT change functionality:** This is a pure visual/styling update
- **Do NOT modify logic:** Keep all JavaScript logic unchanged
- **Do NOT alter data flow:** Keep Supabase queries/mutations as-is
- **Focus on CSS:** Primary changes should be in stylesheets
- **Component Props:** Only change style-related props (className, style attributes)
- **Preserve Tests:** All Playwright tests should continue to pass

---

## Quick Reference: Most Important NCAD Styles

```css
/* Copy-paste these variables into your project */
:root {
  /* Colors */
  --ncad-red: #ad424d;
  --ncad-blue: #006792;
  --ncad-gray: #666666;

  /* Typography */
  --ncad-font: 'proxima-nova', 'Helvetica', 'Arial', sans-serif;
  --ncad-font-size: 15px;
  --ncad-line-height: 24px;
  --ncad-font-weight-light: 300;
  --ncad-font-weight-semibold: 600;
  --ncad-font-weight-bold: 700;

  /* Spacing */
  --ncad-spacing-sm: 10px;
  --ncad-spacing-md: 20px;
  --ncad-spacing-lg: 25px;

  /* Borders */
  --ncad-radius: 2px;

  /* Shadows */
  --ncad-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);

  /* Transitions */
  --ncad-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ncad-duration: 0.2s;
}
```

---

End of NCAD Styling Sub-Agent Specification
