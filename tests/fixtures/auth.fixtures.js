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
    role: 'general_admin',
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
    await page.goto('/');
    // Click on Student quick login button
    await page.click('button:has-text("Student")');
    await page.waitForURL(/\/student/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  // Authenticated page for staff
  authenticatedStaffPage: async ({ page }, use) => {
    await page.goto('/');
    // Click on Staff quick login button
    await page.click('button:has-text("Staff")');
    await page.waitForURL(/\/staff/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  // Authenticated page for admin
  authenticatedAdminPage: async ({ page }, use) => {
    await page.goto('/');
    // Click on Admin quick login button (use role-name to be specific)
    await page.click('.role-name:has-text("Admin")');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await use(page);
  },

  // Authenticated page for master admin
  authenticatedMasterAdminPage: async ({ page }, use) => {
    await page.goto('/');
    // Click on Master Admin quick login button
    await page.click('.role-name:has-text("Master Admin")');
    await page.waitForURL(/\/admin/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect } from '@playwright/test';
