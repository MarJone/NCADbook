# Backup & Restore Guide

**Backup Created:** October 17, 2025
**Purpose:** Safety backup before functionality and UI overhaul
**Current Commit:** `4962627 - fix: Add demo mode fallback for GitHub Pages deployment`

## Backup References

This backup has been saved in two ways for maximum safety:

1. **Branch:** `backup-before-overhaul-2025-10-17`
2. **Tag:** `v-backup-2025-10-17`

Both point to the exact same commit state (4962627).

---

## Quick Restore Commands

### Option 1: Full Restore (Discard ALL changes)

```bash
# WARNING: This will delete all uncommitted work!
git reset --hard v-backup-2025-10-17
```

### Option 2: Create New Branch from Backup (Safe)

```bash
# Creates a new branch from the backup point
git checkout -b restored-from-backup v-backup-2025-10-17
```

### Option 3: Merge Backup into Current Branch

```bash
# If you want to selectively restore files
git checkout v-backup-2025-10-17 -- path/to/specific/file.js
```

---

## Detailed Restore Procedures

### Scenario 1: "The overhaul broke everything, I want to go back completely"

```bash
# 1. Check current status
git status

# 2. If you have uncommitted changes you want to keep:
git stash save "Changes before restore"

# 3. Reset to backup state
git reset --hard v-backup-2025-10-17

# 4. Verify you're at the right commit
git log -1 --oneline
# Should show: 4962627 fix: Add demo mode fallback for GitHub Pages deployment
```

### Scenario 2: "I want to keep the overhaul but restore specific files"

```bash
# Restore a single file
git checkout v-backup-2025-10-17 -- src/styles/design-system.css

# Restore an entire directory
git checkout v-backup-2025-10-17 -- src/components/

# Restore multiple specific files
git checkout v-backup-2025-10-17 -- index.html src/main.js public/styles.css
```

### Scenario 3: "I want to compare old vs new side-by-side"

```bash
# Create a new branch from backup to explore
git checkout -b explore-backup v-backup-2025-10-17

# Switch back to master to see new changes
git checkout master

# Compare differences
git diff v-backup-2025-10-17 master

# Compare specific file
git diff v-backup-2025-10-17 master -- src/components/Header.js
```

### Scenario 4: "Cherry-pick specific good changes from the overhaul"

```bash
# 1. Reset to backup
git reset --hard v-backup-2025-10-17

# 2. Create a new branch for selective changes
git checkout -b selective-overhaul

# 3. Cherry-pick specific commits from master
git cherry-pick <commit-hash>

# Or merge specific files
git checkout master -- path/to/good/file.js
```

---

## Verification Steps

After any restore, verify the system works:

```bash
# 1. Check git status
git status

# 2. Check current commit
git log -1 --oneline

# 3. Test local server
npm run dev
# Visit: http://localhost:5175/NCADbook/

# 4. Run tests (if applicable)
npm test

# 5. Check GitHub Pages
# Visit: https://marjone.github.io/NCADbook/
```

---

## Current System State (Pre-Overhaul)

### Key Features Working
- ✅ Demo mode with mock data
- ✅ PostgreSQL backend integration
- ✅ All 4 portals (Student, Staff Admin, Dept Admin, Master Admin)
- ✅ Equipment browsing and booking
- ✅ User management
- ✅ Analytics dashboard
- ✅ Design system with portal-specific themes
- ✅ GitHub Pages deployment

### File Structure Snapshot
```
NCADbook/
├── backend/               # PostgreSQL backend
├── src/                   # Source code
│   ├── api/              # API integration layer
│   ├── components/       # Reusable UI components
│   ├── pages/            # Portal pages
│   ├── services/         # Service layer
│   ├── state/            # State management
│   └── styles/           # Design system
├── public/               # Static assets
├── docs/                 # Documentation
└── tests/                # Playwright tests
```

### Important Files to Watch
- `src/main.js` - App initialization
- `src/api/client.js` - API client (demo mode fallback)
- `src/styles/design-system.css` - Design tokens (94KB)
- `src/styles/portal-themes.css` - Portal-specific themes
- All portal pages in `src/pages/`

### Dependencies (package.json)
```json
{
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2"
}
```

---

## Push Backup to Remote (Recommended)

```bash
# Push the backup branch to GitHub (safe remote backup)
git push origin backup-before-overhaul-2025-10-17

# Push the tag to GitHub
git push origin v-backup-2025-10-17
```

This ensures even if your local machine has issues, the backup is safe on GitHub.

---

## Advanced: Create Archive Backup

For extra safety, create a .zip archive:

```bash
# Create a complete zip archive
git archive --format=zip --output=ncadbook-backup-2025-10-17.zip v-backup-2025-10-17

# Or create a tar.gz
git archive --format=tar.gz --output=ncadbook-backup-2025-10-17.tar.gz v-backup-2025-10-17
```

Store this archive in a safe location (external drive, cloud storage, etc.).

---

## Troubleshooting

### "I accidentally deleted the backup branch"

```bash
# The tag still exists! Create branch from tag:
git checkout -b backup-before-overhaul-2025-10-17 v-backup-2025-10-17
```

### "I can't find the backup tag"

```bash
# List all tags
git tag --list

# If missing, check if it's on remote
git fetch --tags

# Or use the commit hash directly
git checkout 4962627
```

### "I'm not sure what commit I'm on"

```bash
# Show current commit
git log -1 --oneline

# Show recent history
git log --oneline -10

# Show all branches
git branch -a
```

### "The restore didn't work as expected"

```bash
# See what changed
git status

# See full diff
git diff v-backup-2025-10-17

# If something is wrong, reset again
git reset --hard v-backup-2025-10-17

# Clear any cached files
rm -rf node_modules
npm install
```

---

## Pre-Overhaul Checklist

Before starting the overhaul, ensure:

- [x] All changes committed
- [x] Backup branch created: `backup-before-overhaul-2025-10-17`
- [x] Backup tag created: `v-backup-2025-10-17`
- [x] Current system tested and working
- [ ] Backup pushed to GitHub (recommended)
- [ ] Archive created (optional, extra safety)

---

## Post-Overhaul Success Criteria

After overhaul, verify:

- [ ] All 4 portals still load correctly
- [ ] Demo mode still works
- [ ] Equipment browsing/booking functional
- [ ] User management works
- [ ] Analytics dashboard operational
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Performance is same or better
- [ ] Tests pass (if applicable)

If any of these fail, use this guide to restore.

---

## Contact & Support

If you need help with restoration:
1. Check this guide first
2. Review git documentation: `git --help`
3. Check project documentation in `/docs`
4. GitHub Issues: https://github.com/marjone/NCADbook/issues

---

**Remember:** The backup is at commit `4962627`. When in doubt, return to this known-good state.

**Last Updated:** October 17, 2025
