## **NCAD Equipment Booking System - Enhanced Roles Implementation Guide**
### **Complete Documentation for 9-Role System with Feature Flags**

---

## **Table of Contents**

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Role Definitions](#role-definitions)
4. [Feature Flag System](#feature-flag-system)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Security & RLS](#security--rls)
8. [Implementation Guide](#implementation-guide)
9. [Testing Procedures](#testing-procedures)
10. [Troubleshooting](#troubleshooting)

---

## **Overview**

### **System Capabilities**

The enhanced NCAD Equipment Booking System now supports **9 user roles** with **master admin-controlled feature flags** for granular system activation:

**Core Roles (Always Active):**
1. **Student** - Equipment booking and self-service
2. **General Admin** - Booking approval and equipment management
3. **Master Admin** - Full system control

**Advanced Roles (Feature Flag Controlled):**
4. **View-Only Staff** - Faculty equipment visibility
5. **Accounts Officer** - Financial reporting and depreciation
6. **Payroll Coordinator** - Time tracking and cost center allocation
7. **IT Support Technician** - Asset lifecycle and maintenance
8. **Budget Manager** - Strategic planning and ROI analytics

### **Key Features**

- ✅ **Feature Flag System**: Master admin toggle for each role and module
- ✅ **Financial Management**: TCO tracking, GAAP-compliant depreciation, budget forecasting
- ✅ **Payroll Integration**: Time tracking, cost center allocation, efficiency metrics
- ✅ **IT Asset Lifecycle**: Help desk integration, maintenance scheduling, compliance tracking
- ✅ **Budget Analytics**: ROI calculation, replacement priority matrix, sharing optimizer
- ✅ **GDPR Compliance**: Audit trails for all data access, role-based field visibility
- ✅ **Row Level Security**: Database-enforced permissions for all 9 roles

---

## **Architecture**

### **System Layers**

```
┌─────────────────────────────────────────────────────────────┐
│                    Master Admin Config UI                    │
│              (Feature Flag Toggle Dashboard)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               Feature Flag Validation Layer                  │
│     (Checks if role/module enabled before granting access)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Row Level Security (RLS) Policies               │
│         (Database-enforced permissions per role)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Database Tables & Views                    │
│  Equipment | Costs | Bookings | Tickets | Maintenance etc.  │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow Example: Accounts Officer Views Equipment Cost**

```
1. User logs in → System checks: role = 'accounts_officer'
2. RLS Policy checks: is_role_enabled('accounts_officer') = true?
3. If TRUE → Query equipment_accounts_view (filtered fields)
4. If FALSE → Reject with "Role not enabled" error
5. Log data access in data_access_audit table (GDPR)
6. Return financial data to UI
```

---

## **Role Definitions**

### **1. Student (Core Role)**

**Purpose:** Self-service equipment booking for 1,600 students

**Permissions:**
- ✅ View equipment catalog (basic fields only)
- ✅ Check equipment availability
- ✅ Create booking requests
- ✅ View own booking history
- ✅ Cancel own pending bookings
- ❌ View tracking numbers, costs, technical data
- ❌ Approve bookings or manage equipment

**Database Views:** `equipment_student_view`

**Use Cases:**
- Browse and search equipment catalog
- Book equipment for projects with justification
- Track return deadlines

---

### **2. General Admin (Core Role)**

**Purpose:** Department-level equipment management and booking approval

**Permissions:**
- ✅ Approve/deny bookings for assigned department
- ✅ View tracking numbers and equipment location
- ✅ Add multi-field equipment notes (maintenance, damage, etc.)
- ✅ Update equipment status (available, maintenance, out_of_service)
- ✅ View department-specific reports
- ✅ Manage equipment condition and repairs
- ❌ View financial costs (purchase price, repair costs)
- ❌ Modify user roles or system settings

**Department Assignment:** Via `admin_permissions` JSONB field

---

### **3. Master Admin (Core Role)**

**Purpose:** Full system oversight and configuration

**Permissions:**
- ✅ ALL permissions across entire system
- ✅ Enable/disable feature flags for roles and modules
- ✅ Manage user roles and permissions
- ✅ Access all data (financial, payroll, IT, student)
- ✅ CSV import/export for users and equipment
- ✅ View complete audit trail
- ✅ Configure system-wide settings

**Dashboard:** Master Admin Configuration UI (`/master-admin-config.html`)

---

### **4. View-Only Staff (Advanced Role - Feature Flag: `role_view_only_staff`)**

**Purpose:** Teaching faculty equipment visibility for course planning

**Permissions:**
- ✅ View equipment catalog (NO tracking numbers)
- ✅ View equipment availability calendar
- ✅ View department booking statistics (anonymized)
- ❌ Create bookings on behalf of students
- ❌ Approve bookings
- ❌ View costs, technical specs, or student personal data

**Database Views:** `equipment_staff_view`

**Use Cases:**
- Faculty planning course schedules around equipment availability
- Lecturers advising students on equipment selection
- Instructors checking if critical equipment available for class projects

**Activation:** Master Admin enables `role_view_only_staff` feature flag

---

### **5. Accounts Officer (Advanced Role - Feature Flag: `role_accounts_officer`)**

**Purpose:** Finance department financial reporting and budget allocation

**Permissions:**
- ✅ View ALL equipment with purchase costs and depreciation
- ✅ Generate financial reports:
  - Equipment depreciation schedules
  - Total Cost of Ownership (TCO) by category/department
  - Repair vs. maintenance cost analysis
  - Budget variance reports
- ✅ Export financial data (CSV/PDF)
- ✅ View equipment lifecycle status for capital planning
- ✅ Access audit trail for equipment purchases/disposals
- ❌ Approve bookings or modify equipment records (read-only)
- ❌ View student personal data or booking purposes

**Database Views:** `equipment_accounts_view`, `equipment_balance_sheet`, `monthly_financial_summary`

**Key Functions:**
- `calculate_equipment_depreciation()` - GAAP straight-line depreciation
- `calculate_equipment_tco()` - Total cost including repairs, maintenance
- `calculate_tco_summary()` - Aggregate by category or department
- `forecast_equipment_budget()` - Multi-year budget forecasting

**New Data Fields:**
```sql
equipment.purchase_cost
equipment.purchase_date
equipment.supplier
equipment.warranty_expiry
equipment.depreciation_rate
equipment.useful_life_years
equipment.salvage_value
equipment.disposal_date
```

**Activation:** Master Admin enables both:
- `role_accounts_officer` (role flag)
- `feature_financial_management` (module flag)

---

### **6. Payroll Coordinator (Advanced Role - Feature Flag: `role_payroll_coordinator`)**

**Purpose:** HR/Payroll time tracking and cost center attribution

**Permissions:**
- ✅ View admin time tracking data (anonymized via views)
- ✅ Generate payroll reports:
  - Admin hours by department and task category
  - Cost center allocation vs. actual time spent
  - Staff workload distribution
  - Efficiency metrics (bookings processed per hour)
- ✅ Manage staff cost center allocations
- ✅ Export timekeeping data for payroll system integration
- ❌ View student bookings or personal data
- ❌ View financial equipment costs
- ❌ Modify bookings or equipment records

**Database Views:** `payroll_time_tracking_view`, `payroll_monthly_summary`

**Key Functions:**
- `calculate_staff_workload()` - Time allocation by department/task
- `calculate_cost_center_allocation()` - Planned vs. actual hours
- `calculate_staff_efficiency()` - Performance metrics

**New Data Fields:**
```sql
admin_actions.time_spent_minutes
admin_actions.task_category ('booking_approval', 'equipment_maintenance', etc.)
admin_actions.department

staff_cost_centers table:
  - admin_id
  - department
  - cost_center_code
  - allocation_percentage (sum must = 100%)
  - effective_from / effective_to dates
```

**Workflow:**
1. Admin processes booking → Frontend tracks time → Stores `time_spent_minutes`
2. Payroll Coordinator reviews monthly workload reports
3. Adjusts cost center allocations based on actual time
4. Exports data for payroll system (charge departments proportionally)

**Activation:** Master Admin enables both:
- `role_payroll_coordinator`
- `feature_payroll_tracking`

---

### **7. IT Support Technician (Advanced Role - Feature Flag: `role_it_support_technician`)**

**Purpose:** IT asset lifecycle management and help desk integration

**Permissions:**
- ✅ View ALL equipment with tracking numbers, serial numbers, technical specs
- ✅ Log IT help desk tickets linked to equipment
- ✅ Update equipment technical status:
  - Firmware/software versions
  - Network configuration (MAC addresses)
  - IT security compliance status
- ✅ Create and manage maintenance schedules
- ✅ Generate IT reports:
  - Equipment health scores
  - Maintenance overdue alerts
  - Warranty expiration tracking
  - Ticket analytics (failure rates, resolution times)
- ✅ Integrate with external ticketing systems (ServiceNow, Jira)
- ❌ Approve student bookings
- ❌ View financial cost data

**Database Views:** `equipment_it_view`, `it_maintenance_dashboard`

**Key Functions:**
- `get_equipment_health_status()` - Health scoring (0-100) based on:
  - IT compliance status
  - Days since last audit
  - Open tickets count
  - Overdue maintenance
  - Warranty status
- `analyze_it_tickets()` - Failure rate analysis, recurring issues
- `generate_maintenance_schedules()` - Auto-create preventive maintenance

**New Tables:**
- `equipment_it_tickets` - Help desk ticket integration
- `maintenance_schedules` - Preventive maintenance calendar

**New Equipment Fields:**
```sql
equipment.serial_number
equipment.asset_tag
equipment.firmware_version
equipment.software_version
equipment.network_mac_address
equipment.last_it_audit_date
equipment.it_compliance_status ('compliant', 'needs_update', 'non_compliant')
```

**Workflow:**
1. Student reports issue → General Admin creates IT ticket
2. IT Support assigned ticket, troubleshoots
3. Updates equipment technical status, logs resolution
4. Ticket auto-links to equipment record for history
5. Dashboard flags recurring issues → Inform replacement decisions

**Activation:** Master Admin enables both:
- `role_it_support_technician`
- `feature_it_asset_lifecycle`

---

### **8. Budget Manager (Advanced Role - Feature Flag: `role_budget_manager`)**

**Purpose:** Strategic equipment investment and budget planning

**Permissions:**
- ✅ View all financial and utilization data for assigned departments
- ✅ Generate strategic reports:
  - Equipment ROI rankings (usage value vs. cost)
  - Replacement priority matrix (weighted scoring)
  - Multi-year budget forecasts
  - Cross-department sharing opportunities
- ✅ Compare department performance (utilization, cost efficiency)
- ✅ Export executive-level reports with visualizations
- ❌ Approve bookings (operational decisions, not tactical)
- ❌ Modify equipment records or costs
- ❌ Access detailed student data (sees anonymized aggregates)

**Database Views:** `budget_analytics_view`

**Key Functions:**
- `calculate_equipment_roi()` - ROI based on utilization × market rental rate
- `calculate_replacement_priority()` - Weighted scoring:
  - Age (25% weight)
  - Repair cost ratio (35% weight)
  - Demand/utilization (25% weight)
  - Condition (15% weight)
- `forecast_equipment_budget()` - 3-year forecast with inflation
- `identify_sharing_opportunities()` - Find underutilized equipment

**Use Cases:**
- Department Head reviewing equipment investment performance
- Budget planning for next fiscal year
- Justifying equipment purchases with ROI data
- Identifying cost savings through cross-department sharing

**Example ROI Calculation:**
```
Canon EOS R5 Camera:
- Purchase Cost: €4,500
- Repair/Maintenance (2 years): €300
- Total Cost: €4,800
- Usage: 180 days booked
- Market Rental Rate: €75/day
- Estimated Value: 180 × €75 = €13,500
- ROI: (€13,500 - €4,800) / €4,800 = 181% over 2 years
- Category: "Excellent" ROI
```

**Activation:** Master Admin enables both:
- `role_budget_manager`
- `feature_budget_analytics`

---

## **Feature Flag System**

### **How It Works**

1. **Master Admin Access:** Only users with `role = 'master_admin'` can access `/master-admin-config.html`
2. **Toggle Dashboard:** Visual UI for enabling/disabling each role and module
3. **Database Storage:** Flags stored in `system_feature_flags` table
4. **Validation on Login:** When user logs in with advanced role, system checks `is_role_enabled(role)` function
5. **RLS Enforcement:** Database RLS policies automatically block queries if role disabled
6. **Audit Trail:** Every flag change logged in `admin_actions` table

### **Feature Flag Table Structure**

```sql
CREATE TABLE system_feature_flags (
  id UUID PRIMARY KEY,
  feature_key VARCHAR UNIQUE,  -- e.g., 'role_accounts_officer'
  feature_name VARCHAR,         -- Human-readable name
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  enabled_by UUID REFERENCES users(id),
  enabled_at TIMESTAMP,
  disabled_at TIMESTAMP,
  metadata JSONB,               -- Version, components, etc.
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Default Feature Flags (All Disabled by Default)**

| Feature Key | Feature Name | Type | Dependencies |
|-------------|--------------|------|--------------|
| `role_view_only_staff` | View-Only Staff Role | Role | None |
| `role_accounts_officer` | Accounts Officer Role | Role | `feature_financial_management` |
| `role_payroll_coordinator` | Payroll Coordinator Role | Role | `feature_payroll_tracking` |
| `role_it_support_technician` | IT Support Technician Role | Role | `feature_it_asset_lifecycle` |
| `role_budget_manager` | Budget Manager Role | Role | `feature_budget_analytics` |
| `feature_financial_management` | Financial Management Module | Module | None |
| `feature_payroll_tracking` | Payroll Time Tracking Module | Module | None |
| `feature_it_asset_lifecycle` | IT Asset Lifecycle Module | Module | None |
| `feature_budget_analytics` | Budget Analytics Module | Module | None |

### **Validation Logic**

```sql
-- Function: Check if feature enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(p_feature_key VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT is_enabled INTO v_enabled
  FROM system_feature_flags
  WHERE feature_key = p_feature_key;

  RETURN COALESCE(v_enabled, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger: Prevent user role assignment if feature disabled
CREATE OR REPLACE FUNCTION validate_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'master_admin' THEN
    RETURN NEW; -- Always allow master admin
  END IF;

  IF NEW.role IN ('student', 'general_admin') THEN
    RETURN NEW; -- Core roles always allowed
  END IF;

  IF NOT is_role_enabled(NEW.role) THEN
    RAISE EXCEPTION 'Role % is not currently enabled. Master admin must enable it first.', NEW.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_user_role
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_role();
```

---

## **Database Schema**

### **Core Tables (Enhanced)**

#### **users** (Role Field Expanded)
```sql
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (
    role IN (
      'student',
      'general_admin',
      'master_admin',
      'view_only_staff',
      'accounts_officer',
      'payroll_coordinator',
      'it_support_technician',
      'budget_manager'
    )
  );
```

#### **equipment** (Financial + IT Fields Added)
```sql
ALTER TABLE equipment ADD COLUMN purchase_date DATE;
ALTER TABLE equipment ADD COLUMN purchase_cost DECIMAL(10,2);
ALTER TABLE equipment ADD COLUMN supplier VARCHAR(200);
ALTER TABLE equipment ADD COLUMN warranty_expiry DATE;
ALTER TABLE equipment ADD COLUMN depreciation_rate DECIMAL(5,2) DEFAULT 20.00;
ALTER TABLE equipment ADD COLUMN useful_life_years INTEGER DEFAULT 5;
ALTER TABLE equipment ADD COLUMN serial_number VARCHAR(100);
ALTER TABLE equipment ADD COLUMN asset_tag VARCHAR(50);
ALTER TABLE equipment ADD COLUMN firmware_version VARCHAR(50);
ALTER TABLE equipment ADD COLUMN it_compliance_status VARCHAR(30);
```

### **New Tables**

#### **equipment_costs** (TCO Tracking)
```sql
CREATE TABLE equipment_costs (
  id UUID PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(id),
  cost_type VARCHAR(50), -- 'purchase', 'repair', 'maintenance', 'supplies', etc.
  amount DECIMAL(10,2),
  invoice_number VARCHAR(50),
  supplier VARCHAR(200),
  cost_date DATE,
  paid_by_department VARCHAR(100),
  budget_code VARCHAR(50),
  fiscal_year INTEGER,
  notes TEXT,
  recorded_by UUID REFERENCES users(id)
);
```

#### **staff_cost_centers** (Payroll Allocation)
```sql
CREATE TABLE staff_cost_centers (
  id UUID PRIMARY KEY,
  admin_id UUID REFERENCES users(id),
  department VARCHAR(100),
  cost_center_code VARCHAR(50),
  allocation_percentage DECIMAL(5,2) CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  effective_from DATE,
  effective_to DATE
);

-- Constraint: Total allocation per admin cannot exceed 100%
CREATE TRIGGER trigger_validate_cost_center_total
  BEFORE INSERT OR UPDATE ON staff_cost_centers
  FOR EACH ROW EXECUTE FUNCTION validate_cost_center_total();
```

#### **equipment_it_tickets** (Help Desk Integration)
```sql
CREATE TABLE equipment_it_tickets (
  id UUID PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(id),
  ticket_number VARCHAR(50),
  ticket_system VARCHAR(50), -- 'ServiceNow', 'Jira', 'internal'
  external_ticket_id VARCHAR(100),
  issue_type VARCHAR(50), -- 'hardware_failure', 'software_issue', etc.
  priority VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
  title VARCHAR(200),
  description TEXT,
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(30), -- 'open', 'in_progress', 'resolved', 'closed'
  resolution_notes TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
);
```

#### **maintenance_schedules** (Preventive Maintenance)
```sql
CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(id),
  maintenance_type VARCHAR(50), -- 'cleaning', 'calibration', 'firmware_update', etc.
  frequency_days INTEGER,
  last_performed DATE,
  next_due DATE,
  assigned_to UUID REFERENCES users(id),
  status VARCHAR(30), -- 'scheduled', 'overdue', 'completed'
  estimated_cost DECIMAL(10,2)
);
```

#### **data_access_audit** (GDPR Compliance)
```sql
CREATE TABLE data_access_audit (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_role VARCHAR(50),
  access_type VARCHAR(50), -- 'view', 'export', 'report_generation'
  resource_type VARCHAR(50), -- 'financial_data', 'payroll_data', 'student_pii', etc.
  resource_id UUID,
  data_sensitivity VARCHAR(20), -- 'public', 'internal', 'confidential', 'restricted'
  query_parameters JSONB,
  ip_address INET,
  created_at TIMESTAMP
);
```

---

## **API Reference**

### **Feature Flag Management**

#### **Get All Feature Flags**
```javascript
const { data, error } = await supabase
  .from('system_feature_flags')
  .select('*')
  .order('feature_key');
```

#### **Enable Feature Flag**
```javascript
const { error } = await supabase
  .from('system_feature_flags')
  .update({
    is_enabled: true,
    enabled_by: currentUserId
  })
  .eq('feature_key', 'role_accounts_officer');
```

#### **Check if Role Enabled (Client-Side)**
```javascript
const { data } = await supabase
  .rpc('is_role_enabled', { p_role: 'accounts_officer' });

if (!data) {
  alert('Accounts Officer role is not enabled. Contact your administrator.');
}
```

### **Financial Functions**

#### **Calculate Equipment Depreciation**
```javascript
const { data, error } = await supabase
  .rpc('calculate_equipment_depreciation', {
    p_equipment_id: equipmentId,
    p_as_of_date: '2025-12-31'
  });

// Returns:
// {
//   purchase_cost: 5000.00,
//   accumulated_depreciation: 2000.00,
//   current_book_value: 3000.00,
//   is_fully_depreciated: false
// }
```

#### **Calculate Equipment ROI**
```javascript
const { data } = await supabase
  .rpc('calculate_equipment_roi', {
    p_equipment_id: equipmentId,
    p_market_rental_rate: 75.00, // €75/day
    p_start_date: '2023-01-01',
    p_end_date: '2025-12-31'
  });

// Returns:
// {
//   total_cost_of_ownership: 6200.00,
//   total_booked_days: 180,
//   estimated_rental_value: 13500.00,
//   roi_amount: 7300.00,
//   roi_percentage: 117.74,
//   roi_category: 'Excellent'
// }
```

#### **Get Replacement Priority List**
```javascript
const { data } = await supabase
  .rpc('calculate_replacement_priority', {
    p_category: 'CAMERAS' // Optional filter
  });

// Returns ranked list with scores:
// [
//   {
//     product_name: 'Canon EOS 5D Mark III',
//     age_years: 8.5,
//     total_priority_score: 8.75,
//     priority_rank: 1,
//     recommendation: 'Replace Immediately'
//   },
//   ...
// ]
```

### **Payroll Functions**

#### **Get Staff Workload**
```javascript
const { data } = await supabase
  .rpc('calculate_staff_workload', {
    p_admin_id: null, // null = all admins
    p_start_date: '2025-09-01',
    p_end_date: '2025-09-30'
  });

// Returns:
// [
//   {
//     admin_name: 'John Doe',
//     department: 'PRODUCT_DESIGN',
//     task_category: 'booking_approval',
//     total_hours: 12.5,
//     percentage_of_total: 35.0
//   },
//   ...
// ]
```

#### **Get Cost Center Allocation**
```javascript
const { data } = await supabase
  .rpc('calculate_cost_center_allocation', {
    p_admin_id: adminId,
    p_as_of_date: '2025-10-04'
  });

// Returns:
// [
//   {
//     department: 'COMMUNICATION_DESIGN',
//     allocation_percentage: 40.0,
//     actual_hours_ytd: 320.5,
//     allocated_hours_ytd: 300.0,
//     variance_hours: +20.5
//   },
//   ...
// ]
```

### **IT Support Functions**

#### **Get Equipment Health Status**
```javascript
const { data } = await supabase
  .rpc('get_equipment_health_status', {
    p_category: 'CAMERAS'
  });

// Returns:
// [
//   {
//     product_name: 'Sony A7 III',
//     it_compliance_status: 'needs_update',
//     days_since_last_audit: 210,
//     open_tickets: 2,
//     overdue_maintenance: 1,
//     health_score: 45.0,
//     health_rating: 'Fair',
//     recommended_action: 'Complete overdue maintenance'
//   },
//   ...
// ]
```

#### **Analyze IT Tickets**
```javascript
const { data } = await supabase
  .rpc('analyze_it_tickets', {
    p_start_date: '2025-07-01',
    p_end_date: '2025-10-01'
  });

// Returns:
// [
//   {
//     product_name: 'Canon EOS R5',
//     total_tickets: 8,
//     critical_tickets: 2,
//     avg_resolution_days: 5.5,
//     failure_rate: 4.2, // Tickets per year
//     recurring_issue_type: 'hardware_failure',
//     recommendation: 'Check for manufacturing defect or recall'
//   },
//   ...
// ]
```

---

## **Security & RLS**

### **Row Level Security Policies**

All tables have RLS enabled. Policies enforce role-based access at the database level.

#### **Example: equipment_costs Table**

```sql
-- Accounts officers can view all costs
CREATE POLICY "Accounts view all costs" ON equipment_costs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'accounts_officer'
      AND is_role_enabled('accounts_officer')
    )
  );

-- Budget managers can view costs for their departments
CREATE POLICY "Budget managers view department costs" ON equipment_costs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'budget_manager'
      AND is_role_enabled('budget_manager')
      AND user_has_department_access(equipment_costs.paid_by_department)
    )
  );
```

### **Data Access Audit Logging**

All sensitive data access automatically logged:

```sql
-- Log when accounts officer views financial data
SELECT log_data_access(
  auth.uid(),
  'export',
  'financial_data',
  NULL,
  'confidential',
  '{"report_type": "depreciation_schedule"}'::JSONB
);
```

### **Field-Level Security**

Different roles see different fields via database views:

**Students see:** `equipment_student_view`
- ✅ product_name, description, image_url, category, status
- ❌ tracking_number, purchase_cost, serial_number

**Accounts Officers see:** `equipment_accounts_view`
- ✅ product_name, purchase_cost, depreciation, TCO
- ❌ tracking_number, serial_number

**IT Support sees:** `equipment_it_view`
- ✅ tracking_number, serial_number, MAC address, firmware
- ❌ purchase_cost, depreciation

---

## **Implementation Guide**

### **Phase 1: Database Setup (Week 1)**

1. **Run SQL Migrations in Order:**
   ```bash
   # From Supabase SQL Editor:
   1. database/01-enhanced-roles-schema.sql
   2. database/02-rls-policies-enhanced.sql
   3. database/03-financial-functions.sql
   4. database/04-payroll-it-functions.sql
   ```

2. **Verify Feature Flags Created:**
   ```sql
   SELECT feature_key, is_enabled FROM system_feature_flags ORDER BY feature_key;
   ```

3. **Test RLS Policies:**
   ```sql
   -- As master admin, try to create accounts officer
   INSERT INTO users (email, role) VALUES ('finance@ncad.ie', 'accounts_officer');
   -- Should fail with "Role not enabled" error

   -- Enable role first
   UPDATE system_feature_flags SET is_enabled = true WHERE feature_key = 'role_accounts_officer';
   UPDATE system_feature_flags SET is_enabled = true WHERE feature_key = 'feature_financial_management';

   -- Now should succeed
   INSERT INTO users (email, role) VALUES ('finance@ncad.ie', 'accounts_officer');
   ```

### **Phase 2: Frontend Integration (Week 2-3)**

1. **Deploy Master Admin Config UI:**
   - Upload `src/pages/MasterAdminConfig.html`
   - Upload `src/js/master-admin-config.js`
   - Test feature toggle functionality

2. **Update Login Flow:**
   ```javascript
   // After successful login, check if role enabled
   const { data: user } = await supabase.auth.getUser();
   const { data: userData } = await supabase
     .from('users')
     .select('role')
     .eq('id', user.id)
     .single();

   // Check if advanced role
   if (!['student', 'general_admin', 'master_admin'].includes(userData.role)) {
     const { data: isEnabled } = await supabase
       .rpc('is_role_enabled', { p_role: userData.role });

     if (!isEnabled) {
       alert('Your role is currently disabled. Contact system administrator.');
       await supabase.auth.signOut();
       return;
     }
   }

   // Redirect to role-specific dashboard
   switch (userData.role) {
     case 'accounts_officer':
       window.location.href = '/accounts-dashboard.html';
       break;
     case 'payroll_coordinator':
       window.location.href = '/payroll-dashboard.html';
       break;
     // ... other roles
   }
   ```

3. **Create Role-Specific Dashboards:**
   - Accounts Dashboard: Equipment costs, depreciation, TCO
   - Payroll Dashboard: Staff workload, cost center allocation
   - IT Support Dashboard: Equipment health, tickets, maintenance
   - Budget Manager Dashboard: ROI, replacement priority, forecasts

### **Phase 3: Testing (Week 4)**

1. **Create Test Users for Each Role:**
   ```sql
   -- Enable all features first (master admin in UI)
   INSERT INTO users (email, full_name, role, department) VALUES
     ('view_staff@ncad.ie', 'View Staff Test', 'view_only_staff', 'PRODUCT_DESIGN'),
     ('accounts@ncad.ie', 'Accounts Test', 'accounts_officer', 'FINANCE'),
     ('payroll@ncad.ie', 'Payroll Test', 'payroll_coordinator', 'HR'),
     ('itsupport@ncad.ie', 'IT Test', 'it_support_technician', 'IT'),
     ('budget@ncad.ie', 'Budget Test', 'budget_manager', 'PRODUCT_DESIGN');
   ```

2. **Test Permission Boundaries:**
   - Verify each role can ONLY access their permitted data
   - Test RLS blocks unauthorized queries
   - Confirm feature flag disable immediately blocks access

3. **Test Workflows:**
   - Accounts: Generate depreciation report → Export CSV
   - Payroll: View admin workload → Export for payroll system
   - IT: Create ticket → Assign to tech → Resolve → Check health score
   - Budget Manager: Run ROI analysis → Generate replacement priority list

---

## **Testing Procedures**

### **Test Case 1: Feature Flag Toggle**

**Steps:**
1. Login as Master Admin
2. Navigate to System Configuration
3. Enable "Accounts Officer" role
4. Create user with `role = 'accounts_officer'`
5. Login as accounts officer → Should see financial dashboard
6. Master Admin disables role
7. Accounts officer refreshes page → Should lose access

**Expected:** Immediate access revocation on disable

---

### **Test Case 2: RLS Policy Enforcement**

**Steps:**
1. Login as Accounts Officer
2. Try to query `equipment_costs` table → Should succeed
3. Try to query `admin_actions` table → Should fail (no permission)
4. Try to update `equipment.purchase_cost` → Should fail (read-only)

**Expected:** Database rejects unauthorized queries

---

### **Test Case 3: Data Access Audit**

**Steps:**
1. Login as Accounts Officer
2. Generate depreciation report
3. Master Admin checks `data_access_audit` table
4. Verify entry logged with:
   - `user_role = 'accounts_officer'`
   - `resource_type = 'financial_data'`
   - `data_sensitivity = 'confidential'`
   - Timestamp and IP address

**Expected:** All sensitive access logged for GDPR compliance

---

## **Troubleshooting**

### **Issue: "Role not enabled" error when creating user**

**Cause:** Feature flag for role is disabled

**Solution:**
```sql
-- Check flag status
SELECT feature_key, is_enabled FROM system_feature_flags
WHERE feature_key = 'role_accounts_officer';

-- Enable if needed
UPDATE system_feature_flags
SET is_enabled = true
WHERE feature_key = 'role_accounts_officer';
```

---

### **Issue: User can't see financial data**

**Debugging:**
1. Check role assignment:
   ```sql
   SELECT role FROM users WHERE email = 'accounts@ncad.ie';
   ```

2. Check feature flags:
   ```sql
   SELECT is_enabled FROM system_feature_flags
   WHERE feature_key IN ('role_accounts_officer', 'feature_financial_management');
   ```

3. Test RLS function:
   ```sql
   SELECT can_access_financial_data(); -- Should return true
   ```

4. Check equipment has financial data:
   ```sql
   SELECT id, product_name, purchase_cost FROM equipment WHERE purchase_cost IS NOT NULL;
   ```

---

### **Issue: Cost center allocation exceeds 100%**

**Cause:** Validation trigger prevents total allocation > 100%

**Solution:**
```sql
-- Check current allocations
SELECT department, allocation_percentage
FROM staff_cost_centers
WHERE admin_id = 'xxx-xxx-xxx'
  AND (effective_to IS NULL OR effective_to >= CURRENT_DATE);

-- Update existing allocation before adding new one
UPDATE staff_cost_centers
SET allocation_percentage = 30 -- Reduce from 40
WHERE admin_id = 'xxx' AND department = 'PRODUCT_DESIGN';
```

---

## **Appendix A: SQL Migration Checklist**

- [ ] Run `01-enhanced-roles-schema.sql`
- [ ] Verify 9 feature flags created
- [ ] Verify equipment table has new columns (purchase_cost, serial_number, etc.)
- [ ] Run `02-rls-policies-enhanced.sql`
- [ ] Test RLS with sample queries per role
- [ ] Run `03-financial-functions.sql`
- [ ] Test depreciation calculation on sample equipment
- [ ] Run `04-payroll-it-functions.sql`
- [ ] Test workload calculation with sample admin_actions
- [ ] Create test users for each role
- [ ] Verify dashboard access per role

---

## **Appendix B: Master Admin Quick Reference**

**Enable Accounts Officer Role:**
1. System Configuration → Accounts Officer → Toggle ON
2. Also enable "Financial Management Module"
3. Create user with `role = 'accounts_officer'`
4. Add sample equipment costs for testing

**Disable Role (Emergency):**
1. System Configuration → Role → Toggle OFF
2. All users with that role immediately lose access
3. Check Activity Log to confirm change logged

**View Audit Trail:**
1. System Configuration → Activity Log
2. Export CSV for compliance reporting

---

**Implementation Complete!** 🎉

Your NCAD Equipment Booking System now supports 9 roles with master admin-controlled feature flags, comprehensive financial/payroll/IT modules, and GDPR-compliant audit trails.
