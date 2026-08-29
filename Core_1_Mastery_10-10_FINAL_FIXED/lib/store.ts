import { create } from "zustand";
import type { WrongItem } from "@/data/types";

const KEY = "core1-mastery-v3";

type Mastery = Record<string, { right: number; total: number }>;

type Persisted = {
  xp: number;
  quizzesDone: number;
  correct: number;
  bestStreak: number;
  mastery: Mastery;
  checklist: Record<string, boolean>;
  wrongBank: WrongItem[];
};

type AppState = Persisted & {
  streak: number;
  hydrated: boolean;
  focusWeakNext: boolean;
  hydrate: () => void;
  addXP: (n: number) => void;
  recordAnswer: (objId: string | undefined, correct: boolean) => void;
  addWrong: (item: WrongItem) => void;
  removeWrong: (q: string) => void;
  clearWrong: () => void;
  setChecklist: (id: string, value: boolean) => void;
  bumpQuizDone: () => void;
  setFocusWeakNext: (value: boolean) => void;
  resetStreak: () => void;
};

const empty: Persisted = {
  xp: 0,
  quizzesDone: 0,
  correct: 0,
  bestStreak: 0,
  mastery: {},
  checklist: {},
  wrongBank: [],
};

function readPersisted(): Persisted {
  if (typeof window === "undefined") return empty;
  try {
    const storage = getStorage();
    if (!storage) return empty;
    const raw =
      storage.getItem(KEY) ??
      storage.getItem("core1-mastery-v2") ??
      storage.getItem("core1-mastery-v1");
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      xp: Math.max(0, Number(parsed.xp) || 0),
      quizzesDone: Math.max(0, Number(parsed.quizzesDone) || 0),
      correct: Math.max(0, Number(parsed.correct) || 0),
      bestStreak: Math.max(0, Number(parsed.bestStreak) || 0),
      mastery: parsed.mastery ?? {},
      checklist: parsed.checklist ?? {},
      wrongBank: Array.isArray(parsed.wrongBank) ? parsed.wrongBank : [],
    };
  } catch {
    return empty;
  }
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function writePersisted(state: AppState) {
  const storage = getStorage();
  if (!storage) return;
  const payload: Persisted = {
    xp: state.xp,
    quizzesDone: state.quizzesDone,
    correct: state.correct,
    bestStreak: state.bestStreak,
    mastery: state.mastery,
    checklist: state.checklist,
    wrongBank: state.wrongBank,
  };
  try {
    storage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Private browsing, quota exhaustion, or a storage policy must never break
    // the study session; progress simply remains in memory for this tab.
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  ...empty,
  streak: 0,
  hydrated: false,
  focusWeakNext: false,
  hydrate: () => {
    set({ ...readPersisted(), hydrated: true });
  },
  addXP: (n) => {
    if (!Number.isFinite(n) || n <= 0) return;
    set((s) => ({ xp: s.xp + Math.round(n) }));
    writePersisted(get());
  },
  recordAnswer: (objId, correct) => {
    set((s) => {
      const mastery = { ...s.mastery };
      if (objId) {
        const cur = mastery[objId] ?? { right: 0, total: 0 };
        mastery[objId] = {
          right: cur.right + (correct ? 1 : 0),
          total: cur.total + 1,
        };
      }
      const streak = correct ? s.streak + 1 : 0;
      return {
        mastery,
        correct: s.correct + (correct ? 1 : 0),
        streak,
        bestStreak: Math.max(s.bestStreak, streak),
      };
    });
    writePersisted(get());
  },
  addWrong: (item) => {
    set((s) => {
      const key = item.q.trim().toLowerCase();
      if (s.wrongBank.some((w) => w.q.trim().toLowerCase() === key)) return s;
      return { wrongBank: [...s.wrongBank, item].slice(-100) };
    });
    writePersisted(get());
  },
  removeWrong: (q) => {
    set((s) => ({ wrongBank: s.wrongBank.filter((w) => w.q !== q) }));
    writePersisted(get());
  },
  clearWrong: () => {
    set({ wrongBank: [] });
    writePersisted(get());
  },
  setChecklist: (id, value) => {
    set((s) => ({ checklist: { ...s.checklist, [id]: value } }));
    writePersisted(get());
  },
  bumpQuizDone: () => {
    set((s) => ({ quizzesDone: s.quizzesDone + 1 }));
    writePersisted(get());
  },
  setFocusWeakNext: (value) => set({ focusWeakNext: value }),
  resetStreak: () => set({ streak: 0 }),
}));

/** Confidence-weighted mastery (default UI). Full weight only after 5 attempts. */
export function masteryPct(mastery: Mastery, objId: string): number | null {
  const m = mastery[objId];
  if (!m || m.total === 0) return null;
  const accuracy = (m.right / m.total) * 100;
  const confidence = Math.min(m.total, 5) / 5;
  return Math.round(accuracy * confidence);
}

/** Pure accuracy — used for PERFECTION 100 mode. */
export function pureAccuracy(mastery: Mastery, objId: string): number | null {
  const m = mastery[objId];
  if (!m || m.total === 0) return null;
  return Math.round((m.right / m.total) * 100);
}

/** True when objective has ≥5 attempts and 100% pure accuracy. */
export function isPerfect(mastery: Mastery, objId: string): boolean {
  const m = mastery[objId];
  if (!m || m.total < 5) return false;
  return m.right === m.total;
}

export function totalAttempts(mastery: Mastery): number {
  return Object.values(mastery).reduce((sum, item) => sum + item.total, 0);
}

export function overallAccuracy(mastery: Mastery): number | null {
  const entries = Object.values(mastery);
  const total = entries.reduce((sum, item) => sum + item.total, 0);
  if (!total) return null;
  const right = entries.reduce((sum, item) => sum + item.right, 0);
  return Math.round((right / total) * 100);
}

/** Count of objectives at true 100% with enough samples (Perfection score). */
export function perfectionCount(mastery: Mastery, objectiveIds: string[]): number {
  return objectiveIds.filter((id) => isPerfect(mastery, id)).length;
}
