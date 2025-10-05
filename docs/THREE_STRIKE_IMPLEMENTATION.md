# 3-Strike System Implementation Guide

## Overview

The 3-strike system automatically tracks and restricts students who return equipment late. Each late return increments their strike count with escalating consequences.

## Strike Progression

| Strike | Consequence | Duration | Description |
|--------|-------------|----------|-------------|
| **Strike 1** | Warning only | No restriction | Student can still book equipment but receives warning notification |
| **Strike 2** | Booking restriction | 7 days | Student cannot make new bookings for 7 days |
| **Strike 3** | Extended restriction | 30 days | Student cannot make new bookings for 30 days |

## Database Setup

### Step 1: Run the Migration

Execute the SQL migration script in Supabase:

```bash
# Location: database/19-three-strike-system.sql
```

This creates:
- `strike_history` table for audit trail
- Automatic trigger on booking completion
- RLS policies for secure access
- Admin management functions
- Student strike summary view

### Step 2: Verify Installation

Run these test queries in Supabase SQL Editor:

```sql
-- Test 1: Check if strike_history table exists
SELECT * FROM strike_history LIMIT 1;

-- Test 2: Verify can_student_book function exists
SELECT can_student_book('any-uuid-here');

-- Test 3: Check student_strike_summary view
SELECT * FROM student_strike_summary LIMIT 5;
```

## Frontend Integration

### Student Dashboard

Add the `StrikeStatus` component to display strike information:

```jsx
// In StudentDashboard.jsx or similar
import StrikeStatus from '../../components/student/StrikeStatus';

function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <div>
      {user && <StrikeStatus studentId={user.id} />}
      {/* Rest of dashboard */}
    </div>
  );
}
```

### Booking Form Validation

Prevent bookings if student has active restrictions:

```jsx
// In BookingForm.jsx or similar
import { canStudentBook } from '../../services/strike.service';

function BookingForm() {
  const [bookingAllowed, setBookingAllowed] = useState(null);

  useEffect(() => {
    async function checkEligibility() {
      const { data: userData } = await supabase.auth.getUser();
      const result = await canStudentBook(userData.user.id);

      setBookingAllowed(result);

      if (!result.canBook) {
        // Show restriction message
        alert(result.reason);
      }
    }

    checkEligibility();
  }, []);

  if (!bookingAllowed?.canBook) {
    return (
      <div className="booking-restricted">
        <h3>Booking Restricted</h3>
        <p>{bookingAllowed?.reason}</p>
        <p>Current strikes: {bookingAllowed?.strikeCount}/3</p>
      </div>
    );
  }

  return (
    <form>
      {/* Booking form fields */}
    </form>
  );
}
```

### Admin Interface

Add the StudentStrikes component to the master admin portal:

```jsx
// In MasterAdminPortal.jsx or navigation
import StudentStrikes from './StudentStrikes';

// Add to navigation/routing
<Route path="/admin/strikes" element={<StudentStrikes />} />
```

## How It Works

### Automatic Strike Increment

When a booking is marked as "completed":

1. **System checks return date**
   - If `CURRENT_DATE > end_date`, equipment is late
   - Calculate days overdue: `CURRENT_DATE - end_date`

2. **Automatic strike issued**
   - Strike count incremented (max 3)
   - Restriction applied based on strike number
   - Record created in `strike_history` table
   - Admin note added to booking

3. **Student notified**
   - Email notification sent (optional, requires EmailJS)
   - Strike visible on student dashboard
   - Booking restrictions apply immediately

### Database Trigger (Automatic)

```sql
-- This trigger runs automatically when booking.status changes to 'completed'
CREATE TRIGGER trigger_check_late_return
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_late_return();
```

### Manual Strike Issuance (Admin)

Admins can manually issue strikes for policy violations:

```jsx
// Example: Manual strike for equipment damage
import { issueStrike } from '../../services/strike.service';

async function handleManualStrike(studentId, bookingId) {
  const { data: adminData } = await supabase.auth.getUser();

  const result = await issueStrike(
    studentId,
    bookingId,
    0, // 0 days overdue (manual strike)
    adminData.user.id
  );

  console.log('Strike issued:', result);
}
```

## Admin Functions

### View All Students with Strikes

```jsx
import { getStudentsWithStrikes } from '../../services/strike.service';

async function loadStudents() {
  const students = await getStudentsWithStrikes();
  // Filter by status: RESTRICTED, WARNING, GOOD_STANDING
}
```

### Revoke a Strike

```jsx
import { revokeStrike } from '../../services/strike.service';

async function handleRevokeStrike(strikeId) {
  const { data: adminData } = await supabase.auth.getUser();

  const result = await revokeStrike(
    strikeId,
    adminData.user.id,
    'Equipment was returned on time, strike issued in error'
  );

  if (result.success) {
    alert('Strike revoked successfully');
  }
}
```

### Reset All Strikes (New Semester)

