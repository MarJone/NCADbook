-- ============================================================================
-- VERIFY AND FIX ADMIN USER SETUP
-- ============================================================================

-- Check if user exists in public.users table
SELECT
  'public.users table:' as check_type,
  id,
  email,
  role,
  full_name
FROM public.users
WHERE email = 'admin@ncad.ie';

-- Check if user exists in auth.users table
SELECT
  'auth.users table:' as check_type,
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@ncad.ie';

-- If the user doesn't exist in auth.users, we need to create them there first
-- You MUST do this in the Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add User"
-- 3. Email: admin@ncad.ie
-- 4. Password: SUPdawarko!0!
-- 5. ✅ Auto Confirm User (IMPORTANT!)
-- 6. Click "Create user"
-- 7. Copy the User ID

-- After creating in Dashboard, update public.users with the correct ID
-- UPDATE public.users
-- SET id = 'PASTE_USER_ID_FROM_DASHBOARD_HERE'::uuid
-- WHERE email = 'admin@ncad.ie';
