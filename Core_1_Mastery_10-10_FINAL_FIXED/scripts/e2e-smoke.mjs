import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 4173);
const BASE = `http://127.0.0.1:${PORT}/core-1-mastery/`;
const clientRoot = path.resolve('dist/client');
const expectedRoutes = [
  '/', '/quiz', '/teach', '/exam', '/flash', '/visual', '/identify', '/match', '/pbq',
  '/hardware', '/connectors', '/network', '/mobile', '/cloud', '/troubleshoot', '/memory',
  '/specs', '/tools', '/ports', '/strategy', '/mastery', '/review', '/topics', '/glossary',
];

async function collectRoutes(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) routes.push(...await collectRoutes(full, rel));
    else if (entry.name === 'index.html') routes.push(`/${prefix.replaceAll(path.sep, '/').replace(/^\//, '').replace(/\/$/, '')}`.replace('//','/'));
  }
  return routes.map((r) => r === '//' ? '/' : r);
}

if (!existsSync(clientRoot)) throw new Error('dist/client does not exist; run npm run build first');
const routes = await collectRoutes(clientRoot);
for (const route of expectedRoutes) {
  if (!routes.includes(route)) throw new Error(`Expected prerendered route missing: ${route}`);
}

const server = spawn(process.execPath, ['scripts/with-app-env.mjs', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT)], { stdio: 'pipe' });
let output = '';
server.stdout.on('data', (b) => { output += b.toString(); });
server.stderr.on('data', (b) => { output += b.toString(); });

try {
  const deadline = Date.now() + 30000;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) throw new Error(`Vite preview did not become ready within 30 seconds.\n${output}`);

  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });

  async function visit(route) {
    errors.length = 0;
    const response = await page.goto(new URL(route.replace(/^\//, ''), BASE).href, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response?.ok()) throw new Error(`${route} returned ${response?.status()}`);
    await page.locator('body').waitFor({ state: 'visible' });
    const title = await page.title();
    if (!title.includes('Core 1 Mastery')) throw new Error(`${route} has unexpected title: ${title}`);
    const overflowWidth = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    if (overflowWidth.scrollWidth > overflowWidth.clientWidth + 2) throw new Error(`${route} has horizontal overflow: ${JSON.stringify(overflowWidth)}`);
    if (errors.length) throw new Error(errors.join('\n'));
  }

  for (const route of expectedRoutes) await visit(route);

  await visit('/');
  await page.getByRole('link', { name: /quiz/i }).first().click();
  await page.getByRole('button', { name: /next|answer/i }).first().count();
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByText('Glossary', { exact: true }).click();
  const search = page.getByPlaceholder(/search terms/i);
  await search.fill('USB');
  if (!(await page.locator('body').innerText()).includes('USB')) throw new Error('Glossary search interaction failed');

  await visit('/flash');
  const before = await page.locator('body').innerText();
  await page.getByRole('button', { name: 'Next' }).click();
  const after = await page.locator('body').innerText();
  if (before === after) throw new Error('Flashcard Next interaction did not change the card');

  await visit('/visual');
  const expand = page.getByRole('button', { name: /expand/i }).first();
  if (await expand.count()) {
    await expand.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const scrollY = await page.evaluate(() => window.scrollY);
  if (scrollY <= 0) throw new Error('Mobile vertical scrolling did not move the page');

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const desktopErrors = [];
  desktop.on('pageerror', (error) => desktopErrors.push(error.message));
  desktop.on('console', (msg) => { if (msg.type() === 'error') desktopErrors.push(msg.text()); });
  await desktop.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  const desktopOverflow = await desktop.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  if (desktopOverflow.scrollWidth > desktopOverflow.clientWidth + 2) throw new Error(`Desktop horizontal overflow: ${JSON.stringify(desktopOverflow)}`);
  if (desktopErrors.length) throw new Error(`Desktop errors:\n${desktopErrors.join('\n')}`);

  await browser.close();
  console.log(`[e2e] PASS: ${expectedRoutes.length} routes + mobile navigation/search/flashcard/diagram/scroll + desktop overflow checks`);
} finally {
  server.kill('SIGTERM');
}
