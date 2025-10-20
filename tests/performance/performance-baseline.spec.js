import { test, expect } from '@playwright/test';

/**
 * Performance Baseline Tests
 * Measures page load times, bundle sizes, and performance metrics
 * Baseline established before UX overhaul for comparison
 */

const PERFORMANCE_THRESHOLDS = {
  pageLoadTime: 3000, // 3 seconds max
  firstContentfulPaint: 2000, // 2 seconds max
  timeToInteractive: 4000, // 4 seconds max
  bundleSize: 2 * 1024 * 1024, // 2MB max
  imageOptimization: 500 * 1024, // 500KB max per image
};

test.describe('Performance Baseline Measurements', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cache to get fresh measurements
    await page.context().clearCookies();
  });

  test.describe('Page Load Performance', () => {
    test('should measure login page load time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/NCADbook/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`Login page load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoadTime);

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          responseTime: perf.responseEnd - perf.requestStart
        };
      });

      console.log('Performance metrics:', metrics);
    });

    test('should measure student dashboard load time', async ({ page }) => {
      // Login first
      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`Student dashboard load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoadTime);
    });

    test('should measure equipment browsing page load time', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      const startTime = Date.now();
      await page.getByRole('link', { name: /equipment/i }).click();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      console.log(`Equipment page load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoadTime);
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should measure FCP (First Contentful Paint)', async ({ page }) => {
      await page.goto('/NCADbook/');

      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
              observer.disconnect();
            }
          });
          observer.observe({ entryTypes: ['paint'] });

          // Fallback timeout
          setTimeout(() => resolve(null), 5000);
        });
      });

      console.log(`First Contentful Paint: ${fcp}ms`);

      if (fcp !== null) {
        expect(fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.firstContentfulPaint);
      }
    });

    test('should measure LCP (Largest Contentful Paint)', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.waitForLoadState('networkidle');

      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          // Fallback timeout
          setTimeout(() => {
            observer.disconnect();
            resolve(null);
          }, 5000);
        });
      });

      console.log(`Largest Contentful Paint: ${lcp}ms`);

      if (lcp !== null) {
        expect(lcp).toBeLessThan(3000); // 3 seconds max for LCP
      }
    });

    test('should measure TTI (Time to Interactive)', async ({ page }) => {
      await page.goto('/NCADbook/');

      const tti = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Simplified TTI - when page is interactive
          if (document.readyState === 'complete') {
            const navTiming = performance.getEntriesByType('navigation')[0];
            resolve(navTiming.domInteractive);
          } else {
            window.addEventListener('load', () => {
              const navTiming = performance.getEntriesByType('navigation')[0];
              resolve(navTiming.domInteractive);
            });
          }
        });
      });

      console.log(`Time to Interactive: ${tti}ms`);

      expect(tti).toBeLessThan(PERFORMANCE_THRESHOLDS.timeToInteractive);
    });
  });

  test.describe('Resource Loading', () => {
    test('should measure total bundle size', async ({ page }) => {
      const resources = [];

      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('/NCADbook/') && !url.includes('hot-update')) {
          try {
            const size = parseInt(response.headers()['content-length'] || '0');
            const type = response.headers()['content-type'] || '';

            resources.push({
              url: url.split('/').pop(),
              size,
              type: type.split(';')[0]
            });
          } catch (e) {
            // Ignore errors
          }
        }
      });

      await page.goto('/NCADbook/');
      await page.waitForLoadState('networkidle');

      const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
      const jsSize = resources.filter(r => r.type.includes('javascript')).reduce((sum, r) => sum + r.size, 0);
      const cssSize = resources.filter(r => r.type.includes('css')).reduce((sum, r) => sum + r.size, 0);
      const imageSize = resources.filter(r => r.type.includes('image')).reduce((sum, r) => sum + r.size, 0);

      console.log('Bundle sizes:');
      console.log(`Total: ${(totalSize / 1024).toFixed(2)} KB`);
      console.log(`JavaScript: ${(jsSize / 1024).toFixed(2)} KB`);
      console.log(`CSS: ${(cssSize / 1024).toFixed(2)} KB`);
      console.log(`Images: ${(imageSize / 1024).toFixed(2)} KB`);

      expect(totalSize).toBeLessThan(PERFORMANCE_THRESHOLDS.bundleSize);
    });

    test('should verify lazy loading of images', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();

      let lazyLoadedCount = 0;

      for (const img of images) {
        const loading = await img.getAttribute('loading');
        if (loading === 'lazy') {
          lazyLoadedCount++;
        }
      }

      console.log(`Lazy-loaded images: ${lazyLoadedCount}/${images.length}`);

      // At least 50% of images should be lazy-loaded
      expect(lazyLoadedCount).toBeGreaterThan(images.length * 0.5);
    });

    test('should verify no render-blocking resources', async ({ page }) => {
      await page.goto('/NCADbook/');

      const renderBlockingResources = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

        const blocking = [];

        scripts.forEach(script => {
          if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
            blocking.push({
              type: 'script',
              src: script.src
            });
          }
        });

        links.forEach(link => {
          if (link.media !== 'print') {
            blocking.push({
              type: 'stylesheet',
              href: link.href
            });
          }
        });

        return blocking;
      });

      console.log('Render-blocking resources:', renderBlockingResources.length);

      // Should minimize render-blocking resources
      expect(renderBlockingResources.length).toBeLessThan(5);
    });
  });

  test.describe('3G Network Simulation', () => {
    test('should load within acceptable time on 3G', async ({ page, context }) => {
      // Simulate 3G network
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
        uploadThroughput: (750 * 1024) / 8, // 750 Kbps
        latency: 150 // 150ms RTT
      });

      const startTime = Date.now();

      await page.goto('/NCADbook/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      console.log(`3G load time: ${loadTime}ms`);

      // Should load within 5 seconds on 3G
      expect(loadTime).toBeLessThan(5000);
    });

    test('should be usable on 3G after initial load', async ({ page }) => {
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (1.6 * 1024 * 1024) / 8,
        uploadThroughput: (750 * 1024) / 8,
        latency: 150
      });

      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');

      const loginStart = Date.now();
      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForLoadState('networkidle');
      const loginTime = Date.now() - loginStart;

      console.log(`3G login time: ${loginTime}ms`);

      // Login should complete within 3 seconds
      expect(loginTime).toBeLessThan(3000);
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have memory leaks on navigation', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return null;
      });

      // Navigate through several pages
      for (let i = 0; i < 5; i++) {
        await page.getByRole('link', { name: /equipment/i }).click();
        await page.waitForTimeout(500);

        await page.getByRole('link', { name: /bookings|my bookings/i }).click();
        await page.waitForTimeout(500);
      }

      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return null;
      });

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        const increasePercentage = (memoryIncrease / initialMemory) * 100;

        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${increasePercentage.toFixed(1)}%)`);

        // Memory should not increase by more than 50% after repeated navigation
        expect(increasePercentage).toBeLessThan(50);
      }
    });
  });

  test.describe('Interaction Performance', () => {
    test('should have fast search/filter response', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

      if (await searchInput.count() > 0) {
        const startTime = Date.now();

        await searchInput.fill('camera');
        await page.waitForTimeout(400); // Debounce time

        const responseTime = Date.now() - startTime;

        console.log(`Search response time: ${responseTime}ms`);

        // Search should respond within 500ms (including debounce)
        expect(responseTime).toBeLessThan(500);
      }
    });

    test('should have smooth animations (no jank)', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.getByLabel(/email/i).fill('student@ncad.ie');
      await page.getByLabel(/password/i).fill('student123');
      await page.getByRole('button', { name: /login/i }).click();

      await page.getByRole('link', { name: /equipment/i }).click();

      // Measure frame rate during interaction
      const equipmentCard = page.locator('.equipment-card').first();

      if (await equipmentCard.count() > 0) {
        await equipmentCard.hover();

        const fps = await page.evaluate(() => {
          return new Promise((resolve) => {
            let frames = 0;
            const startTime = performance.now();

            const countFrames = () => {
              frames++;
              const elapsed = performance.now() - startTime;

              if (elapsed < 1000) {
                requestAnimationFrame(countFrames);
              } else {
                resolve(frames);
              }
            };

            requestAnimationFrame(countFrames);
          });
        });

        console.log(`Frame rate: ${fps} FPS`);

        // Should achieve at least 30 FPS
        expect(fps).toBeGreaterThan(30);
      }
    });
  });

  test.describe('Bundle Optimization Checks', () => {
    test('should have gzip/brotli compression enabled', async ({ page }) => {
      const compressionHeaders = [];

      page.on('response', (response) => {
        const encoding = response.headers()['content-encoding'];
        if (encoding) {
          compressionHeaders.push({
            url: response.url().split('/').pop(),
            encoding
          });
        }
      });

      await page.goto('/NCADbook/');
      await page.waitForLoadState('networkidle');

      console.log('Compression headers:', compressionHeaders);

      // At least some resources should be compressed
      expect(compressionHeaders.length).toBeGreaterThan(0);
    });

    test('should have efficient CSS (no unused rules)', async ({ page }) => {
      await page.goto('/NCADbook/');
      await page.waitForLoadState('networkidle');

      const cssStats = await page.evaluate(() => {
        const sheets = Array.from(document.styleSheets);
        let totalRules = 0;
        let usedRules = 0;

        sheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            totalRules += rules.length;

            rules.forEach(rule => {
              if (rule.selectorText) {
                if (document.querySelector(rule.selectorText)) {
                  usedRules++;
                }
              }
            });
          } catch (e) {
            // Cross-origin stylesheet, skip
          }
        });

        return {
          totalRules,
          usedRules,
          usagePercentage: (usedRules / totalRules) * 100
        };
      });

      console.log('CSS stats:', cssStats);

      // At least 60% of CSS rules should be used
      expect(cssStats.usagePercentage).toBeGreaterThan(60);
    });
  });
});
