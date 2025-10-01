const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testDir: './tests/integration'
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        // Enhanced mobile settings
        isMobile: true,
        hasTouch: true,
        locale: 'en-IE',
        timezoneId: 'Europe/Dublin'
      },
      testDir: './tests/mobile'
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        // iOS-specific settings
        isMobile: true,
        hasTouch: true,
        locale: 'en-IE',
        timezoneId: 'Europe/Dublin'
      },
      testDir: './tests/mobile'
    },
    {
      name: 'tablet-chrome',
      use: {
        ...devices['Galaxy Tab S4'],
        locale: 'en-IE',
        timezoneId: 'Europe/Dublin'
      },
      testDir: './tests/mobile'
    },
    {
      name: 'tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        locale: 'en-IE',
        timezoneId: 'Europe/Dublin'
      },
      testDir: './tests/mobile'
    },
    {
      name: 'mobile-landscape',
      use: {
        ...devices['iPhone 12 landscape'],
        locale: 'en-IE',
        timezoneId: 'Europe/Dublin'
      },
      testDir: './tests/mobile'
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  timeout: 30000,
  expect: {
    timeout: 5000
  },

  outputDir: 'test-results/artifacts'
});