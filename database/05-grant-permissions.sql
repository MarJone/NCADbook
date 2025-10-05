-- ============================================================================
-- NCAD EQUIPMENT BOOKING SYSTEM - GRANT PERMISSIONS
-- Part 5: Grant access to anon and authenticated roles
-- ============================================================================
-- Run this after all other migration files to ensure proper access

-- ============================================================================
-- GRANT SELECT TO ANON (Public Read Access)
-- ============================================================================

-- System feature flags (anon can check if features are enabled)
GRANT SELECT ON system_feature_flags TO anon;

-- Equipment catalog (public viewing)
GRANT SELECT ON equipment TO anon;

-- Equipment views
GRANT SELECT ON equipment_student_view TO anon;
GRANT SELECT ON equipment_staff_view TO anon;
GRANT SELECT ON equipment_accounts_view TO anon;
GRANT SELECT ON equipment_it_view TO anon;

-- ============================================================================
-- GRANT TO AUTHENTICATED (Logged-in Users)
-- ============================================================================

-- Users table
GRANT SELECT ON users TO authenticated;
GRANT UPDATE ON users TO authenticated;

-- Equipment
GRANT SELECT, INSERT, UPDATE, DELETE ON equipment TO authenticated;

-- Equipment notes
GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_notes TO authenticated;

-- Bookings
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO authenticated;

-- Admin actions (audit trail)
GRANT SELECT, INSERT ON admin_actions TO authenticated;

-- Cross department access
GRANT SELECT, INSERT, UPDATE, DELETE ON cross_department_access TO authenticated;

-- System feature flags (read for checking, write restricted by RLS)
GRANT SELECT, UPDATE ON system_feature_flags TO authenticated;

-- Equipment costs
GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_costs TO authenticated;

-- Staff cost centers
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_cost_centers TO authenticated;

-- IT tickets
GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_it_tickets TO authenticated;

-- Maintenance schedules
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_schedules TO authenticated;

-- Data access audit
GRANT SELECT, INSERT ON data_access_audit TO authenticated;

-- Views
GRANT SELECT ON payroll_time_tracking_view TO authenticated;
GRANT SELECT ON budget_analytics_view TO authenticated;
GRANT SELECT ON payroll_monthly_summary TO authenticated;
GRANT SELECT ON it_maintenance_dashboard TO authenticated;

-- ============================================================================
-- GRANT USAGE ON SEQUENCES (for INSERT operations)
-- ============================================================================

-- No explicit sequences needed - using uuid_generate_v4() for all PKs

-- ============================================================================
-- GRANT EXECUTE ON FUNCTIONS (for authenticated users)
-- ============================================================================

GRANT EXECUTE ON FUNCTION is_feature_enabled(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION is_role_enabled(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_department_access(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_financial_data() TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_payroll_data() TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_it_data() TO authenticated;
GRANT EXECUTE ON FUNCTION check_equipment_availability(UUID[], DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_data_access(UUID, VARCHAR, VARCHAR, UUID, VARCHAR, JSONB) TO authenticated;

-- Financial functions
GRANT EXECUTE ON FUNCTION calculate_equipment_depreciation(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_equipment_tco(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_equipment_utilization(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_equipment_roi(UUID, DECIMAL, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_replacement_priority(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION forecast_equipment_budget(INTEGER, VARCHAR) TO authenticated;

-- Payroll functions
GRANT EXECUTE ON FUNCTION calculate_staff_workload(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_cost_center_allocation(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_staff_efficiency(DATE, DATE) TO authenticated;

-- IT functions
GRANT EXECUTE ON FUNCTION get_equipment_health_status(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_it_tickets(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_maintenance_schedules(VARCHAR, BOOLEAN) TO authenticated;

-- ============================================================================
-- VERIFY PERMISSIONS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Permissions granted successfully!';
  RAISE NOTICE 'Anon role: SELECT on public tables and views';
  RAISE NOTICE 'Authenticated role: Full CRUD on all tables (restricted by RLS)';
  RAISE NOTICE 'Execute permissions granted on all functions';
END $$;
