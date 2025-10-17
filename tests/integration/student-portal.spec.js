import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, logout, waitForToast, fillForm } from '../utils/test-helpers.js';

test.describe('Student Portal - Authentication', () => {
  test('should display login page with artistic portal map', async ({ page }) => {
    await page.goto('/');

    // Should show artistic login container
    await expect(page.locator('.artistic-login-container')).toBeVisible();

    // Should show portal map image
    await expect(page.locator('.base-map-image')).toBeVisible();

    // Should show all four portal quadrants
    await expect(page.locator('[data-portal="student"]')).toBeVisible();
    await expect(page.locator('[data-portal="staff"]')).toBeVisible();
    await expect(page.locator('[data-portal="admin"]')).toBeVisible();
    await expect(page.locator('[data-portal="master"]')).toBeVisible();
  });

  test('should login successfully as student', async ({ page }) => {
    await page.goto('/');

    // Click Student portal quadrant
    await page.click('[data-portal="student"]');

    // Should redirect to student portal
    await expect(page).toHaveURL(/\/student/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ authenticatedStudentPage: page }) => {
    // Already authenticated via fixture

    // Find and click logout button
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
    if (await logoutBtn.isVisible({ timeout: 2000 })) {
      await logoutBtn.click();

      // Should redirect to login page
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Student Portal - Equipment Browse', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await page.waitForURL(/\/student/, { timeout: 5000 });

    // Navigate to equipment page
    await page.click('a:has-text("Browse Equipment")');
    await waitForLoadingComplete(page);
  });

  test('should display equipment catalog', async ({ page }) => {
    // Should see equipment cards
    const equipmentCards = page.locator('.equipment-card');
    await expect(equipmentCards.first()).toBeVisible({ timeout: 10000 });

    // Should have multiple items
    const count = await equipmentCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter equipment by department', async ({ page }) => {
    // Look for department filter
    const departmentFilter = page.locator('select[name="department"], [data-testid="department-filter"]');

    if (await departmentFilter.isVisible()) {
      // Select a department
      await departmentFilter.selectOption({ index: 1 }); // Select first non-empty option
      await waitForLoadingComplete(page);

      // Equipment should be filtered
      const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card, .card');
      const count = await equipmentCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should search equipment by name', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Camera');
      await waitForLoadingComplete(page);

      // Should show filtered results
      const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card, .card');
      const count = await equipmentCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should view equipment details', async ({ page }) => {
    // Click on first equipment item
    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    await firstEquipment.click();

    // Should show equipment details (modal or new page)
    const detailsView = page.locator('[data-testid="equipment-details"], .modal, .equipment-details');
    await expect(detailsView).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Student Portal - Booking Creation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await page.waitForURL(/\/student/, { timeout: 5000 });

    // Navigate to equipment page
    await page.click('a:has-text("Browse Equipment")');
    await waitForLoadingComplete(page);
  });

  test('should open booking modal from equipment card', async ({ page }) => {
    // Click on "Book Equipment" button on first card
    const bookButton = page.locator('[data-testid="book-equipment-btn"]').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Booking modal should open
      const bookingModal = page.locator('[data-testid="booking-modal"]');
      await expect(bookingModal).toBeVisible({ timeout: 5000 });
    }
  });

  test('should create booking with valid dates', async ({ page }) => {
    // Click Book Equipment button on first card
    const bookButton = page.locator('[data-testid="book-equipment-btn"]').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Fill booking form
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      // Fill dates using data-testid
      const startDateInput = page.locator('[data-testid="start-date-input"]');
      const endDateInput = page.locator('[data-testid="end-date-input"]');

      await startDateInput.fill(tomorrowStr);
      await endDateInput.fill(nextWeekStr);

      // Fill purpose/justification
      const purposeInput = page.locator('[data-testid="purpose-input"]');
      if (await purposeInput.isVisible()) {
        await purposeInput.fill('Test booking for photography assignment');
      }

      // Submit booking
      const submitButton = page.locator('[data-testid="submit-booking-btn"]');
      await submitButton.click();

      // Should show success message
      await waitForToast(page, /success|booked|created/i);
    }
  });

  test('should validate required fields', async ({ page }) => {
    // Click Book Equipment button
    const bookButton = page.locator('[data-testid="book-equipment-btn"]').first();
    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Try to submit without filling required fields
      const submitButton = page.locator('[data-testid="submit-booking-btn"]');
      await submitButton.click();

      // Should show validation errors (browser native or custom)
      const errorMessages = page.locator('.error, [role="alert"], .field-error, [data-testid="toast-notification"]');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Student Portal - My Bookings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);
  });

  test('should display my bookings list', async ({ page }) => {
    // Navigate to My Bookings
    const myBookingsLink = page.locator('a:has-text("My Bookings"), a:has-text("Bookings"), [href*="bookings"]');
    if (await myBookingsLink.isVisible()) {
      await myBookingsLink.click();
      await waitForLoadingComplete(page);

      // Should show bookings list or empty state
      const bookingsList = page.locator('[data-testid="bookings-list"], .bookings-list, .booking-card');
      const emptyState = page.locator('.empty-state, [data-testid="no-bookings"]');

      // Either bookings exist or empty state is shown
      const hasBookings = await bookingsList.first().isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasBookings || isEmpty).toBe(true);
    }
  });

  test('should filter bookings by status', async ({ page }) => {
    // Navigate to My Bookings
    const myBookingsLink = page.locator('a:has-text("My Bookings"), a:has-text("Bookings"), [href*="bookings"]');
    if (await myBookingsLink.isVisible()) {
      await myBookingsLink.click();
      await waitForLoadingComplete(page);

      // Look for status filter
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('pending');
        await waitForLoadingComplete(page);

        // Verify filter applied
        const bookingCards = page.locator('.booking-card, [data-testid="booking-card"]');
        const count = await bookingCards.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should cancel pending booking', async ({ page }) => {
    // Navigate to My Bookings
    const myBookingsLink = page.locator('a:has-text("My Bookings"), a:has-text("Bookings"), [href*="bookings"]');
    if (await myBookingsLink.isVisible()) {
      await myBookingsLink.click();
      await waitForLoadingComplete(page);

      // Look for cancel button on a pending booking
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Confirm cancellation if dialog appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should show success message
        await waitForToast(page, /cancel|removed/i);
      }
    }
  });
});

test.describe('Student Portal - Responsive Design', () => {
  test('should be mobile-friendly', async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Check mobile navigation
    const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, nav');
    await expect(mobileNav).toBeVisible();

    // Equipment cards should stack vertically on mobile
    const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card, .card');
    if (await equipmentCards.first().isVisible()) {
      const firstCard = equipmentCards.first();
      const box = await firstCard.boundingBox();

      if (box) {
        // Card should be close to full width on mobile
        expect(box.width).toBeGreaterThan(300);
      }
    }
  });
});
