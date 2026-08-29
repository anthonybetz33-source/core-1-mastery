import { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { GLOSSARY } from "@/data";
import type { GlossaryEntry } from "@/data";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Hardware", "Networking", "Mobile", "Virtualization & Cloud", "Troubleshooting", "Security & Operations", "Printers"] as const;

type Category = (typeof CATEGORIES)[number];

export function GlossaryView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return GLOSSARY.filter((entry) => {
      const categoryMatch = category === "All" || entry.category === category;
      if (!categoryMatch) return false;
      if (!needle) return true;
      return `${entry.term} ${entry.definition} ${entry.objective ?? ""}`.toLowerCase().includes(needle);
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="hero-surface rounded-[1.45rem] p-5 sm:p-7">
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 text-accent"><BookOpen className="size-4" /><span className="eyebrow text-accent">Reference desk</span></div>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] sm:text-4xl">Core 1 Glossary</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">A clean, exam-focused reference for the terms, technologies, protocols, ports, components, and troubleshooting language you need to recognize quickly.</p>
        </div>
      </section>

      <section className="app-surface rounded-xl p-3.5 sm:p-4">
        <label htmlFor="glossary-search" className="sr-only">Search glossary</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input id="glossary-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search terms, definitions, or objectives…" className="w-full rounded-lg border border-border bg-bg/70 py-3 pl-10 pr-10 text-sm text-fg outline-none placeholder:text-faint focus:border-accent/50 focus:ring-2 focus:ring-accent/10" />
          {query && <button type="button" aria-label="Clear glossary search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"><X className="size-4" /></button>}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Glossary categories">
          {CATEGORIES.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition", category === item ? "border-accent/35 bg-accent/10 text-accent" : "border-border bg-bg/30 text-muted hover:text-fg")}>{item}</button>)}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[.14em] text-faint"><span>{filtered.length} terms</span><span>{query ? `Matches for “${query}”` : category === "All" ? "All categories" : category}</span></div>

      {filtered.length === 0 ? (
        <section className="app-surface rounded-xl p-8 text-center"><p className="text-sm font-semibold">No glossary entries match that search.</p><p className="mt-1 text-xs text-muted">Try a broader term or clear the filter.</p></section>
      ) : (
        <section className="grid gap-3 md:grid-cols-2">
          {filtered.map((entry: GlossaryEntry) => (
            <article key={`${entry.term}-${entry.objective ?? ""}`} className="app-surface rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3"><h2 className="text-base font-black tracking-[-.015em]">{entry.term}</h2><span className="shrink-0 rounded-full border border-border bg-bg/40 px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-faint">{entry.category}</span></div>
              <p className="mt-2 text-sm leading-6 text-muted">{entry.definition}</p>
              {entry.objective && <p className="mt-3 text-[9px] font-bold uppercase tracking-[.14em] text-accent/70">Objective {entry.objective}</p>}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