```jsx
import { resetAllStrikes } from '../../services/strike.service';

async function handleSemesterReset() {
  const confirm = window.confirm('Reset all strikes? This cannot be undone.');
  if (!confirm) return;

  const { data: adminData } = await supabase.auth.getUser();

  const result = await resetAllStrikes(
    adminData.user.id,
    'New semester - Fall 2024'
  );

  alert(`Reset strikes for ${result.affected_students} students`);
}
```

## API Reference

### Service Functions

```javascript
import strikeService from '../../services/strike.service';

// Check if student can book
const { canBook, reason, strikeCount } = await strikeService.canStudentBook(studentId);

// Get strike status
const { strikeCount, blacklistUntil, history, isRestricted } =
  await strikeService.getStrikeStatus(studentId);

// Issue manual strike (admin only)
const result = await strikeService.issueStrike(studentId, bookingId, daysOverdue, adminId);

// Revoke strike (admin only)
const result = await strikeService.revokeStrike(strikeId, adminId, reason);

// Reset all strikes (admin only)
const result = await strikeService.resetAllStrikes(adminId, reason);

// Get notification data for email
const notificationData = await strikeService.getStrikeNotificationData(studentId);

// Get all students with strikes
const students = await strikeService.getStudentsWithStrikes();

// Get student strike history
const history = await strikeService.getStrikeHistory(studentId, includeRevoked);
```

### Database Functions (Direct RPC)

```javascript
// Check booking eligibility
const { data } = await supabase.rpc('can_student_book', {
  p_student_id: 'uuid-here'
});
// Returns: { can_book: boolean, reason: string, strike_count: number, blacklist_until: timestamp }

// Increment strike
const { data } = await supabase.rpc('increment_student_strike', {
  p_student_id: 'uuid-here',
  p_booking_id: 'uuid-here',
  p_days_overdue: 3,
  p_issued_by: 'admin-uuid' // or NULL for automatic
});

// Revoke strike
const { data } = await supabase.rpc('revoke_strike', {
  p_strike_id: 'uuid-here',
  p_admin_id: 'uuid-here',
  p_reason: 'Reason text'
});

// Reset all strikes
const { data } = await supabase.rpc('reset_all_strikes', {
  p_admin_id: 'uuid-here',
  p_reason: 'New semester'
});

// Get notification data
const { data } = await supabase.rpc('get_strike_notification_data', {
  p_student_id: 'uuid-here'
});
```

## Email Notifications (Optional)

### Strike Notification Template

```javascript
// Using EmailJS or your email service
import { getStrikeNotificationData } from '../../services/strike.service';

async function sendStrikeNotification(studentId) {
  const notificationData = await getStrikeNotificationData(studentId);

  const emailTemplate = {
    to_email: notificationData.student_email,
    to_name: notificationData.student_name,
    subject: `Strike ${notificationData.strike_count} - Equipment Return Notice`,
    message: notificationData.message
  };

  // Send via EmailJS or your service
  await emailjs.send('service_id', 'template_id', emailTemplate);
}
```

### Email Templates by Strike Number

**Strike 1:**
```
Subject: First Strike Warning - Late Equipment Return

Dear [Student Name],

You have received your first strike for returning equipment late.

This is a warning. Please ensure you return all equipment on time to avoid future restrictions.

Current Status: 1/3 strikes (No restrictions)

Best regards,
NCAD Equipment Office
```

**Strike 2:**
```
Subject: Second Strike - Account Restricted

Dear [Student Name],

You have received your second strike for late equipment return.

Your booking privileges are restricted until [DATE].

Current Status: 2/3 strikes (7-day restriction)

One more late return will result in an extended restriction. Please contact us if you need assistance.

Best regards,
NCAD Equipment Office
```

**Strike 3:**
```
Subject: Third Strike - Extended Restriction

Dear [Student Name],

You have received your third strike.

Your account is restricted until [DATE].

Current Status: 3/3 strikes (30-day restriction)

Please contact the equipment office to discuss reinstatement procedures.

Best regards,
NCAD Equipment Office
```

## Testing Guide

### Test Scenario 1: Automatic Strike on Late Return

1. Create a booking with `end_date` in the past
2. Mark booking as `completed`
3. Verify strike was issued automatically
4. Check `strike_history` table for new record
5. Verify student's `strike_count` incremented

```sql
-- Test query
UPDATE bookings
SET status = 'completed'
WHERE id = 'test-booking-id';

-- Check result
SELECT * FROM strike_history WHERE booking_id = 'test-booking-id';
SELECT strike_count FROM users WHERE id = 'student-id';
```

### Test Scenario 2: Booking Restriction

1. Set student's `strike_count = 2` and `blacklist_until = NOW() + 7 days`
2. Try to book via `canStudentBook()` function
3. Should return `can_book: false`

```sql
-- Setup test
UPDATE users
SET strike_count = 2, blacklist_until = NOW() + INTERVAL '7 days'
WHERE id = 'test-student-id';

-- Test
SELECT can_student_book('test-student-id');
```

