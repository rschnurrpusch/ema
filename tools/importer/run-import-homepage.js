#!/usr/bin/env node

/**
 * Custom import runner for thereadypatient.com that blocks OneTrust cookie script
 * before page load. OneTrust's OtAutoBlock.js monkey-patches document.createElement
 * causing script injection to fail.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the content-import scripts directory
const SCRIPTS_DIR = '/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts';
const { processPlainHtml } = await import(join(SCRIPTS_DIR, 'import-processors/index.js'));
const { compileReportsToExcel } = await import(join(SCRIPTS_DIR, 'import-report.js'));

const url = 'https://www.thereadypatient.com/';
const importScriptPath = resolve('/workspace/tools/importer/import-homepage.bundle.js');
const outputDir = resolve('/workspace/content');

const helixImporterPath = join(SCRIPTS_DIR, 'static', 'inject', 'helix-importer.js');
const helixImporterScript = readFileSync(helixImporterPath, 'utf-8');
const importScriptContent = readFileSync(importScriptPath, 'utf-8');

function ensureDir(pathname) {
  mkdirSync(pathname, { recursive: true });
}

async function main() {
  ensureDir(outputDir);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Block OneTrust cookie scripts that break document.createElement
  await page.route('**/*cookielaw*/**', (route) => route.abort());
  await page.route('**/*onetrust*/**', (route) => route.abort());
  await page.route('**/*OtAutoBlock*/**', (route) => route.abort());

  // Save original createElement before any scripts run
  await page.addInitScript(() => {
    const origCreateElement = document.createElement.bind(document);
    window.__origCreateElement = origCreateElement;
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') console.error(`[Browser] ${text}`);
    else console.log(`[Browser] ${text}`);
  });

  console.log(`[Import] Starting ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch {
    console.log('[Import] Falling back to domcontentloaded...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
  }

  // Dismiss cookie popups
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch { /* ignore */ }

  // Inject Helix importer
  await page.evaluate((script) => {
    const originalDefine = window.define;
    if (typeof window.define !== 'undefined') delete window.define;
    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.head.appendChild(scriptEl);
    if (originalDefine) window.define = originalDefine;
  }, helixImporterScript);

  // Inject the import script
  await page.evaluate((script) => {
    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.head.appendChild(scriptEl);
  }, importScriptContent);

  // Wait for CustomImportScript
  await page.waitForFunction(
    () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
    { timeout: 10000 }
  );

  const result = await page.evaluate(async (pageUrl) => {
    const customImportConfig = window.CustomImportScript?.default;
    if (!customImportConfig) throw new Error('CustomImportScript not available');

    if (typeof customImportConfig.onLoad === 'function') {
      await customImportConfig.onLoad({ document });
    }

    const result = await window.WebImporter.html2md(pageUrl, document, customImportConfig, {
      toDocx: false,
      toMd: true,
      originalURL: pageUrl,
    });

    result.html = window.WebImporter.md2da(result.md);
    return result;
  }, url);

  if (!result.path || !result.html) {
    throw new Error(`Transform failed. path: ${typeof result.path}, html: ${typeof result.html}`);
  }

  // Process and save
  const plainHtml = processPlainHtml(result.html);

  let docPath = result.path.replace(/\\/g, '/');
  if (docPath.startsWith('/')) docPath = docPath.slice(1);
  if (docPath.endsWith('/')) docPath = docPath.slice(0, -1);
  if (docPath === '') docPath = 'index';

  const plainHtmlPath = join(outputDir, `${docPath}.plain.html`);
  ensureDir(dirname(plainHtmlPath));
  writeFileSync(plainHtmlPath, plainHtml, 'utf-8');

  // Write report
  const reportsDir = resolve('/workspace/tools/importer/reports');
  ensureDir(reportsDir);
  const reportData = {
    status: 'success',
    url,
    path: docPath,
    timestamp: new Date().toISOString(),
    ...(result.report || {}),
  };
  writeFileSync(join(reportsDir, `${docPath}.report.json`), JSON.stringify(reportData, null, 2), 'utf-8');

  console.log(`[Import] ✅ Saved content to ${docPath}.plain.html`);

  await page.close();
  await context.close();
  await browser.close();

  // Compile report
  try {
    await compileReportsToExcel(reportsDir, join(reportsDir, 'import-homepage.report.xlsx'));
    console.log('[Import] ✅ Report compiled');
  } catch { /* ignore */ }

  console.log('[Import] Done. Success: 1/1');
}

main().catch((err) => {
  console.error(`[Import] ❌ Failed: ${err.message}`);
  process.exit(1);
});
