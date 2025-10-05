# Work PC Setup Instructions

This document contains instructions for setting up the NCADbook project on a new machine after copying from USB drive.

## Quick Start Checklist

When you copy this project to your work PC, run through these steps:

### 1. Verify Node.js and npm
```bash
node --version
npm --version
```
**Required:** Node.js 16+ and npm 8+

If not installed, download from: https://nodejs.org/

### 2. Install Project Dependencies
```bash
npm install
```

This will install all packages listed in `package.json`, including:
- React and React Router
- Vite (build tool)
- gh-pages (for GitHub Pages deployment)
- jsPDF (for PDF exports)
- EmailJS (for notifications)
- Playwright (for testing)

### 3. Verify Git Configuration
```bash
git --version
git config --global user.name
git config --global user.email
```

If git is not configured, set it up:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4. Start Development Server
```bash
npm run dev
```

The dev server should start at: `http://localhost:5178/NCADbook/`

**Expected output:**
```
VITE v5.4.20  ready in XXX ms
➜  Local:   http://localhost:5178/NCADbook/
```

### 5. Test the Application

Open your browser and navigate to `http://localhost:5178/NCADbook/`

You should see:
- Login page with portal map image
- 4 clickable quadrants (Student, Staff, Department Admin, Master Admin)
- Hover effects showing portal names

**Test Login Credentials:**
- **Student:** commdesign.student1@student.ncad.ie / student123
- **Staff:** staff.commdesign@ncad.ie / staff123
- **Department Admin:** admin.commdesign@ncad.ie / admin123
- **Master Admin:** master@ncad.ie / master123

### 6. Verify Build Process
```bash
npm run build
```

Should create a `dist/` folder with production-ready files.

### 7. Test GitHub Pages Deployment (Optional)

If you need to deploy to GitHub Pages from this machine:

```bash
npm run deploy
```

**Note:** This requires GitHub authentication. You may need to:
- Log in to GitHub via git
- Set up SSH keys or personal access token

## Troubleshooting

### Port Already in Use
If port 5178 is in use, Vite will automatically try the next available port. Check the terminal output for the actual port number.

### Missing Dependencies Error
If you see module not found errors, run:
```bash
npm install
npm run dev
```

### Git Authentication Issues
For GitHub Pages deployment, you may need to authenticate:
```bash
git config --global credential.helper store
```
Then run `npm run deploy` and enter your GitHub credentials when prompted.

### Image Not Loading
If the login background image doesn't load:
- Verify `public/login-map-frame2.jpg` exists (9.5 MB file)
- Check browser console for 404 errors
- Ensure dev server is running at `/NCADbook/` base path

### Demo Mode Issues
The application runs in **demo mode** with:
- No external database (Supabase disabled)
- All data stored in localStorage
- Mock authentication using demo users from `src/mocks/demo-data-phase8.js`

If you see Supabase errors, this is expected and the mock client should handle it.

## Project Commands Reference

```bash
# Development
npm run dev              # Start dev server (http://localhost:5178/NCADbook/)
npm run build            # Build for production
npm run preview          # Preview production build

# Deployment
npm run deploy           # Deploy to GitHub Pages (runs build first)

# Testing
npm test                 # Run Playwright tests
npx playwright test --ui # Interactive test mode
```

## Environment Notes

### No Environment Variables Required
This project runs in **demo mode** and does not require any `.env` file or environment variables. All authentication and data is handled locally.

### GitHub Pages Configuration
- Base path: `/NCADbook/`
- Deployed to: https://marjone.github.io/NCADbook/
- Source: `gh-pages` branch (auto-created by gh-pages package)

### File Structure Check
Verify these key files exist:
```
NCADbook/
├── public/
│   └── login-map-frame2.jpg  (9.5 MB - critical for login page)
├── src/
│   ├── components/
│   ├── portals/
│   ├── services/
│   ├── mocks/
│   └── App.jsx
├── package.json
├── vite.config.js
└── index.html
```

## Quick Test After Setup

1. ✅ Run `npm install` - should complete without errors
2. ✅ Run `npm run dev` - server starts successfully
3. ✅ Open `http://localhost:5178/NCADbook/` - login page appears
4. ✅ Click Student quadrant - logs in and shows student dashboard
5. ✅ Click logout - returns to login page
6. ✅ Click Master Admin quadrant - logs in and shows master admin dashboard

If all steps pass, your work PC is ready for demo!

## Demo Day Checklist

Before your demo presentation:
- [ ] Run `npm run dev` to start local server
- [ ] Test all 4 portal logins work
- [ ] Verify 3-strike system displays (students ID 24, 25, 26 have strikes)
- [ ] Check Master Admin can access specialized role portals
- [ ] Ensure laptop is plugged in (large image files may drain battery)
- [ ] Have backup plan if internet needed (currently works offline)

## Contact & Support

If you encounter issues on your work PC, use this prompt with Claude Code:

```
I've just set up the NCADbook project on my work PC after copying from USB.
I'm getting [describe your error/issue].

Please help me:
1. Diagnose the problem
2. Check if any dependencies are missing
3. Verify the configuration is correct for this machine
4. Get the dev server running

Current error: [paste error message here]
```

---

**Last Updated:** 2025-10-05
**Project Version:** 2.0.0
**Node Version Required:** 16+
**Demo Mode:** Enabled (no external services required)
