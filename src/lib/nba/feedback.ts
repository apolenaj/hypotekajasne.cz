import type { NbaUserState } from "@/lib/nba/types";

const STORAGE_KEY = "hj-nba-feedback-v1";

const EMPTY: NbaUserState = {
  completed: {},
  dismissed: {},
  snoozed: {},
};

export function loadNbaUserState(): NbaUserState {
  if (typeof window === "undefined") return { ...EMPTY, completed: {}, dismissed: {}, snoozed: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, dismissed: {}, snoozed: {} };
    const parsed = JSON.parse(raw) as Partial<NbaUserState>;
    return {
      completed: parsed.completed ?? {},
      dismissed: parsed.dismissed ?? {},
      snoozed: parsed.snoozed ?? {},
    };
  } catch {
    return { completed: {}, dismissed: {}, snoozed: {} };
  }
}

function persist(state: NbaUserState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markNbaCompleted(ruleId: string) {
  const s = loadNbaUserState();
  s.completed[ruleId] = new Date().toISOString();
  delete s.snoozed[ruleId];
  persist(s);
  return s;
}

export function markNbaDismissed(ruleId: string) {
  const s = loadNbaUserState();
  s.dismissed[ruleId] = new Date().toISOString();
  delete s.snoozed[ruleId];
  persist(s);
  return s;
}

/** Remind later — default 3 days (no fake urgency). */
export function markNbaRemindLater(ruleId: string, days = 3) {
  const s = loadNbaUserState();
  const until = new Date(Date.now() + days * 86_400_000).toISOString();
  s.snoozed[ruleId] = until;
  persist(s);
  return s;
}

export function clearNbaFeedback() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
