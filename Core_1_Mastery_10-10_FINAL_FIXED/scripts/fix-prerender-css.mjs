import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const root = 'dist/client';
const assets = join(root, 'assets');
const cssFiles = existsSync(assets) ? (await readdir(assets)).filter((f) => f.endsWith('.css')) : [];

if (!existsSync(root) || cssFiles.length === 0) {
  console.log('[css-fix] No dist/client CSS output to repair; skipping.');
  process.exit(0);
}

const htmlFiles = [];
async function walk(dir) {
  for (const name of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) await walk(path);
    else if (name.name.endsWith('.html')) htmlFiles.push(path);
  }
}
await walk(root);

let changed = 0;
for (const file of htmlFiles) {
  let html = await readFile(file, 'utf8');
  const before = html;
  html = html.replace(/(<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["'])([^"']+)(["'])/gi, (full, open, href, close) => {
    const clean = href.split('?')[0].split('#')[0];
    const fileName = basename(clean);
    if (fileName.endsWith('.css') && !existsSync(join(root, clean.replace(/^\/+/, '')))) {
      const stem = fileName.replace(/-[A-Za-z0-9_-]+\.css$/, '');
      const candidates = cssFiles.filter((f) => f.replace(/-[A-Za-z0-9_-]+\.css$/, '') === stem);
      if (candidates.length === 1) return `${open}/core-1-mastery/assets/${candidates[0]}${close}`;
    }
    return full;
  });
  if (html !== before) {
    await writeFile(file, html);
    changed++;
  }
}
console.log(`[css-fix] Checked ${htmlFiles.length} prerendered pages; repaired ${changed} stylesheet reference(s).`);
