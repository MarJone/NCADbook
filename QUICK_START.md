# NCADbook Quick Start Guide

## Current Project Status

✅ **Completed:**
- Frontend demo with 4 portals (Student, Staff, Dept Admin, Master Admin)
- PostgreSQL database setup with 9 tables
- Backend Express server with CSV import system
- Direct login system (no password required for demo)

## Starting the Project

### 1. Start PostgreSQL

PostgreSQL should start automatically on Windows. Verify it's running:

```bash
# Check if PostgreSQL service is running
sc query postgresql-x64-18
```

If not running, start it:
```bash
# Start PostgreSQL service
net start postgresql-x64-18
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 NCADbook Backend Server
📍 Environment: development
🌐 Server running on: http://localhost:3001
✅ Health check: http://localhost:3001/health
```

**Backend is ready when you see:** `⏳ Waiting for requests...`

### 3. Start Frontend Development Server

Open a **new terminal** and run:

```bash
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/NCADbook/
```

**Frontend is ready when you see the Local URL**

### 4. Access the Application

**Local Demo:** http://localhost:5173/NCADbook/

**Login Options (click any quadrant - no password needed):**
- **Student Portal** - Browse equipment, create bookings
- **Staff Portal** - Approve bookings, view reports
- **Department Admin** - Manage department equipment and bookings
- **Master Admin** - Full system control, CSV imports, analytics

## Quick Tests

### Test Backend Health
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"OK","timestamp":"...","uptime":...,"environment":"development"}
```

### Test Database Connection
```bash
cd backend
node -e "import('./src/config/database.js').then(db => db.query('SELECT NOW()')).then(() => console.log('✅ Database connected!')).catch(err => console.error('❌ Error:', err.message))"
```

Should return: `✅ Database connected!`

### Test Frontend
1. Open http://localhost:5173/NCADbook/
2. Click "Master Admin" quadrant
3. Should redirect to Master Admin dashboard
4. Check "Department Management" to see 10 NCAD departments

## Database Information

**Connection Details:**
- **Host:** localhost
- **Port:** 5432
- **Database:** ncadbook_db
- **User:** ncadbook_user
- **Password:** ncad2024secure

**Access via pgAdmin:**
1. Open pgAdmin 4
2. Expand "Servers" → "PostgreSQL 18"
3. Expand "Databases" → "ncadbook_db"
4. Right-click "ncadbook_db" → "Query Tool" to run SQL

**Tables Created:**
1. `users` - Student and admin accounts
2. `sub_areas` - Departments (10 NCAD departments)
3. `equipment` - Equipment catalog (200+ items)
4. `equipment_notes` - Admin notes (maintenance, damage, usage)
5. `bookings` - Equipment reservations
6. `equipment_kits` - Equipment bundles
7. `system_settings` - Feature flags
8. `admin_actions` - Audit trail
9. `strike_history` - Student strike tracking

## Troubleshooting

### Backend won't start - "Database connection failed"

**Problem:** PostgreSQL service not running

**Fix:**
```bash
net start postgresql-x64-18
```

### Backend won't start - "Password authentication failed"

**Problem:** Database credentials incorrect

**Fix:** Check `backend/.env` file has:
```
DB_USER=ncadbook_user
DB_PASSWORD=ncad2024secure
DB_NAME=ncadbook_db
```

### Frontend won't start - "Port 5173 already in use"

**Problem:** Previous dev server still running

**Fix:**
```bash
# Kill the process on port 5173
npx kill-port 5173
# Or find and kill manually
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

### "Permission denied for schema public"

**Problem:** Database user lacks permissions

**Fix:** Run in pgAdmin Query Tool (connected to `ncadbook_db`):
```sql
GRANT ALL ON SCHEMA public TO ncadbook_user;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO ncadbook_user;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO ncadbook_user;
```

### Login links not working

**Problem:** Old localStorage data

**Fix:**
1. Open browser DevTools (F12)
2. Go to Application tab → Local Storage
3. Find `ncadbook_demo_data`
4. Click "Clear All"
5. Reload page

### Departments not showing in Master Admin

**Problem:** Demo data not initialized

**Fix:**
1. Go to Master Admin → Department Management
2. Click "🔄 Reset Demo Data" button
3. Page will reload with fresh data

### Backend port 3001 already in use

**Problem:** Previous backend still running

