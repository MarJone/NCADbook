# NCADbook - Test Suite Documentation

Comprehensive Playwright test suite for the NCAD Equipment Booking System.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The test suite uses **Playwright** for end-to-end testing across multiple browsers and devices. Tests cover:

- ✅ All 4 user portals (Student, Staff, Admin, Master Admin)
- ✅ Complete booking workflow (create → approve → deny)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Email notifications (mocked)
- ✅ CSV import validation
- ✅ User management CRUD operations
- ✅ Equipment notes system
- ✅ Feature flags and configuration

## Test Structure

```
tests/
├── fixtures/
│   └── auth.fixtures.js        # Authentication helpers & user credentials
├── utils/
│   └── test-helpers.js         # Common test utilities
├── integration/
│   ├── student-portal.spec.js  # Student portal E2E tests
│   ├── staff-portal.spec.js    # Staff portal E2E tests
│   ├── admin-portal.spec.js    # Admin portal E2E tests
│   ├── master-admin.spec.js    # Master admin E2E tests
│   ├── booking-workflow.spec.js # Full booking workflow tests
│   ├── email-notifications.spec.js # Email notification tests (mocked)
│   └── csv-import.spec.js      # CSV import validation tests
└── mobile/
    └── responsive.spec.js      # Responsive design tests
```

## Running Tests

### Prerequisites

Ensure the dev server is running:
```bash
npm run dev
# Server should be available at http://localhost:5174
```

### Run All Tests

```bash
npm test                    # Run all tests
npm run test:e2e           # Same as above
```

### Run Tests by Portal

```bash
npm run test:student       # Student portal tests only
npm run test:staff         # Staff portal tests only
npm run test:admin         # Admin portal tests only
npm run test:master-admin  # Master admin tests only
```

### Run Tests by Feature

```bash
npm run test:booking-workflow  # Booking workflow tests
npm run test:email            # Email notification tests
npm run test:csv              # CSV import tests
npm run test:responsive       # Responsive design tests
```

### Run Tests by Device Type

```bash
npm run test:mobile    # Mobile devices (iPhone, Pixel)
npm run test:tablet    # Tablets (iPad, Galaxy Tab)
npm run test:desktop   # Desktop browsers (Chrome, Firefox, Safari)
```

### Interactive Mode

```bash
npm run test:e2e:ui    # Open Playwright UI for interactive testing
npm run test:e2e:headed # Run tests with visible browser
npm run test:e2e:debug  # Run tests in debug mode
```

### View Test Reports

```bash
npm run test:report    # Open HTML test report
```

## Test Suites

### 1. Student Portal Tests (`student-portal.spec.js`)

**Coverage:**
- ✅ Login/logout functionality
- ✅ Equipment browsing and filtering
- ✅ Search functionality
- ✅ Equipment details view
- ✅ Booking creation with validation
- ✅ My Bookings view
- ✅ Booking cancellation
- ✅ Responsive design

**Demo Account:**
- Email: `demo@ncad.ie`
- Password: `demo123`

**Key Tests:**
```javascript
test('should login successfully with valid credentials')
test('should display equipment catalog')
test('should create booking with valid dates')
test('should validate required fields')
test('should cancel pending booking')
```

### 2. Staff Portal Tests (`staff-portal.spec.js`)

**Coverage:**
- ✅ Staff authentication
- ✅ Room/space booking functionality
- ✅ Equipment access
- ✅ Calendar view
- ✅ My bookings management
- ✅ Responsive design

**Demo Account:**
- Email: `staff@ncad.ie`
- Password: `staff123`

**Key Tests:**
```javascript
test('should display available rooms/spaces')
test('should create room booking')
test('should view room availability calendar')
test('should filter rooms by capacity')
```

### 3. Admin Portal Tests (`admin-portal.spec.js`)

**Coverage:**
- ✅ Admin authentication
- ✅ Booking approvals (approve/deny)
- ✅ Equipment management
- ✅ Equipment notes (maintenance, damage, usage)
- ✅ Analytics dashboard
- ✅ Feature flags management
- ✅ CSV export

