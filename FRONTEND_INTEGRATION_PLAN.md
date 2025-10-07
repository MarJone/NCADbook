# Frontend Integration One-Shot Plan
**Project:** NCADbook Equipment Booking System
**Date:** 2025-10-07
**Status:** Backend 100% Complete → Frontend Integration Phase

---

## Executive Summary

**Backend Status:** ✅ 100% Complete (50+ API endpoints, all tested)
**Frontend Status:** ⚠️ ~60% Complete (28 files still using demoMode)
**Estimated Time:** 3-6 hours to 100% completion
**Goal:** Replace all demoMode calls with backend API integration

---

## Current State Analysis

### ✅ Already Integrated (Student Portal)
- `src/portals/student/StudentDashboard.jsx` → bookingsAPI ✅
- `src/portals/student/EquipmentBrowse.jsx` → equipmentAPI ✅
- `src/components/booking/BookingModal.jsx` → bookingService → bookingsAPI ✅
- `src/components/booking/BookingConflictCalendar.jsx` → bookingsAPI ✅
- `src/components/booking/MultiItemBookingModal.jsx` → equipmentAPI, bookingsAPI ✅
- `src/services/booking.service.js` → bookingsAPI ✅
- `src/services/auth.service.js` → authAPI ✅

### ⚠️ Needs Integration (28 Files)

**Admin Portal Components (12 files):**
1. `src/portals/admin/Dashboard.jsx` - Main admin dashboard
2. `src/portals/admin/Analytics.jsx` - Analytics dashboard
3. `src/portals/admin/UserManagement.jsx` - User CRUD
4. `src/portals/admin/EquipmentManagement.jsx` - Equipment CRUD (partially done)
5. `src/portals/admin/FeatureFlagManager.jsx` - System settings
6. `src/portals/admin/KitManagement.jsx` - Equipment kits
7. `src/portals/admin/SubAreaManagement.jsx` - Departments
8. `src/portals/admin/SubAreaAdminDashboard.jsx` - Dept admin view
9. `src/portals/admin/AdminPermissions.jsx` - Permission management
10. `src/portals/admin/InterdisciplinaryAccess.jsx` - Cross-dept access
11. `src/portals/admin/ManageAccessRequests.jsx` - Access requests
12. `src/portals/admin/StudentAssignment.jsx` - Student assignment

**Service Files (10 files):**
1. `src/services/systemSettings.service.js` - Feature flags
2. `src/services/subArea.service.js` - Departments
3. `src/services/equipmentKits.service.js` - Equipment kits
4. `src/services/strike.service.js` - User strikes
5. `src/services/department.service.js` - Department management
6. `src/services/csv-import.service.js` - CSV imports
7. `src/services/crossDepartmentRequests.service.js` - Cross-dept requests
8. `src/services/staffPermissions.service.js` - Staff permissions
9. `src/services/space.service.js` - Room bookings (future feature)
10. `src/services/equipmentKits.service.js` - Kit management

**Other Portals (6 files):**
- Staff portal components (4 files) - Room booking features
- IT Support portal (1 file)
- Accounts Officer portal (1 file)
- View-only staff portal (1 file)

---

## One-Shot Integration Plan

### Phase 1: Core Services (HIGH PRIORITY) - 1 hour

**Goal:** Update service layer to use backend API instead of demoMode

#### 1.1 System Settings Service
**File:** `src/services/systemSettings.service.js`
**API:** `systemSettingsAPI`
**Methods to update:**
```javascript
// Before
const settings = await demoMode.query('system_settings', {});

// After
const response = await systemSettingsAPI.getAll();
const settings = response.settings;
```

**Endpoints:**
- `isCrossDepartmentBrowsingEnabled()` → `systemSettingsAPI.getByKey('cross_department_browsing')`
- `areEquipmentKitsEnabled()` → `systemSettingsAPI.getByKey('equipment_kits_enabled')`
- `updateSystemSetting()` → `systemSettingsAPI.update(key, value, description)`

#### 1.2 Sub-Area (Departments) Service
**File:** `src/services/subArea.service.js`
**API:** `departmentsAPI`
**Methods to update:**
```javascript
// Before
const areas = await demoMode.query('sub_areas', {});

// After
const response = await departmentsAPI.getAll();
const areas = response.departments;
```

**Endpoints:**
- `getAllSubAreas()` → `departmentsAPI.getAll()`
- `getAccessibleEquipment()` → Use `equipmentAPI.getAll()` with department filter

