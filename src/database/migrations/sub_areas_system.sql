-- ========================================
-- SUB-AREA SYSTEM MIGRATION
-- ========================================
-- Purpose: Implement comprehensive sub-area/department system
-- for equipment organization and interdisciplinary access control
-- Date: 2025-10-02
-- ========================================

-- ========================================
-- 1. SUB-AREAS TABLE
-- ========================================
-- Represents individual sub-areas/departments (e.g., ComDes, Fine Art Media, Sculpture)
CREATE TABLE IF NOT EXISTS sub_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_department TEXT, -- e.g., "School of Design", "School of Fine Art"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sub_areas_name ON sub_areas(name);
CREATE INDEX IF NOT EXISTS idx_sub_areas_parent ON sub_areas(parent_department);

-- ========================================
-- 2. AREA ADMINS TABLE
-- ========================================
-- Links users to sub-areas they can administer
CREATE TABLE IF NOT EXISTS area_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sub_area_id UUID REFERENCES sub_areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sub_area_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_area_admins_user ON area_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_area_admins_sub_area ON area_admins(sub_area_id);

-- ========================================
-- 3. USER SUB-AREA ASSIGNMENTS
-- ========================================
-- Links students to their sub-areas (multiple assignments allowed)
CREATE TABLE IF NOT EXISTS user_sub_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sub_area_id UUID REFERENCES sub_areas(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  UNIQUE(user_id, sub_area_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sub_areas_user ON user_sub_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sub_areas_sub_area ON user_sub_areas(sub_area_id);

-- ========================================
-- 4. EQUIPMENT SUB-AREA ASSIGNMENT
-- ========================================
-- Add sub_area_id column to equipment table
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS sub_area_id UUID REFERENCES sub_areas(id);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_equipment_sub_area ON equipment(sub_area_id);

-- ========================================
-- 5. INTERDISCIPLINARY ACCESS TABLE
-- ========================================
-- Grants access from one sub-area to another's equipment
CREATE TABLE IF NOT EXISTS interdisciplinary_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_sub_area_id UUID REFERENCES sub_areas(id) ON DELETE CASCADE,
  to_sub_area_id UUID REFERENCES sub_areas(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(from_sub_area_id, to_sub_area_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_interdisciplinary_from ON interdisciplinary_access(from_sub_area_id);
CREATE INDEX IF NOT EXISTS idx_interdisciplinary_to ON interdisciplinary_access(to_sub_area_id);
CREATE INDEX IF NOT EXISTS idx_interdisciplinary_active ON interdisciplinary_access(is_active);

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all new tables
ALTER TABLE sub_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sub_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE interdisciplinary_access ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- SUB-AREAS POLICIES
-- ----------------------------------------

-- Everyone can view sub-areas (needed for dropdowns/filtering)
CREATE POLICY sub_areas_view_all ON sub_areas
FOR SELECT
TO authenticated
USING (true);

-- Only master admins can insert/update/delete sub-areas
CREATE POLICY sub_areas_master_admin_manage ON sub_areas
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
);

-- ----------------------------------------
-- AREA ADMINS POLICIES
-- ----------------------------------------

-- Area admins and master admins can view area admin assignments
CREATE POLICY area_admins_view ON area_admins
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM area_admins)
  OR
  (SELECT role FROM users WHERE id = auth.uid()) IN ('master_admin', 'admin')
);

-- Only master admins can manage area admin assignments
CREATE POLICY area_admins_master_admin_manage ON area_admins
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
);

-- ----------------------------------------
-- USER SUB-AREA ASSIGNMENTS POLICIES
-- ----------------------------------------

-- Students can view their own sub-area assignments
-- Admins can view all assignments
CREATE POLICY user_sub_areas_view ON user_sub_areas
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'master_admin')
  OR
  auth.uid() IN (SELECT user_id FROM area_admins)
);

-- Area admins and master admins can manage assignments for their areas
CREATE POLICY user_sub_areas_manage ON user_sub_areas
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
  OR
  (auth.uid() IN (SELECT user_id FROM area_admins WHERE sub_area_id = user_sub_areas.sub_area_id))
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
  OR
  (auth.uid() IN (SELECT user_id FROM area_admins WHERE sub_area_id = user_sub_areas.sub_area_id))
);

-- ----------------------------------------
-- INTERDISCIPLINARY ACCESS POLICIES
-- ----------------------------------------

-- Everyone can view active interdisciplinary access grants (needed for equipment visibility)
CREATE POLICY interdisciplinary_access_view ON interdisciplinary_access
FOR SELECT
TO authenticated
USING (true);

-- Area admins can manage interdisciplinary access for their areas
-- Master admins can manage all
CREATE POLICY interdisciplinary_access_manage ON interdisciplinary_access
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
  OR
  (auth.uid() IN (
    SELECT user_id FROM area_admins
    WHERE sub_area_id = interdisciplinary_access.from_sub_area_id
  ))
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'master_admin'
  OR
  (auth.uid() IN (
    SELECT user_id FROM area_admins
    WHERE sub_area_id = interdisciplinary_access.from_sub_area_id
  ))
);

-- ----------------------------------------
-- EQUIPMENT POLICIES (Updated for Sub-Areas)
-- ----------------------------------------

-- Drop existing equipment policies if they exist
DROP POLICY IF EXISTS equipment_student_access ON equipment;
DROP POLICY IF EXISTS equipment_area_admin_access ON equipment;
DROP POLICY IF EXISTS equipment_master_admin_access ON equipment;

