# Style Guide - Academic Equipment Booking System

## Color Palette

### Primary Colors
```
Brand Primary:     #1E40AF (Blue 800)
Brand Secondary:   #7C3AED (Violet 600)
Brand Accent:      #F59E0B (Amber 500)
```

### Neutral Scale
```
Background:        #FFFFFF (White)
Surface:           #F9FAFB (Gray 50)
Border:            #E5E7EB (Gray 200)
Subtle:            #9CA3AF (Gray 400)
Muted:             #6B7280 (Gray 500)
Body Text:         #374151 (Gray 700)
Headings:          #111827 (Gray 900)
```

### Status Colors
```
Success:           #10B981 (Green 500)
Success Bg:        #D1FAE5 (Green 100)
Warning:           #F59E0B (Amber 500)
Warning Bg:        #FEF3C7 (Amber 100)
Error:             #EF4444 (Red 500)
Error Bg:          #FEE2E2 (Red 100)
Info:              #3B82F6 (Blue 500)
Info Bg:           #DBEAFE (Blue 100)
```

### Availability States
```
Available:         #10B981 (Green 500) + "Available" text
Unavailable:       #EF4444 (Red 500) + "Unavailable" text
Reserved:          #F59E0B (Amber 500) + "Reserved" text
Maintenance:       #6B7280 (Gray 500) + "Maintenance" text
```

---

## Typography

### Font Families
```
Primary (UI):      Inter, system-ui, sans-serif
Headings:          Inter, system-ui, sans-serif
Monospace:         'JetBrains Mono', 'Courier New', monospace
```

### Type Scale
```
Display Large:     4rem (64px) / 1.1 line-height / 700 weight
Display:           3rem (48px) / 1.1 line-height / 700 weight
H1:                2.25rem (36px) / 1.2 line-height / 700 weight
H2:                1.875rem (30px) / 1.3 line-height / 600 weight
H3:                1.5rem (24px) / 1.4 line-height / 600 weight
H4:                1.25rem (20px) / 1.4 line-height / 600 weight
Body Large:        1.125rem (18px) / 1.6 line-height / 400 weight
Body:              1rem (16px) / 1.5 line-height / 400 weight
Body Small:        0.875rem (14px) / 1.5 line-height / 400 weight
Caption:           0.75rem (12px) / 1.4 line-height / 500 weight
```

### Font Weights
```
Regular:           400
Medium:            500
Semibold:          600
Bold:              700
```

---

## Spacing Scale

Use Tailwind's spacing scale consistently:
```
0.5:  0.125rem (2px)
1:    0.25rem (4px)
2:    0.5rem (8px)
3:    0.75rem (12px)
4:    1rem (16px)
6:    1.5rem (24px)
8:    2rem (32px)
12:   3rem (48px)
16:   4rem (64px)
24:   6rem (96px)
```

