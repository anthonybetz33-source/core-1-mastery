import raw from '../data/raw.json' with { type: 'json' };
const questions = Array.isArray(raw.allQuestions) ? raw.allQuestions : [];
const objectives = Array.isArray(raw.OBJECTIVES) ? raw.OBJECTIVES : [];
const ids = new Set(objectives.map((o) => o.id));
const missing = objectives.filter((o) => !questions.some((q) => q.obj === o.id));
if (!questions.length || !objectives.length || missing.length) {
  console.error(`[content] audit failed: questions=${questions.length}, objectives=${objectives.length}, objectives without questions=${missing.length}`);
  process.exit(1);
}
for (const [i, q] of questions.entries()) {
  if (!q.q?.trim() || !Array.isArray(q.options) || q.options.length < 4 || !Number.isInteger(q.a) || q.a < 0 || q.a >= q.options.length || !ids.has(q.obj)) {
    console.error(`[content] invalid question at index ${i}`);
    process.exit(1);
  }
}
console.log(`[content] PASS: ${questions.length} questions across ${objectives.length} objectives`);
