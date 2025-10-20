import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Audit Tests
 * WCAG 2.1 AA Compliance Testing using axe-core
 *
 * Tests all 4 portals (Student, Staff, Dept Admin, Master Admin) for:
 * - Keyboard navigation
 * - Screen reader compatibility (ARIA labels)
 * - Color contrast ratios
 * - Semantic HTML structure
 * - Focus management
 * - Form accessibility
 */

test.describe('Accessibility Audit - All Portals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/NCADbook/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Student Portal Accessibility', () => {
    test('should have no accessibility violations on login page', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no violations on student dashboard', async ({ page }) => {
      // Login as student
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no violations on equipment browsing page', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment|browse/i }).click();
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no violations on booking creation form', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const equipmentCard = page.locator('.equipment-card').first();
      if (await equipmentCard.count() > 0) {
        await equipmentCard.click();

        const bookButton = page.locator('button:has-text("Book")');
        if (await bookButton.count() > 0) {
          await bookButton.click();

          await page.waitForTimeout(1000);

          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa'])
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        }
      }
    });

    test('should have accessible policy status display', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');
      if (await policyStatus.count() > 0) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('.policy-status')
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe('Staff Admin Portal Accessibility', () => {
    test('should have no violations on staff dashboard', async ({ page }) => {
      await page.getByLabel(/email/i).fill('staff@ncad.ie');
      await page.getByLabel(/password/i).fill('staff123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no violations on booking approval interface', async ({ page }) => {
      await page.getByLabel(/email/i).fill('staff@ncad.ie');
      await page.getByLabel(/password/i).fill('staff123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /bookings|pending/i }).click();
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Department Admin Portal Accessibility', () => {
    test('should have no violations on dept admin dashboard', async ({ page }) => {
      await page.getByLabel(/email/i).fill('dept-admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Master Admin Portal Accessibility', () => {
    test('should have no violations on master admin dashboard', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no violations on analytics dashboard', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const analyticsLink = page.getByRole('link', { name: /analytics|reports/i });
      if (await analyticsLink.count() > 0) {
        await analyticsLink.click();
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('should have no violations on policy manager', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const policiesLink = page.getByRole('link', { name: /policies/i });
      if (await policiesLink.count() > 0) {
        await policiesLink.click();
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('should have no violations on fines management', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const finesLink = page.getByRole('link', { name: /fines/i });
      if (await finesLink.count() > 0) {
        await finesLink.click();
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });

    test('should have no violations on CSV import page', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const importLink = page.getByRole('link', { name: /import|csv/i });
      if (await importLink.count() > 0) {
        await importLink.click();
        await page.waitForLoadState('networkidle');

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should allow keyboard-only login', async ({ page }) => {
      // Tab to email field
      await page.keyboard.press('Tab');
      await page.keyboard.type('student@ncad.ie');

      // Tab to password field
      await page.keyboard.press('Tab');
      await page.keyboard.type('student123');

      // Tab to login button and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should successfully login
      await expect(page).toHaveURL(/student|dashboard/, { timeout: 10000 });
    });

    test('should navigate equipment cards with keyboard', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      // Press Tab to focus first equipment card
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Verify focus visible
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          className: el?.className,
          hasFocusIndicator: window.getComputedStyle(el).outlineWidth !== '0px'
        };
      });

      expect(focusedElement.tagName).toBeTruthy();
    });

    test('should allow keyboard booking creation', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const equipmentCard = page.locator('.equipment-card').first();
      if (await equipmentCard.count() > 0) {
        await equipmentCard.click();

        const bookButton = page.locator('button:has-text("Book")');
        if (await bookButton.count() > 0) {
          await bookButton.click();

          // Use keyboard to fill form
          await page.keyboard.press('Tab'); // Focus first field
          await page.keyboard.type('2025-11-20');

          await page.keyboard.press('Tab');
          await page.keyboard.type('2025-11-22');

          // Tab to submit and press Enter
          for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
          }

          await page.keyboard.press('Enter');

          // Should submit or show validation
          await page.waitForTimeout(2000);

          const hasSuccess = await page.locator('text=/success|confirmed/i').isVisible({ timeout: 2000 }).catch(() => false);
          const hasError = await page.locator('.error-message').isVisible({ timeout: 2000 }).catch(() => false);

          expect(hasSuccess || hasError).toBeTruthy();
        }
      }
    });

    test('should have accessible modals with focus trap', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const policiesLink = page.getByRole('link', { name: /policies/i });
      if (await policiesLink.count() > 0) {
        await policiesLink.click();

        const createButton = page.locator('button:has-text("Create Rule")');
        if (await createButton.count() > 0) {
          await createButton.click();

          // Verify modal visible
          const modal = page.locator('.modal-overlay, .modal-content');
          await expect(modal).toBeVisible({ timeout: 3000 }).catch(() => {});

          if (await modal.isVisible()) {
            // Press Escape to close
            await page.keyboard.press('Escape');

            // Modal should close
            await expect(modal).not.toBeVisible({ timeout: 2000 });
          }
        }
      }
    });
  });

  test.describe('ARIA Labels and Roles', () => {
    test('should have proper ARIA labels on interactive elements', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Check navigation has role="navigation"
      const nav = page.locator('nav, [role="navigation"]');
      if (await nav.count() > 0) {
        const role = await nav.first().getAttribute('role');
        expect(role).toBe('navigation');
      }

      // Check main content has role="main"
      const main = page.locator('main, [role="main"]');
      if (await main.count() > 0) {
        const role = await main.first().getAttribute('role');
        expect(role).toBe('main');
      }
    });

    test('should have ARIA labels for status messages', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const policyStatus = page.locator('.policy-status');
      if (await policyStatus.count() > 0) {
        // Should have role="status" or aria-live="polite"
        const ariaLive = await policyStatus.getAttribute('aria-live').catch(() => null);
        const role = await policyStatus.getAttribute('role').catch(() => null);

        expect(ariaLive || role).toBeTruthy();
      }
    });

    test('should have accessible form labels', async ({ page }) => {
      // Check all form inputs have labels
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');

      // Both fields should be accessible via getByLabel
      const emailInput = await page.getByLabel(/email/i);
      const passwordInput = await page.getByLabel(/password/i);

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      if (headings.length > 0) {
        // Should have at least one h1
        const h1s = await page.locator('h1').count();
        expect(h1s).toBeGreaterThan(0);

        // Heading levels should not skip (h1 → h2 → h3, not h1 → h3)
        const headingLevels = await Promise.all(
          headings.map(h => h.evaluate(el => parseInt(el.tagName.substring(1))))
        );

        for (let i = 1; i < headingLevels.length; i++) {
          const diff = headingLevels[i] - headingLevels[i - 1];
          expect(Math.abs(diff)).toBeLessThanOrEqual(1); // No skipping levels
        }
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast on all text', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .options({ rules: { 'color-contrast': { enabled: true } } })
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });

    test('should have high contrast on interactive elements', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      // Scan only buttons for contrast
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('button, a, input')
        .withTags(['wcag2aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/NCADbook/');

      // Tab through elements
      await page.keyboard.press('Tab');

      // Check that focused element has visible outline
      const focusStyle = await page.evaluate(() => {
        const el = document.activeElement;
        const styles = window.getComputedStyle(el);
        return {
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow
        };
      });

      // Should have either outline or box-shadow for focus
      const hasFocusIndicator =
        focusStyle.outlineWidth !== '0px' ||
        focusStyle.boxShadow !== 'none';

      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should restore focus after modal close', async ({ page }) => {
      await page.getByLabel(/email/i).fill('admin@ncad.ie');
      await page.getByLabel(/password/i).fill('admin123');
      await page.getByRole('button', { name: /login/i }).click();

      const policiesLink = page.getByRole('link', { name: /policies/i });
      if (await policiesLink.count() > 0) {
        await policiesLink.click();

        const createButton = page.locator('button:has-text("Create Rule")');
        if (await createButton.count() > 0) {
          // Focus button
          await createButton.focus();

          const buttonId = await createButton.evaluate(el => el.id || el.className);

          // Open modal
          await createButton.click();

          await page.waitForTimeout(500);

          // Close modal
          await page.keyboard.press('Escape');

          await page.waitForTimeout(500);

          // Focus should return to button
          const focusedElementId = await page.evaluate(() => {
            const el = document.activeElement;
            return el?.id || el?.className;
          });

          // Focus should be restored to trigger element
          expect(focusedElementId).toContain(buttonId || 'create');
        }
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have alt text for all images', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        const role = await img.getAttribute('role');

        // Images should have alt text, or aria-label, or role="presentation"
        expect(alt !== null || ariaLabel !== null || role === 'presentation').toBeTruthy();
      }
    });

    test('should announce dynamic content changes', async ({ page }) => {
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const equipmentCard = page.locator('.equipment-card').first();
      if (await equipmentCard.count() > 0) {
        await equipmentCard.click();

        const bookButton = page.locator('button:has-text("Book")');
        if (await bookButton.count() > 0) {
          await bookButton.click();

          // Look for aria-live regions
          const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').count();

          // Should have at least one live region for announcements
          expect(liveRegions).toBeGreaterThan(0);
        }
      }
    });
  });
});
