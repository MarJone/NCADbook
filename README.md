# 🎨 NCADbook - Equipment Booking System

A comprehensive, mobile-first equipment booking and management system for NCAD College. Designed to serve 1,600+ students and staff across 10 departments with 200+ pieces of equipment.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

---

## 🚀 **Quick Demo Access**

This system is currently running in **Demo Mode** - fully functional without requiring database setup.

### **Portal Login Credentials**

Access the artistic login page and click any quadrant to enter:

| Portal | Email | Password | Features |
|--------|-------|----------|----------|
| **Student** | `commdesign.student1@student.ncad.ie` | `student123` | Browse equipment, create bookings, view history |
| **Staff** | `staff.commdesign@ncad.ie` | `staff123` | Equipment management, analytics, room bookings |
| **Dept Admin** | `admin.commdesign@ncad.ie` | `admin123` | Approve bookings, manage equipment, cross-dept access |
| **Master Admin** | `master@ncad.ie` | `master123` | Full system control, role management, system settings |

### **Specialized Role Demos** (Access via Role Management page)

| Role | Demo Portal | Purpose |
|------|-------------|---------|
| View-Only Staff | `/demo/view_only_staff` | Read-only catalog access for teaching faculty |
| Accounts Officer | `/demo/accounts_officer` | Financial reporting & cost analysis |
| Payroll Coordinator | `/demo/payroll_coordinator` | Staff time tracking & payroll exports |
| IT Support | `/demo/it_support_technician` | Equipment lifecycle & system management |
| Budget Manager | `/demo/budget_manager` | Budget forecasting & ROI analytics |

---

## ✨ **Key Features**

### **9-Role Permission System**
- 🎓 **Student** - Browse & book equipment, track reservations
- 👥 **Staff** - Department equipment management, room bookings
- 🎯 **Department Admin** - Approve bookings, manage equipment, cross-department access control
- 👑 **Master Admin** - System-wide oversight, role management, feature flags
- 👀 **View-Only Staff** - Read-only catalog access
- 💰 **Accounts Officer** - Financial reporting & cost tracking
- ⏱️ **Payroll Coordinator** - Staff allocation & payroll integration
- 🔧 **IT Support** - Equipment lifecycle & maintenance tracking
- 📊 **Budget Manager** - Strategic budget planning & forecasting

### **Core Functionality**
- 📱 **Mobile-First Design** - Optimized for 320px+ viewports with touch-friendly interfaces
- 🎨 **Artistic Login Experience** - Interactive quadrant-based portal selection
- 📊 **Advanced Analytics** - Equipment utilization, booking trends, cost analysis
- 📤 **PDF/CSV Export** - Professional reports with college branding
- 🔄 **Cross-Department Access** - Granular control over inter-departmental equipment sharing
- 📦 **Equipment Kits** - Bundle related items for easy booking
- 🏢 **Room Bookings** - Integrated space reservation system
- 🚨 **Smart Notifications** - Email alerts for bookings, approvals, returns
- 🎭 **Feature Flag System** - Master admin control over advanced roles

### **Admin Features**
- ✅ Swipe-action booking approvals (mobile-optimized)
- 📝 Multi-field equipment notes (maintenance, damage, usage)
- 📊 Department-level analytics with custom date ranges
- 👥 Bulk CSV user/equipment import with validation
- 🔐 Granular permission management per role
- 🌐 Cross-department access matrix

---

## 🛠️ **Tech Stack**

- **Frontend:** React 18, React Router v6
- **Styling:** CSS Modules, Design Tokens, Mobile-First Architecture
- **Backend:** Supabase (PostgreSQL + Auth + Row Level Security)
- **Email:** EmailJS for notifications
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **Build Tool:** Vite
- **Testing:** Playwright (E2E), Vitest (Unit)
- **Deployment:** Netlify (Demo), On-campus hosting (Production)

---

## 📦 **Installation & Setup**

### **Prerequisites**
- Node.js 18+ and npm
- Git

### **Local Development**

