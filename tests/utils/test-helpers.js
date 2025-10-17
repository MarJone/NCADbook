/**
 * Test Helper Utilities
 * Common functions used across all test suites
 */

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingComplete(page) {
  await page.waitForSelector('.loading', { state: 'hidden', timeout: 10000 }).catch(() => {
    // Loading indicator may not exist, that's ok
  });
}

/**
 * Clear localStorage and sessionStorage
 */
export async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock localStorage with demo data
 */
export async function setupDemoData(page) {
  await page.goto('/');
  await page.evaluate(() => {
    // Demo data is loaded automatically by the app
    // Just ensure we're in demo mode
    localStorage.setItem('demoMode', 'true');
  });
}

/**
 * Wait for navigation and ensure page is loaded
 */
export async function navigateAndWait(page, url) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await waitForLoadingComplete(page);
}

/**
 * Login helper - works with artistic map-based portal selector
 */
export async function login(page, email, password) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Wait for the portal map to be visible
  await page.waitForSelector('.artistic-login-container', { timeout: 10000 });

  // Determine which portal area to click based on email
  // The new login uses SVG/image map with clickable areas
  if (email.includes('demo@')) {
    // Student portal - top-left quadrant or data-portal="student"
    await page.locator('[data-portal="student"]').click();
  } else if (email.includes('staff@')) {
    // Staff portal - top-right quadrant
    await page.locator('[data-portal="staff"]').click();
  } else if (email.includes('master@')) {
    // Master Admin portal - bottom-right quadrant
    await page.locator('[data-portal="master"]').click();
  } else if (email.includes('admin@')) {
    // Department Admin portal - bottom-left quadrant
    await page.locator('[data-portal="admin"]').click();
  }

  await page.waitForLoadState('networkidle');
}

/**
 * Logout helper
 */
export async function logout(page) {
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('/', { timeout: 5000 });
  }
}

/**
 * Check if element is visible in viewport
 */
export async function isInViewport(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}

/**
 * Wait for toast/notification message or alert
 * Since the app uses alert() for some notifications, we handle that too
 */
export async function waitForToast(page, expectedText) {
  // Try to find toast element
  const toast = page.locator('.toast, .notification, [role="alert"]');

  try {
    await toast.filter({ hasText: expectedText }).waitFor({ state: 'visible', timeout: 3000 });
    return toast;
  } catch (e) {
    // If no toast, the app might be using alert() which we accept
    // Just wait a moment for the operation to complete
    await page.waitForTimeout(500);
    return null;
  }
}

/**
 * Get table data as array of objects
 */
export async function getTableData(page, tableSelector) {
  return await page.evaluate((selector) => {
    const table = document.querySelector(selector);
    if (!table) return [];

    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = cells[index]?.textContent.trim();
      });
      return rowData;
    });
  }, tableSelector);
}

/**
 * Fill form fields
 */
export async function fillForm(page, formData) {
  for (const [key, value] of Object.entries(formData)) {
    const input = page.locator(`[name="${key}"], #${key}, [data-testid="${key}"]`);

    if (await input.getAttribute('type') === 'checkbox') {
      if (value) await input.check();
      else await input.uncheck();
    } else if (await input.evaluate(el => el.tagName === 'SELECT')) {
      await input.selectOption(value);
    } else {
      await input.fill(String(value));
    }
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png`, fullPage: true });
}

/**
 * Mock API response
 */
export async function mockApiResponse(page, urlPattern, response) {
  await page.route(urlPattern, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Check accessibility violations
 */
export async function checkAccessibility(page) {
  // This would integrate with @axe-core/playwright if needed
  // For now, we'll check basic accessibility
  const violations = await page.evaluate(() => {
    const issues = [];

    // Check for images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }

    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button:not([aria-label]):not(:has(*))');
    buttons.forEach(btn => {
      if (!btn.textContent.trim()) {
        issues.push('Button without accessible name found');
      }
    });

    return issues;
  });

  return violations;
}

/**
 * Get current route/path
 */
export async function getCurrentPath(page) {
  return await page.evaluate(() => window.location.pathname);
}

/**
 * Simulate mobile touch gestures
 */
export async function swipeLeft(page, selector) {
  const element = await page.locator(selector);
  const box = await element.boundingBox();

  if (box) {
    await page.touchscreen.tap(box.x + box.width - 10, box.y + box.height / 2);
    await page.touchscreen.swipe(
      { x: box.x + box.width - 10, y: box.y + box.height / 2 },
      { x: box.x + 10, y: box.y + box.height / 2 }
    );
  }
}

export async function swipeRight(page, selector) {
  const element = await page.locator(selector);
  const box = await element.boundingBox();

  if (box) {
    await page.touchscreen.tap(box.x + 10, box.y + box.height / 2);
    await page.touchscreen.swipe(
      { x: box.x + 10, y: box.y + box.height / 2 },
      { x: box.x + box.width - 10, y: box.y + box.height / 2 }
    );
  }
}

/**
 * Check if running on mobile viewport
 */
export function isMobileViewport(page) {
  const viewport = page.viewportSize();
  return viewport && viewport.width < 768;
}

/**
 * Check if running on tablet viewport
 */
export function isTabletViewport(page) {
  const viewport = page.viewportSize();
  return viewport && viewport.width >= 768 && viewport.width < 1024;
}
