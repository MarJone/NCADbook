# Claude Code Memory - Academic Equipment Booking System

## Project Overview
Building a bold and curious academic equipment booking platform that bridges high-end commercial UX with institutional rigor. The goal is frictionless conversion while maintaining strict compliance and accountability.

## Core Design Philosophy
- **Bold**: Award-winning aesthetics (Awwwards/CSS Winner standards), high-impact visuals, polished branding
- **Curious**: Encourage exploration, simplify discoverability, leverage real-time data for informed decisions
- **Balance**: Frictionless UX + institutional compliance

## Visual Development Protocol

### Required Context Files
Before starting UI work, always reference:
- `/context/design-principles.md` - Core design standards and aesthetic guidelines
- `/context/style-guide.md` - Typography, colors, spacing, component patterns
- `/context/ux-patterns.md` - Booking flow architecture and conversion best practices

### Standard Playwright Workflow for Front-End Changes

When making any front-end modifications:

1. **Navigate & Verify**
   - Open the affected page(s) in Playwright browser
   - Test at desktop viewport (1440x900) as primary, then mobile (375x667)
   - Check console for errors/warnings

2. **Reference Validation**
   - Compare against style guide specifications
   - Verify booking flow matches documented UX patterns
   - Ensure accessibility standards (keyboard navigation, ARIA, contrast)

3. **Screenshot Comparison**
   - Take before/after screenshots
   - Compare against design mocks or reference inspiration
   - Iterate until visual output matches spec

4. **Cross-Device Testing**
   - Test responsive breakpoints (mobile, tablet, desktop)
   - Verify touch targets are 44x44px minimum
   - Check that CTAs remain prominent across viewports

### Advanced Review Triggers

Invoke the `@@design-reviewer` agent when:
- Creating pull requests with UI changes
- Implementing new booking flow steps
- Making significant UX/accessibility refactors
- Adding new interactive components (calendars, filters, dashboards)

## Coding Standards

### Front-End Stack
- React with hooks (functional components only)
- Tailwind CSS (core utility classes only - no custom compilation)
- TypeScript for type safety
- Lottie for animations (non-critical elements)

### Component Architecture
- Small, focused components (< 150 lines)
- Separate business logic from presentation
- Custom hooks for shared state/behavior
- Progressive disclosure for complex forms

### Accessibility Requirements (Non-Negotiable)
- Full keyboard navigation support
- ARIA labels for dynamic content
- Live regions for status updates
- Minimum 4.5:1 color contrast
- Never use color alone to convey information
- Focus indicators on all interactive elements

## Git Workflow

### Commits
- Conventional commits format: `feat:`, `fix:`, `style:`, `refactor:`
- Reference ticket/issue numbers
- Include before/after screenshots for UI changes

### Pull Requests
- Include Playwright screenshots showing changes
- Document accessibility testing results
- Link to design specs or inspiration sources
- Tag `@@design-reviewer` for comprehensive audit

## Quick Commands

### Development
```bash
npm run dev          # Start dev server
npm run playwright   # Open Playwright inspector
npm run test:a11y    # Run accessibility audits
```

### Common Tasks
- "Check booking flow UX" → Navigate through reservation process, screenshot each step
- "Audit accessibility" → Run WCAG checks on forms and interactive elements
- "Mobile responsive check" → Test at 375w, 768w, 1440w viewports
- "Compare to reference" → Load reference URL, screenshot, compare to current build

## Quality Gates

Before considering work complete:
- [ ] No console errors or warnings
- [ ] Passes keyboard-only navigation test
- [ ] Matches style guide specifications
- [ ] CTAs are action-specific and high-contrast
- [ ] Real-time data displays correctly with proper loading states
- [ ] Progressive disclosure working for complex filters
- [ ] Mobile viewport is clean and usable (even if desktop-optimized)

## Remember
- Desktop conversion priority, but mobile must be functional
- Every borrowing action needs clear progress indicators
- Policy transparency = conversion booster (not friction)
- Visual quality = trust signal for institutional reliability