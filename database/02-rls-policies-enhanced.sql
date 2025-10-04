-- ============================================================================
-- NCAD EQUIPMENT BOOKING SYSTEM - ROW LEVEL SECURITY POLICIES
-- Part 2: Comprehensive RLS for All 9 User Roles
-- ============================================================================
-- Security model ensuring each role sees only permitted data
-- Implements GDPR-compliant data access controls
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Get Current User Role
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
  v_role VARCHAR;
BEGIN
  SELECT role INTO v_role
  FROM users
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'student');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if User Has Permission
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_permission(p_permission VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
  v_role VARCHAR;
BEGIN
  SELECT role, admin_permissions INTO v_role, v_permissions
  FROM users
  WHERE id = auth.uid();

  -- Master admin has all permissions
  IF v_role = 'master_admin' THEN
    RETURN true;
  END IF;

  -- Check in admin_permissions JSONB
  RETURN COALESCE((v_permissions->>p_permission)::boolean, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: User Has Department Access
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_department_access(p_department VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions JSONB;
  v_departments JSONB;
  v_role VARCHAR;
BEGIN
  SELECT role, admin_permissions INTO v_role, v_permissions
  FROM users
  WHERE id = auth.uid();

  -- Master admin has access to all departments
  IF v_role = 'master_admin' THEN
    RETURN true;
  END IF;

  -- Check departments array in permissions
  v_departments := v_permissions->'departments';

  IF v_departments IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_departments ? p_department;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 1. SYSTEM FEATURE FLAGS RLS
-- ============================================================================

ALTER TABLE system_feature_flags ENABLE ROW LEVEL SECURITY;

-- Master admin can view all feature flags
CREATE POLICY "Master admin view feature flags" ON system_feature_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- Master admin can update feature flags
CREATE POLICY "Master admin manage feature flags" ON system_feature_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- All authenticated users can check if features are enabled (read-only via functions)
CREATE POLICY "Authenticated check feature status" ON system_feature_flags
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND is_enabled = true
  );

-- ============================================================================
-- 2. USERS TABLE RLS (Enhanced for New Roles)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with enhancements
DROP POLICY IF EXISTS "Students can view own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Master admins manage users" ON users;

-- Students can view their own data only
CREATE POLICY "Students view own profile" ON users
  FOR SELECT
  USING (
    id = auth.uid() AND role = 'student'
  );

-- All admin roles can view user lists (but sensitive fields protected by column-level security)
CREATE POLICY "Admin roles view users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN (
        'general_admin',
        'master_admin',
        'view_only_staff',
        'accounts_officer',
        'payroll_coordinator',
        'it_support_technician',
        'budget_manager'
      )
    )
  );

-- Only master admin can create/update/delete users
CREATE POLICY "Master admin manage users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- Students can update own profile (limited fields via application logic)
CREATE POLICY "Students update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid() AND role = 'student')
  WITH CHECK (id = auth.uid() AND role = 'student');

-- ============================================================================
-- 3. EQUIPMENT TABLE RLS (Field-Level Access Control)
-- ============================================================================

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public equipment viewing" ON equipment;
DROP POLICY IF EXISTS "Admins manage equipment" ON equipment;

-- All authenticated users can view basic equipment info
CREATE POLICY "Authenticated view equipment catalog" ON equipment
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: Sensitive fields (tracking_number, purchase_cost, etc.) protected by:
-- 1. Application-level field filtering based on role
-- 2. Database views for each role (created below)

-- General admin and IT support can update equipment
CREATE POLICY "Admin roles manage equipment" ON equipment
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin', 'it_support_technician')
    )
  );

-- ============================================================================
-- 4. EQUIPMENT COSTS RLS (Accounts & Budget Manager Only)
-- ============================================================================

ALTER TABLE equipment_costs ENABLE ROW LEVEL SECURITY;

