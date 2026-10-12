// One-off: renders the link-preview card (their logo, the line on the hero,
// and the shopfront drawing) from index.html and writes og.jpg with sharp.
// Usage: npm install && npm run og   (needs a Chromium for Playwright:
// `npx playwright install chromium` if you don't have one).
import { chromium } from 'playwright';
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'og.jpg');
const W = 1200;
const H = 630;
const MAX_BYTES = 300 * 1024;

const font = (pkg, file) => pathToFileURL(path.join(root, 'node_modules/@fontsource', pkg, 'files', file)).href;
const fontFaces = [
  ['Montserrat', 'normal', 600, font('montserrat', 'montserrat-latin-600-normal.woff2')],
  ['Montserrat', 'normal', 700, font('montserrat', 'montserrat-latin-700-normal.woff2')],
  ['Montserrat', 'normal', 800, font('montserrat', 'montserrat-latin-800-normal.woff2')],
  ['Newsreader', 'normal', 400, font('newsreader', 'newsreader-latin-400-normal.woff2')],
  ['Newsreader', 'italic', 400, font('newsreader', 'newsreader-latin-400-italic.woff2')],
].map(([family, style, weight, url]) =>
  `@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};src:url("${url}") format("woff2");}`).join('');

const cardCss = `
  .site-header, .board, .hero-links, main > section:not(.hero), .site-footer { display: none !important; }
  .hero { padding: 0; height: ${H}px; display: flex; align-items: center; }
  .og-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
  .og-logo svg { height: auto; }
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
// keep the render offline: local files only (this also stops the demo ping)
await page.route('**/*', (route) => (route.request().url().startsWith('file:') ? route.continue() : route.abort()));
await page.goto(`${pathToFileURL(path.join(root, 'index.html')).href}#me`);
await page.addStyleTag({ content: fontFaces + cardCss });
await page.evaluate(() => {
  const logo = document.createElement('div');
  logo.className = 'og-logo';
  logo.innerHTML = '<svg viewBox="0 0 1410 1584" width="54" style="color:#288c8a"><use href="#lj-mark"/></svg>'
    + '<svg viewBox="0 0 1644 228" width="190" style="color:#1f2523"><use href="#lj-word"/></svg>';
  document.querySelector('.hero-copy').prepend(logo);
});
await page.evaluate(() => document.fonts.ready);
const usedFonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`));
const png = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();

await sharp(png)
  .resize(W, H, { fit: 'cover', kernel: 'lanczos3' })
  .flatten({ background: '#fcfbf8' })
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(out);

const meta = await sharp(out).metadata();
const bytes = statSync(out).size;
console.log(`fonts: ${usedFonts.join(', ')}`);
console.log(`og.jpg: ${meta.width}×${meta.height} ${meta.format}, ${bytes} bytes (${(bytes / 1024).toFixed(1)} KB)`);
if (meta.width !== W || meta.height !== H || meta.format !== 'jpeg' || bytes > MAX_BYTES) {
  console.error('og.jpg is not a 1200×630 JPEG under 300 KB');
  process.exit(1);
}
