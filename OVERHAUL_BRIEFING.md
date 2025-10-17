# Functionality & UI Overhaul - Briefing Document

**Date:** October 17, 2025
**Status:** Ready to begin - Backup complete
**Current Commit:** `4962627 - fix: Add demo mode fallback for GitHub Pages deployment`

---

## 🔒 Backup Status: COMPLETE ✅

- **Backup Branch:** `backup-before-overhaul-2025-10-17`
- **Backup Tag:** `v-backup-2025-10-17`
- **Restore Guide:** [BACKUP_RESTORE_GUIDE.md](BACKUP_RESTORE_GUIDE.md)

**Quick Restore:** `git reset --hard v-backup-2025-10-17`

---

## 📋 Current System Overview

### Working Features (Pre-Overhaul)
- ✅ Demo mode with mock data (fallback for GitHub Pages)
- ✅ PostgreSQL backend integration (for local development)
- ✅ 4 portals: Student, Staff Admin, Dept Admin, Master Admin
- ✅ Equipment browsing and booking system
- ✅ User management and authentication
- ✅ Analytics dashboard with PDF export (jsPDF)
- ✅ Design system (94KB CSS) with portal-specific themes
- ✅ GitHub Pages deployment: https://marjone.github.io/NCADbook/
- ✅ Local dev: http://localhost:5175/NCADbook/

### Key Technologies
- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework)
- **Backend:** PostgreSQL with Node.js API
- **State:** Simple localStorage + in-memory state management
- **API Client:** [src/api/client.js](src/api/client.js) with demo mode fallback
- **Design System:** CSS custom properties in [src/styles/design-system.css](src/styles/design-system.css)
- **Testing:** Playwright configured (6 device profiles)

---

## 🎯 Overhaul Scope (To Be Defined)

### Likely Focus Areas
Based on "functionality and UI overhaul," consider:

1. **Functionality Improvements**
   - [ ] Enhanced booking workflow?
   - [ ] Better equipment search/filtering?
   - [ ] Improved admin approval process?
   - [ ] New features (notifications, equipment kits, etc.)?
   - [ ] Performance optimizations?

2. **UI/UX Improvements**
   - [ ] Redesign portal layouts?
   - [ ] Improve mobile responsiveness?
   - [ ] Update design system (colors, typography, spacing)?
   - [ ] Better component consistency?
   - [ ] Enhanced accessibility?

3. **Technical Debt**
   - [ ] Refactor state management?
   - [ ] Improve API client structure?
   - [ ] Component modularization?
   - [ ] Code cleanup and optimization?

**Action:** Define specific goals for the overhaul before starting implementation.

---

## 📁 Critical File Locations

### Core Application Files
```
src/main.js                          # App initialization & routing
src/api/client.js                    # API client with demo mode
src/services/DemoModeService.js      # Mock data service
src/state/StateManager.js            # Global state management
```

### Portal Pages
```
src/pages/student/StudentPortal.js
src/pages/staff-admin/StaffAdminPortal.js
src/pages/dept-admin/DeptAdminPortal.js
src/pages/master-admin/MasterAdminPortal.js
```

### Design System
```
src/styles/design-system.css         # Design tokens (94KB)
src/styles/portal-themes.css         # Portal-specific themes
src/styles/components.css            # Component styles
public/styles.css                    # Legacy/additional styles
```

### Components
```
src/components/Header.js
src/components/Sidebar.js
src/components/BookingCard.js
src/components/EquipmentCard.js
src/components/UserManagement.js
src/components/AnalyticsDashboard.js
src/components/SystemSettings.js
```

### Backend
```
backend/server.js                    # Node.js API server
backend/db.js                        # PostgreSQL connection
backend/setup_postgres.sql           # Database schema
```

### Configuration
```
package.json                         # Dependencies & scripts
vite.config.js                       # Vite build config
playwright.config.js                 # Test configuration
```

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev                          # http://localhost:5175/NCADbook/

# Start backend (separate terminal)
cd backend
node server.js                       # http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
npx playwright test --ui             # Interactive mode

# Git commands
git status
git log --oneline -10
```

---

## 🎨 Design System Quick Reference

### Portal Themes
- **Student Portal:** Blue theme (`#1976D2`)
- **Staff Admin:** Green theme (`#388E3C`)
- **Dept Admin:** Amber theme (`#F57C00`)
- **Master Admin:** Purple theme (`#9C27B0`)

### Key CSS Variables (design-tokens.css)
```css
/* Spacing: 8pt grid system */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Typography */
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg

/* Colors */
--color-primary-*, --color-success-*, --color-error-*, etc.
```

### Responsive Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

## 📊 Current Bundle Size

