// Usage:
//   node screenshot.mjs http://localhost:3000
//   node screenshot.mjs http://localhost:3000 hero        (adds -hero suffix)
//   node screenshot.mjs http://localhost:3000 hero 1440   (custom viewport width)
//
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-increment, never overwrites).

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const require = createRequire(import.meta.url);
// Puppeteer is installed in a shared temp dir to keep this project lightweight.
const puppeteer = require('/tmp/puppeteer-svc/node_modules/puppeteer');

const ROOT = path.dirname(url.fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, 'temporary screenshots');

const [, , urlArg, label, widthArg] = process.argv;
if (!urlArg) {
  console.error('Usage: node screenshot.mjs <url> [label] [viewportWidth]');
  process.exit(1);
}

const viewportWidth  = Number(widthArg) || 1440;
const viewportHeight = 900;

fs.mkdirSync(OUT_DIR, { recursive: true });

// Auto-increment N
const existing = fs.readdirSync(OUT_DIR)
  .map(f => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map(m => Number(m[1]));
const nextN = (existing.length ? Math.max(...existing) : 0) + 1;

const filename = label
  ? `screenshot-${nextN}-${label}.png`
  : `screenshot-${nextN}.png`;
const outPath = path.join(OUT_DIR, filename);

console.log(`→ ${urlArg}`);
console.log(`→ viewport ${viewportWidth}×${viewportHeight}`);
console.log(`→ saving ${path.relative(ROOT, outPath)}`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 2 },
});

try {
  const page = await browser.newPage();
  await page.goto(urlArg, { waitUntil: 'networkidle0', timeout: 60_000 });
  // Let fonts settle and any CSS animations land
  await page.evaluate(() => document.fonts ? document.fonts.ready : null);
  // Force scroll-reveal elements visible and finish word/count animations so
  // a static screenshot reflects the fully-rendered page.
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    document.querySelectorAll('.word').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
      el.style.animation = 'none';
    });
    document.querySelectorAll('.count-up').forEach((el) => {
      const target = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      if (target != null) el.textContent = target + suffix;
    });
  });
  await new Promise(r => setTimeout(r, 600));

  // If the URL has a hash (e.g. #services), clip to that section instead of fullPage.
  const hash = new URL(urlArg).hash.replace('#', '');
  if (hash) {
    const clip = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      el.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -64); // offset the fixed nav
      const r = el.getBoundingClientRect();
      return {
        x: Math.max(0, Math.floor(r.left + window.scrollX)),
        y: Math.max(0, Math.floor(r.top  + window.scrollY)),
        width:  Math.ceil(r.width),
        height: Math.ceil(r.height),
      };
    }, hash);
    if (!clip) throw new Error(`No element with id="${hash}"`);
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: outPath, clip, type: 'png' });
  } else {
    await page.screenshot({ path: outPath, fullPage: true, type: 'png' });
  }
  console.log(`✓ saved ${filename}`);
} catch (e) {
  console.error('✗ screenshot failed:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
