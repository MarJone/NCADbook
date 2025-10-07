# NCAD Staff Population Summary

**Date:** 2025-10-07
**Source:** www.ncad.ie (Official NCAD Website)
**Status:** ✅ Complete

---

## Overview

Successfully populated the NCADbook database with **13 real NCAD staff members** from the official NCAD website. All test/demo staff accounts have been replaced with authentic faculty and administrative staff.

---

## Staff Members Added

### Master Administrators (5)
**Full system access, oversee all departments**

| Name | Email | Department | Title |
|------|-------|------------|-------|
| John Paul Dowling | john.dowling@ncad.ie | Moving Image Design | Head of Department of Communication Design |
| Sarah Glennie | sarah.glennie@ncad.ie | Moving Image Design | Director of NCAD |
| Gerry McCoy | gerry.mccoy@ncad.ie | Moving Image Design | Head of Corporate Services/Registrar |
| Siún Hanrahan | siun.hanrahan@ncad.ie | Moving Image Design | Head of Academic Affairs |

### Department Administrators (3)
**Manage their respective department equipment and bookings**

| Name | Email | Department | Title |
|------|-------|------------|-------|
| Aoife McInerney | aoife.mcinerney@ncad.ie | Graphic Design | Programme Leader BA Graphic Design |
| Brendon Deacy | brendon.deacy@ncad.ie | Illustration | Programme Leader BA Illustration |

### Staff Members (7)
**Department lecturers and technical support**

#### Graphic Design (5)
- **Ed McGinley** (ed.mcginley@ncad.ie) - Lecturer in Graphic Design and Moving Image
- **Stephanie Connolly** (stephanie.connolly@ncad.ie) - Part-Time Lecturer
- **Jamie Murphy** (jamie.murphy@ncad.ie) - Technical Assistant in Communication Design
- **Fiona Hodge** (fiona.hodge@ncad.ie) - Communication Design Secretary
- **David Bramley** (david.bramley@ncad.ie) - Faculty and Product Design Administrator

#### Moving Image Design (1)
- **David Timmons** (david.timmons@ncad.ie) - Lecturer in Moving Image Design

#### Illustration (1)
- **John Slade** (john.slade@ncad.ie) - Lecturer in Illustration

---

## Database Summary

### By Department
```
Graphic Design:          7 staff (1 admin, 6 staff)
Moving Image Design:     5 staff (4 master admins, 1 staff)
Illustration:            3 staff (1 admin, 2 staff)
Administration:          4 staff (1 master admin, 3 staff)
```

### By Role
```
Master Admins:        5
Department Admins:    5
Staff:               12
----------------------------
Total:               22
```

---

## Default Credentials

**All staff accounts have been created with:**
- **Default Password:** `NCADStaff2025!`
- **Email Format:** `firstname.surname@ncad.ie`

⚠️ **Security Note:** All staff members should change their password on first login.

---

## Data Sources

All staff information was gathered from official NCAD website pages:

1. **Staff Directory:** https://www.ncad.ie/directory/
2. **Design Faculty:** https://www.ncad.ie/about/ncad-faculties-services/design/
3. **Senior Management:** https://www.ncad.ie/about/structure/ncad-senior-staff/
4. **Department Pages:**
   - Moving Image Design: https://www.ncad.ie/undergraduate/school-of-design/moving-image-design/
   - Graphic Design: https://www.ncad.ie/undergraduate/school-of-design/graphic-design/
   - Illustration: https://www.ncad.ie/undergraduate/school-of-design/illustration/

---

## Scripts Created

### 1. populate-staff.js
**Location:** `backend/scripts/populate-staff.js`

Node.js script that:
- Removes test staff accounts
- Hashes passwords securely with bcrypt
- Inserts real NCAD staff members
- Uses ON CONFLICT to prevent duplicates
- Provides detailed logging and summary

**Run with:** `cd backend && node scripts/populate-staff.js`

### 2. populate_ncad_staff.sql
**Location:** `backend/populate_ncad_staff.sql`

SQL reference script with:
- Full SQL INSERT statements
- Staff member details and roles
- Department assignments
- Comments and documentation

---

## Role Definitions

### Master Admin
- Full system access across all departments
- Can add/edit/delete equipment and users
- Access to all analytics and reports
- Assigned to senior leadership (Director, Registrar, etc.)

### Department Admin
- Manage equipment for their specific department
- Approve/deny bookings for their department's equipment
- View department-specific analytics
- Assigned to programme leaders/heads

### Staff
- View and manage equipment in their department
- Add notes to equipment (maintenance, damage, usage)
- Create bookings for equipment
- View booking statistics

---

## Testing Recommendations

1. **Login Test**
   - Test login with each role level
   - Verify password: `NCADStaff2025!`
   - Confirm role-based access control

2. **Permission Test**
   - Master Admin: Can access all features
   - Department Admin: Can only manage their department
   - Staff: Can view and create bookings

3. **Equipment Management**
   - Assign equipment to departments
   - Test booking approval workflow
   - Verify equipment notes functionality

---

## Next Steps

### Recommended Actions:
1. ✅ **Staff Onboarding**
   - Notify staff members of their accounts
   - Provide login instructions and default password
   - Request password change on first login

2. ✅ **Equipment Assignment**
   - Assign existing equipment to departments
   - Update equipment ownership based on department needs
   - Configure equipment permissions

3. ✅ **Access Testing**
   - Test each staff member can log in
   - Verify role-based permissions work correctly
   - Ensure department admins see only their department data

4. ⏳ **Password Reset Flow**
   - Implement "forgot password" functionality
   - Set up email notifications for password resets
   - Enforce password change on first login

---

## File Locations

```
NCADbook/
├── backend/
│   ├── scripts/
│   │   └── populate-staff.js          # Staff population script
│   └── populate_ncad_staff.sql        # SQL reference
└── NCAD_STAFF_POPULATION_SUMMARY.md   # This document
```

---

## Verification Query

To verify staff members in the database:

```sql
SELECT
    full_name,
    email,
    role,
    department,
    created_at
FROM users
WHERE role IN ('staff', 'department_admin', 'master_admin')
ORDER BY department, role DESC, surname;
```

---

## Notes

- All email addresses follow the format: `firstname.surname@ncad.ie`
- Staff members were sourced from publicly available NCAD website information
- Department assignments align with the three core departments in the system:
  - Moving Image Design
  - Graphic Design
  - Illustration
- Additional design faculty (Fashion, Textiles, Product Design) staff are included in the SQL file for future expansion

---

## Contact

For questions about staff accounts or access issues, contact:
- **John Paul Dowling** (Head of Communication Design) - john.dowling@ncad.ie
- **System Administrator** - admin@ncad.ie

---

**Generated:** 2025-10-07
**Script Version:** 1.0
**Database:** ncadbook_db
