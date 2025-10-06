-- Connect to ncadbook_db first!
-- Run this in pgAdmin Query Tool for ncadbook_db database

-- Grant all permissions on schema public to ncadbook_user
GRANT ALL ON SCHEMA public TO ncadbook_user;

-- Grant all permissions on existing tables (if any)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ncadbook_user;

-- Grant all permissions on existing sequences (if any)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ncadbook_user;

-- Set default privileges for future objects created by postgres user
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO ncadbook_user;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO ncadbook_user;

-- Set default privileges for future objects created by ncadbook_user
ALTER DEFAULT PRIVILEGES FOR ROLE ncadbook_user IN SCHEMA public GRANT ALL ON TABLES TO ncadbook_user;
ALTER DEFAULT PRIVILEGES FOR ROLE ncadbook_user IN SCHEMA public GRANT ALL ON SEQUENCES TO ncadbook_user;

-- Verify permissions (should show ncadbook_user with CREATE, USAGE permissions)
SELECT nspname as schema_name,
       nspacl as permissions
FROM pg_namespace
WHERE nspname = 'public';