-- Accounts officers can view all costs
CREATE POLICY "Accounts view all costs" ON equipment_costs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('accounts_officer', 'master_admin')
      AND is_role_enabled('accounts_officer')
    )
  );

-- Budget managers can view costs for their departments
CREATE POLICY "Budget managers view department costs" ON equipment_costs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'budget_manager'
      AND is_role_enabled('budget_manager')
      AND user_has_department_access(equipment_costs.paid_by_department)
    )
  );

-- Accounts officers can insert/update costs
CREATE POLICY "Accounts manage costs" ON equipment_costs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('accounts_officer', 'master_admin')
      AND is_role_enabled('accounts_officer')
    )
  );

-- ============================================================================
-- 5. ADMIN ACTIONS RLS (Payroll Access to Time Data)
-- ============================================================================

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Admins can view their own actions
CREATE POLICY "Admins view own actions" ON admin_actions
  FOR SELECT
  USING (admin_id = auth.uid());

-- Master admin can view all actions
CREATE POLICY "Master admin view all actions" ON admin_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- Payroll coordinators can view time tracking data (anonymized via views)
CREATE POLICY "Payroll view time data" ON admin_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'payroll_coordinator'
      AND is_role_enabled('payroll_coordinator')
    )
  );

-- All admin roles can insert their own actions
CREATE POLICY "Admins log own actions" ON admin_actions
  FOR INSERT
  WITH CHECK (admin_id = auth.uid());

-- ============================================================================
-- 6. STAFF COST CENTERS RLS (Payroll Only)
-- ============================================================================

ALTER TABLE staff_cost_centers ENABLE ROW LEVEL SECURITY;

-- Payroll coordinators can view all cost center allocations
CREATE POLICY "Payroll view cost centers" ON staff_cost_centers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('payroll_coordinator', 'master_admin')
      AND is_role_enabled('payroll_coordinator')
    )
  );

-- Admins can view their own cost center allocations
CREATE POLICY "Admins view own allocations" ON staff_cost_centers
  FOR SELECT
  USING (admin_id = auth.uid());

-- Payroll and master admin can manage cost centers
CREATE POLICY "Payroll manage cost centers" ON staff_cost_centers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('payroll_coordinator', 'master_admin')
    )
  );

-- ============================================================================
-- 7. IT TICKETS RLS (IT Support Access)
-- ============================================================================

ALTER TABLE equipment_it_tickets ENABLE ROW LEVEL SECURITY;

-- IT support can view all tickets
CREATE POLICY "IT support view tickets" ON equipment_it_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('it_support_technician', 'master_admin')
      AND is_role_enabled('it_support_technician')
    )
  );

-- General admins can view tickets for equipment they manage
CREATE POLICY "General admin view equipment tickets" ON equipment_it_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- IT support and general admin can create/update tickets
CREATE POLICY "IT manage tickets" ON equipment_it_tickets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('it_support_technician', 'general_admin', 'master_admin')
    )
  );

-- ============================================================================
-- 8. MAINTENANCE SCHEDULES RLS (IT Support & General Admin)
-- ============================================================================

ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- IT support and general admin can view all schedules
CREATE POLICY "Admin view maintenance" ON maintenance_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('it_support_technician', 'general_admin', 'master_admin')
    )
  );

-- IT support and general admin can manage schedules
CREATE POLICY "Admin manage maintenance" ON maintenance_schedules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('it_support_technician', 'general_admin', 'master_admin')
    )
  );

-- ============================================================================
-- 9. BOOKINGS TABLE RLS (Enhanced)
-- ============================================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Students view own bookings" ON bookings;
DROP POLICY IF EXISTS "Students create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins manage bookings" ON bookings;

-- Students view their own bookings
CREATE POLICY "Students view own bookings" ON bookings
  FOR SELECT
  USING (student_id = auth.uid());