#### 1.3 Equipment Kits Service
**File:** `src/services/equipmentKits.service.js`
**API:** `equipmentKitsAPI`
**Methods to update:**
```javascript
// Before
const kits = await demoMode.query('equipment_kits', { department_id });

// After
const response = await equipmentKitsAPI.getAll({ department_id });
const kits = response.kits;
```

**Endpoints:**
- `getAllKits()` → `equipmentKitsAPI.getAll()`
- `getKitById()` → `equipmentKitsAPI.getById(id)`
- `createKit()` → `equipmentKitsAPI.create(kitData)`
- `updateKit()` → `equipmentKitsAPI.update(id, kitData)`

#### 1.4 Strike Service
**File:** `src/services/strike.service.js`
**API:** `usersAPI`
**Methods to update:**
```javascript
// Before
await demoMode.insert('strike_history', { ... });
await demoMode.update('users', userId, { strike_count: newCount });

// After
await usersAPI.addStrike(userId, { reason, booking_id });
```

**Endpoints:**
- `addStrike()` → `usersAPI.addStrike(userId, { reason, booking_id })`
- `getUserStrikes()` → `usersAPI.getStrikes(userId)`

---

### Phase 2: Admin Portal Components (HIGH PRIORITY) - 2 hours

#### 2.1 Analytics.jsx
**File:** `src/portals/admin/Analytics.jsx`
**API:** `analyticsAPI`
**Changes:**
```javascript
// Before
const bookings = await demoMode.query('bookings', { ... });
// Manual aggregation in frontend

// After
const { analytics } = await analyticsAPI.getDashboard({
  start_date: startDate,
  end_date: endDate,
  department: selectedDepartment
});

// Use: analytics.summary, analytics.bookings_by_status, etc.
```

**Export functionality:**
```javascript
// CSV Export
await analyticsAPI.exportCSV({
  start_date: startDate,
  end_date: endDate,
  type: 'bookings' // or 'equipment'
});

// PDF Export (using jsPDF - already in package.json)
import { jsPDF } from 'jspdf';
const pdf = new jsPDF();
// Add analytics data to PDF
pdf.save('analytics_report.pdf');
```

#### 2.2 UserManagement.jsx
**File:** `src/portals/admin/UserManagement.jsx`
**API:** `usersAPI`
**Changes:**
```javascript
// Load users
const { users, pagination } = await usersAPI.getAll({
  role: roleFilter,
  department: deptFilter,
  search: searchQuery,
  limit: 50,
  offset: page * 50
});

// Create user
await usersAPI.create({
  email, password, full_name, first_name, surname,
  role, department
});

// Update user
await usersAPI.update(userId, { role, department, strike_count });

// Delete user
await usersAPI.delete(userId);

// Add strike
await usersAPI.addStrike(userId, { reason, booking_id });
```

#### 2.3 FeatureFlagManager.jsx
**File:** `src/portals/admin/FeatureFlagManager.jsx`
**API:** `systemSettingsAPI`
**Changes:**
```javascript
// Load all settings
const { settings } = await systemSettingsAPI.getAll();

// Update setting
await systemSettingsAPI.update('cross_department_browsing', true, 'Enable cross-department browsing');
```

#### 2.4 KitManagement.jsx
**File:** `src/portals/admin/KitManagement.jsx`
**API:** `equipmentKitsAPI`
**Changes:**
```javascript
// Load kits
const { kits } = await equipmentKitsAPI.getAll({ department_id, is_active: true });

// Create kit
await equipmentKitsAPI.create({
  id: kitId,
  name,
  description,
  department_id,
  equipment_ids: [1, 2, 3]
});

// Update kit
await equipmentKitsAPI.update(kitId, { name, equipment_ids });

// Delete kit
await equipmentKitsAPI.delete(kitId);
```

#### 2.5 SubAreaManagement.jsx
**File:** `src/portals/admin/SubAreaManagement.jsx`
**API:** `departmentsAPI`
**Changes:**
```javascript
// Load departments
const { departments } = await departmentsAPI.getAll({ school: schoolFilter });

// Create department
await departmentsAPI.create({
  id: deptId,
  name,
  school,
  description
});

// Update department
await departmentsAPI.update(deptId, { name, description });

// Delete department
await departmentsAPI.delete(deptId);
```

#### 2.6 Dashboard.jsx (Admin)
**File:** `src/portals/admin/Dashboard.jsx`
**API:** `analyticsAPI`, `bookingsAPI`
**Changes:**
```javascript
// Get quick stats
const { analytics } = await analyticsAPI.getDashboard();

// Get recent bookings
const { bookings } = await bookingsAPI.getAll({
  status: 'pending',
  limit: 10
});

// Use analytics.summary for cards:
// - analytics.summary.total_bookings
// - analytics.summary.active_users
// - analytics.bookings_by_status
```

