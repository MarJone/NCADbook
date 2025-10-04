-- ============================================================================
-- NCAD EQUIPMENT BOOKING SYSTEM - FINANCIAL MANAGEMENT FUNCTIONS
-- Part 3: Total Cost of Ownership, Depreciation, and Budget Analytics
-- ============================================================================
-- Implements sophisticated financial tracking for Accounts Officers and
-- Budget Managers with automated calculations and compliance reporting
-- ============================================================================

-- ============================================================================
-- 1. DEPRECIATION CALCULATION (Straight-Line Method)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_equipment_depreciation(
  p_equipment_id UUID,
  p_as_of_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  equipment_id UUID,
  purchase_cost DECIMAL(10,2),
  purchase_date DATE,
  useful_life_years INTEGER,
  salvage_value DECIMAL(10,2),
  annual_depreciation DECIMAL(10,2),
  accumulated_depreciation DECIMAL(10,2),
  current_book_value DECIMAL(10,2),
  months_depreciated INTEGER,
  is_fully_depreciated BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.purchase_cost,
    e.purchase_date,
    e.useful_life_years,
    e.salvage_value,
    -- Annual depreciation = (Cost - Salvage) / Useful Life
    ROUND((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0), 2) as annual_depreciation,
    -- Accumulated = (Annual / 12) * Months Elapsed, capped at (Cost - Salvage)
    LEAST(
      ROUND(
        ((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0) / 12) *
        EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date)),
        2
      ),
      e.purchase_cost - COALESCE(e.salvage_value, 0)
    ) as accumulated_depreciation,
    -- Book Value = Cost - Accumulated Depreciation
    GREATEST(
      e.purchase_cost - LEAST(
        ROUND(
          ((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0) / 12) *
          EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date)),
          2
        ),
        e.purchase_cost - COALESCE(e.salvage_value, 0)
      ),
      COALESCE(e.salvage_value, 0)
    ) as current_book_value,
    EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date))::INTEGER as months_depreciated,
    -- Fully depreciated if book value = salvage value
    (
      GREATEST(
        e.purchase_cost - LEAST(
          ROUND(
            ((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0) / 12) *
            EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date)),
            2
          ),
          e.purchase_cost - COALESCE(e.salvage_value, 0)
        ),
        COALESCE(e.salvage_value, 0)
      ) = COALESCE(e.salvage_value, 0)
    ) as is_fully_depreciated
  FROM equipment e
  WHERE e.id = p_equipment_id
    AND e.purchase_date IS NOT NULL
    AND e.purchase_cost IS NOT NULL
    AND e.purchase_date <= p_as_of_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Bulk depreciation for all equipment
CREATE OR REPLACE FUNCTION calculate_all_depreciation(
  p_as_of_date DATE DEFAULT CURRENT_DATE,
  p_category VARCHAR DEFAULT NULL,
  p_department VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  category VARCHAR,
  purchase_cost DECIMAL(10,2),
  accumulated_depreciation DECIMAL(10,2),
  current_book_value DECIMAL(10,2),
  is_fully_depreciated BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.product_name,
    e.category,
    e.purchase_cost,
    LEAST(
      ROUND(
        ((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0) / 12) *
        EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date)),
        2
      ),
      e.purchase_cost - COALESCE(e.salvage_value, 0)
    ) as accumulated_depreciation,
    GREATEST(
      e.purchase_cost - LEAST(
        ROUND(
          ((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0) / 12) *
          EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date)),
          2
        ),
        e.purchase_cost - COALESCE(e.salvage_value, 0)
      ),
      COALESCE(e.salvage_value, 0)
    ) as current_book_value,
    (
      GREATEST(
        e.purchase_cost - LEAST(
          ROUND(
            ((e.purchase_cost - COALESCE(e.salvage_value, 0)) / NULLIF(e.useful_life_years, 0) / 12) *
            EXTRACT(MONTH FROM AGE(p_as_of_date, e.purchase_date)),
            2
          ),
          e.purchase_cost - COALESCE(e.salvage_value, 0)
        ),
        COALESCE(e.salvage_value, 0)
      ) = COALESCE(e.salvage_value, 0)
    ) as is_fully_depreciated
  FROM equipment e
  WHERE e.purchase_date IS NOT NULL
    AND e.purchase_cost IS NOT NULL
    AND e.purchase_date <= p_as_of_date
    AND (p_category IS NULL OR e.category = p_category)
  ORDER BY e.category, e.product_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 2. TOTAL COST OF OWNERSHIP (TCO) CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_equipment_tco(
  p_equipment_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  purchase_cost DECIMAL(10,2),
  total_repair_costs DECIMAL(10,2),
  total_maintenance_costs DECIMAL(10,2),
  total_supply_costs DECIMAL(10,2),
  total_other_costs DECIMAL(10,2),
  total_all_costs DECIMAL(10,2),
  total_cost_of_ownership DECIMAL(10,2),
  ownership_months INTEGER,
  monthly_tco DECIMAL(10,2)
) AS $$
DECLARE
  v_start_date DATE;
