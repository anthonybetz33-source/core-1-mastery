import { Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Hardware install & upgrades",
  "Power connectors",
  "Storage & RAID",
  "Mobile hardware & config",
  "Printers & maintenance",
  "Ports & protocols",
  "SOHO & wireless",
  "Cloud models & hypervisors",
  "Troubleshooting methodology",
];

const CHECKS = [
  { id: "c1", label: "LGA 1700 vs AM5 identification" },
  { id: "c2", label: "DDR4 vs DDR5 and dual-channel" },
  { id: "c3", label: "24-pin, CPU 8-pin, PCIe, SATA power" },
  { id: "c4", label: "SATA vs NVMe decision criteria" },
  { id: "c5", label: "Common ports (22, 53, 80, 443, 3389…)" },
  { id: "c6", label: "Laser printer parts" },
  { id: "c7", label: "SOHO: SSID, WPA3, DHCP" },
  { id: "c8", label: "IaaS / PaaS / SaaS and hypervisors" },
  { id: "c9", label: "POST, S.M.A.R.T., RAID symptoms" },
  { id: "c10", label: "PBQ flag-and-return strategy" },
];

export function TopicsView() {
  const checklist = useAppStore((s) => s.checklist);
  const setChecklist = useAppStore((s) => s.setChecklist);
  const addXP = useAppStore((s) => s.addXP);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">
        High-yield topics
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {TOPICS.map((t) => (
          <div
            key={t}
            className="flex items-center gap-2.5 rounded-lg bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]"
          >
            <Check className="size-4 text-ok" strokeWidth={1.75} />
            {t}
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-display text-xl font-medium tracking-tight">
        Study checklist
      </h2>
      <ul className="mt-4 space-y-2">
        {CHECKS.map((c) => {
          const done = !!checklist[c.id];
          return (
            <li key={c.id}>
              <label
                className={cn(
                  "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg bg-surface px-4 py-3 text-sm shadow-[var(--shadow-border)]",
                  done && "text-muted line-through opacity-60",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-accent"
                  checked={done}
                  onChange={(e) => {
                    setChecklist(c.id, e.target.checked);
                    if (e.target.checked) addXP(3);
                  }}
                />
                {c.label}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
