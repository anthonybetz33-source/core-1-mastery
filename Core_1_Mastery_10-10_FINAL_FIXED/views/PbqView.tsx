import { useEffect, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { pbqLaser, pbqParts, pbqT568B, pbqTools } from "@/data";
import { shuffle } from "@/lib/shuffle";
import { useAppStore } from "@/lib/store";
import { useClientReady } from "@/lib/use-client-ready";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "laser", label: "Laser steps" },
  { id: "tool", label: "Pick the tool" },
  { id: "t568", label: "T568B order" },
  { id: "parts", label: "Compatible parts" },
];

function OrderLab({
  prompt,
  correct,
  onWin,
}: {
  prompt: string;
  correct: string[];
  onWin: () => void;
}) {
  const ready = useClientReady();
  const [order, setOrder] = useState(correct);
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<"ok" | "bad" | null>(null);

  useEffect(() => {
    setOrder(ready ? shuffle(correct) : correct);
    setPicked([]);
    setStatus(null);
  }, [correct, ready]);

  function tap(step: string) {
    if (picked.includes(step) || status) return;
    const next = [...picked, step];
    setPicked(next);
    if (next.length === correct.length) {
      const ok = next.every((s, i) => s === correct[i]);
      setStatus(ok ? "ok" : "bad");
      if (ok) onWin();
    }
  }

  return (
    <div>
      <p className="font-medium">{prompt}</p>
      <p className="mt-3 min-h-10 text-sm font-medium text-accent">
        {picked.join(" → ")}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {order.map((step) => (
          <button
            key={step}
            type="button"
            disabled={picked.includes(step) || !!status}
            onClick={() => tap(step)}
            className={cn(
              "min-h-12 rounded-md px-4 py-3 text-left text-sm font-medium",
              picked.includes(step)
                ? "bg-ok-dim text-ok"
                : "bg-surface-2 text-fg shadow-[var(--shadow-border)]",
            )}
          >
            {step}
          </button>
        ))}
      </div>
      {status === "ok" ? (
        <p className="mt-4 text-sm font-medium text-ok">Correct order.</p>
      ) : null}
      {status === "bad" ? (
        <p className="mt-4 text-sm font-medium text-bad">
          Not quite. Correct: {correct.join(" → ")}
        </p>
      ) : null}
    </div>
  );
}

function ChoiceLab({
  prompt,
  options,
  answer,
  onWin,
}: {
  prompt: string;
  options: string[];
  answer: string;
  onWin: () => void;
}) {
  const ready = useClientReady();
  const [shuffled, setShuffled] = useState(options);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setShuffled(ready ? shuffle(options) : options);
    setLocked(false);
    setPicked(null);
  }, [options, ready]);

  return (
    <div>
      <p className="font-medium">{prompt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {shuffled.map((o) => {
          const isAns = o === answer;
          const isPick = o === picked;
          return (
            <button
              key={o}
              type="button"
              disabled={locked}
              onClick={() => {
                setLocked(true);
                setPicked(o);
                if (o === answer) onWin();
              }}
              className={cn(
                "min-h-12 rounded-md px-4 py-3 text-left text-sm font-medium",
                !locked && "bg-surface-2 text-fg shadow-[var(--shadow-border)]",
                locked && isAns && "bg-ok-dim text-ok",
                locked && isPick && !isAns && "bg-bad-dim text-bad",
                locked && !isAns && !isPick && "bg-surface-2 text-muted",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PbqView() {
  const addXP = useAppStore((s) => s.addXP);
  const [tab, setTab] = useState("laser");
  const [toolIdx, setToolIdx] = useState(0);
  const [partsIdx, setPartsIdx] = useState(0);
  const [reset, setReset] = useState(0);

  const tool = pbqTools[toolIdx % pbqTools.length]!;
  const part = pbqParts[partsIdx % pbqParts.length]!;
  const toolOpts = [
    "Crimper",
    "Toner probe",
    "Punchdown tool",
    "Cable tester",
    "Loopback plug",
    "Multimeter",
    "Wi-Fi analyzer",
    "POST card",
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        PBQ labs
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Mini performance tasks — order steps, pick the tool, match the standard.
        Closest thing to exam PBQs.
      </p>
      <div className="mt-5 mb-6">
        <FilterBar options={TABS} value={tab} onChange={setTab} />
      </div>
      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        {tab === "laser" ? (
          <div key={reset}>
            <OrderLab
              prompt="Order the laser printing process — tap steps from first to last."
              correct={pbqLaser}
              onWin={() => addXP(25)}
            />
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setReset((n) => n + 1)}
            >
              Reset
            </Button>
          </div>
        ) : null}
        {tab === "tool" ? (
          <div>
            <ChoiceLab
              key={toolIdx}
              prompt={`Scenario: ${tool.s}`}
              options={toolOpts}
              answer={tool.a}
              onWin={() => addXP(10)}
            />
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setToolIdx((n) => n + 1)}
            >
              Next scenario
            </Button>
          </div>
        ) : null}
        {tab === "t568" ? (
          <div key={`t-${reset}`}>
            <OrderLab
              prompt="T568B pin order (pin 1 → pin 8) — tap colors in order."
              correct={pbqT568B}
              onWin={() => addXP(25)}
            />
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setReset((n) => n + 1)}
            >
              Reset
            </Button>
          </div>
        ) : null}
        {tab === "parts" ? (
          <div>
            <ChoiceLab
              key={partsIdx}
              prompt={part.s}
              options={part.opts}
              answer={part.opts[part.a] ?? ""}
              onWin={() => addXP(10)}
            />
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setPartsIdx((n) => n + 1)}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
