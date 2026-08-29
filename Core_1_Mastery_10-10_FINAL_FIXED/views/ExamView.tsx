import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Flag, RotateCcw, TimerReset } from "lucide-react";
import { PanelLink } from "@/components/PanelLink";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { allQuestions } from "@/data";
import type { Question } from "@/data/types";
import { shuffle, shuffleIndexed } from "@/lib/shuffle";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TOTAL = 90;
const DURATION = 90 * 60 * 1000;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

type ExamState = {
  qs: Question[];
  idx: number;
  answers: Record<number, number>;
  flags: Record<number, boolean>;
  start: number;
};

type Result = { right: number; total: number; unanswered: number };

export function ExamView() {
  const [exam, setExam] = useState<ExamState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<Result | null>(null);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const addWrong = useAppStore((s) => s.addWrong);
  const addXP = useAppStore((s) => s.addXP);
  const bumpQuizDone = useAppStore((s) => s.bumpQuizDone);

  useEffect(() => {
    if (!exam || result) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [exam, result]);

  const remaining = exam ? Math.max(0, DURATION - (now - exam.start)) : DURATION;

  function finish(ex: ExamState) {
    let right = 0;
    let unanswered = 0;
    ex.qs.forEach((q, i) => {
      const answer = ex.answers[i];
      if (answer === undefined) {
        unanswered += 1;
        return;
      }
      const ok = answer === q.a;
      if (ok) right += 1;
      recordAnswer(q.obj, ok);
      if (!ok) {
        addWrong({ q: q.q, options: q.options, a: q.a, e: q.e, obj: q.obj, d: q.d });
      }
    });
    addXP(right * 2 + 50);
    bumpQuizDone();
    setResult({ right, total: ex.qs.length, unanswered });
  }

  useEffect(() => {
    if (exam && !result && remaining <= 0) finish(exam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, exam, result]);

  function start() {
    setResult(null);
    setExam({ qs: shuffle(allQuestions).slice(0, TOTAL), idx: 0, answers: {}, flags: {}, start: Date.now() });
    setNow(Date.now());
  }

  const q = exam?.qs[exam.idx];
  const shuffled = useMemo(() => (q ? shuffleIndexed(q.options) : []), [exam?.idx, q]);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const flagCount = exam ? Object.values(exam.flags).filter(Boolean).length : 0;
  const answeredCount = exam ? Object.keys(exam.answers).length : 0;
  const timeCritical = remaining <= 5 * 60 * 1000;

  if (!exam) {
    return (
      <div className="space-y-5">
        <section className="hero-surface rounded-2xl p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-accent">
              <TimerReset className="size-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Full simulation</span>
            </div>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight italic">90 questions. 90 minutes.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              A realistic Core 1 pacing drill using your question bank. Flag anything uncertain, keep moving, and come back before submitting.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <ExamFact label="Question cap" value="90" />
              <ExamFact label="Time limit" value="90 min" />
              <ExamFact label="Passing score" value="675 / 900" />
            </div>
            <Button className="mt-6" size="lg" onClick={start}>Start simulation <ChevronRight className="size-4" /></Button>
          </div>
        </section>
        <p className="text-xs leading-5 text-faint">Practice results are raw accuracy only. CompTIA uses a scaled 100–900 score, so this app will not invent a fake score conversion.</p>
      </div>
    );
  }

  if (result) {
    const pct = Math.round((result.right / result.total) * 100);
    const attemptedPct = Math.round(((result.total - result.unanswered) / result.total) * 100);
    return (
      <div className="space-y-5">
        <section className="hero-surface rounded-2xl p-6 sm:p-8">
          <div className="relative z-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Simulation complete</p>
            <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight italic">Now we know what to fix.</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ExamResult value={`${result.right}/${result.total}`} label="Correct" />
              <ExamResult value={`${pct}%`} label="Raw accuracy" />
              <ExamResult value={`${result.unanswered}`} label="Unanswered" />
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
              {pct >= 85 && result.unanswered === 0
                ? "Excellent training signal. Keep your weak objectives above 85% and add PBQs under time pressure."
                : pct >= 70
                  ? "You are in striking distance. Attack the miss bank and the lowest mastery objectives before another full simulation."
                  : "Do not chase another full exam yet. Review misses, rebuild weak domains, then retest with a targeted session."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => { setExam(null); setResult(null); }}><RotateCcw className="size-4" /> New simulation</Button>
              <Button variant="secondary" asChild><PanelLink id="review">Review misses</PanelLink></Button>
              <Button variant="outline" asChild><PanelLink id="mastery">Open mastery map</PanelLink></Button>
            </div>
          </div>
        </section>
        <div className="app-surface rounded-xl p-4 text-xs text-muted">Attempted {attemptedPct}% of the simulation. Unanswered items were not added to mastery or the miss bank.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="app-surface rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">Full Core 1 simulation</p>
            <p className="mt-1 text-sm font-semibold">Question {exam.idx + 1} of {exam.qs.length}</p>
          </div>
          <div className={cn("rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums", timeCritical ? "border-bad/30 bg-bad-dim text-bad" : "border-accent/15 bg-accent/5 text-accent")}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
          <span>{answeredCount} answered</span>
          <span className="text-center">{flagCount} flagged</span>
          <span className="text-right">{exam.qs.length - answeredCount} remaining</span>
        </div>
        <Progress value={(answeredCount / exam.qs.length) * 100} className="mt-3" />
      </section>

      <section className="app-surface rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {q?.obj && <span className="rounded-full border border-accent/15 bg-accent/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">Objective {q.obj}</span>}
          {q?.d && <span className="rounded-full border border-border/70 bg-surface-2 px-2.5 py-1 text-[10px] font-semibold capitalize text-muted">{q.d}</span>}
        </div>
        <p className="mt-4 text-lg font-semibold leading-7 sm:text-xl">{q?.q}</p>
        <div className="mt-5 grid gap-2.5">
          {shuffled.map((opt, displayIdx) => {
            const selected = exam.answers[exam.idx] === opt.index;
            return (
              <button
                key={opt.index}
                type="button"
                onClick={() => setExam({ ...exam, answers: { ...exam.answers, [exam.idx]: opt.index } })}
                className={cn("answer-card flex min-h-14 items-start gap-3 rounded-xl px-3.5 py-3.5 text-left text-sm leading-6", selected && "border-accent/45 bg-accent/10 text-accent shadow-[0_0_28px_rgba(101,232,255,.05)]")}
              >
                <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg border text-[11px] font-bold", selected ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-bg/40 text-muted")}>{LETTERS[displayIdx]}</span>
                <span>{opt.item}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
          <Button variant="secondary" onClick={() => setExam({ ...exam, flags: { ...exam.flags, [exam.idx]: !exam.flags[exam.idx] } })}>
            <Flag className="size-4" /> {exam.flags[exam.idx] ? "Flagged" : "Flag for review"}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={exam.idx === 0} onClick={() => setExam({ ...exam, idx: exam.idx - 1 })}><ChevronLeft className="size-4" /> Prev</Button>
            {exam.idx < exam.qs.length - 1 ? (
              <Button onClick={() => setExam({ ...exam, idx: exam.idx + 1 })}>Next <ChevronRight className="size-4" /></Button>
            ) : (
              <Button variant="outline" onClick={() => finish(exam)}><AlertTriangle className="size-4" /> Submit exam</Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ExamFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border/70 bg-bg/25 p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums text-fg">{value}</p></div>;
}

function ExamResult({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl border border-accent/10 bg-bg/25 p-4"><p className="font-display text-2xl font-semibold tabular-nums text-accent">{value}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{label}</p></div>;
}
