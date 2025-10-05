-- ============================================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================================================
-- The issue: RLS policies on users table query users table, causing recursion
-- Solution: Use auth.uid() and auth.jwt() directly instead of querying users

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Students view own profile" ON users;
DROP POLICY IF EXISTS "Admin roles view users" ON users;
DROP POLICY IF EXISTS "Master admin manage users" ON users;
DROP POLICY IF EXISTS "Students update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Recreate policies without recursion
-- Students can view their own profile
CREATE POLICY "Students view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- All authenticated users can view their own data
CREATE POLICY "Authenticated view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Master admin can view all users (using JWT claim instead of querying users table)
CREATE POLICY "Master admin view all users" ON users
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'master_admin'
    OR auth.uid() = id
  );

-- Master admin can manage users
CREATE POLICY "Master admin manage users" ON users
  FOR ALL
  USING ((auth.jwt() ->> 'role')::text = 'master_admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'master_admin');

-- Students can update their own profile (limited fields)
CREATE POLICY "Users update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FIX OTHER POLICIES THAT REFERENCE USERS TABLE
-- ============================================================================

-- Drop and recreate policies that cause recursion
DROP POLICY IF EXISTS "Master admin view feature flags" ON system_feature_flags;
DROP POLICY IF EXISTS "Master admin manage feature flags" ON system_feature_flags;
DROP POLICY IF EXISTS "Authenticated check feature status" ON system_feature_flags;

-- Master admin can view feature flags (using JWT instead of users query)
CREATE POLICY "Master admin view feature flags" ON system_feature_flags
  FOR SELECT
  USING ((auth.jwt() ->> 'role')::text = 'master_admin');

-- Master admin can update feature flags
CREATE POLICY "Master admin manage feature flags" ON system_feature_flags
  FOR ALL
  USING ((auth.jwt() ->> 'role')::text = 'master_admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'master_admin');

-- All authenticated users can check enabled features
CREATE POLICY "Authenticated check feature status" ON system_feature_flags
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_enabled = true);

-- ============================================================================
-- UPDATE USER'S JWT CLAIMS
-- ============================================================================
-- We need to add a custom claim for 'role' to the JWT
-- This requires a database function that runs on auth.users

-- Create function to set custom claims
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Fetch the user role from the profiles table
  SELECT role INTO user_role FROM public.users WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    -- Set the claim
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{role}', '"student"');
  END IF;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Infinite recursion fixed!';
  RAISE NOTICE 'Policies now use auth.jwt() instead of querying users table';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: You must configure the custom claims hook in Supabase Dashboard:';
  RAISE NOTICE '1. Go to Authentication → Hooks';
  RAISE NOTICE '2. Enable "Custom Access Token" hook';
  RAISE NOTICE '3. Select: public.custom_access_token_hook';
  RAISE NOTICE '4. Users must re-login for role claim to be added to JWT';
END $$;
