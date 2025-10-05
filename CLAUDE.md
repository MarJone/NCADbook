# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NCAD Equipment Booking System - A mobile-first web application for managing equipment bookings at NCAD College. Serves 1,600 students across Moving Image Design, Graphic Design, and Illustration departments, managing 200+ pieces of equipment with future expansion to room/space bookings.

**Tech Stack:**
- Frontend: HTML/CSS/JavaScript (mobile-first responsive design)
- Backend: Supabase (PostgreSQL with Row Level Security)
- Testing: Playwright (configured for mobile/tablet/desktop)
- Email: EmailJS for notifications
- Deployment: On-campus hosting (Netlify/Vercel for development)

## Development Commands

Currently in early setup phase. No build/test commands configured yet in package.json.

**Playwright Testing** (when configured):
```bash
npm test                           # Run all tests
npx playwright test --project=mobile-chrome    # Mobile-specific tests
npx playwright test --project=chromium-desktop # Desktop tests
npx playwright test --ui           # Interactive test mode
npx playwright show-report         # View test results
```

## Project Architecture

### Core Design Principles
- **Mobile-First**: Design for 320px viewport first, enhance for tablet (768px) and desktop (1024px+)
- **Touch-Optimized**: Minimum 44px touch targets for all interactive elements
- **Performance**: <3 second load on 3G networks, lazy loading for images, virtual scrolling for lists
- **Security**: Row Level Security (RLS) policies for all database access, GDPR-compliant data handling
- **Accessibility**: WCAG 2.2 AA compliance, ARIA labels, keyboard navigation

### Directory Structure
```
/src                    # Source code (to be created)
  /components           # Reusable UI components
  /css                  # Styles (mobile-first CSS)
  /js                   # JavaScript modules
  /config               # Configuration (Supabase, EmailJS)
/public                 # Static assets
  /images/equipment     # Equipment images (local storage)
/docs                   # Comprehensive documentation
  /agents               # Sub-agent specifications for complex features
  /guides               # Setup and integration guides
/tests                  # Playwright test suites
  /integration          # Desktop integration tests
  /mobile               # Mobile-specific tests
```

### Database Architecture (Supabase)

**Critical Tables:**
- `users` - Student/admin accounts with role-based permissions (student, general_admin, master_admin)
- `equipment` - 200+ equipment items with tracking numbers (admin-only visibility), QR codes, images
- `equipment_notes` - Multi-field admin notes (maintenance, damage, usage, general) - admin only
- `bookings` - Equipment reservations with approval workflow
- `admin_actions` - Complete audit trail for compliance
- `cross_department_access` - Time-limited interdisciplinary equipment sharing

**Key Features:**
- Row Level Security (RLS) policies enforce permissions at database level
- Automatic equipment status updates via triggers (available → booked → available)
- Conflict detection function prevents double-bookings
- JSONB fields for flexible schemas (admin_permissions, interdisciplinary_access)
- Complete audit trail for GDPR compliance

See [docs/agents/01-database-schema-architect.md](docs/agents/01-database-schema-architect.md) for complete schema, RLS policies, and utility functions.

### Component Architecture

**Mobile-First Components** (see [docs/agents/02-mobile-ui-component-builder.md](docs/agents/02-mobile-ui-component-builder.md)):
- Equipment cards with lazy-loaded images
- Touch-optimized calendar (60px minimum touch targets on mobile)
- Swipe-action cards for admin booking approval
- Loading skeletons for performance perception
- Pull-to-refresh for mobile data updates

**Responsive Breakpoints:**
- Mobile: 320px - 768px (single column, larger touch targets)
- Tablet: 768px - 1024px (2-column grids, swipe hints)
- Desktop: 1024px+ (3-column grids, hover states)

### User Roles & Permissions

**Student (1,600 users):**
- Browse equipment catalog (all devices)
- Create bookings with purpose/justification
- View own booking history
- Track return deadlines

**General Admin (3-5 users):**
- Approve/deny bookings for assigned departments
- Add multi-field notes to equipment (maintenance, damage, usage)
- View department-specific reports
- Manage equipment status (available, maintenance, out_of_service)

**Master Admin (1-2 users):**
- Full system oversight across all departments
- Manage admin permissions granularly
- CSV import (users and equipment) with GDPR validation
- Generate comprehensive analytics and exports (CSV/PDF)
- Control cross-departmental access

