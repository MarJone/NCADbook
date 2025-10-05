-- ============================================================================
-- CONFIRM USER EMAIL (Development Only)
-- ============================================================================

-- Check current user status
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  'User found in auth.users' as status
FROM auth.users
WHERE email = 'admin@ncad.ie';

-- Force confirm the user's email (only update email_confirmed_at)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@ncad.ie'
AND email_confirmed_at IS NULL;

-- Verify the update
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed - login should work now!'
    ELSE '❌ Email still not confirmed'
  END as confirmation_status
FROM auth.users
WHERE email = 'admin@ncad.ie';
