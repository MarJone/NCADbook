-- ============================================================================
-- NCAD EQUIPMENT BOOKING SYSTEM - PAYROLL & IT SUPPORT FUNCTIONS
-- Part 4: Time Tracking, Cost Centers, and IT Asset Lifecycle
-- ============================================================================

-- ============================================================================
-- PAYROLL COORDINATOR FUNCTIONS
-- ============================================================================

-- 1. Calculate staff workload allocation by department
CREATE OR REPLACE FUNCTION calculate_staff_workload(
  p_admin_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 month',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  admin_id UUID,
  admin_name VARCHAR,
  department VARCHAR,
  task_category VARCHAR,
  total_actions BIGINT,
  total_minutes INTEGER,
  total_hours DECIMAL(5,2),
  avg_minutes_per_task DECIMAL(5,2),
  percentage_of_total DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH admin_totals AS (
    SELECT
      aa.admin_id,
      SUM(aa.time_spent_minutes) as grand_total_minutes
    FROM admin_actions aa
    WHERE aa.created_at BETWEEN p_start_date AND p_end_date
      AND (p_admin_id IS NULL OR aa.admin_id = p_admin_id)
    GROUP BY aa.admin_id
  )
  SELECT
    aa.admin_id,
    u.full_name,
    aa.department,
    aa.task_category,
    COUNT(*) as total_actions,
    SUM(aa.time_spent_minutes)::INTEGER as total_minutes,
    ROUND(SUM(aa.time_spent_minutes) / 60.0, 2) as total_hours,
    ROUND(AVG(aa.time_spent_minutes), 2) as avg_minutes_per_task,
    ROUND(
      (SUM(aa.time_spent_minutes)::DECIMAL / NULLIF(at.grand_total_minutes, 0)) * 100,
      2
    ) as percentage_of_total
  FROM admin_actions aa
  JOIN users u ON aa.admin_id = u.id
  JOIN admin_totals at ON aa.admin_id = at.admin_id
  WHERE aa.created_at BETWEEN p_start_date AND p_end_date
    AND (p_admin_id IS NULL OR aa.admin_id = p_admin_id)
    AND aa.time_spent_minutes > 0
  GROUP BY aa.admin_id, u.full_name, aa.department, aa.task_category, at.grand_total_minutes
  ORDER BY aa.admin_id, total_minutes DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2. Cost center allocation report
CREATE OR REPLACE FUNCTION calculate_cost_center_allocation(
  p_admin_id UUID DEFAULT NULL,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  admin_id UUID,
  admin_name VARCHAR,
  department VARCHAR,
  cost_center_code VARCHAR,
  allocation_percentage DECIMAL(5,2),
  actual_hours_ytd DECIMAL(10,2),
  allocated_hours_ytd DECIMAL(10,2),
  variance_hours DECIMAL(10,2),
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH year_start AS (
    SELECT DATE_TRUNC('year', p_as_of_date)::DATE as start_date
  ),
  actual_time AS (
    SELECT
      aa.admin_id,
      aa.department,
      SUM(aa.time_spent_minutes) / 60.0 as actual_hours
    FROM admin_actions aa
    CROSS JOIN year_start ys
    WHERE aa.created_at >= ys.start_date
      AND aa.created_at <= p_as_of_date
      AND (p_admin_id IS NULL OR aa.admin_id = p_admin_id)
    GROUP BY aa.admin_id, aa.department
  ),
  total_hours AS (
    SELECT
      admin_id,
      SUM(actual_hours) as total_actual_hours
    FROM actual_time
    GROUP BY admin_id
  )
  SELECT
    scc.admin_id,
    u.full_name,
    scc.department,
    scc.cost_center_code,
    scc.allocation_percentage,
    COALESCE(th.total_actual_hours, 0) as actual_hours_ytd,
    ROUND((th.total_actual_hours * scc.allocation_percentage / 100), 2) as allocated_hours_ytd,
    ROUND(
      COALESCE(at.actual_hours, 0) - (th.total_actual_hours * scc.allocation_percentage / 100),
      2
    ) as variance_hours,
    (scc.effective_to IS NULL OR scc.effective_to >= p_as_of_date) as is_active
  FROM staff_cost_centers scc
  JOIN users u ON scc.admin_id = u.id
  LEFT JOIN total_hours th ON scc.admin_id = th.admin_id
  LEFT JOIN actual_time at ON scc.admin_id = at.admin_id AND scc.department = at.department
  WHERE scc.effective_from <= p_as_of_date
    AND (p_admin_id IS NULL OR scc.admin_id = p_admin_id)
  ORDER BY scc.admin_id, scc.department;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Validate cost center allocations don't exceed 100%
CREATE OR REPLACE FUNCTION validate_cost_center_total()
RETURNS TRIGGER AS $$
DECLARE
  v_total_allocation DECIMAL(5,2);
BEGIN
  -- Calculate total allocation for this admin at the effective date
  SELECT COALESCE(SUM(allocation_percentage), 0)
  INTO v_total_allocation
  FROM staff_cost_centers
  WHERE admin_id = NEW.admin_id
    AND effective_from <= NEW.effective_from
    AND (effective_to IS NULL OR effective_to >= NEW.effective_from)
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  -- Add new allocation
  v_total_allocation := v_total_allocation + NEW.allocation_percentage;

  IF v_total_allocation > 100 THEN
    RAISE EXCEPTION 'Total cost center allocation exceeds 100%% for admin. Current total: %%',
      v_total_allocation;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_cost_center_total
  BEFORE INSERT OR UPDATE ON staff_cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION validate_cost_center_total();

-- 4. Staff efficiency metrics
CREATE OR REPLACE FUNCTION calculate_staff_efficiency(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 month',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  admin_id UUID,
  admin_name VARCHAR,
  total_bookings_processed BIGINT,
  avg_processing_time_minutes DECIMAL(5,2),
  total_hours_worked DECIMAL(10,2),
  bookings_per_hour DECIMAL(5,2),
  efficiency_rating VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    aa.admin_id,
    u.full_name,
    COUNT(*) FILTER (WHERE aa.task_category = 'booking_approval') as total_bookings,
    ROUND(
      AVG(aa.time_spent_minutes) FILTER (WHERE aa.task_category = 'booking_approval'),
      2
    ) as avg_processing_time,
    ROUND(SUM(aa.time_spent_minutes) / 60.0, 2) as total_hours,
    ROUND(
      COUNT(*) FILTER (WHERE aa.task_category = 'booking_approval')::DECIMAL /
      NULLIF(SUM(aa.time_spent_minutes) / 60.0, 0),
      2
    ) as bookings_per_hour,
    CASE
      WHEN (COUNT(*) FILTER (WHERE aa.task_category = 'booking_approval')::DECIMAL /
            NULLIF(SUM(aa.time_spent_minutes) / 60.0, 0)) > 10 THEN 'Excellent'
      WHEN (COUNT(*) FILTER (WHERE aa.task_category = 'booking_approval')::DECIMAL /
            NULLIF(SUM(aa.time_spent_minutes) / 60.0, 0)) > 5 THEN 'Good'
      WHEN (COUNT(*) FILTER (WHERE aa.task_category = 'booking_approval')::DECIMAL /
            NULLIF(SUM(aa.time_spent_minutes) / 60.0, 0)) > 2 THEN 'Fair'
      ELSE 'Needs Improvement'
    END as efficiency_rating
  FROM admin_actions aa
  JOIN users u ON aa.admin_id = u.id
  WHERE aa.created_at BETWEEN p_start_date AND p_end_date
    AND aa.time_spent_minutes > 0
  GROUP BY aa.admin_id, u.full_name
  HAVING COUNT(*) FILTER (WHERE aa.task_category = 'booking_approval') > 0
  ORDER BY bookings_per_hour DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- IT SUPPORT TECHNICIAN FUNCTIONS
-- ============================================================================

-- 5. Equipment health dashboard
CREATE OR REPLACE FUNCTION get_equipment_health_status(
  p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  category VARCHAR,
  it_compliance_status VARCHAR,
  days_since_last_audit INTEGER,
  warranty_days_remaining INTEGER,
  open_tickets INTEGER,
  overdue_maintenance INTEGER,
  health_score DECIMAL(5,2),
  health_rating VARCHAR,
  recommended_action TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.product_name,
    e.category,
    e.it_compliance_status,
    COALESCE(EXTRACT(DAY FROM AGE(CURRENT_DATE, e.last_it_audit_date))::INTEGER, 999) as days_since_audit,
    COALESCE(EXTRACT(DAY FROM AGE(e.warranty_expiry, CURRENT_DATE))::INTEGER, 0) as warranty_remaining,
    COALESCE(tickets.open_count, 0)::INTEGER as open_tickets,
    COALESCE(maint.overdue_count, 0)::INTEGER as overdue_maintenance,
    -- Health score calculation (0-100)
    GREATEST(0, LEAST(100,
      100 -
      (CASE WHEN e.it_compliance_status = 'compliant' THEN 0 ELSE 20 END) -
      (CASE WHEN e.last_it_audit_date IS NULL OR AGE(CURRENT_DATE, e.last_it_audit_date) > INTERVAL '6 months' THEN 15 ELSE 0 END) -
      (COALESCE(tickets.open_count, 0) * 10) -
      (COALESCE(maint.overdue_count, 0) * 15) -
      (CASE WHEN e.warranty_expiry < CURRENT_DATE THEN 10 ELSE 0 END)
    )) as health_score,
    CASE
      WHEN GREATEST(0, LEAST(100,
        100 -
        (CASE WHEN e.it_compliance_status = 'compliant' THEN 0 ELSE 20 END) -
        (CASE WHEN e.last_it_audit_date IS NULL OR AGE(CURRENT_DATE, e.last_it_audit_date) > INTERVAL '6 months' THEN 15 ELSE 0 END) -
        (COALESCE(tickets.open_count, 0) * 10) -
        (COALESCE(maint.overdue_count, 0) * 15) -
        (CASE WHEN e.warranty_expiry < CURRENT_DATE THEN 10 ELSE 0 END)
      )) >= 80 THEN 'Excellent'
      WHEN GREATEST(0, LEAST(100,
        100 -
        (CASE WHEN e.it_compliance_status = 'compliant' THEN 0 ELSE 20 END) -
        (CASE WHEN e.last_it_audit_date IS NULL OR AGE(CURRENT_DATE, e.last_it_audit_date) > INTERVAL '6 months' THEN 15 ELSE 0 END) -
        (COALESCE(tickets.open_count, 0) * 10) -
        (COALESCE(maint.overdue_count, 0) * 15) -
        (CASE WHEN e.warranty_expiry < CURRENT_DATE THEN 10 ELSE 0 END)
      )) >= 60 THEN 'Good'
      WHEN GREATEST(0, LEAST(100,
        100 -
        (CASE WHEN e.it_compliance_status = 'compliant' THEN 0 ELSE 20 END) -
        (CASE WHEN e.last_it_audit_date IS NULL OR AGE(CURRENT_DATE, e.last_it_audit_date) > INTERVAL '6 months' THEN 15 ELSE 0 END) -
        (COALESCE(tickets.open_count, 0) * 10) -
        (COALESCE(maint.overdue_count, 0) * 15) -
        (CASE WHEN e.warranty_expiry < CURRENT_DATE THEN 10 ELSE 0 END)
      )) >= 40 THEN 'Fair'
      ELSE 'Critical'
    END as health_rating,
    CASE
      WHEN COALESCE(maint.overdue_count, 0) > 0 THEN 'Complete overdue maintenance'
      WHEN e.it_compliance_status != 'compliant' THEN 'Update to compliance standards'
      WHEN e.last_it_audit_date IS NULL OR AGE(CURRENT_DATE, e.last_it_audit_date) > INTERVAL '6 months'
        THEN 'Schedule IT audit'
      WHEN COALESCE(tickets.open_count, 0) > 0 THEN 'Resolve open tickets'
      WHEN e.warranty_expiry < CURRENT_DATE + INTERVAL '30 days' THEN 'Warranty expiring soon'
      ELSE 'No action required'
    END as recommended_action
  FROM equipment e
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as open_count
    FROM equipment_it_tickets t
    WHERE t.equipment_id = e.id AND t.status IN ('open', 'in_progress')
  ) tickets ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as overdue_count
    FROM maintenance_schedules m
    WHERE m.equipment_id = e.id AND m.status = 'scheduled' AND m.next_due < CURRENT_DATE
  ) maint ON true
  WHERE (p_category IS NULL OR e.category = p_category)
  ORDER BY health_score ASC, e.product_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. IT ticket analytics
CREATE OR REPLACE FUNCTION analyze_it_tickets(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '3 months',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  category VARCHAR,
  total_tickets BIGINT,
  critical_tickets BIGINT,
  avg_resolution_days DECIMAL(5,2),
  total_estimated_cost DECIMAL(10,2),
  total_actual_cost DECIMAL(10,2),
  recurring_issue_type VARCHAR,
  failure_rate DECIMAL(5,2),
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH ticket_stats AS (
    SELECT
      t.equipment_id,
      COUNT(*) as ticket_count,
      COUNT(*) FILTER (WHERE t.priority = 'critical') as critical_count,
      AVG(EXTRACT(DAY FROM AGE(t.resolved_at, t.created_at))) as avg_days,
      SUM(t.estimated_cost) as est_cost,
      SUM(t.actual_cost) as act_cost,
      MODE() WITHIN GROUP (ORDER BY t.issue_type) as common_issue
    FROM equipment_it_tickets t
    WHERE t.created_at BETWEEN p_start_date AND p_end_date
      AND t.status != 'cancelled'
    GROUP BY t.equipment_id
  ),
  equipment_age AS (
    SELECT
      id,
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, purchase_date)) as age_months
    FROM equipment
    WHERE purchase_date IS NOT NULL
  )
  SELECT
    e.id,
    e.product_name,
    e.category,
    COALESCE(ts.ticket_count, 0) as total_tickets,
    COALESCE(ts.critical_count, 0) as critical_tickets,
    ROUND(ts.avg_days, 2) as avg_resolution_days,
    COALESCE(ts.est_cost, 0) as total_estimated_cost,
    COALESCE(ts.act_cost, 0) as total_actual_cost,
    ts.common_issue,
    -- Failure rate: tickets per month of ownership
    ROUND(
      (COALESCE(ts.ticket_count, 0)::DECIMAL / NULLIF(ea.age_months, 0)) * 12,
      2
    ) as failure_rate,
    CASE
      WHEN COALESCE(ts.critical_count, 0) > 3 THEN 'Consider replacement - high critical failures'
      WHEN (COALESCE(ts.ticket_count, 0)::DECIMAL / NULLIF(ea.age_months, 0)) * 12 > 6
        THEN 'High failure rate - investigate root cause'
      WHEN ts.common_issue = 'hardware_failure' THEN 'Check for manufacturing defect or recall'
      WHEN ts.avg_days > 7 THEN 'Review repair workflow - slow resolution'
      ELSE 'Normal operation - continue monitoring'
    END as recommendation
  FROM equipment e
  LEFT JOIN ticket_stats ts ON e.id = ts.equipment_id
  LEFT JOIN equipment_age ea ON e.id = ea.id
  WHERE ts.ticket_count IS NOT NULL
  ORDER BY failure_rate DESC NULLS LAST, total_tickets DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Maintenance schedule auto-generator
CREATE OR REPLACE FUNCTION generate_maintenance_schedules(
  p_equipment_category VARCHAR DEFAULT NULL,
  p_dry_run BOOLEAN DEFAULT true
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  maintenance_type VARCHAR,
  frequency_days INTEGER,
  next_due DATE,
  action_taken TEXT
) AS $$
DECLARE
  v_equipment RECORD;
  v_schedule_id UUID;
BEGIN
  FOR v_equipment IN
    SELECT e.id, e.product_name, e.category
    FROM equipment e
    WHERE e.status IN ('available', 'booked')
      AND (p_equipment_category IS NULL OR e.category = p_equipment_category)
      -- Don't create duplicates
      AND NOT EXISTS (
        SELECT 1 FROM maintenance_schedules ms
        WHERE ms.equipment_id = e.id
          AND ms.status IN ('scheduled', 'in_progress')
      )
  LOOP
    -- Create schedules based on category
    IF NOT p_dry_run THEN
      -- Cleaning schedule (every 90 days for all equipment)
      INSERT INTO maintenance_schedules (
        equipment_id, maintenance_type, frequency_days, next_due, status
      ) VALUES (
        v_equipment.id, 'cleaning', 90, CURRENT_DATE + INTERVAL '90 days', 'scheduled'
      ) RETURNING id INTO v_schedule_id;

      -- Category-specific schedules
      IF v_equipment.category IN ('CAMERAS', 'LENSES') THEN
        INSERT INTO maintenance_schedules (
          equipment_id, maintenance_type, frequency_days, next_due, status
        ) VALUES (
          v_equipment.id, 'calibration', 180, CURRENT_DATE + INTERVAL '180 days', 'scheduled'
        );
      ELSIF v_equipment.category = 'COMPUTERS' THEN
        INSERT INTO maintenance_schedules (
          equipment_id, maintenance_type, frequency_days, next_due, status
        ) VALUES (
          v_equipment.id, 'software_update', 30, CURRENT_DATE + INTERVAL '30 days', 'scheduled'
        );
      END IF;
    END IF;

    RETURN QUERY SELECT
      v_equipment.id,
      v_equipment.product_name,
      'cleaning'::VARCHAR,
      90::INTEGER,
      (CURRENT_DATE + INTERVAL '90 days')::DATE,
      CASE WHEN p_dry_run THEN 'DRY RUN - No changes made' ELSE 'Schedule created' END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR PAYROLL AND IT SUPPORT
-- ============================================================================

-- Payroll monthly summary
CREATE OR REPLACE VIEW payroll_monthly_summary AS
SELECT
  DATE_TRUNC('month', aa.created_at)::DATE as month,
  u.full_name as admin_name,
  u.role,
  aa.department,
  COUNT(*) as total_actions,
  SUM(aa.time_spent_minutes) / 60.0 as total_hours,
  ROUND(SUM(aa.time_spent_minutes) / 60.0 / 160.0 * 100, 2) as percentage_of_fte
FROM admin_actions aa
JOIN users u ON aa.admin_id = u.id
WHERE aa.time_spent_minutes > 0
GROUP BY DATE_TRUNC('month', aa.created_at), u.full_name, u.role, aa.department
ORDER BY month DESC, total_hours DESC;

-- IT maintenance dashboard
CREATE OR REPLACE VIEW it_maintenance_dashboard AS
SELECT
  e.category,
  COUNT(DISTINCT e.id) as total_equipment,
  COUNT(DISTINCT ms.id) FILTER (WHERE ms.status = 'overdue') as overdue_maintenance,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('open', 'in_progress')) as open_tickets,
  COUNT(DISTINCT e.id) FILTER (WHERE e.it_compliance_status != 'compliant') as non_compliant,
  COUNT(DISTINCT e.id) FILTER (WHERE e.warranty_expiry < CURRENT_DATE + INTERVAL '30 days') as warranty_expiring_soon,
  AVG(EXTRACT(DAY FROM AGE(CURRENT_DATE, e.last_it_audit_date))) as avg_days_since_audit
FROM equipment e
LEFT JOIN maintenance_schedules ms ON e.id = ms.equipment_id
LEFT JOIN equipment_it_tickets t ON e.id = t.equipment_id
GROUP BY e.category
ORDER BY overdue_maintenance DESC, open_tickets DESC;

GRANT SELECT ON payroll_monthly_summary TO authenticated;
GRANT SELECT ON it_maintenance_dashboard TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION calculate_staff_workload IS 'Payroll workload allocation by department and task category';
COMMENT ON FUNCTION calculate_cost_center_allocation IS 'Cost center allocation vs actual time spent (with variance)';
COMMENT ON FUNCTION calculate_staff_efficiency IS 'Staff efficiency metrics for performance reviews';
COMMENT ON FUNCTION get_equipment_health_status IS 'IT equipment health dashboard with automated scoring';
COMMENT ON FUNCTION analyze_it_tickets IS 'IT ticket analytics with failure rate and recommendations';
COMMENT ON FUNCTION generate_maintenance_schedules IS 'Auto-generate preventive maintenance schedules by category';

-- ============================================================================
-- PAYROLL AND IT FUNCTIONS COMPLETE
-- ============================================================================
