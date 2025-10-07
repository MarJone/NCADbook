# Sub-Area System Implementation Guide

## Overview
This guide provides complete instructions for implementing the sub-area system for department isolation and interdisciplinary access in the NCAD Equipment Booking System.

---

## What's Been Completed

### ✅ Phase 1: Visual Design (100% Complete)
- **Pastel color scheme** applied throughout
  - Primary: Soft rose (#e8a0a8)
  - Secondary: Soft teal (#7bbfd4)
  - Tertiary: Soft lavender (#b5a8d4)
  - All semantic colors in pastel variants
- **Icons reduced by 50-70%** across all components
- **5 gradient utilities** added for visual variety
- **Soft shadows** with reduced opacity (0.05-0.15)

### ✅ Phase 2: Equipment View Modes (100% Complete)
- **Large Details Mode** (default) - Card view with images
- **Compact List Mode** - Table view for dense information
- Toggle buttons with active state styling
- Fully responsive on mobile/tablet/desktop

### ✅ Phase 3: Room Booking Enhancements (100% Complete)
- **Multi-hour booking** - Click multiple consecutive time slots
- **Full-day block booking** - Toggle to select all available slots (9am-6pm)
- Visual feedback showing selected slots count
- Booking summary displays full duration

---

## What Needs To Be Implemented

### 🔄 Phase 4: Sub-Area System

This is the most complex feature requiring database, backend, and frontend work.

---

## Database Implementation

### Step 1: Run SQL Migration

Create file: `src/database/migrations/sub_areas_system.sql`

**Tables to create:**
1. `sub_areas` - Department sub-divisions (ComDes, Fine Art Media, etc.)
2. `area_admins` - Admin assignments to specific sub-areas
3. `user_sub_areas` - Student assignments to sub-areas
4. `interdisciplinary_access` - Cross-department equipment access grants

**Key SQL:**
```sql
-- Example sub-area
INSERT INTO sub_areas (name, description, parent_department) VALUES
  ('Communication Design', 'Visual communication...', 'School of Design');

-- Assign student to sub-area
INSERT INTO user_sub_areas (user_id, sub_area_id, assigned_by) VALUES
  ('user-uuid', 'sub-area-uuid', 'admin-uuid');

-- Grant interdisciplinary access
INSERT INTO interdisciplinary_access (from_sub_area_id, to_sub_area_id, granted_by) VALUES
  ('comdes-uuid', 'fine-art-uuid', 'master-admin-uuid');
```

**RLS Policies:**
- Students can only see equipment from their assigned sub-areas
- Students can see equipment from sub-areas with active interdisciplinary access
- Area admins can manage equipment/users in their sub-areas
- Master admins can manage all sub-areas

---

## Frontend Components Needed

### 1. Sub-Area Management Component

**File:** `src/portals/admin/SubAreaManagement.jsx`

**Features:**
- List all sub-areas in pastel-styled cards
- Add new sub-area (master admin only)
- Edit sub-area details
- Deactivate sub-area
- View equipment count per sub-area
- Assign area admins

**UI Design:**
- Use pastel card styling with `--bg-card`
- Soft shadows (`--shadow-xs`)
- Pastel badge for parent department (tertiary color)
- Equipment count badge (secondary color)

### 2. Student Assignment Interface

**File:** `src/portals/admin/StudentAssignment.jsx`

**Features:**
- **Bulk assignment mode:**
  - Multi-select checkboxes for students
  - Dropdown to select target sub-area
  - "Assign Selected Students" button
- **Search/Filter:**
  - Filter by name, email, current sub-area
  - Filter by assigned/unassigned status
- **Current Assignments Table:**
  - Show student name, email, sub-area, assigned date
  - "Remove" button to unassign
  - Primary sub-area indicator
- **Individual Assignment:**
  - Click student row to open modal
  - Select sub-area(s) from dropdown
  - Mark one as primary
  - Save assignment

**UI Design:**
- Use pastel table with hover states (`--bg-hover`)
- Checkboxes with pastel accent color
- Multi-select uses soft teal background for selected rows
- Assignment modal uses soft rose header

**Key Functions:**
```javascript
const assignStudentsToSubArea = async (studentIds, subAreaId) => {
  // Bulk insert into user_sub_areas
};

const removeAssignment = async (userId, subAreaId) => {
  // Delete from user_sub_areas
};

const setPrimarySubArea = async (userId, subAreaId) => {
  // Update is_primary flag
};
```

### 3. Interdisciplinary Access Manager

**File:** `src/portals/admin/InterdisciplinaryAccess.jsx`

**Features:**
- **Grant Access Form:**
  - "From Sub-Area" dropdown
  - "To Sub-Area" dropdown
  - Optional expiration date
  - Notes textarea
  - "Grant Access" button
- **Active Grants Table:**
  - From → To columns with arrows
  - Granted by, granted date
  - Expires date (or "Never")
  - Active toggle switch
  - Revoke button
- **Visual Indicators:**
  - Active grants: soft mint background
  - Expired grants: soft coral background
  - Permanent grants: soft sky blue badge

**UI Design:**
- Two-column layout: Form on left, table on right
- Pastel badges for sub-area names
- Soft mint success message on grant
- Confirmation modal for revoke (soft coral)

**Key Functions:**
```javascript
const grantAccess = async (fromSubAreaId, toSubAreaId, expiresAt, notes) => {
  // Insert into interdisciplinary_access
};

const revokeAccess = async (accessId) => {
  // Set is_active = false
};

const toggleAccessStatus = async (accessId, isActive) => {
  // Update is_active flag
};
```

### 4. Equipment Browse Updates

**File:** `src/portals/student/EquipmentBrowse.jsx` (update existing)

**Changes:**
- Filter equipment based on user's sub-areas
- Show interdisciplinary equipment with badge:
  - "Available via [Sub-Area Name]"
  - Badge uses soft lavender color
- Add sub-area filter dropdown (optional)

**SQL Query Update:**
```javascript
const loadEquipment = async () => {
  // Query equipment WHERE:
  // - sub_area_id IN user's assigned sub-areas
  // OR sub_area_id IN interdisciplinary access grants
  // OR sub_area_id IS NULL (general equipment)
};
```

---

## Services Layer

### 1. Create Sub-Area Service

**File:** `src/services/subArea.service.js`

```javascript
export const subAreaService = {
  // Sub-Areas
  getAllSubAreas: async () => { /* Query sub_areas */ },
  createSubArea: async (name, description, parentDepartment) => { /* Insert */ },
  updateSubArea: async (id, updates) => { /* Update */ },
  deactivateSubArea: async (id) => { /* Set is_active = false */ },
  getEquipmentCountBySubArea: async () => { /* Call get_equipment_count_by_sub_area() */ },

  // Area Admins
  getAreaAdmins: async (subAreaId) => { /* Query area_admins */ },
  assignAreaAdmin: async (userId, subAreaId) => { /* Insert */ },
  removeAreaAdmin: async (userId, subAreaId) => { /* Delete */ },

  // Student Assignments
  getUserSubAreas: async (userId) => { /* Query user_sub_areas */ },
  getStudentsInSubArea: async (subAreaId) => { /* Query users + user_sub_areas */ },
  assignStudentToSubArea: async (userId, subAreaId, isPrimary) => { /* Insert */ },
  removeStudentFromSubArea: async (userId, subAreaId) => { /* Delete */ },
  bulkAssignStudents: async (userIds, subAreaId) => { /* Bulk insert */ },

  // Interdisciplinary Access
  getInterdisciplinaryAccess: async () => { /* Query interdisciplinary_access */ },
  grantAccess: async (fromId, toId, expiresAt, notes) => { /* Insert */ },
  revokeAccess: async (id) => { /* Update is_active */ },
  toggleAccess: async (id, isActive) => { /* Update */ }
};
```

---

## Navigation Updates

### Add to Admin Layout

**File:** `src/portals/admin/AdminLayout.jsx`

Add navigation links for master admin:
```jsx
{user.role === 'master_admin' && (
  <>
    <Link to="/admin/sub-areas">Sub-Area Management</Link>
    <Link to="/admin/student-assignment">Assign Students</Link>
    <Link to="/admin/interdisciplinary">Interdisciplinary Access</Link>
  </>
)}
```

---

## Styling Requirements

### CSS Classes Needed

Add to `src/styles/main.css`:

```css
/* Sub-Area Management */
.sub-area-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.sub-area-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-xs);
  transition: var(--transition-all);
}

.sub-area-card:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.sub-area-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.sub-area-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-heading);
  margin: 0;
}

.sub-area-stats {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.stat-badge.equipment {
  background: var(--color-secondary-pale);
  color: var(--color-secondary);
}

.stat-badge.students {
  background: var(--color-info-pale);
  color: var(--color-info);
}

/* Student Assignment */
.assignment-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-xl);
}

.assignment-filters {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.student-table-row.selected {
  background: var(--color-secondary-pale);
}

.student-table-row.selected:hover {
  background: var(--color-secondary-light);
}

.bulk-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-primary-pale);
  border-radius: var(--radius-md);
  align-items: center;
}

/* Interdisciplinary Access */
.access-grant-form {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.access-table {
  width: 100%;
  border-collapse: collapse;
}

.access-row.active {
  background: var(--color-success-pale);
}

.access-row.expired {
  background: var(--color-error-pale);
  opacity: 0.7;
}

.access-arrow {
  color: var(--color-secondary);
  font-weight: var(--font-weight-bold);
  font-size: 1.2rem;
}

.access-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.access-badge.permanent {
  background: var(--color-info-pale);
  color: var(--color-info);
}

.access-badge.temporary {
  background: var(--color-warning-pale);
  color: var(--color-warning);
}

/* Sub-Area Badge (for equipment cards) */
.interdisciplinary-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--color-tertiary-light);
  color: var(--color-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-top: 4px;
}
```

---

## Testing Checklist

### Database Testing
- [ ] Create sub-areas successfully
- [ ] Assign students to sub-areas
- [ ] Assign area admins
- [ ] Grant interdisciplinary access
- [ ] RLS policies restrict student equipment view
- [ ] RLS policies allow interdisciplinary equipment view
- [ ] RLS policies allow area admin management
- [ ] RLS policies allow master admin full access

### UI Testing
- [ ] Sub-area management displays correctly
- [ ] Student assignment interface works
- [ ] Bulk assignment functions
- [ ] Interdisciplinary access form works
- [ ] Access grants table displays
- [ ] Equipment filtering respects sub-areas
- [ ] Interdisciplinary badge shows on equipment

### User Role Testing
- [ ] **Student:** Can only see equipment from assigned sub-areas + interdisciplinary
- [ ] **Area Admin:** Can manage equipment/students in their sub-area only
- [ ] **Master Admin:** Can manage all sub-areas, students, and access grants

---

## Deployment Steps

1. **Run database migration:**
   ```bash
   psql -d ncad_booking -f src/database/migrations/sub_areas_system.sql
   ```

2. **Seed initial sub-areas** (if not in migration):
   - Communication Design
   - Fine Art Media
   - Sculpture & Expanded Practice
   - Illustration
   - Moving Image Design
   - Photography

3. **Assign existing students to sub-areas:**
   - Run bulk assignment through admin UI
   - OR bulk SQL: `INSERT INTO user_sub_areas (user_id, sub_area_id) SELECT id, '<sub-area-id>' FROM users WHERE department = 'Design';`

4. **Assign existing equipment to sub-areas:**
   - `UPDATE equipment SET sub_area_id = '<sub-area-id>' WHERE department = 'Design';`

5. **Test thoroughly** before production deployment

---

## Migration Path for Existing Data

### Equipment Migration
```sql
-- Map equipment to sub-areas based on department
UPDATE equipment SET sub_area_id = (
  SELECT id FROM sub_areas WHERE name = 'Communication Design'
) WHERE department = 'Design' AND category IN ('Graphic', 'Print');

UPDATE equipment SET sub_area_id = (
  SELECT id FROM sub_areas WHERE name = 'Moving Image Design'
) WHERE department = 'Design' AND category IN ('Camera', 'Lighting', 'Sound');

-- Leave general equipment with NULL sub_area_id for cross-department access
```

### User Migration
```sql
-- Assign students based on current department field
INSERT INTO user_sub_areas (user_id, sub_area_id, is_primary)
SELECT u.id, sa.id, TRUE
FROM users u
JOIN sub_areas sa ON (
  (u.department = 'Design' AND sa.name = 'Communication Design') OR
  (u.department = 'Fine Art' AND sa.name = 'Fine Art Media')
)
WHERE u.role = 'student';
```

---

## Future Enhancements

- **Sub-area Analytics:** Equipment utilization by sub-area
- **Booking Quotas:** Limit bookings per sub-area per month
- **Cross-Registration:** Allow students to request access to other sub-areas
- **Auto-Expiry Notifications:** Email when interdisciplinary access is about to expire
- **Equipment Recommendations:** Suggest equipment based on sub-area projects

---

## Estimated Implementation Time

- **Database Setup:** 1 hour
- **Services Layer:** 2 hours
- **Sub-Area Management UI:** 3 hours
- **Student Assignment UI:** 4 hours
- **Interdisciplinary Access UI:** 3 hours
- **Equipment Browse Updates:** 2 hours
- **Testing & Debugging:** 3 hours
- **Total:** ~18 hours

---

## Support & Documentation

For questions or issues during implementation:
1. Reference CLAUDE.md for project context
2. Check docs/agents/ for sub-agent specifications
3. Review ProjectMemory.md for development history
4. Test incrementally - implement one component at a time

---

**End of Sub-Area Implementation Guide**
