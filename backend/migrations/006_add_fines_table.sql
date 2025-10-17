-- Fine Management System
-- Automated late fee calculation and tracking

CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fine_type VARCHAR(50) NOT NULL, -- 'late_return', 'damage', 'lost_equipment', 'other'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'waived', 'overdue'
    description TEXT,
    days_late INTEGER DEFAULT 0,
    daily_rate DECIMAL(10, 2) DEFAULT 5.00,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,
    payment_method VARCHAR(50), -- 'cash', 'card', 'bank_transfer', 'waived'
    waived_by INTEGER REFERENCES users(id),
    waived_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_fines_user_id ON fines(user_id);
CREATE INDEX IF NOT EXISTS idx_fines_booking_id ON fines(booking_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fines_due_date ON fines(due_date);

-- Add fine tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_fines_owed DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_hold BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hold_reason TEXT;

-- Function to calculate late fines automatically
CREATE OR REPLACE FUNCTION calculate_late_fine(
    p_booking_id INTEGER,
    p_daily_rate DECIMAL DEFAULT 5.00
) RETURNS DECIMAL AS $$
DECLARE
    v_return_date TIMESTAMP;
    v_actual_return_date TIMESTAMP;
    v_days_late INTEGER;
    v_fine_amount DECIMAL;
    v_user_id INTEGER;
BEGIN
    -- Get booking details
    SELECT return_date, actual_return_date, user_id
    INTO v_return_date, v_actual_return_date, v_user_id
    FROM bookings
    WHERE id = p_booking_id;

    -- If not returned yet, use current time
    IF v_actual_return_date IS NULL THEN
        v_actual_return_date := CURRENT_TIMESTAMP;
    END IF;

    -- Calculate days late
    v_days_late := EXTRACT(DAY FROM (v_actual_return_date - v_return_date));

    -- Only charge if late
    IF v_days_late > 0 THEN
        v_fine_amount := v_days_late * p_daily_rate;

        -- Insert fine record if it doesn't exist
        INSERT INTO fines (
            user_id,
            booking_id,
            amount,
            fine_type,
            status,
            description,
            days_late,
            daily_rate,
            due_date
        ) VALUES (
            v_user_id,
            p_booking_id,
            v_fine_amount,
            'late_return',
            'pending',
            'Late return fee: ' || v_days_late || ' days @ $' || p_daily_rate || '/day',
            v_days_late,
            p_daily_rate,
            CURRENT_TIMESTAMP + INTERVAL '14 days'
        )
        ON CONFLICT DO NOTHING;

        RETURN v_fine_amount;
    END IF;

    RETURN 0.00;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate fines when booking is returned late
CREATE OR REPLACE FUNCTION trigger_calculate_late_fine()
RETURNS TRIGGER AS $$
BEGIN
    -- When booking is marked as completed and it's late
    IF NEW.status = 'completed' AND NEW.actual_return_date > NEW.return_date THEN
        PERFORM calculate_late_fine(NEW.id, 5.00);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_late_fine
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_calculate_late_fine();

-- Function to update user's total fines
CREATE OR REPLACE FUNCTION update_user_total_fines()
RETURNS TRIGGER AS $$
DECLARE
    v_total DECIMAL;
BEGIN
    -- Calculate total pending/overdue fines for user
    SELECT COALESCE(SUM(amount), 0.00)
    INTO v_total
    FROM fines
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND status IN ('pending', 'overdue');

    -- Update user's total fines
    UPDATE users
    SET total_fines_owed = v_total,
        account_hold = (v_total >= 50.00), -- Hold account if fines >= $50
        hold_reason = CASE
            WHEN v_total >= 50.00 THEN 'Outstanding fines: $' || v_total
            ELSE NULL
        END
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_fines_total
AFTER INSERT OR UPDATE OR DELETE ON fines
FOR EACH ROW
EXECUTE FUNCTION update_user_total_fines();

-- Function to mark fines as overdue
CREATE OR REPLACE FUNCTION mark_overdue_fines()
RETURNS void AS $$
BEGIN
    UPDATE fines
    SET status = 'overdue'
    WHERE status = 'pending'
    AND due_date < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Insert sample fine data (for demo)
INSERT INTO fines (user_id, booking_id, amount, fine_type, status, description, days_late, daily_rate, due_date)
SELECT
    b.user_id,
    b.id,
    15.00,
    'late_return',
    'pending',
    '3 days late @ $5/day',
    3,
    5.00,
    CURRENT_TIMESTAMP + INTERVAL '14 days'
FROM bookings b
WHERE b.status = 'completed'
AND b.actual_return_date > b.return_date
LIMIT 5
ON CONFLICT DO NOTHING;

COMMENT ON TABLE fines IS 'Financial management for equipment booking penalties';
COMMENT ON COLUMN fines.fine_type IS 'Type of fine: late_return, damage, lost_equipment, other';
COMMENT ON COLUMN fines.status IS 'Payment status: pending, paid, waived, overdue';
COMMENT ON COLUMN fines.daily_rate IS 'Rate per day for late returns';
