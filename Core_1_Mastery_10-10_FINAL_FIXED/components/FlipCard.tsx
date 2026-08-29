import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils";

export function FlipCard({
  front,
  back,
  hint = "Tap to flip",
  className,
  onFirstFlip,
}: {
  front: ReactNode;
  back: ReactNode;
  hint?: string;
  className?: string;
  onFirstFlip?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const seen = useRef(false);

  const flip = () => {
    setFlipped((current) => {
      const next = !current;

      if (next && !seen.current) {
        seen.current = true;
        onFirstFlip?.();
      }

      return next;
    });
  };

  const openExpanded = (event?: MouseEvent) => {
    event?.stopPropagation();
    setExpanded(true);
  };

  const closeExpanded = () => {
    setExpanded(false);
  };

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeExpanded();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  return (
    <>
      <article
        className={cn(
          "group relative h-[230px] w-full overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-border-hover)]",
          className,
        )}
      >
        {/* FRONT */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-200",
            flipped
              ? "pointer-events-none scale-[0.98] opacity-0"
              : "scale-100 opacity-100",
          )}
          aria-hidden={flipped}
        >
          {/* Visual itself */}
          <button
            type="button"
            className="flex min-h-0 min-w-0 flex-1 w-full cursor-zoom-in items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
            aria-label="Expand visual"
            onClick={openExpanded}
          >
            {front}
          </button>

          <div className="mt-2 flex w-full items-center justify-between gap-2">
            <span className="text-xs font-medium tracking-wide text-faint">
              {hint}
            </span>

            <button
              type="button"
              className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent transition hover:bg-accent/10"
              onClick={(event) => {
                event.stopPropagation();
                flip();
              }}
            >
              Flip
            </button>
          </div>
        </div>

        {/* BACK */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col overflow-y-auto p-4 text-left transition-all duration-200",
            flipped
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
          aria-hidden={!flipped}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent/70">
              Identification
            </span>

            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted transition hover:border-accent/30 hover:text-accent"
              onClick={(event) => {
                event.stopPropagation();
                flip();
              }}
            >
              Back
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {back}
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-accent/15 bg-accent/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-accent transition hover:bg-accent/10"
            onClick={openExpanded}
          >
            Expand card
          </button>
        </div>
      </article>

      {/* EXPANDED VIEW */}
      {expanded && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded visual"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeExpanded();
            }
          }}
        >
          <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-accent/15 bg-bg shadow-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-4 py-3 sm:px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                  Visual ID
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {flipped ? "Identification & purpose" : "Visual recognition"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent transition hover:bg-accent/10"
                  onClick={flip}
                >
                  {flipped ? "Show visual" : "Show answer"}
                </button>

                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-muted transition hover:border-accent/30 hover:text-accent"
                  aria-label="Close expanded visual"
                  onClick={closeExpanded}
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Expanded content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {!flipped ? (
                <div className="flex min-h-[55dvh] items-center justify-center p-5 sm:min-h-[60dvh] sm:p-8">
                  <div className="flex max-h-[65dvh] w-full items-center justify-center">
                    <div className="max-h-full max-w-full scale-100">
                      {front}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-10">
                  <div className="mx-auto max-w-2xl">
                    {back}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-border/80 px-4 py-3 text-[10px] text-faint sm:px-5">
              <span>Tap outside or press Esc to close</span>

              <button
                type="button"
                className="font-bold uppercase tracking-wider text-accent"
                onClick={flip}
              >
                {flipped ? "View visual" : "Flip to answer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