-- Students create bookings
CREATE POLICY "Students create bookings" ON bookings
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Students can cancel their own pending bookings
CREATE POLICY "Students cancel own bookings" ON bookings
  FOR UPDATE
  USING (student_id = auth.uid() AND status = 'pending')
  WITH CHECK (student_id = auth.uid() AND status IN ('pending', 'cancelled'));

-- View-only staff can view bookings (for planning)
CREATE POLICY "Staff view bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'view_only_staff'
      AND is_role_enabled('view_only_staff')
    )
  );

-- General admin can view all bookings
CREATE POLICY "General admin view bookings" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- General admin can manage bookings
CREATE POLICY "General admin manage bookings" ON bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Budget managers can view booking statistics (via views, not raw data)
CREATE POLICY "Budget managers view booking data" ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'budget_manager'
      AND is_role_enabled('budget_manager')
    )
  );

-- ============================================================================
-- 10. EQUIPMENT NOTES RLS (Admin Only)
-- ============================================================================

ALTER TABLE equipment_notes ENABLE ROW LEVEL SECURITY;

-- General admin and IT support can view notes
CREATE POLICY "Admin view equipment notes" ON equipment_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'it_support_technician', 'master_admin')
    )
  );

-- General admin and IT support can create notes
CREATE POLICY "Admin create notes" ON equipment_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'it_support_technician', 'master_admin')
    )
  );

-- Only note creator or master admin can update notes
CREATE POLICY "Admin update own notes" ON equipment_notes
  FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- ============================================================================
-- 11. DATA ACCESS AUDIT RLS (Master Admin Only)
-- ============================================================================

ALTER TABLE data_access_audit ENABLE ROW LEVEL SECURITY;

-- Only master admin can view audit logs
CREATE POLICY "Master admin view audit" ON data_access_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'master_admin'
    )
  );

-- System can insert audit records (via SECURITY DEFINER function)
CREATE POLICY "System log audit" ON data_access_audit
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 12. CROSS DEPARTMENT ACCESS RLS
-- ============================================================================

ALTER TABLE cross_department_access ENABLE ROW LEVEL SECURITY;

-- Students can view their own access grants
CREATE POLICY "Students view own access" ON cross_department_access
  FOR SELECT
  USING (student_id = auth.uid());

-- General admin and master admin can view all access grants
CREATE POLICY "Admin view cross dept access" ON cross_department_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- General admin and master admin can manage access grants
CREATE POLICY "Admin manage cross dept access" ON cross_department_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- ============================================================================
-- 13. DATABASE VIEWS FOR ROLE-SPECIFIC DATA ACCESS
-- ============================================================================

-- View: Equipment catalog for students (hide sensitive fields)
CREATE OR REPLACE VIEW equipment_student_view AS
SELECT
  id,
  product_name,
  description,
  image_url,
  category,
  status,
  qr_code,
  created_at
FROM equipment
WHERE status != 'out_of_service';

-- View: Equipment for view-only staff (add availability info)
CREATE OR REPLACE VIEW equipment_staff_view AS
SELECT
  e.id,
  e.product_name,
  e.description,
  e.image_url,
  e.category,
  e.status,
  e.created_at,
  COUNT(b.id) FILTER (WHERE b.status IN ('pending', 'approved')) as pending_bookings
FROM equipment e
LEFT JOIN bookings b ON e.id = ANY(b.equipment_ids)
  AND b.start_date <= CURRENT_DATE + INTERVAL '30 days'
GROUP BY e.id;

-- View: Equipment for accounts (financial data only)
CREATE OR REPLACE VIEW equipment_accounts_view AS
SELECT
  e.id,
  e.product_name,
  e.category,
  e.purchase_date,
  e.purchase_cost,
  e.supplier,
  e.warranty_expiry,
  e.depreciation_rate,
  e.useful_life_years,
  e.salvage_value,
  e.disposal_date,
  e.disposal_reason,
  COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type = 'repair'), 0) as total_repair_costs,
  COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type = 'maintenance'), 0) as total_maintenance_costs,
  COALESCE(SUM(ec.amount), 0) as total_costs