### Key Features

**CSV Import System** (see [docs/agents/05-csv-import-specialist.md](docs/agents/05-csv-import-specialist.md)):
- GDPR-compliant data validation with preview before import
- Duplicate detection and handling
- Required columns: users (first_name, surname, full_name, email, department), equipment (product_name, tracking_number, description, link_to_image)
- Template download for correct format

**Analytics Dashboard** (see [docs/agents/06-analytics-reporting-agent.md](docs/agents/06-analytics-reporting-agent.md)):
- Equipment utilization rates (target: 20%+ increase)
- Department-level booking analytics
- Popular equipment tracking
- Repair cost tracking and budget impact
- CSV/PDF export with custom date ranges
- Mobile-responsive dashboard

**Booking System** (see [docs/agents/04-sub_agent_booking_logic.md](docs/agents/04-sub_agent_booking_logic.md)):
- Multi-item booking (select multiple equipment or kits)
- Smart weekend selection (Friday bookings auto-include Sat/Sun)
- Real-time availability checking with conflict detection
- Conditional justification fields for high-value items
- Equipment kits (admin-configurable bundles)

**Mobile Calendar:**
- Large touch targets (60px on mobile)
- Swipe gestures for month navigation
- Visual availability indicators (available, provisional, booked, selected)
- Drag-and-drop for date range selection

## Documentation Structure

### Sub-Agent Specifications
Complex features are documented as specialized sub-agents in [docs/agents/](docs/agents/):
1. **01-database-schema-architect.md** - Complete database schema, RLS policies, triggers, functions
2. **02-mobile-ui-component-builder.md** - Reusable responsive components with code examples
3. **03-authentication-permission-manager.md** - Auth flows, role-based permissions
4. **04-sub_agent_booking_logic.md** - Booking rules, conflict detection, approval workflow
5. **05-csv-import-specialist.md** - GDPR-compliant import with validation
6. **06-analytics-reporting-agent.md** - Metrics calculation and export functionality
7. **stylingSubagent.md** - Design system and styling guidelines

### Additional Documentation
- [docs/equipment_booking_prd.md](docs/equipment_booking_prd.md) - Complete Product Requirements Document with success metrics
- [docs/ui_requirements.md](docs/ui_requirements.md) - Wireframes, mobile adaptations, interaction patterns
- [docs/guides/PlayWriteMCP_integration.md](docs/guides/PlayWriteMCP_integration.md) - Playwright testing integration
- [docs/guides/claude_code_setup_guide.md](docs/guides/claude_code_setup_guide.md) - Claude Code setup instructions

## Important Implementation Notes

### Mobile Performance
- **Image Optimization**: Use lazy loading with `loading="lazy"`, serve images at appropriate sizes
- **CSS Animations**: Use `transform` and `opacity` only (GPU-accelerated), avoid layout changes
- **Debouncing**: 300ms delay on search inputs to reduce API calls
- **Virtual Scrolling**: Required for equipment lists >50 items
- **Offline-Ready Foundation**: Structure code for future offline mode with service workers

### Security & Compliance
- **Never expose tracking_number** to students (admin-only field)
- **RLS Policies**: All database access must respect Row Level Security policies
- **GDPR**: CSV imports require validation and preview, audit trail for all admin actions
- **Input Validation**: Prevent SQL injection via Supabase parameterized queries
- **Session Management**: Secure token-based auth with Supabase Auth

### Authentication Flow
- First-time users set password on login
- Role assignment via CSV import or master admin interface
- Admin permissions stored as JSONB for flexibility
- Cross-departmental access requires time-limited approval

### Testing Strategy
- Playwright configured for 6 device profiles (desktop, mobile Chrome/Safari, tablet Chrome/iPad, landscape)
- Mobile tests in `/tests/mobile`, integration tests in `/tests/integration`
- Test touch interactions, swipe gestures, and responsive layouts
- Performance testing for 3G network conditions

## Workflow Guidelines

When implementing features:
1. **Start mobile-first** - Design for 320px viewport, enhance upward
2. **Reference sub-agent docs** - Each major feature has detailed specifications
3. **Test across devices** - Use Playwright profiles for mobile/tablet/desktop
4. **Validate RLS** - Ensure database policies enforce permissions
5. **Check PRD success metrics** - Target: 75% admin time reduction, 70%+ mobile bookings

