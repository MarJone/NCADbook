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
    // Click on Student portal quadrant
    const studentPortal = page.locator('[data-portal="student"]');
    await studentPortal.waitFor({ state: 'visible', timeout: 10000 });
    await studentPortal.click();
    await page.waitForURL(/\/student/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },

  // Authenticated page for staff
  authenticatedStaffPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Staff portal quadrant
    const staffPortal = page.locator('[data-portal="staff"]');
    await staffPortal.waitFor({ state: 'visible', timeout: 10000 });
    await staffPortal.click();
    await page.waitForURL(/\/staff/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },

  // Authenticated page for admin
  authenticatedAdminPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Department Admin portal quadrant
    const adminPortal = page.locator('[data-portal="admin"]');
    await adminPortal.waitFor({ state: 'visible', timeout: 10000 });
    await adminPortal.click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },

  // Authenticated page for master admin
  authenticatedMasterAdminPage: async ({ page }, use) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 });
    // Click on Master Admin portal quadrant
    const masterAdminPortal = page.locator('[data-portal="master"]');
    await masterAdminPortal.waitFor({ state: 'visible', timeout: 10000 });
    await masterAdminPortal.click();
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await use(page);
  },
});

export { expect } from '@playwright/test';