**Fix:**
```bash
npx kill-port 3001
# Or manually
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

## Next Development Steps

### 1. Seed Demo Data
Create sample users and equipment for testing:
```bash
cd backend
npm run db:seed
```

### 2. Test CSV Import
- Navigate to Master Admin → CSV Import (when built)
- Download template: http://localhost:3001/api/csv/template/users
- Fill with test data
- Import via frontend

### 3. Build Authentication Endpoints
- Register endpoint: `POST /api/auth/register`
- Login endpoint: `POST /api/auth/login`
- Token verification middleware

### 4. Build Equipment CRUD Endpoints
- List equipment: `GET /api/equipment`
- Get by ID: `GET /api/equipment/:id`
- Create: `POST /api/equipment`
- Update: `PUT /api/equipment/:id`
- Delete: `DELETE /api/equipment/:id`

### 5. Connect Frontend to Backend
Replace `src/utils/demoMode.js` with API calls to backend

## Useful Commands

### Database Management
```bash
# Reset database (deletes all data!)
cd backend
npm run db:reset

# Re-run database setup
npm run db:setup

# Seed with demo data
npm run db:seed
```

### Development
```bash
# Start backend in dev mode (auto-restart on changes)
cd backend
npm run dev

# Start frontend in dev mode
npm run dev

# Run both simultaneously (requires 2 terminals)
```

### Production
```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview

# Start backend in production mode
cd backend
npm start
```

## Project Structure Reference

```
NCADbook/
├── backend/                      # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # PostgreSQL connection
│   │   │   └── setupDatabase.js  # Table creation
│   │   ├── controllers/
│   │   │   └── csvImportController.js  # CSV import logic
│   │   ├── routes/
│   │   │   ├── csvRoutes.js      # CSV import endpoints
│   │   │   └── ...Routes.js      # Other route files
│   │   └── server.js             # Express app entry point
│   ├── uploads/                  # Uploaded files
│   │   ├── csv/                  # CSV imports
│   │   └── equipment/            # Equipment images
│   ├── .env                      # Environment variables
│   └── package.json              # Backend dependencies
│
├── src/                          # Frontend source
│   ├── components/
│   │   └── common/Login.jsx      # Login page with 4 portals
│   ├── portals/
│   │   ├── student/              # Student portal views
│   │   ├── staff/                # Staff portal views
│   │   └── admin/                # Admin portal views
│   ├── styles/                   # CSS files
│   ├── utils/
│   │   └── demoMode.js           # Demo data (to be replaced with API)
│   └── main.jsx                  # React entry point
│
├── public/                       # Static assets
│   └── images/                   # Images
│
├── docs/                         # Documentation
│   ├── agents/                   # Feature specifications
│   └── guides/                   # Setup guides
│
└── package.json                  # Frontend dependencies
```

## Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncadbook_db
DB_USER=ncadbook_user
DB_PASSWORD=ncad2024secure

# JWT (for production auth)
JWT_SECRET=ncadbook_jwt_secret_development_only_change_in_production_2024
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:5175

# Uploads
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads/equipment
```

## Key Endpoints

### Backend API
- **Health Check:** http://localhost:3001/health
- **CSV Import (Users):** POST http://localhost:3001/api/csv/import/users
- **CSV Import (Equipment):** POST http://localhost:3001/api/csv/import/equipment
- **CSV Preview:** POST http://localhost:3001/api/csv/preview
- **CSV Template:** GET http://localhost:3001/api/csv/template/:type

### Frontend
- **Local Dev:** http://localhost:5173/NCADbook/
- **GitHub Pages:** https://marjone.github.io/NCADbook/

## Quick Reference - Common Tasks

### Reset Everything (Fresh Start)
```bash
# 1. Stop all servers (Ctrl+C in terminals)

# 2. Reset database
cd backend
npm run db:reset
npm run db:setup

# 3. Clear browser localStorage
# Open DevTools → Application → Local Storage → Clear All

# 4. Restart servers
cd backend
npm run dev
# In new terminal:
npm run dev
```

### Check What's Running
```bash
# Check all ports
netstat -ano | findstr "5173 3001 5432"

# Check PostgreSQL
sc query postgresql-x64-18

# Check Node processes
tasklist | findstr node
```

### Update After Git Pull
```bash
# Update frontend dependencies
npm install

# Update backend dependencies
cd backend
npm install

# Restart servers
```

## Support

**Documentation:**
- Main guide: [CLAUDE.md](CLAUDE.md)
- Database setup: [backend/POSTGRESQL_SETUP.md](backend/POSTGRESQL_SETUP.md)
- Backend setup: [backend/BACKEND_SETUP_COMPLETE.md](backend/BACKEND_SETUP_COMPLETE.md)

**Common Issues:**
- Check [MANUAL_DB_SETUP.md](backend/MANUAL_DB_SETUP.md) for database permissions
- Check [grant_permissions.sql](backend/grant_permissions.sql) for SQL fixes

---

## At-a-Glance Startup (TL;DR)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev

# Open browser
http://localhost:5173/NCADbook/
```

**That's it!** 🚀

---

**Last Updated:** 2025-10-06
**PostgreSQL Version:** 18.0
**Node Version:** (check with `node --version`)
**Frontend:** React 18 + Vite
**Backend:** Express.js + PostgreSQL