-- Students can only see equipment from their sub-areas OR equipment with interdisciplinary access
CREATE POLICY equipment_student_access ON equipment
FOR SELECT
TO authenticated
USING (
  -- Equipment from student's own sub-areas
  sub_area_id IN (
    SELECT sub_area_id FROM user_sub_areas
    WHERE user_id = auth.uid()
  )
  OR
  -- Equipment with interdisciplinary access to student's sub-areas
  sub_area_id IN (
    SELECT to_sub_area_id FROM interdisciplinary_access
    WHERE from_sub_area_id IN (
      SELECT sub_area_id FROM user_sub_areas WHERE user_id = auth.uid()
    )
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  )
  OR
  -- Equipment with no sub-area (legacy/shared equipment)
  sub_area_id IS NULL
);

-- Area admins can see and manage equipment in their sub-areas
CREATE POLICY equipment_area_admin_access ON equipment
FOR ALL
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM area_admins
    WHERE sub_area_id = equipment.sub_area_id
  )
);

-- Master admins and general admins can see and manage all equipment
CREATE POLICY equipment_admin_access ON equipment
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('master_admin', 'admin')
);

-- ========================================
-- 7. HELPER FUNCTIONS
-- ========================================

-- Function to check if a user has access to equipment in a sub-area
CREATE OR REPLACE FUNCTION user_has_sub_area_access(
  p_user_id UUID,
  p_sub_area_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check direct assignment
  IF EXISTS (
    SELECT 1 FROM user_sub_areas
    WHERE user_id = p_user_id AND sub_area_id = p_sub_area_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check interdisciplinary access
  IF EXISTS (
    SELECT 1 FROM interdisciplinary_access ia
    INNER JOIN user_sub_areas usa ON usa.sub_area_id = ia.from_sub_area_id
    WHERE usa.user_id = p_user_id
    AND ia.to_sub_area_id = p_sub_area_id
    AND ia.is_active = TRUE
    AND (ia.expires_at IS NULL OR ia.expires_at > NOW())
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all equipment accessible by a user
CREATE OR REPLACE FUNCTION get_accessible_equipment(p_user_id UUID)
RETURNS TABLE (
  equipment_id UUID,
  access_type TEXT -- 'direct' or 'interdisciplinary'
) AS $$
BEGIN
  RETURN QUERY
  -- Direct access from user's sub-areas
  SELECT e.id, 'direct'::TEXT
  FROM equipment e
  INNER JOIN user_sub_areas usa ON usa.sub_area_id = e.sub_area_id
  WHERE usa.user_id = p_user_id

  UNION

  -- Interdisciplinary access
  SELECT e.id, 'interdisciplinary'::TEXT
  FROM equipment e
  INNER JOIN interdisciplinary_access ia ON ia.to_sub_area_id = e.sub_area_id
  INNER JOIN user_sub_areas usa ON usa.sub_area_id = ia.from_sub_area_id
  WHERE usa.user_id = p_user_id
  AND ia.is_active = TRUE
  AND (ia.expires_at IS NULL OR ia.expires_at > NOW())

  UNION

  -- Equipment with no sub-area (shared/legacy)
  SELECT e.id, 'shared'::TEXT
  FROM equipment e
  WHERE e.sub_area_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old interdisciplinary access grants
CREATE OR REPLACE FUNCTION expire_interdisciplinary_access()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE interdisciplinary_access
  SET is_active = FALSE
  WHERE is_active = TRUE
  AND expires_at IS NOT NULL
  AND expires_at <= NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. TRIGGERS
-- ========================================

-- Trigger to update updated_at timestamp on sub_areas
CREATE OR REPLACE FUNCTION update_sub_areas_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sub_areas_updated_at
BEFORE UPDATE ON sub_areas
FOR EACH ROW
EXECUTE FUNCTION update_sub_areas_timestamp();

-- ========================================
-- 9. SEED DATA (Example Sub-Areas)
-- ========================================

-- Insert example sub-areas (customize based on NCAD structure)
INSERT INTO sub_areas (name, description, parent_department) VALUES
  ('Communication Design', 'Communication Design sub-area', 'School of Design'),
  ('Fashion Design', 'Fashion Design sub-area', 'School of Design'),
  ('Graphic Design', 'Graphic Design sub-area', 'School of Design'),
  ('Illustration', 'Illustration sub-area', 'School of Design'),
  ('Fine Art Media', 'Fine Art Media sub-area', 'School of Fine Art'),
  ('Sculpture', 'Sculpture sub-area', 'School of Fine Art'),
  ('Painting', 'Painting sub-area', 'School of Fine Art'),
  ('Moving Image', 'Moving Image Design', 'School of Design')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- To apply this migration:
-- 1. Connect to your Supabase PostgreSQL database
-- 2. Run this SQL script
-- 3. Verify policies with: SELECT * FROM pg_policies WHERE tablename IN ('sub_areas', 'area_admins', 'user_sub_areas', 'interdisciplinary_access', 'equipment');
-- 4. Test RLS by querying as different user roles

-- To rollback (if needed):
-- DROP POLICY IF EXISTS equipment_student_access ON equipment;
-- DROP POLICY IF EXISTS equipment_area_admin_access ON equipment;
-- DROP POLICY IF EXISTS equipment_admin_access ON equipment;
-- DROP TABLE IF EXISTS interdisciplinary_access CASCADE;
-- DROP TABLE IF EXISTS user_sub_areas CASCADE;
-- DROP TABLE IF EXISTS area_admins CASCADE;
-- ALTER TABLE equipment DROP COLUMN IF EXISTS sub_area_id;
-- DROP TABLE IF EXISTS sub_areas CASCADE;
-- DROP FUNCTION IF EXISTS user_has_sub_area_access(UUID, UUID);
-- DROP FUNCTION IF EXISTS get_accessible_equipment(UUID);
-- DROP FUNCTION IF EXISTS expire_interdisciplinary_access();