**Demo Account:**
- Email: `admin@ncad.ie`
- Password: `admin123`

**Key Tests:**
```javascript
test('should approve a booking')
test('should deny a booking with reason')
test('should add note to equipment')
test('should update equipment status')
test('should export data as CSV')
```

### 4. Master Admin Tests (`master-admin.spec.js`)

**Coverage:**
- ✅ User management CRUD
- ✅ Search and filter users
- ✅ CSV import (users & equipment)
- ✅ Cross-department access
- ✅ System-wide analytics
- ✅ Email configuration
- ✅ Permission management

**Demo Account:**
- Email: `master@ncad.ie`
- Password: `master123`

**Key Tests:**
```javascript
test('should display users list')
test('should create new user')
test('should edit existing user')
test('should delete user')
test('should access CSV import page')
test('should validate CSV file format')
```

### 5. Booking Workflow Tests (`booking-workflow.spec.js`)

**Coverage:**
- ✅ Complete booking lifecycle
- ✅ Student creates → Admin approves
- ✅ Student creates → Admin denies
- ✅ Booking conflict detection
- ✅ Booking cancellation
- ✅ Booking history
- ✅ Equipment availability

**Key Tests:**
```javascript
test('should complete full booking workflow: create → approve → complete')
test('should handle booking denial workflow')
test('should prevent double booking of same equipment')
test('should maintain booking history')
```

### 6. Email Notification Tests (`email-notifications.spec.js`)

**Coverage:**
- ✅ Booking created email
- ✅ Booking approved email
- ✅ Booking denied email
- ✅ Email payload validation
- ✅ Feature flag toggle
- ✅ EmailJS configuration
- ✅ Error handling

**Note:** EmailJS API calls are mocked for testing.

**Key Tests:**
```javascript
test('should trigger email when student creates booking')
test('should trigger email when admin approves booking')
test('should include denial reason in email')
test('should respect email notification settings')
```

### 7. CSV Import Tests (`csv-import.spec.js`)

**Coverage:**
- ✅ Access control (Master Admin only)
- ✅ Users import validation
- ✅ Equipment import validation
- ✅ Required column validation
- ✅ Duplicate detection
- ✅ Email format validation
- ✅ GDPR compliance
- ✅ Preview before import

**Key Tests:**
```javascript
test('should show preview after uploading valid users CSV')
test('should validate required columns')
test('should detect duplicate emails')
test('should validate email format')
test('should detect duplicate tracking numbers')
```

### 8. Responsive Design Tests (`responsive.spec.js`)

**Coverage:**
- ✅ Mobile viewports (320px - 414px)
- ✅ Tablet viewports (768px - 1024px)
- ✅ Desktop viewports (1920px+)
- ✅ Touch target sizes (44px minimum)
- ✅ Touch interactions
- ✅ Orientation changes
- ✅ Performance on slow networks

**Tested Viewports:**
- iPhone SE (320x568)
- iPhone 12 (390x844)
- Pixel 5 (393x851)
- iPad Pro (1024x1366)
- Galaxy Tab S4 (712x1138)
- Desktop (1920x1080)

**Key Tests:**
```javascript
test('should have minimum 44px touch targets on mobile')
test('should stack equipment cards vertically on mobile')
test('should support touch interactions')
test('should handle orientation change')
test('should load quickly on mobile')
```

## Writing Tests

### Using Fixtures

The test suite provides authenticated page fixtures for all user roles:

```javascript
import { test, expect, users } from '../fixtures/auth.fixtures.js';

// Automatically authenticated as student
test('my test', async ({ authenticatedStudentPage: page }) => {
  // page is already logged in as student
  await expect(page).toHaveURL(/\/student/);
});

// Available fixtures:
// - authenticatedStudentPage
// - authenticatedStaffPage
// - authenticatedAdminPage
// - authenticatedMasterAdminPage
```

### Using Helper Functions

