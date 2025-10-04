-- ============================================
-- NCAD Equipment Booking System - Base Schema
-- Run this FIRST before any other migration files
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  student_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'general_admin', 'master_admin')),
  admin_permissions JSONB DEFAULT '{}',
  strike_count INTEGER DEFAULT 0 CHECK (strike_count >= 0 AND strike_count <= 3),
  blacklist_until TIMESTAMP,
  interdisciplinary_access JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- ============================================
-- 2. EQUIPMENT TABLE
-- ============================================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(200) NOT NULL,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  category VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'maintenance', 'out_of_service')),
  qr_code VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_tracking ON equipment(tracking_number);

-- ============================================
-- 3. UTILITY FUNCTIONS
-- ============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to equipment
CREATE TRIGGER update_equipment_modtime
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================
-- 4. EQUIPMENT NOTES TABLE
-- ============================================
CREATE TABLE equipment_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  note_type VARCHAR(30) NOT NULL CHECK (note_type IN ('maintenance', 'damage', 'usage', 'general')),
  note_content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_equipment ON equipment_notes(equipment_id);
CREATE INDEX idx_notes_type ON equipment_notes(note_type);
CREATE INDEX idx_notes_created_by ON equipment_notes(created_by);
CREATE INDEX idx_notes_created_at ON equipment_notes(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_equipment_notes_modtime
  BEFORE UPDATE ON equipment_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================
-- 5. BOOKINGS TABLE
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  equipment_ids UUID[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  admin_notes TEXT,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT future_booking CHECK (start_date >= CURRENT_DATE)
);

-- Indexes
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_equipment ON bookings USING GIN(equipment_ids);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- ============================================
-- 6. ADMIN ACTIONS (Audit Trail)
-- ============================================
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_actions_type ON admin_actions(action_type);
CREATE INDEX idx_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX idx_actions_created ON admin_actions(created_at DESC);

-- ============================================
-- 7. CROSS DEPARTMENT ACCESS TABLE
-- ============================================
CREATE TABLE cross_department_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  from_department VARCHAR(100) NOT NULL,
  to_department VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  approved_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_access_dates CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_cross_dept_equipment ON cross_department_access(equipment_id);
CREATE INDEX idx_cross_dept_to ON cross_department_access(to_department);
CREATE INDEX idx_cross_dept_dates ON cross_department_access(start_date, end_date);

-- ============================================
-- 8. BASIC RLS POLICIES (Students & Admins)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_department_access ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Equipment table policies
CREATE POLICY "Anyone can view equipment" ON equipment
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can modify equipment" ON equipment
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Equipment notes policies (admin only)
CREATE POLICY "Admins can view notes" ON equipment_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

CREATE POLICY "Admins can create notes" ON equipment_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Bookings policies
CREATE POLICY "Students view own bookings" ON bookings
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins view all bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

CREATE POLICY "Students create bookings" ON bookings
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins manage bookings" ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Admin actions policies
CREATE POLICY "Admins view admin actions" ON admin_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

CREATE POLICY "Admins create admin actions" ON admin_actions
  FOR INSERT
  WITH CHECK (admin_id = auth.uid());

-- ============================================
-- 9. CONFLICT DETECTION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION check_equipment_availability(
  p_equipment_ids UUID[],
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS TABLE(equipment_id UUID, conflict_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    unnest(p_equipment_ids) as equipment_id,
    COUNT(*)::INTEGER as conflict_count
  FROM bookings
  WHERE
    p_equipment_ids && equipment_ids
    AND status IN ('pending', 'approved', 'active')
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      (start_date <= p_end_date AND end_date >= p_start_date)
    )
  GROUP BY unnest(p_equipment_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Base schema created successfully!';
  RAISE NOTICE 'Tables: users, equipment, equipment_notes, bookings, admin_actions, cross_department_access';
  RAISE NOTICE 'Next: Run 01-enhanced-roles-schema.sql';
END $$;
