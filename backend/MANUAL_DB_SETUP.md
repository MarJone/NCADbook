# Manual PostgreSQL Database Setup

Since PostgreSQL requires password authentication, you'll need to complete these steps manually:

## Option 1: Using pgAdmin (Easiest - GUI)

1. **Open pgAdmin** (should be installed with PostgreSQL)
   - Look for "pgAdmin 4" in your Start menu

2. **Connect to PostgreSQL**
   - Enter your postgres password when prompted

3. **Create Database**
   - Right-click "Databases" → "Create" → "Database"
   - Name: `ncadbook_db`
   - Owner: `postgres` (for now)
   - Click "Save"

4. **Create User**
   - Right-click "Login/Group Roles" → "Create" → "Login/Group Role"
   - General tab → Name: `ncadbook_user`
   - Definition tab → Password: `ncad2024secure`
   - Privileges tab → Check: "Can login?"
   - Click "Save"

5. **Grant Permissions**
   - Right-click on `ncadbook_db` → "Properties"
   - Go to "Security" tab
   - Click "+" to add privileges
   - Select `ncadbook_user`
   - Grant all privileges
   - Click "Save"

## Option 2: Using Command Line (SQL Shell)

1. **Open SQL Shell (psql)**
   - Look for "SQL Shell (psql)" in your Start menu
   - Press Enter to accept defaults (server, database, port, username)
   - Enter your postgres password

2. **Run these commands:**
   ```sql
   -- Create database
   CREATE DATABASE ncadbook_db;

   -- Create user
   CREATE USER ncadbook_user WITH PASSWORD 'ncad2024secure';

   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE ncadbook_db TO ncadbook_user;

   -- Connect to new database
   \c ncadbook_db

   -- Grant schema privileges (PostgreSQL 15+ requirement)
   GRANT ALL ON SCHEMA public TO ncadbook_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ncadbook_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ncadbook_user;

   -- Verify setup
   \l ncadbook_db
   \du ncadbook_user
   ```

3. **Exit psql**
   ```
   \q
   ```

## After Manual Setup

Once you've completed either option above, run this command to create the tables:

```bash
cd backend
npm run db:setup
```

Expected output:
```
🚀 Starting database setup...
📝 Creating users table...
✅ Users table created
📝 Creating sub_areas table...
✅ Sub areas table created
... (continues for all 9 tables)
🎉 Database setup completed successfully!
```

## Troubleshooting

**If you get "password authentication failed":**
- Double-check the password in `backend/.env` matches what you set: `ncad2024secure`
- Verify the user was created successfully in pgAdmin or psql

**If you get "database does not exist":**
- Make sure you created `ncadbook_db` (exact spelling)
- Refresh pgAdmin if using GUI

**If you get "permission denied":**
- Make sure you granted ALL privileges to `ncadbook_user` on the database
- Re-run the GRANT commands in psql

## Quick Verification

To verify everything is set up correctly:

```bash
cd backend
node -e "import('./src/config/database.js').then(db => db.query('SELECT NOW()')).then(() => console.log('✅ Database connection successful!')).catch(err => console.error('❌ Connection failed:', err.message))"
```
