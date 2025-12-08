# 🚀 NCADbook Project - Starter Prompt

**Copy this prompt when resuming work on this project:**

---

## Quick Start Prompt

```
I'm resuming work on the NCADbook Equipment Booking System project.

PROJECT CONTEXT:
- Located at: c:\Users\Media Admin\AIprojects\NCADbook
- Branch: master (synced with GitHub)
- Status: Phase 1 & 2 complete, ready for Phase 3 (UX Overhaul)

CRITICAL FILES TO READ FIRST:
1. Read PROJECT_CHECKPOINT.md for current status
2. Read CLAUDE.md for project instructions and guidelines
3. Review DEVELOPMENT_SESSION_SUMMARY.md for latest session details

CURRENT STATE:
- ✅ Policy Enforcement System (100% complete, committed)
- ✅ Fine Management System (complete)
- ✅ 115+ tests (integration, accessibility, performance)
- ⏳ Database migration ready but not executed: backend/migrations/007_add_policy_enforcement.sql
- ⏳ Ready to start Phase 3: UX/Design Overhaul

IMMEDIATE TASKS:
1. Run database migration: psql -U postgres -d ncadbook_db -f backend/migrations/007_add_policy_enforcement.sql
2. Run test suites to verify everything works
3. Start Phase 3: UX/Design Overhaul with "bold and curious" design system

Please acknowledge you've read the checkpoint and are ready to continue.
```

---

## Extended Start Prompt (For Major Features)

```
I'm resuming work on NCADbook (NCAD Equipment Booking System).

PROJECT: Equipment booking platform for 1,600 students, "Bold & Curious" design philosophy
LOCATION: c:\Users\Media Admin\AIprojects\NCADbook
BRANCH: master (synced)

📚 READ FIRST (in order):
1. PROJECT_CHECKPOINT.md - Full current status (comprehensive)
2. CLAUDE.md - Project instructions, workflow guidelines, tech stack
3. DEVELOPMENT_SESSION_SUMMARY.md - Last session (Oct 20, 2025)
4. context/design-principles.md - Design philosophy for UX work

✅ COMPLETED PHASES:
- Phase 1: Core booking system with 4 portals
- Phase 1.5: Fine Management System (€5/day, account holds)
- Phase 1.6: Policy Enforcement (weekly limits, concurrent limits, training)
- Phase 2: Quality Gates (115+ tests: integration, a11y, performance)

🎯 CURRENT STATUS:
- All features committed and pushed to GitHub ✅
- Database migration ready: backend/migrations/007_add_policy_enforcement.sql
- Test suites established (Playwright + axe-core)
- Zero technical debt
- Ready for Phase 3

⚠️ PENDING ACTION:
Run database migration to activate policy enforcement tables:
```bash
psql -U postgres -d ncadbook_db -f backend/migrations/007_add_policy_enforcement.sql
```

🚀 NEXT PHASE (Phase 3 - UX/Design Overhaul):
1. Set up Playwright MCP for visual testing
2. Apply "bold and curious" design system across all 4 portals
3. Implement Phase I Foundation from context/implementation-roadmap.md
4. Desktop-first (1440px), then mobile adaptation
5. Maintain WCAG 2.1 AA compliance (tested via a11y-audit.spec.js)

🎨 DESIGN CONTEXT (reference before UI work):
- context/design-principles.md - "Bold & Curious" philosophy
- context/style-guide.md - Typography, colors, spacing, components
- context/ux-patterns.md - Booking flow best practices

📊 SUCCESS METRICS:
- 75% reduction in admin time
- 80%+ booking completion rate
- 20%+ equipment utilization increase
- Page load < 2 seconds (improve from current < 3s)
- Maintain WCAG 2.1 AA compliance

MY GOAL FOR THIS SESSION:
[Describe what you want to work on]

Please confirm you've reviewed the checkpoint and are ready to proceed.
```

---

## Quick Reference Commands

### Start Development:
```bash
# Terminal 1 - Frontend
npm run dev              # http://localhost:5175/NCADbook/

# Terminal 2 - Backend
cd backend
node server.js           # http://localhost:3001

# Terminal 3 - Tests (as needed)
npm test                 # Run all tests
npx playwright test --ui # Interactive mode
```

### Check Status:
```bash
git status                       # Check uncommitted changes
git log --oneline -5            # Recent commits
npm list --depth=0              # Dependencies
```

### Run Migrations:
```bash
# Policy enforcement (if not done)
psql -U postgres -d ncadbook_db -f backend/migrations/007_add_policy_enforcement.sql

# Verify
psql -U postgres -d ncadbook_db -c "SELECT * FROM policy_rules;"
```

### Run Test Suites:
```bash
# All tests
npm test

# Specific suites
npx playwright test fine-management
npx playwright test policy-enforcement
npx playwright test a11y-audit
npx playwright test performance-baseline

# Interactive
npx playwright test --ui

# View report
npx playwright show-report
```

---

## Quick Troubleshooting

