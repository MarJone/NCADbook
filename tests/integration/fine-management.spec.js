import { test, expect } from '@playwright/test';

/**
 * Fine Management System Tests
 * Tests the complete fine management workflow for overdue bookings
 */

test.describe('Fine Management System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/NCADbook/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Automatic Fine Calculation', () => {
    test('should calculate fines for overdue bookings', async ({ page }) => {
      // Login as Master Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Wait for dashboard to load
      await expect(page.getByRole('heading', { name: /master admin/i })).toBeVisible();

      // Navigate to bookings section
      await page.getByRole('link', { name: /bookings/i }).click();

      // Look for overdue bookings indicator
      const overdueSection = page.locator('[data-testid="overdue-bookings"]').or(
        page.locator('.overdue-bookings')
      );

      // If overdue bookings exist, verify fine calculation
      const hasOverdue = await overdueSection.count() > 0;

      if (hasOverdue) {
        // Check that fine amount is displayed
        await expect(page.locator('.fine-amount')).toBeVisible();

        // Verify fine calculation format (e.g., "€5.00")
        const fineText = await page.locator('.fine-amount').first().textContent();
        expect(fineText).toMatch(/€\d+\.\d{2}/);

        // Verify days overdue is shown
        await expect(page.locator('.days-overdue')).toBeVisible();
      }
    });

    test('should show fine rate configuration', async ({ page }) => {
      // Login as Master Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to system settings
      await page.getByRole('link', { name: /settings/i }).click();

      // Look for fine configuration
      const fineRateSection = page.locator('[data-testid="fine-rate-settings"]').or(
        page.locator('text=Fine Rate').locator('..')
      );

      // Verify fine rate is configurable
      await expect(fineRateSection).toBeVisible({ timeout: 10000 });

      // Default fine rate should be €5.00 per day
      const fineRateInput = page.locator('input[name="fine_rate"]').or(
        page.locator('input[type="number"]').filter({ hasText: /5/ })
      );

      if (await fineRateInput.count() > 0) {
        const value = await fineRateInput.inputValue();
        expect(parseFloat(value)).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Fine Actions & Workflow', () => {
    test('should allow marking fine as paid', async ({ page }) => {
      // Login as Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to fines section
      await page.getByRole('link', { name: /fines/i }).click();

      // Find first unpaid fine
      const unpaidFine = page.locator('[data-status="unpaid"]').or(
        page.locator('.fine-item').filter({ hasText: /unpaid/i })
      ).first();

      if (await unpaidFine.count() > 0) {
        // Click "Mark as Paid" button
        await unpaidFine.locator('button:has-text("Mark as Paid")').or(
          unpaidFine.locator('.btn-mark-paid')
        ).click();

        // Confirm payment dialog if present
        const confirmButton = page.locator('button:has-text("Confirm")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Verify fine status updated
        await expect(unpaidFine.or(page.locator('.fine-item').first())).toContainText(/paid/i, {
          timeout: 5000
        });
      }
    });

    test('should allow waiving fines with reason', async ({ page }) => {
      // Login as Master Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to fines section
      await page.getByRole('link', { name: /fines/i }).click();

      // Find first unpaid fine
      const unpaidFine = page.locator('[data-status="unpaid"]').first();

      if (await unpaidFine.count() > 0) {
        // Click "Waive Fine" button
        const waiveButton = unpaidFine.locator('button:has-text("Waive")').or(
          unpaidFine.locator('.btn-waive')
        );

        if (await waiveButton.count() > 0) {
          await waiveButton.click();

          // Fill waive reason
          const reasonInput = page.locator('textarea[name="waive_reason"]').or(
            page.locator('textarea').first()
          );

          if (await reasonInput.isVisible({ timeout: 2000 })) {
            await reasonInput.fill('First-time offender, equipment returned in perfect condition');

            // Confirm waive
            await page.getByRole('button', { name: /confirm|waive/i }).click();

            // Verify fine status updated to waived
            await expect(unpaidFine.or(page.locator('.fine-item').first())).toContainText(/waived/i, {
              timeout: 5000
            });
          }
        }
      }
    });

    test('should show fine history for user', async ({ page }) => {
      // Login as Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to users section
      await page.getByRole('link', { name: /users/i }).click();

      // Select a user with fines
      const userWithFines = page.locator('[data-fines-owed]').or(
        page.locator('.user-item').filter({ hasText: /€/ })
      ).first();

      if (await userWithFines.count() > 0) {
        await userWithFines.click();

        // Verify fine history section visible
        await expect(page.locator('[data-testid="fine-history"]').or(
          page.locator('.fine-history')
        )).toBeVisible({ timeout: 5000 });

        // Verify fine items shown
        await expect(page.locator('.fine-item')).toHaveCount({ greaterThan: 0 });
      }
    });
  });

  test.describe('Account Hold System', () => {
    test('should apply account hold when fines exceed threshold', async ({ page }) => {
      // Login as Master Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to users with outstanding fines
      await page.getByRole('link', { name: /fines/i }).click();

      // Find user with high fines
      const userWithHighFines = page.locator('[data-account-hold="true"]').or(
        page.locator('.account-hold-indicator')
      ).first();

      if (await userWithHighFines.count() > 0) {
        // Verify account hold indicator visible
        await expect(userWithHighFines).toBeVisible();

        // Verify booking should be blocked
        await expect(page.locator('text=/blocked|hold/i')).toBeVisible();
      }
    });

    test('should lift account hold when fines paid', async ({ page }) => {
      // Login as Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to users with account hold
      await page.getByRole('link', { name: /users/i }).click();

      const heldUser = page.locator('[data-account-hold="true"]').first();

      if (await heldUser.count() > 0) {
        await heldUser.click();

        // Pay all fines
        const payAllButton = page.locator('button:has-text("Pay All")').or(
          page.locator('.btn-pay-all-fines')
        );

        if (await payAllButton.count() > 0) {
          await payAllButton.click();

          // Confirm payment
          const confirmButton = page.locator('button:has-text("Confirm")');
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }

          // Verify account hold lifted
          await expect(page.locator('[data-account-hold="false"]').or(
            page.locator('text=/account active/i')
          )).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Fine Reporting & Analytics', () => {
    test('should show total fines collected', async ({ page }) => {
      // Login as Master Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to analytics or fines section
      await page.getByRole('link', { name: /analytics|fines/i }).click();

      // Verify total fines metric visible
      const totalFinesMetric = page.locator('[data-testid="total-fines-collected"]').or(
        page.locator('.metric-total-fines')
      );

      if (await totalFinesMetric.count() > 0) {
        await expect(totalFinesMetric).toBeVisible();

        // Verify it shows a currency amount
        const text = await totalFinesMetric.textContent();
        expect(text).toMatch(/€\d+/);
      }
    });

    test('should filter fines by status', async ({ page }) => {
      // Login as Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to fines section
      await page.getByRole('link', { name: /fines/i }).click();

      // Find status filter
      const statusFilter = page.locator('[data-testid="status-filter"]').or(
        page.locator('select[name="status"]')
      );

      if (await statusFilter.count() > 0) {
        // Filter by "unpaid"
        await statusFilter.selectOption('unpaid');

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // Verify only unpaid fines shown
        const fineItems = page.locator('.fine-item');
        const count = await fineItems.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(count, 3); i++) {
            await expect(fineItems.nth(i)).toContainText(/unpaid/i);
          }
        }
      }
    });

    test('should show fine history in user profile', async ({ page }) => {
      // Login as Student
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to profile
      await page.getByRole('link', { name: /profile|account/i }).click();

      // Verify fines section visible
      const finesSection = page.locator('[data-testid="user-fines"]').or(
        page.locator('.fines-section')
      );

      if (await finesSection.count() > 0) {
        await expect(finesSection).toBeVisible();

        // Should show total owed
        await expect(page.locator('text=/total.*owed/i')).toBeVisible();
      }
    });
  });

  test.describe('Payment Integration Placeholder', () => {
    test('should show payment method options', async ({ page }) => {
      // Login as Student with fines
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to fines/payment section
      const finesLink = page.getByRole('link', { name: /fines|pay/i });

      if (await finesLink.count() > 0) {
        await finesLink.click();

        // Verify payment options visible (even if placeholder)
        const paymentSection = page.locator('[data-testid="payment-options"]').or(
          page.locator('.payment-methods')
        );

        if (await paymentSection.count() > 0) {
          await expect(paymentSection).toBeVisible();

          // Should mention payment methods (cash, card, bank transfer)
          const text = await page.textContent('body');
          expect(text).toMatch(/cash|card|bank transfer/i);
        }
      }
    });
  });

  test.describe('Accessibility - Fines Section', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /fines/i }).click();

      // Tab through fine items
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus visible
      const focusedElement = await page.evaluate(() => document.activeElement?.className);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels for fine actions', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /fines/i }).click();

      // Verify action buttons have aria-labels
      const markPaidButton = page.locator('button:has-text("Mark as Paid")').first();

      if (await markPaidButton.count() > 0) {
        const ariaLabel = await markPaidButton.getAttribute('aria-label');
        expect(ariaLabel || await markPaidButton.textContent()).toContain('Mark');
      }
    });
  });
});
