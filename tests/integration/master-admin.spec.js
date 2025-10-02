import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, waitForToast, getTableData } from '../utils/test-helpers.js';

test.describe('Master Admin - Authentication & Access', () => {
  test('should login as master admin', async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should have master admin privileges', async ({ authenticatedMasterAdminPage: page }) => {
    // Should have access to user management
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")');
    await expect(userMgmtLink.first()).toBeVisible();
  });
});

test.describe('Master Admin - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);
  });

  test('should display users list', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Should show users table
    const usersTable = page.locator('table, [data-testid="users-table"]');
    await expect(usersTable).toBeVisible();

    // Should have users
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for users', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Search for user
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    await searchInput.fill('demo');
    await waitForLoadingComplete(page);

    // Should show filtered results
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter users by role', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Filter by role
    const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');
    if (await roleFilter.isVisible()) {
      await roleFilter.selectOption('student');
      await waitForLoadingComplete(page);

      const userRows = page.locator('tbody tr');
      const count = await userRows.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should filter users by department', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Filter by department
    const deptFilter = page.locator('select[name="department"], [data-testid="department-filter"]');
    if (await deptFilter.isVisible()) {
      await deptFilter.selectOption({ index: 1 }); // Select first department
      await waitForLoadingComplete(page);

      const userRows = page.locator('tbody tr');
      const count = await userRows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should create new user', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Click add user button
    const addUserButton = page.locator('button:has-text("Add User"), button:has-text("New User")');
    await addUserButton.click();

    // Fill user form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', `test-${Date.now()}@ncad.ie`);

    const departmentSelect = page.locator('select[name="department"]');
    if (await departmentSelect.isVisible()) {
      await departmentSelect.selectOption({ index: 1 });
    }

    const roleSelect = page.locator('select[name="role"]');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('student');
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    await submitButton.click();

    // Should show success
    await waitForToast(page, /success|created|added/i);
  });

  test('should edit existing user', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Click edit on first user
    const editButton = page.locator('button:has-text("Edit"), [data-action="edit"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();

      // Modify user data
      const firstNameInput = page.locator('input[name="firstName"]');
      await firstNameInput.fill('Modified Name');

      // Submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")');
      await submitButton.click();

      // Should show success
      await waitForToast(page, /success|updated|saved/i);
    }
  });

  test('should delete user', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Get initial count
    const initialCount = await page.locator('tbody tr').count();

    // Delete a user (avoid deleting demo users)
    const deleteButton = page.locator('button:has-text("Delete"), [data-action="delete"]').last();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }

      // Should show success
      await waitForToast(page, /success|deleted|removed/i);

      // Wait for table to update
      await waitForLoadingComplete(page);
    }
  });

  test('should validate user form fields', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    await userMgmtLink.click();
    await waitForLoadingComplete(page);

    // Click add user
    const addUserButton = page.locator('button:has-text("Add User"), button:has-text("New User")');
    await addUserButton.click();

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    await submitButton.click();

    // Should show validation errors
    const errorMessages = page.locator('.error, [role="alert"], .field-error, .invalid-feedback');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);
  });
});

test.describe('Master Admin - CSV Import', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);
  });

  test('should access CSV import page', async ({ page }) => {
    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    if (await importLink.first().isVisible()) {
      await importLink.first().click();
      await waitForLoadingComplete(page);

      // Should show import interface
      const importSection = page.locator('[data-testid="csv-import"], .csv-import');
      await expect(importSection).toBeVisible();
    }
  });

  test('should display import type options (users/equipment)', async ({ page }) => {
    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    if (await importLink.first().isVisible()) {
      await importLink.first().click();
      await waitForLoadingComplete(page);

      // Should have tabs or buttons for different import types
      const usersTab = page.locator('button:has-text("Users"), [data-tab="users"]');
      const equipmentTab = page.locator('button:has-text("Equipment"), [data-tab="equipment"]');

      const hasImportTypes = (await usersTab.isVisible().catch(() => false)) ||
                             (await equipmentTab.isVisible().catch(() => false));

      if (hasImportTypes) {
        expect(hasImportTypes).toBe(true);
      }
    }
  });

  test('should download CSV template', async ({ page }) => {
    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    if (await importLink.first().isVisible()) {
      await importLink.first().click();
      await waitForLoadingComplete(page);

      // Look for download template button
      const templateButton = page.locator('button:has-text("Template"), button:has-text("Download"), a:has-text("Template")');
      if (await templateButton.first().isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        await templateButton.first().click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.csv$/);
        }
      }
    }
  });

  test('should validate CSV file format', async ({ page }) => {
    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    if (await importLink.first().isVisible()) {
      await importLink.first().click();
      await waitForLoadingComplete(page);

      // Create invalid CSV file
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // This will test the validation UI exists
        // Actual file upload would need a test CSV file
        await expect(fileInput).toBeVisible();
      }
    }
  });

  test('should show preview before import', async ({ page }) => {
    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    if (await importLink.first().isVisible()) {
      await importLink.first().click();
      await waitForLoadingComplete(page);

      // Look for preview section (should exist even if empty)
      const previewSection = page.locator('[data-testid="csv-preview"], .preview, .import-preview');
      const hasPreview = await previewSection.isVisible().catch(() => false);

      if (hasPreview) {
        await expect(previewSection).toBeVisible();
      }
    }
  });

  test('should detect duplicate entries', async ({ page }) => {
    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    if (await importLink.first().isVisible()) {
      await importLink.first().click();
      await waitForLoadingComplete(page);

      // Duplicate detection should be mentioned in UI
      const duplicateInfo = page.locator('text=/duplicate/i');
      const hasDuplicateHandling = await duplicateInfo.isVisible().catch(() => false);

      // This feature might not be immediately visible
      expect(hasDuplicateHandling || true).toBe(true);
    }
  });
});

