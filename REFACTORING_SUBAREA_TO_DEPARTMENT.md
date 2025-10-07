# SubArea → Department Refactoring

**Date:** 2025-10-07
**Status:** Phase 1 Complete (Frontend Core Services)
**Remaining Work:** Variable renaming in 4 admin components + database schema updates

---

## Overview

This refactoring replaces all references to "subArea", "sub-area", and "sub_area" with "Department" throughout the codebase for improved clarity and consistency. The term "sub-area" was originally used for the second level of admin hierarchy (below master admin), but "Department" is more intuitive and aligns with the domain language.

---

## Completed Work

### ✅ Service Layer (100% Complete)

**Files Modified:**
1. **`src/services/subArea.service.js`** → **REMOVED**
   - Obsolete file removed from codebase
   - All functionality migrated to `department.service.js`

2. **`src/services/department.service.js`** → **UPDATED**
   - Added API integration (replaced demoMode with backend APIs)
   - Functions use `departmentsAPI`, `equipmentAPI`, `usersAPI`
   - All CRUD operations now hit backend endpoints
   - Advanced features (dept admins, student assignments, interdisciplinary access) still use demoMode pending backend implementation

**Function Mapping:**
- `getAllSubAreas()` → `getAllDepartments()`
- `getSubAreaById()` → `getDepartmentById()`
- `createSubArea()` → `createDepartment()`
- `updateSubArea()` → `updateDepartment()`
- `deactivateSubArea()` → `deactivateDepartment()`
- `getEquipmentCountBySubArea()` → `getEquipmentCountByDepartment()`
- `getUserSubAreas()` → `getUserDepartments()`
- `getStudentsInSubArea()` → `getStudentsInDepartment()`
- `assignStudentToSubArea()` → `assignStudentToDepartment()`
- `removeStudentFromSubArea()` → `removeStudentFromDepartment()`
- `checkUserSubAreaAccess()` → `checkUserDepartmentAccess()`
- `getSubAreaAdminRequests()` → `getDepartmentAdminRequests()`

### ✅ Component Updates (60% Complete)

**Fully Updated:**
1. **`src/portals/student/EquipmentBrowse.jsx`**
   - 13 occurrences updated
   - State variables: `subAreas` → `departments`, `subAreaFilter` → `departmentFilter`
   - Function: `loadSubAreas()` → `loadDepartments()`, `getSubAreaName()` → `getDepartmentName()`
   - All JSX references updated

2. **`src/portals/admin/AccessRequests.jsx`**
   - 9 occurrences updated
   - State: `subAreas` → `departments`, `selectedSubArea` → `selectedDepartment`
   - Logic updated to use `managed_department_id` instead of `managed_sub_area_id`
   - Form fields and error messages updated

3. **Import Statements Updated in 3 Files:**
   - `EquipmentBrowse.jsx`
   - `ManageAccessRequests.jsx`
   - `AccessRequests.jsx`
   - All now import from `department.service` instead of `subArea.service`

---

## Remaining Work

### ⚠️ Component Variable Updates (4 files)

**High Priority - User Facing:**

1. **`src/portals/admin/InterdisciplinaryAccess.jsx`** (7 occurrences)
   - Grant interdepartmental access UI
   - ~10 minutes

2. **`src/portals/admin/ManageAccessRequests.jsx`** (3 occurrences)
   - Master admin review interface
   - ~5 minutes

3. **`src/portals/admin/StudentAssignment.jsx`** (9 occurrences)
   - Student-to-department assignment UI
   - ~10 minutes

4. **`src/portals/admin/SubAreaAdminDashboard.jsx`** (3 occurrences + file rename)
   - Rename file to `DepartmentAdminDashboard.jsx`
   - Update internal references
   - ~10 minutes

**Estimated Time:** 35 minutes

### 📊 Database Schema (Medium Priority)

**Files Needing Updates:**
- `backend/src/config/seedDatabase.js` - Table name references
- `backend/src/config/resetDatabase.js` - Table name references
- `backend/src/config/setupDatabase.js` - Table name `sub_areas` → `departments`
- `src/database/migrations/sub_areas_system.sql` - Migration file (consider renaming)
- `src/mocks/demo-data.js` - Demo data table references
- `src/mocks/demo-data-phase8.js` - Demo data references
- `src/mocks/demo-mode.js` - Query references

