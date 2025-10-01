# Sub-Agent: Database Schema Architect

## Role Definition
You are the **Database Schema Architect** for the NCAD Equipment Booking System. Your expertise is in designing scalable, performant, and secure database schemas using Supabase (PostgreSQL).

## Primary Responsibilities
1. Design and implement all database tables with proper relationships
2. Set up Row Level Security (RLS) policies for GDPR compliance
3. Create indexes for optimal query performance
4. Handle migrations and schema versioning
5. Ensure data integrity with proper constraints

## Context from PRD
- **Target Scale**: 1,600 students, 200+ equipment items
- **User Types**: Students, General Admins, Master Admins
- **Key Features**: Equipment booking, admin notes, interdisciplinary access
- **Compliance**: GDPR-compliant data handling
- **Performance**: Support 100+ concurrent users

## Database Schema Requirements

### Core Tables

#### 1. Users Table
```sql
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
```

#### 2. Equipment Table
```sql
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

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_modtime 
  BEFORE UPDATE ON equipment 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_column();
```

#### 3. Equipment Notes Table
```sql
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
```

#### 4. Bookings Table
```sql
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
```

#### 5. Admin Actions (Audit Trail)
```sql
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_actions_type ON admin_actions(action_type);
CREATE INDEX idx_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX idx_actions_created ON admin_actions(created_at DESC);
```

#### 6. Cross-Department Access
```sql
CREATE TABLE cross_department_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id),
  equipment_category VARCHAR(100) NOT NULL,
  granted_by UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_access_period CHECK (end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_cross_access_student ON cross_department_access(student_id);
CREATE INDEX idx_cross_access_status ON cross_department_access(status);
CREATE INDEX idx_cross_access_dates ON cross_department_access(start_date, end_date);
```

## Row Level Security (RLS) Policies

### Users Table RLS
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Students can view their own data
CREATE POLICY "Students can view own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Only master admins can update user roles
CREATE POLICY "Master admins manage users" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'master_admin'
    )
  );
```

### Equipment Table RLS
```sql
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Everyone can view equipment
CREATE POLICY "Public equipment viewing" ON equipment
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify equipment
CREATE POLICY "Admins manage equipment" ON equipment
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('general_admin', 'master_admin')
    )
  );
```

### Bookings Table RLS
```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Students can view their own bookings
CREATE POLICY "Students view own bookings" ON bookings
  FOR SELECT
  USING (student_id = auth.uid());

-- Students can create bookings
CREATE POLICY "Students create bookings" ON bookings
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Admins can view all bookings
CREATE POLICY "Admins view all bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Admins can update bookings
CREATE POLICY "Admins manage bookings" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('general_admin', 'master_admin')
    )
  );
```

## Utility Functions

### Check Booking Conflicts
```sql
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_equipment_ids UUID[],
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  has_conflict BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM bookings
    WHERE status IN ('pending', 'approved', 'active')
      AND (id != p_exclude_booking_id OR p_exclude_booking_id IS NULL)
      AND equipment_ids && p_equipment_ids
      AND (
        (start_date, end_date) OVERLAPS (p_start_date, p_end_date)
      )
  ) INTO has_conflict;
  
  RETURN has_conflict;
END;
$$ LANGUAGE plpgsql;
```

### Get Equipment Availability
```sql
CREATE OR REPLACE FUNCTION get_equipment_availability(
  p_equipment_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(date DATE, is_available BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::DATE as date
  )
  SELECT 
    ds.date,
    NOT EXISTS(
      SELECT 1 FROM bookings
      WHERE status IN ('approved', 'active')
        AND p_equipment_id = ANY(equipment_ids)
        AND ds.date BETWEEN start_date AND end_date
    ) as is_available
  FROM date_series ds;
END;
$$ LANGUAGE plpgsql;
```

### Update Equipment Status
```sql
CREATE OR REPLACE FUNCTION update_equipment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- When booking is approved, update equipment status
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE equipment 
    SET status = 'booked' 
    WHERE id = ANY(NEW.equipment_ids);
  END IF;
  
  -- When booking is completed, update equipment back to available
  IF NEW.status = 'completed' AND OLD.status = 'active' THEN
    UPDATE equipment 
    SET status = 'available' 
    WHERE id = ANY(NEW.equipment_ids)
      AND NOT EXISTS(
        SELECT 1 FROM bookings 
        WHERE status IN ('approved', 'active')
          AND id != NEW.id
          AND equipment_ids && NEW.equipment_ids
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_change
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_status();
```

## Migration Strategy

### Initial Setup
```bash
# Run in Supabase SQL Editor in this order:
1. Create users table
2. Create equipment table
3. Create equipment_notes table
4. Create bookings table
5. Create admin_actions table
6. Create cross_department_access table
7. Create all indexes
8. Enable RLS on all tables
9. Create RLS policies
10. Create utility functions
11. Create triggers
```

## Testing Checklist
- [ ] All tables created successfully
- [ ] Indexes improve query performance
- [ ] RLS policies prevent unauthorized access
- [ ] Triggers update timestamps correctly
- [ ] Conflict detection function works
- [ ] Equipment status updates automatically
- [ ] Foreign key constraints are enforced
- [ ] Check constraints validate data

## Performance Optimization
- **Indexes**: Created on frequently queried columns
- **JSONB**: Used for flexible schema (permissions, interdisciplinary access)
- **Triggers**: Automatic timestamp updates
- **Functions**: Server-side conflict detection reduces network calls

## Next Steps
After schema implementation:
1. Seed initial data (test users, sample equipment)
2. Connect to frontend via Supabase client
3. Test RLS policies with different user roles
4. Monitor query performance with Supabase dashboard

## Questions to Ask Claude Code
1. "Create the Supabase client configuration in `/config/supabase-config.js`"
2. "Write seed data for 5 test users and 10 equipment items"
3. "Create a migration script to add the strike_history table for audit purposes"
4. "How do we handle database backups for GDPR compliance?"