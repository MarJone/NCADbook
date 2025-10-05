-- =====================================================
-- 3-STRIKE SYSTEM FOR LATE EQUIPMENT RETURNS
-- =====================================================
-- This migration adds:
-- 1. Strike history tracking table
-- 2. Automatic strike increment on late returns
-- 3. Booking restrictions based on strikes
-- 4. Admin functions to manage strikes
-- =====================================================

-- 1. CREATE STRIKE HISTORY TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS strike_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  strike_number INTEGER NOT NULL CHECK (strike_number BETWEEN 1 AND 3),
  reason TEXT NOT NULL,
  days_overdue INTEGER NOT NULL,
  restriction_days INTEGER NOT NULL,
  blacklist_until TIMESTAMP,
  issued_by UUID REFERENCES users(id), -- NULL if automatic, admin ID if manual
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by UUID REFERENCES users(id),
  revoke_reason TEXT
);

-- Indexes for performance
CREATE INDEX idx_strike_history_student ON strike_history(student_id);
CREATE INDEX idx_strike_history_booking ON strike_history(booking_id);
CREATE INDEX idx_strike_history_created ON strike_history(created_at DESC);

-- RLS Policies
ALTER TABLE strike_history ENABLE ROW LEVEL SECURITY;

-- Students can view their own strike history
CREATE POLICY "Students view own strikes" ON strike_history
  FOR SELECT
  USING (student_id = auth.uid());

-- Admins can view all strikes
CREATE POLICY "Admins view all strikes" ON strike_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Admins can insert strikes (manual strikes)
CREATE POLICY "Admins insert strikes" ON strike_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- Admins can update strikes (revoke strikes)
CREATE POLICY "Admins revoke strikes" ON strike_history
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('general_admin', 'master_admin')
    )
  );

