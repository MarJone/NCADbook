# 🚀 Phase 7 Starter Prompt - Mobile Integration & Department Features

## Context for New Chat Session

I'm continuing development of the **NCAD Equipment Booking System** - a mobile-first React web application for managing equipment bookings at NCAD College (1,600 students, 200+ equipment items).

---

## 📍 **Current Project Status**

### What's Been Built (Phases 1-6)
- ✅ **Full-stack architecture**: React + Vite + Supabase (demo mode active)
- ✅ **Four user portals**: Student, Staff, Department Admin, Master Admin
- ✅ **Core features**: Equipment browsing, booking workflow, approval system, analytics
- ✅ **Recent additions** (Phase 6):
  - Complete "Sub-Area" → "Department" terminology update
  - Master Admin permissions management (cross-department access, permission presets)
  - Department Admin staff permissions control (8 granular permissions)
  - Test suite at 63.5% pass rate (80/126 passing)

### Tech Stack
- **Frontend**: React 18, React Router, Vite 5
- **Backend**: Supabase (PostgreSQL) - currently in demo mode (localStorage)
- **Styling**: Mobile-first CSS with CSS variables
- **Testing**: Playwright (126 tests, 63.5% pass rate)
- **Email**: EmailJS integration
- **Deployment**: Local dev server at http://localhost:5173

---

## 🎯 **Phase 7 Goals**

I need help completing **Phase 7: Mobile Integration & Department-Specific Features**. The detailed roadmap is in `PHASE_7_ROADMAP.md`.

### Two Main Focus Areas:

#### 1. **Mobile-First Enhancements** (Priority: HIGH)
We need to implement critical mobile features that are currently missing:
- Touch-optimized components (swipe actions, pull-to-refresh, mobile calendar)
- Mobile navigation patterns (bottom nav, hamburger menu)
- Performance optimization (virtual scrolling, lazy loading, 3G testing)
- Enhanced mobile testing (touch interactions, visual regression)

**Key Gap**: Most components are responsive but lack mobile-specific interactions (swipes, gestures, touch feedback).

#### 2. **Department-Specific Features** (Priority: HIGH)
We need stronger department isolation and controls:
- Department equipment assignment and visibility controls
- Booking isolation by department
- Enhanced department dashboard with metrics
- Interdisciplinary access workflow (time-limited, auto-revocation)
- Department-specific settings and email templates

**Key Gap**: Database supports department isolation but UI doesn't enforce it properly.

---

## 📋 **What I Need Help With**

### Option A: Full Phase 7 Implementation
Work through the entire `PHASE_7_ROADMAP.md` systematically, implementing all mobile and department features over ~6 weeks of development.

### Option B: Quick Wins First
Focus on high-impact features that will:
1. Increase test pass rate to 75%+ (fix 46 failing tests)
2. Implement critical mobile components (SwipeActionCard, PullToRefresh, MobileCalendar)
3. Add department filtering to EquipmentBrowse
4. Create mobile bottom navigation

### Option C: Specific Feature Request
I can also request specific features from the roadmap, such as:
- "Implement SwipeActionCard for booking approvals"
- "Add department equipment assignment UI"
- "Fix equipment card navigation tests"
- "Create mobile bottom navigation"

---

## 📂 **Key Files to Know**

### Most Important Files
- `PHASE_7_ROADMAP.md` - Complete Phase 7 todo list and analysis
- `CLAUDE.md` - Project architecture, guidelines, and documentation
- `ProjectMemory.md` - Development history and lessons learned
- `docs/equipment_booking_prd.md` - Product requirements
- `docs/ui_requirements.md` - UI/UX specifications

### Component Structure
- `src/portals/` - Main portal pages (student, staff, admin)
- `src/components/` - Reusable components (booking, equipment, common)
- `src/services/` - Business logic and API services
- `src/styles/` - Mobile-first CSS
- `tests/` - Playwright integration and mobile tests

### Current Test Status
- **Overall**: 80/126 passing (63.5%)
- **Authentication**: 11/11 passing (100%)
- **Admin Portal**: 15/17 passing (88%)
- **Mobile/Responsive**: 9/14 passing (64%)
- **Failing**: Equipment navigation, CSV import, booking workflows, email timing

---

## 🎬 **Getting Started**

### Recommended First Steps

1. **Review the roadmap**:
   ```
   Read PHASE_7_ROADMAP.md to understand all planned features
   ```

2. **Check current state**:
   ```bash
   npm run dev     # Start dev server (should be at localhost:5173)
   npm test        # Run test suite
   ```

3. **Pick a starting point**:
   - **For mobile**: Start with SwipeActionCard or MobileBottomNav
   - **For department features**: Start with equipment-department assignment
   - **For tests**: Fix equipment card navigation (fixes ~10 tests)

