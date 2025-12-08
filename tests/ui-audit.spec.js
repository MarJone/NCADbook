// @ts-check
import { test, expect } from '@playwright/test';

/**
 * UI Audit Test Suite
 * Tests all portals for layout issues, navigation, and visual consistency
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
async function setupDemoUser(page, userKey) {
  const user = DEMO_USERS[userKey];

  // Navigate to base URL first to set localStorage
  await page.goto(BASE_URL);

  // Set localStorage
  await page.evaluate((userData) => {
    localStorage.setItem('ncadbook_user', JSON.stringify(userData));
  }, user);

  // Determine target path
  const targetPath = userKey === 'student' ? 'student' :
                     userKey === 'staff' ? 'staff' : 'admin';

  // Navigate to portal
  await page.goto(`${BASE_URL}${targetPath}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('UI Layout Audit', () => {

  test('Student Portal - Layout Analysis', async ({ page }) => {
    await setupDemoUser(page, 'student');

    // Screenshot
    await page.screenshot({ path: 'test-results/01-student-portal.png', fullPage: true });

    // Analyze structure
    const analysis = await page.evaluate(() => {
      const results = {
        // Header/Navigation
        portalHeader: document.querySelectorAll('.portal-header').length,
        megaMenu: document.querySelectorAll('.mega-menu, .mega-menu-nav, .mega-menu-container').length,
        oldStudentNav: document.querySelectorAll('.student-nav').length,
        allNavs: document.querySelectorAll('nav').length,
        headerElements: document.querySelectorAll('header').length,

        // Main content
        mainElement: document.querySelectorAll('main, .student-main').length,
        studentPortalClass: document.querySelectorAll('.student-portal').length,

        // AI Components
        aiFab: document.querySelectorAll('[class*="ai-assistant"], [class*="ai-fab"]').length,

        // Check what classes exist on body/root
        bodyClasses: document.body.className,
        rootClasses: document.getElementById('root')?.className || '',

        // All nav-related classes found
        navClasses: [...document.querySelectorAll('[class*="nav"]')].map(el => el.className).slice(0, 10)
      };
      return results;
    });

    console.log('\n📊 STUDENT PORTAL ANALYSIS:');
    console.log(JSON.stringify(analysis, null, 2));

    // Navigate to equipment
    await page.goto(`${BASE_URL}student/equipment`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/02-student-equipment.png', fullPage: true });
  });

  test('Staff Portal - Layout Analysis', async ({ page }) => {
    await setupDemoUser(page, 'staff');

    await page.screenshot({ path: 'test-results/03-staff-portal.png', fullPage: true });

    const analysis = await page.evaluate(() => {
      return {
        portalHeader: document.querySelectorAll('.portal-header').length,
        oldStaffNav: document.querySelectorAll('.staff-nav').length,
        allNavs: document.querySelectorAll('nav').length,
        mainElement: document.querySelectorAll('main, .staff-main').length,
        staffPortalClass: document.querySelectorAll('.staff-portal').length,
      };
    });

    console.log('\n📊 STAFF PORTAL ANALYSIS:');
    console.log(JSON.stringify(analysis, null, 2));
  });

  test('Department Admin Portal - Layout Analysis', async ({ page }) => {
    await setupDemoUser(page, 'dept_admin');

    await page.screenshot({ path: 'test-results/04-dept-admin-portal.png', fullPage: true });

    const analysis = await page.evaluate(() => {
      return {
        portalHeader: document.querySelectorAll('.portal-header').length,
        oldAdminNav: document.querySelectorAll('.admin-nav').length,
        allNavs: document.querySelectorAll('nav').length,
        mainElement: document.querySelectorAll('main, .admin-main').length,
        adminPortalClass: document.querySelectorAll('.admin-portal').length,
        masterAdminClass: document.querySelectorAll('.master-admin-portal').length,
        backgroundColor: getComputedStyle(document.querySelector('.admin-portal') || document.body).backgroundColor
      };
    });

    console.log('\n📊 DEPT ADMIN PORTAL ANALYSIS:');
    console.log(JSON.stringify(analysis, null, 2));
  });

  test('Master Admin Portal - Dark Theme Analysis', async ({ page }) => {
    await setupDemoUser(page, 'master_admin');

    await page.screenshot({ path: 'test-results/05-master-admin-portal.png', fullPage: true });

    const analysis = await page.evaluate(() => {
      const adminPortal = document.querySelector('.admin-portal');
      const computed = adminPortal ? getComputedStyle(adminPortal) : null;

      return {
        portalHeader: document.querySelectorAll('.portal-header').length,
        oldAdminNav: document.querySelectorAll('.admin-nav').length,
        allNavs: document.querySelectorAll('nav').length,
        adminPortalClass: document.querySelectorAll('.admin-portal').length,
        masterAdminClass: document.querySelectorAll('.master-admin-portal').length,
        backgroundColor: computed?.backgroundColor || 'N/A',
        color: computed?.color || 'N/A',
        dataTheme: adminPortal?.getAttribute('data-theme') || 'none'
      };
    });

    console.log('\n📊 MASTER ADMIN PORTAL ANALYSIS:');
    console.log(JSON.stringify(analysis, null, 2));

    // Check if dark theme is applied
    const isDark = analysis.backgroundColor.includes('10, 0, 6') ||
                   analysis.backgroundColor.includes('rgb(10, 0, 6)') ||
                   analysis.masterAdminClass > 0;
    console.log(`\n🌙 Dark Theme Applied: ${isDark ? '✅ YES' : '❌ NO'}`);

    // Navigate to other admin pages
    await page.goto(`${BASE_URL}admin/users`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/06-master-admin-users.png', fullPage: true });

    await page.goto(`${BASE_URL}admin/analytics`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/07-master-admin-analytics.png', fullPage: true });
  });

  test('COMPREHENSIVE AUDIT - All Portals', async ({ page }) => {
    const allResults = [];

    const configs = [
      { key: 'student', name: 'Student', path: 'student' },
      { key: 'staff', name: 'Staff', path: 'staff' },
      { key: 'dept_admin', name: 'Dept Admin', path: 'admin' },
      { key: 'master_admin', name: 'Master Admin', path: 'admin' }
    ];

    for (const config of configs) {
      await setupDemoUser(page, config.key);

      const result = await page.evaluate((portalName) => {
        const portal = document.querySelector('.student-portal, .staff-portal, .admin-portal');

        return {
          portal: portalName,
          // Structure checks
          hasPortalHeader: document.querySelectorAll('.portal-header').length > 0,
          hasMegaMenu: document.querySelectorAll('.mega-menu, .mega-menu-nav').length > 0,
          hasOldNav: document.querySelectorAll('.student-nav, .staff-nav, .admin-nav').length > 0,
          navCount: document.querySelectorAll('nav').length,
          hasMain: document.querySelectorAll('main').length > 0,
          hasAiFab: document.querySelectorAll('[class*="ai-assistant"]').length > 0,

          // Style checks
          bgColor: portal ? getComputedStyle(portal).backgroundColor : 'N/A',

          // Problems
          hasDuplicateNav: document.querySelectorAll('nav').length > 1 ||
                           document.querySelectorAll('.student-nav, .staff-nav, .admin-nav').length > 0
        };
      }, config.name);

      allResults.push(result);
    }

    console.log('\n\n========================================');
    console.log('        COMPREHENSIVE UI AUDIT          ');
    console.log('========================================\n');

    allResults.forEach(r => {
      console.log(`\n📋 ${r.portal}:`);
      console.log(`   Portal Header: ${r.hasPortalHeader ? '✅' : '❌'}`);
      console.log(`   Mega Menu: ${r.hasMegaMenu ? '✅' : '❌'}`);
      console.log(`   Old Nav (should be NO): ${r.hasOldNav ? '❌ FOUND' : '✅ None'}`);
      console.log(`   Nav Elements: ${r.navCount}`);
      console.log(`   Main Content: ${r.hasMain ? '✅' : '❌'}`);
      console.log(`   AI FAB: ${r.hasAiFab ? '✅' : '⚠️ Not found'}`);
      console.log(`   Background: ${r.bgColor}`);
      console.log(`   ⚠️ Duplicate Nav Issue: ${r.hasDuplicateNav ? '❌ YES' : '✅ NO'}`);
    });

    // Summary
    const issues = allResults.filter(r => r.hasDuplicateNav || !r.hasPortalHeader);
    console.log('\n\n========== SUMMARY ==========');
    if (issues.length > 0) {
      console.log('❌ ISSUES FOUND:');
      issues.forEach(i => {
        if (i.hasDuplicateNav) console.log(`   - ${i.portal}: Has duplicate/old navigation`);
        if (!i.hasPortalHeader) console.log(`   - ${i.portal}: Missing portal header`);
      });
    } else {
      console.log('✅ All portals pass structure checks!');
    }
  });

  test('MEGA MENU DROPDOWN - Verify light background on light theme portals', async ({ page }) => {
    // Test Staff portal mega menu dropdown
    await setupDemoUser(page, 'staff');

    // Wait for page to stabilize
    await page.waitForTimeout(1000);

    // Find a mega menu trigger (button with dropdown)
    const menuTrigger = page.locator('.mega-menu-trigger').first();

    if (await menuTrigger.count() > 0) {
      // Hover to open the dropdown
      await menuTrigger.hover();
      await page.waitForTimeout(500);

      // Check if dropdown is visible
      const dropdown = page.locator('.mega-menu-dropdown.visible');

      if (await dropdown.count() > 0) {
        // Get computed background color
        const bgColor = await dropdown.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });

        console.log('\n📊 MEGA MENU DROPDOWN STYLE:');
        console.log(`   Background Color: ${bgColor}`);

        // Should be light (white-ish), not dark
        // rgba(255, 255, 255, 0.95) or similar
        const isLight = bgColor.includes('255') || bgColor.includes('rgba(255');
        console.log(`   Theme Correct: ${isLight ? '✅ Light theme applied' : '❌ Dark theme incorrectly applied'}`);

        expect(isLight).toBeTruthy();
      } else {
        console.log('⚠️ No visible dropdown found after hover');
      }
    } else {
      console.log('⚠️ No mega menu triggers found');
    }
  });
});
