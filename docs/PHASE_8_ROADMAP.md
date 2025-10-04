# Phase 8: Enhanced Cross-Department Access & Equipment Kit Management

## Overview

This phase implements a comprehensive cross-departmental equipment sharing system with master admin controls, staff request workflows, and department-specific equipment kit management.

## Key Changes Summary

### 1. Department Structure Overhaul
- **Old**: 7 departments (flat structure)
- **New**: 4 Schools + First Year Studies with 22 departments
  - School of Design (8 departments)
  - School of Fine Art (5 departments)
  - School of Education (3 departments)
  - School of Visual Culture (3 departments)
  - First Year Studies (1 program)

### 2. Student Equipment Access Control
- **Old Behavior**: Students could toggle "Browse Other Departments" themselves
- **New Behavior**:
  - Students ONLY see their own department's equipment by default
  - Master admin controls a global "Cross-Department Browsing" toggle
  - When activated, students see a department filter/flag to browse other departments
  - Filter only appears when master admin has enabled the feature

### 3. Staff Cross-Department Equipment Requests
- **New Feature**: Staff can request equipment from other departments
- **Workflow**:
  1. Staff member creates request (e.g., "Need 10 cameras for Fine Art Media workshop")
  2. Request includes: equipment type, quantity, dates, justification
  3. Request is broadcast to department admin(s) of target department
  4. Department admin can approve or deny
  5. If approved, staff receives notification with instructions
  6. Equipment becomes temporarily accessible for the approved period

### 4. Equipment Kits Management
- **New Feature**: Department admins can create equipment "kits" (bundles)
- **Scope**: Only visible to students in that admin's department
- **Examples**:
  - "Video Production Kit" (camera + tripod + mic + lighting)
  - "Photography Starter Kit" (DSLR + lens + SD card + bag)
  - "Illustration Digital Kit" (tablet + stylus + laptop)
- **Booking**: Students can book an entire kit as one transaction

## Database Schema Changes

### New Tables

#### `system_settings`
Global system configuration controlled by master admin.

```sql
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  modified_by TEXT REFERENCES users(id),
  modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Initial data
INSERT INTO system_settings (key, value, description) VALUES
  ('cross_department_browsing_enabled', 'false', 'Allow students to browse equipment from other departments'),
  ('staff_cross_department_requests_enabled', 'true', 'Allow staff to request equipment from other departments'),
  ('equipment_kits_enabled', 'true', 'Enable equipment kit functionality');
```

#### `equipment_kits`
Department-specific equipment bundles.

```sql
CREATE TABLE equipment_kits (
  id TEXT PRIMARY KEY DEFAULT generate_ulid(),
  name TEXT NOT NULL,
  description TEXT,
  department_id TEXT REFERENCES sub_areas(id),
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  equipment_ids TEXT[] NOT NULL, -- Array of equipment IDs in this kit
  image_url TEXT
);
```

#### `cross_department_requests`
Staff requests for equipment from other departments.

