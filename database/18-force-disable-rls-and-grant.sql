-- ============================================================================
-- FORCE DISABLE RLS AND GRANT ALL PERMISSIONS (DEVELOPMENT MODE)
-- ============================================================================

-- Step 1: Drop ALL existing policies on users table
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Step 2: Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Grant ALL privileges to both roles
GRANT ALL PRIVILEGES ON public.users TO anon;
GRANT ALL PRIVILEGES ON public.users TO authenticated;
GRANT ALL PRIVILEGES ON public.users TO postgres;

-- Step 4: Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 5: Grant sequence access (for auto-increment IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check 1: Verify RLS is disabled
SELECT
  'RLS Status' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN '❌ ENABLED (BAD)' ELSE '✅ DISABLED (GOOD)' END as status
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';

-- Check 2: Verify grants
SELECT
  'Grants Check' as check_type,
  grantee,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants
WHERE table_name = 'users' AND table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'postgres')
GROUP BY grantee
ORDER BY grantee;

-- Check 3: Count policies (should be 0)
SELECT
  'Policy Count' as check_type,
  COUNT(*) as policy_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ No policies (GOOD)' ELSE '❌ Policies exist (BAD)' END as status
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';

-- Check 4: Test query as anon role
SET ROLE anon;
SELECT 'Anon Role Test' as check_type, COUNT(*) as user_count FROM public.users;
RESET ROLE;

-- Check 5: Test query as authenticated role
SET ROLE authenticated;
SELECT 'Authenticated Role Test' as check_type, COUNT(*) as user_count FROM public.users;
RESET ROLE;
