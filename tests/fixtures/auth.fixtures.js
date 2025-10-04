import { test as base } from '@playwright/test';

// Demo user credentials
export const users = {
  student: {
    email: 'demo@ncad.ie',
    password: 'demo123',
    role: 'student',
    name: 'Demo Student'
  },
  staff: {
    email: 'staff@ncad.ie',
    password: 'staff123',
    role: 'staff',
    name: 'Staff Member'
  },
  admin: {
    email: 'admin@ncad.ie',
    password: 'admin123',
    role: 'department_admin',
    name: 'Admin User'
  },
  masterAdmin: {
    email: 'master@ncad.ie',
    password: 'master123',
    role: 'master_admin',
    name: 'Master Admin'
  }
};

// Extended test with authenticated context
export const test = base.extend({
  // Authenticated page for student
  authenticatedStudentPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Student quick login button
    const studentButton = page.locator('button:has-text("Student")');
    await studentButton.waitFor({ state: 'visible', timeout: 10000 });
    await studentButton.click();
    await page.waitForURL(/\/student/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },

  // Authenticated page for staff
  authenticatedStaffPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Staff quick login button
    const staffButton = page.locator('button:has-text("Staff")');
    await staffButton.waitFor({ state: 'visible', timeout: 10000 });
    await staffButton.click();
    await page.waitForURL(/\/staff/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },

  // Authenticated page for admin
  authenticatedAdminPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Department Admin quick login button (use role-name to be specific)
    const adminButton = page.locator('.role-name:has-text("Department Admin")');
    await adminButton.waitFor({ state: 'visible', timeout: 10000 });
    await adminButton.click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },

  // Authenticated page for master admin
  authenticatedMasterAdminPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Master Admin quick login button
    const masterAdminButton = page.locator('.role-name:has-text("Master Admin")');
    await masterAdminButton.waitFor({ state: 'visible', timeout: 10000 });
    await masterAdminButton.click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },
});

export { expect } from '@playwright/test';
