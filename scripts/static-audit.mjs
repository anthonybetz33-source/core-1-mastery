import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import raw from '../data/raw.json' with { type: 'json' };

const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const questions = Array.isArray(raw.allQuestions) ? raw.allQuestions : [];
const objectives = Array.isArray(raw.OBJECTIVES) ? raw.OBJECTIVES : [];
const objectiveIds = new Set(objectives.map((o) => o.id));

expect(questions.length >= 170, `question bank unexpectedly small: ${questions.length}`);
expect(objectives.length === 27, `expected 27 Core 1 objectives, found ${objectives.length}`);

for (const [i, q] of questions.entries()) {
  expect(typeof q.q === 'string' && q.q.trim().length >= 30, `question ${i} has unusable wording`);
  expect(Array.isArray(q.options) && q.options.length === 4, `question ${i} must have exactly 4 choices`);
  expect(new Set(q.options.map((x) => String(x).trim().toLowerCase())).size === q.options.length, `question ${i} has duplicate choices`);
  expect(Number.isInteger(q.a) && q.a >= 0 && q.a < q.options.length, `question ${i} has invalid answer index`);
  expect(objectiveIds.has(q.obj), `question ${i} references unknown objective ${q.obj}`);
  expect(typeof q.e === 'string' && q.e.trim().length >= 15, `question ${i} has a weak/missing explanation`);
}

for (const objective of objectives) {
  expect(questions.some((q) => q.obj === objective.id), `objective ${objective.id} has no questions`);
}

const svgIds = new Set(Object.keys(raw.SVGs ?? {}));
for (const [i, item] of [...(raw.visualItems ?? []), ...(raw.identifyQuestions ?? [])].entries()) {
  if (item.svg) expect(svgIds.has(item.svg), `visual asset ${item.svg} is missing (item ${i})`);
}
for (const [i, q] of questions.entries()) {
  if (q.svg) expect(svgIds.has(q.svg), `question ${i} references missing SVG ${q.svg}`);
}

const styles = await readFile('styles.css', 'utf8');
const diagram = await readFile('components/DiagramViewer.tsx', 'utf8');
const workflow = await readFile('.github/workflows/deploy-pages.yml', 'utf8');
const manifest = JSON.parse(await readFile('public/manifest.webmanifest', 'utf8'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

expect(styles.includes('touch-action: pan-y pinch-zoom'), 'mobile/touch scrolling guard is missing');
expect(diagram.includes('onPointerMove={movePress}'), 'diagram long-press movement guard is missing');
expect(diagram.includes('Math.hypot'), 'diagram long-press movement threshold is missing');
expect(styles.includes('text-red-') || styles.includes('--color-bad'), 'status palette is missing a red state');
expect(!styles.toLowerCase().includes('pink'), 'pink styling remains in styles.css');
expect(workflow.includes('npm run typecheck'), 'Pages workflow does not typecheck');
expect(workflow.includes('npm run audit:content'), 'Pages workflow does not audit content');
expect(workflow.includes('npm run build'), 'Pages workflow does not build');
expect(workflow.includes('cp dist/client/index.html dist/client/404.html'), 'Pages workflow is missing SPA fallback');
expect(packageJson.scripts?.['audit:static'] === 'node scripts/static-audit.mjs', 'static audit script is not wired into package.json');
expect(packageJson.scripts?.['test:e2e'] === 'node scripts/e2e-smoke.mjs', 'browser smoke test is not wired into package.json');
expect(existsSync('scripts/app-smoke.test.mjs'), 'unit smoke tests are missing');
expect(existsSync('scripts/e2e-smoke.mjs'), 'browser smoke test is missing');
expect(workflow.includes('npx playwright install --with-deps chromium'), 'Pages workflow does not install its browser test dependency');
expect(workflow.includes('npm run test:e2e'), 'Pages workflow does not run the browser smoke test');
expect(manifest.start_url === '/core-1-mastery/', 'PWA start_url does not match GitHub Pages base path');
expect(manifest.scope === '/core-1-mastery/', 'PWA scope does not match GitHub Pages base path');
expect(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'PWA manifest has no icons');
expect(existsSync('public/favicon.svg'), 'favicon.svg is missing');

const domainWeights = { mobile: 13, network: 23, hardware: 25, cloud: 11, trouble: 28 };
expect(Object.values(domainWeights).reduce((a, b) => a + b, 0) === 100, 'exam domain weights do not sum to 100');
expect(Object.keys(domainWeights).every((d) => questions.some((q) => q.d === d)), 'a weighted exam domain has no questions');

if (failures.length) {
  console.error(`[static] FAIL: ${failures.length} issue(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[static] PASS: ${questions.length} questions, ${objectives.length} objectives, deployment/touch/PWA checks clean`);
