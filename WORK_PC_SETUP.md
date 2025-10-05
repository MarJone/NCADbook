# 🖥️ NCAD Equipment Booking System - Work PC Setup Guide

**Generated:** 2025-10-05
**Project:** NCADbook Demo Mode (No Database Required)
**Repository:** https://github.com/MarJone/NCADbook

---

## 📋 Quick Setup Checklist

```bash
# 1. Clone the repository
git clone https://github.com/MarJone/NCADbook.git
cd NCADbook

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser to:
http://localhost:5173/NCADbook/
```

---

## 🔧 System Requirements

### Required Software
- **Node.js:** v18.x or higher (includes npm)
- **Git:** Latest version
- **Modern Browser:** Chrome, Firefox, Safari, or Edge

### Check Versions
```bash
node --version   # Should show v18+
npm --version    # Should show v9+
git --version    # Any recent version
```

### Optional (Recommended)
- **VS Code:** With extensions:
  - ESLint
  - Prettier
  - GitLens
  - ES7+ React/Redux/React-Native snippets

---

## 📦 Project Dependencies

### Production Dependencies (package.json)
```json
{
  "dependencies": {
    "dompurify": "^3.2.4",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@playwright/test": "^1.49.1",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "globals": "^15.14.0",
    "vite": "^5.4.11"
  }
}
```

---

## 📁 Project Structure

```
NCADbook/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # GitHub Pages deployment
│       └── playwright.yml      # Playwright testing CI
├── public/
│   └── NCADbook/
│       ├── login-map-frame2.jpg  # Login portal image
│       └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Login.jsx       # Artistic login portal
│   │   │   └── Login.css       # Calligraphy brush stroke styling
│   │   ├── student/
│   │   │   └── StrikeStatus.jsx
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.jsx     # Demo mode authentication
│   ├── mocks/
│   │   ├── demo-mode.js        # Local storage demo system
│   │   ├── demo-data-phase8.js # 150 users, 150 equipment
│   │   └── ...
│   ├── portals/
│   │   ├── student/
│   │   ├── staff/
│   │   ├── admin/
│   │   └── master-admin/
│   ├── services/
│   │   ├── auth.service.js     # Pure demo mode (no Supabase)
│   │   └── strike.service.js   # Demo strike system
│   ├── styles/
│   │   └── design-tokens.css   # Design system
│   ├── config/
│   │   └── departments.js      # 10 NCAD departments
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── docs/                        # Comprehensive documentation
├── database/                    # SQL schemas (for future)
├── tests/                       # Playwright tests
├── CLAUDE.md                    # AI assistant instructions ⭐
├── DEMO_CREDENTIALS.md          # All login credentials ⭐
├── WORK_PC_SETUP.md            # This file ⭐
├── ProjectMemory.md             # Development history
├── package.json
├── package-lock.json
├── vite.config.js
├── playwright.config.js
└── .gitignore
```

---

## 🚀 Development Commands

### Start Development Server
```bash
npm run dev
# Server runs on: http://localhost:5173/NCADbook/
# Auto-opens browser and hot-reloads on file changes
```

### Build for Production
```bash
npm run build
# Output: dist/ folder
# Optimized for GitHub Pages deployment
```

### Preview Production Build
```bash
npm run preview
# Test production build locally before deploying
```

### Run Tests
```bash
npm test                              # Run all Playwright tests
npx playwright test --ui              # Interactive test mode
npx playwright test --project=mobile-chrome    # Mobile tests
npx playwright show-report            # View test report
```

---

## 🎯 Current Project Status (Phase 8+)

### ✅ Completed Features

**Demo Mode:**
- ✅ Fully functional demo with no external database required
- ✅ All data stored in browser localStorage
- ✅ 150 demo users across 10 departments
- ✅ 150 equipment items with full metadata
- ✅ Complete booking workflow (create, approve, manage)

**Portals:**
- ✅ Student Portal (browse, book, track)
- ✅ Staff Portal (enhanced permissions)
- ✅ Department Admin Portal (approvals, analytics)
- ✅ Master Admin Portal (system settings, role management)

**Key Systems:**
- ✅ Three-strike system for late returns
- ✅ Cross-department equipment access
- ✅ Equipment kits (bundles)
- ✅ Room/space booking system
- ✅ Analytics dashboard with CSV/PDF export
- ✅ Role-based permissions system

**UI/UX:**
- ✅ Artistic login portal with calligraphy hover text
- ✅ Mobile-first responsive design
- ✅ Design system with tokens
- ✅ 4 themed portals (Student, Staff, Dept Admin, Master Admin)

### 🔄 Recent Changes (Latest)

1. **Removed all Supabase integration** - Pure demo mode
2. **Artistic calligraphy login** - Brush stroke effect with white drop shadow for legibility
3. **Strike system** - Complete demo implementation
4. **GitHub Actions** - Automated deployment to GitHub Pages

---

## 🔐 Demo Credentials

### Main Portals (Click quadrants on login map)

**Student Portal** (Top-Left):
```
Email:    commdesign.student1@student.ncad.ie
Password: student123
```

**Staff Portal** (Top-Right):
```
Email:    staff.commdesign@ncad.ie
Password: staff123
```

**Department Admin** (Bottom-Left):
```
Email:    admin.commdesign@ncad.ie
Password: admin123
```

**Master Admin** (Bottom-Right):
```
Email:    master@ncad.ie
Password: master123
```

See [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md) for all 150+ test accounts.

---

## 🌐 Deployment URLs

### Local Development
```
http://localhost:5173/NCADbook/
```

### GitHub Pages (Production)
```
https://marjone.github.io/NCADbook/
```

