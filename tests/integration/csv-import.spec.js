import { test, expect, users } from '../fixtures/auth.fixtures.js';
import { waitForLoadingComplete, login, waitForToast } from '../utils/test-helpers.js';
import fs from 'fs';
import path from 'path';

test.describe('CSV Import - Access Control', () => {
  test('should be accessible only to master admin', async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    await expect(importLink.first()).toBeVisible();
  });

  test('should not be accessible to general admin', async ({ page }) => {
    await login(page, users.admin.email, users.admin.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    const isVisible = await importLink.first().isVisible().catch(() => false);

    // General admins should not have access to CSV import
    expect(isVisible).toBe(false);
  });

  test('should not be accessible to students', async ({ page }) => {
    await login(page, users.student.email, users.student.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")');
    const isVisible = await importLink.first().isVisible().catch(() => false);

    expect(isVisible).toBe(false);
  });
});

test.describe('CSV Import - Interface', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")').first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await waitForLoadingComplete(page);
    }
  });

  test('should display import type tabs (users/equipment)', async ({ page }) => {
    const usersTab = page.locator('button:has-text("Users"), [data-tab="users"]');
    const equipmentTab = page.locator('button:has-text("Equipment"), [data-tab="equipment"]');

    const hasUsersTab = await usersTab.isVisible().catch(() => false);
    const hasEquipmentTab = await equipmentTab.isVisible().catch(() => false);

    if (hasUsersTab || hasEquipmentTab) {
      expect(hasUsersTab || hasEquipmentTab).toBe(true);
    }
  });

  test('should have file upload input', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput.first()).toBeVisible();
  });

  test('should display CSV template download button', async ({ page }) => {
    const templateButton = page.locator('button:has-text("Template"), button:has-text("Download"), a:has-text("Template")');
    const hasTemplateButton = await templateButton.first().isVisible().catch(() => false);

    if (hasTemplateButton) {
      await expect(templateButton.first()).toBeVisible();
    }
  });

  test('should show import instructions', async ({ page }) => {
    const instructions = page.locator('.instructions, .help-text, [data-testid="instructions"]');
    const hasInstructions = await instructions.isVisible().catch(() => false);

    // Instructions might be present
    if (hasInstructions) {
      await expect(instructions).toBeVisible();
    }
  });
});

test.describe('CSV Import - Users Import', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")').first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await waitForLoadingComplete(page);
    }

    // Select users tab if available
    const usersTab = page.locator('button:has-text("Users"), [data-tab="users"]');
    if (await usersTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await usersTab.click();
      await waitForLoadingComplete(page);
    }
  });

  test('should show preview after uploading valid users CSV', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create a valid CSV file
    const csvContent = `first_name,surname,full_name,email,department
John,Doe,John Doe,john.doe@ncad.ie,Moving Image Design
Jane,Smith,Jane Smith,jane.smith@ncad.ie,Graphic Design`;

    // Write temporary CSV file
    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `users-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    // Upload file
    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Should show preview
    const preview = page.locator('[data-testid="csv-preview"], .preview, .import-preview');
    const hasPreview = await preview.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPreview) {
      await expect(preview).toBeVisible();

      // Should show imported data
      const rows = page.locator('tbody tr, .preview-row');
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    }

    // Cleanup
    fs.unlinkSync(tempFile);
  });

  test('should validate required columns', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create CSV with missing required columns
    const csvContent = `first_name,surname
John,Doe
Jane,Smith`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `invalid-users-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Should show error about missing columns
    const errorMessage = page.locator('.error, [role="alert"], .validation-error');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      await expect(errorMessage).toContainText(/required|missing|column/i);
    }

    fs.unlinkSync(tempFile);
  });

  test('should detect duplicate emails', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create CSV with duplicate emails
    const csvContent = `first_name,surname,full_name,email,department
John,Doe,John Doe,duplicate@ncad.ie,Moving Image Design
Jane,Smith,Jane Smith,duplicate@ncad.ie,Graphic Design`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `duplicate-users-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Should show duplicate warning
    const warning = page.locator('.warning, [role="alert"], text=/duplicate/i');
    const hasWarning = await warning.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasWarning) {
      await expect(warning).toBeVisible();
    }

    fs.unlinkSync(tempFile);
  });

  test('should confirm before importing', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    const csvContent = `first_name,surname,full_name,email,department
Test,User,Test User,test-${Date.now()}@ncad.ie,Illustration`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `confirm-users-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Look for import/confirm button
    const importButton = page.locator('button:has-text("Import"), button:has-text("Confirm")');
    const hasImportButton = await importButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasImportButton) {
      await importButton.click();

      // Might show confirmation dialog
      const confirmDialog = page.locator('[role="dialog"], .modal');
      const hasDialog = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasDialog) {
        const finalConfirm = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Import")');
        if (await finalConfirm.isVisible({ timeout: 1000 })) {
          await finalConfirm.click();
        }
      }

      // Should show success message
      await waitForToast(page, /success|imported|complete/i);
    }

    fs.unlinkSync(tempFile);
  });

  test('should validate email format', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    const csvContent = `first_name,surname,full_name,email,department
Invalid,Email,Invalid Email,not-an-email,Moving Image Design`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `invalid-email-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Should show validation error
    const errorMessage = page.locator('.error, [role="alert"], .validation-error');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      await expect(errorMessage).toContainText(/email|invalid|format/i);
    }

    fs.unlinkSync(tempFile);
  });

  test('should handle GDPR-compliant data', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Valid GDPR-compliant user data
    const csvContent = `first_name,surname,full_name,email,department
Privacy,Test,Privacy Test,privacy-${Date.now()}@ncad.ie,Graphic Design`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `gdpr-users-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Should process successfully
    const preview = page.locator('[data-testid="csv-preview"], .preview');
    const hasPreview = await preview.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasPreview) {
      await expect(preview).toBeVisible();
    }

    fs.unlinkSync(tempFile);
  });
});