## Current Project Status

Early setup phase. Key next steps:
- Scaffold source code structure (`/src`)
- Configure Supabase client and connection
- Implement database schema from [docs/agents/01-database-schema-architect.md](docs/agents/01-database-schema-architect.md)
- Build core UI components from [docs/agents/02-mobile-ui-component-builder.md](docs/agents/02-mobile-ui-component-builder.md)
- Set up authentication system from [docs/agents/03-authentication-permission-manager.md](docs/agents/03-authentication-permission-manager.md)

## Code Style Preferences

- **CSS**: Mobile-first media queries, use CSS custom properties for theming
- **JavaScript**: ES6+ modules, async/await for async operations
- **Components**: Self-contained with co-located styles
- **Naming**: BEM methodology for CSS classes (`.component__element--modifier`)
- **Accessibility**: Always include ARIA labels, ensure keyboard navigation

## Project Memory & Workflow Optimization

### ProjectMemory.md Overview
This project maintains a comprehensive development history in [ProjectMemory.md](ProjectMemory.md) that tracks:
- Development timeline with all phases
- Architecture evolution and design decisions
- Challenges faced and solutions implemented
- Testing strategy and coverage
- Performance optimizations
- Lessons learned
- Future considerations

**Purpose:** This file will be used at the end of the development phase to inform a workflow optimization process. It captures institutional knowledge, helps onboard new developers, and provides context for future architectural decisions.

### When to Update ProjectMemory.md

Update [ProjectMemory.md](ProjectMemory.md) at these milestones:

1. **End of Sprint/Phase** (Every 1-2 weeks)
   - Add completed features to Development Timeline
   - Document any architectural changes
   - Record challenges encountered and solutions

2. **After Major Feature Implementation**
   - Multi-component features (3+ files)
   - New architectural patterns introduced
   - Breaking changes or refactors
   - Integration of new external services

3. **After Encountering Significant Challenges**
   - Bugs that took >2 hours to resolve
   - Performance issues and optimizations
   - Test failures requiring architectural changes
   - User feedback requiring UX pivots

4. **Before Major Deployments**
   - Production releases
   - Stakeholder demos
   - User testing sessions

### How to Update ProjectMemory.md

**Section-by-Section Guide:**

#### 1. Development Timeline
Add new phase entry:
```markdown
### Phase X: [Feature Name] (Date)
**Objective:** [One-line goal]

**Completed:**
- ✅ [Feature 1]
- ✅ [Feature 2]

**Key Files:**
- [List main files created/modified]

**Challenges:**
- [Key challenge and solution]

**Design Decisions:**
- [Important decision and rationale]
```

#### 2. Architecture Evolution
Update when:
- New patterns introduced (hooks, contexts, utilities)
- Data layer changes (new API methods, storage patterns)
- Component structure changes
- New dependencies added

#### 3. Key Design Decisions
Add entry for each significant decision:
```markdown
### N. [Decision Name]
**Decision:** [What was decided]
**Rationale:**
- [Reason 1]
- [Reason 2]

**Trade-offs:**
- [Pro/Con consideration]

**Implementation:**
- [How it was implemented]
```

#### 4. Challenges & Solutions
Document any challenge that took >1 hour to solve:
```markdown
### Challenge N: [Challenge Name]
**Problem:** [Description]
**Symptoms:**
- [Observable issue 1]
- [Observable issue 2]

**Solution:** [How it was resolved]

**Files Changed:**
- [List of files]

**Lesson:** [Key takeaway]
```

#### 5. Testing Strategy
Update after:
- Adding new test files
- Achieving coverage milestones
- Changing testing approach
- Fixing flaky tests

#### 6. Performance Optimizations
Track all performance work:
- Bundle size changes (>10% difference)
- Load time improvements
- Optimization techniques applied
- Before/after metrics

#### 7. Future Considerations
**Add items to:**
- **Short-Term** - Within 2-4 weeks
- **Mid-Term** - 1-2 months
- **Long-Term** - 3-6 months

**Remove/move items when:**
- Completed (move to Development Timeline)
- No longer relevant (delete with explanation)
- Priority changed (move to different timeframe)