**Note:** Actual PostgreSQL table schema can be migrated later with a proper database migration script. For now, the backend API already uses "departments" terminology, providing an abstraction layer.

**Estimated Time:** 30 minutes

### 📝 Documentation (Low Priority)

**Files to Update:**
- `docs/development/SUB_AREA_IMPLEMENTATION_GUIDE.md` - Rename/rewrite
- `docs/development/PHASE_7_ROADMAP.md` - Update terminology
- `docs/development/PHASE_7_STARTER_PROMPT.md` - Update terminology
- `docs/PHASE_8_ROADMAP.md` - Update references
- `CLAUDE.md` - Update any sub-area references

**Estimated Time:** 20 minutes

---

## Testing Checklist

### Before Committing Next Phase:

- [ ] **Student Portal:**
  - [ ] Browse equipment with department filter
  - [ ] Search works correctly
  - [ ] Department names display properly

- [ ] **Admin Portal:**
  - [ ] Department management (create/edit/delete)
  - [ ] Access request submission
  - [ ] Access request approval (master admin)
  - [ ] Student assignment to departments
  - [ ] Interdisciplinary access grants

- [ ] **API Integration:**
  - [ ] Backend responds to `/api/departments` endpoints
  - [ ] Department CRUD operations work
  - [ ] Equipment filtering by department works

### Smoke Test Script:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend
npm run dev

# 3. Test flows:
# - Login as student → browse equipment → filter by department
# - Login as dept admin → view dashboard → request access
# - Login as master admin → approve requests → assign students
```

---

## Migration Strategy

### Phase 1: Frontend (Current - 60% Complete)
- ✅ Service layer
- ✅ Core student-facing components
- ⚠️ Admin components (in progress)

### Phase 2: Demo Data (Pending)
- Update `demo-data.js` table references
- Update mock data generators
- Ensure backward compatibility during transition

### Phase 3: Backend Schema (Future)
- Create migration script: `ALTER TABLE sub_areas RENAME TO departments`
- Update foreign key column names: `sub_area_id` → `department_id`
- Comprehensive backend testing
- Deploy with zero downtime

### Phase 4: Documentation (Final)
- Update all documentation
- Update README and guides
- Archive old terminology references

---

## Breaking Changes

### API Changes:
None - Backend API already uses "departments" terminology

### Database Changes:
**Pending** - Will require migration when Phase 3 is implemented:
- Table rename: `sub_areas` → `departments`
- Column renames:
  - `sub_area_id` → `department_id`
  - `from_sub_area_id` → `from_department_id`
  - `to_sub_area_id` → `to_department_id`
  - `managed_sub_area_id` → `managed_department_id`

### User-Facing Changes:
- UI labels changed from "Sub-Area" to "Department"
- More intuitive terminology throughout the application
- **No functional changes** - all features work identically

---

## Rollback Plan

If issues arise:

1. **Service Layer:** Revert commit, restore `subArea.service.js`
2. **Components:** Revert specific component files
3. **Database:** No changes made yet, safe to continue
4. **Testing:** Run full test suite before next phase

---

## Lessons Learned

1. **Service Layer First:** Starting with the service layer provided a clean foundation
2. **API Abstraction:** Backend already using "departments" made frontend migration easier
3. **Incremental Approach:** Breaking refactoring into phases reduces risk
4. **Documentation:** This document helps team understand scope and progress

---

## Next Session Checklist

When resuming this refactoring:

1. [ ] Read this document
2. [ ] Pull latest from master
3. [ ] Run tests to ensure no regressions
4. [ ] Continue with "Remaining Work" section above
5. [ ] Update this document as you complete each section
6. [ ] Commit incrementally with descriptive messages

---

## Commit Message Template

```
refactor(departments): Complete subArea → department terminology migration

BREAKING CHANGE: [Only if database schema changes]

Phase X completed:
- Updated [files]
- Renamed [functions/variables]
- Tested [features]

Remaining: [List remaining work]

Related: REFACTORING_SUBAREA_TO_DEPARTMENT.md
```

---

**Last Updated:** 2025-10-07
**Next Review:** Before Phase 2 (Demo Data Updates)