BEGIN
  -- If no start date, use purchase date
  SELECT COALESCE(p_start_date, e.purchase_date)
  INTO v_start_date
  FROM equipment e
  WHERE e.id = p_equipment_id;

  RETURN QUERY
  SELECT
    e.id,
    e.product_name,
    e.purchase_cost,
    COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type = 'repair'), 0) as total_repair_costs,
    COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type = 'maintenance'), 0) as total_maintenance_costs,
    COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type = 'supplies'), 0) as total_supply_costs,
    COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type IN ('insurance', 'licensing', 'upgrade', 'other')), 0) as total_other_costs,
    COALESCE(SUM(ec.amount), 0) as total_all_costs,
    COALESCE(e.purchase_cost, 0) + COALESCE(SUM(ec.amount), 0) as total_cost_of_ownership,
    EXTRACT(MONTH FROM AGE(p_end_date, v_start_date))::INTEGER as ownership_months,
    ROUND(
      (COALESCE(e.purchase_cost, 0) + COALESCE(SUM(ec.amount), 0)) /
      NULLIF(EXTRACT(MONTH FROM AGE(p_end_date, v_start_date)), 0),
      2
    ) as monthly_tco
  FROM equipment e
  LEFT JOIN equipment_costs ec ON e.id = ec.equipment_id
    AND ec.cost_date BETWEEN v_start_date AND p_end_date
  WHERE e.id = p_equipment_id
  GROUP BY e.id, e.product_name, e.purchase_cost;
END;
$$ LANGUAGE plpgsql STABLE;

