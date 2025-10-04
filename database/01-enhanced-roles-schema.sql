-- ============================================================================
-- NCAD EQUIPMENT BOOKING SYSTEM - ENHANCED ROLE SYSTEM
-- Part 1: Role-Based Access Control with Feature Flags
-- ============================================================================
-- This migration adds 5 new user roles with master admin toggle controls
-- Roles: view_only_staff, accounts_officer, payroll_coordinator,
--        it_support_technician, budget_manager
-- ============================================================================

-- ============================================================================
-- 1. SYSTEM FEATURE FLAGS (Master Admin Control)
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_key VARCHAR(100) UNIQUE NOT NULL,
  feature_name VARCHAR(200) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  enabled_by UUID REFERENCES users(id),
  enabled_at TIMESTAMP,
  disabled_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast feature flag lookups
CREATE INDEX idx_feature_flags_key ON system_feature_flags(feature_key);
CREATE INDEX idx_feature_flags_enabled ON system_feature_flags(is_enabled);

-- Insert default feature flags for each new role
INSERT INTO system_feature_flags (feature_key, feature_name, description, is_enabled, metadata) VALUES
  ('role_view_only_staff', 'View-Only Staff Role', 'Enable teaching faculty to view equipment availability without booking permissions', false, '{"role": "view_only_staff", "version": "1.0"}'),
  ('role_accounts_officer', 'Accounts Officer Role', 'Enable finance staff to access equipment costs, depreciation, and financial reporting', false, '{"role": "accounts_officer", "version": "1.0"}'),
  ('role_payroll_coordinator', 'Payroll Coordinator Role', 'Enable HR/Payroll staff to track admin time allocation and workload', false, '{"role": "payroll_coordinator", "version": "1.0"}'),
  ('role_it_support_technician', 'IT Support Technician Role', 'Enable IT staff to manage equipment lifecycle, maintenance, and help desk integration', false, '{"role": "it_support_technician", "version": "1.0"}'),
  ('role_budget_manager', 'Budget Manager Role', 'Enable strategic budget planning with ROI analytics and replacement forecasting', false, '{"role": "budget_manager", "version": "1.0"}'),
  ('feature_financial_management', 'Financial Management Module', 'Total Cost of Ownership tracking, depreciation calculations, and financial reporting', false, '{"components": ["tco_tracking", "depreciation", "budget_allocation"], "version": "1.0"}'),
  ('feature_payroll_tracking', 'Payroll Time Tracking Module', 'Admin time tracking and cost center allocation for payroll integration', false, '{"components": ["time_tracking", "cost_centers", "efficiency_metrics"], "version": "1.0"}'),
  ('feature_it_asset_lifecycle', 'IT Asset Lifecycle Module', 'Help desk integration, maintenance scheduling, and IT compliance tracking', false, '{"components": ["help_desk", "maintenance", "compliance"], "version": "1.0"}'),
  ('feature_budget_analytics', 'Budget Analytics Module', 'ROI calculation, replacement priority matrix, and strategic planning tools', false, '{"components": ["roi_calculator", "replacement_matrix", "sharing_optimizer"], "version": "1.0"}')
ON CONFLICT (feature_key) DO NOTHING;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_feature_flag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.is_enabled = true AND OLD.is_enabled = false THEN
    NEW.enabled_at = NOW();
    NEW.disabled_at = NULL;
  ELSIF NEW.is_enabled = false AND OLD.is_enabled = true THEN
    NEW.disabled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feature_flag_timestamp
  BEFORE UPDATE ON system_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flag_timestamp();

-- ============================================================================
-- 2. ENHANCED USERS TABLE (Add New Roles)
-- ============================================================================

-- Update the role enum to include new roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (
    role IN (
      'student',
      'general_admin',
      'master_admin',
      'view_only_staff',
      'accounts_officer',
      'payroll_coordinator',
      'it_support_technician',
      'budget_manager'
    )
  );

-- Add role-specific permissions JSONB for granular control
-- This allows master admin to customize each role instance
COMMENT ON COLUMN users.admin_permissions IS 'Granular permissions JSON: {
  "departments": ["PRODUCT_DESIGN", "COMMUNICATION_DESIGN"],
  "can_approve_bookings": true,
  "can_view_costs": true,
  "can_export_data": true,
  "max_export_rows": 1000,
  "custom_permissions": []
}';

