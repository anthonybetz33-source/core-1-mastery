import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Crosshair, Sparkles } from "lucide-react";
import { FilterBar } from "@/components/FilterBar";
import { QuizView } from "@/components/QuizView";
import { allQuestions, DOMAIN_LABEL, OBJECTIVES } from "@/data";
import type { Question } from "@/data/types";
import { shuffle } from "@/lib/shuffle";
import { masteryPct, useAppStore } from "@/lib/store";
import { useClientReady } from "@/lib/use-client-ready";

const SESSION_SIZE = 20;

const DOMAIN_FILTERS = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile" },
  { id: "network", label: "Networking" },
  { id: "hardware", label: "Hardware" },
  { id: "cloud", label: "Cloud / virt" },
  { id: "trouble", label: "Troubleshoot" },
];

function poolFor(domain: string, focusWeak: boolean) {
  let pool = allQuestions.slice();
  if (domain !== "all") pool = pool.filter((q) => q.d === domain);
  if (focusWeak) {
    const mastery = useAppStore.getState().mastery;
    const weak = new Set(
      OBJECTIVES.filter((o) => {
        const p = masteryPct(mastery, o.id);
        return p === null || p < 85;
      }).map((o) => o.id),
    );
    pool = pool.filter((q) => weak.has(q.obj));
  }
  return pool;
}

function adaptiveSample(pool: Question[], size: number, focusWeak: boolean) {
  const mastery = useAppStore.getState().mastery;
  const remaining = [...pool];
  const picked: Question[] = [];
  while (remaining.length && picked.length < size) {
    let totalWeight = 0;
    const weighted = remaining.map((q) => {
      const pct = masteryPct(mastery, q.obj);
      const gap = pct === null ? 100 : Math.max(0, 100 - pct);
      const weight = focusWeak ? 1 + gap / 18 : 1 + gap / 60;
      totalWeight += weight;
      return { q, weight };
    });
    let roll = Math.random() * totalWeight;
    let selected = weighted[weighted.length - 1].q;
    for (const item of weighted) {
      roll -= item.weight;
      if (roll <= 0) {
        selected = item.q;
        break;
      }
    }
    picked.push(selected);
    remaining.splice(remaining.indexOf(selected), 1);
  }
  return picked;
}

export function QuizPanel() {
  const [domain, setDomain] = useState("all");
  const [seed, setSeed] = useState(0);
  const [sessionWeak, setSessionWeak] = useState(false);
  const ready = useClientReady();
  const focusWeakNext = useAppStore((s) => s.focusWeakNext);
  const setFocusWeakNext = useAppStore((s) => s.setFocusWeakNext);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const addXP = useAppStore((s) => s.addXP);
  const addWrong = useAppStore((s) => s.addWrong);
  const bumpQuizDone = useAppStore((s) => s.bumpQuizDone);
  const wrongBank = useAppStore((s) => s.wrongBank);

  const [items, setItems] = useState<Question[]>(() => poolFor("all", false));

  useEffect(() => {
    const targetWeak = focusWeakNext || sessionWeak;
    const pool = poolFor(domain, targetWeak);
    setItems(ready ? adaptiveSample(pool, SESSION_SIZE, targetWeak) : pool.slice(0, SESSION_SIZE));
    if (focusWeakNext) {
      setSessionWeak(true);
      setFocusWeakNext(false);
    }
  }, [domain, focusWeakNext, sessionWeak, seed, ready, setFocusWeakNext]);

  const recent = wrongBank.slice(-6).reverse();
  const modeLabel = sessionWeak ? "Weak-spot attack" : domain === "all" ? "Adaptive mixed session" : `${DOMAIN_LABEL[domain] ?? domain} drill`;

  const sessionMeta = useMemo(() => {
    if (sessionWeak) return "Prioritizes untested and sub-85% objectives.";
    if (domain === "all") return "20 questions sampled from the full Core 1 bank.";
    return `20-question ${DOMAIN_LABEL[domain] ?? domain} session.`;
  }, [domain, sessionWeak]);

  return (
    <div className="space-y-5">
      <section className="hero-surface rounded-2xl p-5 sm:p-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent">
            {sessionWeak ? <Crosshair className="size-4" /> : <BrainCircuit className="size-4" />}
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{modeLabel}</span>
          </div>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight italic sm:text-4xl">Practice with purpose.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                {sessionMeta} Every answer updates your objective mastery and your miss bank. The engine deliberately favors concepts you have not proven yet.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {sessionWeak && (
                <button type="button" onClick={() => setSessionWeak(false)} className="rounded-full border border-accent/15 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10">
                  Return to balanced
                </button>
              )}
              <div className="flex items-center gap-2 rounded-full border border-accent/15 bg-accent/5 px-3 py-1.5 text-xs font-semibold text-accent">
                <Sparkles className="size-3.5" /> 20-question session
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="app-surface rounded-xl p-3.5 sm:p-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">Domain filter</div>
        <FilterBar
          options={DOMAIN_FILTERS}
          value={domain}
          onChange={(id) => {
            setDomain(id);
            setSeed((s) => s + 1);
          }}
        />
      </div>

      <QuizView
        key={`${domain}-${seed}-${sessionWeak ? "weak" : "all"}`}
        items={items}
        onAnswer={(item, correct) => {
          recordAnswer(item.obj, correct);
          addXP(correct ? 10 : 2);
          if (!correct) {
            addWrong({
              q: item.q,
              options: item.options,
              a: item.a,
              e: item.e,
              obj: item.obj ?? "",
              d: item.d ?? "",
            });
          }
        }}
        onComplete={() => {
          bumpQuizDone();
          addXP(25);
        }}
        empty={`No questions in ${DOMAIN_LABEL[domain] ?? domain}.`}
      />

      <div className="app-surface rounded-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Miss bank</h2>
            <p className="mt-1 text-xs text-muted">Mistakes are data. Revisit these until the trap disappears.</p>
          </div>
          <span className="rounded-full bg-bad-dim px-2.5 py-1 text-xs font-semibold text-bad">{wrongBank.length}</span>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 rounded-lg border border-ok/10 bg-ok-dim/30 p-3 text-sm text-ok">Clean slate. No misses recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((w) => (
              <li key={w.q} className="rounded-lg border border-border/60 bg-bg/25 p-3 text-xs leading-5 text-muted">
                <span className="font-semibold text-accent">{w.obj}</span> · {w.q.length > 140 ? `${w.q.slice(0, 140)}…` : w.q}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
