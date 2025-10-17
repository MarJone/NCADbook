# UI/UX Overhaul - START HERE 🚀

**Date:** October 17, 2025
**Status:** Context-clear-ready, backups complete, plan finalized
**Estimated Time:** 12-18 weeks for complete overhaul

---

## 📋 Quick Status

### ✅ Completed Setup
- [x] Memory files merged ([CLAUDE.md](CLAUDE.md) updated with "Bold & Curious" philosophy)
- [x] Codebase analyzed (React 18 + 80+ components)
- [x] Roadmap assessed (Phase I ~70% complete, Phase II needs alignment)
- [x] Backup created (`backup-before-overhaul-2025-10-17` branch + tag)
- [x] Prioritized sprint plan created (4 sprints, 17 priorities)

### 🎯 Current State
- **Working System:** 4 portals (Student/Staff/Dept Admin/Master Admin)
- **Tech Stack:** React 18, Vite, Playwright, PostgreSQL + demo mode
- **Design System:** Foundation exists, needs alignment with new style guide
- **Accessibility:** Partial implementation, needs WCAG 2.1 AA audit

---

## 🚀 START HERE: After Context Clear

### Step 1: Restore Context (30 seconds)
Read these files in order:
1. [CLAUDE.md](CLAUDE.md) - Project overview, tech stack, workflows
2. [context/design-principles.md](context/design-principles.md) - "Bold & Curious" philosophy
3. [context/style-guide.md](context/style-guide.md) - Visual specifications
4. [context/ux-patterns.md](context/ux-patterns.md) - Booking flow architecture

### Step 2: Set Up Playwright MCP (5 minutes)
```bash
# Install Playwright MCP
npx @microsoft/playwright-mcp install
```

Configure MCP settings (see [context/playwright-setup.md](context/playwright-setup.md)):
```json
{
  "mcps": {
    "playwright": {
      "command": "npx",
      "args": ["@microsoft/playwright-mcp"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium",
        "PLAYWRIGHT_HEADED": "true"
      }
    }
  }
}
```

Test it works:
```bash
npm run dev  # Should open http://localhost:5175/NCADbook/
```

### Step 3: Choose Your Starting Point

**RECOMMENDED: Sprint 1 - Foundation Alignment (Weeks 1-2)**

This sprint sets up the infrastructure for efficient visual development:

**Priority 1: Playwright MCP Visual Development** (Day 1)
- Set up MCP (already done in Step 2)
- Create screenshot comparison workflow
- Test navigation and viewport switching

**Priority 2: Style Guide Alignment Audit** (Days 2-3)
- Compare [src/styles/design-tokens.css](src/styles/design-tokens.css) with [context/style-guide.md](context/style-guide.md)
- Identify discrepancies in colors, typography, spacing
- Update design tokens to match style guide

**Priority 3: Accessibility Baseline Audit** (Days 4-5)
- Run `npx playwright test` with @axe-core
- Document WCAG 2.1 AA violations
- Test keyboard navigation (Tab order, focus indicators)
- Create remediation backlog

**Priority 4: Component Inventory** (Days 6-10)
- Catalog all 80+ React components
- Map to [context/ux-patterns.md](context/ux-patterns.md) stages
- Identify redesign vs polish needs
- Document missing components

---

## 📝 Your First Prompt (Copy-Paste Ready)

After context clear, use this prompt:

```
I'm ready to start the UI/UX overhaul for the NCAD Equipment Booking System.

CONTEXT LOADED:
- Read CLAUDE.md ✓
- Read context/design-principles.md ✓
- Read context/style-guide.md ✓
- Read context/ux-patterns.md ✓

CURRENT TASK: Sprint 1, Priority 2 - Style Guide Alignment Audit

Please help me:
1. Compare src/styles/design-tokens.css with context/style-guide.md
2. Identify all discrepancies (colors, typography, spacing, shadows)
3. Create a task list to align design tokens with the style guide
4. Update design-tokens.css to match the style guide specifications

Use Playwright to screenshot the current system before changes, so we can
compare before/after visuals.
```

---

## 🎨 Alternative Starting Points

### Option A: Jump to Visual Work (Sprint 2 - Equipment Discovery)
If you want to see immediate visual improvements:

**First Prompt:**
```
I'm ready to redesign the Equipment Browse interface.

CONTEXT LOADED:
- Read CLAUDE.md ✓
- Read context/ux-patterns.md (Stage 1: Discovery & Search) ✓
- Read context/style-guide.md ✓

CURRENT TASK: Sprint 2, Priority 5 - Equipment Grid Redesign

Please help me:
1. Use Playwright to navigate to the Equipment Browse page
2. Screenshot the current state at desktop (1440px), tablet (768px), mobile (375px)
3. Compare against the equipment card spec in context/ux-patterns.md
4. Create a task list to implement the new design
5. Update EquipmentBrowse.jsx to match the specification

Focus on:
- Equipment card layout (4:3 aspect ratio images)
- Status badge overlay (Available/Unavailable with icons + text)
- Action-specific CTAs ("Quick View", "Reserve Now")
- Hover states matching style guide
```

### Option B: Accessibility First (Sprint 1, Priority 3)
If compliance is most critical:

**First Prompt:**
```
I'm ready to run a comprehensive accessibility audit.

CONTEXT LOADED:
- Read CLAUDE.md ✓
- Read context/design-principles.md (Principle 8: Accessibility Foundation) ✓

CURRENT TASK: Sprint 1, Priority 3 - Accessibility Baseline Audit

Please help me:
1. Run `npx playwright test` with @axe-core on all 4 portals
2. Document all WCAG 2.1 AA violations
3. Test keyboard navigation flow (Tab order, focus indicators, Escape key)
4. Verify ARIA labels on dynamic content
5. Check color contrast ratios (4.5:1 minimum)
6. Create prioritized remediation backlog

Generate a comprehensive accessibility report.
```

---

## 📊 Sprint Overview (Full Plan)

### Sprint 1: Foundation Alignment (Weeks 1-2)
**Goals:** Visual development setup, design token alignment, accessibility baseline
- Priority 1: Playwright MCP setup
- Priority 2: Style guide alignment audit
- Priority 3: Accessibility baseline audit
- Priority 4: Component inventory

**Deliverables:**
- Playwright MCP working for visual development
- Design tokens aligned with style guide
- Accessibility violation report with remediation plan
- Complete component catalog

### Sprint 2: Equipment Discovery Interface (Weeks 3-4)
**Goals:** Implement Stage 1 from context/ux-patterns.md
- Priority 5: Equipment grid redesign
- Priority 6: Advanced filtering UX
- Priority 7: Project-based entry points
- Priority 8: Empty states with Lottie animations

**Deliverables:**
- Equipment cards matching style guide
- Sticky filter sidebar (desktop) / drawer (mobile)
- Project-based quick filters
- Supportive empty states

### Sprint 3: Kit Assembly & Calendar (Weeks 5-6)
**Goals:** Implement Stages 2-3 from context/ux-patterns.md
- Priority 9: Kit cart redesign
- Priority 10: Compatibility validation UI
- Priority 11: Calendar grid polish

**Deliverables:**
- Sticky kit cart with real-time validation
- Visual compatibility indicators
- Drag-to-select date ranges

### Sprint 4: Policy & Confirmation (Weeks 7-8)
**Goals:** Implement Stages 4-5 from context/ux-patterns.md
- Priority 12: Policy accordion interface
- Priority 13: Action-specific CTAs throughout
- Priority 14: Confirmation screen
- Priority 15: Student dashboard polish

**Deliverables:**
- Transparent policy review interface
- All CTAs are action-specific
- Clear confirmation with calendar export
- "Supportive accountability" dashboard

---

## 🔧 Daily Workflow (Once Started)

**For every front-end task:**
1. Reference [context/style-guide.md](context/style-guide.md) and [context/ux-patterns.md](context/ux-patterns.md)
2. Use Playwright to navigate and screenshot current state
3. Make changes
4. Screenshot new state at 3 viewports (1440px, 768px, 375px)
5. Check quality gates (from CLAUDE.md):
   - [ ] No console errors/warnings
   - [ ] Keyboard navigation works
   - [ ] Matches style guide specs
   - [ ] CTAs are action-specific
   - [ ] Mobile viewport is usable

**Visual Development Protocol:**
```javascript
// Navigate to page
await page.goto('http://localhost:5175/NCADbook/equipment/browse');
await page.waitForLoadState('networkidle');

// Desktop screenshot
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: 'review/desktop-before.png', fullPage: true });

// Mobile screenshot
await page.setViewportSize({ width: 375, height: 667 });
await page.screenshot({ path: 'review/mobile-before.png', fullPage: true });
```

