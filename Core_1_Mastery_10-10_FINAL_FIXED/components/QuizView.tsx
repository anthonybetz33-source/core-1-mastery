import { useEffect, useState } from "react";
import { Check, ChevronRight, CircleAlert, Lightbulb, RotateCcw, Sparkles, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DiagramViewer } from "@/components/DiagramViewer";
import { shuffleIndexed } from "@/lib/shuffle";
import { useClientReady } from "@/lib/use-client-ready";
import { cn } from "@/lib/utils";
import type { Question } from "@/data/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export type QuizItem = Pick<Question, "q" | "options" | "a" | "e"> & { obj?: string; d?: string; svg?: string };
function indexed(options: string[]) { return options.map((opt, index) => ({ item: opt, index })); }

export function QuizView({ items, scoreLabel, onAnswer, onComplete, empty }: { items: QuizItem[]; scoreLabel?: string; onAnswer: (item: QuizItem, correct: boolean) => void; onComplete?: (score: number, total: number) => void; empty?: string }) {
  const ready = useClientReady();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const first = items[0];
  const [shuffled, setShuffled] = useState<{ item: string; index: number }[]>(() => (first ? indexed(first.options) : []));
  const item = items[index];

  useEffect(() => { if (!item) { setShuffled([]); return; } setShuffled(ready ? shuffleIndexed(item.options) : indexed(item.options)); }, [item, ready]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!item) return;
      const key = event.key.toLowerCase();
      if (!answered && ["1", "2", "3", "4"].includes(key)) { const option = shuffled[Number(key) - 1]; if (option) select(option.index); }
      else if (answered && (key === "enter" || key === "n")) next();
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [item, answered, shuffled]);

  if (!items.length) return <div className="app-surface rounded-2xl p-6 text-sm text-muted">{empty ?? "Nothing in this bank yet."}</div>;

  if (done || !item) {
    const pct = Math.round((score / items.length) * 100); const strong = pct >= 85;
    return <div className="hero-surface rounded-[1.4rem] p-6 sm:p-8"><div className="relative z-10 max-w-2xl">
      <div className="grid size-12 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">{strong ? <Check className="size-6" /> : <Sparkles className="size-6" />}</div>
      <p className="eyebrow mt-6 text-accent">Mission complete</p>
      <h2 className="mt-1 text-3xl font-black tracking-[-.035em]">{strong ? "You handled that." : "Good rep. Now close the gaps."}</h2>
      <div className="mt-5 flex items-end gap-3"><span className="text-6xl font-black tracking-[-.06em] text-accent">{pct}%</span><span className="pb-2 text-sm text-muted">{score} / {items.length} correct</span></div>
      <p className="mt-3 text-sm leading-6 text-muted">{strong ? "Your recall is getting reliable. Push into PBQs or attack the next weak objective." : "Don't brute-force another identical run. Review the misses, learn the distinction, then attack the weak concepts again."}</p>
      <div className="mt-6 flex flex-wrap gap-2"><Button onClick={reset}><RotateCcw className="size-4" /> Run again</Button><Button variant="secondary" onClick={reset}><Target className="size-4" /> Train another set</Button></div>
    </div></div>;
  }

  function select(orig: number) { if (answered || !item) return; setAnswered(true); setPicked(orig); const correct = orig === item.a; if (correct) setScore((s) => s + 1); onAnswer(item, correct); }
  function next() { if (!answered) return; if (index >= items.length - 1) { setDone(true); onComplete?.(score + (picked === item.a ? 1 : 0), items.length); return; } setIndex((i) => i + 1); setAnswered(false); setPicked(null); }
  function reset() { setIndex(0); setScore(0); setAnswered(false); setPicked(null); setDone(false); }

  const answeredCorrect = picked === item.a;
  const progress = ((index + (answered ? 1 : 0)) / items.length) * 100;

  return <div className="space-y-3">
    <div className="app-surface rounded-xl p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3"><div><p className="eyebrow text-accent">Core 1 training · {item.d ?? "mixed domain"}</p><p className="mt-1 text-xs font-bold text-muted">Question {String(index + 1).padStart(2, "0")} <span className="text-faint">/ {items.length}</span></p></div><div className="text-right"><p className="eyebrow">Score</p><p className="text-lg font-black text-accent">{score}</p></div></div>
      <div className="mt-3"><Progress value={progress} className="h-1.5" /></div>
    </div>

    <section className="app-surface rounded-[1.25rem] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-2">{item.obj && <span className="command-chip rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em]">Objective {item.obj}</span>}{item.d && <span className="rounded-full border border-white/8 bg-white/[.025] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.14em] text-muted">{item.d}</span>}</div><span className="hidden text-[9px] font-bold uppercase tracking-[.12em] text-faint sm:block">1–4 answer · Enter next</span></div>
      {item.svg ? <div className="mt-5 overflow-hidden rounded-xl border border-accent/10 bg-[#050a0e] p-3"><DiagramViewer id={item.svg} label="Question visual" /></div> : null}
      <div className="mt-5 max-w-4xl"><p className="eyebrow text-accent/70">Best answer</p><h2 className="mt-2 text-xl font-black leading-7 tracking-[-.02em] sm:text-2xl sm:leading-8">{item.q}</h2><p className="mt-2 text-xs leading-5 text-faint">CompTIA-style rule: choose the best answer for the symptom — not merely something that could technically work.</p></div>

      <div className="mt-6 grid gap-2.5">
        {shuffled.map((opt, displayIdx) => {
          const isCorrect = opt.index === item.a; const isPicked = opt.index === picked;
          return <button key={`${index}-${opt.index}`} type="button" disabled={answered} onClick={() => select(opt.index)} className={cn("answer-card group flex w-full items-start gap-3 rounded-xl p-3.5 text-left sm:p-4", answered && isCorrect && "answer-correct", answered && isPicked && !isCorrect && "answer-wrong", answered && !isCorrect && !isPicked && "opacity-40")}>
            <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border text-xs font-black", !answered && "border-white/10 bg-black/20 text-muted group-hover:border-accent/35 group-hover:text-accent", answered && isCorrect && "border-ok/30 bg-ok/10 text-ok", answered && isPicked && !isCorrect && "border-bad/30 bg-bad/10 text-bad", answered && !isCorrect && !isPicked && "border-white/8 text-faint")}>{LETTERS[displayIdx]}</span>
            <span className="pt-1 text-sm font-semibold leading-6 text-fg/95">{opt.item}</span>
            {answered && isCorrect && <Check className="ml-auto mt-1 size-4 shrink-0 text-ok" />}{answered && isPicked && !isCorrect && <X className="ml-auto mt-1 size-4 shrink-0 text-bad" />}
          </button>;
        })}
      </div>

      {answered && <div className={cn("mt-4 rounded-xl border p-4 sm:p-5", answeredCorrect ? "border-ok/20 bg-ok-dim/50" : "border-bad/20 bg-bad-dim/45")}>
        <div className="flex items-center gap-2"><div className={cn("grid size-7 place-items-center rounded-lg", answeredCorrect ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad")}>{answeredCorrect ? <Check className="size-4" /> : <CircleAlert className="size-4" />}</div><div><p className={cn("text-xs font-black uppercase tracking-[.14em]", answeredCorrect ? "text-ok" : "text-bad")}>{answeredCorrect ? "Correct — lock it in" : "Not quite — here's the distinction"}</p></div></div>
        <p className="mt-3 text-sm leading-6 text-fg/95">{item.e}</p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/7 bg-black/15 p-3"><Lightbulb className="mt-0.5 size-4 shrink-0 text-mid" /><p className="text-[11px] leading-5 text-muted"><span className="font-black text-mid">Exam clue:</span> Read the explanation for the symptom → technology distinction. That's where distractors usually win.</p></div>
      </div>}

      <div className="mt-5 flex items-center justify-between gap-2"><Button variant="secondary" onClick={reset}><RotateCcw className="size-4" /><span className="hidden sm:inline">Reset</span></Button><Button size="lg" onClick={next} disabled={!answered}>{index >= items.length - 1 ? "Complete mission" : "Next question"}<ChevronRight className="size-4" /></Button></div>
    </section>
  </div>;
}
