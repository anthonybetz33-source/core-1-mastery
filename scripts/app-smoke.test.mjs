import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import raw from '../data/raw.json' with { type: 'json' };

const root = new URL('../', import.meta.url);
const text = async (relative) => readFile(new URL(relative, root), 'utf8');

test('question bank has complete, unique, answerable questions', () => {
  const questions = raw.allQuestions;
  assert.ok(Array.isArray(questions));
  assert.ok(questions.length >= 170);
  const objectiveIds = new Set(raw.OBJECTIVES.map((o) => o.id));
  for (const [i, q] of questions.entries()) {
    assert.equal(typeof q.q, 'string', `question ${i}`);
    assert.ok(q.q.trim().length >= 30, `question ${i} wording`);
    assert.equal(q.options.length, 4, `question ${i} options`);
    assert.equal(new Set(q.options.map((x) => String(x).trim().toLowerCase())).size, 4, `question ${i} duplicate options`);
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4, `question ${i} answer`);
    assert.ok(objectiveIds.has(q.obj), `question ${i} objective`);
    assert.ok(typeof q.e === 'string' && q.e.trim().length >= 15, `question ${i} explanation`);
  }
});

test('every Core 1 objective is represented', () => {
  const ids = new Set(raw.allQuestions.map((q) => q.obj));
  for (const objective of raw.OBJECTIVES) assert.ok(ids.has(objective.id), objective.id);
});

test('deployment configuration is internally consistent', async () => {
  const pkg = JSON.parse(await text('package.json'));
  const workflow = await text('.github/workflows/deploy-pages.yml');
  const vite = await text('vite.config.ts');
  const manifest = JSON.parse(await text('public/manifest.webmanifest'));
  assert.equal(pkg.scripts['audit:static'], 'node scripts/static-audit.mjs');
  assert.equal(pkg.scripts.test, 'node --test "scripts/**/*.test.mjs" && npm run audit:static');
  assert.match(workflow, /npm run typecheck/);
  assert.match(workflow, /npm run audit:content/);
  assert.match(workflow, /npm run audit:static/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /path: dist\/client/);
  assert.match(vite, /srcDirectory:\s*["']\.["']/);
  assert.equal(manifest.start_url, '/core-1-mastery/');
  assert.equal(manifest.scope, '/core-1-mastery/');
  assert.ok(existsSync(new URL('../public/favicon.svg', import.meta.url)));
});

test('SSR-sensitive randomization is deferred until the client', async () => {
  const teach = await text('views/TeachMeView.tsx');
  const pbq = await text('views/PbqView.tsx');
  const match = await text('views/MatchView.tsx');
  assert.doesNotMatch(teach, /useState\(\(\)\s*=>\s*shuffle\(/);
  assert.match(teach, /useEffect\(\(\)\s*=>\s*\{[\s\S]*setDeck\(shuffle\(pool\)\)/);
  assert.match(pbq, /useEffect\(\(\)\s*=>/);
  assert.match(match, /const next = ready \? shuffle\(slice\) : slice/);
});

test('SVG diagrams use deterministic IDs instead of React SSR IDs', async () => {
  const svg = await text('components/SvgDiagram.tsx');
  assert.doesNotMatch(svg, /useId\(/);
  assert.match(svg, /stableKey/);
  assert.match(svg, /uniquify\(/);
});