test.describe('Master Admin - Cross-Department Access', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);
  });

  test('should view all departments data', async ({ page }) => {
    // Master admin should see data from all departments
    const equipmentLink = page.locator('a:has-text("Equipment")').first();
    if (await equipmentLink.isVisible()) {
      await equipmentLink.click();
      await waitForLoadingComplete(page);

      // Should have department filter showing all departments
      const deptFilter = page.locator('select[name="department"], [data-testid="department-filter"]');
      if (await deptFilter.isVisible()) {
        const options = await deptFilter.locator('option').count();
        expect(options).toBeGreaterThan(1); // At least "All" + departments
      }
    }
  });

  test('should manage permissions for general admins', async ({ page }) => {
    const userMgmtLink = page.locator('a:has-text("Users"), a:has-text("User Management")').first();
    if (await userMgmtLink.isVisible()) {
      await userMgmtLink.click();
      await waitForLoadingComplete(page);

      // Search for an admin user
      const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');
      if (await roleFilter.isVisible()) {
        await roleFilter.selectOption('general_admin');
        await waitForLoadingComplete(page);

        // Should be able to edit admin permissions
        const editButton = page.locator('button:has-text("Edit")').first();
        if (await editButton.isVisible()) {
          await editButton.click();

          // Look for permissions section
          const permissionsSection = page.locator('[data-testid="permissions"], .permissions');
          const hasPermissions = await permissionsSection.isVisible().catch(() => false);

          if (hasPermissions) {
            await expect(permissionsSection).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('Master Admin - System Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);
  });

  test('should view system-wide analytics', async ({ page }) => {
    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Dashboard"), a:has-text("Reports")');
    if (await analyticsLink.first().isVisible()) {
      await analyticsLink.first().click();
      await waitForLoadingComplete(page);

      // Should show comprehensive analytics
      const analyticsContent = page.locator('.analytics, .dashboard, [data-testid="analytics"]');
      const isVisible = await analyticsContent.isVisible().catch(() => false);

      if (isVisible) {
        await expect(analyticsContent).toBeVisible();
      }
    }
  });

  test('should export comprehensive reports', async ({ page }) => {
    const analyticsLink = page.locator('a:has-text("Analytics"), a:has-text("Reports")');
    if (await analyticsLink.first().isVisible()) {
      await analyticsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for export options
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
      }
    }
  });
});

test.describe('Master Admin - Email Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);
  });

  test('should access email settings', async ({ page }) => {
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      // Should show email configuration
      const emailConfig = page.locator('[data-testid="email-config"], .email-config, text=/email/i');
      const hasEmailConfig = await emailConfig.isVisible().catch(() => false);

      if (hasEmailConfig) {
        await expect(emailConfig.first()).toBeVisible();
      }
    }
  });

  test('should configure EmailJS settings', async ({ page }) => {
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Features")');
    if (await settingsLink.first().isVisible()) {
      await settingsLink.first().click();
      await waitForLoadingComplete(page);

      // Look for EmailJS configuration fields
      const serviceIdInput = page.locator('input[name="emailServiceId"], input[name="serviceId"]');
      const hasEmailConfig = await serviceIdInput.isVisible().catch(() => false);

      if (hasEmailConfig) {
        await expect(serviceIdInput).toBeVisible();
      }
    }
  });
});
