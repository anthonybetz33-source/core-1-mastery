import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { FlipCard } from "@/components/FlipCard";
import { DiagramViewer } from "@/components/DiagramViewer";
import {
  cloudCards,
  dataCards,
  hardwareCards,
  memoryCards,
  mobileCards,
  networkCards,
  portsCards,
  powerCards,
  specsCards,
  toolsItems,
  troubleCards,
  visualItems,
} from "@/data";
import type { StudyCard, VisualItem } from "@/data/types";
import { useAppStore } from "@/lib/store";
import type { PanelId } from "@/lib/nav";

function StudyGrid({
  title,
  lead,
  cards,
  filters,
}: {
  title: string;
  lead: string;
  cards: StudyCard[];
  filters?: { id: string; label: string }[];
}) {
  const addXP = useAppStore((s) => s.addXP);
  const [filter, setFilter] = useState("all");
  const items =
    filter === "all" ? cards : cards.filter((c) => c.cat === filter);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{lead}</p>
      {filters ? (
        <div className="mt-5">
          <FilterBar options={filters} value={filter} onChange={setFilter} />
        </div>
      ) : null}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <FlipCard
            key={c.title}
            onFirstFlip={() => addXP(1)}
            front={
              <strong className="text-center text-lg font-medium text-accent">
                {c.title}
              </strong>
            }
            back={
              <p className="whitespace-pre-line text-sm leading-relaxed text-fg">
                {c.detail}
              </p>
            }
          />
        ))}
      </div>
    </div>
  );
}

function VisualGrid({
  title,
  lead,
  items,
  filters,
  label = "Connector",
}: {
  title: string;
  lead: string;
  items: VisualItem[];
  filters: { id: string; label: string }[];
  label?: string;
}) {
  const addXP = useAppStore((s) => s.addXP);
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? items : items.filter((i) => i.cat === filter);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{lead}</p>
      <div className="mt-5">
        <FilterBar options={filters} value={filter} onChange={setFilter} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {shown.map((item) => (
          <FlipCard
            key={item.name}
            className="h-[230px]"
            onFirstFlip={() => addXP(1)}
            front={
              <>
                <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
                  {label}
                </span>
                <DiagramViewer id={item.svg} label={item.name} />
              </>
            }
            back={
              <>
                <p className="text-base font-medium text-accent">{item.name}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                  {item.desc}
                </p>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}

export function StudyView({ panel }: { panel: PanelId }) {
  const memoryFilters = useMemo(
    () => [
      { id: "all", label: "All" },
      { id: "ports", label: "Ports" },
      { id: "power", label: "Power" },
      { id: "storage", label: "Storage / RAID" },
      { id: "network", label: "Network" },
      { id: "trouble", label: "Troubleshoot" },
      { id: "cloud", label: "Cloud" },
    ],
    [],
  );

  switch (panel) {
    case "hardware":
      return (
        <StudyGrid
          title="Hardware"
          lead="Domain 3 is about 25% of the exam. Sockets, power math, RAID, storage speeds, and install rules show up on PBQs."
          cards={hardwareCards}
        />
      );
    case "connectors":
      return (
        <div className="space-y-10">
          <StudyGrid
            title="Connectors & cables"
            lead="PBQs love drag-and-drop power and data connectors. Know the look and the job of every one below."
            cards={powerCards}
          />
          <StudyGrid
            title="Data & display"
            lead="Match shape to purpose — SATA data vs power, HDMI vs DisplayPort, RJ-45 vs RJ-11."
            cards={dataCards}
          />
        </div>
      );
    case "network":
      return (
        <StudyGrid
          title="Networking"
          lead="Domain 2 is about 23%. Ports, SOHO, wireless bands, the 100 m copper limit, and tool selection appear constantly."
          cards={networkCards}
        />
      );
    case "mobile":
      return (
        <StudyGrid
          title="Mobile devices"
          lead="Domain 1 is about 13%. Replacement safety, USB-C/docks, eSIM/hotspot, and enterprise Wi-Fi/MDM."
          cards={mobileCards}
        />
      );
    case "cloud":
      return (
        <StudyGrid
          title="Virtualization & cloud"
          lead="Domain 4 is about 11%. Type 1 vs Type 2, VDI, and IaaS/PaaS/SaaS with a clear “who manages what.”"
          cards={cloudCards}
        />
      );
    case "troubleshoot":
      return (
        <StudyGrid
          title="Troubleshooting"
          lead="Domain 5 is 28% — the largest. Symptom → likely cause → first action. Memorize the six-step methodology."
          cards={troubleCards}
        />
      );
    case "memory":
      return (
        <StudyGrid
          title="Memory tips"
          lead="Silly hooks beat raw memorization. Say the mnemonic out loud, then flip and check."
          cards={memoryCards}
          filters={memoryFilters}
        />
      );
    case "specs":
      return (
        <StudyGrid
          title="Specs lab"
          lead="Wattages, distances, speeds, and limits. These numbers separate pass-level answers from guesses."
          cards={specsCards}
          filters={[
            { id: "all", label: "All" },
            { id: "power", label: "Power / PSU" },
            { id: "cable", label: "Cables / distance" },
            { id: "wireless", label: "Wireless" },
            { id: "storage", label: "Storage / RAM" },
            { id: "ports", label: "Ports" },
          ]}
        />
      );
    case "ports":
      return (
        <StudyGrid
          title="Ports & protocols"
          lead="Memorize these — they appear constantly on 2.1 and on PBQs."
          cards={portsCards}
        />
      );
    case "visual":
      return (
        <VisualGrid
          title="Visual ID"
          lead="Front is the drawing. Back is the name and purpose. Built for PBQ recognition."
          items={visualItems}
          filters={[
            { id: "all", label: "All" },
            { id: "power", label: "Power" },
            { id: "data", label: "Data / display" },
            { id: "socket", label: "Sockets" },
          ]}
        />
      );
    case "tools":
      return (
        <VisualGrid
          title="Hardware & networking tools"
          lead="Know the look and the job. CompTIA loves tool identification on PBQs."
          items={toolsItems}
          label="Tool"
          filters={[
            { id: "all", label: "All" },
            { id: "network", label: "Networking" },
            { id: "hardware", label: "Hardware / test" },
          ]}
        />
      );
    default:
      return null;
  }
}
