-- ============================================================================
-- DISABLE EMAIL CONFIRMATION REQUIREMENT (Development Only)
-- ============================================================================
-- This allows login without email confirmation for development
-- DO NOT use this in production!

-- Check current user status
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  'User found in auth.users' as status
FROM auth.users
WHERE email = 'admin@ncad.ie';

-- Force confirm the user's email
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'admin@ncad.ie'
AND email_confirmed_at IS NULL;

-- Verify the update
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmed - login should work'
    ELSE '❌ Email still not confirmed'
  END as confirmation_status
FROM auth.users
WHERE email = 'admin@ncad.ie';
