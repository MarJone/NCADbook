# Policy Enforcement System - Setup Instructions

## Overview
The Policy Enforcement System adds configurable rules for equipment bookings, including:
- **Weekly Limits**: Restrict number of bookings per week
- **Concurrent Limits**: Limit active bookings at any time
- **Training Requirements**: Require certifications for specific equipment
- **Blackout Periods**: Block bookings during specific dates

## Database Setup

### Step 1: Run Migration
```bash
psql -U postgres -d ncadbook_db -f backend/migrations/007_add_policy_enforcement.sql
```

This creates:
- `policy_rules` table
- `training_records` table
- `policy_violations` table
- Validation functions (`check_weekly_limit`, `check_concurrent_limit`, `check_training_requirement`, `validate_booking_policies`)
- Default policy rules (3 bookings/week for students, 2 concurrent max)

### Step 2: Verify Tables Created
```bash
psql -U postgres -d ncadbook_db -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'policy%';"
```

Expected output:
```
tablename
-----------------
policy_rules
policy_violations
training_records
```

### Step 3: Test Policy Validation
```bash
psql -U postgres -d ncadbook_db -c "SELECT * FROM policy_rules;"
```

Should show 3 default rules.

## API Endpoints

### Policy Rules Management (Admin Only)
- `GET /api/policies/rules` - List all policy rules
- `GET /api/policies/rules/:id` - Get single rule
- `POST /api/policies/rules` - Create new rule
- `PATCH /api/policies/rules/:id` - Update rule
- `DELETE /api/policies/rules/:id` - Delete rule

### Policy Validation
- `POST /api/policies/validate-booking` - Validate booking against all policies
- `GET /api/policies/check-weekly-limit/:userId` - Check weekly limit for user
- `GET /api/policies/check-concurrent-limit/:userId` - Check concurrent limit
- `GET /api/policies/check-training/:userId` - Check training requirements

### Training Records (Admin Only)
- `GET /api/policies/training` - List all training records
- `GET /api/policies/training/:userId` - Get user's training records
- `POST /api/policies/training` - Add training record
- `DELETE /api/policies/training/:id` - Delete training record

### Policy Violations Log
- `GET /api/policies/violations` - List all violations (admin)
- `GET /api/policies/violations/:userId` - Get user's violations
- `PATCH /api/policies/violations/:id/override` - Admin override violation

## Frontend Components

### For Admin Portal
```jsx
import PolicyManager from '../components/policies/PolicyManager';

// In admin dashboard
<PolicyManager />
```

### For Student Booking Flow
```jsx
import PolicyStatus from '../components/policies/PolicyStatus';

// Before booking form
<PolicyStatus equipmentId={selectedEquipment.id} />
```

### For Booking Error Handling
```jsx
import { PolicyViolationError } from '../components/policies/PolicyStatus';

// On booking submission error
{bookingError && bookingError.type === 'Policy Violation' && (
  <PolicyViolationError violation={bookingError} />
)}
```

## How It Works

### 1. Booking Creation Flow (with Policy Enforcement)
```
Student creates booking
    ↓
allowAdminOverride middleware (checks if admin is overriding)
    ↓
checkFineStatus middleware (blocks if account hold)
    ↓
validateBookingPolicies middleware
    ↓
    - Calls validate_booking_policies(userId, equipmentId, dates)
    - Checks weekly limit
    - Checks concurrent limit
    - Checks training requirements
    ↓
If violation → Log to policy_violations → Return 403 error
If valid → Proceed to createBooking controller
```

### 2. Policy Validation (Database Functions)
The system uses PostgreSQL functions for efficient validation:

- **check_weekly_limit**: Counts bookings in rolling time window
- **check_concurrent_limit**: Counts active (not returned) bookings
- **check_training_requirement**: Verifies user has valid certification
- **validate_booking_policies**: Orchestrates all checks, returns first violation or success

### 3. Policy Priority System
Rules have a `priority` field (lower = higher priority). When multiple rules apply:
- Most specific rule wins (equipment_id > category > department > role > all)
- If equal specificity, lower priority number wins
- Default priority: 100

Example:
```sql
-- High priority rule for expensive cameras
priority: 50, applies_to_equipment_id: 42

-- General student rule
priority: 100, applies_to_role: 'student'

-- The specific camera rule will override the general student rule
```

### 4. Exempted Users
Rules can exempt specific users:
```sql
exempted_users: [12, 45, 67]  -- User IDs exempt from this rule
```

## Default Rules Created

1. **Student Weekly Limit**
   - Type: `weekly_limit`
   - Config: `{"max_bookings": 3, "per_days": 7}`
   - Applies to: `role = 'student'`

