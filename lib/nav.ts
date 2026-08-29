import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Cable,
  CheckSquare,
  Cloud,
  Cpu,
  Hash,
  Home,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  Map,
  Network,
  RotateCcw,
  ScanSearch,
  Search,
  Smartphone,
  Stethoscope,
  Target,
  Timer,
  Wrench,
  Wifi,
} from "lucide-react";

export type PanelId =
  | "home"
  | "quiz"
  | "teach"
  | "exam"
  | "flash"
  | "visual"
  | "identify"
  | "match"
  | "pbq"
  | "hardware"
  | "connectors"
  | "network"
  | "mobile"
  | "cloud"
  | "troubleshoot"
  | "memory"
  | "specs"
  | "tools"
  | "ports"
  | "strategy"
  | "mastery"
  | "review"
  | "topics"
  | "glossary";

export type NavItem = {
  id: PanelId;
  label: string;
  group: "practice" | "study" | "progress";
  icon: LucideIcon;
};

export const NAV: NavItem[] = [
  { id: "home", label: "Home", group: "practice", icon: Home },
  { id: "quiz", label: "Quiz", group: "practice", icon: ListChecks },
  { id: "teach", label: "Teach Me", group: "practice", icon: Lightbulb },
  { id: "exam", label: "Timed exam", group: "practice", icon: Timer },
  { id: "flash", label: "Flashcards", group: "practice", icon: Layers },
  { id: "visual", label: "Visual ID", group: "practice", icon: ScanSearch },
  { id: "identify", label: "Identify", group: "practice", icon: Search },
  { id: "match", label: "Match", group: "practice", icon: Link2 },
  { id: "pbq", label: "PBQ labs", group: "practice", icon: Wrench },
  { id: "hardware", label: "Hardware", group: "study", icon: Cpu },
  { id: "connectors", label: "Connectors", group: "study", icon: Cable },
  { id: "network", label: "Networking", group: "study", icon: Wifi },
  { id: "mobile", label: "Mobile", group: "study", icon: Smartphone },
  { id: "cloud", label: "Cloud / virt", group: "study", icon: Cloud },
  { id: "troubleshoot", label: "Troubleshoot", group: "study", icon: Stethoscope },
  { id: "memory", label: "Memory tips", group: "study", icon: Lightbulb },
  { id: "specs", label: "Specs lab", group: "study", icon: Hash },
  { id: "tools", label: "Tools", group: "study", icon: Wrench },
  { id: "ports", label: "Ports drill", group: "study", icon: Network },
  { id: "strategy", label: "PBQ strategy", group: "study", icon: Map },
  { id: "mastery", label: "Mastery", group: "progress", icon: Target },
  { id: "review", label: "Review misses", group: "progress", icon: RotateCcw },
  { id: "topics", label: "Topics", group: "progress", icon: CheckSquare },
  { id: "glossary", label: "Glossary", group: "progress", icon: BookOpen },
];

export const PANEL_IDS = new Set(NAV.map((n) => n.id));

export function isPanelId(id: string): id is PanelId {
  return PANEL_IDS.has(id as PanelId);
}

export function panelPath(id: PanelId): string {
  return id === "home" ? "/" : `/${id}`;
}

export const GROUPS: { id: NavItem["group"]; label: string }[] = [
  { id: "practice", label: "Practice" },
  { id: "study", label: "Study" },
  { id: "progress", label: "Progress" },
];

export const MOBILE_TABS: PanelId[] = ["home", "quiz", "flash", "exam"];