```javascript
import {
  login,
  logout,
  waitForLoadingComplete,
  waitForToast,
  fillForm
} from '../utils/test-helpers.js';

test('example', async ({ page }) => {
  // Login manually
  await login(page, users.student.email, users.student.password);

  // Wait for loading to complete
  await waitForLoadingComplete(page);

  // Wait for success toast
  await waitForToast(page, /success/i);

  // Fill a form
  await fillForm(page, {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@ncad.ie'
  });
});
```

### Test Organization

Follow this structure for new tests:

```javascript
import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete } from '../utils/test-helpers.js';

test.describe('Feature Name - Section', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for all tests in this section
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });

  test('should handle edge case', async ({ page }) => {
    // Test edge cases
  });
});
```

### Best Practices

1. **Use descriptive test names**: `should approve booking when admin clicks approve`
2. **Wait for elements properly**: Use `waitFor`, avoid `waitForTimeout` unless necessary
3. **Handle optional elements**: Check visibility before interacting
4. **Use data-testid attributes**: Add to React components for reliable selection
5. **Test user flows, not implementation**: Focus on what users do, not how code works
6. **Keep tests independent**: Each test should work in isolation
7. **Mock external services**: EmailJS, future Supabase calls

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:mobile  # Quick smoke tests
```

## Troubleshooting

### Tests Failing Due to Timing Issues

**Problem:** Elements not found, timeouts

**Solution:**
```javascript
// Increase timeout for specific action
await page.waitForSelector('.element', { timeout: 10000 });

// Wait for network to be idle
await waitForLoadingComplete(page);
```

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::5174`

**Solution:**
```bash
# Kill process on port 5174
npx kill-port 5174

# Or restart dev server
npm run dev
```

### Browser Not Installed

**Problem:** `browserType.launch: Executable doesn't exist`

**Solution:**
```bash
npx playwright install
npx playwright install-deps
```

### Tests Pass Locally But Fail in CI

**Checklist:**
- ✅ Ensure `webServer` is configured in `playwright.config.js`
- ✅ Use `waitForLoadState('networkidle')` before assertions
- ✅ Avoid hard-coded timeouts
- ✅ Check for race conditions
- ✅ Verify CI has sufficient resources

### Debugging Failed Tests

```bash
# Run specific test in headed mode
npm run test:e2e:headed -- tests/integration/student-portal.spec.js

# Debug with Playwright Inspector
npm run test:e2e:debug -- tests/integration/student-portal.spec.js

# View trace for failed test
npx playwright show-trace trace.zip
```

## Test Coverage

Current coverage across all portals:

| Portal | Tests | Coverage |
|--------|-------|----------|
| Student Portal | 15+ | ✅ Authentication, Browsing, Booking, My Bookings |
| Staff Portal | 12+ | ✅ Authentication, Rooms, Equipment, Bookings |
| Admin Portal | 18+ | ✅ Approvals, Equipment, Notes, Analytics |
| Master Admin | 20+ | ✅ Users, CSV Import, Permissions, Config |
| Booking Workflow | 8+ | ✅ Complete lifecycle, Conflicts, History |
| Email Notifications | 10+ | ✅ All templates, Config, Error handling |
| CSV Import | 12+ | ✅ Validation, Duplicates, GDPR |
| Responsive | 15+ | ✅ Mobile, Tablet, Desktop, Touch |

**Total: 110+ tests**

## Next Steps

1. **Add visual regression testing** with Playwright screenshots
2. **Integrate with Supabase** once database is live
3. **Add performance benchmarks** (Lighthouse CI)
4. **Implement load testing** for concurrent bookings
5. **Add accessibility audits** with @axe-core/playwright

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [NCADbook PRD](../docs/equipment_booking_prd.md)
- [UI Requirements](../docs/ui_requirements.md)

## Support

For issues or questions:
1. Check test output in console
2. View HTML report: `npm run test:report`
3. Review test files for examples
4. Consult Playwright docs

---

**Last Updated:** 2025-10-01
**Playwright Version:** 1.55.1
**Node Version:** 18+
