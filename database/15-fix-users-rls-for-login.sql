-- ============================================================================
-- FIX USERS TABLE RLS TO ALLOW LOGIN
-- ============================================================================
-- The issue: After auth succeeds, we need to read users table to get profile
-- But RLS blocks it because JWT doesn't have role claim yet
-- Solution: Allow authenticated users to read their own profile by ID

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Students view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated view own profile" ON users;
DROP POLICY IF EXISTS "Master admin view all users" ON users;

-- Policy 1: Any authenticated user can view their own profile by auth.uid()
CREATE POLICY "Authenticated users view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users with master_admin role claim can view all users
CREATE POLICY "Master admin view all users" ON users
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'master_admin'
  );

-- Policy 3: Master admin can manage all users
CREATE POLICY "Master admin manage all users" ON users
  FOR ALL
  USING ((auth.jwt() ->> 'role')::text = 'master_admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'master_admin');

-- Test the policy
SELECT
  'Policy test - run this while logged in:' as info,
  id,
  email,
  role,
  'Should be visible after login' as status
FROM users
WHERE id = auth.uid();
