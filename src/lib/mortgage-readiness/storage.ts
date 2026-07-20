const STORAGE_KEY = "hj-mortgage-readiness-v1";

export type StoredReadiness = {
  version: 1;
  updatedAt: string;
  answers: unknown;
};

export function loadReadiness(): StoredReadiness | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReadiness;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveReadiness(answers: unknown): void {
  if (typeof window === "undefined") return;
  const payload: StoredReadiness = {
    version: 1,
    updatedAt: new Date().toISOString(),
    answers,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearReadiness(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
