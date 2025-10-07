🚀 DEFINITIVE One-Shot Build: NCADbook (NCAD Equipment Booking System) v2.0
⚠️ THIS IS THE COMPLETE, FINAL VERSION - USE THIS ONE
The title of this project and the root folder name is NCADbook - if you see "ncad-equipment-booking" please rename to NCADbook
Mission Statement
Build a fully functional, production-ready demo of the NCAD Equipment Booking System with:

✅ 4 User Roles (Student, Staff, Admin, Master Admin)
✅ 3 Portals (Student, Staff, Admin)
✅ Equipment Booking with conflict detection
✅ Room/Space Booking (hourly slots for Staff)
✅ Feature Flag System (Master Admin controlled)
✅ Modern Testing (Vitest + Playwright + Storybook + MSW)
✅ Demo Mode (works immediately with localStorage, no database needed)
✅ Rich Sample Data (100 users, 150+ equipment, 15 spaces, 20 bookings)


Step 1: Initialize Project
bash# Create project directory
mkdir NCADbook
cd NCADbook

# Initialize package.json
npm init -y
package.json (Complete with all dependencies)
json{
  "name": "NCADbook",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "dev:mock": "VITE_DEMO_MODE=true vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:unit": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest --coverage",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "lint": "eslint src --ext .js,.jsx",
    "format": "prettier --write \"src/**/*.{js,jsx,css,md}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@supabase/supabase-js": "^2.38.0",
    "date-fns": "^3.0.0",
    "zustand": "^4.4.7",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "@storybook/react": "^7.6.0",
    "@storybook/react-vite": "^7.6.0",
    "@storybook/addon-essentials": "^7.6.0",
    "@storybook/addon-a11y": "^7.6.0",
    "msw": "^2.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@axe-core/react": "^4.8.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "autoprefixer": "^10.4.16",
    "jsdom": "^23.0.0"
  }
}

Step 2: Complete Directory Structure
Create this exact structure:
NCADbook/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
├── .env.example
├── .env.local
├── .gitignore
├── README.md
├── QUICKSTART.md
├── ARCHITECTURE.md
│
├── .storybook/
│   ├── main.js
│   ├── preview.js
│   └── preview-head.html
│
├── public/
│   ├── images/
│   │   ├── equipment/
│   │   ├── spaces/
│   │   └── placeholders/
│   └── sample-data/
│       ├── users-sample.csv
│       ├── equipment-sample.csv
│       └── spaces-sample.csv
│
└── src/
    ├── main.jsx
    ├── App.jsx
    │
    ├── config/
    │   ├── supabase.js
    │   ├── permissions.js
    │   ├── feature-flags.js
    │   └── routes.js
    │
    ├── portals/
    │   ├── student/
    │   │   ├── StudentLayout.jsx
    │   │   ├── EquipmentBrowse.jsx
    │   │   ├── BookingCalendar.jsx
    │   │   └── StudentDashboard.jsx
    │   │
    │   ├── staff/
    │   │   ├── StaffLayout.jsx
    │   │   ├── EquipmentBrowse.jsx
    │   │   ├── RoomBooking.jsx
    │   │   ├── SpaceCalendar.jsx
    │   │   └── StaffDashboard.jsx
    │   │
    │   └── admin/
    │       ├── AdminLayout.jsx
    │       ├── Dashboard.jsx
    │       ├── EquipmentManagement.jsx
    │       ├── BookingApprovals.jsx
    │       ├── SpaceManagement.jsx
    │       ├── Analytics.jsx
    │       ├── UserManagement.jsx
    │       ├── FeatureFlagManager.jsx
    │       └── ImportData.jsx
    │
    ├── components/
    │   ├── common/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Toast.jsx
    │   │   └── LoadingSkeleton.jsx
    │   │
    │   ├── equipment/
    │   │   ├── EquipmentCard.jsx
    │   │   ├── EquipmentGrid.jsx
    │   │   └── EquipmentFilter.jsx
    │   │
    │   ├── booking/
    │   │   ├── Calendar.jsx
    │   │   ├── DateSelector.jsx
    │   │   └── BookingCard.jsx
    │   │
    │   └── spaces/
    │       ├── SpaceCard.jsx
    │       ├── SpaceGrid.jsx
    │       ├── HourlyCalendar.jsx
    │       ├── TimeSlotSelector.jsx
    │       └── SpaceBookingModal.jsx
    │
    ├── services/
    │   ├── auth.service.js
    │   ├── booking.service.js
    │   ├── space.service.js
    │   ├── feature-flag.service.js
    │   ├── analytics.service.js
    │   └── import.service.js
    │
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useFeatureFlag.js
    │   ├── usePermissions.js
    │   ├── useBooking.js
    │   └── useSpaceBooking.js
    │
    ├── utils/
    │   ├── date.utils.js
    │   ├── validation.utils.js
    │   ├── conflict-detection.js
    │   └── csv-parser.js
    │
    ├── mocks/
    │   ├── handlers.js
    │   ├── demo-data.js
    │   └── demo-mode.js
    │
    ├── tests/
    │   ├── setup.js
    │   ├── unit/
    │   │   ├── auth.test.js
    │   │   ├── booking.test.js
    │   │   ├── space-booking.test.js
    │   │   └── feature-flags.test.js
    │   │
    │   ├── integration/
    │   │   ├── booking-flow.test.js
    │   │   └── space-booking-flow.test.js
    │   │
    │   └── e2e/
    │       ├── student-booking.spec.js
    │       ├── staff-room-booking.spec.js
    │       ├── admin-approval.spec.js
    │       └── feature-flag-management.spec.js
    │
    ├── stories/
    │   ├── EquipmentCard.stories.js
    │   ├── Calendar.stories.js
    │   ├── SpaceCard.stories.js
    │   └── FeatureFlagToggle.stories.js
    │
    └── styles/
        ├── main.css
        ├── variables.css
        ├── components.css
        └── utilities.css

