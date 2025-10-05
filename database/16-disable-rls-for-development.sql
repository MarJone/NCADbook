-- ============================================================================
-- DISABLE RLS ON USERS TABLE (TEMPORARY - DEVELOPMENT ONLY)
-- ============================================================================
-- This allows login to work while we debug the RLS policies
-- WARNING: Re-enable RLS before production!

-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity = false THEN '✅ RLS disabled - login should work now'
    ELSE '⚠️ RLS still enabled'
  END as status
FROM pg_tables
WHERE tablename = 'users';

-- Note: You can re-enable RLS later with:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
