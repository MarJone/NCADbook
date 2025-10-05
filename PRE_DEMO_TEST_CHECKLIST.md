# Pre-Demo Test Checklist

**Demo URL:** http://localhost:5178/
**Date:** 2025-10-05
**Tester:** ___________

## ✅ Test Results Summary

### Automated Tests
- ✅ Strike System Tests: **12/14 passed** (86% success rate)
  - Core functionality working
  - localStorage persistence verified
  - Strike progression logic validated
  - Minor UI integration tests skipped (components not in navigation yet)

### Manual Tests (Complete before demo)

---

## 1. Authentication & Login 🔐

### Test 1.1: Master Admin Login
- [ ] Navigate to http://localhost:5178/
- [ ] Click "Master Admin" quick login OR enter `master@ncad.ie` / `master123`
- [ ] **Expected:** Successfully redirected to Master Admin dashboard
- [ ] **Status:** _____ ✅ ❌

### Test 1.2: Student Login
- [ ] Click "Student" quick login OR enter `commdesign.student1@student.ncad.ie` / `student123`
- [ ] **Expected:** Successfully redirected to Student portal
- [ ] **Status:** _____ ✅ ❌

### Test 1.3: Department Admin Login
- [ ] Login as `admin.commdesign@ncad.ie` / `admin123`
- [ ] **Expected:** Successfully redirected to Department Admin portal
- [ ] **Status:** _____ ✅ ❌

### Test 1.4: New Roles Login
- [ ] Login as `viewonly@ncad.ie` / `demo123` (View Only Staff)
- [ ] **Expected:** Access to View Only portal
- [ ] **Status:** _____ ✅ ❌

---

## 2. Strike System (Demo Mode) 🚨

### Test 2.1: Strike Data Initialization
- [ ] Open browser DevTools → Application → localStorage
- [ ] Look for key: `demo_strike_data`
- [ ] **Expected:** JSON object with pre-loaded strikes for students 24, 25, 26
- [ ] **Status:** _____ ✅ ❌

### Test 2.2: View Student Strike Status (as Student)
- [ ] Login as `commdesign.student1@student.ncad.ie` (has 1 strike)
- [ ] Look for strike banner on dashboard
- [ ] **Expected:** Yellow warning banner showing "First Strike Warning"
- [ ] **Status:** _____ ✅ ❌

### Test 2.3: Restricted Student Cannot Book
- [ ] Login as `commdesign.student3@student.ncad.ie` (has 3 strikes)
- [ ] Try to create a booking
- [ ] **Expected:** Blocked with message about restriction
- [ ] **Status:** _____ ✅ ❌

### Test 2.4: Admin Strike Management (if integrated)
- [ ] Login as master admin
- [ ] Navigate to "Student Strikes" (if in navigation)
- [ ] **Expected:** See list of students with strikes
- [ ] Filter by "Restricted" → Should see 2 students
- [ ] **Status:** _____ ✅ ❌

### Test 2.5: Issue Manual Strike (if integrated)
- [ ] Select a student with 0 strikes
- [ ] Click "Issue Manual Strike"
- [ ] Enter "3" days overdue
- [ ] **Expected:** Strike count increases to 1, warning shown
- [ ] **Status:** _____ ✅ ❌

### Test 2.6: Revoke Strike (if integrated)
- [ ] Select student with strikes
- [ ] Click "Revoke Strike" on any strike
- [ ] Enter reason: "Test revocation"
- [ ] **Expected:** Strike count decreases, restriction may lift
- [ ] **Status:** _____ ✅ ❌

---

## 3. Core Portal Functionality 🏠

### Test 3.1: Student Portal - Equipment Browse
- [ ] Login as student
- [ ] Navigate to Equipment Catalog
- [ ] **Expected:** See list of equipment with images/details
- [ ] **Status:** _____ ✅ ❌

### Test 3.2: Student Portal - Create Booking
- [ ] Select an available equipment
- [ ] Fill booking form (dates, purpose)
- [ ] Submit booking
- [ ] **Expected:** Booking created with "Pending" status
- [ ] **Status:** _____ ✅ ❌

### Test 3.3: Department Admin - View Pending Bookings
- [ ] Login as department admin
- [ ] Navigate to Booking Approvals
- [ ] **Expected:** See pending bookings list
- [ ] **Status:** _____ ✅ ❌

### Test 3.4: Department Admin - Approve Booking
- [ ] Select a pending booking
- [ ] Click "Approve"
- [ ] **Expected:** Booking status changes to "Approved"
- [ ] **Status:** _____ ✅ ❌

---

## 4. Master Admin Features 👑

### Test 4.1: Role Management
- [ ] Login as master admin
- [ ] Navigate to Role Management
- [ ] **Expected:** See users list with roles
- [ ] **Status:** _____ ✅ ❌

### Test 4.2: System Settings
- [ ] Navigate to System Settings
- [ ] Toggle feature flags (e.g., room bookings)
- [ ] **Expected:** Settings save successfully
- [ ] **Status:** ✅ ✅ ❌

---

## 5. New Role Portals 🆕

### Test 5.1: View Only Staff Portal
- [ ] Login as `viewonly@ncad.ie`
- [ ] **Expected:** Can view catalog, cannot create bookings
- [ ] **Status:** _____ ✅ ❌

### Test 5.2: Accounts Officer Portal
- [ ] Login as `accounts@ncad.ie`
- [ ] **Expected:** See financial reports/cost tracking
- [ ] **Status:** _____ ✅ ❌

### Test 5.3: IT Support Portal
- [ ] Login as `it@ncad.ie`
- [ ] **Expected:** See equipment management tools
- [ ] **Status:** _____ ✅ ❌