**Note:** GitHub Pages needs to be enabled in repository settings:
1. Go to: https://github.com/MarJone/NCADbook/settings/pages
2. Under "Source", select: **GitHub Actions**
3. Save

---

## 🛠️ Troubleshooting Work PC Setup

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall
npm install
```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Vite will automatically try ports 5174, 5175, etc.
# Or specify a custom port:
npm run dev -- --port 3000
```

### Issue: Git authentication fails

**Solution:**
```bash
# Configure git with your work credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@ncad.ie"

# Use HTTPS with Personal Access Token
# Or configure SSH keys for GitHub
```

### Issue: Module not found errors

**Solution:**
```bash
# Ensure all dependencies are installed
npm install

# Check Node.js version
node --version  # Should be v18+

# Rebuild if needed
npm run build
```

### Issue: Localhost doesn't load

**Solution:**
1. Check if dev server is actually running
2. Verify URL includes `/NCADbook/` base path
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito/private window
5. Check browser console for errors (F12)

### Issue: Login buttons don't work

**Solution:**
```bash
# Clear browser localStorage
# Open browser console (F12), type:
localStorage.clear()
# Then refresh page (F5)
```

---

## 📝 Important Files to Review

### Configuration
- `vite.config.js` - Build configuration, base path: `/NCADbook/`
- `package.json` - Scripts and dependencies
- `playwright.config.js` - Test configuration

### Documentation
- `CLAUDE.md` - AI assistant project instructions ⭐
- `DEMO_CREDENTIALS.md` - All login credentials
- `ProjectMemory.md` - Development timeline and decisions
- `WORK_PC_SETUP.md` - This file
- `docs/` - Comprehensive feature documentation

### Demo Data
- `src/mocks/demo-mode.js` - localStorage manager
- `src/mocks/demo-data-phase8.js` - User and equipment data
- `src/config/departments.js` - NCAD department structure

---

## 🔄 Syncing Between Home and Work PC

### Push Latest Changes (Home PC)
```bash
git add .
git commit -m "Latest changes before moving to work PC"
git push origin master
```

### Pull Latest Changes (Work PC)
```bash
cd NCADbook
git pull origin master
npm install  # Install any new dependencies
npm run dev  # Start development
```

---

## 📊 Project Stats

- **Total Users:** 150 demo accounts
- **Equipment Items:** 150 pieces
- **Departments:** 10 NCAD departments
- **Portals:** 4 main + 5 specialized roles
- **Lines of Code:** ~20,000+ (estimated)
- **Components:** 50+ React components
- **Demo Mode:** 100% local (no backend required)
- **No External APIs:** Runs completely offline

---

## 🎨 Design System

### Color Tokens
- **Student Portal:** Blue theme (#2196F3)
- **Staff Portal:** Green theme (#4CAF50)
- **Department Admin:** Amber theme (#FF6F00)
- **Master Admin:** Purple theme (#9C27B0)

### Typography
- **Headings:** System font stack
- **Body:** -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Login Portal:** Artistic calligraphy ('Brush Script MT', 'Lucida Handwriting')

### Spacing
- 8pt grid system (8, 16, 24, 32, 48, 64px)

---

## ⚡ Quick Start Script (Copy-Paste)

```bash
# Complete setup in one command block (Windows Git Bash)
git clone https://github.com/MarJone/NCADbook.git
cd NCADbook
npm install
npm run dev
# Browser should auto-open to http://localhost:5173/NCADbook/
```

---

## 📞 Support Resources

### Documentation
- **Project Docs:** `docs/` folder
- **CLAUDE.md:** AI assistant instructions and architecture
- **Demo Guide:** `DEMO_GUIDE.md`

### External Resources
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Playwright Docs:** https://playwright.dev/

---

## ✅ Setup Verification Checklist

After setup on work PC, verify:

- [ ] Node.js installed (v18+): `node --version`
- [ ] Git configured with credentials
- [ ] Repository cloned successfully
- [ ] Dependencies installed: `npm install` completed
- [ ] Dev server starts: `npm run dev` works
- [ ] Login page loads at http://localhost:5173/NCADbook/
- [ ] Can login with master@ncad.ie / master123
- [ ] Master Admin portal loads correctly
- [ ] No console errors in browser (F12)
- [ ] Can build production: `npm run build` succeeds
- [ ] Hover over login quadrants shows calligraphy text

---

## 🎯 Quick Test After Setup

1. **Start dev server:** `npm run dev`
2. **Open:** http://localhost:5173/NCADbook/
3. **Hover over bottom-right quadrant** - Should see "Master Admin" in artistic calligraphy
4. **Click bottom-right quadrant** - Should auto-login to Master Admin portal
5. **Check navigation** - All menu items should work
6. **Open browser console (F12)** - Should see demo mode messages, no errors

---

## 🚨 Critical Notes

### Demo Mode
- **No database required** - Everything runs in browser localStorage
- **Data persists** - Until you clear browser cache/localStorage
- **150+ users** - All with different roles and permissions
- **Reset anytime** - Clear localStorage to reset demo data

### GitHub Repository
- **Main branch:** `master`
- **Deploy workflow:** `.github/workflows/deploy.yml`
- **Base URL:** `/NCADbook/` (configured in vite.config.js)

### Known Issues
- None currently - project is in working demo state
- All Supabase code has been removed (pure demo mode)
- Strike history initialized correctly

---

**Last Updated:** 2025-10-05
**Maintained By:** NCAD Development Team
**Status:** ✅ Demo Mode Ready - No Database Required
**Next Steps:** Enable GitHub Pages for deployment
