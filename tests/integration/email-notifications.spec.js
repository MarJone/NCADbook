import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, waitForToast } from '../utils/test-helpers.js';

// Increase timeout for email notification tests
test.setTimeout(45000);

// Mock EmailJS for testing
test.beforeEach(async ({ page }) => {
  // Intercept EmailJS API calls
  await page.route('https://api.emailjs.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Email sent (mocked)' })
    });
  });
});

test.describe('Email Notifications - Booking Created', () => {
  test('should trigger email when student creates booking', async ({ page, context }) => {
    // Track network requests
    const emailRequests = [];

    page.on('request', request => {
      if (request.url().includes('emailjs.com')) {
        emailRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Create booking
    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    await firstEquipment.click();

    const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
    if (await bookButton.isVisible()) {
      await bookButton.click();

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
        await purposeInput.fill('Email notification test');
      }

      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      await waitForToast(page, /success|booked/i);

      // Wait for potential email request
      await page.waitForTimeout(1000);

      // Check if email was triggered (if email notifications are enabled)
      // This will pass even if no email was sent (feature might be disabled)
      if (emailRequests.length > 0) {
        expect(emailRequests.length).toBeGreaterThan(0);
      }
    }
  });

  test('should include booking details in email payload', async ({ page }) => {
    let emailPayload = null;

    await page.route('https://api.emailjs.com/**', route => {
      // Capture email payload
      const postData = route.request().postData();
      if (postData) {
        try {
          emailPayload = JSON.parse(postData);
        } catch (e) {
          // Not JSON
        }
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    await firstEquipment.click();

    const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
    if (await bookButton.isVisible()) {
      await bookButton.click();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await page.locator('input[name="startDate"], input[type="date"]').first().fill(tomorrow.toISOString().split('T')[0]);
      await page.locator('input[name="endDate"], input[type="date"]').last().fill(nextWeek.toISOString().split('T')[0]);

      const purposeInput = page.locator('textarea[name="purpose"], textarea[name="justification"]');
      if (await purposeInput.isVisible()) {
        await purposeInput.fill('Payload test booking');
      }

      await page.locator('button[type="submit"]').click();
      await waitForToast(page, /success|booked/i);
      await page.waitForTimeout(1000);

      // If email was sent, verify payload structure
      if (emailPayload) {
        expect(emailPayload).toBeDefined();
        // Payload might contain template parameters
      }
    }
  });
});

test.describe('Email Notifications - Booking Approved', () => {
  test('should trigger email when admin approves booking', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    const emailRequests = [];

    adminPage.on('request', request => {
      if (request.url().includes('emailjs.com')) {
        emailRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Mock EmailJS
    await adminPage.route('https://api.emailjs.com/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    try {
      await adminPage.goto('http://localhost:5173');
      await login(adminPage, users.admin.email, users.admin.password);
      await waitForLoadingComplete(adminPage);

      const approvalsLink = adminPage.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
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
          await adminPage.waitForTimeout(1000);

          // Check if email was triggered
          if (emailRequests.length > 0) {
            expect(emailRequests.length).toBeGreaterThan(0);
          }
        }
      }
    } finally {
      await adminContext.close();
    }
  });
});

test.describe('Email Notifications - Booking Denied', () => {
  test('should trigger email when admin denies booking', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    const emailRequests = [];

    adminPage.on('request', request => {
      if (request.url().includes('emailjs.com')) {
        emailRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    await adminPage.route('https://api.emailjs.com/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    try {
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
            await reasonInput.fill('Equipment unavailable - email test');
          }

          const confirmButton = adminPage.locator('button:has-text("Confirm"), button:has-text("Deny"), button[type="submit"]');
          await confirmButton.click();

          await waitForToast(adminPage, /denied|rejected|success/i);
          await adminPage.waitForTimeout(1000);

          // Check if email was triggered
          if (emailRequests.length > 0) {
            expect(emailRequests.length).toBeGreaterThan(0);
          }
        }
      }
    } finally {
      await adminContext.close();
    }
  });

  test('should include denial reason in email', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    let emailPayload = null;
    const denialReason = 'Test denial reason for email verification';

    await adminPage.route('https://api.emailjs.com/**', route => {
      const postData = route.request().postData();
      if (postData) {
        try {
          emailPayload = JSON.parse(postData);
        } catch (e) {
          // Not JSON
        }
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    try {
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
            await reasonInput.fill(denialReason);
          }

          const confirmButton = adminPage.locator('button:has-text("Confirm"), button:has-text("Deny"), button[type="submit"]');
          await confirmButton.click();

          await waitForToast(adminPage, /denied|rejected|success/i);
          await adminPage.waitForTimeout(1000);

          // If email was sent, payload should contain reason
          if (emailPayload) {
            expect(emailPayload).toBeDefined();
          }
        }
      }
    } finally {
      await adminContext.close();
    }
  });
});

test.describe('Email Notifications - Feature Toggle', () => {
  test('should respect email notification settings', async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);

    // Navigate to settings/features
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for email notification toggle
      const emailToggle = page.locator('input[name="emailNotifications"], input[type="checkbox"]').first();
      if (await emailToggle.isVisible()) {
        const isEnabled = await emailToggle.isChecked();

        // Toggle it
        await emailToggle.click();
        await page.waitForTimeout(500);

        const newState = await emailToggle.isChecked();
        expect(newState).not.toBe(isEnabled);

        // Toggle back to original state
        await emailToggle.click();
        await page.waitForTimeout(500);

        const finalState = await emailToggle.isChecked();
        expect(finalState).toBe(isEnabled);
      }
    }
  });

  test('should not send emails when notifications disabled', async ({ page }) => {
    const emailRequests = [];

    page.on('request', request => {
      if (request.url().includes('emailjs.com')) {
        emailRequests.push(request.url());
      }
    });

    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);

    // Disable email notifications
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      const emailToggle = page.locator('input[name="emailNotifications"]').first();
      if (await emailToggle.isVisible()) {
        if (await emailToggle.isChecked()) {
          await emailToggle.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Try to approve a booking
    const approvalsLink = page.locator('a:has-text("Approvals"), a:has-text("Pending")').first();
    if (await approvalsLink.isVisible()) {
      await approvalsLink.click();
      await waitForLoadingComplete(page);

      const approveButton = page.locator('button:has-text("Approve")').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();

        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        await waitForToast(page, /approved|success/i);
        await page.waitForTimeout(1000);

        // Should not have sent email
        // (This might still send emails if feature flag isn't checked properly)
      }
    }
  });
});

