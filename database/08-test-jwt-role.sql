-- ============================================================================
-- TEST JWT ROLE CLAIM
-- ============================================================================
-- Run this while logged in to check if the role claim is in your JWT

-- Check your current JWT claims
SELECT
  auth.uid() as user_id,
  auth.jwt() ->> 'role' as role_from_jwt,
  auth.jwt() as full_jwt;

-- Check users table
SELECT id, email, role, full_name
FROM users
WHERE id = auth.uid();

-- Test if master admin policy would work
SELECT
  CASE
    WHEN (auth.jwt() ->> 'role')::text = 'master_admin' THEN 'JWT role claim is master_admin ✅'
    WHEN auth.jwt() ->> 'role' IS NULL THEN 'JWT role claim is NULL ❌ - Hook not working'
    ELSE 'JWT role claim is: ' || (auth.jwt() ->> 'role')::text || ' ❌'
  END as jwt_test;

-- Try to select from system_feature_flags
SELECT COUNT(*) as feature_flag_count
FROM system_feature_flags;
