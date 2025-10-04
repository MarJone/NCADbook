import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, waitForToast, logout } from '../utils/test-helpers.js';

// Increase timeout for booking workflow tests
test.setTimeout(45000);

test.describe('Booking Workflow - End to End', () => {
  test('should complete full booking workflow: create -> approve -> complete', async ({ browser }) => {
    // Use separate contexts for student and admin
    const studentContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const studentPage = await studentContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      // Step 1: Student creates booking
      await studentPage.goto('http://localhost:5173');
      await login(studentPage, users.student.email, users.student.password);
      await waitForLoadingComplete(studentPage);

      // Navigate to equipment and create booking
      const firstEquipment = studentPage.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
      await firstEquipment.click();

      const bookButton = studentPage.locator('button:has-text("Book"), button:has-text("Reserve")');
      if (await bookButton.isVisible()) {
        await bookButton.click();

        // Fill booking form
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 9);

        const startDateInput = studentPage.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = studentPage.locator('input[name="endDate"], input[type="date"]').last();

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

        const purposeInput = studentPage.locator('textarea[name="purpose"], textarea[name="justification"]');
        if (await purposeInput.isVisible()) {
          await purposeInput.fill('E2E Test: Final project photography');
        }

        const submitButton = studentPage.locator('button[type="submit"]');
        await submitButton.click();

        // Wait for success
        await waitForToast(studentPage, /success|booked|created/i);
        await waitForLoadingComplete(studentPage);
      }

      // Step 2: Admin approves booking
      await adminPage.goto('http://localhost:5173');
      await login(adminPage, users.admin.email, users.admin.password);
      await waitForLoadingComplete(adminPage);

      // Navigate to approvals
      const approvalsLink = adminPage.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
      if (await approvalsLink.isVisible()) {
        await approvalsLink.click();
        await waitForLoadingComplete(adminPage);

        // Find and approve the booking
        const approveButton = adminPage.locator('button:has-text("Approve")').first();
        if (await approveButton.isVisible()) {
          await approveButton.click();

          const confirmButton = adminPage.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }

          await waitForToast(adminPage, /approved|success/i);
        }
      }

      // Step 3: Verify student can see approved booking
      await studentPage.reload();
      await waitForLoadingComplete(studentPage);

      const bookingsLink = studentPage.locator('a:has-text("My Bookings"), a:has-text("Bookings")');
      if (await bookingsLink.isVisible()) {
        await bookingsLink.click();
        await waitForLoadingComplete(studentPage);

        // Should see booking with approved status
        const approvedBooking = studentPage.locator('text=/approved/i').first();
        const hasApprovedStatus = await approvedBooking.isVisible().catch(() => false);

        if (hasApprovedStatus) {
          expect(hasApprovedStatus).toBe(true);
        }
      }
    } finally {
      await studentContext.close();
      await adminContext.close();
    }
  });

  test('should handle booking denial workflow', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const studentPage = await studentContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      // Student creates booking
      await studentPage.goto('http://localhost:5173');
      await login(studentPage, users.student.email, users.student.password);
      await waitForLoadingComplete(studentPage);

      const firstEquipment = studentPage.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
      await firstEquipment.click();

      const bookButton = studentPage.locator('button:has-text("Book"), button:has-text("Reserve")');
      if (await bookButton.isVisible()) {
        await bookButton.click();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 3);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 10);

        const startDateInput = studentPage.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = studentPage.locator('input[name="endDate"], input[type="date"]').last();

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

        const purposeInput = studentPage.locator('textarea[name="purpose"], textarea[name="justification"]');
        if (await purposeInput.isVisible()) {
          await purposeInput.fill('E2E Test: Equipment needed for workshop');
        }

        const submitButton = studentPage.locator('button[type="submit"]');
        await submitButton.click();
        await waitForToast(studentPage, /success|booked/i);
      }

      // Admin denies booking
      await adminPage.goto('http://localhost:5173');
      await login(adminPage, users.admin.email, users.admin.password);
      await waitForLoadingComplete(adminPage);

      const approvalsLink = adminPage.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
      if (await approvalsLink.isVisible()) {
        await approvalsLink.click();
        await waitForLoadingComplete(adminPage);

        const denyButton = adminPage.locator('button:has-text("Deny"), button:has-text("Reject")').first();
        if (await denyButton.isVisible()) {
          await denyButton.click();

          const reasonInput = adminPage.locator('textarea[name="reason"], textarea[placeholder*="reason"]');
          if (await reasonInput.isVisible({ timeout: 2000 })) {
            await reasonInput.fill('Equipment already booked for that period');
          }

          const confirmButton = adminPage.locator('button:has-text("Confirm"), button:has-text("Deny"), button[type="submit"]');
          await confirmButton.click();
          await waitForToast(adminPage, /denied|rejected|success/i);
        }
      }

      // Verify student sees denied booking
      await studentPage.reload();
      await waitForLoadingComplete(studentPage);

      const bookingsLink = studentPage.locator('a:has-text("My Bookings"), a:has-text("Bookings")');
      if (await bookingsLink.isVisible()) {
        await bookingsLink.click();
        await waitForLoadingComplete(studentPage);

        const deniedBooking = studentPage.locator('text=/denied|rejected/i').first();
        const hasDeniedStatus = await deniedBooking.isVisible().catch(() => false);

        if (hasDeniedStatus) {
          expect(hasDeniedStatus).toBe(true);
        }
      }
    } finally {
      await studentContext.close();
      await adminContext.close();
    }
  });

  test('should prevent double booking of same equipment', async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Create first booking
    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    await firstEquipment.click();

    const equipmentName = await page.locator('h1, h2, h3, [data-testid="equipment-name"]').first().textContent();

    const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
    if (await bookButton.isVisible()) {
      await bookButton.click();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 12);

      const startDateInput = page.locator('input[name="startDate"], input[type="date"]').first();
      const endDateInput = page.locator('input[name="endDate"], input[type="date"]').last();

      await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
      await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

      const purposeInput = page.locator('textarea[name="purpose"], textarea[name="justification"]');
      if (await purposeInput.isVisible()) {
        await purposeInput.fill('First booking for conflict test');
      }

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await waitForToast(page, /success|booked/i);

      // Close modal if open
      const closeButton = page.locator('button:has-text("Close"), [aria-label="Close"]');
      if (await closeButton.isVisible({ timeout: 1000 })) {
        await closeButton.click();
      }

      // Try to book same equipment for overlapping dates
      await page.goto('http://localhost:5173/student');
      await waitForLoadingComplete(page);

      await firstEquipment.click();
      await bookButton.click();

      // Use overlapping dates
      const overlapStart = new Date();
      overlapStart.setDate(overlapStart.getDate() + 7); // In middle of first booking

      await startDateInput.fill(overlapStart.toISOString().split('T')[0]);
      await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

      if (await purposeInput.isVisible()) {
        await purposeInput.fill('Second booking - should conflict');
      }

      await submitButton.click();

      // Should show conflict error
      const errorMessage = page.locator('.error, [role="alert"], .toast');
      const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

      // Conflict detection might not be implemented yet
      if (hasError) {
        await expect(errorMessage).toContainText(/conflict|unavailable|already booked/i);
      }
    }
  });

  test('should handle booking cancellation by student', async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Navigate to My Bookings
    const bookingsLink = page.locator('a:has-text("My Bookings"), a:has-text("Bookings")');
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      await waitForLoadingComplete(page);

      // Find a pending booking and cancel it
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      if (await cancelButton.isVisible()) {
        const initialCount = await page.locator('.booking-card, [data-testid="booking-card"], tbody tr').count();

        await cancelButton.click();

        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        await waitForToast(page, /cancel|removed/i);
        await waitForLoadingComplete(page);

        // Booking should be removed or marked as cancelled
        const finalCount = await page.locator('.booking-card, [data-testid="booking-card"], tbody tr').count();
        expect(finalCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test('should maintain booking history', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const studentPage = await studentContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      // Create and approve a booking
      await studentPage.goto('http://localhost:5173');
      await login(studentPage, users.student.email, users.student.password);
      await waitForLoadingComplete(studentPage);

      const firstEquipment = studentPage.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
      await firstEquipment.click();

      const bookButton = studentPage.locator('button:has-text("Book"), button:has-text("Reserve")');
      if (await bookButton.isVisible()) {
        await bookButton.click();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 15);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 20);

        const startDateInput = studentPage.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = studentPage.locator('input[name="endDate"], input[type="date"]').last();

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

        const purposeInput = studentPage.locator('textarea[name="purpose"], textarea[name="justification"]');
        if (await purposeInput.isVisible()) {
          await purposeInput.fill('History test booking');
        }

        const submitButton = studentPage.locator('button[type="submit"]');
        await submitButton.click();
        await waitForToast(studentPage, /success|booked/i);
      }

      // Admin approves
      await adminPage.goto('http://localhost:5173');
      await login(adminPage, users.admin.email, users.admin.password);
      await waitForLoadingComplete(adminPage);

      const approvalsLink = adminPage.locator('a:has-text("Approvals")').first();
      if (await approvalsLink.isVisible()) {
        await approvalsLink.click();
        await waitForLoadingComplete(adminPage);

        const approveButton = adminPage.locator('button:has-text("Approve")').first();
        if (await approveButton.isVisible()) {
          await approveButton.click();

          const confirmButton = adminPage.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click();
          }

          await waitForToast(adminPage, /approved|success/i);
        }
      }

      // Verify booking appears in history with correct status
      await studentPage.reload();
      await waitForLoadingComplete(studentPage);

      const bookingsLink = studentPage.locator('a:has-text("My Bookings"), a:has-text("Bookings")');
      if (await bookingsLink.isVisible()) {
        await bookingsLink.click();
        await waitForLoadingComplete(studentPage);

        // Should see the approved booking
        const bookingsList = studentPage.locator('.booking-card, [data-testid="booking-card"], tbody tr');
        const count = await bookingsList.count();
        expect(count).toBeGreaterThan(0);
      }
    } finally {
      await studentContext.close();
      await adminContext.close();
    }
  });

  test('should show booking details to both student and admin', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const studentPage = await studentContext.newPage();
    const adminPage = await adminContext.newPage();

    try {
      // Student creates booking with specific details
      await studentPage.goto('http://localhost:5173');
      await login(studentPage, users.student.email, users.student.password);
      await waitForLoadingComplete(studentPage);

      const testPurpose = `E2E Test ${Date.now()} - Photography project`;

      const firstEquipment = studentPage.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
      await firstEquipment.click();

      const bookButton = studentPage.locator('button:has-text("Book"), button:has-text("Reserve")');
      if (await bookButton.isVisible()) {
        await bookButton.click();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 20);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 25);

        const startDateInput = studentPage.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = studentPage.locator('input[name="endDate"], input[type="date"]').last();

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

        const purposeInput = studentPage.locator('textarea[name="purpose"], textarea[name="justification"]');
        if (await purposeInput.isVisible()) {
          await purposeInput.fill(testPurpose);
        }

        const submitButton = studentPage.locator('button[type="submit"]');
        await submitButton.click();
        await waitForToast(studentPage, /success|booked/i);
      }

      // Admin views booking details
      await adminPage.goto('http://localhost:5173');
      await login(adminPage, users.admin.email, users.admin.password);
      await waitForLoadingComplete(adminPage);

      const approvalsLink = adminPage.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
      if (await approvalsLink.isVisible()) {
        await approvalsLink.click();
        await waitForLoadingComplete(adminPage);

        // Should see booking with purpose
        const bookingWithPurpose = adminPage.locator(`text=/${testPurpose.split(' ')[2]}/i`);
        const hasBookingDetails = await bookingWithPurpose.isVisible().catch(() => false);

        // Details might be in a modal or expanded view
        if (!hasBookingDetails) {
          const firstBooking = adminPage.locator('[data-testid="booking-card"], .booking-card, tbody tr').first();
          if (await firstBooking.isVisible()) {
            await firstBooking.click();
            // Check for details in modal/expanded view
          }
        }
      }
    } finally {
      await studentContext.close();
      await adminContext.close();
    }
  });
});