```bash
# Clone the repository
git clone <repository-url>
cd NCADbook

# Install dependencies
npm install

# Run in Demo Mode (no database required)
npm run dev

# The app will open at http://localhost:5173
```

### **Environment Configuration**

#### **Demo Mode (Current Setup)**
The system runs in full demo mode by default. No environment configuration needed!

#### **Production Mode (Future)**
Create `.env.local` with Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_DEMO_MODE=false

# Optional Feature Flags
VITE_FEATURE_ROOM_BOOKING=true
VITE_FEATURE_ANALYTICS_EXPORT=true
VITE_FEATURE_CSV_IMPORT=true
```

---

## 🚀 **Deployment (Netlify)**

### **Quick Deploy**

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod
     ```

3. **Environment Variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `VITE_DEMO_MODE=true` to keep demo mode active

### **Continuous Deployment**
Connect your Git repository to Netlify:
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Add all `VITE_*` variables from `.env.local`

---

## 📱 **Demo Walkthrough Guide**

### **For Stakeholders - Feature Demonstration**

#### **1. Student Experience (5 min)**
- 🎨 Login via artistic map → Click top-left quadrant (Student)
- 📱 Browse equipment catalog (mobile-responsive cards)
- 🔍 Filter by department, category, availability
- 📅 Create a booking with date picker
- 📊 View booking history and status

#### **2. Department Admin Portal (7 min)**
- 🎨 Login → Bottom-left quadrant (Dept Admin)
- ✅ Swipe-action booking approvals (mobile gesture)
- 📝 Add equipment notes (maintenance, damage, usage)
- 📊 View department analytics dashboard
- 🌐 Manage cross-department access requests
- 📦 Create equipment kits

#### **3. Master Admin Features (5 min)**
- 🎨 Login → Bottom-right quadrant (Master Admin)
- 🎭 Role Management: Toggle specialized roles on/off
- ⚙️ System Settings: Configure cross-department access matrix
- 📊 View system-wide analytics
- 👥 Manage user permissions

#### **4. Specialized Roles Tour (3 min each)**
- Navigate to Master Admin → Role Management
- Click "Test Demo Portal" on each enabled role:
  - **Accounts Officer:** Financial reports, TCO tracking, cost analysis
  - **IT Support:** Equipment lifecycle, maintenance logs, system diagnostics
  - **Budget Manager:** ROI calculator, budget forecasting, replacement planning

---

## 📊 **Project Statistics**

- **Departments:** 10 NCAD departments + 3 Media sub-departments
- **User Roles:** 9 comprehensive roles
- **Demo Users:** 150 (1 master admin, 13 dept admins, 10 staff, 126 students)
- **Demo Equipment:** 150 items across all departments
- **Portals:** 4 main portals + 5 specialized role demos
- **Design System:** 94KB design tokens, 239KB total CSS
- **Feature Flags:** 9 toggleable features for role/module control

---

## 🎯 **Success Metrics** (from PRD)

- ⏱️ **75% reduction** in admin time spent on booking management
- 📱 **70%+ mobile bookings** target (mobile-first design)
- 📈 **20%+ increase** in equipment utilization
- 💰 **Reduced repair costs** via better maintenance tracking
- 🤝 **Enhanced collaboration** through cross-department sharing

---

## 📁 **Project Structure**

