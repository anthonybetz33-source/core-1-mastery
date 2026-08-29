const STEPS = [
  {
    t: "Read everything first",
    d: "Budget, form factor, OS, required ports, and “must support” language.",
  },
  {
    t: "Underline constraints",
    d: "Mini-ITX, DDR5 only, needs 10 Gbps, must use existing PSU.",
  },
  {
    t: "Eliminate incompatibles",
    d: "Wrong socket, wrong RAM generation, missing power connectors, cable type mismatch.",
  },
  {
    t: "Verify the set works together",
    d: "CPU ↔ board ↔ RAM ↔ case ↔ PSU wattage and plugs ↔ storage interface.",
  },
  {
    t: "For cable/connector PBQs",
    d: "Match shape and purpose (24-pin to board, 8-pin CPU, PCIe to GPU, SATA power vs data).",
  },
  {
    t: "If stuck",
    d: "Flag, answer other questions, return with fresh eyes. Do not burn 15 minutes on one PBQ.",
  },
];

export function StrategyView() {
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        PBQ strategy
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Performance-based questions are worth multiple points. Treat them like a
        mini lab, not a trivia question.
      </p>
      <ol className="mt-8 space-y-5">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums text-accent shadow-[var(--shadow-border)]">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{s.t}</p>
              <p className="mt-1 text-sm text-muted">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <p className="text-sm leading-relaxed text-muted">
          Mindset: ask “Would this boot and work in a real PC?” If any single
          part breaks the build, it is wrong. PBQs reward technicians, not
          memorization of isolated facts.
        </p>
      </div>
    </div>
  );
}
