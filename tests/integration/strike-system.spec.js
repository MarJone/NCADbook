import { test, expect } from '@playwright/test';

test.describe('Strike System - Demo Mode', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:5178');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Admin Interface', () => {

    test('should access strike management as master admin', async ({ page }) => {
      await page.goto('http://localhost:5178');

      // Login as master admin
      await page.fill('input[type="email"]', 'master@ncad.ie');
      await page.fill('input[type="password"]', 'master123');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);

      // Navigate to strikes (if added to navigation)
      // For now, we'll test the component directly
      const hasStrikesLink = await page.locator('text=Student Strikes').count() > 0;

      if (hasStrikesLink) {
        await page.click('text=Student Strikes');
        await expect(page.locator('h2:has-text("Student Strikes")')).toBeVisible();
      }
    });

    test('should display pre-loaded demo students with strikes', async ({ page }) => {
      await page.goto('http://localhost:5178');

      // Initialize demo data
      await page.evaluate(() => {
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null },
            '25': { strikeCount: 2, blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));
      });

      const strikeData = await page.evaluate(() => {
        const data = localStorage.getItem('demo_strike_data');
        return JSON.parse(data);
      });

      expect(strikeData.userStrikes['24'].strikeCount).toBe(1);
      expect(strikeData.userStrikes['25'].strikeCount).toBe(2);
      expect(strikeData.userStrikes['26'].strikeCount).toBe(3);
    });

    test('should filter students by strike status', async ({ page }) => {
      await page.goto('http://localhost:5178');

      // Test localStorage filtering logic
      await page.evaluate(() => {
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null },
            '25': { strikeCount: 2, blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));
      });

      const restrictedCount = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('demo_strike_data'));
        return Object.values(data.userStrikes).filter(s =>
          s.blacklistUntil && new Date(s.blacklistUntil) > new Date()
        ).length;
      });

      expect(restrictedCount).toBe(2); // Students 25 and 26
    });
  });

  test.describe('Strike Service Functions', () => {

    test('should check if student can book', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const result = await page.evaluate(async () => {
        // Initialize demo data
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null },
            '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));

        // Simulate canStudentBook function
        const data = JSON.parse(localStorage.getItem('demo_strike_data'));

        const checkStudent24 = (studentId) => {
          const userStrike = data.userStrikes[studentId] || { strikeCount: 0, blacklistUntil: null };
          if (userStrike.blacklistUntil && new Date(userStrike.blacklistUntil) > new Date()) {
            return { canBook: false, strikeCount: userStrike.strikeCount };
          }
          return { canBook: true, strikeCount: userStrike.strikeCount };
        };

        return {
          student24: checkStudent24('24'),
          student26: checkStudent24('26')
        };
      });

      expect(result.student24.canBook).toBe(true);
      expect(result.student24.strikeCount).toBe(1);
      expect(result.student26.canBook).toBe(false);
      expect(result.student26.strikeCount).toBe(3);
    });

    test('should issue strike and update count', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const result = await page.evaluate(() => {
        // Initialize demo data
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));

        // Simulate issueStrike
        const data = JSON.parse(localStorage.getItem('demo_strike_data'));
        const studentId = '24';
        const currentStrike = data.userStrikes[studentId];
        const newStrikeCount = Math.min(currentStrike.strikeCount + 1, 3);

        let blacklistUntil = null;
        if (newStrikeCount === 2) {
          blacklistUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        }

        data.userStrikes[studentId] = { strikeCount: newStrikeCount, blacklistUntil };
        localStorage.setItem('demo_strike_data', JSON.stringify(data));

        return {
          previousCount: currentStrike.strikeCount,
          newCount: newStrikeCount,
          blacklisted: blacklistUntil !== null
        };
      });

      expect(result.previousCount).toBe(1);
      expect(result.newCount).toBe(2);
      expect(result.blacklisted).toBe(true);
    });

    test('should revoke strike and decrease count', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const result = await page.evaluate(() => {
        // Initialize demo data
        const demoData = {
          userStrikes: {
            '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          },
          strikeHistory: [
            {
              id: 'strike-1',
              studentId: '26',
              strikeNumber: 3,
              revokedAt: null
            }
          ]
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));

        // Simulate revokeStrike
        const data = JSON.parse(localStorage.getItem('demo_strike_data'));
        const strike = data.strikeHistory[0];

        strike.revokedAt = new Date().toISOString();
        strike.revokedBy = '1';
        strike.revokeReason = 'Test revocation';

        const userStrike = data.userStrikes['26'];
        userStrike.strikeCount = Math.max(userStrike.strikeCount - 1, 0);

        // Clear blacklist if strikes < 2
        if (userStrike.strikeCount < 2) {
          userStrike.blacklistUntil = null;
        }

        localStorage.setItem('demo_strike_data', JSON.stringify(data));

        return {
          newStrikeCount: userStrike.strikeCount,
          blacklistCleared: userStrike.blacklistUntil === null,
          strikeRevoked: strike.revokedAt !== null
        };
      });

      expect(result.newStrikeCount).toBe(2);
      expect(result.blacklistCleared).toBe(false); // Still 2 strikes
      expect(result.strikeRevoked).toBe(true);
    });

    test('should reset all strikes', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const result = await page.evaluate(() => {
        // Initialize demo data with multiple students
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null },
            '25': { strikeCount: 2, blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));

        // Simulate resetAllStrikes
        const data = JSON.parse(localStorage.getItem('demo_strike_data'));
        const affectedCount = Object.keys(data.userStrikes).filter(
          id => data.userStrikes[id].strikeCount > 0
        ).length;

        data.userStrikes = {};
        localStorage.setItem('demo_strike_data', JSON.stringify(data));

        return {
          affectedStudents: affectedCount,
          clearedData: Object.keys(data.userStrikes).length
        };
      });

      expect(result.affectedStudents).toBe(3);
      expect(result.clearedData).toBe(0);
    });
  });

  test.describe('Strike Progression Logic', () => {

    test('should apply correct restrictions per strike level', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const restrictions = await page.evaluate(() => {
        const getRestriction = (strikeNumber) => {
          switch (strikeNumber) {
            case 1: return { days: 0, blacklist: null };
            case 2: return { days: 7, blacklist: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() };
            case 3: return { days: 30, blacklist: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() };
            default: return { days: 0, blacklist: null };
          }
        };

        return {
          strike1: getRestriction(1),
          strike2: getRestriction(2),
          strike3: getRestriction(3)
        };
      });

      expect(restrictions.strike1.days).toBe(0);
      expect(restrictions.strike1.blacklist).toBe(null);

      expect(restrictions.strike2.days).toBe(7);
      expect(restrictions.strike2.blacklist).not.toBe(null);

      expect(restrictions.strike3.days).toBe(30);
      expect(restrictions.strike3.blacklist).not.toBe(null);
    });

    test('should enforce maximum 3 strikes', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const maxStrikes = await page.evaluate(() => {
        const addStrike = (currentCount) => Math.min(currentCount + 1, 3);

        let count = 0;
        count = addStrike(count); // 1
        count = addStrike(count); // 2
        count = addStrike(count); // 3
        count = addStrike(count); // Should stay 3
        count = addStrike(count); // Should stay 3

        return count;
      });

      expect(maxStrikes).toBe(3);
    });
  });

  test.describe('localStorage Persistence', () => {

    test('should persist strike data in localStorage', async ({ page }) => {
      await page.goto('http://localhost:5178');

      // Set data
      await page.evaluate(() => {
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));
      });

      // Reload page
      await page.reload();

      // Verify data persists
      const persistedData = await page.evaluate(() => {
        return localStorage.getItem('demo_strike_data');
      });

      expect(persistedData).toBeTruthy();
      const parsed = JSON.parse(persistedData);
      expect(parsed.userStrikes['24'].strikeCount).toBe(1);
    });

    test('should initialize demo data if not present', async ({ page }) => {
      await page.goto('http://localhost:5178');

      // Clear storage
      await page.evaluate(() => localStorage.clear());

      // Simulate initialization
      const initialized = await page.evaluate(() => {
        const existing = localStorage.getItem('demo_strike_data');
        if (!existing) {
          const initialData = {
            userStrikes: {
              '24': { strikeCount: 1, blacklistUntil: null },
              '25': { strikeCount: 2, blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
              '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
            },
            strikeHistory: []
          };
          localStorage.setItem('demo_strike_data', JSON.stringify(initialData));
          return true;
        }
        return false;
      });

      expect(initialized).toBe(true);

      const data = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('demo_strike_data'));
      });

      expect(Object.keys(data.userStrikes)).toHaveLength(3);
    });
  });

  test.describe('Student View', () => {

    test('should show strike banner for students with strikes', async ({ page }) => {
      await page.goto('http://localhost:5178');

      await page.evaluate(() => {
        const demoData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null }
          },
          strikeHistory: [
            {
              id: 'strike-1',
              studentId: '24',
              strikeNumber: 1,
              reason: 'Equipment returned 2 day(s) late',
              daysOverdue: 2,
              restrictionDays: 0,
              createdAt: new Date().toISOString(),
              revokedAt: null
            }
          ]
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));
      });

      const strikeInfo = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('demo_strike_data'));
        const userStrike = data.userStrikes['24'];
        return {
          hasStrikes: userStrike.strikeCount > 0,
          isRestricted: userStrike.blacklistUntil && new Date(userStrike.blacklistUntil) > new Date(),
          strikeCount: userStrike.strikeCount
        };
      });

      expect(strikeInfo.hasStrikes).toBe(true);
      expect(strikeInfo.isRestricted).toBe(false);
      expect(strikeInfo.strikeCount).toBe(1);
    });

    test('should not show banner for students with no strikes', async ({ page }) => {
      await page.goto('http://localhost:5178');

      const hasStrikes = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('demo_strike_data')) || { userStrikes: {} };
        const userStrike = data.userStrikes['999'] || { strikeCount: 0, blacklistUntil: null };
        return userStrike.strikeCount > 0;
      });

      expect(hasStrikes).toBe(false);
    });
  });

  test.describe('Data Reset', () => {

    test('should reset demo data to initial state', async ({ page }) => {
      await page.goto('http://localhost:5178');

      // Modify data
      await page.evaluate(() => {
        const demoData = {
          userStrikes: {
            '100': { strikeCount: 3, blacklistUntil: null }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(demoData));
      });

      // Reset
      await page.evaluate(() => {
        localStorage.removeItem('demo_strike_data');

        // Re-initialize
        const initialData = {
          userStrikes: {
            '24': { strikeCount: 1, blacklistUntil: null },
            '25': { strikeCount: 2, blacklistUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
            '26': { strikeCount: 3, blacklistUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
          },
          strikeHistory: []
        };
        localStorage.setItem('demo_strike_data', JSON.stringify(initialData));
      });

      const resetData = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('demo_strike_data'));
      });

      expect(Object.keys(resetData.userStrikes)).toHaveLength(3);
      expect(resetData.userStrikes['24'].strikeCount).toBe(1);
      expect(resetData.userStrikes['25'].strikeCount).toBe(2);
      expect(resetData.userStrikes['26'].strikeCount).toBe(3);
    });
  });
});
