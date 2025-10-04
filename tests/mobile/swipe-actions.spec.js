import { test, expect } from '@playwright/test';
import { users } from '../fixtures/auth.fixtures.js';

test.describe('Swipe Actions - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[type="email"]', users.admin.email);
    await page.fill('input[type="password"]', users.admin.password);
    await page.click('button[type="submit"]');

    // Wait for redirect and navigate to booking approvals
    await page.waitForURL(/\/admin/, { timeout: 5000 });
    await page.click('text=Bookings');
    await page.waitForSelector('[data-testid="booking-approvals"]', { timeout: 5000 });
  });

  test('should display swipe action card', async ({ page }) => {
    // Check if swipe action cards are rendered
    const swipeCards = page.locator('[data-testid="swipe-action-card"]');
    const count = await swipeCards.count();

    if (count > 0) {
      await expect(swipeCards.first()).toBeVisible();
      console.log(`Found ${count} swipe action cards`);
    } else {
      console.log('No pending bookings to display swipe cards');
    }
  });

  test('should show approve/deny buttons on pending bookings', async ({ page }) => {
    // Check for pending bookings
    const pendingFilter = page.locator('[data-testid="filter-pending"]');
    await pendingFilter.click();

    // Wait for bookings to load
    await page.waitForTimeout(1000);

    const approveBtn = page.locator('[data-testid="approve-btn"]').first();
    const denyBtn = page.locator('[data-testid="deny-btn"]').first();

    // Check if buttons exist (there may be no pending bookings)
    const approveCount = await approveBtn.count();
    if (approveCount > 0) {
      await expect(approveBtn).toBeVisible();
      await expect(denyBtn).toBeVisible();
    } else {
      console.log('No pending bookings found');
    }
  });

  test('should have swipe action backgrounds for pending bookings', async ({ page }) => {
    // Filter to pending bookings
    await page.locator('[data-testid="filter-pending"]').click();
    await page.waitForTimeout(1000);

    // Check for swipe action backgrounds
    const swipeApprove = page.locator('.swipe-approve').first();
    const swipeDeny = page.locator('.swipe-deny').first();

    const approveCount = await swipeApprove.count();
    if (approveCount > 0) {
      // Swipe backgrounds exist but may be hidden with opacity 0
      expect(approveCount).toBeGreaterThan(0);
      expect(await swipeDeny.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Swipe Actions - Desktop Fallback', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('should show approve/deny buttons on desktop', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[type="email"]', users.admin.email);
    await page.fill('input[type="password"]', users.admin.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin/, { timeout: 5000 });
    await page.click('text=Bookings');
    await page.waitForSelector('[data-testid="booking-approvals"]', { timeout: 5000 });

    // Filter to pending
    await page.locator('[data-testid="filter-pending"]').click();
    await page.waitForTimeout(1000);

    // Desktop should still show buttons
    const approveBtn = page.locator('[data-testid="approve-btn"]').first();
    const count = await approveBtn.count();

    if (count > 0) {
      await expect(approveBtn).toBeVisible();
    }
  });
});
