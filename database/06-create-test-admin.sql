-- ============================================================================
-- CREATE TEST MASTER ADMIN USER
-- ============================================================================
-- This creates a test master admin account for development/testing
-- Replace the email/password with your own credentials

-- First, you need to create the user in Supabase Authentication:
-- 1. Go to Authentication → Users in Supabase Dashboard
-- 2. Click "Add User" → Create new user
-- 3. Email: admin@ncad.ie (or your email)
-- 4. Password: (set a secure password)
-- 5. Auto-confirm user: YES
-- 6. Copy the User ID that gets generated

-- Then run this SQL with the User ID:
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from Supabase Auth

INSERT INTO users (
  id,
  email,
  first_name,
  surname,
  full_name,
  department,
  role,
  admin_permissions
) VALUES (
  'c101924b-6fcc-402e-95ff-bfcc7d9ba8dc'::UUID,  -- Replace with actual User ID from Supabase Auth
  'admin@ncad.ie',              -- Replace with your email
  'Master',
  'Admin',
  'Master Admin',
  'ADMINISTRATION',
  'master_admin',
  '{"can_manage_users": true, "can_manage_equipment": true, "can_approve_bookings": true, "can_view_costs": true, "can_export_data": true}'::JSONB
)
ON CONFLICT (id) DO UPDATE
SET
  role = 'master_admin',
  admin_permissions = EXCLUDED.admin_permissions;

-- Verify the user was created
SELECT id, email, full_name, role
FROM users
WHERE role = 'master_admin';