```
Total CSS: ~239KB
- design-system.css: ~94KB
- portal-themes.css: ~30KB
- components.css: ~40KB
- other: ~75KB

Dependencies:
- jspdf: ^3.0.3
- jspdf-autotable: ^5.0.2
```

---

## ⚠️ Important Constraints

### From CLAUDE.md

1. **Mobile-First:** Always design for 320px viewport first
2. **Touch Targets:** Minimum 44px for all interactive elements
3. **Performance:** <3 second load on 3G networks
4. **Security:** Never expose tracking_number to students
5. **RLS Policies:** All database access respects Row Level Security
6. **Testing:** Test across all 6 Playwright device profiles
7. **No Frameworks:** Vanilla JS only (project constraint)

### Demo Mode
- [src/api/client.js](src/api/client.js) has automatic fallback to demo mode
- Required for GitHub Pages deployment (no backend available)
- Uses [DemoModeService.js](src/services/DemoModeService.js) for mock data

---

## 📝 Recommended Overhaul Workflow

### Phase 1: Planning (Before Any Code)
1. **Define Goals:** What specific functionality/UI changes are needed?
2. **Create Task List:** Use TodoWrite tool to break down work
3. **Identify Files:** List all files that will be modified
4. **Test Baseline:** Run `npm run dev` and `npm test` to verify current state
5. **Document Plan:** Update [ProjectMemory.md](ProjectMemory.md) with Phase overview

### Phase 2: Implementation
1. **Small Increments:** Make changes in small, testable chunks
2. **Test Frequently:** Check local demo after each major change
3. **Commit Often:** Small commits with clear messages
4. **Track Progress:** Update todo list as you complete tasks
5. **Watch for Regressions:** Ensure existing features still work

### Phase 3: Testing & Refinement
1. **Manual Testing:** Test all 4 portals in demo mode
2. **Playwright Tests:** Run automated test suite
3. **Responsive Check:** Test mobile (320px), tablet (768px), desktop (1024px+)
4. **Performance:** Check load times and bundle size
5. **Accessibility:** Keyboard navigation and ARIA labels

### Phase 4: Documentation
1. **Update ProjectMemory.md:** Document changes, challenges, lessons
2. **Update CLAUDE.md:** If new patterns/conventions established
3. **Code Comments:** Add comments for complex logic
4. **Commit Message:** Comprehensive commit with all changes

---

## 🚨 When to Consider Restoring Backup

- Core functionality is broken and can't be quickly fixed
- Performance degraded significantly (>50% slower)
- Demo mode stopped working (breaks GitHub Pages)
- Can't identify source of critical bug after 2+ hours
- Overhaul scope grew too large to manage

**Always refer to [BACKUP_RESTORE_GUIDE.md](BACKUP_RESTORE_GUIDE.md) for restore procedures.**

---

## 📚 Key Documentation References

- **[CLAUDE.md](CLAUDE.md)** - Project overview, architecture, guidelines
- **[ProjectMemory.md](ProjectMemory.md)** - Development history and decisions
- **[docs/equipment_booking_prd.md](docs/equipment_booking_prd.md)** - Product requirements
- **[docs/agents/](docs/agents/)** - Sub-agent specifications for features
- **[BACKUP_RESTORE_GUIDE.md](BACKUP_RESTORE_GUIDE.md)** - Restoration procedures

---

## ✅ Pre-Overhaul Checklist

- [x] All changes committed (working tree clean)
- [x] Backup branch created
- [x] Backup tag created
- [x] Restore guide created
- [x] Current system tested and working
- [ ] Overhaul goals defined (do this first after context clear)
- [ ] Task breakdown created (use TodoWrite)
- [ ] Backup pushed to GitHub (recommended but optional)

---

## 🎬 Ready to Start

After clearing context, your first prompt could be:

> "I'm ready to start the functionality and UI overhaul for the NCAD Equipment Booking System. Please review [OVERHAUL_BRIEFING.md](OVERHAUL_BRIEFING.md) for current state and backup info.
>
> **Overhaul Goals:**
> [Define your specific goals here - what functionality and UI changes do you want?]
>
> Let's create a task breakdown and implementation plan."

---

## 💡 Pro Tips

1. **Start Small:** Pick one portal or feature to overhaul first
2. **Keep Demo Mode Working:** Test frequently to ensure GitHub Pages deploy still works
3. **Preserve Existing Features:** Unless specifically changing them
4. **Document As You Go:** Update ProjectMemory.md during implementation, not after
5. **Commit Frequently:** Small commits are easier to debug/revert than large ones
6. **Test Mobile First:** Many issues only appear on small screens

---

**Last Updated:** October 17, 2025
**Status:** Ready for overhaul - backup complete, context-clear-ready ✅
