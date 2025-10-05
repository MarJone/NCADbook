-- ============================================================================
-- CREATE ADMIN USER IN PUBLIC.USERS TABLE
-- ============================================================================

-- First, check what exists
SELECT 'Current users in public.users:' as info;
SELECT id, email, role FROM public.users;

SELECT 'Users in auth.users:' as info;
SELECT id, email FROM auth.users WHERE email = 'admin@ncad.ie';

-- Delete any existing admin@ncad.ie entry (might have wrong ID)
DELETE FROM public.users WHERE email = 'admin@ncad.ie';

-- Insert the admin user with the correct ID from auth.users
INSERT INTO public.users (
  id,
  email,
  first_name,
  surname,
  full_name,
  department,
  role,
  admin_permissions
) VALUES (
  '828f12ca-0299-4869-b8db-004dfef1332b'::UUID,
  'admin@ncad.ie',
  'Master',
  'Admin',
  'Master Admin',
  'ADMINISTRATION',
  'master_admin',
  '{"can_manage_users": true, "can_manage_equipment": true, "can_approve_bookings": true, "can_view_costs": true, "can_export_data": true}'::JSONB
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  admin_permissions = EXCLUDED.admin_permissions;

-- Verify it worked
SELECT
  'Verification:' as check_type,
  id,
  email,
  role,
  full_name
FROM public.users
WHERE id = '828f12ca-0299-4869-b8db-004dfef1332b'::UUID;

-- Final check - IDs should match now
SELECT
  'Final Match check:' as check_type,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM auth.users au
      JOIN public.users pu ON au.id = pu.id
      WHERE au.email = 'admin@ncad.ie'
    ) THEN '✅ IDs match! Login should work now.'
    ELSE '❌ IDs still do not match'
  END as result;
