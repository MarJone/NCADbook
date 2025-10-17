/**
 * Accessibility Audit Script
 * Uses @axe-core/playwright to test WCAG 2.1 AA compliance
 *
 * Run with: node scripts/accessibility-audit.js
 */

import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173/NCADbook/';
const OUTPUT_DIR = path.join(__dirname, '..', 'review', 'accessibility');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = [
  {
    name: 'home',
    path: '',
    description: 'Landing Page (Login)',
    waitFor: 'body',
    user: null
  },
  {
    name: 'student-portal',
    path: 'student',
    description: 'Student Portal Dashboard',
    waitFor: 'h1, h2',
    user: { id: 1, email: 'student@ncad.ie', full_name: 'Test Student', role: 'student', department: 'Moving Image Design' }
  },
  {
    name: 'staff-portal',
    path: 'staff',
    description: 'Staff Portal',
    waitFor: 'h1',
    user: { id: 2, email: 'staff@ncad.ie', full_name: 'Test Staff', role: 'staff', department: 'Moving Image Design' }
  },
  {
    name: 'dept-admin-portal',
    path: 'admin',
    description: 'Department Admin Portal',
    waitFor: 'h1',
    user: { id: 3, email: 'dept.admin@ncad.ie', full_name: 'Test Dept Admin', role: 'department_admin', department: 'Moving Image Design' }
  },
  {
    name: 'master-admin-portal',
    path: 'admin',
    description: 'Master Admin Portal',
    waitFor: 'h1',
    user: { id: 4, email: 'master.admin@ncad.ie', full_name: 'Test Master Admin', role: 'master_admin', department: null }
  },
];

// Violation severity levels
const IMPACT_LEVELS = {
  critical: '🔴 CRITICAL',
  serious: '🟠 SERIOUS',
  moderate: '🟡 MODERATE',
  minor: '🟢 MINOR'
};

function formatViolations(violations) {
  if (!violations || violations.length === 0) {
    return '✅ No violations found!';
  }

  let output = '';

  // Group by impact
  const grouped = violations.reduce((acc, v) => {
    if (!acc[v.impact]) acc[v.impact] = [];
    acc[v.impact].push(v);
    return acc;
  }, {});

  // Output by severity
  for (const impact of ['critical', 'serious', 'moderate', 'minor']) {
    const impactViolations = grouped[impact] || [];
    if (impactViolations.length === 0) continue;

    output += `\n### ${IMPACT_LEVELS[impact]} (${impactViolations.length})\n\n`;

    impactViolations.forEach(violation => {
      output += `**${violation.id}**: ${violation.description}\n`;
      output += `- **Impact:** ${violation.impact}\n`;
      output += `- **WCAG:** ${violation.tags.filter(t => t.startsWith('wcag')).join(', ')}\n`;
      output += `- **Help:** ${violation.helpUrl}\n`;
      output += `- **Affected elements:** ${violation.nodes.length}\n`;

      // Show first few affected elements
      violation.nodes.slice(0, 3).forEach(node => {
        output += `  - \`${node.html.substring(0, 100)}${node.html.length > 100 ? '...' : ''}\`\n`;
      });

      if (violation.nodes.length > 3) {
        output += `  - ... and ${violation.nodes.length - 3} more\n`;
      }

      output += '\n';
    });
  }

  return output;
}

