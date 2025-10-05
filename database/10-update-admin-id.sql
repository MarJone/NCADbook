-- ============================================================================
-- UPDATE ADMIN USER ID TO MATCH AUTH.USERS
-- ============================================================================

-- Update the public.users table to use the correct UUID from auth.users
UPDATE public.users
SET id = '828f12ca-0299-4869-b8db-004dfef1332b'::uuid
WHERE email = 'admin@ncad.ie';

-- Verify the update
SELECT
  id,
  email,
  role,
  full_name,
  'Updated successfully!' as status
FROM public.users
WHERE email = 'admin@ncad.ie';

-- Verify both tables now have matching IDs
SELECT
  'Match check:' as check_type,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM auth.users au
      JOIN public.users pu ON au.id = pu.id
      WHERE au.email = 'admin@ncad.ie'
    ) THEN '✅ IDs match! Login should work now.'
    ELSE '❌ IDs still do not match'
  END as result;
