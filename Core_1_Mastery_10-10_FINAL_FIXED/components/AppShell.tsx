import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, Radio, Zap } from "lucide-react";
import { PanelLink } from "@/components/PanelLink";
import { Sheet } from "@/components/ui/sheet";
import { GROUPS, MOBILE_TABS, NAV, type PanelId } from "@/lib/nav";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function currentPanel(pathname: string): PanelId {
  if (pathname === "/" || pathname === "") return "home";
  const id = pathname.replace(/^\//, "").split("/")[0] ?? "home";
  const found = NAV.find((n) => n.id === id);
  return found?.id ?? "home";
}

function NavLinks({
  active,
  onNavigate,
  compact,
}: {
  active: PanelId;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {NAV.filter((n) => n.group === group.id).map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <PanelLink
                  key={item.id}
                  id={item.id}
                  onClick={onNavigate}
                  className={cn(
                    "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "sidebar-active text-accent"
                      : "text-muted hover:bg-surface-2/70 hover:text-fg",
                    compact && "h-12",
                  )}
                >
                  <Icon className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.8} />
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto size-3 text-accent/70" />}
                </PanelLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function levelFromXp(xp: number) {
  return Math.floor(Math.max(0, xp) / 250) + 1;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = currentPanel(pathname);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const level = levelFromXp(hydrated ? xp : 0);
  const levelStart = (level - 1) * 250;
  const levelProgress = ((hydrated ? xp : 0) - levelStart) / 250 * 100;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="fixed inset-x-0 top-0 z-40 hidden h-16 items-center justify-between border-b border-border/80 bg-bg/95 px-6 backdrop-blur-xl md:flex">
        <PanelLink id="home" className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
            <Radio className="size-3.5" />
          </div>
          <div className="leading-none">
            <span className="brand-glow text-base font-black tracking-[-.03em]">Core 1 Mastery</span>
            <span className="ml-3 text-[9px] font-semibold uppercase tracking-[.18em] text-muted">CompTIA A+ 220-1201</span>
          </div>
        </PanelLink>
        <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[.16em] text-faint">
          <span>Level {level}</span>
          <span className="text-accent">{hydrated ? xp : 0} XP</span>
        </div>
      </div>

      <aside className="fixed inset-x-auto bottom-0 left-0 top-16 z-30 hidden w-[272px] flex-col border-r border-border/80 bg-bg/95 backdrop-blur-xl md:flex">
        <div className="px-5 pb-5 pt-6">
          <PanelLink id="home" className="group block">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent shadow-[0_0_28px_rgba(101,232,255,.08)]">
                <Radio className="size-4" />
              </div>
              <div>
                <p className="brand-glow text-xl font-black tracking-[-.04em]">
                  Core 1
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Mastery Engine
                </p>
              </div>
            </div>
          </PanelLink>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          <NavLinks active={active} />
        </nav>

        <div className="border-t border-border/80 p-4">
          <div className="rounded-xl border border-accent/12 bg-surface/70 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
                Level {level}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                <Zap className="size-3" /> {hydrated ? xp : 0} XP
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="neon-progress h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(3, Math.min(100, levelProgress))}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-faint">
              <span>{streak} answer streak</span>
              <span>{Math.max(0, level * 250 - (hydrated ? xp : 0))} to next</span>
            </div>
          </div>
        </div>
      </aside>

      <header className="mobile-glass sticky top-0 z-20 flex items-center justify-between border-b border-border/80 px-4 py-3 md:hidden">
        <PanelLink id="home" className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
            <Radio className="size-3.5" />
          </div>
          <div>
            <span className="brand-glow text-lg font-black tracking-[-.04em]">Core 1</span>
            <span className="ml-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">Mastery</span>
          </div>
        </PanelLink>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="rounded-full border border-accent/15 bg-accent/5 px-2 py-1 text-accent">LV {level}</span>
          <span className="text-muted">{hydrated ? xp : 0} XP</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:ml-[272px] md:px-12 md:pb-16 md:pt-5">
        <div className="mb-5 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint md:flex">
          <span>Core 1</span>
          <span>/</span>
          <span className="text-accent/70">{NAV.find((n) => n.id === active)?.label ?? "Home"}</span>
        </div>
        {children}
      </main>

      <nav className="mobile-glass fixed inset-x-0 bottom-0 z-30 border-t border-border/80 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_TABS.map((id) => {
            const item = NAV.find((n) => n.id === id);
            if (!item) return null;
            const Icon = item.icon;
            const isActive = active === id;
            const label = id === "quiz" ? "Train" : item.label.replace("Timed exam", "Exam");
            return (
              <PanelLink
                key={id}
                id={id}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors",
                  isActive ? "text-accent" : "text-muted",
                )}
              >
                {isActive && <span className="absolute top-0 h-0.5 w-10 rounded-full bg-accent shadow-[0_0_14px_rgba(101,232,255,.65)]" />}
                <Icon className="size-[17px]" strokeWidth={isActive ? 2.1 : 1.7} />
                {label}
              </PanelLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold",
              !MOBILE_TABS.includes(active) ? "text-accent" : "text-muted",
            )}
          >
            {!MOBILE_TABS.includes(active) && <span className="absolute top-0 h-0.5 w-10 rounded-full bg-accent shadow-[0_0_14px_rgba(101,232,255,.65)]" />}
            <Menu className="size-[17px]" strokeWidth={1.8} />
            More
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} title="Mastery command center">
        <NavLinks active={active} onNavigate={() => setMoreOpen(false)} compact />
      </Sheet>
    </div>
  );
}
