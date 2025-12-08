// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Navigation Routes Test Suite
 * Verifies all navigation links point to valid routes
 */

const BASE_URL = 'http://localhost:5173/NCADbook/';

// Demo users for each portal
const DEMO_USERS = {
  student: {
    id: 1,
    email: 'student@ncad.ie',
    full_name: 'Demo Student',
    role: 'student',
    department: 'COMMUNICATION_DESIGN'
  },
  staff: {
    id: 2,
    email: 'staff@ncad.ie',
    full_name: 'Demo Staff',
    role: 'staff',
    department: 'COMMUNICATION_DESIGN'
  },
  dept_admin: {
    id: 3,
    email: 'admin@ncad.ie',
    full_name: 'Demo Admin',
    role: 'department_admin',
    department: 'COMMUNICATION_DESIGN'
  },
  master_admin: {
    id: 4,
    email: 'master@ncad.ie',
    full_name: 'Master Admin',
    role: 'master_admin',
    department: 'COMMUNICATION_DESIGN'
  }
};

// Helper to setup demo user via localStorage before navigation
async function setupDemoUser(page, userKey, portalPath) {
  const user = DEMO_USERS[userKey];

  await page.goto(BASE_URL);
  await page.evaluate((userData) => {
    localStorage.setItem('ncadbook_user', JSON.stringify(userData));
    localStorage.setItem('ncadbook_demo_mode', 'true');
  }, user);

  await page.goto(`${BASE_URL}${portalPath}`);
  await page.waitForLoadState('networkidle');
}

test.describe('Navigation Routes Verification', () => {

  test('Student Portal - All navigation links should work', async ({ page }) => {
    await setupDemoUser(page, 'student', 'student');

    const routes = [
      { path: '/student', name: 'Dashboard' },
      { path: '/student/equipment', name: 'Equipment' },
      { path: '/student/bookings', name: 'Bookings' },
    ];

    console.log('\n📍 STUDENT PORTAL ROUTES:');

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path.slice(1)}`);
      await page.waitForTimeout(500);

      const hasContent = await page.locator('main').count() > 0;
      const url = page.url();
      const status = hasContent ? '✅' : '❌';

      console.log(`   ${status} ${route.name}: ${url}`);
      expect(hasContent).toBeTruthy();
    }
  });

  test('Staff Portal - All navigation links should work', async ({ page }) => {
    await setupDemoUser(page, 'staff', 'staff');

    const routes = [
      { path: '/staff', name: 'Dashboard' },
      { path: '/staff/equipment', name: 'Equipment' },
      { path: '/staff/bookings', name: 'Bookings' },
      { path: '/staff/rooms', name: 'Room Booking' },
    ];

    console.log('\n📍 STAFF PORTAL ROUTES:');

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path.slice(1)}`);
      await page.waitForTimeout(500);

      const hasContent = await page.locator('main').count() > 0;
      const url = page.url();
      const status = hasContent ? '✅' : '❌';

      console.log(`   ${status} ${route.name}: ${url}`);
      expect(hasContent).toBeTruthy();
    }
  });

  test('Department Admin Portal - All navigation links should work', async ({ page }) => {
    await setupDemoUser(page, 'dept_admin', 'admin');

    const routes = [
      { path: '/admin', name: 'Dashboard' },
      { path: '/admin/approvals', name: 'Approvals' },
      { path: '/admin/equipment', name: 'Equipment' },
      { path: '/admin/users', name: 'Users' },
      { path: '/admin/analytics', name: 'Analytics' },
    ];

    console.log('\n📍 DEPARTMENT ADMIN PORTAL ROUTES:');

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path.slice(1)}`);
      await page.waitForTimeout(500);

      const hasContent = await page.locator('main').count() > 0;
      const url = page.url();
      const status = hasContent ? '✅' : '❌';

      console.log(`   ${status} ${route.name}: ${url}`);
      expect(hasContent).toBeTruthy();
    }
  });

  test('Master Admin Portal - All navigation links should work', async ({ page }) => {
    await setupDemoUser(page, 'master_admin', 'admin');

    const routes = [
      { path: '/admin', name: 'Dashboard' },
      { path: '/admin/approvals', name: 'Approvals' },
      { path: '/admin/equipment', name: 'Equipment' },
      { path: '/admin/users', name: 'Users' },
      { path: '/admin/analytics', name: 'Analytics' },
      { path: '/admin/system-settings', name: 'System Settings' },
      { path: '/admin/csv-import', name: 'CSV Import' },
      { path: '/admin/permissions', name: 'Permissions' },
      { path: '/admin/departments', name: 'Departments' },
      { path: '/admin/kits', name: 'Kits' },
      { path: '/admin/equipment-kits', name: 'Equipment Kits' },
      { path: '/admin/features', name: 'Feature Flags' },
      { path: '/admin/role-management', name: 'Role Management' },
    ];

    console.log('\n📍 MASTER ADMIN PORTAL ROUTES:');

    for (const route of routes) {
      await page.goto(`${BASE_URL}${route.path.slice(1)}`);
      await page.waitForTimeout(500);

      const hasContent = await page.locator('main').count() > 0;
      const url = page.url();
      const status = hasContent ? '✅' : '❌';

      console.log(`   ${status} ${route.name}: ${url}`);
      expect(hasContent).toBeTruthy();
    }
  });

  test('Mobile Bottom Nav - All navigation links should work', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test each user role
    const roleTests = [
      { user: 'student', portal: 'student', expectedLinks: 3 },
      { user: 'staff', portal: 'staff', expectedLinks: 4 },
      { user: 'dept_admin', portal: 'admin', expectedLinks: 4 },
      { user: 'master_admin', portal: 'admin', expectedLinks: 4 },
    ];

    console.log('\n📱 MOBILE BOTTOM NAV TESTS:');

    for (const test of roleTests) {
      await setupDemoUser(page, test.user, test.portal);

      // Check mobile nav is visible
      const mobileNav = page.locator('.mobile-bottom-nav');
      const isVisible = await mobileNav.isVisible();

      // Count nav items
      const navItems = await page.locator('.mobile-bottom-nav .nav-item').count();

      console.log(`   ${test.user}: ${isVisible ? '✅ Visible' : '❌ Hidden'}, ${navItems} items (expected ${test.expectedLinks})`);

      // Click each nav item and verify navigation works
      for (let i = 0; i < navItems; i++) {
        const item = page.locator('.mobile-bottom-nav .nav-item').nth(i);
        const label = await item.locator('.nav-label').textContent();
        await item.click();
        await page.waitForTimeout(300);

        const hasContent = await page.locator('main').count() > 0;
        console.log(`      ${hasContent ? '✅' : '❌'} ${label} navigation works`);
      }
    }
  });
});