2. **Student Concurrent Limit**
   - Type: `concurrent_limit`
   - Config: `{"max_concurrent": 2}`
   - Applies to: `role = 'student'`

3. **High-Value Camera Training**
   - Type: `training_required`
   - Config: `{"training_id": "camera-advanced", "training_name": "Advanced Camera Operations"}`
   - Applies to: All roles (can be scoped later)

## Creating Custom Rules

### Example: Limit DSLR Cameras to 1 per week for students
```bash
curl -X POST http://localhost:3001/api/policies/rules \
  -H "Content-Type: application/json" \
  -d '{
    "rule_type": "weekly_limit",
    "rule_name": "Student DSLR Weekly Limit",
    "description": "Students can book only 1 DSLR per week",
    "applies_to_role": "student",
    "applies_to_equipment_category": "DSLR",
    "rule_config": {"max_bookings": 1, "per_days": 7},
    "priority": 90,
    "created_by": 1
  }'
```

### Example: Require training for specific equipment
```bash
curl -X POST http://localhost:3001/api/policies/rules \
  -H "Content-Type: application/json" \
  -d '{
    "rule_type": "training_required",
    "rule_name": "Cinema Camera Training",
    "description": "RED camera requires certification",
    "applies_to_equipment_id": 15,
    "rule_config": {
      "training_id": "red-camera-cert",
      "training_name": "RED Cinema Camera Certification"
    },
    "priority": 50,
    "created_by": 1
  }'
```

## Adding Training Records

```bash
curl -X POST http://localhost:3001/api/policies/training \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 42,
    "trainingId": "camera-advanced",
    "trainingName": "Advanced Camera Operations",
    "expiresAt": "2026-01-01",
    "certificateUrl": "https://example.com/cert.pdf",
    "verifiedBy": 1,
    "notes": "Completed hands-on training with full marks"
  }'
```

## Integration with Fines System

The policy system integrates with fines via `checkFineStatus` middleware:
- Checks `users.account_hold` field
- If user has account hold, blocks booking
- Returns error with `hold_reason` and `total_fines_owed`

## Admin Override

Admins can bypass policy enforcement:
```javascript
// In booking request
{
  userId: 42,
  equipmentId: 15,
  pickupDate: "2025-10-25",
  returnDate: "2025-10-28",
  adminOverride: true,        // Bypass policies
  adminId: 1,                 // Admin performing override
  overrideReason: "Emergency equipment replacement for thesis project"
}
```

## Testing

### 1. Test Policy Validation
```bash
curl -X POST http://localhost:3001/api/policies/validate-booking \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 42,
    "equipmentId": 15,
    "pickupDate": "2025-10-25T10:00:00Z",
    "returnDate": "2025-10-28T10:00:00Z"
  }'
```

### 2. Test Weekly Limit Check
```bash
curl http://localhost:3001/api/policies/check-weekly-limit/42
```

### 3. Test Concurrent Limit Check
```bash
curl http://localhost:3001/api/policies/check-concurrent-limit/42
```

## Troubleshooting

### Migration Fails
- Check PostgreSQL version (requires 10+)
- Ensure database `ncadbook_db` exists
- Verify user has CREATE TABLE permissions

### Policy Not Enforcing
- Check `is_active = true` for policy rule
- Verify rule scope matches user (role, department, etc.)
- Check `exempted_users` doesn't include the user
- Review policy priority (lower priority rules may override)

### Training Requirement Not Working
- Verify `training_records` table has record for user
- Check `expires_at` is NULL or in future
- Ensure `training_id` matches rule's `rule_config->training_id`

## Future Enhancements

- [ ] Blackout period implementation (structure ready, needs frontend)
- [ ] Email notifications for policy violations
- [ ] Policy analytics dashboard
- [ ] Bulk exemption management UI
- [ ] Policy templates library
- [ ] Auto-expire training certifications with reminders

## Files Modified/Created

### Database
- `backend/migrations/007_add_policy_enforcement.sql` - Migration file

### Backend
- `backend/src/middleware/policyValidation.js` - Policy validation middleware
- `backend/src/routes/policies.js` - Policy API routes

### Frontend
- `src/components/policies/PolicyManager.jsx` - Admin policy management UI
- `src/components/policies/PolicyManager.css` - Styles
- `src/components/policies/PolicyStatus.jsx` - User-facing policy status
- `src/components/policies/PolicyStatus.css` - Styles

### Integration
- `backend/src/routes/bookingRoutes.js` - Added policy middleware
- `backend/src/server.js` - Registered policy routes