### Test Scenario 3: Strike Revocation

1. Create a strike record
2. Revoke using `revoke_strike()` function
3. Verify strike count decremented
4. Verify strike marked as revoked in history

```sql
-- Revoke strike
SELECT revoke_strike(
  'strike-id',
  'admin-id',
  'Strike issued in error'
);

-- Verify
SELECT * FROM strike_history WHERE id = 'strike-id';
SELECT strike_count FROM users WHERE id = 'student-id';
```

## Customization Options

### Adjust Restriction Periods

Edit the `increment_student_strike` function in the migration file:

```sql
-- Current settings
WHEN 1 THEN v_restriction_days := 0;  -- Warning only
WHEN 2 THEN v_restriction_days := 7;  -- 7 days
WHEN 3 THEN v_restriction_days := 30; -- 30 days

-- Example: Stricter policy
WHEN 1 THEN v_restriction_days := 3;  -- 3-day restriction
WHEN 2 THEN v_restriction_days := 14; -- 2 weeks
WHEN 3 THEN v_restriction_days := 90; -- Full semester
```

### Add Grace Period

Modify the `check_late_return()` trigger to add a grace period:

```sql
-- Add 2-day grace period
v_days_overdue := CURRENT_DATE - NEW.end_date - 2;

-- Only issue strike if overdue after grace period
IF v_days_overdue > 0 THEN
  -- Issue strike
END IF;
```

### Weekend Exemptions

Don't count weekends as late:

```sql
-- Calculate business days overdue
CREATE OR REPLACE FUNCTION business_days_between(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
  days INTEGER := 0;
  current_date DATE := start_date;
BEGIN
  WHILE current_date <= end_date LOOP
    IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN -- Not Sun/Sat
      days := days + 1;
    END IF;
    current_date := current_date + 1;
  END LOOP;
  RETURN days;
END;
$$ LANGUAGE plpgsql;
```

## Troubleshooting

### Issue: Strikes not incrementing automatically

**Check:**
1. Trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_check_late_return';`
2. Function exists: `SELECT * FROM pg_proc WHERE proname = 'check_late_return';`
3. Booking status is changing to 'completed'
4. Return date is actually late (`end_date < CURRENT_DATE`)

### Issue: Student can book despite restriction

**Check:**
1. `blacklist_until` date is in the future
2. RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'bookings';`
3. Frontend is calling `canStudentBook()` before showing form
4. User session is valid

### Issue: Admin cannot revoke strikes

**Check:**
1. Admin role is correct: `SELECT role FROM users WHERE id = 'admin-id';`
2. RLS policy allows admins: `SELECT * FROM pg_policies WHERE tablename = 'strike_history';`
3. Strike is not already revoked: `SELECT revoked_at FROM strike_history WHERE id = 'strike-id';`

## Migration Rollback (Emergency)

If you need to remove the 3-strike system:

```sql
-- WARNING: This will delete all strike data
DROP TRIGGER IF EXISTS trigger_check_late_return ON bookings;
DROP FUNCTION IF EXISTS check_late_return();
DROP FUNCTION IF EXISTS increment_student_strike(UUID, UUID, INTEGER, UUID);
DROP FUNCTION IF EXISTS can_student_book(UUID);
DROP FUNCTION IF EXISTS revoke_strike(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reset_all_strikes(UUID, TEXT);
DROP FUNCTION IF EXISTS get_strike_notification_data(UUID);
DROP VIEW IF EXISTS student_strike_summary;
DROP TABLE IF EXISTS strike_history;

-- Reset user fields (optional)
UPDATE users SET strike_count = 0, blacklist_until = NULL;
```

## Best Practices

1. **Communication**
   - Email students when they receive a strike
   - Display strike status prominently on dashboard
   - Provide clear instructions on how to avoid strikes

2. **Admin Training**
   - Train admins on revoke functionality
   - Document valid reasons for revocation
   - Establish policy for semester resets

3. **Data Retention**
   - Keep strike history even after revocation (audit trail)
   - Archive old strike data yearly
   - Maintain logs of all admin actions

4. **Monitoring**
   - Track strike patterns by department
   - Monitor equipment with frequent late returns
   - Review restriction effectiveness quarterly

5. **Student Support**
   - Allow appeals process for strikes
   - Provide extension request mechanism
   - Offer equipment return reminders (email/SMS)

## Future Enhancements

- **SMS Notifications**: Send text reminders before due date
- **Automated Extensions**: Allow students to request 1-day extensions
- **Grace Period**: Configurable grace period per equipment type
- **Department Variations**: Different strike rules per department
- **Equipment Alerts**: Notify students 24 hours before return deadline
- **Analytics Dashboard**: Track strike trends and equipment return rates

## Support

For issues or questions:
- Review database logs in Supabase Dashboard
- Check admin_actions table for audit trail
- Contact system administrator for policy changes
- See CLAUDE.md for general project documentation
