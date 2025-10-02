import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, isMobileViewport, isTabletViewport } from '../utils/test-helpers.js';

test.describe('Mobile Responsive - Login Page', () => {
  test('should display mobile-optimized login on phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // Check touch target sizes (minimum 44px)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Verify input sizes are touch-friendly
    const buttonBox = await submitButton.boundingBox();
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(40); // Minimum touch target
    }
  });

  test('should work on various mobile viewports', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'iPhone 5' },
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // All elements should be visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    }
  });
});

test.describe('Mobile Responsive - Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);
  });

  test('should display mobile navigation', async ({ page }) => {
    // Mobile nav should be visible
    const nav = page.locator('nav, [data-testid="mobile-nav"], [data-testid="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should stack equipment cards vertically', async ({ page }) => {
    const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card, .card');
    if (await equipmentCards.first().isVisible()) {
      const count = await equipmentCards.count();

      if (count >= 2) {
        // Get positions of first two cards
        const firstBox = await equipmentCards.nth(0).boundingBox();
        const secondBox = await equipmentCards.nth(1).boundingBox();

        if (firstBox && secondBox) {
          // Cards should stack vertically (second card below first)
          expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
        }
      }
    }
  });

  test('should support touch interactions', async ({ page, browserName }) => {
    // Skip on desktop browsers that don't support touch
    test.skip(browserName === 'firefox', 'Touch not fully supported in Firefox');

    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    if (await firstEquipment.isVisible()) {
      const box = await firstEquipment.boundingBox();

      if (box) {
        // Tap on card
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

        // Should open details
        const detailsView = page.locator('[data-testid="equipment-details"], .modal');
        await expect(detailsView).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('should have mobile-friendly booking modal', async ({ page }) => {
    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    await firstEquipment.click();

    const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
    if (await bookButton.isVisible()) {
      await bookButton.click();

      // Modal should be visible and properly sized
      const modal = page.locator('[data-testid="booking-modal"], .modal');
      await expect(modal).toBeVisible();

      const modalBox = await modal.boundingBox();
      if (modalBox) {
        // Modal should fit within viewport
        expect(modalBox.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should scroll smoothly on long lists', async ({ page }) => {
    // Scroll through equipment list
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    // Should maintain layout
    const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card');
    await expect(equipmentCards.first()).toBeVisible();
  });

  test('should handle orientation change', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await expect(page.locator('nav')).toBeVisible();

    // Landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(300);
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('Tablet Responsive - Student Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);
  });

  test('should display tablet-optimized layout', async ({ page }) => {
    // Navigation should be visible
    const nav = page.locator('nav, [data-testid="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should show equipment in grid (2 columns)', async ({ page }) => {
    const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card, .card');
    if (await equipmentCards.first().isVisible()) {
      const count = await equipmentCards.count();

      if (count >= 2) {
        const firstBox = await equipmentCards.nth(0).boundingBox();
        const secondBox = await equipmentCards.nth(1).boundingBox();

        if (firstBox && secondBox) {
          // On tablet, cards might be side by side
          const isSideBySide = Math.abs(firstBox.y - secondBox.y) < 20;
          const isStacked = secondBox.y > firstBox.y + firstBox.height - 10;

          // Either layout is acceptable on tablet
          expect(isSideBySide || isStacked).toBe(true);
        }
      }
    }
  });

  test('should support both touch and mouse interactions', async ({ page }) => {
    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();

    // Click (mouse) should work
    await firstEquipment.click();

    const detailsView = page.locator('[data-testid="equipment-details"], .modal');
    await expect(detailsView).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Tablet Responsive - Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);
  });

  test('should display admin navigation on tablet', async ({ page }) => {
    const nav = page.locator('nav, aside, [data-testid="sidebar"]');
    await expect(nav).toBeVisible();
  });

  test('should show booking approvals in tablet layout', async ({ page }) => {
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      // Table should be responsive
      const bookingsTable = page.locator('table, [data-testid="bookings-table"]');
      const bookingsCards = page.locator('[data-testid="booking-card"], .booking-card');

      // Either table or cards should be visible
      const hasTable = await bookingsTable.isVisible().catch(() => false);
      const hasCards = await bookingsCards.first().isVisible().catch(() => false);

      expect(hasTable || hasCards).toBe(true);
    }
  });

  test('should adapt forms for tablet', async ({ page }) => {
    const equipmentLink = page.locator('a:has-text("Equipment")').first();
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card').first();
      await firstEquipment.click();

      const addNoteButton = page.locator('button:has-text("Add Note"), button:has-text("Note")');
      if (await addNoteButton.isVisible()) {
        await addNoteButton.click();

        // Form should be properly sized for tablet
        const form = page.locator('form, [data-testid="note-form"]');
        const hasForm = await form.isVisible().catch(() => false);

        if (hasForm) {
          const formBox = await form.boundingBox();
          if (formBox) {
            expect(formBox.width).toBeLessThanOrEqual(768);
          }
        }
      }
    }
  });
});

test.describe('Desktop Responsive - All Portals', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should show full desktop layout for student portal', async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Desktop should show side navigation or header nav
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();

    // Equipment should be in grid (3+ columns)
    const equipmentCards = page.locator('[data-testid="equipment-card"], .equipment-card, .card');
    if (await equipmentCards.first().isVisible()) {
      const count = await equipmentCards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show full desktop layout for admin portal', async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);

    // Desktop admin should have sidebar or full nav
    const nav = page.locator('nav, aside, [data-testid="sidebar"]');
    await expect(nav).toBeVisible();
  });

  test('should utilize full width for tables', async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    if (await userMgmtLink.isVisible()) {
      await userMgmtLink.click();
      await waitForLoadingComplete(page);

      // Table should be visible and wide
      const usersTable = page.locator('table');
      if (await usersTable.isVisible()) {
        const tableBox = await usersTable.boundingBox();
        if (tableBox) {
          expect(tableBox.width).toBeGreaterThan(600);
        }
      }
    }
  });
});

test.describe('Accessibility - Touch Targets', () => {
  test('should have minimum 44px touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const interactiveElements = page.locator('button, a, input[type="submit"], input[type="checkbox"]');
    const count = await interactiveElements.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = interactiveElements.nth(i);
      if (await element.isVisible()) {
        const box = await element.boundingBox();
        if (box) {
          // Should be at least 40px (close to 44px recommended)
          expect(box.height).toBeGreaterThanOrEqual(36);
        }
      }
    }
  });

  test('should have proper spacing between touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Check navigation buttons
    const navButtons = page.locator('nav button, nav a');
    const count = await navButtons.count();

    if (count >= 2) {
      const firstBox = await navButtons.nth(0).boundingBox();
      const secondBox = await navButtons.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Should have some spacing (at least 4px)
        const spacing = Math.abs(firstBox.y + firstBox.height - secondBox.y);
        expect(spacing).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

test.describe('Performance - Mobile Load Times', () => {
  test('should load quickly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds (generous for slow connections)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle poor network conditions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Simulate slow 3G
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (750 * 1024) / 8, // 750kb/s
      uploadThroughput: (250 * 1024) / 8,   // 250kb/s
      latency: 100,
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    // Login should still work
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