-- 2. FUNCTION TO INCREMENT STRIKE COUNT
-- =====================================================
CREATE OR REPLACE FUNCTION increment_student_strike(
  p_student_id UUID,
  p_booking_id UUID,
  p_days_overdue INTEGER,
  p_issued_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_strikes INTEGER;
  v_new_strike_count INTEGER;
  v_restriction_days INTEGER;
  v_blacklist_until TIMESTAMP;
  v_strike_id UUID;
  v_result JSONB;
BEGIN
  -- Get current strike count
  SELECT strike_count INTO v_current_strikes
  FROM users
  WHERE id = p_student_id;

  -- Calculate new strike count (max 3)
  v_new_strike_count := LEAST(v_current_strikes + 1, 3);

  -- Determine restriction period based on strike number
  CASE v_new_strike_count
    WHEN 1 THEN
      v_restriction_days := 0;  -- Warning only, no restriction
      v_blacklist_until := NULL;
    WHEN 2 THEN
      v_restriction_days := 7;  -- 1 week restriction
      v_blacklist_until := NOW() + INTERVAL '7 days';
    WHEN 3 THEN
      v_restriction_days := 30; -- 30 day restriction (or semester)
      v_blacklist_until := NOW() + INTERVAL '30 days';
  END CASE;

  -- Update user strike count and blacklist
  UPDATE users
  SET
    strike_count = v_new_strike_count,
    blacklist_until = v_blacklist_until
  WHERE id = p_student_id;

  -- Record strike in history
  INSERT INTO strike_history (
    student_id,
    booking_id,
    strike_number,
    reason,
    days_overdue,
    restriction_days,
    blacklist_until,
    issued_by
  )
  VALUES (
    p_student_id,
    p_booking_id,
    v_new_strike_count,
    FORMAT('Equipment returned %s day(s) late', p_days_overdue),
    p_days_overdue,
    v_restriction_days,
    v_blacklist_until,
    p_issued_by
  )
  RETURNING id INTO v_strike_id;

  -- Log admin action if manual strike
  IF p_issued_by IS NOT NULL THEN
    INSERT INTO admin_actions (
      admin_id,
      action_type,
      target_type,
      target_id,
      details
    )
    VALUES (
      p_issued_by,
      'issue_strike',
      'student',
      p_student_id,
      jsonb_build_object(
        'strike_id', v_strike_id,
        'strike_number', v_new_strike_count,
        'booking_id', p_booking_id,
        'days_overdue', p_days_overdue,
        'restriction_days', v_restriction_days
      )
    );
  END IF;

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'strike_id', v_strike_id,
    'previous_strikes', v_current_strikes,
    'new_strike_count', v_new_strike_count,
    'restriction_days', v_restriction_days,
    'blacklist_until', v_blacklist_until
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. AUTOMATIC STRIKE INCREMENT ON LATE RETURN
-- =====================================================
CREATE OR REPLACE FUNCTION check_late_return()
RETURNS TRIGGER AS $$
DECLARE
  v_days_overdue INTEGER;
  v_strike_result JSONB;
BEGIN
  -- Only check when booking status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status = 'active' THEN
    -- Calculate days overdue (negative means early/on-time)
    v_days_overdue := CURRENT_DATE - NEW.end_date;

    -- If returned late (positive days overdue)
    IF v_days_overdue > 0 THEN
      -- Increment strike automatically
      v_strike_result := increment_student_strike(
        NEW.student_id,
        NEW.id,
        v_days_overdue,
        NULL  -- NULL = automatic strike (not issued by admin)
      );

      -- Optionally add note to booking
      NEW.admin_notes := COALESCE(NEW.admin_notes, '') ||
        FORMAT(E'\n[AUTOMATIC STRIKE] Returned %s day(s) late. Strike #%s issued.',
          v_days_overdue,
          (v_strike_result->>'new_strike_count')::INTEGER
        );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_late_return
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_late_return();

-- 4. FUNCTION TO CHECK IF STUDENT CAN BOOK
-- =====================================================
CREATE OR REPLACE FUNCTION can_student_book(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_strike_count INTEGER;
  v_blacklist_until TIMESTAMP;
  v_can_book BOOLEAN;
  v_reason TEXT;
BEGIN
  -- Get student strike info
  SELECT strike_count, blacklist_until
  INTO v_strike_count, v_blacklist_until
  FROM users
  WHERE id = p_student_id;

  -- Check if blacklisted and still within restriction period
  IF v_blacklist_until IS NOT NULL AND v_blacklist_until > NOW() THEN
    v_can_book := false;
    v_reason := FORMAT(
      'Account restricted until %s due to %s strike(s) for late returns',
      TO_CHAR(v_blacklist_until, 'YYYY-MM-DD HH24:MI'),
      v_strike_count
    );
  ELSE
    v_can_book := true;
    v_reason := 'Account in good standing';

    -- Clear expired blacklist
    IF v_blacklist_until IS NOT NULL AND v_blacklist_until <= NOW() THEN
      UPDATE users
      SET blacklist_until = NULL
      WHERE id = p_student_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'can_book', v_can_book,
    'reason', v_reason,
    'strike_count', v_strike_count,
    'blacklist_until', v_blacklist_until
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCTION TO REVOKE STRIKE (ADMIN ONLY)
-- =====================================================
CREATE OR REPLACE FUNCTION revoke_strike(
  p_strike_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_strike_number INTEGER;
  v_current_strikes INTEGER;
BEGIN
  -- Get strike details
  SELECT student_id, strike_number
  INTO v_student_id, v_strike_number
  FROM strike_history
  WHERE id = p_strike_id AND revoked_at IS NULL;

  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Strike not found or already revoked'
    );
  END IF;

  -- Mark strike as revoked
  UPDATE strike_history
  SET
    revoked_at = NOW(),
    revoked_by = p_admin_id,
    revoke_reason = p_reason
  WHERE id = p_strike_id;

  -- Decrement student strike count
  UPDATE users
  SET strike_count = GREATEST(strike_count - 1, 0)
  WHERE id = v_student_id
  RETURNING strike_count INTO v_current_strikes;

  -- Clear blacklist if strikes reduced below threshold
  IF v_current_strikes < 2 THEN
    UPDATE users
    SET blacklist_until = NULL
    WHERE id = v_student_id;
  END IF;

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  )
  VALUES (
    p_admin_id,
    'revoke_strike',
    'student',
    v_student_id,
    jsonb_build_object(
      'strike_id', p_strike_id,
      'revoked_strike_number', v_strike_number,
      'new_strike_count', v_current_strikes,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student_id,
    'new_strike_count', v_current_strikes,
    'message', 'Strike revoked successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCTION TO RESET ALL STRIKES (START OF NEW SEMESTER)
-- =====================================================
CREATE OR REPLACE FUNCTION reset_all_strikes(
  p_admin_id UUID,
  p_reason TEXT DEFAULT 'New semester reset'
)
RETURNS JSONB AS $$
DECLARE
  v_affected_students INTEGER;
BEGIN
  -- Count students with strikes
  SELECT COUNT(*) INTO v_affected_students
  FROM users
  WHERE strike_count > 0;

  -- Reset all strike counts and blacklists
  UPDATE users
  SET
    strike_count = 0,
    blacklist_until = NULL
  WHERE strike_count > 0;

  -- Log admin action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_type,
    target_id,
    details
  )
  VALUES (
    p_admin_id,
    'reset_all_strikes',
    'system',
    p_admin_id,
    jsonb_build_object(
      'affected_students', v_affected_students,
      'reason', p_reason,
      'reset_date', NOW()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'affected_students', v_affected_students,
    'message', FORMAT('Reset strikes for %s students', v_affected_students)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. VIEW FOR ADMIN DASHBOARD
-- =====================================================
CREATE OR REPLACE VIEW student_strike_summary AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.surname,
  u.full_name,
  u.department,
  u.strike_count,
  u.blacklist_until,
  CASE
    WHEN u.blacklist_until IS NOT NULL AND u.blacklist_until > NOW() THEN 'RESTRICTED'
    WHEN u.strike_count >= 2 THEN 'WARNING'
    ELSE 'GOOD_STANDING'
  END as account_status,
  (
    SELECT COUNT(*)
    FROM strike_history sh
    WHERE sh.student_id = u.id AND sh.revoked_at IS NULL
  ) as total_strikes_issued,
  (
    SELECT MAX(sh.created_at)
    FROM strike_history sh
    WHERE sh.student_id = u.id
  ) as last_strike_date
FROM users u
WHERE u.role = 'student';

-- Grant access to view
GRANT SELECT ON student_strike_summary TO authenticated;

-- 8. NOTIFICATION HELPER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION get_strike_notification_data(p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_student_email TEXT;
  v_student_name TEXT;
  v_strike_count INTEGER;
  v_blacklist_until TIMESTAMP;
  v_message TEXT;
BEGIN
  SELECT
    email,
    full_name,
    strike_count,
    blacklist_until
  INTO
    v_student_email,
    v_student_name,
    v_strike_count,
    v_blacklist_until
  FROM users
  WHERE id = p_student_id;

  -- Build appropriate message
  CASE v_strike_count
    WHEN 1 THEN
      v_message := 'This is your first warning. Please return equipment on time to avoid restrictions.';
    WHEN 2 THEN
      v_message := FORMAT(
        'This is your second strike. Your account is restricted until %s. Future late returns may result in longer restrictions.',
        TO_CHAR(v_blacklist_until, 'DD Mon YYYY')
      );
    WHEN 3 THEN
      v_message := FORMAT(
        'This is your third strike. Your account is restricted until %s. Please contact admin to discuss reinstatement.',
        TO_CHAR(v_blacklist_until, 'DD Mon YYYY')
      );
  END CASE;

  RETURN jsonb_build_object(
    'student_email', v_student_email,
    'student_name', v_student_name,
    'strike_count', v_strike_count,
    'blacklist_until', v_blacklist_until,
    'message', v_message
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TESTING QUERIES
-- =====================================================

-- Test 1: Check if a student can book
-- SELECT can_student_book('student-uuid-here');

-- Test 2: Manually issue a strike
-- SELECT increment_student_strike('student-uuid', 'booking-uuid', 3, 'admin-uuid');

-- Test 3: View student strike summary
-- SELECT * FROM student_strike_summary WHERE strike_count > 0;

-- Test 4: Revoke a strike
-- SELECT revoke_strike('strike-uuid', 'admin-uuid', 'Equipment was returned on time, strike issued in error');

-- Test 5: Get notification data
-- SELECT get_strike_notification_data('student-uuid');

-- =====================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================
-- 1. Frontend should call can_student_book() before showing booking form
-- 2. Display strike count and blacklist status on student dashboard
-- 3. Send email notifications using get_strike_notification_data()
-- 4. Admin interface should show student_strike_summary view
-- 5. Allow admins to manually issue strikes for other violations
-- 6. Consider adding grace period (1-2 days) before auto-strike
-- 7. At start of semester, run reset_all_strikes() function
