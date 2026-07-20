import type { AcademyProgressStore } from "@/lib/academy/gamification/types";
import {
  ACADEMY_PROGRESS_STORAGE_KEY,
  defaultAcademyProgressStore,
} from "@/lib/academy/gamification/types";

export function loadAcademyProgressStore(): AcademyProgressStore {
  if (typeof window === "undefined") return defaultAcademyProgressStore();
  try {
    const raw = localStorage.getItem(ACADEMY_PROGRESS_STORAGE_KEY);
    if (!raw) return defaultAcademyProgressStore();
    return { ...defaultAcademyProgressStore(), ...(JSON.parse(raw) as AcademyProgressStore) };
  } catch {
    return defaultAcademyProgressStore();
  }
}

export function saveAcademyProgressStore(store: AcademyProgressStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACADEMY_PROGRESS_STORAGE_KEY, JSON.stringify(store));
}
