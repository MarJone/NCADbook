-- Policy Enforcement System
-- Configurable rules for borrowing limits, training requirements, and concurrent reservations

-- Policy Rules Table
CREATE TABLE IF NOT EXISTS policy_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL, -- 'weekly_limit', 'concurrent_limit', 'training_required', 'blackout_period'
    rule_name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Scope
    applies_to_role VARCHAR(50), -- 'student', 'staff', 'department_admin', 'master_admin', NULL = all
    applies_to_department VARCHAR(100), -- Specific department or NULL = all
    applies_to_equipment_category VARCHAR(100), -- Equipment category or NULL = all
    applies_to_equipment_id INTEGER REFERENCES equipment(id), -- Specific equipment or NULL = all

    -- Rule configuration (JSONB for flexibility)
    rule_config JSONB NOT NULL DEFAULT '{}',
    -- Examples:
    -- weekly_limit: {"max_bookings": 3, "per_days": 7}
    -- concurrent_limit: {"max_concurrent": 2}
    -- training_required: {"training_id": "camera-101", "certificate_required": true}
    -- blackout_period: {"start_date": "2025-01-15", "end_date": "2025-01-20", "reason": "Exam period"}

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100, -- Lower number = higher priority

    -- Exemptions
    exempted_users INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- User IDs exempt from this rule

    -- Metadata
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_rule UNIQUE (rule_type, rule_name)
);

-- Training Records Table
CREATE TABLE IF NOT EXISTS training_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_id VARCHAR(100) NOT NULL, -- 'camera-101', 'lighting-advanced', etc.
    training_name VARCHAR(200) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- NULL = never expires
    certificate_url TEXT,
    verified_by INTEGER REFERENCES users(id),
    notes TEXT,

    CONSTRAINT unique_user_training UNIQUE (user_id, training_id)
);

-- Policy Violations Log
CREATE TABLE IF NOT EXISTS policy_violations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_rule_id INTEGER REFERENCES policy_rules(id) ON DELETE SET NULL,
    violation_type VARCHAR(50) NOT NULL,
    violation_details JSONB NOT NULL DEFAULT '{}',
    attempted_booking_details JSONB,
    blocked BOOLEAN DEFAULT TRUE, -- Whether booking was blocked
    override_by INTEGER REFERENCES users(id), -- Admin who overrode the policy
    override_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_policy_rules_type ON policy_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_policy_rules_active ON policy_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_policy_rules_role ON policy_rules(applies_to_role);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_training_records_training_id ON training_records(training_id);
CREATE INDEX IF NOT EXISTS idx_policy_violations_user ON policy_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_policy_violations_created ON policy_violations(created_at);

-- Function to check weekly booking limit
CREATE OR REPLACE FUNCTION check_weekly_limit(
    p_user_id INTEGER,
    p_equipment_id INTEGER DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL
) RETURNS TABLE(
    allowed BOOLEAN,
    current_count INTEGER,
    limit_count INTEGER,
    rule_name VARCHAR
) AS $$
DECLARE
    v_rule RECORD;
    v_current_bookings INTEGER;
    v_max_bookings INTEGER;
    v_days INTEGER;
BEGIN
    -- Get applicable weekly limit rules (most specific first)
    FOR v_rule IN
        SELECT pr.*, u.role, u.department
        FROM policy_rules pr
        LEFT JOIN users u ON u.id = p_user_id
        WHERE pr.rule_type = 'weekly_limit'
        AND pr.is_active = TRUE
        AND (pr.applies_to_role IS NULL OR pr.applies_to_role = u.role)
        AND (pr.applies_to_department IS NULL OR pr.applies_to_department = u.department)
        AND (pr.applies_to_equipment_id IS NULL OR pr.applies_to_equipment_id = p_equipment_id)
        AND (pr.applies_to_equipment_category IS NULL OR pr.applies_to_equipment_category = p_category)
        AND (p_user_id = ANY(pr.exempted_users) IS NOT TRUE)
        ORDER BY pr.priority ASC, pr.id DESC
        LIMIT 1
    LOOP
        -- Extract rule config
        v_max_bookings := (v_rule.rule_config->>'max_bookings')::INTEGER;
        v_days := COALESCE((v_rule.rule_config->>'per_days')::INTEGER, 7);

        -- Count bookings in the time window
        SELECT COUNT(*)
        INTO v_current_bookings
        FROM bookings b
        WHERE b.user_id = p_user_id
        AND b.status IN ('pending', 'approved', 'collected')
        AND b.created_at > (CURRENT_TIMESTAMP - (v_days || ' days')::INTERVAL)
        AND (p_equipment_id IS NULL OR b.equipment_id = p_equipment_id)
        AND (p_category IS NULL OR EXISTS (
            SELECT 1 FROM equipment e
            WHERE e.id = b.equipment_id AND e.category = p_category
        ));

        -- Return result
        RETURN QUERY SELECT
            (v_current_bookings < v_max_bookings)::BOOLEAN,
            v_current_bookings,
            v_max_bookings,
            v_rule.rule_name;
        RETURN;
    END LOOP;

    -- No rule found = unlimited
    RETURN QUERY SELECT TRUE, 0, 999999, 'No limit applied'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function to check concurrent booking limit