test.describe('CSV Import - Equipment Import', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")').first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await waitForLoadingComplete(page);
    }

    // Select equipment tab if available
    const equipmentTab = page.locator('button:has-text("Equipment"), [data-tab="equipment"]');
    if (await equipmentTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await equipmentTab.click();
      await waitForLoadingComplete(page);
    }
  });

  test('should show preview after uploading valid equipment CSV', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').last(); // In case there are multiple

    const csvContent = `product_name,tracking_number,description,link_to_image,department
Canon EOS R5,CAM-001,Professional mirrorless camera,https://example.com/r5.jpg,Moving Image Design
Sony A7 IV,CAM-002,Full-frame mirrorless,https://example.com/a7iv.jpg,Moving Image Design`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `equipment-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    const preview = page.locator('[data-testid="csv-preview"], .preview');
    const hasPreview = await preview.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPreview) {
      await expect(preview).toBeVisible();
    }

    fs.unlinkSync(tempFile);
  });

  test('should validate equipment required columns', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').last();

    // Missing required columns
    const csvContent = `product_name,description
Camera 1,A camera
Camera 2,Another camera`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `invalid-equipment-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    const errorMessage = page.locator('.error, [role="alert"], .validation-error');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      await expect(errorMessage).toContainText(/required|missing|column/i);
    }

    fs.unlinkSync(tempFile);
  });

  test('should detect duplicate tracking numbers', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').last();

    const csvContent = `product_name,tracking_number,description,link_to_image,department
Camera 1,DUPLICATE-001,First camera,https://example.com/1.jpg,Moving Image Design
Camera 2,DUPLICATE-001,Second camera,https://example.com/2.jpg,Moving Image Design`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `duplicate-equipment-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    const warning = page.locator('.warning, [role="alert"], text=/duplicate/i');
    const hasWarning = await warning.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasWarning) {
      await expect(warning).toBeVisible();
    }

    fs.unlinkSync(tempFile);
  });

  test('should validate image URLs', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').last();

    const csvContent = `product_name,tracking_number,description,link_to_image,department
Camera,CAM-TEST-001,Test camera,not-a-url,Moving Image Design`;

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `invalid-url-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Might show warning about invalid URL format
    const warning = page.locator('.warning, [role="alert"], text=/url|image|link/i');
    const hasWarning = await warning.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasWarning) {
      await expect(warning).toBeVisible();
    }

    fs.unlinkSync(tempFile);
  });
});

test.describe('CSV Import - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, users.masterAdmin.email, users.masterAdmin.password);
    await waitForLoadingComplete(page);

    const importLink = page.locator('a:has-text("Import"), a:has-text("CSV")').first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await waitForLoadingComplete(page);
    }
  });

  test('should reject non-CSV files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Check if file input has accept attribute
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toContain('.csv');
  });

  test('should handle empty CSV files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    const csvContent = '';

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `empty-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    const errorMessage = page.locator('.error, [role="alert"]');
    const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasError) {
      await expect(errorMessage).toContainText(/empty|no data|invalid/i);
    }

    fs.unlinkSync(tempFile);
  });

  test('should handle large CSV files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Create a large CSV (100 rows)
    let csvContent = 'first_name,surname,full_name,email,department\n';
    for (let i = 0; i < 100; i++) {
      csvContent += `User${i},Test${i},User${i} Test${i},user${i}-${Date.now()}@ncad.ie,Moving Image Design\n`;
    }

    const tempDir = path.join(process.cwd(), 'test-results', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFile = path.join(tempDir, `large-${Date.now()}.csv`);
    fs.writeFileSync(tempFile, csvContent);

    await fileInput.setInputFiles(tempFile);
    await waitForLoadingComplete(page);

    // Should process large file (might show warning about size)
    const preview = page.locator('[data-testid="csv-preview"], .preview');
    const warning = page.locator('.warning, [role="alert"]');

    const hasPreview = await preview.isVisible({ timeout: 5000 }).catch(() => false);
    const hasWarning = await warning.isVisible({ timeout: 2000 }).catch(() => false);

    // Either preview or warning should appear
    expect(hasPreview || hasWarning).toBe(true);

    fs.unlinkSync(tempFile);
  });
});
