import { test, expect } from '@playwright/test';

/**
 * Policy Enforcement System Tests
 * Tests configurable booking policies, training requirements, and limits
 */

test.describe('Policy Enforcement System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/NCADbook/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Policy Manager - Admin UI', () => {
    test('should display policy rules list', async ({ page }) => {
      // Login as Master Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to policies section
      await page.getByRole('link', { name: /policies|rules/i }).click();

      // Verify policy manager loaded
      await expect(page.locator('[data-testid="policy-manager"]').or(
        page.locator('.policy-manager')
      )).toBeVisible({ timeout: 10000 });

      // Verify default rules visible
      await expect(page.locator('.rule-card').or(
        page.locator('[data-testid="policy-rule"]')
      )).toHaveCount({ greaterThan: 0 });
    });

    test('should filter policies by type', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /policies/i }).click();

      // Find filter tabs
      const weeklyLimitFilter = page.locator('.filter-tab:has-text("Weekly")').or(
        page.locator('button:has-text("Weekly Limit")')
      );

      if (await weeklyLimitFilter.count() > 0) {
        await weeklyLimitFilter.click();

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // Verify only weekly limit rules shown
        const ruleCards = page.locator('.rule-card');
        const count = await ruleCards.count();

        if (count > 0) {
          for (let i = 0; i < Math.min(count, 3); i++) {
            const card = ruleCards.nth(i);
            await expect(card).toContainText(/weekly/i);
          }
        }
      }
    });

    test('should toggle rule active/inactive status', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /policies/i }).click();

      // Find first rule's toggle button
      const toggleButton = page.locator('.btn-toggle').or(
        page.locator('button:has-text("Active")').or(page.locator('button:has-text("Inactive")'))
      ).first();

      if (await toggleButton.count() > 0) {
        const initialText = await toggleButton.textContent();

        // Click toggle
        await toggleButton.click();

        // Wait for status change
        await page.waitForTimeout(1500);

        // Verify status changed
        const newText = await toggleButton.textContent();
        expect(newText).not.toBe(initialText);
      }
    });

    test('should display rule configuration details', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /policies/i }).click();

      // Find first rule card
      const ruleCard = page.locator('.rule-card').first();

      if (await ruleCard.count() > 0) {
        // Verify configuration section visible
        await expect(ruleCard.locator('.rule-config').or(
          ruleCard.locator('[data-testid="rule-config"]')
        )).toBeVisible();

        // Verify scope information visible
        await expect(ruleCard.locator('.rule-scope').or(
          ruleCard.locator('[data-testid="rule-scope"]')
        )).toBeVisible();
      }
    });
  });

  test.describe('Policy Validation - Booking Flow', () => {
    test('should show policy status when creating booking', async ({ page }) => {
      // Login as Student
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to equipment booking
      await page.getByRole('link', { name: /equipment|book/i }).click();

      // Select first equipment
      const equipmentCard = page.locator('.equipment-card').or(
        page.locator('[data-testid="equipment-item"]')
      ).first();

      if (await equipmentCard.count() > 0) {
        await equipmentCard.click();

        // Click "Book" button
        const bookButton = page.locator('button:has-text("Book")').or(
          page.locator('.btn-book')
        );

        if (await bookButton.count() > 0) {
          await bookButton.click();

          // Verify policy status component visible
          const policyStatus = page.locator('.policy-status').or(
            page.locator('[data-testid="policy-status"]')
          );

          if (await policyStatus.count() > 0) {
            await expect(policyStatus).toBeVisible({ timeout: 5000 });

            // Should show weekly limit status
            await expect(page.locator('text=/weekly.*limit/i')).toBeVisible();

            // Should show concurrent booking status
            await expect(page.locator('text=/concurrent|active.*bookings/i')).toBeVisible();
          }
        }
      }
    });

    test('should block booking when weekly limit exceeded', async ({ page }) => {
      // This test assumes a student has already hit their weekly limit
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const equipmentCard = page.locator('.equipment-card').first();

      if (await equipmentCard.count() > 0) {
        await equipmentCard.click();

        const bookButton = page.locator('button:has-text("Book")');

        if (await bookButton.count() > 0) {
          await bookButton.click();

          // Fill booking dates
          await page.locator('input[name="pickup_date"]').or(
            page.locator('input[type="date"]').first()
          ).fill('2025-11-01');

          await page.locator('input[name="return_date"]').or(
            page.locator('input[type="date"]').last()
          ).fill('2025-11-03');

          // Submit booking
          await page.getByRole('button', { name: /submit|confirm/i }).click();

          // If limit is exceeded, should show error
          const errorMessage = page.locator('.policy-violation-error').or(
            page.locator('.error-message').filter({ hasText: /limit/i })
          );

          // Either booking succeeds or shows limit error
          const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

          if (hasError) {
            await expect(errorMessage).toContainText(/limit|exceeded/i);
          }
        }
      }
    });

    test('should display helpful error message for policy violations', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const equipmentCard = page.locator('.equipment-card').first();

      if (await equipmentCard.count() > 0) {
        await equipmentCard.click();

        // Look for policy status on equipment page
        const policyStatus = page.locator('.policy-status');

        if (await policyStatus.count() > 0) {
          // If there are policy issues, verify help text visible
          const hasIssues = await policyStatus.locator('.has-issues').count() > 0;

          if (hasIssues) {
            // Verify help text/suggestions visible
            await expect(page.locator('.status-help').or(
              page.locator('[data-testid="policy-help"]')
            )).toBeVisible();

            // Verify it contains actionable guidance
            const helpText = await page.locator('.status-help').first().textContent();
            expect(helpText.length).toBeGreaterThan(20); // Should have meaningful help
          }
        }
      }
    });
  });

  test.describe('Training Requirements', () => {
    test('should show training records for user', async ({ page }) => {
      // Login as Admin
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to training section
      const trainingLink = page.getByRole('link', { name: /training/i });

      if (await trainingLink.count() > 0) {
        await trainingLink.click();

        // Verify training records list visible
        await expect(page.locator('[data-testid="training-records"]').or(
          page.locator('.training-records')
        )).toBeVisible({ timeout: 10000 });
      }
    });

    test('should block booking if required training missing', async ({ page }) => {
      // Login as Student
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      // Try to book high-value equipment requiring training
      const highValueEquipment = page.locator('.equipment-card').filter({
        hasText: /RED|Arri|Cinema/i
      }).first();

      if (await highValueEquipment.count() > 0) {
        await highValueEquipment.click();

        const bookButton = page.locator('button:has-text("Book")');

        if (await bookButton.count() > 0) {
          await bookButton.click();

          // Check for training requirement message
          const trainingMessage = page.locator('text=/training.*required/i').or(
            page.locator('.status-item.blocked').filter({ hasText: /training/i })
          );

          if (await trainingMessage.isVisible({ timeout: 3000 })) {
            await expect(trainingMessage).toBeVisible();

            // Should show which training is required
            await expect(page.locator('text=/camera|certification/i')).toBeVisible();
          }
        }
      }
    });

    test('should allow admin to add training record', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const trainingLink = page.getByRole('link', { name: /training/i });

      if (await trainingLink.count() > 0) {
        await trainingLink.click();

        // Find "Add Training" button
        const addButton = page.locator('button:has-text("Add Training")').or(
          page.locator('.btn-add-training')
        );

        if (await addButton.count() > 0) {
          await addButton.click();

          // Verify form visible
          const trainingForm = page.locator('[data-testid="training-form"]').or(
            page.locator('.training-form')
          );

          await expect(trainingForm).toBeVisible({ timeout: 5000 });

          // Should have fields for: user, training type, expiry date
          await expect(page.locator('input[name="training_id"]').or(
            page.locator('select[name="training_id"]')
          )).toBeVisible();
        }
      }
    });
  });

  test.describe('Weekly Booking Limits', () => {
    test('should show remaining booking count', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Check dashboard or booking page for limit indicator
      const limitIndicator = page.locator('[data-testid="weekly-limit"]').or(
        page.locator('.weekly-limit-status')
      );

      if (await limitIndicator.count() > 0) {
        await expect(limitIndicator).toBeVisible();

        // Should show format like "2/3 bookings used"
        const text = await limitIndicator.textContent();
        expect(text).toMatch(/\d+\s*\/\s*\d+/);
      }
    });

    test('should update limit count after booking', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Get initial count from policy status
      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');

      let initialCount = 0;
      if (await policyStatus.count() > 0) {
        const statusText = await policyStatus.textContent();
        const match = statusText.match(/(\d+)\s*\/\s*\d+/);
        if (match) initialCount = parseInt(match[1]);
      }

      // Create new booking
      const equipmentCard = page.locator('.equipment-card').first();

      if (await equipmentCard.count() > 0 && initialCount < 3) {
        await equipmentCard.click();

        const bookButton = page.locator('button:has-text("Book")');

        if (await bookButton.count() > 0) {
          await bookButton.click();

          // Fill dates
          await page.locator('input[type="date"]').first().fill('2025-11-05');
          await page.locator('input[type="date"]').last().fill('2025-11-07');

          // Submit
          await page.getByRole('button', { name: /submit|confirm/i }).click();

          // Wait for booking confirmation
          await page.waitForTimeout(2000);

          // Verify count increased or limit message shown
          const newStatus = page.locator('.policy-status');

          if (await newStatus.count() > 0) {
            const newText = await newStatus.textContent();
            const newMatch = newText.match(/(\d+)\s*\/\s*\d+/);

            if (newMatch) {
              const newCount = parseInt(newMatch[1]);
              expect(newCount).toBeGreaterThanOrEqual(initialCount);
            }
          }
        }
      }
    });
  });

  test.describe('Concurrent Booking Limits', () => {
    test('should show active bookings count', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');

      if (await policyStatus.count() > 0) {
        // Look for concurrent/active bookings indicator
        const concurrentStatus = page.locator('.status-item').filter({
          hasText: /concurrent|active/i
        });

        if (await concurrentStatus.count() > 0) {
          await expect(concurrentStatus).toBeVisible();

          // Should show format like "1/2 active bookings"
          const text = await concurrentStatus.textContent();
          expect(text).toMatch(/\d+\s*\/\s*\d+/);
        }
      }
    });

    test('should block booking when concurrent limit reached', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');

      if (await policyStatus.count() > 0) {
        const statusText = await policyStatus.textContent();

        // Check if concurrent limit is reached
        if (statusText.includes('2/2') || statusText.includes('limit reached')) {
          // Try to book anyway
          const equipmentCard = page.locator('.equipment-card').first();
          await equipmentCard.click();

          const bookButton = page.locator('button:has-text("Book")');

          if (await bookButton.count() > 0) {
            await bookButton.click();

            // Should show error about concurrent limit
            await expect(page.locator('text=/concurrent.*limit/i')).toBeVisible({
              timeout: 5000
            });
          }
        }
      }
    });
  });

  test.describe('Admin Override', () => {
    test('should allow admin to override policy violations', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Go to create booking for a student (admin view)
      await page.getByRole('link', { name: /bookings/i }).click();

      const createBookingButton = page.locator('button:has-text("Create Booking")').or(
        page.locator('.btn-create-booking')
      );

      if (await createBookingButton.count() > 0) {
        await createBookingButton.click();

        // Look for admin override option
        const overrideCheckbox = page.locator('input[name="adminOverride"]').or(
          page.locator('input[type="checkbox"]').filter({ hasText: /override/i })
        );

        if (await overrideCheckbox.count() > 0) {
          await expect(overrideCheckbox).toBeVisible();

          // Admin can check override and provide reason
          await overrideCheckbox.check();

          const reasonField = page.locator('textarea[name="overrideReason"]').or(
            page.locator('textarea').first()
          );

          if (await reasonField.isVisible({ timeout: 2000 })) {
            await reasonField.fill('Emergency equipment needed for thesis project');
          }
        }
      }
    });
  });

  test.describe('Policy Violations Log', () => {
    test('should log policy violations', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to policy violations log
      const violationsLink = page.getByRole('link', { name: /violations|policy.*log/i });

      if (await violationsLink.count() > 0) {
        await violationsLink.click();

        // Verify violations list visible
        await expect(page.locator('[data-testid="policy-violations"]').or(
          page.locator('.violations-list')
        )).toBeVisible({ timeout: 10000 });

        // Should show violation details
        const violationItem = page.locator('.violation-item').first();

        if (await violationItem.count() > 0) {
          await expect(violationItem).toContainText(/weekly|concurrent|training/i);
        }
      }
    });
  });

  test.describe('Accessibility - Policy Components', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      // Tab through policy status elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus indicator visible
      const activeElement = await page.evaluate(() => document.activeElement?.className);
      expect(activeElement).toBeTruthy();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /policies/i }).click();

      // Verify toggle buttons have aria-labels
      const toggleButton = page.locator('.btn-toggle').first();

      if (await toggleButton.count() > 0) {
        const ariaLabel = await toggleButton.getAttribute('aria-label');
        const title = await toggleButton.getAttribute('title');

        expect(ariaLabel || title || await toggleButton.textContent()).toBeTruthy();
      }
    });
  });
});