-- TCO by category or department
CREATE OR REPLACE FUNCTION calculate_tco_summary(
  p_group_by VARCHAR DEFAULT 'category', -- 'category' or 'department'
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  group_name VARCHAR,
  equipment_count BIGINT,
  total_purchase_cost DECIMAL(10,2),
  total_operating_costs DECIMAL(10,2),
  total_tco DECIMAL(10,2),
  avg_tco_per_item DECIMAL(10,2)
) AS $$
BEGIN
  IF p_group_by = 'category' THEN
    RETURN QUERY
    SELECT
      e.category,
      COUNT(e.id) as equipment_count,
      COALESCE(SUM(e.purchase_cost), 0) as total_purchase_cost,
      COALESCE(SUM(costs.total_costs), 0) as total_operating_costs,
      COALESCE(SUM(e.purchase_cost), 0) + COALESCE(SUM(costs.total_costs), 0) as total_tco,
      ROUND(
        (COALESCE(SUM(e.purchase_cost), 0) + COALESCE(SUM(costs.total_costs), 0)) / NULLIF(COUNT(e.id), 0),
        2
      ) as avg_tco_per_item
    FROM equipment e
    LEFT JOIN (
      SELECT equipment_id, SUM(amount) as total_costs
      FROM equipment_costs
      WHERE (p_start_date IS NULL OR cost_date >= p_start_date)
        AND cost_date <= p_end_date
      GROUP BY equipment_id
    ) costs ON e.id = costs.equipment_id
    WHERE e.purchase_cost IS NOT NULL
    GROUP BY e.category
    ORDER BY total_tco DESC;
  ELSE
    -- Group by department would require tracking which department "owns" equipment
    -- This would come from equipment_costs.paid_by_department or similar
    RAISE EXCEPTION 'Department grouping not yet implemented';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 3. EQUIPMENT UTILIZATION METRICS (For ROI Calculation)
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_equipment_utilization(
  p_equipment_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 year',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  total_days_in_period INTEGER,
  total_booked_days INTEGER,
  utilization_percentage DECIMAL(5,2),
  total_bookings BIGINT,
  unique_users BIGINT,
  avg_booking_duration DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH booking_stats AS (
    SELECT
      b.id,
      b.student_id,
      -- Calculate actual booked days (end_date - start_date + 1)
      (b.end_date - b.start_date + 1) as booking_days
    FROM bookings b
    WHERE p_equipment_id = ANY(b.equipment_ids)
      AND b.status IN ('approved', 'completed')
      AND b.start_date <= p_end_date
      AND b.end_date >= p_start_date
  )
  SELECT
    e.id,
    e.product_name,
    (p_end_date - p_start_date + 1)::INTEGER as total_days_in_period,
    COALESCE(SUM(bs.booking_days), 0)::INTEGER as total_booked_days,
    ROUND(
      (COALESCE(SUM(bs.booking_days), 0)::DECIMAL / NULLIF((p_end_date - p_start_date + 1), 0)) * 100,
      2
    ) as utilization_percentage,
    COUNT(bs.id) as total_bookings,
    COUNT(DISTINCT bs.student_id) as unique_users,
    ROUND(AVG(bs.booking_days), 2) as avg_booking_duration
  FROM equipment e
  LEFT JOIN booking_stats bs ON TRUE
  WHERE e.id = p_equipment_id
  GROUP BY e.id, e.product_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 4. EQUIPMENT ROI CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_equipment_roi(
  p_equipment_id UUID,
  p_market_rental_rate DECIMAL(10,2) DEFAULT 50.00, -- Default €50/day
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  total_cost_of_ownership DECIMAL(10,2),
  total_booked_days INTEGER,
  estimated_rental_value DECIMAL(10,2),
  roi_amount DECIMAL(10,2),
  roi_percentage DECIMAL(10,2),
  roi_category VARCHAR
) AS $$
DECLARE
  v_start_date DATE;
BEGIN
  -- Use purchase date if no start date provided
  SELECT COALESCE(p_start_date, e.purchase_date)
  INTO v_start_date
  FROM equipment e
  WHERE e.id = p_equipment_id;

  RETURN QUERY
  WITH tco_data AS (
    SELECT * FROM calculate_equipment_tco(p_equipment_id, v_start_date, p_end_date)
  ),
  utilization_data AS (
    SELECT * FROM calculate_equipment_utilization(p_equipment_id, v_start_date, p_end_date)
  )
  SELECT
    p_equipment_id,
    tco.product_name,
    tco.total_cost_of_ownership,
    util.total_booked_days,
    ROUND(util.total_booked_days * p_market_rental_rate, 2) as estimated_rental_value,
    ROUND((util.total_booked_days * p_market_rental_rate) - tco.total_cost_of_ownership, 2) as roi_amount,
    ROUND(
      ((util.total_booked_days * p_market_rental_rate - tco.total_cost_of_ownership) /
      NULLIF(tco.total_cost_of_ownership, 0)) * 100,
      2
    ) as roi_percentage,
    CASE
      WHEN ((util.total_booked_days * p_market_rental_rate - tco.total_cost_of_ownership) /
            NULLIF(tco.total_cost_of_ownership, 0)) * 100 > 200 THEN 'Excellent'
      WHEN ((util.total_booked_days * p_market_rental_rate - tco.total_cost_of_ownership) /
            NULLIF(tco.total_cost_of_ownership, 0)) * 100 > 100 THEN 'Good'
      WHEN ((util.total_booked_days * p_market_rental_rate - tco.total_cost_of_ownership) /
            NULLIF(tco.total_cost_of_ownership, 0)) * 100 > 0 THEN 'Fair'
      ELSE 'Poor'
    END as roi_category
  FROM tco_data tco
  CROSS JOIN utilization_data util;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 5. REPLACEMENT PRIORITY MATRIX
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_replacement_priority(
  p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  category VARCHAR,
  age_years DECIMAL(5,2),
  age_score DECIMAL(5,2),
  repair_cost_ratio DECIMAL(5,2),
  repair_score DECIMAL(5,2),
  utilization_percentage DECIMAL(5,2),
  demand_score DECIMAL(5,2),
  condition_score DECIMAL(5,2),
  total_priority_score DECIMAL(5,2),
  priority_rank INTEGER,
  recommendation VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH equipment_metrics AS (
    SELECT
      e.id,
      e.product_name,
      e.category,
      e.purchase_date,
      e.purchase_cost,
      -- Age calculation
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.purchase_date))::DECIMAL as age_years,
      -- Repair costs
      COALESCE(SUM(ec.amount) FILTER (WHERE ec.cost_type = 'repair'), 0) as total_repair_costs,
      -- Utilization from last year
      (SELECT utilization_percentage
       FROM calculate_equipment_utilization(e.id, CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE)
      ) as utilization_pct,
      -- Average condition from recent notes (if available)
      5.0 as avg_condition -- Placeholder, would calculate from equipment_notes if condition tracked
    FROM equipment e
    LEFT JOIN equipment_costs ec ON e.id = ec.equipment_id
    WHERE e.purchase_date IS NOT NULL
      AND e.purchase_cost IS NOT NULL
      AND (p_category IS NULL OR e.category = p_category)
      AND e.status != 'out_of_service'
    GROUP BY e.id, e.product_name, e.category, e.purchase_date, e.purchase_cost
  ),
  scored_equipment AS (
    SELECT
      em.*,
      -- Age Score: 0-10 (older = higher score, max 10 at 10+ years)
      LEAST(em.age_years, 10) as age_score,
      -- Repair Cost Ratio: repair costs / purchase cost
      ROUND((em.total_repair_costs / NULLIF(em.purchase_cost, 0)) * 100, 2) as repair_ratio,
      -- Repair Score: 0-10 (higher ratio = higher score, cap at 100%)
      LEAST((em.total_repair_costs / NULLIF(em.purchase_cost, 0)) * 10, 10) as repair_score,
      -- Demand Score: Based on utilization (higher = higher priority)
      -- Inverted: high demand = needs replacement to avoid bottleneck
      CASE
        WHEN em.utilization_pct > 75 THEN 10
        WHEN em.utilization_pct > 50 THEN 7
        WHEN em.utilization_pct > 25 THEN 5
        ELSE 3
      END as demand_score,
      -- Condition Score: 10 - avg_condition (lower condition = higher score)
      10 - em.avg_condition as condition_score
    FROM equipment_metrics em
  )
  SELECT
    se.id,
    se.product_name,
    se.category,
    se.age_years,
    se.age_score,
    se.repair_ratio,
    se.repair_score,
    se.utilization_pct,
    se.demand_score,
    se.condition_score,
    -- Total Priority Score (weighted average)
    ROUND(
      (se.age_score * 0.25) +          -- 25% weight on age
      (se.repair_score * 0.35) +       -- 35% weight on repair costs
      (se.demand_score * 0.25) +       -- 25% weight on demand
      (se.condition_score * 0.15),     -- 15% weight on condition
      2
    ) as total_priority_score,
    RANK() OVER (ORDER BY
      (se.age_score * 0.25) +
      (se.repair_score * 0.35) +
      (se.demand_score * 0.25) +
      (se.condition_score * 0.15) DESC
    ) as priority_rank,
    CASE
      WHEN (se.age_score * 0.25) + (se.repair_score * 0.35) + (se.demand_score * 0.25) + (se.condition_score * 0.15) > 7.5
        THEN 'Replace Immediately'
      WHEN (se.age_score * 0.25) + (se.repair_score * 0.35) + (se.demand_score * 0.25) + (se.condition_score * 0.15) > 5.0
        THEN 'Budget for Next Fiscal Year'
      WHEN (se.age_score * 0.25) + (se.repair_score * 0.35) + (se.demand_score * 0.25) + (se.condition_score * 0.15) > 3.0
        THEN 'Monitor for 12-24 Months'
      ELSE 'No Action Required'
    END as recommendation
  FROM scored_equipment se
  ORDER BY total_priority_score DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 6. BUDGET FORECASTING