CREATE OR REPLACE FUNCTION check_concurrent_limit(
    p_user_id INTEGER,
    p_equipment_id INTEGER DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL
) RETURNS TABLE(
    allowed BOOLEAN,
    current_count INTEGER,
    limit_count INTEGER,
    rule_name VARCHAR
) AS $$
DECLARE
    v_rule RECORD;
    v_current_concurrent INTEGER;
    v_max_concurrent INTEGER;
BEGIN
    -- Get applicable concurrent limit rules
    FOR v_rule IN
        SELECT pr.*, u.role, u.department
        FROM policy_rules pr
        LEFT JOIN users u ON u.id = p_user_id
        WHERE pr.rule_type = 'concurrent_limit'
        AND pr.is_active = TRUE
        AND (pr.applies_to_role IS NULL OR pr.applies_to_role = u.role)
        AND (pr.applies_to_department IS NULL OR pr.applies_to_department = u.department)
        AND (pr.applies_to_equipment_id IS NULL OR pr.applies_to_equipment_id = p_equipment_id)
        AND (pr.applies_to_equipment_category IS NULL OR pr.applies_to_equipment_category = p_category)
        AND (p_user_id = ANY(pr.exempted_users) IS NOT TRUE)
        ORDER BY pr.priority ASC, pr.id DESC
        LIMIT 1
    LOOP
        v_max_concurrent := (v_rule.rule_config->>'max_concurrent')::INTEGER;

        -- Count active bookings (overlapping with current time or future)
        SELECT COUNT(*)
        INTO v_current_concurrent
        FROM bookings b
        WHERE b.user_id = p_user_id
        AND b.status IN ('approved', 'collected')
        AND b.return_date > CURRENT_TIMESTAMP
        AND (p_equipment_id IS NULL OR b.equipment_id = p_equipment_id)
        AND (p_category IS NULL OR EXISTS (
            SELECT 1 FROM equipment e
            WHERE e.id = b.equipment_id AND e.category = p_category
        ));

        RETURN QUERY SELECT
            (v_current_concurrent < v_max_concurrent)::BOOLEAN,
            v_current_concurrent,
            v_max_concurrent,
            v_rule.rule_name;
        RETURN;
    END LOOP;

    -- No rule = unlimited
    RETURN QUERY SELECT TRUE, 0, 999999, 'No limit applied'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- Function to check training requirements
CREATE OR REPLACE FUNCTION check_training_requirement(
    p_user_id INTEGER,
    p_equipment_id INTEGER DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL
) RETURNS TABLE(
    allowed BOOLEAN,
    required_training_id VARCHAR,
    required_training_name VARCHAR,
    has_training BOOLEAN,
    training_expired BOOLEAN
) AS $$
DECLARE
    v_rule RECORD;
    v_training RECORD;
    v_required_training_id VARCHAR;
BEGIN
    -- Get applicable training requirement rules
    FOR v_rule IN
        SELECT pr.*, u.role, u.department
        FROM policy_rules pr
        LEFT JOIN users u ON u.id = p_user_id
        WHERE pr.rule_type = 'training_required'
        AND pr.is_active = TRUE
        AND (pr.applies_to_role IS NULL OR pr.applies_to_role = u.role)
        AND (pr.applies_to_department IS NULL OR pr.applies_to_department = u.department)
        AND (pr.applies_to_equipment_id IS NULL OR pr.applies_to_equipment_id = p_equipment_id)
        AND (pr.applies_to_equipment_category IS NULL OR pr.applies_to_equipment_category = p_category)
        AND (p_user_id = ANY(pr.exempted_users) IS NOT TRUE)
        ORDER BY pr.priority ASC, pr.id DESC
        LIMIT 1
    LOOP
        v_required_training_id := v_rule.rule_config->>'training_id';

        -- Check if user has this training
        SELECT *
        INTO v_training
        FROM training_records tr
        WHERE tr.user_id = p_user_id
        AND tr.training_id = v_required_training_id
        AND (tr.expires_at IS NULL OR tr.expires_at > CURRENT_TIMESTAMP);

        IF v_training IS NULL THEN
            -- Check if training exists but expired
            SELECT *
            INTO v_training
            FROM training_records tr
            WHERE tr.user_id = p_user_id
            AND tr.training_id = v_required_training_id
            AND tr.expires_at < CURRENT_TIMESTAMP;

            IF v_training IS NULL THEN
                -- No training record at all
                RETURN QUERY SELECT
                    FALSE,
                    v_required_training_id,
                    (v_rule.rule_config->>'training_name')::VARCHAR,
                    FALSE,
                    FALSE;
            ELSE
                -- Training expired
                RETURN QUERY SELECT
                    FALSE,
                    v_required_training_id,
                    v_training.training_name,
                    TRUE,
                    TRUE;
            END IF;
        ELSE
            -- Training valid
            RETURN QUERY SELECT
                TRUE,
                v_required_training_id,
                v_training.training_name,
                TRUE,
                FALSE;
        END IF;
        RETURN;
    END LOOP;

    -- No training requirement
    RETURN QUERY SELECT TRUE, NULL::VARCHAR, NULL::VARCHAR, TRUE, FALSE;