-- Add index for new roles (simple index without function call)
CREATE INDEX IF NOT EXISTS idx_users_role_enabled ON users(role) WHERE role NOT IN ('student', 'general_admin', 'master_admin');

-- ============================================================================
-- 3. EQUIPMENT TABLE ENHANCEMENTS (Financial & IT Data)
-- ============================================================================

-- Add financial fields for Accounts Officer role
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_cost DECIMAL(10,2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS supplier VARCHAR(200);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS warranty_expiry DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS depreciation_rate DECIMAL(5,2) DEFAULT 20.00; -- 20% annual
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS useful_life_years INTEGER DEFAULT 5;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS salvage_value DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS disposal_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS disposal_reason TEXT;

-- Add IT support fields
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS serial_number VARCHAR(100);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS asset_tag VARCHAR(50);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS firmware_version VARCHAR(50);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS software_version VARCHAR(50);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS network_mac_address VARCHAR(17);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_it_audit_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS it_compliance_status VARCHAR(30) DEFAULT 'not_assessed';

-- Add constraint for IT compliance status
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_it_compliance_check;
ALTER TABLE equipment
  ADD CONSTRAINT equipment_it_compliance_check CHECK (
    it_compliance_status IN ('compliant', 'needs_update', 'non_compliant', 'not_assessed', 'exempt')
  );

-- Indexes for financial and IT queries
CREATE INDEX IF NOT EXISTS idx_equipment_purchase_date ON equipment(purchase_date);
CREATE INDEX IF NOT EXISTS idx_equipment_warranty ON equipment(warranty_expiry) WHERE warranty_expiry IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_it_compliance ON equipment(it_compliance_status);
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);

-- ============================================================================
-- 4. EQUIPMENT COSTS TABLE (Total Cost of Ownership Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS equipment_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  cost_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  invoice_number VARCHAR(50),
  supplier VARCHAR(200),
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by_department VARCHAR(100),
  budget_code VARCHAR(50),
  fiscal_year INTEGER,
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cost type constraint
ALTER TABLE equipment_costs DROP CONSTRAINT IF EXISTS equipment_costs_type_check;
ALTER TABLE equipment_costs
  ADD CONSTRAINT equipment_costs_type_check CHECK (
    cost_type IN ('purchase', 'repair', 'maintenance', 'supplies', 'insurance', 'licensing', 'upgrade', 'other')
  );

-- Indexes
CREATE INDEX idx_costs_equipment ON equipment_costs(equipment_id);
CREATE INDEX idx_costs_type ON equipment_costs(cost_type);
CREATE INDEX idx_costs_date ON equipment_costs(cost_date DESC);
CREATE INDEX idx_costs_department ON equipment_costs(paid_by_department);
CREATE INDEX idx_costs_fiscal_year ON equipment_costs(fiscal_year);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_equipment_costs_timestamp
  BEFORE UPDATE ON equipment_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- 5. ADMIN ACTIONS ENHANCEMENTS (Payroll Time Tracking)
-- ============================================================================

-- Add time tracking fields to existing admin_actions table
ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0;
ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS task_category VARCHAR(50);
ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Task category constraint
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_category_check;
ALTER TABLE admin_actions
  ADD CONSTRAINT admin_actions_category_check CHECK (
    task_category IN (
      'booking_approval',
      'equipment_maintenance',
      'user_support',
      'reporting',
      'system_admin',
      'data_import',
      'equipment_management',
      'note_creation',
      'other'
    ) OR task_category IS NULL
  );

-- Indexes for payroll queries
CREATE INDEX IF NOT EXISTS idx_actions_time_spent ON admin_actions(time_spent_minutes) WHERE time_spent_minutes > 0;
CREATE INDEX IF NOT EXISTS idx_actions_category ON admin_actions(task_category);
CREATE INDEX IF NOT EXISTS idx_actions_department ON admin_actions(department);

-- ============================================================================
-- 6. STAFF COST CENTERS TABLE (Payroll Department Attribution)
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(100) NOT NULL,
  cost_center_code VARCHAR(50),
  allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  effective_from DATE NOT NULL,
  effective_to DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Ensure allocations don't exceed 100% for any admin at any given time
CREATE UNIQUE INDEX idx_cost_center_admin_dates ON staff_cost_centers(admin_id, department, effective_from);
CREATE INDEX idx_cost_center_admin ON staff_cost_centers(admin_id);
CREATE INDEX idx_cost_center_department ON staff_cost_centers(department);
CREATE INDEX idx_cost_center_active ON staff_cost_centers(effective_from, effective_to);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_cost_centers_timestamp
  BEFORE UPDATE ON staff_cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- 7. IT HELP DESK TICKETS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS equipment_it_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50),
  ticket_system VARCHAR(50) DEFAULT 'internal', -- 'ServiceNow', 'Jira', 'internal', etc.
  external_ticket_id VARCHAR(100), -- ID from external system
  issue_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'open',
  resolution_notes TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP
);

