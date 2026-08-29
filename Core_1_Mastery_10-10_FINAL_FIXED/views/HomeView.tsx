import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Flame,
  Gauge,
  Layers,
  ListChecks,
  Radar,
  RotateCcw,
  ScanSearch,
  Target,
  Timer,
  Trophy,
  Wrench,
  Zap,
} from "lucide-react";
import { PanelLink } from "@/components/PanelLink";
import { Button } from "@/components/ui/button";
import { allQuestions, OBJECTIVES } from "@/data";
import type { Domain, Objective } from "@/data/types";
import { masteryPct, overallAccuracy, totalAttempts, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

const START = [
  { id: "quiz" as const, label: "Adaptive training", detail: "The engine hunts your weakest concepts.", icon: BrainCircuit, accent: "cyan" },
  { id: "exam" as const, label: "Full exam simulation", detail: "90 questions · 90 minutes · real pressure.", icon: Timer, accent: "violet" },
  { id: "pbq" as const, label: "PBQ mission lab", detail: "Build, configure, troubleshoot, prove it.", icon: Wrench, accent: "green" },
  { id: "teach" as const, label: "Teach Me", detail: "Learn the concept before you test it.", icon: Gauge, accent: "amber" },
  { id: "visual" as const, label: "Visual identification", detail: "Cables, ports, parts and diagrams.", icon: ScanSearch, accent: "cyan" },
  { id: "review" as const, label: "Review misses", detail: "Turn every wrong answer into a point.", icon: RotateCcw, accent: "red" },
];

const DOMAIN_META: Record<Domain, { label: string; weight: number; color: string; blurb: string }> = {
  mobile: { label: "Mobile devices", weight: 13, color: "text-violet-300", blurb: "Devices, accessories, wireless and repair" },
  network: { label: "Networking", weight: 23, color: "text-sky-300", blurb: "Ports, protocols, addressing and Wi-Fi" },
  hardware: { label: "Hardware", weight: 25, color: "text-amber-300", blurb: "Components, RAM, storage, power and printers" },
  cloud: { label: "Cloud / virtualization", weight: 11, color: "text-cyan-300", blurb: "VMs, hypervisors and cloud characteristics" },
  trouble: { label: "Troubleshooting", weight: 28, color: "text-red-300", blurb: "Diagnose symptoms and choose the next move" },
};

function weakestObjective(objectives: Objective[], mastery: Record<string, { right: number; total: number }>) {
  return objectives
    .map((o) => ({ ...o, pct: masteryPct(mastery, o.id) }))
    .sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1))[0];
}

function readinessScore(objectives: Objective[], mastery: Record<string, { right: number; total: number }>) {
  const domainWeights: Record<Domain, number> = {
    mobile: 13,
    network: 23,
    hardware: 25,
    cloud: 11,
    trouble: 28,
  };
  const tested = objectives
    .map((o) => ({ pct: masteryPct(mastery, o.id), weight: domainWeights[o.domain] }))
    .filter((item): item is { pct: number; weight: number } => item.pct !== null);
  if (!tested.length) return 0;
  const totalWeight = tested.reduce((sum, item) => sum + item.weight, 0);
  return Math.round(tested.reduce((sum, item) => sum + item.pct * item.weight, 0) / totalWeight);
}