END;
$$ LANGUAGE plpgsql;

-- Comprehensive validation function for new bookings
CREATE OR REPLACE FUNCTION validate_booking_policies(
    p_user_id INTEGER,
    p_equipment_id INTEGER,
    p_pickup_date TIMESTAMP,
    p_return_date TIMESTAMP
) RETURNS TABLE(
    is_valid BOOLEAN,
    violation_type VARCHAR,
    violation_message TEXT,
    violation_details JSONB
) AS $$
DECLARE
    v_weekly_check RECORD;
    v_concurrent_check RECORD;
    v_training_check RECORD;
    v_equipment RECORD;
BEGIN
    -- Get equipment details
    SELECT * INTO v_equipment FROM equipment WHERE id = p_equipment_id;

    -- Check weekly limit
    SELECT * INTO v_weekly_check
    FROM check_weekly_limit(p_user_id, p_equipment_id, v_equipment.category)
    LIMIT 1;

    IF NOT v_weekly_check.allowed THEN
        RETURN QUERY SELECT
            FALSE,
            'weekly_limit_exceeded'::VARCHAR,
            format('You have reached your weekly booking limit. Current: %s/%s bookings. Rule: %s',
                v_weekly_check.current_count,
                v_weekly_check.limit_count,
                v_weekly_check.rule_name),
            jsonb_build_object(
                'current_count', v_weekly_check.current_count,
                'limit_count', v_weekly_check.limit_count,
                'rule_name', v_weekly_check.rule_name
            );
        RETURN;
    END IF;

    -- Check concurrent limit
    SELECT * INTO v_concurrent_check
    FROM check_concurrent_limit(p_user_id, p_equipment_id, v_equipment.category)
    LIMIT 1;

    IF NOT v_concurrent_check.allowed THEN
        RETURN QUERY SELECT
            FALSE,
            'concurrent_limit_exceeded'::VARCHAR,
            format('You have reached your concurrent booking limit. Current: %s/%s active bookings. Rule: %s',
                v_concurrent_check.current_count,
                v_concurrent_check.limit_count,
                v_concurrent_check.rule_name),
            jsonb_build_object(
                'current_count', v_concurrent_check.current_count,
                'limit_count', v_concurrent_check.limit_count,
                'rule_name', v_concurrent_check.rule_name
            );
        RETURN;
    END IF;

    -- Check training requirement
    SELECT * INTO v_training_check
    FROM check_training_requirement(p_user_id, p_equipment_id, v_equipment.category)
    LIMIT 1;

    IF NOT v_training_check.allowed THEN
        IF v_training_check.training_expired THEN
            RETURN QUERY SELECT
                FALSE,
                'training_expired'::VARCHAR,
                format('Your training certification has expired. Required training: %s. Please renew your certification.',
                    v_training_check.required_training_name),
                jsonb_build_object(
                    'required_training_id', v_training_check.required_training_id,
                    'required_training_name', v_training_check.required_training_name,
                    'has_training', TRUE,
                    'expired', TRUE
                );
        ELSE
            RETURN QUERY SELECT
                FALSE,
                'training_required'::VARCHAR,
                format('Training required for this equipment. Required training: %s. Please complete the training before booking.',
                    v_training_check.required_training_name),
                jsonb_build_object(
                    'required_training_id', v_training_check.required_training_id,
                    'required_training_name', v_training_check.required_training_name,
                    'has_training', FALSE
                );
        END IF;
        RETURN;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT TRUE, NULL::VARCHAR, NULL::TEXT, NULL::JSONB;
END;
$$ LANGUAGE plpgsql;

-- Insert default policy rules
INSERT INTO policy_rules (rule_type, rule_name, description, applies_to_role, rule_config, priority) VALUES
('weekly_limit', 'Student Weekly Limit', 'Students can book up to 3 items per week', 'student', '{"max_bookings": 3, "per_days": 7}', 100),
('concurrent_limit', 'Student Concurrent Limit', 'Students can have max 2 active bookings at once', 'student', '{"max_concurrent": 2}', 100),
('training_required', 'High-Value Camera Training', 'Training required for cameras over $5000', NULL, '{"training_id": "camera-advanced", "training_name": "Advanced Camera Operations"}', 50)
ON CONFLICT (rule_type, rule_name) DO NOTHING;

-- Sample training records (for demo)
INSERT INTO training_records (user_id, training_id, training_name, expires_at)
SELECT
    u.id,
    'camera-basic',
    'Basic Camera Operations',
    CURRENT_TIMESTAMP + INTERVAL '1 year'
FROM users u
WHERE u.role IN ('staff', 'department_admin', 'master_admin')
LIMIT 5
ON CONFLICT (user_id, training_id) DO NOTHING;

COMMENT ON TABLE policy_rules IS 'Configurable enforcement rules for equipment bookings';
COMMENT ON TABLE training_records IS 'User training and certification tracking';
COMMENT ON TABLE policy_violations IS 'Audit log of policy enforcement violations';