-- ============================================================================

CREATE OR REPLACE FUNCTION forecast_equipment_budget(
  p_forecast_years INTEGER DEFAULT 3,
  p_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  fiscal_year INTEGER,
  forecasted_replacements BIGINT,
  estimated_replacement_cost DECIMAL(10,2),
  forecasted_maintenance_cost DECIMAL(10,2),
  forecasted_repair_cost DECIMAL(10,2),
  total_forecasted_cost DECIMAL(10,2)
) AS $$
DECLARE
  v_current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  RETURN QUERY
  WITH replacement_forecast AS (
    -- Equipment reaching end of useful life
    SELECT
      v_current_year + generate_series(1, p_forecast_years) as year,
      COUNT(*) as replacement_count,
      SUM(e.purchase_cost * 1.1) as estimated_cost -- Assume 10% inflation
    FROM equipment e
    WHERE e.purchase_date IS NOT NULL
      AND e.useful_life_years IS NOT NULL
      AND (p_category IS NULL OR e.category = p_category)
      AND EXTRACT(YEAR FROM (e.purchase_date + (e.useful_life_years || ' years')::INTERVAL))
          BETWEEN v_current_year + 1 AND v_current_year + p_forecast_years
    GROUP BY year
  ),
  historical_costs AS (
    -- Historical average maintenance and repair costs
    SELECT
      AVG(yearly_maintenance) as avg_maintenance,
      AVG(yearly_repair) as avg_repair
    FROM (
      SELECT
        EXTRACT(YEAR FROM ec.cost_date) as year,
        SUM(ec.amount) FILTER (WHERE ec.cost_type = 'maintenance') as yearly_maintenance,
        SUM(ec.amount) FILTER (WHERE ec.cost_type = 'repair') as yearly_repair
      FROM equipment_costs ec
      JOIN equipment e ON ec.equipment_id = e.id
      WHERE ec.cost_date >= CURRENT_DATE - INTERVAL '3 years'
        AND (p_category IS NULL OR e.category = p_category)
      GROUP BY year
    ) yearly_costs
  )
  SELECT
    (v_current_year + generate_series(1, p_forecast_years))::INTEGER as fiscal_year,
    COALESCE(rf.replacement_count, 0) as forecasted_replacements,
    COALESCE(rf.estimated_cost, 0) as estimated_replacement_cost,
    ROUND(hc.avg_maintenance * 1.03 * generate_series(1, p_forecast_years), 2) as forecasted_maintenance_cost, -- 3% inflation
    ROUND(hc.avg_repair * 1.03 * generate_series(1, p_forecast_years), 2) as forecasted_repair_cost,
    COALESCE(rf.estimated_cost, 0) +
    ROUND(hc.avg_maintenance * 1.03 * generate_series(1, p_forecast_years), 2) +
    ROUND(hc.avg_repair * 1.03 * generate_series(1, p_forecast_years), 2) as total_forecasted_cost
  FROM historical_costs hc
  LEFT JOIN replacement_forecast rf ON rf.year = v_current_year + generate_series(1, p_forecast_years);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 7. CROSS-DEPARTMENT SHARING OPTIMIZER