### Database Not Connecting:
```bash
sc query postgresql-x64-18      # Check if running
sc start postgresql-x64-18      # Start if stopped
psql -U postgres -d ncadbook_db -c "SELECT 1;"  # Test connection
```

### Port Already in Use:
```bash
# Frontend (5175)
netstat -ano | findstr :5175
taskkill /PID <PID> /F

# Backend (3001)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Tests Failing:
```bash
npx playwright install --force   # Reinstall browsers
npx playwright test --debug      # Debug mode
```

---

## Context Files Quick Reference

### For AI Assistants:
- **CLAUDE.md** - Project instructions, workflow, tech stack ⭐️
- **PROJECT_CHECKPOINT.md** - Current status, structure, everything
- **DEVELOPMENT_SESSION_SUMMARY.md** - Latest session details

### For Design Work:
- **context/design-principles.md** - "Bold & Curious" philosophy
- **context/style-guide.md** - Design specifications
- **context/ux-patterns.md** - UX best practices
- **context/implementation-roadmap.md** - Phase I-III plan

### For Technical Reference:
- **docs/equipment_booking_prd.md** - Product requirements
- **docs/ui_requirements.md** - UI specifications
- **backend/migrations/README_POLICY_ENFORCEMENT.md** - Policy system docs

---

## Session Goals Templates

### For Feature Development:
```
GOAL: Implement [feature name]

CONTEXT:
- Feature location: [component/file path]
- Related systems: [booking/fines/policies/etc]
- Design reference: [context file or section]

REQUIREMENTS:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

SUCCESS CRITERIA:
- [ ] Feature works in all 4 portals (if applicable)
- [ ] Tests written and passing
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Committed with clear message

Let's start with step 1...
```

### For UX/Design Work:
```
GOAL: Apply "bold and curious" design to [portal/component]

CONTEXT:
- Starting file: [path]
- Design reference: context/style-guide.md
- UX patterns: context/ux-patterns.md

REQUIREMENTS:
1. Apply design tokens from src/styles/design-tokens.css
2. Ensure WCAG 2.1 AA contrast ratios
3. Desktop-first (1440px), then mobile (375px)
4. Maintain keyboard navigation

PROCESS:
1. Review current component
2. Apply design system (typography, colors, spacing)
3. Test with Playwright MCP (visual comparison)
4. Run a11y-audit to verify compliance
5. Test responsive breakpoints

Let's start with reviewing the current component...
```

### For Bug Fixes:
```
GOAL: Fix [bug description]

SYMPTOMS:
- [What's happening]
- [Where it occurs]
- [How to reproduce]

CONTEXT:
- Affected files: [list]
- Related systems: [booking/fines/policies]
- Tests affected: [test file names]

APPROACH:
1. Reproduce the bug
2. Identify root cause
3. Implement fix
4. Write/update tests
5. Verify fix across all portals

Let's start by reproducing the bug...
```

---

## Useful Snippets

### Check All Systems:
```bash
# Full system check
echo "=== Git Status ===" && \
git status && \
echo "\n=== Database Connection ===" && \
psql -U postgres -d ncadbook_db -c "SELECT COUNT(*) FROM users;" && \
echo "\n=== Node Modules ===" && \
npm list --depth=0 | head -10 && \
echo "\n=== Recent Commits ===" && \
git log --oneline -5
```

### Quick Test Run:
```bash
# Run key test suites
npx playwright test fine-management policy-enforcement a11y-audit --project=chromium-desktop
```

### Commit Template:
```bash
git add .
git commit -m "feat|fix|test|docs: Brief description

Detailed explanation of changes:
- Change 1
- Change 2
- Change 3

Files changed: X files
Lines changed: +X, -X

Relates to: [issue/feature]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Emergency Recovery

### If Something Broke:

1. **Check git status first:**
   ```bash
   git status
   git diff
   ```

2. **Restore last working state:**
   ```bash
   git stash                    # Save current changes
   git checkout master          # Go to master
   git pull origin master       # Get latest
   git stash pop               # Restore changes (optional)
   ```

3. **Nuclear option (lose all changes):**
   ```bash
   git reset --hard HEAD       # Discard all uncommitted changes
   git clean -fd               # Remove untracked files
   ```

4. **If database is corrupted:**
   - Restore from backup (see BACKUP_RESTORE_GUIDE.md)
   - Or re-run all migrations in order (001 through 007)

---

## Project URLs

- **Local Frontend:** http://localhost:5175/NCADbook/
- **Local Backend:** http://localhost:3001
- **GitHub Pages Demo:** https://marjone.github.io/NCADbook/
- **GitHub Repo:** https://github.com/MarJone/NCADbook

---

## Key People/Roles (for context)

- **Students (1,600):** Primary users, book equipment
- **Staff Admins (3-5):** Approve bookings, manage equipment
- **Dept Admins (1-2 per dept):** Department-level oversight
- **Master Admin (1-2):** System-wide control, analytics, CSV import

---

**Remember:** Always read PROJECT_CHECKPOINT.md first for the most current status! 🎯

**Last Updated:** October 20, 2025
