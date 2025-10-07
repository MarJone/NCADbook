# NCADbook - Complete Setup Guide for New PC

**Last Updated:** 2025-10-07
**Project Version:** 2.0.0
**Estimated Setup Time:** 30-45 minutes

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup (TL;DR)](#quick-setup-tldr)
3. [Detailed Setup Steps](#detailed-setup-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

---

## Prerequisites

### Required Software

Install these in order:

#### 1. **Node.js v22.19.0** (or later v22.x)
- **Download:** https://nodejs.org/
- **Verify:** `node --version` (should show v22.19.0)
- **npm:** Comes with Node.js (v11.6.0 or later)
- **Verify npm:** `npm --version`

#### 2. **PostgreSQL 18.0** (or later v18.x)
- **Download:** https://www.postgresql.org/download/windows/
- **Important:** During installation:
  - Set superuser (postgres) password - **REMEMBER THIS!**
  - Default port: 5432
  - Add to PATH: `C:\Program Files\PostgreSQL\18\bin`
- **Verify:** `psql --version` (should show PostgreSQL 18.0)

#### 3. **Git** (latest version)
- **Download:** https://git-scm.com/download/win
- **Verify:** `git --version`

#### 4. **Code Editor (Optional but Recommended)**
- **VS Code:** https://code.visualstudio.com/
- **Extensions:**
  - ESLint
  - Prettier
  - PostgreSQL (by Chris Kolkman)
  - Thunder Client (for API testing)

---

## Quick Setup (TL;DR)

For experienced developers, here's the express setup:

```bash
# 1. Clone repository
git clone <your-repo-url>
cd NCADbook

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Setup PostgreSQL database
# (See PostgreSQL Setup section below)

# 4. Configure environment
cd backend
cp .env.example .env
# Edit .env with your database password

# 5. Initialize database
npm run db:setup
npm run db:seed

# 6. Run application
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Access: http://localhost:5175/NCADbook/
```

---

## Detailed Setup Steps

### Step 1: Clone the Repository

```bash
# Option A: From your GitHub repository
git clone https://github.com/YOUR_USERNAME/NCADbook.git
cd NCADbook

# Option B: From local copy (if transferring via USB/network)
# Just copy the entire NCADbook folder to your new PC
cd path/to/NCADbook
```

**Verify project structure:**
```bash
dir  # Should see: backend/, src/, public/, package.json, etc.
```

---

### Step 2: Install Node.js Dependencies

#### Frontend Dependencies:
```bash
npm install
```

**Expected output:**
- Installing 50+ packages
- No WARN or ERR messages (warnings are okay)
- Should complete in 1-3 minutes

**Key packages installed:**
- React 18.2.0
- Vite 5.0.0
- React Router DOM 6.20.0
- jsPDF 3.0.3
- @emailjs/browser 4.4.1
- Playwright (testing)

#### Backend Dependencies:
```bash
cd backend
npm install
cd ..
```

**Expected output:**
- Installing 20+ packages
- Should complete in 30-60 seconds

**Key packages installed:**
- Express 4.18.2
- PostgreSQL (pg) 8.11.3
- bcrypt 5.1.1
- jsonwebtoken 9.0.2
- nodemon 3.0.2 (dev dependency)

---

### Step 3: PostgreSQL Database Setup

#### A. Verify PostgreSQL Installation

```bash
# Test PostgreSQL connection
psql --version

# If not found, add to PATH:
# 1. Open System Environment Variables
# 2. Edit PATH variable
# 3. Add: C:\Program Files\PostgreSQL\18\bin
# 4. Restart terminal
```

#### B. Create Database User

Open **Command Prompt as Administrator** and run:

```bash
psql -U postgres
```

Enter your postgres password when prompted.

**In the PostgreSQL prompt, execute:**

```sql
-- Create database user
CREATE USER ncadbook_user WITH PASSWORD 'your_secure_password_123';

-- Create database
CREATE DATABASE ncadbook_db OWNER ncadbook_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ncadbook_db TO ncadbook_user;

-- Connect to database
\c ncadbook_db

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO ncadbook_user;

-- Exit
\q
```

**Important Notes:**
- Replace `'your_secure_password_123'` with a strong password
- Save this password - you'll need it in `.env` file
- If you get "database already exists" error, that's okay (skip CREATE DATABASE)

---

### Step 4: Backend Environment Configuration

#### A. Create `.env` File

```bash
cd backend
cp .env.example .env
```

#### B. Edit `.env` File

Open `backend/.env` in a text editor and update:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (UPDATE THESE!)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncadbook_db
DB_USER=ncadbook_user
DB_PASSWORD=your_secure_password_123  # ← Use your password from Step 3

# JWT Authentication (CHANGE IN PRODUCTION!)
JWT_SECRET=dev_secret_change_in_production_$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5175
ALLOWED_ORIGINS=http://localhost:5175,http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads/equipment

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**Security Notes:**
- `JWT_SECRET`: For production, generate a random 64-character string
- `DB_PASSWORD`: Use a strong password (at least 16 characters)
- Never commit `.env` to git (it's in `.gitignore`)

---

### Step 5: Initialize Database

Run these commands from the `backend` directory:

```bash
cd backend

# Create all tables and schema
npm run db:setup

# Seed with demo data (users, equipment, bookings)
npm run db:seed
```

**Expected output:**

`npm run db:setup`:
```
✅ Database setup complete!
✅ Created tables: users, equipment, bookings, departments, etc.
✅ Created indexes and constraints
✅ RLS policies configured
```

`npm run db:seed`:
```
✅ Seeded 50+ users (students, admins, staff)
✅ Seeded 100+ equipment items
✅ Seeded 50+ sample bookings
✅ Seeded departments and system settings
```

**If you see errors:**
- Check database credentials in `.env`
- Ensure PostgreSQL service is running
- Check you have the correct permissions (see Step 3)

---

### Step 6: Verify Installation

Check that everything is properly configured:

```bash
# From project root
npm list react       # Should show react@18.2.0
npm list vite        # Should show vite@5.0.0

cd backend
npm list express     # Should show express@4.18.2
npm list pg          # Should show pg@8.11.3
```

---

## Configuration

### Frontend Configuration (Optional)

The frontend uses Vite and loads environment variables from `.env` files.

**Default settings (in `vite.config.js`):**
- Dev server: http://localhost:5175
- Base path: /NCADbook/
- API proxy: http://localhost:3001/api

**To customize, create `.env` in project root:**

```env
VITE_API_URL=http://localhost:3001/api
VITE_DEMO_MODE=false
```

### EmailJS Configuration (For email notifications)

1. Create account at https://www.emailjs.com/
2. Get Service ID, Template IDs, and Public Key
3. Update in admin portal → System Settings → Email Configuration

**For development:** Email features work but won't send actual emails until configured.

---

## Running the Application

### Development Mode (Recommended)

You need **TWO terminal windows**:

**Terminal 1 - Backend API Server:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
[nodemon] starting `node src/server.js`
🚀 Server running on http://localhost:3001
✅ Database connected successfully
📡 CORS enabled for: http://localhost:5175
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5175/NCADbook/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Access the application:**
- **Main URL:** http://localhost:5175/NCADbook/
- **API Health Check:** http://localhost:3001/health
- **API Docs:** http://localhost:3001/api

### Production Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Run backend in production
cd backend
npm start
```

---

## Development Workflow

### Daily Development Routine

1. **Start Backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Start Frontend (new terminal):**
   ```bash
   npm run dev
   ```

3. **Code away!** Changes auto-reload in both servers.

4. **Run tests (optional):**
   ```bash
   npm test              # Run all Playwright tests
   npm run test:student  # Test student portal
   npm run test:admin    # Test admin portal
   ```

### Demo Login Credentials

After seeding database, you can login with:

**Students:**
- Email: `student1@ncad.ie` to `student50@ncad.ie`
- Password: `password123`

**Department Admin:**
- Email: `admin.graphics@ncad.ie`
- Password: `admin123`

**Master Admin:**
- Email: `master.admin@ncad.ie`
- Password: `masteradmin123`

### Useful Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm test                 # Run all tests
npm run lint             # Check code style
npm run format           # Format code with Prettier

# Backend
cd backend
npm run dev              # Start with auto-reload (nodemon)
npm start                # Start production server
npm run db:reset         # Reset database (WARNING: deletes all data!)
npm run db:seed          # Re-seed demo data

# Testing
npm run test:mobile      # Test mobile views
npm run test:desktop     # Test desktop views
npm run test:report      # View test results
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solutions:**
1. Check PostgreSQL service is running:
   ```bash
   # Windows: Open Services app → find PostgreSQL 18 → Start
   ```

2. Verify credentials in `backend/.env`:
   ```env
   DB_USER=ncadbook_user
   DB_PASSWORD=your_password
   DB_NAME=ncadbook_db
   ```

3. Test connection manually:
   ```bash
   psql -U ncadbook_user -d ncadbook_db -h localhost
   ```

### Issue: "Port 3001 already in use"

**Solution:**
```bash
# Windows: Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Or change port in backend/.env:
PORT=3002
```

### Issue: "Port 5175 already in use"

**Solution:**
```bash
# Vite will auto-increment to 5176, 5177, etc.
# Or specify custom port:
npm run dev -- --port 5180
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Re-install dependencies
npm install
cd backend && npm install && cd ..

# Clear npm cache if persistent
npm cache clean --force
```

### Issue: Frontend shows "API connection failed"

**Checklist:**
1. ✅ Backend server running? Check http://localhost:3001/health
2. ✅ CORS configured? Check `backend/.env` → `FRONTEND_URL=http://localhost:5175`
3. ✅ API URL correct? Check browser console for errors
4. ✅ Database seeded? Run `npm run db:seed` in backend

### Issue: "Permission denied" on PostgreSQL

**Solution:**
```sql
-- Connect as postgres superuser
psql -U postgres -d ncadbook_db

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ncadbook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ncadbook_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ncadbook_user;
```

### Issue: "JWT_SECRET" not found

**Solution:**
- Create `backend/.env` from `backend/.env.example`
- Add a `JWT_SECRET` value (any random string for dev)

### Issue: Tests failing

**Solution:**
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Update browsers
npx playwright install --with-deps

# Run tests with UI for debugging
npm run test:e2e:ui
```

---

## Recent Changes (Last 2 Days)

### Major Updates:

1. **Frontend API Integration Complete (Oct 7, 2025)**
   - Replaced all demoMode calls with backend APIs
   - Updated service layer to use REST endpoints
   - Added strike management endpoints

2. **SubArea → Department Refactoring (60% Complete)**
   - Service layer renamed and updated
   - Core components refactored
   - See `REFACTORING_SUBAREA_TO_DEPARTMENT.md` for details

3. **Backend Priority Features Complete**
   - All 4 priority phases implemented
   - 50+ API endpoints
   - Full CRUD for users, equipment, bookings, departments
   - Analytics with CSV/PDF export
   - CSV import functionality

### Files to Pay Attention To:

- `REFACTORING_SUBAREA_TO_DEPARTMENT.md` - Active refactoring progress
- `API_INTEGRATION_COMPLETE.md` - Backend API documentation
- `FRONTEND_INTEGRATION_PLAN.md` - Frontend integration status
- `backend/src/server.js` - All API routes registered here
- `src/utils/api.js` - Frontend API client

### Known Issues:

1. 4 admin components still need variable renaming (see refactoring doc)
2. Demo-data files still reference old table names (non-breaking)
3. Some advanced features still use demoMode (interdisciplinary access, etc.)

---

## Additional Resources

### Documentation:
- `docs/guides/QUICK_START.md` - Quick start guide
- `docs/backend/BACKEND_SETUP_COMPLETE.md` - Backend architecture
- `CLAUDE.md` - Claude Code configuration
- `ProjectMemory.md` - Development history

### Testing:
- `tests/integration/` - Integration tests
- `playwright.config.js` - Test configuration

### Database:
- `backend/src/database/schema.sql` - Full database schema
- `backend/src/config/seedDatabase.js` - Seed script

---

## Post-Setup Checklist

After completing setup, verify:

- [ ] Node.js and npm versions correct
- [ ] PostgreSQL installed and running
- [ ] Database created and seeded
- [ ] Backend starts without errors (http://localhost:3001/health returns OK)
- [ ] Frontend starts without errors (http://localhost:5175/NCADbook/ loads)
- [ ] Can login with demo credentials
- [ ] API calls work (check browser Network tab)
- [ ] No console errors in browser
- [ ] Can browse equipment as student
- [ ] Can access admin portal as admin

---

## Next Steps After Setup

1. **Read the documentation:**
   - `CLAUDE.md` - Project overview
   - `REFACTORING_SUBAREA_TO_DEPARTMENT.md` - Current refactoring status

2. **Familiarize with codebase:**
   - `src/services/` - Frontend service layer
   - `backend/src/routes/` - API endpoints
   - `src/portals/` - User interfaces

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Make a test commit:**
   ```bash
   git add .
   git commit -m "chore: Initial setup on new PC"
   git push
   ```

---

## Support

If you encounter issues not covered here:

1. Check `docs/guides/` for additional documentation
2. Review `ProjectMemory.md` for context on decisions
3. Check GitHub issues/discussions
4. Review recent commit messages for context

---

**Setup complete!** 🎉

Access your application at: **http://localhost:5175/NCADbook/**

Happy coding! 🚀
