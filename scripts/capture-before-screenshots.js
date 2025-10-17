/**
 * Capture "before" screenshots for style guide alignment audit
 * Run with: node scripts/capture-before-screenshots.js
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173/NCADbook/';
const OUTPUT_DIR = path.join(__dirname, '..', 'review', 'before-alignment');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 }
];

const pages = [
  { name: 'home', path: '', description: 'Landing page (Login)', waitFor: 'body', extraWait: 2000, user: null },
  {
    name: 'student-portal',
    path: 'student',
    description: 'Student Portal',
    waitFor: '.quick-actions',
    extraWait: 3000,
    user: { id: 1, email: 'student@ncad.ie', full_name: 'Test Student', role: 'student', department: 'Moving Image Design' }
  },
  {
    name: 'staff-portal',
    path: 'staff',
    description: 'Staff Portal',
    waitFor: '.staff-stat-card, .staff-quick-actions',
    extraWait: 8000,
    user: { id: 2, email: 'staff@ncad.ie', full_name: 'Test Staff', role: 'staff', department: 'Moving Image Design' }
  },
  {
    name: 'dept-admin-portal',
    path: 'admin',
    description: 'Department Admin Portal',
    waitFor: '.quick-actions',
    extraWait: 4000,
    user: { id: 3, email: 'dept.admin@ncad.ie', full_name: 'Test Dept Admin', role: 'department_admin', department: 'Moving Image Design' }
  },
  {
    name: 'master-admin-portal',
    path: 'admin',
    description: 'Master Admin Portal',
    waitFor: '.quick-actions',
    extraWait: 4000,
    user: { id: 4, email: 'master.admin@ncad.ie', full_name: 'Test Master Admin', role: 'master_admin', department: null }
  },
];

async function captureScreenshots() {
  console.log('🎬 Starting screenshot capture...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const pageConfig of pages) {
    console.log(`📄 Capturing: ${pageConfig.description}`);

    try {
      // Set localStorage with user data if this is a protected route
      if (pageConfig.user) {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await page.evaluate((user) => {
          localStorage.setItem('ncadbook_user', JSON.stringify(user));
        }, pageConfig.user);
        console.log(`  🔐 Injected user: ${pageConfig.user.role}`);
      }

      await page.goto(`${BASE_URL}${pageConfig.path}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      // Wait for specific content to ensure routing completed
      if (pageConfig.waitFor) {
        try {
          await page.waitForSelector(pageConfig.waitFor, { timeout: 6000 });
        } catch (e) {
          console.log(`  ⚠️  Selector "${pageConfig.waitFor}" not found, continuing anyway...`);
        }
      }

      // Extra wait for API calls to complete and animations to settle
      await page.waitForTimeout(pageConfig.extraWait || 2000);

      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height
        });

        // Wait for viewport change to take effect
        await page.waitForTimeout(500);

        const filename = `${pageConfig.name}-${viewport.name}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        await page.screenshot({
          path: filepath,
          fullPage: true
        });

        console.log(`  ✅ ${viewport.name}: ${filename}`);
      }

      console.log('');
    } catch (error) {
      console.error(`  ❌ Error capturing ${pageConfig.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('✨ Screenshot capture complete!');
  console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}\n`);
}

captureScreenshots().catch(console.error);
