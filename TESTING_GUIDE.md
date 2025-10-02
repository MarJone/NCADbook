# NCADbook Testing Guide

Quick start guide for running Playwright tests on the NCAD Equipment Booking System.

## 🚀 Quick Start

### 1. Install Dependencies (if not already done)

```bash
npm install
npx playwright install
```

### 2. Start Dev Server

The tests require the development server to be running:

```bash
npm run dev
# Server runs at http://localhost:5174
```

### 3. Run Tests

In a **new terminal window**:

```bash
# Run all tests
npm test

# Run tests with UI (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

## 📋 Test Commands Cheat Sheet

### Run All Tests
```bash
npm test                    # All tests, all browsers
npm run test:e2e           # Same as above
```

### Run by Portal
```bash
npm run test:student       # Student portal only
npm run test:staff         # Staff portal only
npm run test:admin         # Admin portal only
npm run test:master-admin  # Master admin only
```

### Run by Feature
```bash
npm run test:booking-workflow  # Booking lifecycle tests
npm run test:email            # Email notification tests
npm run test:csv              # CSV import tests
npm run test:responsive       # Responsive design tests
```

### Run by Device
```bash
npm run test:mobile    # Mobile devices (iPhone, Pixel)
npm run test:tablet    # Tablets (iPad, Galaxy Tab)
npm run test:desktop   # Desktop browsers
```

### Interactive & Debug
```bash
npm run test:e2e:ui      # Playwright UI (recommended for development)
npm run test:e2e:headed  # See browser while testing
npm run test:e2e:debug   # Debug mode with inspector
```

### View Reports
```bash
npm run test:report     # Open HTML report
```

## 🧪 What's Tested

### ✅ Student Portal
- Login/logout
- Equipment browsing and search
- Booking creation
- My bookings management
- Booking cancellation

### ✅ Staff Portal
- Room/space booking
- Equipment access
- Calendar views
- Booking management

### ✅ Admin Portal
- Booking approvals (approve/deny)
- Equipment management
- Equipment notes system
- Analytics dashboard
- Feature flags

### ✅ Master Admin Portal
- User management (CRUD)
- CSV import (users & equipment)
- System configuration
- Cross-department access
- Email configuration

### ✅ Workflows
- Complete booking lifecycle
- Conflict detection
- Email notifications (mocked)
- CSV validation

### ✅ Responsive Design
- Mobile (320px - 414px)
- Tablet (768px - 1024px)
- Desktop (1920px+)
- Touch interactions
- Orientation changes

## 📊 Test Coverage

**Total Tests:** 110+

| Category | Tests |
|----------|-------|
| Student Portal | 15+ |
| Staff Portal | 12+ |
| Admin Portal | 18+ |
| Master Admin | 20+ |
| Booking Workflow | 8+ |
| Email Notifications | 10+ |
| CSV Import | 12+ |
| Responsive | 15+ |

## 🔐 Demo Accounts

All tests use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Student | demo@ncad.ie | demo123 |
| Staff | staff@ncad.ie | staff123 |
| Admin | admin@ncad.ie | admin123 |
| Master Admin | master@ncad.ie | master123 |

## 🎯 Recommended Testing Workflow

### During Development
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Use Playwright UI for interactive testing
npm run test:e2e:ui
```

**Why Playwright UI?**
- ✅ See tests run in real-time
- ✅ Time-travel debugging
- ✅ Inspect DOM at any step
- ✅ Edit locators and test immediately
- ✅ Pick locators visually

### Before Committing
```bash
# Run relevant tests for your changes
npm run test:student      # If you modified student portal
npm run test:admin        # If you modified admin portal
npm run test:responsive   # If you changed styles
```

### Before Pull Request
```bash
# Run all tests
npm test

# View report to ensure all pass
npm run test:report
```

## 🐛 Troubleshooting

### Port 5174 Already in Use
```bash
npx kill-port 5174
npm run dev
```

### Tests Failing with "Element not found"
- Wait for dev server to fully start
- Check if element exists in UI
- Use Playwright UI to inspect: `npm run test:e2e:ui`

### Browser Not Installed
```bash
npx playwright install
```

### Slow Tests
```bash
# Run only fast tests on mobile
npm run test:mobile

# Run specific test file
npx playwright test tests/integration/student-portal.spec.js
```

### View Failed Test Screenshots
```bash
# Check test-results/ folder for screenshots
ls test-results/
```

## 📁 Test File Structure

```
tests/
├── fixtures/
│   └── auth.fixtures.js        # Login helpers, demo accounts
├── utils/
│   └── test-helpers.js         # Common utilities
├── integration/
│   ├── student-portal.spec.js
│   ├── staff-portal.spec.js
│   ├── admin-portal.spec.js
│   ├── master-admin.spec.js
│   ├── booking-workflow.spec.js
│   ├── email-notifications.spec.js
│   └── csv-import.spec.js
└── mobile/
    └── responsive.spec.js
```

## 📝 Writing New Tests

### Example Test

```javascript
import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete } from '../utils/test-helpers.js';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('input[type="email"]', users.student.email);
    await page.fill('input[type="password"]', users.student.password);
    await page.click('button[type="submit"]');

    // Wait for page load
    await waitForLoadingComplete(page);

    // Test your feature
    await page.click('[data-testid="my-button"]');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Use Authenticated Fixtures

```javascript
// Automatically logged in as student
test('my test', async ({ authenticatedStudentPage: page }) => {
  // Already authenticated!
  await expect(page).toHaveURL(/\/student/);
});
```

## 🎨 Best Practices

### ✅ DO
- Use `data-testid` attributes for reliable selectors
- Wait for elements: `await element.waitFor()`
- Use fixtures for authentication
- Write descriptive test names
- Test user flows, not implementation

### ❌ DON'T
- Use `waitForTimeout` (use `waitFor` instead)
- Hard-code delays
- Depend on other tests
- Test implementation details
- Commit test results to git

## 🚀 CI/CD

Tests run automatically on:
- Every push to `main`/`master`
- Every pull request

### GitHub Actions Workflow

See `.github/workflows/playwright.yml`

### View CI Results

1. Go to GitHub Actions tab
2. Click on latest workflow run
3. Download artifacts for test reports

## 📚 Resources

- **Full Documentation:** [tests/README.md](tests/README.md)
- **Playwright Docs:** https://playwright.dev
- **Project PRD:** [docs/equipment_booking_prd.md](docs/equipment_booking_prd.md)

## 💡 Tips

### Speed Up Local Testing

```bash
# Run only chromium (fastest)
npx playwright test --project=chromium-desktop

# Run specific test
npx playwright test -g "should login successfully"

# Update snapshots
npx playwright test --update-snapshots
```

### Debug Specific Test

```bash
# Open in headed mode
npx playwright test tests/integration/student-portal.spec.js --headed

# Debug with inspector
npx playwright test tests/integration/student-portal.spec.js --debug
```

### Generate Test Code

```bash
# Record test actions
npx playwright codegen http://localhost:5174
```

## ✨ Next Steps

After tests pass:

1. ✅ Review HTML report: `npm run test:report`
2. ✅ Fix any failing tests
3. ✅ Add tests for new features
4. ✅ Commit changes
5. ✅ Create pull request

---

**Happy Testing! 🎉**

For detailed documentation, see [tests/README.md](tests/README.md)