---

### Phase 3: Booking Workflow Components (MEDIUM PRIORITY) - 1 hour

#### 3.1 Admin Booking Components
**Files:**
- `src/portals/admin/AdminPermissions.jsx`
- `src/portals/admin/ManageAccessRequests.jsx`
- `src/portals/admin/StudentAssignment.jsx`

**Changes:**
- Replace demoMode queries with bookingsAPI
- Use usersAPI for user searches
- Use departmentsAPI for department filters

---

### Phase 4: Staff & Other Portals (LOW PRIORITY) - Optional

**Note:** These are future features (room/space booking) that may not be implemented yet in the backend.

**Files:**
- `src/portals/staff/*.jsx` (4 files) - Room booking
- `src/portals/it-support/ITSupportPortal.jsx`
- `src/portals/accounts-officer/AccountsOfficerPortal.jsx`
- `src/portals/view-only-staff/ViewOnlyStaffPortal.jsx`

**Decision:**
- Check if these features are in scope
- If yes, create backend endpoints
- If no, mark as "Future Enhancement"

---

### Phase 5: CSV Import (MEDIUM PRIORITY) - 30 minutes

**File:** `src/services/csv-import.service.js`
**API:** `csvAPI` (already exists)
**Status:** Likely already integrated, just verify

**Verify endpoints:**
```javascript
// Preview CSV
await csvAPI.preview(file, 'users');

// Import users
await csvAPI.importUsers(file);

// Import equipment
await csvAPI.importEquipment(file);
```

---

## Implementation Checklist

### Pre-Integration Tasks
- [ ] Ensure backend server is running (port 3001)
- [ ] Ensure frontend server is running (port 5173)
- [ ] Create a new git branch: `git checkout -b frontend-api-integration`

### Service Layer Updates (Phase 1)
- [ ] Update `systemSettings.service.js`
- [ ] Update `subArea.service.js`
- [ ] Update `equipmentKits.service.js`
- [ ] Update `strike.service.js`
- [ ] Test each service in browser console

### Admin Portal Updates (Phase 2)
- [ ] Update `Analytics.jsx` with analyticsAPI
- [ ] Update `UserManagement.jsx` with usersAPI
- [ ] Update `FeatureFlagManager.jsx` with systemSettingsAPI
- [ ] Update `KitManagement.jsx` with equipmentKitsAPI
- [ ] Update `SubAreaManagement.jsx` with departmentsAPI
- [ ] Update `Dashboard.jsx` with API calls

### Manual Testing
- [ ] Test Analytics dashboard loads with real data
- [ ] Test CSV export downloads file
- [ ] Test user CRUD operations
- [ ] Test equipment kit creation
- [ ] Test system settings toggle
- [ ] Test department management

### Cleanup
- [ ] Remove all demoMode imports
- [ ] Delete `src/mocks/demo-mode.js` (if no longer needed)
- [ ] Update any remaining service files
- [ ] Run linter/formatter

### Final Validation
- [ ] Run Playwright tests: `npm test`
- [ ] Fix any broken tests
- [ ] Manual smoke test of critical flows
- [ ] Commit changes: `git commit -m "feat: Complete frontend API integration"`
- [ ] Merge to master and push

---

## API Quick Reference

### Available Backend APIs (from src/utils/api.js)

```javascript
import {
  authAPI,           // Login, register, password management
  equipmentAPI,      // Equipment CRUD, notes, availability
  bookingsAPI,       // Booking CRUD, approve/deny/return
  usersAPI,          // User CRUD, strikes, search
  departmentsAPI,    // Department CRUD
  systemSettingsAPI, // System settings/feature flags
  equipmentKitsAPI,  // Equipment kits CRUD
  csvAPI,            // CSV import/export
  analyticsAPI       // Dashboard, utilization, CSV export
} from '../utils/api.js';
```

### Common Patterns

**Fetching Data:**
```javascript
const { resources, pagination } = await resourceAPI.getAll({
  filter1: value1,
  limit: 50,
  offset: 0
});
```

**Creating:**
```javascript
const { resource } = await resourceAPI.create(resourceData);
```

**Updating:**
```javascript
const { resource } = await resourceAPI.update(id, updateData);
```

**Deleting:**
```javascript
await resourceAPI.delete(id);
```

**Error Handling:**
```javascript
try {
  const result = await resourceAPI.getAll();
} catch (error) {
  console.error('API error:', error);
  showToast(error.message, 'error');
}
```

---

## Testing Strategy

### 1. Unit Testing (Service Layer)
Test each service method in isolation:
```javascript
// Example: Test systemSettings.service.js
const { settings } = await systemSettingsAPI.getAll();
console.log('Settings loaded:', settings);
```