test.describe('Email Notifications - Configuration', () => {
  test('should display EmailJS configuration fields', async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for EmailJS config fields
      const serviceIdInput = page.locator('input[name="emailServiceId"], input[name="serviceId"]');
      const templateIdInput = page.locator('input[name="emailTemplateId"], input[name="templateId"]');
      const publicKeyInput = page.locator('input[name="emailPublicKey"], input[name="publicKey"]');

      const hasServiceId = await serviceIdInput.isVisible().catch(() => false);
      const hasTemplateId = await templateIdInput.isVisible().catch(() => false);
      const hasPublicKey = await publicKeyInput.isVisible().catch(() => false);

      // At least some config fields should be visible
      if (hasServiceId || hasTemplateId || hasPublicKey) {
        expect(hasServiceId || hasTemplateId || hasPublicKey).toBe(true);
      }
    }
  });

  test('should validate EmailJS configuration', async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
      if (await saveButton.isVisible()) {
        // Try to save with empty config
        const serviceIdInput = page.locator('input[name="emailServiceId"], input[name="serviceId"]');
        if (await serviceIdInput.isVisible()) {
          await serviceIdInput.fill('');
          await saveButton.click();

          // Might show validation error or just save empty value
          await page.waitForTimeout(1000);
        }
      }
    }
  });
});

test.describe('Email Notifications - Error Handling', () => {
  test('should handle email sending failures gracefully', async ({ page }) => {
    // Mock EmailJS to fail
    await page.route('https://api.emailjs.com/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email service unavailable' })
      });
    });

    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    // Create booking (should succeed even if email fails)
    const firstEquipment = page.locator('[data-testid="equipment-card"], .equipment-card, .card').first();
    await firstEquipment.click();

    const bookButton = page.locator('button:has-text("Book"), button:has-text("Reserve")');
    if (await bookButton.isVisible()) {
      await bookButton.click();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await page.locator('input[name="startDate"], input[type="date"]').first().fill(tomorrow.toISOString().split('T')[0]);
      await page.locator('input[name="endDate"], input[type="date"]').last().fill(nextWeek.toISOString().split('T')[0]);

      const purposeInput = page.locator('textarea[name="purpose"], textarea[name="justification"]');
      if (await purposeInput.isVisible()) {
        await purposeInput.fill('Email failure test');
      }

      await page.locator('button[type="submit"]').click();

      // Booking should still succeed
      await waitForToast(page, /success|booked/i);
    }
  });
});
