# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NCAD Equipment Booking System - A mobile-first web application for managing equipment bookings at NCAD College. Serves 1,600 students across Moving Image Design, Graphic Design, and Illustration departments, managing 200+ pieces of equipment with future expansion to room/space bookings.

**Tech Stack:**
- Frontend: HTML/CSS/JavaScript (mobile-first responsive design)
- Backend: Supabase (PostgreSQL with Row Level Security)
- Testing: Playwright (configured for mobile/tablet/desktop)
- Email: EmailJS for notifications
- Deployment: On-campus hosting (Netlify/Vercel for development)

## Development Commands

Currently in early setup phase. No build/test commands configured yet in package.json.

**Playwright Testing** (when configured):
```bash
npm test                           # Run all tests
npx playwright test --project=mobile-chrome    # Mobile-specific tests
npx playwright test --project=chromium-desktop # Desktop tests
npx playwright test --ui           # Interactive test mode
npx playwright show-report         # View test results
```

## Project Architecture

### Core Design Principles
- **Mobile-First**: Design for 320px viewport first, enhance for tablet (768px) and desktop (1024px+)
- **Touch-Optimized**: Minimum 44px touch targets for all interactive elements
- **Performance**: <3 second load on 3G networks, lazy loading for images, virtual scrolling for lists
- **Security**: Row Level Security (RLS) policies for all database access, GDPR-compliant data handling
- **Accessibility**: WCAG 2.2 AA compliance, ARIA labels, keyboard navigation

### Directory Structure
```
/src                    # Source code (to be created)
  /components           # Reusable UI components
  /css                  # Styles (mobile-first CSS)
  /js                   # JavaScript modules
  /config               # Configuration (Supabase, EmailJS)
/public                 # Static assets
  /images/equipment     # Equipment images (local storage)
/docs                   # Comprehensive documentation
  /agents               # Sub-agent specifications for complex features
  /guides               # Setup and integration guides
/tests                  # Playwright test suites
  /integration          # Desktop integration tests
  /mobile               # Mobile-specific tests
```

### Database Architecture (Supabase)

**Critical Tables:**
- `users` - Student/admin accounts with role-based permissions (student, general_admin, master_admin)
- `equipment` - 200+ equipment items with tracking numbers (admin-only visibility), QR codes, images
- `equipment_notes` - Multi-field admin notes (maintenance, damage, usage, general) - admin only
- `bookings` - Equipment reservations with approval workflow
- `admin_actions` - Complete audit trail for compliance
- `cross_department_access` - Time-limited interdisciplinary equipment sharing

**Key Features:**
- Row Level Security (RLS) policies enforce permissions at database level
- Automatic equipment status updates via triggers (available → booked → available)
- Conflict detection function prevents double-bookings
- JSONB fields for flexible schemas (admin_permissions, interdisciplinary_access)
- Complete audit trail for GDPR compliance

See [docs/agents/01-database-schema-architect.md](docs/agents/01-database-schema-architect.md) for complete schema, RLS policies, and utility functions.

### Component Architecture

**Mobile-First Components** (see [docs/agents/02-mobile-ui-component-builder.md](docs/agents/02-mobile-ui-component-builder.md)):
- Equipment cards with lazy-loaded images
- Touch-optimized calendar (60px minimum touch targets on mobile)
- Swipe-action cards for admin booking approval
- Loading skeletons for performance perception
- Pull-to-refresh for mobile data updates

**Responsive Breakpoints:**
- Mobile: 320px - 768px (single column, larger touch targets)
- Tablet: 768px - 1024px (2-column grids, swipe hints)
- Desktop: 1024px+ (3-column grids, hover states)

### User Roles & Permissions

**Student (1,600 users):**
- Browse equipment catalog (all devices)
- Create bookings with purpose/justification
- View own booking history
- Track return deadlines

**General Admin (3-5 users):**
- Approve/deny bookings for assigned departments
- Add multi-field notes to equipment (maintenance, damage, usage)
- View department-specific reports
- Manage equipment status (available, maintenance, out_of_service)

**Master Admin (1-2 users):**
- Full system oversight across all departments
- Manage admin permissions granularly
- CSV import (users and equipment) with GDPR validation
- Generate comprehensive analytics and exports (CSV/PDF)
- Control cross-departmental access

### Key Features

**CSV Import System** (see [docs/agents/05-csv-import-specialist.md](docs/agents/05-csv-import-specialist.md)):
- GDPR-compliant data validation with preview before import
- Duplicate detection and handling
- Required columns: users (first_name, surname, full_name, email, department), equipment (product_name, tracking_number, description, link_to_image)
- Template download for correct format

