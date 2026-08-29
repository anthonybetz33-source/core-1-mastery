import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Maximize2, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SvgDiagram } from "@/components/SvgDiagram";

export function DiagramViewer({ id, label = "Visual" }: { id: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const suppressClick = useRef(false);
  const timer = useRef<number | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button, [role="dialog"] a, [role="dialog"] [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => !element.hasAttribute("disabled"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const closeButton = document.querySelector<HTMLElement>('[role="dialog"] button[aria-label="Close visual"]');
      closeButton?.focus();
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  function cancelPress() {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    pressStart.current = null;
  }

  function startPress(event: ReactPointerEvent<HTMLButtonElement>) {
    suppressClick.current = false;
    pressStart.current = { x: event.clientX, y: event.clientY };
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      suppressClick.current = true;
      pressStart.current = null;
      setOpen(true);
    }, 480);
  }

  function movePress(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = pressStart.current;
    if (!start) return;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved > 10) cancelPress();
  }

  return (
    <>
      <button
        type="button"
        aria-label={`Expand ${label}`}
        className="diagram-trigger group relative flex min-h-[150px] w-full touch-manipulation items-center justify-center overflow-hidden rounded-2xl border border-accent/10 bg-[radial-gradient(circle_at_50%_45%,rgba(101,232,255,.08),transparent_60%)] p-4"
        onPointerDown={startPress}
        onPointerMove={movePress}
        onPointerUp={cancelPress}
        onPointerCancel={cancelPress}
        onClick={() => { if (!suppressClick.current) setOpen(true); suppressClick.current = false; }}
      >
        <SvgDiagram id={id} className="h-[135px] w-full max-w-[340px] transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-border/80 bg-bg/75 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-faint backdrop-blur">
          <Maximize2 className="size-3" /> Tap / hold to expand
        </span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={label} onClick={() => setOpen(false)}>
          <div className="diagram-modal relative w-full max-w-4xl overflow-hidden rounded-[1.6rem] border border-accent/20 bg-[#080d12] shadow-[0_0_100px_rgba(101,232,255,.14)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-accent"><ZoomIn className="size-4" /> {label}</div>
              <Button variant="secondary" size="icon" aria-label="Close visual" onClick={() => setOpen(false)}><X className="size-4" /></Button>
            </div>
            <div className="grid min-h-[48vh] place-items-center p-6 sm:p-12">
              <SvgDiagram id={id} className="max-h-[65vh] min-h-[260px] w-full max-w-3xl" />
            </div>
            <div className="border-t border-border/70 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[.16em] text-faint">Tap outside or press Escape to close</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