### 2. Integration Testing (Components)
Test components load data correctly:
- Open Analytics page → Verify data displays
- Create a user → Verify appears in list
- Toggle feature flag → Verify state updates

### 3. End-to-End Testing (User Flows)
Critical flows to test:
1. **Student Flow:**
   - Browse equipment → Book item → View booking
   - Check booking appears in admin dashboard

2. **Admin Flow:**
   - Approve booking → Verify student sees approved status
   - Export analytics CSV → Verify file downloads
   - Create equipment kit → Verify appears in student view

3. **Master Admin Flow:**
   - Create user → Verify login works
   - Toggle feature flag → Verify affects UI
   - Manage departments → Verify cascade effects

### 4. Automated Testing
```bash
# Run all Playwright tests
npm test

# Run specific test suite
npm test -- tests/integration/admin-portal.spec.js

# Run with UI
npm test -- --ui

# Debug mode
npm test -- --debug
```

---

## Risk Mitigation

### High Risk Areas
1. **Authentication Flow**
   - Risk: Token expiry, refresh issues
   - Mitigation: Test login/logout thoroughly

2. **Data Migration**
   - Risk: Old localStorage data conflicts with API
   - Mitigation: Clear localStorage on first API load

3. **Permission Checks**
   - Risk: Role-based access not enforced
   - Mitigation: Test with different user roles

### Rollback Plan
If integration fails:
1. Keep demoMode code commented (don't delete)
2. Create feature flag: `USE_BACKEND_API`
3. Can toggle between demoMode and API
4. Gradual migration component by component

---

## Success Criteria

### Definition of Done
- [ ] Zero demoMode imports in production code
- [ ] All 28 identified files updated
- [ ] All Playwright tests passing
- [ ] Manual testing completed for:
  - [ ] Student portal
  - [ ] Admin portal
  - [ ] Analytics dashboard
  - [ ] User management
  - [ ] CSV export
- [ ] No console errors in browser
- [ ] Performance acceptable (<3s page loads)
- [ ] All features working as before (but with real backend)

### Metrics to Verify
- **API Response Times:** <500ms for most endpoints
- **Page Load Times:** <3 seconds
- **Test Coverage:** 80%+ passing tests
- **Error Rate:** <1% API errors

---

## Timeline Estimate

| Phase | Task | Time | Running Total |
|-------|------|------|---------------|
| 1 | Update 4 service files | 1h | 1h |
| 2 | Update 6 admin portal components | 2h | 3h |
| 3 | Update booking workflow components | 1h | 4h |
| 4 | CSV import verification | 0.5h | 4.5h |
| 5 | Manual testing & fixes | 1h | 5.5h |
| 6 | Automated testing & fixes | 0.5h | 6h |

**Total: 6 hours (best case: 3 hours if no issues)**

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Set up test environment** (backend + frontend running)
3. **Create integration branch** (`git checkout -b frontend-api-integration`)
4. **Start with Phase 1** (Service Layer - highest impact, lowest risk)
5. **Test incrementally** (after each service file, test in browser)
6. **Move to Phase 2** (Admin Portal - one component at a time)
7. **Continuous testing** (manual test after each component)
8. **Final validation** (run full test suite)
9. **Merge and deploy** (commit, merge to master, push)

---

## Questions to Answer Before Starting

1. **Are room/space booking features in scope?**
   - If yes: Need to create backend endpoints
   - If no: Mark staff portal files as "Future Enhancement"

2. **Should we keep demoMode as fallback?**
   - Recommendation: Remove completely for cleaner code
   - Alternative: Keep behind feature flag

3. **What's the testing priority?**
   - Option A: Test everything at the end
   - Option B: Test incrementally after each phase
   - Recommendation: Option B (incremental testing)

4. **Deployment strategy?**
   - Deploy backend first (already done ✅)
   - Then deploy frontend after integration
   - Or: Deploy both together after integration

---

## Resources

### Documentation
- Backend API Documentation: `API_INTEGRATION_COMPLETE.md`
- Frontend API Client: `src/utils/api.js`
- Project Memory: `ProjectMemory.md`

### Key Files
- **API Client:** `src/utils/api.js` (all API methods)
- **Auth Service:** `src/services/auth.service.js` (already integrated)
- **Booking Service:** `src/services/booking.service.js` (already integrated)

### Backend Endpoints
- **Base URL:** `http://localhost:3001/api`
- **Health Check:** `http://localhost:3001/health`
- **API Routes:** All registered in `backend/src/server.js`

---

**Ready to Start?** Let's do this! 🚀