async function auditPage(page, pageConfig) {
  console.log(`\n🔍 Auditing: ${pageConfig.description}`);
  console.log(`   URL: ${BASE_URL}${pageConfig.path}`);

  try {
    // Set localStorage with user data if this is a protected route
    if (pageConfig.user) {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.evaluate((user) => {
        localStorage.setItem('ncadbook_user', JSON.stringify(user));
      }, pageConfig.user);
      console.log(`   🔐 Injected user: ${pageConfig.user.role}`);
    }

    // Navigate to page
    await page.goto(`${BASE_URL}${pageConfig.path}`, {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // Wait for content
    try {
      await page.waitForSelector(pageConfig.waitFor, { timeout: 3000 });
    } catch (e) {
      console.log(`   ⚠️  Could not find selector "${pageConfig.waitFor}"`);
    }

    // Allow animations to settle
    await page.waitForTimeout(1500);

    // Run axe accessibility audit
    console.log('   Running @axe-core audit...');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Summary
    const violationCount = results.violations.length;
    const criticalCount = results.violations.filter(v => v.impact === 'critical').length;
    const seriousCount = results.violations.filter(v => v.impact === 'serious').length;
    const moderateCount = results.violations.filter(v => v.impact === 'moderate').length;
    const minorCount = results.violations.filter(v => v.impact === 'minor').length;

    console.log(`   ✅ Audit complete:`);
    console.log(`      Total violations: ${violationCount}`);
    if (criticalCount > 0) console.log(`      🔴 Critical: ${criticalCount}`);
    if (seriousCount > 0) console.log(`      🟠 Serious: ${seriousCount}`);
    if (moderateCount > 0) console.log(`      🟡 Moderate: ${moderateCount}`);
    if (minorCount > 0) console.log(`      🟢 Minor: ${minorCount}`);
    console.log(`      ✅ Passes: ${results.passes.length}`);
    console.log(`      ⚠️  Incomplete: ${results.incomplete.length}`);

    return {
      page: pageConfig.name,
      description: pageConfig.description,
      url: `${BASE_URL}${pageConfig.path}`,
      timestamp: new Date().toISOString(),
      summary: {
        violations: violationCount,
        critical: criticalCount,
        serious: seriousCount,
        moderate: moderateCount,
        minor: minorCount,
        passes: results.passes.length,
        incomplete: results.incomplete.length
      },
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete
    };

  } catch (error) {
    console.error(`   ❌ Error auditing ${pageConfig.name}: ${error.message}`);
    return {
      page: pageConfig.name,
      description: pageConfig.description,
      error: error.message
    };
  }
}

async function runAccessibilityAudit() {
  console.log('♿ Starting Accessibility Audit...');
  console.log('   Standard: WCAG 2.1 Level AA\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const pageConfig of pages) {
    const result = await auditPage(page, pageConfig);
    results.push(result);
  }

  await browser.close();

  // Generate summary report
  console.log('\n\n📊 SUMMARY REPORT');
  console.log('═══════════════════════════════════════\n');

  const totalViolations = results.reduce((sum, r) => sum + (r.summary?.violations || 0), 0);
  const totalCritical = results.reduce((sum, r) => sum + (r.summary?.critical || 0), 0);
  const totalSerious = results.reduce((sum, r) => sum + (r.summary?.serious || 0), 0);
  const totalModerate = results.reduce((sum, r) => sum + (r.summary?.moderate || 0), 0);
  const totalMinor = results.reduce((sum, r) => sum + (r.summary?.minor || 0), 0);

  console.log(`Total Violations: ${totalViolations}`);
  console.log(`  🔴 Critical: ${totalCritical}`);
  console.log(`  🟠 Serious: ${totalSerious}`);
  console.log(`  🟡 Moderate: ${totalModerate}`);
  console.log(`  🟢 Minor: ${totalMinor}\n`);

  // Save detailed JSON report
  const jsonPath = path.join(OUTPUT_DIR, 'accessibility-audit-results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed JSON report saved: ${jsonPath}`);

  // Generate markdown report
  let markdown = `# Accessibility Audit Report\n\n`;
  markdown += `**Date:** ${new Date().toLocaleString()}\n`;
  markdown += `**Standard:** WCAG 2.1 Level AA\n`;
  markdown += `**Tool:** @axe-core/playwright v4.10.2\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| **Total Violations** | ${totalViolations} |\n`;
  markdown += `| 🔴 Critical | ${totalCritical} |\n`;
  markdown += `| 🟠 Serious | ${totalSerious} |\n`;
  markdown += `| 🟡 Moderate | ${totalModerate} |\n`;
  markdown += `| 🟢 Minor | ${totalMinor} |\n\n`;

  markdown += `## Pages Audited\n\n`;
  results.forEach(result => {
    if (result.error) {
      markdown += `### ❌ ${result.description}\n`;
      markdown += `**Error:** ${result.error}\n\n`;
      return;
    }

    const status = result.summary.violations === 0 ? '✅' : '❌';
    markdown += `### ${status} ${result.description}\n\n`;
    markdown += `**URL:** \`${result.url}\`\n\n`;
    markdown += `| Metric | Count |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Violations | ${result.summary.violations} |\n`;
    markdown += `| Critical | ${result.summary.critical} |\n`;
    markdown += `| Serious | ${result.summary.serious} |\n`;
    markdown += `| Moderate | ${result.summary.moderate} |\n`;
    markdown += `| Minor | ${result.summary.minor} |\n`;
    markdown += `| Passes | ${result.summary.passes} |\n`;
    markdown += `| Incomplete | ${result.summary.incomplete} |\n\n`;

    if (result.violations && result.violations.length > 0) {
      markdown += `#### Violations\n\n`;
      markdown += formatViolations(result.violations);
    }

    markdown += `---\n\n`;
  });

  markdown += `## Next Steps\n\n`;
  markdown += `1. Review critical and serious violations first\n`;
  markdown += `2. Create GitHub issues for each violation type\n`;
  markdown += `3. Prioritize fixes based on impact and effort\n`;
  markdown += `4. Re-run audit after fixes to verify\n\n`;

  markdown += `---\n\n`;
  markdown += `**Project Links:**\n`;
  markdown += `- **Local Demo:** http://localhost:5173/NCADbook/\n`;
  markdown += `- **GitHub Pages:** https://marjone.github.io/NCADbook/\n`;

  const mdPath = path.join(OUTPUT_DIR, 'ACCESSIBILITY_AUDIT_REPORT.md');
  fs.writeFileSync(mdPath, markdown);
  console.log(`📄 Markdown report saved: ${mdPath}`);

  console.log('\n✨ Accessibility audit complete!\n');

  return results;
}

runAccessibilityAudit().catch(console.error);
