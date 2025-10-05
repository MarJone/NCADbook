# 3-Strike System - Demo Mode Guide

## Overview

The 3-strike system is now available in **demo mode** - no database required! It uses localStorage to persist data and includes pre-populated sample students with strikes for demonstration purposes.

## What's Included

### Demo Components
1. **StudentStrikesDemo.jsx** - Admin interface for managing strikes
2. **StrikeStatusDemo.jsx** - Student-facing strike display
3. **demo-strike.service.js** - Local state management service

### Pre-loaded Demo Data

**3 Sample Students with Strikes:**

| Student | ID | Strike Count | Status | Restriction |
|---------|-----|--------------|--------|-------------|
| CommDesign Student1 | 24 | 1 | Warning | None |
| CommDesign Student2 | 25 | 2 | Restricted | 7 days |
| CommDesign Student3 | 26 | 3 | Restricted | 30 days |

All other students start with 0 strikes (Good Standing)

## How to Use in Demo Mode

### 1. Add to Master Admin Portal

```jsx
// In your master admin navigation/routes
import StudentStrikesDemo from '../demo/StudentStrikesDemo';

// Add route
<Route path="/admin/strikes" element={<StudentStrikesDemo />} />

// Or add to navigation menu
<Link to="/admin/strikes">Student Strikes</Link>
```

### 2. Add to Student Dashboard (Optional)

```jsx
// In student portal/dashboard
import StrikeStatusDemo from '../../components/student/StrikeStatusDemo';

function StudentDashboard({ currentUser }) {
  return (
    <div>
      <StrikeStatusDemo studentId={currentUser.id} />
      {/* Rest of dashboard */}
    </div>
  );
}
```

### 3. Check Booking Eligibility

```jsx
// In booking form
import * as demoStrikeService from '../../services/demo-strike.service';

async function checkIfCanBook(studentId) {
  const result = await demoStrikeService.canStudentBook(studentId);

  if (!result.canBook) {
    alert(result.reason);
    return false;
  }

  return true;
}
```

## Demo Features

### Admin Interface Features

**View Students:**
- Filter by status: All / Restricted / Warning / Good Standing
- See strike counts and restriction dates
- Click student to view detailed strike history

**Issue Manual Strike:**
1. Select a student
2. Click "Issue Manual Strike (Demo)"
3. Enter number of days overdue
4. Strike is automatically calculated and applied

**Revoke Strike:**
1. Select a student with strikes
2. Click "Revoke Strike" on any strike in history
3. Enter reason for revocation
4. Strike count decreases, restrictions may be lifted

**Reset All Strikes:**
- Click "Reset All Strikes (New Semester)"
- Enter reason for reset
- All student strikes cleared (simulates new semester)

**Reset Demo Data:**
- Click "Reset Demo Data" to restore initial 3-student setup
- Useful for resetting after extensive testing

### Student Interface Features

**Strike Banner Display:**
- Only shows if student has strikes
- Visual strike counter (circles: 1/2/3)
- Clear messaging based on strike level
- Expandable history with details

**Restriction Messages:**
- Strike 1: "First Strike Warning" (no restriction)
- Strike 2: "Account Restricted" (7 days)
- Strike 3: "Extended Restriction" (30 days)

**Strike History:**
- View all strikes received
- See days overdue for each strike
- View restriction periods applied
- Help text on avoiding future strikes

## Strike Rules (Demo Mode)

### Automatic Strike Progression

| Strike # | Restriction Period | Student Can Book? |
|----------|-------------------|------------------|
| 1 | None (Warning) | ✅ Yes |
| 2 | 7 days | ❌ No (until restriction expires) |
| 3 | 30 days | ❌ No (until restriction expires) |

### How Strikes Are Issued

**Automatic (when implemented):**
- When booking marked "completed" and `end_date < today`
- System calculates days overdue
- Strike issued automatically

**Manual (demo feature):**
- Admin selects student
- Admin enters days overdue
- System calculates appropriate restriction

### Data Persistence

- **Storage:** Browser localStorage (key: `demo_strike_data`)
- **Persistence:** Survives page refresh
- **Isolation:** Separate per browser/device
- **Reset:** Use "Reset Demo Data" button or clear localStorage

## Testing Scenarios

### Test 1: View Students with Strikes