### Common Spacing Patterns
- Card padding: `p-6` (24px)
- Section spacing: `space-y-8` (32px)
- Button padding: `px-6 py-3` (24px horizontal, 12px vertical)
- Input padding: `px-4 py-2` (16px horizontal, 8px vertical)
- Page margins: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`

---

## Borders & Radii

### Border Radius
```
Small:             0.25rem (4px)   - Tags, badges
Default:           0.5rem (8px)    - Buttons, inputs, cards
Large:             0.75rem (12px)  - Modals, major containers
Extra Large:       1rem (16px)     - Feature sections
Full:              9999px          - Pills, circular buttons
```

### Border Widths
```
Default:           1px
Thick:             2px
Focus Ring:        3px (offset 2px)
```

---

## Shadows

Use Tailwind shadow utilities:
```
sm:     Small cards, dropdowns
DEFAULT: Standard cards
md:     Elevated panels
lg:     Modals, popovers
xl:     Hero sections
```

### Focus States
```
Focus Ring: ring-2 ring-offset-2 ring-blue-500
```

---

## Component Patterns

### Buttons

#### Primary CTA
```css
Background: bg-blue-600
Hover: hover:bg-blue-700
Text: text-white font-semibold
Padding: px-6 py-3
Radius: rounded-lg
Shadow: shadow-sm
Transition: transition-colors duration-200
Focus: focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
```

#### Secondary
```css
Background: bg-white
Border: border-2 border-gray-300
Hover: hover:border-gray-400
Text: text-gray-700 font-semibold
Padding: px-6 py-3
Radius: rounded-lg
```

#### Destructive
```css
Background: bg-red-600
Hover: hover:bg-red-700
Text: text-white font-semibold
Padding: px-6 py-3
Radius: rounded-lg
```

---

### Inputs & Forms

#### Text Input
```css
Border: border border-gray-300 rounded-lg
Focus: focus:ring-2 focus:ring-blue-500 focus:border-transparent
Padding: px-4 py-2
Text: text-gray-900
Placeholder: placeholder:text-gray-400
```

#### Input Label
```css
Text: text-sm font-medium text-gray-700
Spacing: mb-2
```

#### Error State
```css
Border: border-red-500
Message: text-sm text-red-600 mt-1
Icon: inline red icon before message
```

---

### Cards

#### Standard Card
```css
Background: bg-white
Border: border border-gray-200
Radius: rounded-lg
Shadow: shadow-sm
Padding: p-6
Hover: hover:shadow-md transition-shadow duration-200
```

#### Interactive Card
```css
Cursor: cursor-pointer
Hover: hover:border-blue-500 hover:shadow-md
Active: active:scale-[0.99]
Transition: transition-all duration-200
```

---

### Status Badges

#### Available
```css
Background: bg-green-100
Text: text-green-800 text-sm font-medium
Padding: px-3 py-1
Radius: rounded-full
Icon: CheckCircle (green)
```

#### Unavailable
```css
Background: bg-red-100
Text: text-red-800 text-sm font-medium
Padding: px-3 py-1
Radius: rounded-full
Icon: XCircle (red)
```

#### Reserved
```css
Background: bg-amber-100
Text: text-amber-800 text-sm font-medium
Padding: px-3 py-1
Radius: rounded-full
Icon: Clock (amber)
```

---

## Icons

### Size Scale
```
xs:  12px
sm:  16px
md:  20px
lg:  24px
xl:  32px
2xl: 48px
```

### Usage Guidelines
- Use lucide-react library
- Stroke width: 2px (default)
- Always pair status colors with icons (not color alone)
- Maintain 24x24px minimum touch target on mobile
- Use semantic icon names (CheckCircle, XCircle, Clock, etc.)

---

## Motion & Animation

### Duration Scale
```
Fast:     100ms (immediate feedback)
Default:  200ms (standard transitions)
Slow:     300ms (complex animations)
```

### Easing Functions
```
Default:  ease-in-out (CSS default)
Enter:    ease-out (elements appearing)
Exit:     ease-in (elements disappearing)
```

### Common Transitions
```
Hover:         transition-colors duration-200
Shadow:        transition-shadow duration-200
Transform:     transition-transform duration-200
All:           transition-all duration-200
```

### Lottie Animations
- **Use for**: Empty states, loading states, success confirmations
- **Max duration**: 2 seconds
- **Loop**: Only when appropriate (loading states)
- **File size**: Keep under 100KB

---

## Grid & Layout

### Breakpoints (Tailwind)
```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### Container Max Widths
```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1400px
```

### Column Grid
- Use 12-column grid system
- Gap: 24px (gap-6) for desktop
- Gap: 16px (gap-4) for mobile
- Responsive: Adjust columns at breakpoints

---

## Accessibility

### Focus Indicators
```css
Keyboard Focus: ring-2 ring-offset-2 ring-blue-500
Always visible: Never use outline: none without replacement
High contrast: Ensure 3:1 contrast ratio minimum
```

### Color Contrast (WCAG AA)
- Body text on white: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum
- Links: Underline on hover/focus

### Touch Targets
- Minimum: 44x44px
- Preferred: 48x48px
- Spacing between: 8px minimum
- Mobile: Ensure adequate spacing

### Interactive States
1. **Default** - Resting state
2. **Hover** - Mouse over (pointer)
3. **Focus** - Keyboard navigation
4. **Active** - Click/tap feedback
5. **Disabled** - Reduced opacity, cursor not-allowed

---

## Loading States

### Skeleton Screens
```css
Background: bg-gray-200
Animation: animate-pulse
Radius: Match component border radius
Height: Match expected content height
```

### Spinners
```css
Size: 20px (inline), 32px (page-level), 48px (full-page)
Color: text-blue-600
Animation: animate-spin
Accessibility: Always include "Loading..." text for screen readers
```

### Progress Bars
```css
Height: 4px (subtle), 8px (prominent)
Background: bg-gray-200
Fill: bg-blue-600
Animation: Smooth progress (transition-all duration-300)
```

---

## Real-Time Data Visualization