#### 8. Lessons Learned
Add after each phase:
- Technical lessons (code, architecture)
- Process lessons (workflow, communication)
- Collaboration lessons (teamwork, tools)

### Update Template

When updating ProjectMemory.md, use this template:

```markdown
---
**Update Date:** [YYYY-MM-DD]
**Updated By:** [Name or "Claude Code"]
**Context:** [Brief description of what triggered this update]

[Add your updates to relevant sections]

---
```

### Pre-Optimization Workflow

**Before beginning the optimization phase:**

1. **Review ProjectMemory.md Completeness**
   - Ensure all phases documented
   - Verify all major challenges recorded
   - Check all design decisions captured
   - Confirm lessons learned section updated

2. **Generate Optimization Report**
   - Extract patterns from challenges section
   - Identify recurring issues
   - List most time-consuming tasks
   - Highlight workflow bottlenecks

3. **Create Optimization Backlog**
   - Prioritize improvements by impact
   - Estimate effort for each optimization
   - Group related optimizations
   - Define success metrics

4. **Update CLAUDE.md with Optimizations**
   - Add new workflow guidelines based on learnings
   - Update architecture sections if patterns changed
   - Revise code style preferences if needed
   - Add new "gotchas" to Important Implementation Notes

### Example Optimization Process

**Input:** ProjectMemory.md sections
- Challenges & Solutions
- Lessons Learned
- Testing Strategy

**Analysis Questions:**
1. Which types of challenges occurred most frequently?
2. What patterns emerge from successful solutions?
3. Which workflow steps took longest?
4. What could have been caught earlier?
5. Which documentation gaps caused confusion?

**Output:** Updated workflow in CLAUDE.md
- New guidelines to prevent common challenges
- Improved architecture patterns
- Enhanced testing strategy
- Better documentation structure

### Continuous Improvement Cycle

```
Development Phase
      ↓
Document in ProjectMemory.md
      ↓
Identify Patterns & Issues
      ↓
Create Optimization Plan
      ↓
Update CLAUDE.md Workflow
      ↓
Apply in Next Development Phase
      ↓
(Repeat)
```

### ProjectMemory.md Quality Checklist

Before marking a phase complete, ensure ProjectMemory.md includes:

- [ ] **Timeline** - All features documented with dates
- [ ] **Files** - Key files listed for each feature
- [ ] **Decisions** - Major architectural decisions explained
- [ ] **Challenges** - Significant problems and solutions recorded
- [ ] **Tests** - Test coverage and strategy documented
- [ ] **Performance** - Any performance work tracked
- [ ] **Lessons** - Key learnings captured
- [ ] **Future** - Considerations for next phase listed
- [ ] **Metrics** - Relevant metrics tracked (bundle size, test count, etc.)

### Integration with Development Workflow

**Recommended workflow per feature:**

1. **Planning** - Review relevant ProjectMemory.md sections for context
2. **Implementation** - Take notes on challenges/decisions as you work
3. **Testing** - Document test strategy and coverage
4. **Completion** - Update ProjectMemory.md with phase summary
5. **Reflection** - Add lessons learned section

**Time Investment:**
- ~15 minutes per feature during development (quick notes)
- ~30 minutes at end of phase (comprehensive update)
- ~2 hours before optimization phase (full review and analysis)

**ROI:**
- Faster onboarding for new developers
- Reduced time debugging recurring issues
- Better architectural consistency
- Evidence-based workflow improvements
- Institutional knowledge preservation

---

## Quick Reference Commands

**Development:**
```bash
npm run dev          # Start dev server (port 5178)
npm run build        # Production build
npm run preview      # Preview production build
```

**Testing:**
```bash
npm test                              # Run all Playwright tests
npx playwright test --ui              # Interactive test mode
npx playwright test --project=chromium-desktop  # Single browser
npx playwright show-report            # View test report
```

**Code Quality:**
```bash
npm run lint         # (To be configured)
npm run format       # (To be configured)
```

---

## Response Footer Guidelines

**IMPORTANT:** At the end of every response to the user, always include the project access links:

```
---
**Project Links:**
- **Local Demo:** http://localhost:5175/NCADbook/
- **GitHub Pages:** https://marjone.github.io/NCADbook/
```

This ensures the user always has quick access to test changes locally or view the deployed demo.