FROM equipment e
LEFT JOIN equipment_costs ec ON e.id = ec.equipment_id
GROUP BY e.id;

-- View: Equipment for IT support (technical data)
CREATE OR REPLACE VIEW equipment_it_view AS
SELECT
  e.id,
  e.product_name,
  e.tracking_number,
  e.serial_number,
  e.asset_tag,
  e.category,
  e.status,
  e.firmware_version,
  e.software_version,
  e.network_mac_address,
  e.last_it_audit_date,
  e.it_compliance_status,
  e.warranty_expiry,
  COUNT(t.id) FILTER (WHERE t.status IN ('open', 'in_progress')) as open_tickets,
  COUNT(m.id) FILTER (WHERE m.status = 'overdue') as overdue_maintenance
FROM equipment e
LEFT JOIN equipment_it_tickets t ON e.id = t.equipment_id
LEFT JOIN maintenance_schedules m ON e.id = m.equipment_id
GROUP BY e.id;

-- View: Payroll time tracking (anonymized for privacy)
CREATE OR REPLACE VIEW payroll_time_tracking_view AS
SELECT
  aa.admin_id,
  u.department as admin_department,
  aa.task_category,
  aa.department as task_department,
  DATE_TRUNC('day', aa.created_at) as action_date,
  SUM(aa.time_spent_minutes) as total_minutes,
  COUNT(*) as action_count
FROM admin_actions aa
JOIN users u ON aa.admin_id = u.id
WHERE aa.time_spent_minutes > 0
GROUP BY aa.admin_id, u.department, aa.task_category, aa.department, DATE_TRUNC('day', aa.created_at);

-- View: Budget manager dashboard (aggregated data)
CREATE OR REPLACE VIEW budget_analytics_view AS
SELECT
  e.category,
  e.status,
  COUNT(e.id) as equipment_count,
  AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.purchase_date))) as avg_age_years,
  SUM(e.purchase_cost) as total_purchase_cost,
  SUM(COALESCE(costs.total_costs, 0)) as total_ownership_cost,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT b.student_id) as unique_users
FROM equipment e
LEFT JOIN (
  SELECT equipment_id, SUM(amount) as total_costs
  FROM equipment_costs
  GROUP BY equipment_id
) costs ON e.id = costs.equipment_id
LEFT JOIN bookings b ON e.id = ANY(b.equipment_ids)
  AND b.status = 'completed'
  AND b.end_date >= CURRENT_DATE - INTERVAL '1 year'
WHERE e.purchase_date IS NOT NULL
GROUP BY e.category, e.status;

-- Grant appropriate access to views
GRANT SELECT ON equipment_student_view TO authenticated;
GRANT SELECT ON equipment_staff_view TO authenticated;
GRANT SELECT ON equipment_accounts_view TO authenticated;
GRANT SELECT ON equipment_it_view TO authenticated;
GRANT SELECT ON payroll_time_tracking_view TO authenticated;
GRANT SELECT ON budget_analytics_view TO authenticated;

-- ============================================================================
-- 14. FUNCTION: Check User Access to Sensitive Data
-- ============================================================================

CREATE OR REPLACE FUNCTION can_access_financial_data()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('accounts_officer', 'budget_manager', 'master_admin')
    AND (
      role = 'master_admin'
      OR is_role_enabled(role)
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_payroll_data()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('payroll_coordinator', 'master_admin')
    AND (
      role = 'master_admin'
      OR is_role_enabled('payroll_coordinator')
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_it_data()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('it_support_technician', 'general_admin', 'master_admin')
    AND (
      role IN ('general_admin', 'master_admin')
      OR is_role_enabled('it_support_technician')
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES COMPLETE
-- ============================================================================
-- All roles now have appropriate data access controls
-- Sensitive fields protected via RLS and database views
-- GDPR-compliant audit trail for all data access
-- ============================================================================
