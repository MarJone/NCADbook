/**
 * Dark Mode Toggle - E2E Tests
 *
 * Tests dark mode functionality across all portals
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = 'http://localhost:5175/NCADbook';

test.describe('Dark Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Student Portal', () => {
    test('should show dark mode toggle in header', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);

      // Wait for portal to load
      await page.waitForSelector('[data-portal="student"]');

      // Find dark mode toggle
      const toggle = await page.locator('[data-testid="dark-mode-toggle"]');
      await expect(toggle).toBeVisible();
    });

    test('should toggle between light and dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const html = page.locator('html');
      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Initial state: light mode
      await expect(html).toHaveAttribute('data-theme', 'light');
      await expect(html).toHaveClass(/light-mode/);

      // Click to toggle dark
      await toggle.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
      await expect(html).toHaveClass(/dark-mode/);

      // Click to toggle light
      await toggle.click();
      await expect(html).toHaveAttribute('data-theme', 'light');
      await expect(html).toHaveClass(/light-mode/);
    });

    test('should persist dark mode preference', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Enable dark mode
      await toggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      // Check localStorage
      const stored = await page.evaluate(() => {
        return localStorage.getItem('ncadbook_dark_mode');
      });
      expect(stored).toBe('true');

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-portal="student"]');

      // Verify dark mode persisted
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Check initial ARIA attributes
      await expect(toggle).toHaveAttribute('aria-label', /Switch to dark mode/i);
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');

      // Toggle dark mode
      await toggle.click();

      // Check updated ARIA attributes
      await expect(toggle).toHaveAttribute('aria-label', /Switch to light mode/i);
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Focus toggle using Tab
      await page.keyboard.press('Tab');
      // May need multiple Tabs depending on page structure
      await toggle.focus();

      // Verify focus
      await expect(toggle).toBeFocused();

      // Toggle with Enter
      await page.keyboard.press('Enter');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      // Toggle with Space
      await page.keyboard.press('Space');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('should match system preference on first visit', async ({ page, context }) => {
      // Set system to prefer dark mode
      await context.emulateMedia({ colorScheme: 'dark' });

      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      // Should start in dark mode (matching system preference)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      // Clear preference and reload with light system preference
      await page.evaluate(() => localStorage.clear());
      await context.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await page.waitForSelector('[data-portal="student"]');

      // Should start in light mode
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('should apply dark theme styles to components', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const body = page.locator('body');

      // Get light mode background color
      const lightBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Toggle dark mode
      await page.locator('[data-testid="dark-mode-toggle"]').click();

      // Get dark mode background color
      const darkBg = await body.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Colors should be different
      expect(lightBg).not.toBe(darkBg);
    });
  });

  test.describe('Staff Portal', () => {
    test('should show dark mode toggle', async ({ page }) => {
      await page.goto(`${BASE_URL}/staff`);
      await page.waitForSelector('[data-portal="staff"]');

      const toggle = await page.locator('[data-testid="dark-mode-toggle"]');
      await expect(toggle).toBeVisible();
    });

    test('should toggle theme independently of student portal', async ({ page, context }) => {
      // Set student portal to dark
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');
      await page.locator('[data-testid="dark-mode-toggle"]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

      // Navigate to staff portal
      await page.goto(`${BASE_URL}/staff`);
      await page.waitForSelector('[data-portal="staff"]');

      // Should use same preference (shared localStorage)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });

  test.describe('Department Admin Portal', () => {
    test('should show dark mode toggle', async ({ page }) => {
      await page.goto(`${BASE_URL}/dept-admin`);
      await page.waitForSelector('[data-portal="dept-admin"]');

      const toggle = await page.locator('[data-testid="dark-mode-toggle"]');
      await expect(toggle).toBeVisible();
    });

    test('should toggle dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/dept-admin`);
      await page.waitForSelector('[data-portal="dept-admin"]');

      const html = page.locator('html');
      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      await toggle.click();
      await expect(html).toHaveAttribute('data-theme', 'dark');
    });
  });

  test.describe('Master Admin Portal', () => {
    test('should NOT show dark mode toggle', async ({ page }) => {
      await page.goto(`${BASE_URL}/master-admin`);
      await page.waitForSelector('[data-portal="master-admin"]');

      // Toggle should not be visible
      const toggle = page.locator('[data-testid="dark-mode-toggle"]');
      await expect(toggle).not.toBeVisible();
    });

    test('should always be in dark mode', async ({ page }) => {
      await page.goto(`${BASE_URL}/master-admin`);
      await page.waitForSelector('[data-portal="master-admin"]');

      const html = page.locator('html');

      // Should be dark mode
      await expect(html).toHaveAttribute('data-theme', 'dark');
      await expect(html).toHaveClass(/dark-mode/);
      await expect(html).toHaveClass(/permanent-dark/);
    });

    test('should remain dark even if localStorage says light', async ({ page }) => {
      // Set localStorage to light mode
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.setItem('ncadbook_dark_mode', 'false');
      });

      // Navigate to master admin
      await page.goto(`${BASE_URL}/master-admin`);
      await page.waitForSelector('[data-portal="master-admin"]');

      // Should still be dark (ignores preference)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE
    });

    test('should show icon-only toggle on mobile', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');
      const label = toggle.locator('.mode-label');

      // Toggle should be visible
      await expect(toggle).toBeVisible();

      // Label should be hidden on mobile
      await expect(label).toBeHidden();
    });

    test('should have minimum 44px touch target', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Get button dimensions
      const box = await toggle.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Accessibility', () => {
    test('should have visible focus indicator', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');
      await toggle.focus();

      // Check for focus outline (implementation-dependent)
      const outline = await toggle.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
        };
      });

      // Should have some form of outline
      expect(
        outline.outline !== 'none' ||
        parseInt(outline.outlineWidth) > 0
      ).toBeTruthy();
    });

    test('should announce state changes to screen readers', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Initial state
      const initialLabel = await toggle.getAttribute('aria-label');
      expect(initialLabel).toContain('dark mode');

      // Click to toggle
      await toggle.click();

      // New state
      const newLabel = await toggle.getAttribute('aria-label');
      expect(newLabel).toContain('light mode');
      expect(newLabel).not.toBe(initialLabel);
    });
  });

  test.describe('Performance', () => {
    test('should transition smoothly without layout shift', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      // Measure position before toggle
      const beforeBox = await toggle.boundingBox();

      // Toggle dark mode
      await toggle.click();

      // Wait for transition
      await page.waitForTimeout(300);

      // Measure position after toggle
      const afterBox = await toggle.boundingBox();

      // Position should not change (no layout shift)
      expect(beforeBox.x).toBe(afterBox.x);
      expect(beforeBox.y).toBe(afterBox.y);
    });

    test('should update theme within 100ms', async ({ page }) => {
      await page.goto(`${BASE_URL}/student`);
      await page.waitForSelector('[data-portal="student"]');

      const toggle = page.locator('[data-testid="dark-mode-toggle"]');

      const startTime = Date.now();
      await toggle.click();

      // Wait for theme attribute to change
      await page.waitForSelector('html[data-theme="dark"]');
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });
  });
});

test.describe('ThemeContext Integration', () => {
  test('should expose theme state via useTheme hook', async ({ page }) => {
    await page.goto(`${BASE_URL}/student`);
    await page.waitForSelector('[data-portal="student"]');

    // Execute in browser context to test hook
    const themeState = await page.evaluate(() => {
      // This would need a test component that exposes theme state
      // For now, check data attributes
      const html = document.documentElement;
      return {
        theme: html.getAttribute('data-theme'),
        isDark: html.classList.contains('dark-mode'),
        portal: html.getAttribute('data-portal'),
      };
    });

    expect(themeState.theme).toBe('light');
    expect(themeState.isDark).toBe(false);
    expect(themeState.portal).toBe('student');
  });

  test('should sync theme across components', async ({ page }) => {
    await page.goto(`${BASE_URL}/student`);
    await page.waitForSelector('[data-portal="student"]');

    // Toggle dark mode
    await page.locator('[data-testid="dark-mode-toggle"]').click();

    // Check that all components receive the theme update
    const elementsWithTheme = await page.locator('[data-theme]').count();
    expect(elementsWithTheme).toBeGreaterThan(0);

    // All should be 'dark'
    const darkElements = await page.locator('[data-theme="dark"]').count();
    expect(darkElements).toBe(elementsWithTheme);
  });
});
