export type Domain = "mobile" | "network" | "hardware" | "cloud" | "trouble";

export type Question = {
  d: Domain;
  obj: string;
  q: string;
  options: string[];
  a: number;
  e: string;
};

export type StudyCard = {
  title: string;
  detail: string;
  cat?: string;
};

export type VisualItem = {
  cat: string;
  name: string;
  desc: string;
  svg: string;
};

export type FlashCard = {
  front: string;
  back: string;
};

export type IdentifyQuestion = {
  svg: string;
  options: string[];
  answer: string;
};

export type MatchPair = {
  left: string;
  right: string;
};

export type Objective = {
  id: string;
  domain: Domain;
  name: string;
};

export type ToolItem = VisualItem;

export type WrongItem = {
  q: string;
  options: string[];
  a: number;
  e: string;
  obj: string;
  d: string;
};

export type PbqTool = { s: string; a: string };
export type PbqPart = { s: string; opts: string[]; a: number };