1. Navigate to Student Strikes page
2. Should see 3 students with strikes pre-loaded
3. Filter by "Restricted" - see 2 students
4. Filter by "Warning" - see 0 students (Strike 1 doesn't show as warning in filter)

### Test 2: Issue Strike to Good Standing Student

1. Select any student with 0 strikes
2. Click "Issue Manual Strike"
3. Enter "2" days overdue
4. See strike count increase to 1
5. Student remains in "Good Standing" (Strike 1 = warning only)

### Test 3: Progression from Strike 1 → 2 → 3

1. Select student with 1 strike (ID 24)
2. Issue another strike (2 days overdue)
3. Student now has 2 strikes + 7-day restriction
4. Status changes to "WARNING"
5. Issue third strike
6. Student now has 3 strikes + 30-day restriction
7. Status changes to "RESTRICTED"

### Test 4: Revoke Strike

1. Select student with 3 strikes (ID 26)
2. Click "Revoke Strike" on latest strike
3. Enter reason: "Strike issued in error"
4. Strike count decreases to 2
5. Restriction period recalculated

### Test 5: Booking Eligibility Check

```javascript
// In browser console or React component
import * as demoStrikeService from './services/demo-strike.service';

// Check student with 0 strikes
const result1 = await demoStrikeService.canStudentBook('24');
console.log(result1); // { canBook: true, reason: "Account in good standing", ... }

// Check student with 3 strikes (restricted)
const result2 = await demoStrikeService.canStudentBook('26');
console.log(result2); // { canBook: false, reason: "Account restricted until...", ... }
```

### Test 6: Semester Reset

1. Issue strikes to multiple students
2. Click "Reset All Strikes"
3. Enter reason: "New Semester - Fall 2024"
4. All strike counts reset to 0
5. All restrictions lifted
6. History preserved but strikes cleared

## Integration Examples

### Example 1: Booking Form with Strike Check

```jsx
import React, { useState, useEffect } from 'react';
import * as demoStrikeService from '../../services/demo-strike.service';
import StrikeStatusDemo from '../../components/student/StrikeStatusDemo';

function BookingFormDemo({ currentUser }) {
  const [canBook, setCanBook] = useState(null);

  useEffect(() => {
    async function checkEligibility() {
      const result = await demoStrikeService.canStudentBook(currentUser.id);
      setCanBook(result);
    }
    checkEligibility();
  }, [currentUser.id]);

  if (!canBook) return <div>Checking eligibility...</div>;

  if (!canBook.canBook) {
    return (
      <div>
        <StrikeStatusDemo studentId={currentUser.id} />
        <div className="booking-blocked">
          <h3>Booking Unavailable</h3>
          <p>{canBook.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StrikeStatusDemo studentId={currentUser.id} />
      <form>
        {/* Booking form fields */}
      </form>
    </div>
  );
}
```

### Example 2: Admin Quick Actions

```jsx
import * as demoStrikeService from '../../services/demo-strike.service';

// View all restricted students
const getRestrictedStudents = async () => {
  const allStudents = await demoStrikeService.getStudentsWithStrikes(users);
  return allStudents.filter(s => s.accountStatus === 'RESTRICTED');
};

// Get student strike summary
const getStudentSummary = async (studentId) => {
  const status = await demoStrikeService.getStrikeStatus(studentId);
  return {
    hasStrikes: status.strikeCount > 0,
    isRestricted: status.isRestricted,
    message: status.isRestricted
      ? `Restricted until ${new Date(status.blacklistUntil).toLocaleDateString()}`
      : `${status.strikeCount} strike(s)`
  };
};
```

### Example 3: Automatic Strike on Late Return (Future)

```jsx
// When marking booking as complete
import * as demoStrikeService from '../../services/demo-strike.service';

async function completeBooking(booking) {
  // Check if late
  const result = await demoStrikeService.checkLateReturn(booking);

  if (result.strikeIssued) {
    // Notify student
    alert(`Strike issued: ${result.newStrikeCount}/3 strikes`);

    // Send email notification (if implemented)
    const notifData = await demoStrikeService.getStrikeNotificationData(
      booking.student_id,
      booking.student_name,
      booking.student_email
    );

    console.log('Email notification:', notifData);
  }

  // Update booking status
  booking.status = 'completed';
}
```

## API Reference (Demo Mode)

### All Available Functions

```javascript
import * as demoStrikeService from '../../services/demo-strike.service';

// Check booking eligibility
const { canBook, reason, strikeCount, blacklistUntil } =
  await demoStrikeService.canStudentBook(studentId);

// Get strike status
const { strikeCount, blacklistUntil, history, isRestricted } =
  await demoStrikeService.getStrikeStatus(studentId);

// Issue strike (manual)
const result = await demoStrikeService.issueStrike(
  studentId,
  bookingId,
  daysOverdue,
  adminId
);

// Revoke strike
const result = await demoStrikeService.revokeStrike(
  strikeId,
  adminId,
  reason
);

// Reset all strikes
const result = await demoStrikeService.resetAllStrikes(
  adminId,
  reason
);

// Get notification data
const notifData = await demoStrikeService.getStrikeNotificationData(
  studentId,
  userFullName,
  userEmail
);

// Get all students with strikes
const students = await demoStrikeService.getStudentsWithStrikes(allUsers);

// Get strike history
const history = await demoStrikeService.getStrikeHistory(
  studentId,
  includeRevoked,
  allUsers
);

// Check late return (automatic)
const result = await demoStrikeService.checkLateReturn(booking);

// Reset demo to initial state
demoStrikeService.resetDemoData();
```

## localStorage Structure

```json
{
  "userStrikes": {
    "24": {
      "strikeCount": 1,
      "blacklistUntil": null
    },
    "25": {
      "strikeCount": 2,
      "blacklistUntil": "2024-12-15T00:00:00.000Z"
    },
    "26": {
      "strikeCount": 3,
      "blacklistUntil": "2025-01-08T00:00:00.000Z"
    }
  },
  "strikeHistory": [
    {
      "id": "strike-1",
      "studentId": "24",
      "bookingId": "booking-demo-1",
      "strikeNumber": 1,
      "reason": "Equipment returned 2 day(s) late",
      "daysOverdue": 2,
      "restrictionDays": 0,
      "blacklistUntil": null,
      "issuedBy": null,
      "createdAt": "2024-12-03T00:00:00.000Z",
      "revokedAt": null,
      "revokedBy": null,
      "revokeReason": null
    }
  ]
}
```

## Migration to Production

When ready to deploy with real database:

1. Replace `demo-strike.service.js` imports with `strike.service.js`
2. Replace `StudentStrikesDemo` with `StudentStrikes`
3. Replace `StrikeStatusDemo` with `StrikeStatus`
4. Run database migration: `database/19-three-strike-system.sql`
5. Update Supabase RLS policies as needed
6. Configure email notifications (optional)

**Key Differences:**
- Production uses Supabase database + RPC functions
- Demo uses localStorage + local JavaScript functions
- API is identical - drop-in replacement

## Troubleshooting

### Issue: Demo data not showing

**Solution:**
```javascript
// Open browser console
localStorage.getItem('demo_strike_data'); // Should return JSON

// If null, force initialize
import * as demoStrikeService from './services/demo-strike.service';
demoStrikeService.resetDemoData();
```

### Issue: Strikes not persisting

**Solution:**
- Check if localStorage is enabled in browser
- Check browser privacy settings (incognito mode may block)
- Clear localStorage and reinitialize: `demoStrikeService.resetDemoData()`

### Issue: Student not appearing in list

**Solution:**
- Ensure student role is 'student' in phase8Users
- Check filter status (only shows students with strikes when filtered)
- Check if student ID matches between data sources

## Demo Presentation Tips

1. **Start Fresh:** Click "Reset Demo Data" before demo
2. **Show Progression:** Issue strikes to one student: 0 → 1 → 2 → 3
3. **Show Restrictions:** Try to book with student who has 3 strikes
4. **Show Admin Power:** Revoke a strike, show restriction lifted
5. **Show Semester Reset:** Reset all strikes at end of demo

## Next Steps

- [ ] Add to master admin navigation
- [ ] Test with all demo portals
- [ ] Add booking form integration
- [ ] Create demo video/walkthrough
- [ ] Plan email notification integration
- [ ] Document for stakeholders

## Files Created

```
src/
├── services/
│   └── demo-strike.service.js          # Demo service (localStorage)
├── portals/
│   └── demo/
│       └── StudentStrikesDemo.jsx      # Admin interface
└── components/
    └── student/
        └── StrikeStatusDemo.jsx        # Student banner

docs/
└── DEMO_THREE_STRIKE_SYSTEM.md         # This file

styles/
├── student-strikes.css                 # Shared styles
└── strike-status.css                   # Shared styles
```

## Resources

- Main Implementation Guide: [THREE_STRIKE_IMPLEMENTATION.md](THREE_STRIKE_IMPLEMENTATION.md)
- Database Schema: [database/19-three-strike-system.sql](../database/19-three-strike-system.sql)
- Production Service: [src/services/strike.service.js](../src/services/strike.service.js)