```
NCADbook/
├── public/                      # Static assets
│   ├── login-map-starter.png   # Artistic login image
│   └── ...
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/             # Login, Toast, ErrorBoundary
│   │   └── booking/            # Booking-specific components
│   ├── portals/                # Role-specific portals
│   │   ├── student/            # Student portal
│   │   ├── staff/              # Staff portal
│   │   ├── admin/              # Department Admin portal
│   │   ├── master-admin/       # Master Admin portal
│   │   ├── view-only-staff/    # View-Only Staff portal
│   │   ├── accounts-officer/   # Accounts Officer portal
│   │   ├── payroll-coordinator/# Payroll Coordinator portal
│   │   ├── it-support/         # IT Support portal
│   │   ├── budget-manager/     # Budget Manager portal
│   │   └── demo/               # Public demo portals
│   ├── contexts/               # React contexts (Auth, Theme)
│   ├── services/               # API services & business logic
│   ├── mocks/                  # Demo data (phase8)
│   ├── styles/                 # CSS design system
│   │   ├── design-tokens.css   # Design system foundation
│   │   ├── theme-*.css         # Portal-specific themes
│   │   └── components-*.css    # Component styles
│   └── App.jsx                 # Main app component
├── database/                    # Supabase migration files
│   ├── 00-base-schema.sql      # Core tables
│   ├── 01-enhanced-roles-schema.sql  # 9-role system
│   ├── 02-rls-policies-enhanced.sql  # Security policies
│   └── ...
├── docs/                        # Comprehensive documentation
│   ├── agents/                 # Feature specifications
│   └── guides/                 # Setup & integration guides
├── tests/                       # Playwright test suites
│   ├── integration/            # E2E tests
│   └── mobile/                 # Mobile-specific tests
├── package.json
├── vite.config.js
└── README.md
```

---

## 🧪 **Testing**

### **Available Test Suites**

```bash
# Run all tests
npm test

# E2E tests with UI
npm run test:e2e:ui

# Mobile-specific tests
npm run test:mobile

# Role-specific tests
npm run test:student
npm run test:staff
npm run test:admin
npm run test:master-admin

# Booking workflow tests
npm run test:booking-workflow

# View test report
npm run test:report
```

---

## 📚 **Documentation**

- [Equipment Booking PRD](docs/equipment_booking_prd.md) - Product Requirements Document
- [UI Requirements](docs/ui_requirements.md) - Wireframes & mobile adaptations
- [Database Schema](docs/agents/01-database-schema-architect.md) - Complete database architecture
- [Mobile UI Components](docs/agents/02-mobile-ui-component-builder.md) - Responsive component library
- [Authentication](docs/agents/03-authentication-permission-manager.md) - Auth flows & permissions
- [Booking Logic](docs/agents/04-sub_agent_booking_logic.md) - Booking rules & conflict detection
- [CSV Import](docs/agents/05-csv-import-specialist.md) - GDPR-compliant data import
- [Analytics](docs/agents/06-analytics-reporting-agent.md) - Metrics & reporting
- [Styling Guide](docs/agents/stylingSubagent.md) - Design system guidelines

---

## 🤝 **Future Production Integration**

### **Infrastructure Consultation (IT Support)**
When moving to production, coordinate with IT on:

1. **Database Setup**
   - Supabase self-hosted vs. cloud
   - On-campus PostgreSQL integration options
   - Row Level Security (RLS) policy deployment

2. **Authentication**
   - SSO integration (LDAP/Active Directory)
   - NCAD email domain validation
   - Password policies and session management

3. **Hosting Options**
   - On-campus server deployment
   - Supabase Edge Functions vs. on-prem backend
   - CDN for static assets

4. **Email Integration**
   - NCAD SMTP server configuration
   - Notification templates approval
   - Email delivery monitoring

5. **Data Migration**
   - Student roster import from existing systems
   - Equipment catalog data transfer
   - Historical booking data (if applicable)

---

## 🎨 **Design System**

The project uses a comprehensive design system with:
- **8pt Grid System** for consistent spacing
- **Design Tokens** for colors, typography, shadows
- **Portal-Specific Themes** (Student: Blue, Staff: Green, Admin: Orange, Master: Purple)
- **Mobile-First Breakpoints** (320px, 768px, 1024px+)
- **Accessible Color Palette** (WCAG 2.2 AA compliant)

---

## 📝 **License**

ISC License - NCAD College

---

## 🙏 **Acknowledgments**

Built with [Claude Code](https://claude.com/claude-code) for rapid prototyping and development.

---

## 📞 **Support & Contact**

For demo questions or technical support during evaluation:
- Demo walkthrough available upon request
- Live presentation scheduling available
- Technical architecture deep-dive sessions available

---

**Current Version:** 2.0.0 (Demo Mode)
**Last Updated:** October 2025
**Status:** 🟢 Ready for Stakeholder Demo
