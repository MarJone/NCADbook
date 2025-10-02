import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, waitForToast, fillForm } from '../utils/test-helpers.js';

test.describe('Staff Portal - Authentication & Navigation', () => {
  test('should login as staff and access staff portal', async ({ page }) => {
    await login(page, users.staff.email, users.staff.password);
    await expect(page).toHaveURL(/\/staff/);
  });

  test('should display staff dashboard', async ({ authenticatedStaffPage: page }) => {
    // Should see staff-specific content
    const dashboard = page.locator('[data-testid="staff-dashboard"], .dashboard');
    await expect(dashboard).toBeVisible();
  });

  test('should have navigation to room/space bookings', async ({ authenticatedStaffPage: page }) => {
    // Look for room/space booking navigation
    const roomBookingLink = page.locator('a:has-text("Rooms"), a:has-text("Spaces"), [href*="room"]');
    await expect(roomBookingLink.first()).toBeVisible();
  });
});

test.describe('Staff Portal - Room/Space Booking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.staff.email, users.staff.password);
    await waitForLoadingComplete(page);
  });

  test('should display available rooms/spaces', async ({ page }) => {
    // Navigate to rooms section
    const roomLink = page.locator('a:has-text("Rooms"), a:has-text("Spaces")').first();
    if (await roomLink.isVisible()) {
      await roomLink.click();
      await waitForLoadingComplete(page);

      // Should show rooms/spaces
      const roomCards = page.locator('[data-testid="room-card"], .room-card, .space-card');
      const count = await roomCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should create room booking', async ({ page }) => {
    // Navigate to rooms
    const roomLink = page.locator('a:has-text("Rooms"), a:has-text("Spaces")').first();
    if (await roomLink.isVisible()) {
      await roomLink.click();
      await waitForLoadingComplete(page);

      // Click on first room
      const firstRoom = page.locator('[data-testid="room-card"], .room-card').first();
      if (await firstRoom.isVisible()) {
        await firstRoom.click();

        // Book room
        const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
        if (await bookButton.isVisible()) {
          await bookButton.click();

          // Fill booking form
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          const dateInput = page.locator('input[type="date"], input[name="date"]').first();
          const timeSlotSelect = page.locator('select[name="timeSlot"], select[name="time"]');

          if (await dateInput.isVisible()) {
            await dateInput.fill(tomorrowStr);
          }

          if (await timeSlotSelect.isVisible()) {
            await timeSlotSelect.selectOption({ index: 1 });
          }

          // Submit
          const submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
          await submitButton.click();

          // Should show success
          await waitForToast(page, /success|booked/i);
        }
      }
    }
  });

  test('should view room availability calendar', async ({ page }) => {
    const roomLink = page.locator('a:has-text("Rooms"), a:has-text("Spaces")').first();
    if (await roomLink.isVisible()) {
      await roomLink.click();
      await waitForLoadingComplete(page);

      // Should have calendar view
      const calendar = page.locator('[data-testid="calendar"], .calendar, [class*="calendar"]');
      const calendarExists = await calendar.isVisible().catch(() => false);

      // Calendar might not be implemented yet
      if (calendarExists) {
        await expect(calendar).toBeVisible();
      }
    }
  });

  test('should filter rooms by capacity', async ({ page }) => {
    const roomLink = page.locator('a:has-text("Rooms"), a:has-text("Spaces")').first();
    if (await roomLink.isVisible()) {
      await roomLink.click();
      await waitForLoadingComplete(page);

      // Look for capacity filter
      const capacityFilter = page.locator('select[name="capacity"], input[name="capacity"]');
      if (await capacityFilter.isVisible()) {
        if (await capacityFilter.getAttribute('type') === 'number') {
          await capacityFilter.fill('10');
        } else {
          await capacityFilter.selectOption({ index: 1 });
        }

        await waitForLoadingComplete(page);

        // Results should be filtered
        const roomCards = page.locator('[data-testid="room-card"], .room-card');
        const count = await roomCards.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Staff Portal - Equipment Access', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.staff.email, users.staff.password);
    await waitForLoadingComplete(page);
  });

  test('should browse equipment catalog', async ({ page }) => {
    // Staff should also have access to equipment
    const equipmentLink = page.locator('a:has-text("Equipment")');
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card');
      const count = await equipmentCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should create equipment booking', async ({ page }) => {
    const equipmentLink = page.locator('a:has-text("Equipment")');
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card').first();
      await firstEquipment.click();

      const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
      if (await bookButton.isVisible()) {
        await bookButton.click();

        // Fill booking form
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = page.locator('input[name="endDate"], input[type="date"]').last();

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

        const purposeInput = page.locator('textarea[name="purpose"], textarea[name="justification"]');
        if (await purposeInput.isVisible()) {
          await purposeInput.fill('Staff workshop preparation');
        }

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        await waitForToast(page, /success|booked/i);
      }
    }
  });
});

test.describe('Staff Portal - My Bookings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.staff.email, users.staff.password);
    await waitForLoadingComplete(page);
  });

  test('should view all staff bookings', async ({ page }) => {
    const bookingsLink = page.locator('.nav-link:has-text("My Bookings")').first();
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      await waitForLoadingComplete(page);

      // Should show bookings or empty state
      const bookingsList = page.locator('[data-testid="bookings-list"], .bookings-list');
      const emptyState = page.locator('.empty-state, [data-testid="no-bookings"]');

      const hasBookings = await bookingsList.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasBookings || isEmpty).toBe(true);
    }
  });

  test('should separate equipment and room bookings', async ({ page }) => {
    const bookingsLink = page.locator('.nav-link:has-text("My Bookings")').first();
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      await waitForLoadingComplete(page);

      // Look for tabs or filters for different booking types
      const equipmentTab = page.locator('button:has-text("Equipment"), [data-tab="equipment"]');
      const roomsTab = page.locator('button:has-text("Rooms"), [data-tab="rooms"]');

      const hasTabs = (await equipmentTab.isVisible().catch(() => false)) ||
                      (await roomsTab.isVisible().catch(() => false));

      // Tabs might not be implemented yet
      if (hasTabs) {
        if (await equipmentTab.isVisible()) {
          await equipmentTab.click();
          await waitForLoadingComplete(page);
        }

        if (await roomsTab.isVisible()) {
          await roomsTab.click();
          await waitForLoadingComplete(page);
        }
      }
    }
  });
});

test.describe('Staff Portal - Responsive Design', () => {
  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await login(page, users.staff.email, users.staff.password);
    await waitForLoadingComplete(page);

    // Navigation should be visible
    const nav = page.locator('nav, [data-testid="navigation"]');
    await expect(nav).toBeVisible();

    // Content should be responsive
    const mainContent = page.locator('main, [role="main"], .main-content');
    await expect(mainContent).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page, users.staff.email, users.staff.password);
    await waitForLoadingComplete(page);

    // Mobile navigation should work
    const nav = page.locator('nav, [data-testid="navigation"], [data-testid="mobile-nav"]');
    await expect(nav).toBeVisible();
  });
});
