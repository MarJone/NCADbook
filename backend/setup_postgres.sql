-- Create database
CREATE DATABASE ncadbook_db;

-- Create user with password
CREATE USER ncadbook_user WITH PASSWORD 'ncad2024secure';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ncadbook_db TO ncadbook_user;

-- Connect to the database
\c ncadbook_db

-- Grant schema privileges (PostgreSQL 15+ requirement)
GRANT ALL ON SCHEMA public TO ncadbook_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ncadbook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ncadbook_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ncadbook_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ncadbook_user;
