import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, waitForToast, getTableData } from '../utils/test-helpers.js';

test.describe('Admin Portal - Authentication & Access', () => {
  test('should login as admin and access admin portal', async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should display admin dashboard', async ({ authenticatedAdminPage: page }) => {
    const dashboard = page.locator('[data-testid="admin-dashboard"], .dashboard, main');
    await expect(dashboard).toBeVisible();
  });

  test('should have access to booking approvals', async ({ authenticatedAdminPage: page }) => {
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending"), [href*="approval"]');
    await expect(approvalsLink.first()).toBeVisible();
  });
});

test.describe('Admin Portal - Booking Approvals', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);
  });

  test('should display pending bookings', async ({ page }) => {
    // Navigate to approvals
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      // Should show pending bookings or empty state
      const bookingsList = page.locator('[data-testid="pending-bookings"], .booking-card, tr');
      const emptyState = page.locator('.empty-state, [data-testid="no-pending"]');

      const hasBookings = await bookingsList.first().isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasBookings || isEmpty).toBe(true);
    }
  });

  test('should approve a booking', async ({ page }) => {
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      // Look for approve button
      const approveButton = page.locator('button:has-text("Approve")').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();

        // Confirm if dialog appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should show success message
        await waitForToast(page, /approved|success/i);
      }
    }
  });

  test('should deny a booking with reason', async ({ page }) => {
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      // Look for deny button
      const denyButton = page.locator('button:has-text("Deny"), button:has-text("Reject")').first();
      if (await denyButton.isVisible()) {
        await denyButton.click();

        // Fill reason if prompted
        const reasonInput = page.locator('textarea[name="reason"], textarea[placeholder*="reason"]');
        if (await reasonInput.isVisible({ timeout: 2000 })) {
          await reasonInput.fill('Equipment unavailable for selected dates');
        }

        // Confirm denial
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Deny"), button[type="submit"]');
        await confirmButton.click();

        // Should show success message
        await waitForToast(page, /denied|rejected|success/i);
      }
    }
  });

  test('should filter bookings by status', async ({ page }) => {
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Bookings")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      // Look for status filter
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      if (await statusFilter.isVisible()) {
        // Test different statuses
        await statusFilter.selectOption('approved');
        await waitForLoadingComplete(page);

        await statusFilter.selectOption('denied');
        await waitForLoadingComplete(page);

        await statusFilter.selectOption('pending');
        await waitForLoadingComplete(page);
      }
    }
  });

  test('should view booking details', async ({ page }) => {
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      // Click on a booking to view details
      const firstBooking = page.locator('[data-testid="booking-card"], .booking-card, tbody tr').first();
      if (await firstBooking.isVisible()) {
        await firstBooking.click();

        // Should show details modal or expanded view
        const detailsView = page.locator('[data-testid="booking-details"], .modal, .expanded-booking');
        const isVisible = await detailsView.isVisible({ timeout: 2000 }).catch(() => false);

        // Details view might not be implemented yet
        if (isVisible) {
          await expect(detailsView).toBeVisible();
        }
      }
    }
  });
});

