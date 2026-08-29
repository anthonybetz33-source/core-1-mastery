import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, Check, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/FilterBar";
import { hardwareCards, networkCards, mobileCards, cloudCards, troubleCards, memoryCards, powerCards, dataCards } from "@/data";
import type { StudyCard } from "@/data/types";
import { shuffle } from "@/lib/shuffle";
import { useAppStore } from "@/lib/store";

const LESSONS: { id: string; label: string; cards: StudyCard[] }[] = [
  { id: "hardware", label: "Hardware", cards: hardwareCards },
  { id: "network", label: "Networking", cards: networkCards },
  { id: "mobile", label: "Mobile", cards: mobileCards },
  { id: "cloud", label: "Cloud", cards: cloudCards },
  { id: "trouble", label: "Troubleshooting", cards: troubleCards },
  { id: "connectors", label: "Connectors", cards: [...powerCards, ...dataCards] },
  { id: "memory", label: "Memory", cards: memoryCards },
];

export function TeachMeView() {
  const addXP = useAppStore((s) => s.addXP);
  const [filter, setFilter] = useState("all");
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const pool = useMemo(() => filter === "all" ? LESSONS.flatMap((x) => x.cards.map((card) => ({ ...card, lesson: x.label }))) : (LESSONS.find((x) => x.id === filter)?.cards ?? []).map((card) => ({ ...card, lesson: LESSONS.find((x) => x.id === filter)?.label ?? filter })), [filter]);
  const [deck, setDeck] = useState(() => pool);
  const card = deck[index % Math.max(deck.length, 1)];

  useEffect(() => {
    setDeck(shuffle(pool));
    setIndex(0);
    setShown(false);
  }, [pool]);

  function reshuffle() { setDeck(shuffle(pool)); setIndex(0); setShown(false); }
  function next() { setShown(false); setIndex((i) => i + 1); addXP(2); }

  return (
    <div className="space-y-5">
      <section className="hero-surface rounded-2xl p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent"><BrainCircuit className="size-4" /><span className="text-[10px] font-semibold uppercase tracking-[.2em]">Teach Me mode</span></div>
          <h1 className="mt-2 font-display text-4xl font-semibold italic tracking-tight">Understand it before you memorize it.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Short, focused lessons built from the app's study bank. Read the idea, explain it in your own words, then reveal the details and move on.</p>
        </div>
      </section>

      <FilterBar options={[{ id: "all", label: "All lessons" }, ...LESSONS.map((x) => ({ id: x.id, label: x.label }))]} value={filter} onChange={(id) => { setFilter(id); setIndex(0); setShown(false); }} />

      {card ? (
        <section className="teach-card app-surface overflow-hidden rounded-[1.5rem]">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-7">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-accent"><Sparkles className="size-3.5" /> {card.lesson}</span>
            <span className="text-[10px] font-semibold tabular-nums text-faint">{(index % deck.length) + 1} / {deck.length}</span>
          </div>
          <div className="p-6 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-faint">Core concept</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">{card.title}</h2>
            <div className="mt-7 rounded-2xl border border-accent/10 bg-accent/[.035] p-5 sm:p-6">
              <div className="flex items-start gap-3"><Lightbulb className="mt-0.5 size-5 shrink-0 text-accent" /><div><p className="text-sm font-semibold">Your first move</p><p className="mt-1 text-sm leading-6 text-muted">Before reading the answer, say what this does, where you would find it, and what problem it solves.</p></div></div>
            </div>
            {shown ? (
              <div className="mt-4 rounded-2xl border border-ok/15 bg-ok-dim/35 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-ok"><Check className="size-4" /><span className="text-xs font-bold uppercase tracking-[.14em]">Lock it in</span></div>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-fg/90">{card.detail}</p>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="lg" onClick={() => setShown(true)} disabled={shown}><Lightbulb className="size-4" /> {shown ? "Revealed" : "Teach me"}</Button>
              <Button size="lg" variant="secondary" onClick={next} disabled={!shown}>I know it <ArrowRight className="size-4" /></Button>
              <Button variant="ghost" onClick={reshuffle}><RotateCcw className="size-4" /> New deck</Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