export function HomeView() {
  const xp = useAppStore((s) => s.xp);
  const quizzesDone = useAppStore((s) => s.quizzesDone);
  const bestStreak = useAppStore((s) => s.bestStreak);
  const streak = useAppStore((s) => s.streak);
  const mastery = useAppStore((s) => s.mastery);
  const wrongBank = useAppStore((s) => s.wrongBank);
  const hydrated = useAppStore((s) => s.hydrated);
  const setFocusWeakNext = useAppStore((s) => s.setFocusWeakNext);

  const weak = OBJECTIVES.map((o) => ({ ...o, pct: masteryPct(mastery, o.id) }))
    .filter((o) => o.pct === null || o.pct < 85)
    .sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1))
    .slice(0, 4);
  const weakest = weakestObjective(OBJECTIVES, mastery);
  const attempts = totalAttempts(mastery);
  const accuracy = overallAccuracy(mastery);
  const readiness = hydrated ? readinessScore(OBJECTIVES, mastery) : 0;
  const highCount = OBJECTIVES.filter((o) => (masteryPct(mastery, o.id) ?? -1) >= 85).length;
  const level = Math.floor(Math.max(0, xp) / 250) + 1;
  const levelProgress = ((Math.max(0, xp) - (level - 1) * 250) / 250) * 100;
  const testedCount = OBJECTIVES.filter((o) => masteryPct(mastery, o.id) !== null).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="hero-surface rounded-[1.45rem] p-5 sm:p-7 lg:p-8">
        <div className="hero-grid" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="command-chip inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[.18em]">
                <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-accent/50" /><span className="relative size-2 rounded-full bg-accent" /></span>
                Core 1 · 220-1201
              </span>
              <span className="rounded-full border border-white/8 bg-white/[.025] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-muted">Mission control</span>
              {streak > 0 && <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/15 bg-orange-300/5 px-2.5 py-1 text-[10px] font-bold text-orange-200"><Flame className="size-3" /> {streak} streak</span>}
            </div>
            <p className="eyebrow mt-6 text-accent/70">Your certification training system</p>
            <h1 className="brand-glow mt-2 text-4xl font-black leading-[.98] tracking-[-.045em] sm:text-5xl lg:text-6xl">
              Don't just pass.<br /><span className="text-accent">Master Core 1.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Practice, understand the trap, fix the gap, then prove you can do it again. The dashboard changes with your performance instead of treating every question the same.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button asChild size="lg" className="shadow-[0_0_34px_rgba(127,169,191,.12)]"><PanelLink id="quiz">Start adaptive training <ArrowRight className="size-4" /></PanelLink></Button>
              <Button asChild variant="outline" size="lg"><PanelLink id="pbq">Enter PBQ lab <Wrench className="size-4" /></PanelLink></Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[.14em] text-faint">
              <span>{allQuestions.length} question bank</span><span>27 objectives</span><span>5 exam domains</span><span>Visual + PBQ training</span>
            </div>
          </div>

          <div className="mx-auto lg:mr-2">
            <div className="ring size-40 sm:size-44" style={{ "--progress": `${readiness * 3.6}deg` } as CSSProperties}>
              <div className="text-center">
                <p className="text-4xl font-black tracking-[-.05em] text-fg">{readiness}<span className="text-lg text-accent">%</span></p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[.2em] text-faint">readiness</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[.16em] text-faint">{testedCount}/{OBJECTIVES.length} objectives tested</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric icon={Target} label="Mastery" value={hydrated ? `${highCount}/${OBJECTIVES.length}` : "—"} sub="objectives at 85%+" />
        <Metric icon={Zap} label="Accuracy" value={hydrated && accuracy !== null ? `${accuracy}%` : "—"} sub={`${attempts} answers`} />
        <Metric icon={Flame} label="Best streak" value={hydrated ? String(bestStreak) : "—"} sub="correct in a row" />
        <Metric icon={Trophy} label="XP" value={hydrated ? String(xp) : "—"} sub={`${quizzesDone} sessions`} />
        <div className="app-surface col-span-2 rounded-xl p-4 lg:col-span-1">
          <div className="flex items-center justify-between"><span className="eyebrow">Level {level}</span><span className="text-xs font-black text-accent">{Math.round(levelProgress)}%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="neon-progress h-full rounded-full bg-accent" style={{ width: `${Math.max(4, levelProgress)}%` }} /></div>
          <p className="mt-2 text-[10px] text-muted">{Math.max(0, level * 250 - (hydrated ? xp : 0))} XP to next level</p>
        </div>
      </section>

      <section className="mission-card relative overflow-hidden rounded-[1.25rem] p-5 sm:p-6">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-accent"><Radar className="size-4" /><span className="eyebrow text-accent">Next best mission</span></div>
            <h2 className="mt-2 text-2xl font-black tracking-[-.025em]">{hydrated && weakest ? `${weakest.id} · ${weakest.name}` : "Establish your baseline"}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {hydrated && weakest?.pct !== null ? `You're sitting at ${weakest.pct}% here. Closing this gap has a higher payoff than grinding what you already know.` : "Your first session tells the engine where to aim. After that, training becomes targeted."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[.15em] text-faint">
              <span className="rounded-full border border-accent/10 bg-accent/5 px-2.5 py-1 text-accent">Adaptive weighting</span>
              <span className="rounded-full border border-white/8 bg-white/[.025] px-2.5 py-1">Untested concepts first</span>
              <span className="rounded-full border border-white/8 bg-white/[.025] px-2.5 py-1">Miss bank enabled</span>
            </div>
          </div>
          <Button asChild size="lg" onClick={() => setFocusWeakNext(true)}><PanelLink id="quiz">Attack my weak spots <ArrowRight className="size-4" /></PanelLink></Button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><p className="eyebrow">Launch bay</p><h2 className="mt-1 text-xl font-black tracking-[-.02em]">Choose your training mode</h2></div>{wrongBank.length > 0 && <PanelLink id="review" className="text-xs font-bold text-accent hover:underline">{wrongBank.length} misses waiting →</PanelLink>}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {START.map((item) => { const Icon = item.icon; return (
            <PanelLink key={item.id} id={item.id} className="app-surface group rounded-xl p-4 transition-transform hover:-translate-y-1">
              <div className="flex items-start justify-between gap-3"><div className={cn("grid size-10 place-items-center rounded-xl border", item.accent === "violet" ? "border-violet-300/15 bg-violet-300/5 text-violet-200" : item.accent === "green" ? "border-ok/15 bg-ok/5 text-ok" : item.accent === "amber" ? "border-mid/15 bg-mid/5 text-mid" : item.accent === "red" ? "border-bad/15 bg-bad/5 text-bad" : "border-accent/15 bg-accent/5 text-accent")}><Icon className="size-4.5" /></div><ArrowRight className="mt-1 size-4 text-faint transition-transform group-hover:translate-x-1 group-hover:text-accent" /></div>
              <p className="mt-4 text-sm font-black">{item.label}</p><p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
            </PanelLink>
          ); })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3"><div><p className="eyebrow">Exam map</p><h2 className="mt-1 text-xl font-black tracking-[-.02em]">Where your points live</h2></div><span className="hidden text-[10px] font-bold uppercase tracking-[.15em] text-faint sm:block">Weighted by exam domain</span></div>
        <div className="grid gap-3 md:grid-cols-5">
          {(Object.keys(DOMAIN_META) as Domain[]).map((domain) => {
            const meta = DOMAIN_META[domain];
            const domainObjectives = OBJECTIVES.filter((o) => o.domain === domain);
            const values = domainObjectives.map((o) => masteryPct(mastery, o.id)).filter((v): v is number => v !== null);
            const pct = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
            const id = domain === "mobile" ? "mobile" : domain === "network" ? "network" : domain === "hardware" ? "hardware" : domain === "cloud" ? "cloud" : "troubleshoot";
            return <PanelLink key={domain} id={id} className="domain-card app-surface rounded-xl p-4">
              <div className="flex items-center justify-between gap-2"><span className={cn("text-sm font-black", meta.color)}>{meta.label}</span><span className="rounded-full border border-white/8 bg-white/[.025] px-2 py-1 text-[9px] font-black text-faint">{meta.weight}%</span></div>
              <p className="mt-2 min-h-8 text-[11px] leading-4 text-muted">{meta.blurb}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-accent/80" style={{ width: `${Math.max(pct ?? 3, 3)}%` }} /></div>
              <div className="mt-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.12em] text-faint"><span>{pct === null ? "Not tested" : `${pct}% mastery`}</span><ArrowRight className="size-3 text-accent/60" /></div>
            </PanelLink>;
          })}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="app-surface rounded-xl p-4"><div className="flex items-center gap-2 text-accent"><ListChecks className="size-4" /><span className="eyebrow">Training principle</span></div><p className="mt-2 text-sm font-semibold">A wrong answer is not a failure state. It's a diagnostic signal.</p><p className="mt-1 text-xs leading-5 text-muted">The goal is reliable recall under pressure, not a pretty practice percentage.</p></div>
        <div className="app-surface rounded-xl p-4"><div className="flex items-center gap-2 text-ok"><CheckCircle2 className="size-4" /><span className="eyebrow">Readiness rule</span></div><p className="mt-2 text-sm font-semibold">85%+ is a mastery target, not a fake CompTIA score.</p><p className="mt-1 text-xs leading-5 text-muted">Practice accuracy and exam scaled scoring are different things. This app keeps that distinction honest.</p></div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub: string }) {
  return <div className="app-surface rounded-xl p-4"><div className="flex items-center gap-2 text-accent"><Icon className="size-3.5" /><span className="eyebrow">{label}</span></div><p className="stat-number mt-2 text-2xl font-black">{value}</p><p className="mt-0.5 text-[10px] text-muted">{sub}</p></div>;
}