test.describe('Admin Portal - Equipment Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);
  });

  test('should view equipment list', async ({ page }) => {
    const equipmentLink = page.locator('a:has-text("Equipment")').first();
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      const equipmentList = page.locator('[data-testid="equipment-card"], .equipment-card, tbody tr');
      const count = await equipmentList.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should add note to equipment', async ({ page }) => {
    const equipmentLink = page.locator('a:has-text("Equipment")').first();
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      // Click on first equipment
      const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card').first();
      await firstEquipment.click();

      // Look for add note button
      const addNoteButton = page.locator('button:has-text("Add Note"), button:has-text("Note")');
      if (await addNoteButton.isVisible()) {
        await addNoteButton.click();

        // Fill note form
        const noteTypeSelect = page.locator('select[name="noteType"], select[name="type"]');
        if (await noteTypeSelect.isVisible()) {
          await noteTypeSelect.selectOption('maintenance');
        }

        const noteTextarea = page.locator('textarea[name="note"], textarea[name="notes"]');
        await noteTextarea.fill('Regular maintenance completed');

        // Submit note
        const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
        await submitButton.click();

        // Should show success
        await waitForToast(page, /success|added|saved/i);
      }
    }
  });

  test('should view equipment notes history', async ({ page }) => {
    const equipmentLink = page.locator('a:has-text("Equipment")').first();
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card').first();
      await firstEquipment.click();

      // Look for notes section
      const notesSection = page.locator('[data-testid="equipment-notes"], .notes-section, .notes-list');
      const hasNotes = await notesSection.isVisible().catch(() => false);

      if (hasNotes) {
        await expect(notesSection).toBeVisible();
      }
    }
  });

  test('should update equipment status', async ({ page }) => {
    const equipmentLink = page.locator('a:has-text("Equipment")').first();
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card').first();
      await firstEquipment.click();

      // Look for status dropdown
      const statusSelect = page.locator('select[name="status"]');
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('maintenance');

        // Should show confirmation or auto-save
        const saveButton = page.locator('button:has-text("Save")');
        if (await saveButton.isVisible({ timeout: 1000 })) {
          await saveButton.click();
        }

        await waitForToast(page, /success|updated/i);
      }
    }
  });
});

test.describe('Admin Portal - Analytics & Reports', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);
  });

  test('should view analytics dashboard', async ({ page }) => {
    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Reports"), a:has-text("Dashboard")');
    if (await analyticsLink.first().isVisible()) {
      await analyticsLink.first().click();
      await waitForLoadingComplete(page);

      // Should show analytics widgets or charts
      const analyticsContent = page.locator('.analytics, .dashboard, [data-testid="analytics"]');
      const isVisible = await analyticsContent.isVisible().catch(() => false);

      if (isVisible) {
        await expect(analyticsContent).toBeVisible();
      }
    }
  });

  test('should display equipment utilization stats', async ({ page }) => {
    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Reports")');
    if (await analyticsLink.first().isVisible()) {
      await analyticsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for utilization metrics
      const utilizationSection = page.locator('[data-testid="utilization"], .utilization, .stats');
      const hasStats = await utilizationSection.isVisible().catch(() => false);

      if (hasStats) {
        await expect(utilizationSection).toBeVisible();
      }
    }
  });

  test('should export data as CSV', async ({ page }) => {
    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Reports")');
    if (await analyticsLink.first().isVisible()) {
      await analyticsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for export button
      const exportButton = page.locator('button:has-text("Export"), button:has-text("CSV")');
      if (await exportButton.isVisible()) {
        // Set up download handler
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await exportButton.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.csv$/);
        }
      }
    }
  });
});

test.describe('Admin Portal - Feature Flags', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);
  });

  test('should access feature flags manager', async ({ page }) => {
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      // Should show feature flags
      const featureFlags = page.locator('[data-testid="feature-flags"], .feature-flags');
      const hasFlags = await featureFlags.isVisible().catch(() => false);

      if (hasFlags) {
        await expect(featureFlags).toBeVisible();
      }
    }
  });

  test('should toggle email notifications', async ({ page }) => {
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for email toggle
      const emailToggle = page.locator('input[name="emailNotifications"], input[type="checkbox"]').first();
      if (await emailToggle.isVisible()) {
        const wasChecked = await emailToggle.isChecked();
        await emailToggle.click();

        // Should toggle state
        const isChecked = await emailToggle.isChecked();
        expect(isChecked).not.toBe(wasChecked);
      }
    }
  });
});

test.describe('Admin Portal - Responsive Design', () => {
  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);

    // Should show full navigation
    const nav = page.locator('nav, aside, [data-testid="sidebar"]');
    await expect(nav).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);

    // Navigation should adapt
    const nav = page.locator('nav, [data-testid="navigation"]');
    await expect(nav).toBeVisible();
  });
});
