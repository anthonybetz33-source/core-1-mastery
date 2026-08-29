import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { matchData } from "@/data";
import { shuffle } from "@/lib/shuffle";
import { useAppStore } from "@/lib/store";
import { useClientReady } from "@/lib/use-client-ready";
import { cn } from "@/lib/utils";

const ROUND = 8;

type Pair = { left: string; right: string; id: number };

export function MatchView() {
  const addXP = useAppStore((s) => s.addXP);
  const ready = useClientReady();
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<{
    left: number | null;
    right: number | null;
  }>({ left: null, right: null });
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [pairs, setPairs] = useState<Pair[]>(() =>
    matchData.slice(0, ROUND).map((p, id) => ({ ...p, id })),
  );
  const [leftItems, setLeftItems] = useState(
    () => pairs.map((p) => ({ id: p.id, text: p.left })),
  );
  const [rightItems, setRightItems] = useState(
    () => pairs.map((p) => ({ id: p.id, text: p.right })),
  );

  const pool = useMemo(
    () => matchData.map((p, id) => ({ ...p, id })),
    [],
  );

  useEffect(() => {
    const start = (round * ROUND) % Math.max(pool.length, 1);
    let slice = pool.slice(start, start + ROUND);
    if (slice.length < ROUND) slice = pool.slice(0, ROUND);
    const next = ready ? shuffle(slice) : slice;
    setPairs(next);
    const left = next.map((p) => ({ id: p.id, text: p.left }));
    const right = next.map((p) => ({ id: p.id, text: p.right }));
    setLeftItems(ready ? shuffle(left) : left);
    setRightItems(ready ? shuffle(right) : right);
    setMatched(new Set());
    setSelected({ left: null, right: null });
    setWrong(null);
  }, [pool, round, ready]);

  function pick(side: "left" | "right", id: number) {
    if (matched.has(id)) return;
    const next = { ...selected, [side]: id };
    if (next.left !== null && next.right !== null) {
      if (next.left === next.right) {
        const copy = new Set(matched);
        copy.add(next.left);
        setMatched(copy);
        addXP(5);
        setSelected({ left: null, right: null });
        if (copy.size === pairs.length) addXP(25);
      } else {
        setWrong([next.left, next.right]);
        setTimeout(() => {
          setWrong(null);
          setSelected({ left: null, right: null });
        }, 400);
      }
    } else {
      setSelected(next);
    }
  }

  function newRound() {
    setRound((r) => r + 1);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        Match game
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Eight pairs per round — pick one from each column.
      </p>
      <div className="mt-6 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted">
          <span className="tabular-nums">
            Matches {matched.size} / {pairs.length}
          </span>
          <span>Round {round + 1}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-faint">
              Item
            </p>
            <div className="flex flex-col gap-2">
              {leftItems.map((item) => (
                <button
                  key={`l-${item.id}`}
                  type="button"
                  disabled={matched.has(item.id)}
                  onClick={() => pick("left", item.id)}
                  className={cn(
                    "min-h-12 rounded-md px-3 py-2.5 text-left text-sm font-medium",
                    matched.has(item.id) && "bg-ok-dim text-ok opacity-60",
                    selected.left === item.id && "bg-surface-2 text-accent",
                    wrong && wrong[0] === item.id && "bg-bad-dim text-bad",
                    !matched.has(item.id) &&
                      selected.left !== item.id &&
                      !(wrong && wrong[0] === item.id) &&
                      "bg-surface-2 text-fg shadow-[var(--shadow-border)]",
                  )}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-faint">
              Matches with
            </p>
            <div className="flex flex-col gap-2">
              {rightItems.map((item) => (
                <button
                  key={`r-${item.id}`}
                  type="button"
                  disabled={matched.has(item.id)}
                  onClick={() => pick("right", item.id)}
                  className={cn(
                    "min-h-12 rounded-md px-3 py-2.5 text-left text-sm font-medium",
                    matched.has(item.id) && "bg-ok-dim text-ok opacity-60",
                    selected.right === item.id && "bg-surface-2 text-accent",
                    wrong && wrong[1] === item.id && "bg-bad-dim text-bad",
                    !matched.has(item.id) &&
                      selected.right !== item.id &&
                      !(wrong && wrong[1] === item.id) &&
                      "bg-surface-2 text-fg shadow-[var(--shadow-border)]",
                  )}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        </div>
        {matched.size === pairs.length ? (
          <p className="mt-4 text-sm font-medium text-ok">
            Round clear. Start a new round for more pairs.
          </p>
        ) : null}
        <Button variant="secondary" className="mt-5" onClick={newRound}>
          New round
        </Button>
      </div>
    </div>
  );
}
