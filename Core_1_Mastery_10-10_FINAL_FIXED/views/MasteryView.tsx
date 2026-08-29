import { useMemo } from "react";
import { ArrowRight, CheckCircle2, CircleDashed, Target } from "lucide-react";
import { PanelLink } from "@/components/PanelLink";
import { Button } from "@/components/ui/button";
import { OBJECTIVES } from "@/data";
import type { Domain } from "@/data/types";
import { masteryPct, overallAccuracy, pureAccuracy, isPerfect, perfectionCount, useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DOMAIN_META: Record<Domain, { label: string; weight: number; color: string }> = {
  mobile: { label: "Mobile Devices", weight: 13, color: "text-violet-300" },
  network: { label: "Networking", weight: 23, color: "text-sky-300" },
  hardware: { label: "Hardware", weight: 25, color: "text-amber-300" },
  cloud: { label: "Virtualization & Cloud", weight: 11, color: "text-cyan-300" },
  trouble: { label: "Hardware & Network Troubleshooting", weight: 28, color: "text-red-300" },
};

export function MasteryView() {
  const mastery = useAppStore((s) => s.mastery);
  const accuracy = overallAccuracy(mastery);
  const perfect = perfectionCount(mastery, OBJECTIVES.map((o) => o.id));
  const pureOverall = (() => {
    const ids = OBJECTIVES.map((o) => o.id);
    const tested = ids.filter((id) => pureAccuracy(mastery, id) !== null);
    if (!tested.length) return null;
    const sum = tested.reduce((s, id) => s + (pureAccuracy(mastery, id) ?? 0), 0);
    return Math.round(sum / tested.length);
  })();

  const domains = useMemo(() => (Object.keys(DOMAIN_META) as Domain[]).map((domain) => {
    const objectives = OBJECTIVES.filter((o) => o.domain === domain).map((o) => ({ ...o, pct: masteryPct(mastery, o.id) }));
    const tested = objectives.filter((o) => o.pct !== null);
    const pct = tested.length ? Math.round(tested.reduce((sum, o) => sum + (o.pct ?? 0), 0) / tested.length) : null;
    const strong = objectives.filter((o) => (o.pct ?? -1) >= 85).length;
    return { domain, objectives, pct, strong };
  }), [mastery]);

  const strongObjectives = OBJECTIVES.filter((o) => (masteryPct(mastery, o.id) ?? -1) >= 85).length;
  const overall = OBJECTIVES.length ? Math.round((strongObjectives / OBJECTIVES.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <section className="hero-surface rounded-2xl p-6 sm:p-7">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent"><Target className="size-4" /><span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Mastery engine</span></div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight italic">Know exactly where you stand.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Mastery is tracked per objective, not just by quiz score. An objective becomes green at 85%+ and stays visible until you have proven it.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Summary value={`${strongObjectives}/${OBJECTIVES.length}`} label="Objectives strong" />
            <Summary value={`${overall}%`} label="Coverage at 85%+" />
            <Summary value={accuracy === null ? "—" : `${accuracy}%`} label="Overall raw accuracy" />
            <Summary value={`${perfect}/27`} label="PERFECTION 100" />
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {domains.map(({ domain, objectives, pct, strong }) => {
          const meta = DOMAIN_META[domain];
          const panel = domain === "mobile" ? "mobile" : domain === "network" ? "network" : domain === "hardware" ? "hardware" : domain === "cloud" ? "cloud" : "troubleshoot";
          return (
            <section key={domain} className="app-surface rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><span className={cn("text-sm font-semibold", meta.color)}>{meta.label}</span><span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-bold text-faint">{meta.weight}%</span></div>
                  <p className="mt-1 text-xs text-muted">{strong}/{objectives.length} objectives at 85%+</p>
                </div>
                <span className={cn("font-display text-2xl font-semibold tabular-nums", pct === null ? "text-faint" : pct >= 85 ? "text-ok" : pct >= 60 ? "text-mid" : "text-bad")}>{pct === null ? "—" : `${pct}%`}</span>
              </div>
              <div className="mt-4 space-y-2">
                {objectives.map((o) => {
                  const value = o.pct;
                  const high = value !== null && value >= 85;
                  return (
                    <div key={o.id} className="rounded-lg border border-border/60 bg-bg/20 p-3">
                      <div className="flex items-center gap-2">
                        {high ? <CheckCircle2 className="size-3.5 text-ok" /> : <CircleDashed className="size-3.5 text-faint" />}
                        <span className="text-[11px] font-bold text-accent">{o.id}</span>
                        <span className="min-w-0 truncate text-xs font-medium text-fg">{o.name}</span>
                        <span className="ml-auto text-[10px] font-bold tabular-nums text-muted">{value === null ? "—" : `${value}%`}</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2"><div className={cn("h-full rounded-full", high ? "bg-ok" : "bg-accent/65")} style={{ width: `${Math.max(value ?? 3, 3)}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <Button asChild variant="secondary" size="sm" className="mt-3"><PanelLink id={panel}>Train {meta.label} <ArrowRight className="size-3.5" /></PanelLink></Button>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl border border-border/70 bg-bg/25 p-3"><p className="font-display text-2xl font-semibold tabular-nums text-accent">{value}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{label}</p></div>;
}
