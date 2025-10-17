# Playwright MCP Setup for Visual Development

## Installation

### 1. Install Playwright MCP

Add to your Claude Code MCP configuration:

```bash
# Single-line installation command
npx @microsoft/playwright-mcp install
```

### 2. Configure MCP Settings

Add to your MCP configuration file (`~/.config/claude/mcp.json` or equivalent):

```json
{
  "mcps": {
    "playwright": {
      "command": "npx",
      "args": ["@microsoft/playwright-mcp"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium",
        "PLAYWRIGHT_HEADED": "true"
      }
    }
  }
}
```

## Configuration Options

### Browser Selection
```json
"PLAYWRIGHT_BROWSER": "chromium"  // or "firefox" or "webkit"
```

### Display Mode
```json
"PLAYWRIGHT_HEADED": "true"   // See browser window
"PLAYWRIGHT_HEADED": "false"  // Headless mode (faster)
```

### Device Emulation
```json
"PLAYWRIGHT_DEVICE": "iPhone 15"  // Optional device emulation
```

## Viewport Presets for Testing

Use these viewport sizes for responsive testing:

### Desktop
```javascript
await page.setViewportSize({ width: 1440, height: 900 });
```

### Tablet
```javascript
await page.setViewportSize({ width: 768, height: 1024 });
```

### Mobile
```javascript
await page.setViewportSize({ width: 375, height: 667 });
```

## Common Playwright Commands

### Navigation
```javascript
// Navigate to local development server
await page.goto('http://localhost:3000');

// Navigate to specific route
await page.goto('http://localhost:3000/equipment/search');

// Wait for page to fully load
await page.waitForLoadState('networkidle');
```

### Screenshots
```javascript
// Full page screenshot
await page.screenshot({ path: 'screenshots/full-page.png', fullPage: true });

// Element screenshot
const element = await page.locator('.equipment-card').first();
await element.screenshot({ path: 'screenshots/equipment-card.png' });

// Screenshot with specific viewport
await page.setViewportSize({ width: 375, height: 667 });
await page.screenshot({ path: 'screenshots/mobile-view.png' });
```

### Element Interaction
```javascript
// Click button
await page.click('button:has-text("Reserve Time Slot")');

// Fill input
await page.fill('input[name="search"]', 'Canon EOS R5');

// Select dropdown
await page.selectOption('select#category', 'cameras');

// Check checkbox
await page.check('input[type="checkbox"]#accept-terms');

// Hover over element
await page.hover('.equipment-card');
```

## Visual Development Workflow

### Standard Workflow Pattern

1. **Make Code Changes**
2. **Navigate in Browser**
   ```javascript
   await page.goto('http://localhost:3000/equipment/search');
   await page.waitForLoadState('networkidle');
   ```
3. **Take Screenshot**
   ```javascript
   await page.screenshot({ 
     path: 'review/current-state.png',
     fullPage: true 
   });
   ```
4. **Compare to Reference**
5. **Iterate**

### Example: Iterative Component Refinement

```javascript
// Step 1: Navigate to component
await page.goto('http://localhost:3000/equipment/CAM-001');

// Step 2: Take initial screenshot
await page.screenshot({ path: 'iterations/v1-equipment-card.png' });

// Step 3: Check against style guide
// (Claude analyzes: spacing off by 8px, border radius should be 0.5rem)

// Step 4: Make code changes
// (Developer updates component styles)

// Step 5: Refresh and screenshot again
await page.reload();
await page.screenshot({ path: 'iterations/v2-equipment-card.png' });

// Repeat until perfect match
```

## Reference Scraping Workflow

Use Playwright to capture inspiration from reference sites:

```javascript
// Navigate to high-quality booking site
await page.goto('https://example-camera-rental.com');

// Take full-page screenshot
await page.screenshot({ 
  path: 'inspiration/reference-homepage.png',
  fullPage: true 
});

// Capture specific component
const filterPanel = await page.locator('.filter-sidebar');
await filterPanel.screenshot({ 
  path: 'inspiration/filter-panel-reference.png' 
});
```

## Accessibility Testing with Playwright

### Manual Keyboard Navigation Test
```javascript
// Start at top of page
await page.goto('http://localhost:3000/equipment/search');

// Tab through interactive elements
await page.keyboard.press('Tab'); // Should focus search input
await page.keyboard.press('Tab'); // Should focus first filter

// Test modal keyboard access
await page.keyboard.press('Enter'); // Open modal
await page.keyboard.press('Escape'); // Close modal

// Screenshot focus states
await page.keyboard.press('Tab');
await page.screenshot({ path: 'a11y/focus-state-1.png' });
```

## Multi-Viewport Testing Script

```javascript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

for (const viewport of viewports) {
  await page.setViewportSize({ 
    width: viewport.width, 
    height: viewport.height 
  });
  
  await page.goto('http://localhost:3000/equipment/search');
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ 
    path: `responsive/${viewport.name}-equipment-search.png`,
    fullPage: true
  });
  
  console.log(`✓ ${viewport.name} screenshot captured`);
}
```

## Performance Testing

```javascript
// Measure page load time
const startTime = Date.now();
await page.goto('http://localhost:3000');
await page.waitForLoadState('networkidle');
const loadTime = Date.now() - startTime;

console.log(`Page load time: ${loadTime}ms`);
// Target: < 2000ms

// Measure interaction responsiveness
const clickStart = Date.now();
await page.click('button:has-text("Reserve Now")');
await page.waitForSelector('.booking-modal');
const interactionTime = Date.now() - clickStart;

console.log(`Modal open time: ${interactionTime}ms`);
// Target: < 200ms
```

## Troubleshooting

### Browser Not Opening in Headed Mode
```bash
# Verify headed mode is enabled
export PLAYWRIGHT_HEADED=true

# Or in MCP config:
"PLAYWRIGHT_HEADED": "true"
```

### Screenshots Are Blank
```javascript
// Always wait for content to load
await page.goto('http://localhost:3000');
await page.waitForLoadState('networkidle');
await page.waitForSelector('.main-content');
await page.screenshot({ path: 'screenshot.png' });
```

### Cannot Find Element
```javascript
// Use flexible selectors
await page.click('button:has-text("Reserve")'); // Text-based
await page.click('[data-testid="reserve-button"]'); // Test ID
await page.click('.btn-primary'); // Class-based

// Wait before interacting
await page.waitForSelector('button:has-text("Reserve")');
await page.click('button:has-text("Reserve")');
```

## Best Practices

1. **Always wait for load states** before taking screenshots
2. **Use descriptive paths** for screenshots
3. **Capture console output** when debugging
4. **Test across viewports** for responsive validation
5. **Screenshot focus states** for accessibility review
6. **Use full-page screenshots** for comprehensive review
7. **Organize screenshots** in logical folder structure
8. **Clean up old screenshots** regularly

## Next Steps

After setup:
1. Test basic navigation to your local dev server
2. Take initial screenshots of current state
3. Set up comparison workflow with reference designs
4. Integrate Playwright commands into your development loop
5. Invoke `@@design-reviewer` agent for comprehensive audits