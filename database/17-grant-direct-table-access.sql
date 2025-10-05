-- ============================================================================
-- GRANT DIRECT TABLE ACCESS (DEVELOPMENT WORKAROUND)
-- ============================================================================

-- Check current grants on users table
SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'users';

-- Grant full access to authenticated role (bypassing RLS temporarily)
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify grants
SELECT
  'Grants verification:' as check_type,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants
WHERE table_name = 'users'
  AND grantee IN ('anon', 'authenticated')
GROUP BY grantee;

-- Also check if RLS is actually disabled
SELECT
  'RLS status:' as check_type,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users';
