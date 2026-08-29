import raw from "./raw.json";
import type {
  FlashCard,
  IdentifyQuestion,
  MatchPair,
  Objective,
  PbqPart,
  PbqTool,
  Question,
  StudyCard,
  ToolItem,
  VisualItem,
} from "./types";

export const SVGs = raw.SVGs as Record<string, string>;
export const specsCards = raw.specsCards as StudyCard[];
export const toolsItems = raw.toolsItems as ToolItem[];
export const visualItems = raw.visualItems as VisualItem[];
export const flashcards = raw.flashcards as FlashCard[];
export const identifyQuestions = raw.identifyQuestions as IdentifyQuestion[];
export const allQuestions = raw.allQuestions as Question[];
export const matchData = raw.matchData as MatchPair[];
export const hardwareCards = raw.hardwareCards as StudyCard[];
export const powerCards = raw.powerCards as StudyCard[];
export const dataCards = raw.dataCards as StudyCard[];
export const networkCards = raw.networkCards as StudyCard[];
export const mobileCards = raw.mobileCards as StudyCard[];
export const cloudCards = raw.cloudCards as StudyCard[];
export const troubleCards = raw.troubleCards as StudyCard[];
export const OBJECTIVES = raw.OBJECTIVES as Objective[];
export const memoryCards = raw.memoryCards as StudyCard[];
export const portsCards = raw.portsCards as StudyCard[];
export const pbqLaser = raw.pbqLaser as string[];
export const pbqTools = raw.pbqTools as PbqTool[];
export const pbqT568B = raw.pbqT568B as string[];
export const pbqParts = raw.pbqParts as PbqPart[];

export const DOMAIN_LABEL: Record<string, string> = {
  all: "All domains",
  mobile: "Mobile",
  network: "Networking",
  hardware: "Hardware",
  cloud: "Cloud / Virt",
  trouble: "Troubleshoot",
};

export { GLOSSARY } from "./glossary";
export type { GlossaryEntry } from "./glossary";