### My Preferred Workflow
- Break large features into small PRs/commits
- Run tests after each feature
- Update `ProjectMemory.md` after significant milestones
- Follow mobile-first approach (design for 320px first)
- Maintain 44px minimum touch targets

---

## 🔧 **Development Environment**

### Current Setup
- **Server**: Running at http://localhost:5173 (dev mode)
- **Demo Mode**: Active (no Supabase connection needed)
- **Hot Reload**: Enabled
- **Test Server**: Configured for port 5173

### Quick Commands
```bash
npm run dev              # Start dev server
npm test                 # Run all Playwright tests
npm run test:mobile      # Run mobile-specific tests
npm run build            # Production build
npm run preview          # Preview production build
```

### Available Test Users (Demo Mode)
- **Student**: `student@ncad.ie` / `password`
- **Staff**: `staff@ncad.ie` / `password`
- **Department Admin**: `admin@ncad.ie` / `password`
- **Master Admin**: `masteradmin@ncad.ie` / `password`

---

## 💡 **Success Criteria for Phase 7**

### Mobile Integration
- [ ] All touch targets ≥ 44px
- [ ] Load time <3s on simulated 3G
- [ ] Mobile test pass rate ≥ 75%
- [ ] Bundle size <250KB per route
- [ ] Lighthouse mobile score ≥ 90

### Department Features
- [ ] Department equipment isolation working
- [ ] Cross-department access workflow complete
- [ ] Department analytics fully functional
- [ ] Booking isolation enforced
- [ ] Time-limited access auto-revocation working

### Testing & Quality
- [ ] Overall test pass rate ≥ 75% (currently 63.5%)
- [ ] Department tests at 100%
- [ ] Mobile interaction tests at 80%+
- [ ] Zero console errors in production
- [ ] Accessibility audit passing (WCAG 2.2 AA)

---

## 🚨 **Known Issues to Be Aware Of**

1. **Test Failures** (46 tests failing):
   - Equipment cards not found in navigation tests
   - CSV file upload functionality timing out
   - Booking workflow async operations
   - Email notification timing issues

2. **Mobile Gaps**:
   - No swipe gestures implemented
   - No pull-to-refresh
   - Calendar not touch-optimized (needs 60px targets)
   - No mobile bottom navigation

3. **Department Isolation**:
   - Students currently see all equipment (should filter by department)
   - Department admins see all bookings (should only see their department)
   - No UI for assigning equipment to departments

4. **Performance**:
   - No virtual scrolling (lists can be slow with >50 items)
   - Images not lazy loaded
   - No bundle optimization
   - Not tested on slow networks

---

## 📚 **Important Context from Previous Phases**

### Phase 6 Achievements (Just Completed)
- Renamed all "Sub-Area" references to "Department" (16 files, 116 lines)
- Built comprehensive Admin Permissions Management for master admin
- Created Department Staff Permissions control system
- Improved test pass rate from 55.6% to 63.5%
- Fixed role naming issues ("department_admin" instead of "admin")

### Design Decisions
- **Mobile-first**: Design for 320px viewport, enhance upward
- **Demo mode**: Uses localStorage instead of Supabase (easier testing)
- **Role-based access**: 4 roles with hierarchical permissions
- **Department isolation**: Database supports it, UI needs enforcement

### Architectural Patterns
- **Service layer**: All business logic in `src/services/`
- **Demo mode abstraction**: Services support both demo and Supabase
- **Permission checks**: Enforce at component level AND service level
- **Audit trails**: Track who modified what and when

---

## 🎯 **What Should We Build First?**

Please help me decide what to tackle first based on:
1. **Impact**: What will provide the most value to users?
2. **Difficulty**: What's achievable in a reasonable timeframe?
3. **Dependencies**: What blocks other features?
4. **Test coverage**: What will help reach 75% pass rate?

**My initial thought**: Start with mobile bottom navigation and equipment-department filtering, as these are foundational for other features. But I'm open to your expert recommendation!

---

## 📞 **How to Help Me**

### I work best when you:
- Break down large tasks into clear steps
- Explain architectural decisions
- Show me code with context (not just snippets)
- Run tests after changes to verify
- Update documentation as we go
- Use the TodoWrite tool to track progress

### I prefer:
- ✅ Incremental changes over big rewrites
- ✅ Mobile-first approach (320px viewport first)
- ✅ Testing as we build (not at the end)
- ✅ Clear comments in complex code
- ✅ Following existing patterns in the codebase

---

## 🎬 **Ready to Start!**

I've read through `PHASE_7_ROADMAP.md` and I'm ready to begin Phase 7 development.

**What should we tackle first?**