### Status Indicators
- **Binary**: Circle icon + color + text label
- **Trend**: Arrow icon + percentage + time context
- **Demand**: Number + descriptive text

### Sparklines
```
Height: 32px
Stroke width: 2px
Color: Matches status (green for positive, red for negative)
Animation: Smooth draw-in on load
```

### Countdown Timers
```
Format: "2 days 14 hours" or "3 hours 45 minutes"
Color Coding:
  - Green: > 48 hours remaining
  - Amber: 24-48 hours remaining
  - Red: < 24 hours remaining
Font: Monospace for numerical stability
Weight: Semibold (600)
Update frequency: Every minute
```

---

## Code Examples

### Primary Button Component
```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  Reserve Time Slot
</button>
```

### Secondary Button Component
```jsx
<button className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
  Cancel
</button>
```

### Card Component
```jsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Canon EOS R5
  </h3>
  <p className="text-gray-600 text-sm mb-4">
    Professional full-frame mirrorless camera
  </p>
  {/* Card content */}
</div>
```

### Status Badge Component
```jsx
<span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
  <CheckCircle className="w-4 h-4" />
  Available
</span>
```

### Input Field Component
```jsx
<div className="space-y-2">
  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
    Search Equipment
  </label>
  <input
    type="text"
    id="search"
    name="search"
    placeholder="e.g., Canon EOS R5"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
  />
</div>
```

### Equipment Card (Full Example)
```jsx
<div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer">
  {/* Image */}
  <div className="relative aspect-[4/3] bg-gray-100">
    <img 
      src="/equipment/canon-r5.jpg" 
      alt="Canon EOS R5 professional camera"
      className="w-full h-full object-cover"
    />
    {/* Status Badge Overlay */}
    <div className="absolute top-3 right-3">
      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm">
        <CheckCircle className="w-4 h-4" />
        Available
      </span>
    </div>
  </div>
  
  {/* Content */}
  <div className="p-4 space-y-3">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">
        Canon EOS R5
      </h3>
      <p className="text-sm text-gray-600">
        45MP Full-Frame • 8K Video
      </p>
    </div>
    
    {/* Specs */}
    <div className="flex gap-2 text-xs text-gray-500">
      <span className="bg-gray-100 px-2 py-1 rounded">RF Mount</span>
      <span className="bg-gray-100 px-2 py-1 rounded">IBIS</span>
    </div>
    
    {/* Actions */}
    <div className="flex gap-2 pt-2">
      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors duration-200">
        Reserve Now
      </button>
      <button className="px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-sm font-medium text-gray-700 transition-colors duration-200">
        Details
      </button>
    </div>
  </div>
</div>
```

---

## Responsive Design Patterns

### Mobile-First Approach
```jsx
// Start with mobile, scale up
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Equipment Library
  </h1>
</div>
```

### Grid Layouts
```jsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {/* Equipment cards */}
</div>
```

### Navigation Adaptations
```jsx
// Desktop: Horizontal nav
// Mobile: Hamburger menu
<nav className="hidden lg:flex gap-6">
  {/* Desktop navigation */}
</nav>
<button className="lg:hidden" aria-label="Open menu">
  <Menu className="w-6 h-6" />
</button>
```

---

## Quality Checklist

Before considering a component complete:

- [ ] Matches color palette exactly
- [ ] Uses correct typography scale
- [ ] Follows spacing scale consistently
- [ ] Has proper hover/focus/active states
- [ ] Includes loading states where applicable
- [ ] Has empty states with helpful messaging
- [ ] Passes 4.5:1 contrast ratio (text)
- [ ] Has visible focus indicators
- [ ] Works on mobile, tablet, and desktop
- [ ] Uses Tailwind core utilities only
- [ ] Includes proper ARIA labels
- [ ] Has been tested with keyboard navigation
- [ ] Animation duration is 200ms or less
- [ ] Touch targets are minimum 44x44px

---

## Design Tokens Export

For integration with design tools:

```json
{
  "colors": {
    "primary": "#1E40AF",
    "secondary": "#7C3AED",
    "accent": "#F59E0B",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "info": "#3B82F6"
  },
  "spacing": {
    "xs": "0.5rem",
    "sm": "1rem",
    "md": "1.5rem",
    "lg": "2rem",
    "xl": "3rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "full": "9999px"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "scale": {
      "body": "1rem",
      "h4": "1.25rem",
      "h3": "1.5rem",
      "h2": "1.875rem",
      "h1": "2.25rem"
    }
  }
}
```