---

## 🚨 Critical Reminders

### Never Compromise On:
- ✅ WCAG 2.1 AA accessibility (4.5:1 contrast, keyboard nav, ARIA labels)
- ✅ Action-specific CTA labels (no generic "Next" or "Submit" buttons)
- ✅ Desktop-first design (1440px primary, adapt down to mobile)
- ✅ Design token usage (no hardcoded colors/spacing)
- ✅ Quality gates before considering work complete

### Always Reference:
- [context/design-principles.md](context/design-principles.md) - The "why" behind decisions
- [context/style-guide.md](context/style-guide.md) - The "how" for visual implementation
- [context/ux-patterns.md](context/ux-patterns.md) - The booking flow architecture
- [CLAUDE.md](CLAUDE.md) - Project conventions and workflows

### Development Commands:
```bash
npm run dev                    # Start dev server
npm test                       # Run all Playwright tests
npx playwright test --ui       # Interactive test mode
npm run test:mobile            # Mobile-specific tests
```

---

## 📚 Key Documentation

### In `/context` folder:
- [design-principles.md](context/design-principles.md) - "Bold & Curious" mandate
- [style-guide.md](context/style-guide.md) - Complete visual specifications
- [ux-patterns.md](context/ux-patterns.md) - 5-stage booking flow
- [implementation-roadmap.md](context/implementation-roadmap.md) - 18-month plan
- [playwright-setup.md](context/playwright-setup.md) - MCP setup instructions
- [design-reviewer.md](context/design-reviewer.md) - Design review agent

### In project root:
- [CLAUDE.md](CLAUDE.md) - Updated project memory (includes Visual Development Protocol)
- [OVERHAUL_BRIEFING.md](OVERHAUL_BRIEFING.md) - Comprehensive context from planning phase
- [ProjectMemory.md](ProjectMemory.md) - Development history and decisions
- [BACKUP_RESTORE_GUIDE.md](BACKUP_RESTORE_GUIDE.md) - How to restore if needed

---

## 🎯 Success Metrics (Track Throughout)

| Metric | Target | Measurement |
|--------|--------|-------------|
| WCAG 2.1 AA Violations | 0 critical | @axe-core audit |
| Keyboard Navigation | 100% coverage | Manual testing |
| Style Guide Compliance | 90%+ | Visual review |
| Page Load Time | <2 seconds | Playwright perf API |
| Touch Targets | 100% (44x44px min) | Manual measurement |
| Booking Completion Rate | 80%+ | Analytics (future) |

---

## 💾 Backup Information

**Branch:** `backup-before-overhaul-2025-10-17`
**Tag:** `v-backup-2025-10-17`
**Quick Restore:** `git reset --hard v-backup-2025-10-17`

See [BACKUP_RESTORE_GUIDE.md](BACKUP_RESTORE_GUIDE.md) for full restoration procedures.

---

## ✅ Pre-Flight Checklist

Before starting work after context clear:

- [ ] Context loaded (read CLAUDE.md + /context files)
- [ ] Playwright MCP set up and tested
- [ ] Dev server running (`npm run dev`)
- [ ] Can navigate to http://localhost:5175/NCADbook/
- [ ] Chosen starting sprint (recommend Sprint 1)
- [ ] First prompt ready to copy-paste

---

## 🎬 You're Ready!

**Recommended Path:**
1. Clear context now
2. Reload with first prompt from "Your First Prompt" section
3. Start Sprint 1, Priority 2 (Style Guide Alignment)
4. Work through priorities systematically

**Time Estimate:**
- Sprint 1: 2 weeks (foundation)
- Sprint 2: 2 weeks (equipment discovery)
- Sprint 3: 2 weeks (kit assembly + calendar)
- Sprint 4: 2 weeks (policy + confirmation)
- **Total:** 8 weeks for core UX overhaul

**Remember:** Every design decision should answer:
- "Is this Awwwards-worthy?" ✨
- "Does this reduce friction OR add compliance?" ⚖️

Both answers should be **YES**.

---

**Project Links:**
- **Local Demo:** http://localhost:5175/NCADbook/
- **GitHub Pages:** https://marjone.github.io/NCADbook/

**Last Updated:** October 17, 2025
**Ready to Start:** ✅ YES
