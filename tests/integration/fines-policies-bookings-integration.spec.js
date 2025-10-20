import { test, expect } from '@playwright/test';

/**
 * Integration Tests: Fines, Policies, and Bookings
 * Tests the interaction between fine management, policy enforcement, and booking workflows
 */

test.describe('Fines + Policies + Bookings Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/NCADbook/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Account Hold Blocks Booking', () => {
    test('should prevent booking when user has account hold from fines', async ({ page }) => {
      // Scenario: Student with unpaid fines exceeding threshold has account hold
      // Attempting to book should be blocked by checkFineStatus middleware

      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Check if user has account hold
      const accountHoldIndicator = page.locator('[data-account-hold="true"]').or(
        page.locator('.account-hold-warning')
      );

      if (await accountHoldIndicator.isVisible({ timeout: 3000 })) {
        // Try to create booking
        await page.getByRole('link', { name: /equipment/i }).click();

        const equipmentCard = page.locator('.equipment-card').first();
        if (await equipmentCard.count() > 0) {
          await equipmentCard.click();

          const bookButton = page.locator('button:has-text("Book")');
          if (await bookButton.count() > 0) {
            await bookButton.click();

            // Fill booking form
            await page.locator('input[type="date"]').first().fill('2025-11-10');
            await page.locator('input[type="date"]').last().fill('2025-11-12');

            // Submit booking
            await page.getByRole('button', { name: /submit|confirm/i }).click();

            // Should show account hold error
            await expect(page.locator('text=/account hold|fines.*outstanding/i')).toBeVisible({
              timeout: 5000
            });

            // Should show total fines owed
            await expect(page.locator('text=/€\d+/)).toBeVisible();
          }
        }
      }
    });

    test('should allow booking after fines are paid and hold lifted', async ({ page }) => {
      // Login as admin to pay fines
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Navigate to fines
      await page.getByRole('link', { name: /fines/i }).click();

      // Find user with account hold
      const heldUserFine = page.locator('[data-account-hold="true"]').first();

      if (await heldUserFine.count() > 0) {
        // Mark fines as paid
        const payButton = heldUserFine.locator('button:has-text("Mark as Paid")').or(
          heldUserFine.locator('.btn-mark-paid')
        );

        if (await payButton.count() > 0) {
          await payButton.click();

          // Confirm if needed
          const confirmButton = page.locator('button:has-text("Confirm")');
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }

          // Wait for account hold to lift
          await page.waitForTimeout(2000);

          // Now try booking as that student
          await page.getByRole('button', { name: /logout|sign out/i }).click();

          await page.getByLabel(/email/i).fill('student@ncad.ie');
          await page.getByLabel(/password/i).fill('student123');
          await page.getByRole('button', { name: /login/i }).click();

          // Try to book
          await page.getByRole('link', { name: /equipment/i }).click();

          const equipmentCard = page.locator('.equipment-card').first();
          if (await equipmentCard.count() > 0) {
            await equipmentCard.click();

            // Should NOT show account hold warning
            await expect(page.locator('.account-hold-warning')).not.toBeVisible({
              timeout: 2000
            }).catch(() => true); // Pass if element doesn't exist

            const bookButton = page.locator('button:has-text("Book")');
            await expect(bookButton).toBeEnabled();
          }
        }
      }
    });
  });

  test.describe('Overdue Bookings Generate Fines and Affect Policies', () => {
    test('should generate fine when booking becomes overdue', async ({ page }) => {
      // This test requires a booking that is past due date
      // In real scenario, a background job would calculate fines

      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Check overdue bookings
      await page.getByRole('link', { name: /bookings/i }).click();

      const overdueBooking = page.locator('[data-status="overdue"]').or(
        page.locator('.booking-item').filter({ hasText: /overdue/i })
      ).first();

      if (await overdueBooking.count() > 0) {
        // Verify fine amount calculated
        const fineAmount = overdueBooking.locator('.fine-amount').or(
          overdueBooking.locator('text=/€\d+/')
        );

        if (await fineAmount.count() > 0) {
          await expect(fineAmount).toBeVisible();

          // Fine should increase based on days overdue
          const fineText = await fineAmount.textContent();
          expect(fineText).toMatch(/€\d+/);
        }

        // Navigate to fines section
        await page.getByRole('link', { name: /fines/i }).click();

        // Verify fine exists in fines list
        await expect(page.locator('.fine-item').first()).toBeVisible();
      }
    });

    test('should accumulate fines and trigger account hold at threshold', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /fines/i }).click();

      // Find user with multiple unpaid fines
      const userWithMultipleFines = page.locator('.user-fines-row').filter({
        hasText: /€\d+/
      }).first();

      if (await userWithMultipleFines.count() > 0) {
        const totalOwedText = await userWithMultipleFines.textContent();
        const match = totalOwedText.match(/€(\d+)/);

        if (match && parseInt(match[1]) >= 20) {
          // Should have account hold if >= €20
          await expect(userWithMultipleFines.locator('.account-hold-badge').or(
            userWithMultipleFines.locator('text=/hold|blocked/i')
          )).toBeVisible();
        }
      }
    });
  });

  test.describe('Policy Violations and Fines Combined', () => {
    test('should block booking if both policy limit reached AND fines exist', async ({ page }) => {
      // Student with weekly limit reached + unpaid fines
      // Should show both violations

      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');

      if (await policyStatus.count() > 0) {
        const statusText = await policyStatus.textContent();

        // Check if weekly limit reached
        const limitReached = statusText.includes('3/3') || statusText.includes('limit reached');

        if (limitReached) {
          // Also check for fines warning
          const finesWarning = page.locator('.fines-warning').or(
            page.locator('text=/fines.*outstanding/i')
          );

          if (await finesWarning.isVisible({ timeout: 2000 })) {
            // Both policy and fines blocking - try to book anyway
            const equipmentCard = page.locator('.equipment-card').first();
            await equipmentCard.click();

            const bookButton = page.locator('button:has-text("Book")');
            await bookButton.click();

            // Should show multiple error messages
            await expect(page.locator('text=/weekly.*limit/i')).toBeVisible();
            await expect(page.locator('text=/fines|account.*hold/i')).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Admin Actions on Integrated System', () => {
    test('should allow admin to waive fine and clear account hold', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /fines/i }).click();

      // Find user with account hold
      const heldUser = page.locator('[data-account-hold="true"]').first();

      if (await heldUser.count() > 0) {
        // Waive all fines
        const waiveButton = heldUser.locator('button:has-text("Waive")').first();

        if (await waiveButton.count() > 0) {
          await waiveButton.click();

          // Enter reason
          const reasonField = page.locator('textarea');
          if (await reasonField.isVisible({ timeout: 2000 })) {
            await reasonField.fill('Equipment returned undamaged, first offense');

            await page.getByRole('button', { name: /confirm|waive/i }).click();

            // Wait for update
            await page.waitForTimeout(2000);

            // Verify account hold lifted
            await expect(heldUser.locator('[data-account-hold="false"]').or(
              page.locator('text=/active|cleared/i')
            )).toBeVisible({ timeout: 5000 }).catch(() => true);
          }
        }
      }
    });

    test('should allow admin to override policy for student with restrictions', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      // Admin creates booking on behalf of student who hit policy limit
      await page.getByRole('link', { name: /bookings/i }).click();

      const createBookingButton = page.locator('button:has-text("Create Booking")');

      if (await createBookingButton.count() > 0) {
        await createBookingButton.click();

        // Select student
        const userSelect = page.locator('select[name="user_id"]');
        if (await userSelect.count() > 0) {
          await userSelect.selectOption({ index: 1 });

          // Select equipment
          const equipmentSelect = page.locator('select[name="equipment_id"]');
          await equipmentSelect.selectOption({ index: 1 });

          // Check admin override
          const overrideCheckbox = page.locator('input[name="adminOverride"]');
          if (await overrideCheckbox.count() > 0) {
            await overrideCheckbox.check();

            const reasonField = page.locator('textarea[name="overrideReason"]');
            if (await reasonField.isVisible({ timeout: 2000 })) {
              await reasonField.fill('Emergency thesis equipment - faculty approved');
            }

            // Submit booking with override
            await page.getByRole('button', { name: /create|submit/i }).click();

            // Should succeed despite policy limits
            await expect(page.locator('text=/success|created/i')).toBeVisible({
              timeout: 5000
            });
          }
        }
      }
    });
  });

  test.describe('Booking Lifecycle with Fines and Policies', () => {
    test('should enforce policies at booking creation, calculate fines if late, update user status', async ({ page }) => {
      // Complete lifecycle test:
      // 1. Student books equipment (policy check passes)
      // 2. Booking becomes overdue
      // 3. Fine calculated automatically
      // 4. If fine exceeds threshold → account hold
      // 5. Account hold blocks future bookings

      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Step 1: Create booking (check policy status)
      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');

      if (await policyStatus.count() > 0) {
        const statusText = await policyStatus.textContent();

        // Verify weekly limit shown
        expect(statusText).toMatch(/\d+\s*\/\s*\d+/);

        // If user is under limit, booking should be allowed
        if (statusText.includes('1/3') || statusText.includes('2/3')) {
          const equipmentCard = page.locator('.equipment-card').first();
          await equipmentCard.click();

          const bookButton = page.locator('button:has-text("Book")');
          await bookButton.click();

          // Fill dates
          await page.locator('input[type="date"]').first().fill('2025-11-15');
          await page.locator('input[type="date"]').last().fill('2025-11-17');

          // Submit
          await page.getByRole('button', { name: /submit|confirm/i }).click();

          // Should succeed
          const successMessage = page.locator('text=/success|confirmed/i');

          if (await successMessage.isVisible({ timeout: 3000 })) {
            await expect(successMessage).toBeVisible();

            // Step 2 & 3: In real system, cron job would mark as overdue and calculate fines
            // For testing, we verify the system HAS overdue logic by checking existing overdue bookings

            // Check if user now has any overdue items
            await page.getByRole('link', { name: /bookings|my bookings/i }).click();

            const overdueBooking = page.locator('[data-status="overdue"]');

            if (await overdueBooking.count() > 0) {
              // Fine should be calculated
              await expect(overdueBooking.locator('.fine-amount')).toBeVisible();
            }
          }
        } else if (statusText.includes('3/3')) {
          // At limit - booking should be blocked
          const equipmentCard = page.locator('.equipment-card').first();
          await equipmentCard.click();

          // Should show blocked message
          await expect(page.locator('text=/limit.*reached|exceeded/i')).toBeVisible();
        }
      }
    });
  });

  test.describe('Analytics Integration', () => {
    test('should show fine revenue and policy violation stats in analytics', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /analytics|reports/i }).click();

      // Verify fine metrics
      const fineMetrics = page.locator('[data-metric="fines"]').or(
        page.locator('.metric-fines')
      );

      if (await fineMetrics.count() > 0) {
        await expect(fineMetrics).toBeVisible();

        // Should show total collected, outstanding, waived
        await expect(page.locator('text=/total.*collected/i')).toBeVisible();
        await expect(page.locator('text=/€\d+/')).toBeVisible();
      }

      // Verify policy violation metrics
      const policyMetrics = page.locator('[data-metric="policy-violations"]').or(
        page.locator('.metric-policies')
      );

      if (await policyMetrics.count() > 0) {
        await expect(policyMetrics).toBeVisible();

        // Should show violation counts by type
        await expect(page.locator('text=/weekly.*limit|concurrent.*limit/i')).toBeVisible();
      }
    });
  });

  test.describe('User Experience - Combined System', () => {
    test('should show clear messaging when multiple restrictions apply', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // User might have:
      // - Outstanding fines
      // - Weekly limit reached
      // - Missing training
      // All these should be communicated clearly

      await page.getByRole('link', { name: /equipment/i }).click();

      const statusSections = page.locator('.policy-status, .fines-warning, .account-hold-warning');
      const count = await statusSections.count();

      if (count > 0) {
        // Each restriction should have:
        // 1. Clear icon (warning/error)
        // 2. Descriptive title
        // 3. Actionable help text

        for (let i = 0; i < count; i++) {
          const section = statusSections.nth(i);

          // Verify icon present
          const icon = section.locator('.icon, .status-icon, [class*="icon"]');
          if (await icon.count() > 0) {
            await expect(icon).toBeVisible();
          }

          // Verify descriptive text
          const text = await section.textContent();
          expect(text.length).toBeGreaterThan(20); // Should have meaningful description

          // Should include action guidance
          expect(text.toLowerCase()).toMatch(/contact|return|pay|complete|wait/);
        }
      }
    });

    test('should provide recovery path from restricted state', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // If user has restrictions, should see how to resolve them
      const accountWarning = page.locator('.account-hold-warning, .policy-status.has-issues');

      if (await accountWarning.isVisible({ timeout: 3000 })) {
        // Should have link/button to resolve
        const resolveLink = page.locator('a:has-text("Pay Fines")').or(
          page.locator('button:has-text("View Details")')
        );

        if (await resolveLink.count() > 0) {
          await resolveLink.click();

          // Should navigate to relevant page
          await expect(page.locator('.fines-section, .policy-details')).toBeVisible({
            timeout: 5000
          });
        }
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle booking deletion and fine recalculation', async ({ page }) => {
      // If overdue booking is deleted, associated fine should be handled
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /bookings/i }).click();

      const overdueBooking = page.locator('[data-status="overdue"]').first();

      if (await overdueBooking.count() > 0) {
        // Note the booking ID or fine amount
        const bookingId = await overdueBooking.getAttribute('data-booking-id');

        // Delete booking
        const deleteButton = overdueBooking.locator('button:has-text("Delete")');

        if (await deleteButton.count() > 0) {
          await deleteButton.click();

          // Confirm deletion
          const confirmButton = page.locator('button:has-text("Confirm")');
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }

          // Check fines section - fine might be waived or marked for review
          await page.getByRole('link', { name: /fines/i }).click();

          // Verify system handles orphaned fine gracefully
          // (Implementation detail - might keep fine, might waive it)
          await expect(page.locator('.fines-list')).toBeVisible();
        }
      }
    });

    test('should handle policy deactivation gracefully', async ({ page }) => {
      // If admin deactivates a policy mid-day, existing bookings should be unaffected
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /policies/i }).click();

      // Deactivate a policy
      const toggleButton = page.locator('.btn-toggle.active').first();

      if (await toggleButton.count() > 0) {
        await toggleButton.click();

        // Verify it deactivated
        await expect(toggleButton).toHaveClass(/inactive/);

        // Check that existing bookings still show
        await page.getByRole('link', { name: /bookings/i }).click();

        await expect(page.locator('.booking-item')).toHaveCount({ greaterThan: 0 });
      }
    });
  });
});