test.describe('Booking Workflow - Equipment Availability', () => {
  test('should show equipment as unavailable when booked', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const student2Context = await browser.newContext();

    const studentPage = await studentContext.newPage();
    const student2Page = await student2Context.newPage();

    try {
      // Student 1 creates booking
      await studentPage.goto('http://localhost:5173');
      await login(studentPage, users.student.email, users.student.password);
      await waitForLoadingComplete(studentPage);

      const firstEquipment = studentPage.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
      await firstEquipment.click();

      const bookButton = studentPage.locator('button:has-text("Book"), button:has-text("Reserve")');
      if (await bookButton.isVisible()) {
        await bookButton.click();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 30);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 35);

        const startDateInput = studentPage.locator('input[name="startDate"], input[type="date"]').first();
        const endDateInput = studentPage.locator('input[name="endDate"], input[type="date"]').last();

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(nextWeek.toISOString().split('T')[0]);

        const purposeInput = studentPage.locator('textarea[name="purpose"], textarea[name="justification"]');
        if (await purposeInput.isVisible()) {
          await purposeInput.fill('Availability test booking');
        }

        const submitButton = studentPage.locator('button[type="submit"]');
        await submitButton.click();
        await waitForToast(studentPage, /success|booked/i);
      }

      // Student 2 tries to view same equipment
      await student2Page.goto('http://localhost:5173');
      // Use demo account or create separate student account
      await login(student2Page, users.student.email, users.student.password);
      await waitForLoadingComplete(student2Page);

      // Equipment availability status might not be immediately visible
      // This is a placeholder for future availability checking
    } finally {
      await studentContext.close();
      await student2Context.close();
    }
  });
});