-- ============================================================================

CREATE OR REPLACE FUNCTION identify_sharing_opportunities()
RETURNS TABLE (
  equipment_id UUID,
  product_name VARCHAR,
  owning_department VARCHAR,
  current_utilization DECIMAL(5,2),
  potential_shared_departments TEXT[],
  estimated_cost_savings DECIMAL(10,2),
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH equipment_utilization AS (
    SELECT
      e.id,
      e.product_name,
      e.category,
      (SELECT utilization_percentage
       FROM calculate_equipment_utilization(e.id, CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE)
      ) as utilization_pct,
      e.purchase_cost
    FROM equipment e
    WHERE e.status = 'available'
      AND e.purchase_date IS NOT NULL
  ),
  underutilized AS (
    SELECT *
    FROM equipment_utilization
    WHERE utilization_pct < 50 -- Less than 50% utilized
  )
  SELECT
    u.id,
    u.product_name,
    'UNKNOWN'::VARCHAR as owning_department, -- Would need department tracking
    u.utilization_pct,
    ARRAY['COMMUNICATION_DESIGN', 'PRODUCT_DESIGN']::TEXT[] as potential_departments,
    ROUND(u.purchase_cost * 0.3, 2) as estimated_savings, -- Estimate 30% of purchase cost
    CASE
      WHEN u.utilization_pct < 25 THEN 'High priority for sharing - very low utilization'
      WHEN u.utilization_pct < 50 THEN 'Good candidate for sharing - moderate utilization'
      ELSE 'Monitor for sharing potential'
    END as recommendation
  FROM underutilized u
  ORDER BY u.utilization_pct ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 8. FINANCIAL REPORTING VIEWS (For Accounts Officers)
-- ============================================================================

-- Monthly financial summary
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT
  DATE_TRUNC('month', ec.cost_date) as month,
  ec.cost_type,
  e.category,
  COUNT(DISTINCT ec.equipment_id) as equipment_count,
  COUNT(*) as transaction_count,
  SUM(ec.amount) as total_amount,
  AVG(ec.amount) as avg_transaction
FROM equipment_costs ec
JOIN equipment e ON ec.equipment_id = e.id
GROUP BY DATE_TRUNC('month', ec.cost_date), ec.cost_type, e.category
ORDER BY month DESC, total_amount DESC;

-- Equipment balance sheet
CREATE OR REPLACE VIEW equipment_balance_sheet AS
SELECT
  e.id,
  e.product_name,
  e.category,
  e.purchase_date,
  e.purchase_cost as original_cost,
  dep.accumulated_depreciation,
  dep.current_book_value,
  COALESCE(costs.total_operating_costs, 0) as total_operating_costs,
  e.purchase_cost + COALESCE(costs.total_operating_costs, 0) as total_cost_of_ownership
FROM equipment e
LEFT JOIN LATERAL (
  SELECT * FROM calculate_equipment_depreciation(e.id)
) dep ON true
LEFT JOIN LATERAL (
  SELECT total_all_costs as total_operating_costs
  FROM calculate_equipment_tco(e.id)
) costs ON true
WHERE e.purchase_date IS NOT NULL
ORDER BY e.category, e.product_name;

-- Grant access to financial views
GRANT SELECT ON monthly_financial_summary TO authenticated;
GRANT SELECT ON equipment_balance_sheet TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION calculate_equipment_depreciation IS 'Calculate straight-line depreciation for equipment (GAAP compliant)';
COMMENT ON FUNCTION calculate_equipment_tco IS 'Total Cost of Ownership = Purchase + all operating costs over time';
COMMENT ON FUNCTION calculate_equipment_roi IS 'Return on Investment based on utilization vs market rental rates';
COMMENT ON FUNCTION calculate_replacement_priority IS 'Weighted scoring matrix for replacement prioritization';
COMMENT ON FUNCTION forecast_equipment_budget IS 'Multi-year budget forecast based on lifecycle and historical costs';
COMMENT ON FUNCTION identify_sharing_opportunities IS 'Find underutilized equipment for cross-department sharing';

-- ============================================================================
-- FINANCIAL FUNCTIONS COMPLETE
-- ============================================================================
-- Next: 04-payroll-tracking.sql for time tracking and cost center functions
-- ============================================================================