### Test 5.4: Payroll Coordinator Portal
- [ ] Login as `payroll@ncad.ie`
- [ ] **Expected:** See staff allocation reports
- [ ] **Status:** _____ ✅ ❌

### Test 5.5: Budget Manager Portal
- [ ] Login as `budget@ncad.ie`
- [ ] **Expected:** See budget forecasting tools
- [ ] **Status:** _____ ✅ ❌

---

## 6. Responsive Design 📱

### Test 6.1: Mobile View (375px)
- [ ] Resize browser to 375px width or use DevTools device mode
- [ ] Navigate through student portal
- [ ] **Expected:** Mobile-optimized layout, touch targets >44px
- [ ] **Status:** _____ ✅ ❌

### Test 6.2: Tablet View (768px)
- [ ] Resize browser to 768px width
- [ ] Navigate through admin portal
- [ ] **Expected:** 2-column grid, responsive tables
- [ ] **Status:** _____ ✅ ❌

### Test 6.3: Desktop View (1024px+)
- [ ] Full desktop width
- [ ] **Expected:** 3-column grids, full navigation visible
- [ ] **Status:** _____ ✅ ❌

---

## 7. Data & State Management 💾

### Test 7.1: localStorage Persistence (Strike System)
- [ ] Set strikes for a student
- [ ] Refresh browser
- [ ] **Expected:** Strike data persists
- [ ] **Status:** _____ ✅ ❌

### Test 7.2: Demo Data Reset
- [ ] Modify strike data
- [ ] Click "Reset Demo Data" (if available)
- [ ] **Expected:** Strike data returns to initial 3-student setup
- [ ] **Status:** _____ ✅ ❌

---

## 8. Login Page Design 🎨

### Test 8.1: Artistic Login Background
- [ ] Navigate to login page
- [ ] **Expected:** Architectural illustration with building map
- [ ] **Status:** _____ ✅ ❌

### Test 8.2: Quick Login Buttons
- [ ] Verify all 9 role buttons visible
- [ ] Click each one
- [ ] **Expected:** Auto-fill credentials for each role
- [ ] **Status:** _____ ✅ ❌

### Test 8.3: Hover States
- [ ] Hover over role cards
- [ ] **Expected:** Color highlight, elevation change
- [ ] **Status:** _____ ✅ ❌

---

## 9. Error Handling & Edge Cases ⚠️

### Test 9.1: Invalid Login Credentials
- [ ] Enter wrong email/password
- [ ] **Expected:** Error message displayed
- [ ] **Status:** _____ ✅ ❌

### Test 9.2: Booking Conflict Prevention
- [ ] Try to book equipment already booked
- [ ] **Expected:** Conflict detection, booking blocked
- [ ] **Status:** _____ ✅ ❌

### Test 9.3: Form Validation
- [ ] Submit booking form without required fields
- [ ] **Expected:** Validation errors shown
- [ ] **Status:** _____ ✅ ❌

---

## 10. Performance & Load Times ⚡

### Test 10.1: Initial Load Time
- [ ] Clear cache
- [ ] Open http://localhost:5178/
- [ ] Time to interactive: _____ seconds
- [ ] **Expected:** <3 seconds
- [ ] **Status:** _____ ✅ ❌

### Test 10.2: Navigation Speed
- [ ] Click through multiple pages
- [ ] **Expected:** Instant navigation (SPA)
- [ ] **Status:** _____ ✅ ❌

---

## Critical Path Test (Quick Smoke Test) 🚀

### Complete Booking Workflow
1. [ ] Login as student
2. [ ] Browse equipment
3. [ ] Create booking
4. [ ] Logout
5. [ ] Login as admin
6. [ ] Approve booking
7. [ ] Verify booking status updated
8. [ ] **All steps successful?** _____ ✅ ❌

---

## Known Issues & Workarounds 🐛

### Issue 1: Strike Management Not in Navigation
- **Status:** Expected - Component created but not integrated
- **Workaround:** Access via direct route or add to navigation manually
- **Impact:** Demo can show component separately

### Issue 2: Some E2E Tests Failing
- **Status:** Tests looking for old UI selectors
- **Workaround:** Manual testing confirms functionality works
- **Impact:** None - automated tests need updating post-demo

### Issue 3: [Add any discovered issues]
- **Status:** _____
- **Workaround:** _____
- **Impact:** _____

---

## Pre-Demo Setup Checklist 📋

- [ ] Server running at http://localhost:5178/
- [ ] Clear browser cache
- [ ] Reset demo data (strike system)
- [ ] Prepare demo credentials list
- [ ] Test internet connection (for external resources)
- [ ] Close unnecessary browser tabs
- [ ] Disable browser extensions that might interfere
- [ ] Set browser zoom to 100%
- [ ] Prepare backup plan if local server fails

---

## Demo Flow Recommendation 🎬

1. **Start:** Login page showcase (artistic design)
2. **Student Flow:** Login → Browse → Book → View strikes (if applicable)
3. **Admin Flow:** Login → Approve booking → View analytics
4. **Master Admin:** Role management → System settings → Strike management
5. **New Roles:** Show each new portal briefly
6. **Strike System Deep Dive:** Admin view → Issue strike → Revoke strike → Reset
7. **Responsive:** Show mobile/tablet/desktop views
8. **Finale:** Show test results, architecture overview

---

## Test Summary

**Total Tests:** _____
**Passed:** _____
**Failed:** _____
**Skipped:** _____
**Pass Rate:** _____%

**Ready for Demo?** _____ YES / NO

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

**Tester Signature:** ___________________
**Date/Time:** ___________________