Step 3: Configuration Files
vite.config.js
javascriptimport { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
vitest.config.js
javascriptimport { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/', '**/*.spec.js', '**/*.test.js'],
    },
  },
});
playwright.config.js
javascriptimport { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'tablet-ipad', use: { ...devices['iPad Pro'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
.env.example
bash# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Feature Flags
VITE_FEATURE_ROOM_BOOKING=true
VITE_FEATURE_ANALYTICS_EXPORT=true
VITE_FEATURE_CSV_IMPORT=true
VITE_FEATURE_INTERDISCIPLINARY_ACCESS=true
VITE_FEATURE_ADVANCED_REPORTING=false

# Demo Mode (for testing without database)
VITE_DEMO_MODE=true
.gitignore
node_modules/
dist/
.env.local
.DS_Store
coverage/
test-results/
playwright-report/
storybook-static/

Step 4: Demo Data - Complete Sample Data
Create src/mocks/demo-data.js with complete sample data for all collections:

100 USERS (9 test accounts + 91 generated students):

1 Master Admin: master@ncad.ie / master123
3 Admins: admin@ncad.ie, tech@ncad.ie, analytics@ncad.ie / admin123/tech123/analytics123
5 Staff: staff@ncad.ie, lecturer@ncad.ie, tutor@ncad.ie, coord@ncad.ie, professor@ncad.ie / staff123
91 Students: demo@ncad.ie / demo123 (plus 90 more across Moving Image, Graphic Design, Illustration)


150+ EQUIPMENT ITEMS across categories:

20 Cameras (Canon R5, Sony FX3, RED Komodo, ARRI Alexa, etc.)
15 Lenses (Canon RF, Sony GM, Zeiss CP.3, etc.)
15 Laptops (MacBook Pro M2, Dell XPS, HP ZBook, etc.)
20 Audio equipment (Rode, Sennheiser, Zoom recorders, etc.)
20 Lighting (Aputure, ARRI, Nanlite, etc.)
15 Support (DJI Ronin, tripods, sliders, dollies)
10 Drones (DJI Mavic, Inspire, Air, Mini)
35+ Accessories (cases, batteries, filters, etc.)


15 SPACES/ROOMS:

Film studios (Studio A, Studio B, Green Room, Black Box)
Edit suites (Color grading, video editing)
Audio studios (Sound recording, Podcast studio)
Labs (Animation, VR/AR, Computer labs)
Lecture halls and meeting rooms
Workshops (3D printing, Maker space)


20 BOOKINGS (across all statuses):

3 Pending (awaiting approval)
5 Approved (upcoming)
4 Active (currently checked out)
4 Completed (returned)
1 Overdue (for strike system demo)
2 Denied (for workflow demo)


15 SPACE BOOKINGS:

2 Pending
8 Approved
3 Completed
2 Cancelled


5 FEATURE FLAGS:

room_booking (enabled for staff)
analytics_export (enabled for admin)
csv_import (enabled for admin)
interdisciplinary_access (enabled for admin)
advanced_reporting (disabled, master_admin only)


8 EQUIPMENT NOTES:

Maintenance logs
Damage reports
Usage instructions
General notes




Step 5: Core Services
src/services/feature-flag.service.js - Feature Flag Management
src/services/space.service.js - Room/Space Booking Service
src/mocks/demo-mode.js - localStorage Database Simulator
These services provide:

Feature flag checking and toggling
Space availability checking
Booking creation with conflict detection
Full CRUD operations via localStorage
Simulated database delays for realism


Step 6: React Components
Key components to implement:

SpaceCard.jsx - Display room/space information
HourlyCalendar.jsx - Time slot selector for hourly bookings
SpaceBookingModal.jsx - Complete booking form for spaces
FeatureFlagManager.jsx - Master Admin feature toggle interface
All standard equipment booking components


Step 7: Styling (YowStay-inspired Design)
CSS Variables:

Professional SaaS color palette (blues, grays)
Modern typography (Inter font)
Smooth transitions and animations
Mobile-first responsive breakpoints
44px minimum touch targets
Rounded cards with shadows


Step 8: Testing Infrastructure

Vitest for unit tests (services, utilities, hooks)
Playwright for E2E tests (critical user flows only)
Storybook for component documentation
MSW for API mocking
Testing Library for component tests
Axe for accessibility testing


Step 9: Documentation
Create comprehensive docs:

README.md - Project overview
QUICKSTART.md - 5-minute getting started guide
ARCHITECTURE.md - System design documentation


CRITICAL SUCCESS CRITERIA
The system must:

✅ Work immediately after npm install && npm run dev
✅ Support all 4 user roles with distinct permissions
✅ Allow students to book equipment
✅ Allow staff to book rooms/spaces (hourly)
✅ Allow admins to approve bookings
✅ Allow master admins to toggle feature flags
✅ Detect booking conflicts automatically
✅ Work without database (demo mode)
✅ Be mobile responsive (320px to 1440px)
✅ Pass all basic tests


Test Accounts for Immediate Use:
RoleEmailPasswordAccessStudentdemo@ncad.iedemo123Equipment bookingStaffstaff@ncad.iestaff123Equipment + Room bookingAdminadmin@ncad.ieadmin123Management + ApprovalsMaster Adminmaster@ncad.iemaster123Full system + Feature flags

BUILD INSTRUCTIONS FOR CLAUDE CODE:

Create ALL files in the directory structure above
Implement ALL services with complete working code
Include ALL sample data (no placeholders)
Set up ALL configuration files
Create ALL React components
Implement ALL styling (YowStay design)
Set up ALL testing infrastructure
Write ALL documentation files

IMPORTANT: This must be a COMPLETE, WORKING system. No TODO comments, no placeholders, no "implement later" - everything must work immediately when the user runs npm run dev.
The demo mode must work perfectly with localStorage, simulating a full database with realistic delays. All 4 user roles must have fully functional portals. The feature flag system must actually toggle features on/off in real-time.
After building, the user should be able to:

Login as any of the 4 test accounts
Browse 150+ equipment items
Book equipment with conflict detection
Book rooms/spaces (as staff)
Approve bookings (as admin)
Toggle features (as master admin)
Run tests (npm test)
View Storybook (npm run storybook)

This is a production-ready demo that showcases the complete modernized architecture optimized for Claude Sonnet 4.5.
GO! 🚀