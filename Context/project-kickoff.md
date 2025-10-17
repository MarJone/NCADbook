# Academic Equipment Booking System - Project Kickoff

## 🎯 Project Overview

Building a "bold and curious" academic equipment booking platform that combines award-winning commercial UX with institutional rigor.

**Goal**: Frictionless conversion + strict compliance + premium aesthetics

## 📁 Document Structure

Place these files in your project:

```
/project-root
├── claw.md                          # Claude Code memory (root level)
├── /context
│   ├── design-principles.md         # Core design philosophy
│   ├── style-guide.md              # Visual specifications
│   └── ux-patterns.md              # Booking flow patterns
├── /docs
│   ├── implementation-roadmap.md   # 18-month phased plan
│   └── playwright-setup.md         # Playwright configuration
└── /.claude
    └── /agents
        └── design-reviewer.md      # Design review agent
```

## 🚀 Quick Start (5 Minutes)

### Step 1: Set Up Playwright MCP
```bash
npx @microsoft/playwright-mcp install
```

Add to your MCP config:
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

### Step 2: Place Context Files
- Copy `design-principles.md` → `/context/`
- Copy `style-guide.md` → `/context/`
- Copy `ux-patterns.md` → `/context/`
- Copy `claw.md` → project root

### Step 3: Set Up Agent
- Create `/.claude/agents/` folder
- Copy `design-reviewer.md` → `/.claude/agents/`

### Step 4: Start Building
In Claude Code:
```
I'm building the equipment search and filter interface. 
Reference /context/style-guide.md and /context/ux-patterns.md 
for the specifications.
```

## 🎨 Core Design Principles (Quick Reference)

1. **Aesthetic as Trust Signal** - Premium design = reliable system
2. **Frictionless Compliance** - Speed + rigor are design partners
3. **Intelligent Discoverability** - Help find the *right* resource
4. **Real-Time Transparency** - Live data empowers decisions
5. **Supportive Accountability** - Positive framing, never punitive
6. **Progressive Disclosure** - Reveal complexity gradually
7. **Action-Specific CTAs** - No ambiguous buttons
8. **Accessibility Foundation** - Universal access is structural

## 🎯 Key Success Metrics

| Metric | Phase I | Phase II | Phase III |
|--------|---------|----------|-----------|
| Time-to-Reservation | Baseline | -25% | -25% |
| On-Time Return Rate | Baseline | Baseline | +15% |
| Filter Usage | Baseline | +40% | +50% |
| WCAG Violations | 0 | 0 | 0 |

## 🔧 Common Claude Code Commands

### Visual Development
```
Navigate to localhost:3000/equipment/search using Playwright, 
take a screenshot, and compare against the style guide.
```

### Comprehensive Review
```
@@design-reviewer review the equipment card component
```

### Accessibility Check
```
Test the booking flow with keyboard-only navigation and 
generate an accessibility report.
```

### Responsive Testing
```
Screenshot the equipment grid at mobile (375px), tablet (768px), 
and desktop (1440px) viewports.
```

## 📊 Implementation Phases

### Phase I: Foundation (Months 1-6)
- SSO integration
- Policy enforcement engine
- Advanced filtering
- WCAG 2.1 AA compliance

### Phase II: Core UX (Months 7-12)
- Frictionless booking flow
- Kit assembly system
- Calendar time selection
- Student dashboard

### Phase III: Premium Polish (Months 13-18)
- Award-winning visuals
- Real-time intelligence
- Fintech-inspired accountability
- Optional gamification

## 🎨 Visual Style Quick Reference

### Colors
- Primary: `#1E40AF` (Blue 800)
- Success: `#10B981` (Green 500)
- Warning: `#F59E0B` (Amber 500)
- Error: `#EF4444` (Red 500)

### Typography
- Font: Inter
- Body: 16px / 1.5 line-height
- Headings: 700 weight

### Spacing
- Card padding: `p-6` (24px)
- Button: `px-6 py-3`
- Section: `space-y-8` (32px)

### Components
```jsx
// Primary Button
<button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors duration-200">
  Reserve Time Slot
</button>

// Status Badge
<span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
  Available
</span>
```

## 🚦 Development Workflow

1. **Read Spec** → Check `/context/` docs for requirements
2. **Build Feature** → Follow style guide and UX patterns
3. **Visual Check** → Use Playwright to screenshot
4. **Compare** → Reference validation against spec
5. **Iterate** → Refine until match achieved
6. **Review** → Invoke `@@design-reviewer` before PR
7. **Test** → Keyboard navigation, screen readers, viewports
8. **Ship** → Merge with confidence

## ⚠️ Critical Requirements

### Never Compromise On:
- ✅ WCAG 2.1 AA accessibility
- ✅ Full keyboard navigation
- ✅ Action-specific CTA labels
- ✅ Real-time availability accuracy
- ✅ Policy transparency
- ✅ High contrast (4.5:1 minimum)
- ✅ Mobile functionality

### Always Include:
- ✅ Loading states (skeleton screens)
- ✅ Empty states (with Lottie animations)
- ✅ Error prevention (input formatting)
- ✅ Progress indicators (multi-step flows)
- ✅ Focus indicators (3px ring)
- ✅ ARIA labels (dynamic content)

## 📚 Reference Documentation

### Internal Docs (in `/context/`)
- `design-principles.md` - Why we design this way
- `style-guide.md` - How to implement visually
- `ux-patterns.md` - Booking flow architecture

### External Inspiration
- **Awwwards Annual Awards** - Visual benchmark
- **High-end camera rental sites** - Equipment showcase
- **Fintech apps** - Accountability UX
- **Industrial dashboards** - Real-time data viz

## 🤝 Getting Help

### In Claude Code:
```
I'm stuck on [specific issue]. Reference the style guide 
and suggest solutions that maintain the "bold and curious" 
design philosophy.
```

### For Comprehensive Review:
```
@@design-reviewer perform a full audit of the booking flow 
including accessibility, conversion optimization, and visual quality.
```

## 🎯 Next Steps

1. ✅ Set up Playwright MCP
2. ✅ Place all context files
3. ✅ Configure design-reviewer agent
4. 🚀 Start with Phase I: Foundation
5. 📸 Use Playwright for visual validation
6. 🎨 Aim for Awwwards-worthy quality
7. ♿ Never skip accessibility

---

**Remember**: Every design decision should answer:
- "Is this Awwwards-worthy?"
- "Does this reduce friction OR add compliance?"

Both answers should be **YES**.

Let's build something bold and curious! 🚀✨