-- Constraints
ALTER TABLE equipment_it_tickets DROP CONSTRAINT IF EXISTS tickets_issue_type_check;
ALTER TABLE equipment_it_tickets
  ADD CONSTRAINT tickets_issue_type_check CHECK (
    issue_type IN (
      'hardware_failure',
      'software_issue',
      'network_problem',
      'calibration_needed',
      'preventive_maintenance',
      'user_error',
      'configuration',
      'other'
    )
  );

ALTER TABLE equipment_it_tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;
ALTER TABLE equipment_it_tickets
  ADD CONSTRAINT tickets_priority_check CHECK (
    priority IN ('critical', 'high', 'medium', 'low')
  );

ALTER TABLE equipment_it_tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE equipment_it_tickets
  ADD CONSTRAINT tickets_status_check CHECK (
    status IN ('open', 'in_progress', 'awaiting_parts', 'resolved', 'closed', 'cancelled')
  );

-- Indexes
CREATE INDEX idx_tickets_equipment ON equipment_it_tickets(equipment_id);
CREATE INDEX idx_tickets_status ON equipment_it_tickets(status);
CREATE INDEX idx_tickets_priority ON equipment_it_tickets(priority);
CREATE INDEX idx_tickets_assigned ON equipment_it_tickets(assigned_to);
CREATE INDEX idx_tickets_created ON equipment_it_tickets(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_tickets_timestamp
  BEFORE UPDATE ON equipment_it_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- 8. MAINTENANCE SCHEDULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) NOT NULL,
  frequency_days INTEGER NOT NULL CHECK (frequency_days > 0),
  last_performed DATE,
  next_due DATE NOT NULL,
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'scheduled',
  estimated_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Constraints
ALTER TABLE maintenance_schedules DROP CONSTRAINT IF EXISTS maintenance_type_check;
ALTER TABLE maintenance_schedules
  ADD CONSTRAINT maintenance_type_check CHECK (
    maintenance_type IN (
      'cleaning',
      'calibration',
      'firmware_update',
      'software_update',
      'safety_inspection',
      'battery_replacement',
      'filter_replacement',
      'general_service',
      'other'
    )
  );

ALTER TABLE maintenance_schedules DROP CONSTRAINT IF EXISTS maintenance_status_check;
ALTER TABLE maintenance_schedules
  ADD CONSTRAINT maintenance_status_check CHECK (
    status IN ('scheduled', 'overdue', 'in_progress', 'completed', 'skipped', 'cancelled')
  );

-- Indexes
CREATE INDEX idx_maintenance_equipment ON maintenance_schedules(equipment_id);
CREATE INDEX idx_maintenance_next_due ON maintenance_schedules(next_due);
CREATE INDEX idx_maintenance_status ON maintenance_schedules(status);
CREATE INDEX idx_maintenance_assigned ON maintenance_schedules(assigned_to);
CREATE INDEX idx_maintenance_overdue ON maintenance_schedules(status, next_due) WHERE status = 'scheduled';