**Analytics Dashboard** (see [docs/agents/06-analytics-reporting-agent.md](docs/agents/06-analytics-reporting-agent.md)):
- Equipment utilization rates (target: 20%+ increase)
- Department-level booking analytics
- Popular equipment tracking
- Repair cost tracking and budget impact
- CSV/PDF export with custom date ranges
- Mobile-responsive dashboard

**Booking System** (see [docs/agents/04-sub_agent_booking_logic.md](docs/agents/04-sub_agent_booking_logic.md)):
- Multi-item booking (select multiple equipment or kits)
- Smart weekend selection (Friday bookings auto-include Sat/Sun)
- Real-time availability checking with conflict detection
- Conditional justification fields for high-value items
- Equipment kits (admin-configurable bundles)

**Mobile Calendar:**
- Large touch targets (60px on mobile)
- Swipe gestures for month navigation
- Visual availability indicators (available, provisional, booked, selected)
- Drag-and-drop for date range selection

## Documentation Structure

### Sub-Agent Specifications
Complex features are documented as specialized sub-agents in [docs/agents/](docs/agents/):
1. **01-database-schema-architect.md** - Complete database schema, RLS policies, triggers, functions
2. **02-mobile-ui-component-builder.md** - Reusable responsive components with code examples
3. **03-authentication-permission-manager.md** - Auth flows, role-based permissions
4. **04-sub_agent_booking_logic.md** - Booking rules, conflict detection, approval workflow
5. **05-csv-import-specialist.md** - GDPR-compliant import with validation
6. **06-analytics-reporting-agent.md** - Metrics calculation and export functionality
7. **stylingSubagent.md** - Design system and styling guidelines

### Additional Documentation
- [docs/equipment_booking_prd.md](docs/equipment_booking_prd.md) - Complete Product Requirements Document with success metrics
- [docs/ui_requirements.md](docs/ui_requirements.md) - Wireframes, mobile adaptations, interaction patterns
- [docs/guides/PlayWriteMCP_integration.md](docs/guides/PlayWriteMCP_integration.md) - Playwright testing integration
- [docs/guides/claude_code_setup_guide.md](docs/guides/claude_code_setup_guide.md) - Claude Code setup instructions

## Important Implementation Notes

### Mobile Performance
- **Image Optimization**: Use lazy loading with `loading="lazy"`, serve images at appropriate sizes
- **CSS Animations**: Use `transform` and `opacity` only (GPU-accelerated), avoid layout changes
- **Debouncing**: 300ms delay on search inputs to reduce API calls
- **Virtual Scrolling**: Required for equipment lists >50 items
- **Offline-Ready Foundation**: Structure code for future offline mode with service workers

### Security & Compliance
- **Never expose tracking_number** to students (admin-only field)
- **RLS Policies**: All database access must respect Row Level Security policies
- **GDPR**: CSV imports require validation and preview, audit trail for all admin actions
- **Input Validation**: Prevent SQL injection via Supabase parameterized queries
- **Session Management**: Secure token-based auth with Supabase Auth

### Authentication Flow
- First-time users set password on login
- Role assignment via CSV import or master admin interface
- Admin permissions stored as JSONB for flexibility
- Cross-departmental access requires time-limited approval

### Testing Strategy
- Playwright configured for 6 device profiles (desktop, mobile Chrome/Safari, tablet Chrome/iPad, landscape)
- Mobile tests in `/tests/mobile`, integration tests in `/tests/integration`
- Test touch interactions, swipe gestures, and responsive layouts
- Performance testing for 3G network conditions

## Workflow Guidelines

When implementing features:
1. **Start mobile-first** - Design for 320px viewport, enhance upward
2. **Reference sub-agent docs** - Each major feature has detailed specifications
3. **Test across devices** - Use Playwright profiles for mobile/tablet/desktop
4. **Validate RLS** - Ensure database policies enforce permissions
5. **Check PRD success metrics** - Target: 75% admin time reduction, 70%+ mobile bookings

## Current Project Status

Early setup phase. Key next steps:
- Scaffold source code structure (`/src`)
- Configure Supabase client and connection
- Implement database schema from [docs/agents/01-database-schema-architect.md](docs/agents/01-database-schema-architect.md)
- Build core UI components from [docs/agents/02-mobile-ui-component-builder.md](docs/agents/02-mobile-ui-component-builder.md)
- Set up authentication system from [docs/agents/03-authentication-permission-manager.md](docs/agents/03-authentication-permission-manager.md)

## Code Style Preferences

- **CSS**: Mobile-first media queries, use CSS custom properties for theming
- **JavaScript**: ES6+ modules, async/await for async operations
- **Components**: Self-contained with co-located styles
- **Naming**: BEM methodology for CSS classes (`.component__element--modifier`)
- **Accessibility**: Always include ARIA labels, ensure keyboard navigation
