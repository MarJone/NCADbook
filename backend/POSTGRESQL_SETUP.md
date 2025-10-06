# PostgreSQL Setup Guide for NCADbook Backend

## Windows Installation

### Step 1: Download PostgreSQL

1. Go to https://www.postgresql.org/download/windows/
2. Download the PostgreSQL 16.x installer (latest stable version)
3. Run the installer

### Step 2: Installation Options

During installation:
- **Port**: Use default `5432`
- **Password**: Set a secure password for the `postgres` superuser (remember this!)
- **Locale**: Default is fine
- **Components**: Install PostgreSQL Server, pgAdmin 4, Command Line Tools

### Step 3: Verify Installation

Open PowerShell or Command Prompt:

```powershell
# Check PostgreSQL version
psql --version

# Should output something like: psql (PostgreSQL) 16.x
```

### Step 4: Create Database and User

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to the local PostgreSQL server using the password you set
3. Or use Command Line:

```powershell
# Connect as postgres superuser
psql -U postgres

# Inside psql, run these commands:
CREATE DATABASE ncadbook_db;
CREATE USER ncadbook_user WITH PASSWORD 'ncad2024secure';
GRANT ALL PRIVILEGES ON DATABASE ncadbook_db TO ncadbook_user;

# Exit psql
\q
```

### Step 5: Update Backend .env File

Your `backend/.env` file should have:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncadbook_db
DB_USER=ncadbook_user
DB_PASSWORD=ncad2024secure
```

---

## Quick Start (After PostgreSQL is Installed)

### 1. Set up database tables:

```bash
cd backend
npm run db:setup
```

This will create all tables, indexes, and triggers.

### 2. Start the backend server:

```bash
npm run dev
```

The server will start on http://localhost:3001

### 3. Test the server:

Open browser or use curl:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-10-06T...",
  "uptime": 1.23,
  "environment": "development"
}
```

---

## CSV Import Endpoints

### Download Templates

```bash
# Users template
curl http://localhost:3001/api/csv/template/users --output users_template.csv

# Equipment template
curl http://localhost:3001/api/csv/template/equipment --output equipment_template.csv
```

### Import Users

```bash
curl -X POST http://localhost:3001/api/csv/import/users \
  -F "file=@users.csv"
```

### Import Equipment

```bash
curl -X POST http://localhost:3001/api/csv/import/equipment \
  -F "file=@equipment.csv"
```

### Preview CSV Before Import

```bash
curl -X POST "http://localhost:3001/api/csv/preview?type=users" \
  -F "file=@users.csv"
```

---

## Testing CSV Import via Postman

1. **Download CSV Templates**:
   - GET `http://localhost:3001/api/csv/template/users`
   - GET `http://localhost:3001/api/csv/template/equipment`

2. **Fill in CSV files** with your data (Excel or text editor)

3. **Preview Import** (optional):
   - POST `http://localhost:3001/api/csv/preview?type=users`
   - Body: form-data, key: `file`, value: select your CSV file

4. **Import Data**:
   - POST `http://localhost:3001/api/csv/import/users`
   - Body: form-data, key: `file`, value: select your CSV file

---

## Troubleshooting

### PostgreSQL not starting?

**Windows Services**:
1. Press `Win + R`, type `services.msc`
2. Find "postgresql-x64-16"
3. Right-click → Start

### Connection refused?

Check `.env` file matches your PostgreSQL settings:
- Correct port (default 5432)
- Correct password
- Database exists

### Table creation errors?

Make sure the database user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE ncadbook_db TO ncadbook_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ncadbook_user;
```

---

## What's Next?

Once PostgreSQL is set up and backend is running:

1. **Test CSV import** with template files
2. **Build auth endpoints** (login/register)
3. **Build equipment CRUD** endpoints
4. **Build booking endpoints**
5. **Update frontend** to call backend API instead of localStorage

The foundation is ready - let's build! 🚀