-- Trigger for updated_at
CREATE TRIGGER trigger_update_maintenance_timestamp
  BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- 9. AUDIT LOG ENHANCEMENTS (Data Access Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS data_access_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  user_role VARCHAR(50) NOT NULL,
  access_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  data_sensitivity VARCHAR(20) DEFAULT 'normal',
  query_parameters JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Constraints
ALTER TABLE data_access_audit DROP CONSTRAINT IF EXISTS audit_access_type_check;
ALTER TABLE data_access_audit
  ADD CONSTRAINT audit_access_type_check CHECK (
    access_type IN ('view', 'export', 'report_generation', 'api_call')
  );

ALTER TABLE data_access_audit DROP CONSTRAINT IF EXISTS audit_resource_type_check;
ALTER TABLE data_access_audit
  ADD CONSTRAINT audit_resource_type_check CHECK (
    resource_type IN (
      'financial_data',
      'payroll_data',
      'student_pii',
      'equipment_costs',
      'admin_time_tracking',
      'booking_data',
      'system_configuration',
      'other'
    )
  );

ALTER TABLE data_access_audit DROP CONSTRAINT IF EXISTS audit_sensitivity_check;
ALTER TABLE data_access_audit
  ADD CONSTRAINT audit_sensitivity_check CHECK (
    data_sensitivity IN ('public', 'internal', 'confidential', 'restricted')
  );

-- Indexes for compliance reporting
CREATE INDEX idx_audit_user ON data_access_audit(user_id);
CREATE INDEX idx_audit_role ON data_access_audit(user_role);
CREATE INDEX idx_audit_resource ON data_access_audit(resource_type, resource_id);
CREATE INDEX idx_audit_sensitivity ON data_access_audit(data_sensitivity);
CREATE INDEX idx_audit_created ON data_access_audit(created_at DESC);

-- Partition by month for performance (optional, comment out if not needed)
-- CREATE TABLE data_access_audit_202510 PARTITION OF data_access_audit
--   FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- ============================================================================
-- 10. UTILITY FUNCTIONS
-- ============================================================================

-- Function to check if a feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(p_feature_key VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT is_enabled INTO v_enabled
  FROM system_feature_flags
  WHERE feature_key = p_feature_key;

  RETURN COALESCE(v_enabled, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if a role is enabled
CREATE OR REPLACE FUNCTION is_role_enabled(p_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_feature_enabled('role_' || p_role);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to validate user role against feature flags
CREATE OR REPLACE FUNCTION validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Master admin always allowed
  IF NEW.role = 'master_admin' THEN
    RETURN NEW;
  END IF;

  -- Student and general_admin always allowed (core roles)
  IF NEW.role IN ('student', 'general_admin') THEN
    RETURN NEW;
  END IF;

  -- Check if the role is enabled via feature flags
  IF NOT is_role_enabled(NEW.role) THEN
    RAISE EXCEPTION 'Role % is not currently enabled in the system. Master admin must enable it first.', NEW.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate role assignments
DROP TRIGGER IF EXISTS trigger_validate_user_role ON users;
CREATE TRIGGER trigger_validate_user_role
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_role();

-- Function to log data access (GDPR compliance)
CREATE OR REPLACE FUNCTION log_data_access(
  p_user_id UUID,
  p_access_type VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID DEFAULT NULL,
  p_data_sensitivity VARCHAR DEFAULT 'normal',
  p_query_params JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_user_role VARCHAR;
  v_audit_id UUID;
BEGIN
  -- Get user role
  SELECT role INTO v_user_role FROM users WHERE id = p_user_id;

  -- Insert audit record
  INSERT INTO data_access_audit (
    user_id, user_role, access_type, resource_type,
    resource_id, data_sensitivity, query_parameters
  ) VALUES (
    p_user_id, v_user_role, p_access_type, p_resource_type,
    p_resource_id, p_data_sensitivity, p_query_params
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE system_feature_flags IS 'Master admin controls to enable/disable new roles and features system-wide';
COMMENT ON TABLE equipment_costs IS 'Total Cost of Ownership tracking for financial reporting and budget analysis';
COMMENT ON TABLE staff_cost_centers IS 'Payroll department attribution for admin time allocation across cost centers';
COMMENT ON TABLE equipment_it_tickets IS 'IT help desk integration for equipment lifecycle and maintenance tracking';
COMMENT ON TABLE maintenance_schedules IS 'Preventive maintenance scheduling to reduce emergency repairs';
COMMENT ON TABLE data_access_audit IS 'GDPR-compliant audit trail for sensitive data access by all roles';

COMMENT ON COLUMN equipment.purchase_cost IS 'Original purchase price for depreciation calculation (Accounts Officer access)';
COMMENT ON COLUMN equipment.depreciation_rate IS 'Annual depreciation percentage (default 20% = 5 year life)';
COMMENT ON COLUMN equipment.it_compliance_status IS 'IT security compliance status for audit trail';
COMMENT ON COLUMN admin_actions.time_spent_minutes IS 'Time tracking for payroll cost center allocation';
COMMENT ON COLUMN admin_actions.task_category IS 'Task classification for workload analysis';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Run 02-financial-functions.sql for depreciation and ROI calculations
-- 2. Run 03-rls-policies.sql for role-based security policies
-- 3. Run 04-budget-analytics.sql for strategic planning functions
-- ============================================================================