```sql
CREATE TABLE cross_department_requests (
  id TEXT PRIMARY KEY DEFAULT generate_ulid(),
  requesting_user_id TEXT REFERENCES users(id),
  requesting_department_id TEXT REFERENCES sub_areas(id),
  target_department_id TEXT REFERENCES sub_areas(id),
  equipment_type TEXT NOT NULL, -- e.g., "Camera", "Lighting"
  quantity INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  justification TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `kit_bookings`
Track bookings of equipment kits (linked to regular bookings table).

```sql
CREATE TABLE kit_bookings (
  id TEXT PRIMARY KEY DEFAULT generate_ulid(),
  kit_id TEXT REFERENCES equipment_kits(id),
  booking_ids TEXT[] NOT NULL, -- Array of individual booking IDs
  user_id TEXT REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Modified Tables

#### `users`
Update department field to reference new department structure.

```sql
-- Add school field
ALTER TABLE users ADD COLUMN school TEXT;
-- department field remains but now references departments.js config
```

#### `equipment`
Update department field to reference new structure.

```sql
-- department field now references departments.js config
-- No schema change needed, just data migration
```

## File Structure

### New Files

```
src/
  config/
    departments.js                      # ✅ CREATED - Department/school structure
  portals/
    master-admin/
      SystemSettings.jsx                # Master admin settings page
    department-admin/
      EquipmentKits.jsx                 # Kit management interface
      EquipmentKitForm.jsx              # Create/edit kit form
      CrossDepartmentRequests.jsx       # View/manage incoming requests
    staff/
      CrossDepartmentRequestForm.jsx    # Staff request form
      MyCrossDepartmentRequests.jsx     # Staff request history
  components/
    equipment/
      KitCard.jsx                       # Display equipment kit
      KitDetailsModal.jsx               # Kit details with equipment list
    common/
      DepartmentSelect.jsx              # Reusable department dropdown
      SchoolFilter.jsx                  # Filter by school
  services/
    systemSettings.service.js           # CRUD for system_settings
    equipmentKits.service.js            # Kit management
    crossDepartmentRequests.service.js  # Request workflows
  mocks/
    demo-data-system-settings.js        # Demo system settings
    demo-data-equipment-kits.js         # Demo kit data
    demo-data-cross-dept-requests.js    # Demo request data
```

### Files to Modify

```
src/
  portals/
    student/
      EquipmentBrowse.jsx               # Update department filter logic
    master-admin/
      MasterAdminLayout.jsx             # Add SystemSettings link
  components/
    booking/
      BookingModal.jsx                  # Support kit bookings
      MultiItemBookingModal.jsx         # Integrate with kits
  mocks/
    demo-data.js                        # Migrate departments to new structure
    demo-mode.js                        # Add new tables
  services/
    subArea.service.js                  # Update to use new departments.js
```

## Implementation Phases

### Phase 8.1: Department Structure Migration (2-3 hours)
1. ✅ Create `src/config/departments.js` with new structure
2. Create `DepartmentSelect.jsx` component
3. Update demo-data.js to migrate all users/equipment to new departments
4. Update all dropdowns throughout app to use new structure
5. Test department filtering still works

### Phase 8.2: Master Admin System Settings (2 hours)
1. Create `system_settings` table in demo-data
2. Create `systemSettings.service.js`
3. Create `SystemSettings.jsx` master admin page
4. Add toggle for "Cross-Department Browsing"
5. Update `EquipmentBrowse.jsx` to check this setting

### Phase 8.3: Student Department Browsing (1 hour)
1. Remove student's self-controlled toggle
2. Add department flag/filter (only shows when setting enabled)
3. Test students can only browse other depts when enabled

### Phase 8.4: Equipment Kits Management (3-4 hours)
1. Create `equipment_kits` table
2. Create `equipmentKits.service.js`
3. Create `EquipmentKits.jsx` (department admin view)
4. Create `EquipmentKitForm.jsx` (create/edit)
5. Create `KitCard.jsx` and `KitDetailsModal.jsx`
6. Add "Equipment Kits" tab to EquipmentBrowse for students
7. Test kit creation and student visibility

### Phase 8.5: Staff Cross-Department Requests (4-5 hours)
1. Create `cross_department_requests` table
2. Create `crossDepartmentRequests.service.js`
3. Create `CrossDepartmentRequestForm.jsx` (staff)
4. Create `MyCrossDepartmentRequests.jsx` (staff history)
5. Create `CrossDepartmentRequests.jsx` (dept admin approval)
6. Implement notification system (EmailJS or in-app)
7. Test full request → approval → notification workflow

### Phase 8.6: Testing & Documentation (2 hours)
1. Add Playwright tests for new features
2. Update ProjectMemory.md with Phase 8 details
3. Update CLAUDE.md with new architecture
4. Test all roles (student, staff, dept admin, master admin)
5. Verify RLS policies (when moving to Supabase)

## Total Estimated Time: 14-17 hours

## Success Metrics

- ✅ All 22 departments properly structured under 4 schools
- ✅ Students cannot browse other departments unless master admin enables it
- ✅ Department filter only appears when feature is enabled
- ✅ Staff can create cross-department requests
- ✅ Department admins can approve/deny requests
- ✅ Notifications sent on request approval
- ✅ Department admins can create equipment kits
- ✅ Kits only visible to students in that department
- ✅ Students can book entire kits
- ✅ All existing tests pass
- ✅ New tests cover new features

## User Stories

### Student
- "As a student, I only see equipment from my department unless the admin has opened cross-department browsing"
- "As a student, when cross-browsing is enabled, I can click a flag/filter to browse other departments' equipment"
- "As a student, I can see and book equipment kits curated by my department admin"

### Staff
- "As a staff member, I can request access to another department's equipment for a workshop"
- "As a staff member, I receive a notification when my request is approved with instructions"

### Department Admin
- "As a department admin, I can create equipment kits (bundles) for my students"
- "As a department admin, I receive requests from staff for my department's equipment"
- "As a department admin, I can approve or deny cross-department requests with notes"

### Master Admin
- "As a master admin, I can enable/disable cross-department browsing for all students"
- "As a master admin, I can see all cross-department requests across the system"

## Migration Notes

### Data Migration Required

1. **Users Table**: Update department values from old to new
   - "Moving Image" → "MOVING_IMAGE_DESIGN"
   - "Graphic Design" → "GRAPHIC_DESIGN"
   - "Illustration" → "ILLUSTRATION"
   - etc.

2. **Equipment Table**: Update department values
   - Same mapping as users

3. **Sub-Areas Table**: Rename or migrate to match new department structure

### Backwards Compatibility

- Old department names will be migrated automatically
- Existing bookings remain unchanged
- Existing access requests remain unchanged

## Security Considerations

### Row Level Security (RLS) Policies for Supabase

```sql
-- Equipment Kits: Only department admins can create/edit their department's kits
CREATE POLICY equipment_kits_admin_manage ON equipment_kits
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM users
      WHERE role IN ('department_admin', 'master_admin')
      AND managed_department_id = equipment_kits.department_id
    )
  );

-- Equipment Kits: Students can view kits from their department
CREATE POLICY equipment_kits_student_view ON equipment_kits
  FOR SELECT USING (
    department_id IN (
      SELECT department FROM users WHERE id = auth.uid()
    )
  );

-- Cross-Department Requests: Staff can create requests
CREATE POLICY cross_dept_requests_staff_create ON cross_department_requests
  FOR INSERT WITH CHECK (
    requesting_user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'staff')
  );

-- Cross-Department Requests: Department admins can view/update requests for their department
CREATE POLICY cross_dept_requests_admin_manage ON cross_department_requests
  FOR ALL USING (
    target_department_id IN (
      SELECT managed_department_id FROM users
      WHERE id = auth.uid() AND role IN ('department_admin', 'master_admin')
    )
  );
```

## UI/UX Considerations

### Student Equipment Browse
- **Before**: Toggle always visible, students control it
- **After**:
  - No toggle by default
  - When master admin enables feature, a "🏴 Browse Other Departments" button/filter appears
  - Filter shows departments grouped by school for easy navigation

### Staff Request Form
- **Fields**:
  - Target Department (dropdown, grouped by school)
  - Equipment Type (text or category dropdown)
  - Quantity (number)
  - Date Range (start/end date pickers)
  - Justification (textarea, required, min 50 characters)
- **Validation**:
  - Cannot request from own department
  - Date range must be in future
  - Quantity must be reasonable (< 50 items)

### Department Admin Kit Management
- **List View**: Table of existing kits with edit/delete/activate/deactivate
- **Form**:
  - Kit Name (text, required)
  - Description (textarea)
  - Equipment Selection (multi-select from department's equipment)
  - Image (upload or URL)
  - Is Active (toggle)

### Department Admin Request Inbox
- **List View**: Pending requests at top, then approved/denied
- **Card Design**:
  - Requesting staff name and department
  - Equipment type and quantity
  - Date range
  - Justification
  - Approve/Deny buttons (with optional notes textarea)

## Testing Strategy

### Unit Tests
- Department structure helpers (getDepartmentList, getDepartmentsBySchool)
- Service methods (createKit, createRequest, approveRequest)

### Integration Tests
- Student cannot toggle browsing themselves
- Master admin toggle controls student UI
- Staff can create requests
- Department admin can approve requests
- Kits only visible to correct department students

### End-to-End Tests (Playwright)
- Full cross-department request workflow
- Kit creation and booking
- Master admin settings changes reflected in student UI

## Future Enhancements (Post-Phase 8)

- **Analytics**: Track cross-department request patterns
- **Auto-Approval**: Rules for auto-approving certain requests
- **Kit Templates**: Pre-built kit templates for new departments
- **Seasonal Kits**: Time-limited kits (e.g., "Spring Exhibition Kit")
- **Kit Availability Calendar**: Show when entire kits are available
- **Bulk Request Creation**: Request multiple equipment types at once
- **Request Comments**: Discussion thread on requests
- **Email Digests**: Daily/weekly summaries of pending requests

## Notes for Claude Code

When implementing this phase:
1. Start with Phase 8.1 (department structure) as it's the foundation
2. Test thoroughly after each sub-phase
3. Update todos as you progress
4. Commit after each completed sub-phase
5. Update ProjectMemory.md when all of Phase 8 is complete
6. Run full test suite before final commit

## Questions to Resolve

1. Should kits have availability detection (all items available)?
2. Should kit bookings auto-book all individual equipment items?
3. Can staff request "any camera" or must they specify which equipment ID?
4. Should cross-department requests have an expiration (auto-deny after 7 days)?
5. Should students see a notification when cross-browsing is enabled?

---

**Document Created**: 2025-01-04
**Status**: Ready for Implementation
**Estimated Completion**: Phase 8 End (14-17 hours)
