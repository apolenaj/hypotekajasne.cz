import type { DueDiligenceInput } from "@/lib/due-diligence/types";
import { DUE_DILIGENCE_STORAGE_KEY } from "@/lib/due-diligence/types";

export function loadDueDiligenceOverrides(): Record<
  string,
  DueDiligenceInput["itemOverrides"]
> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(DUE_DILIGENCE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DueDiligenceInput["itemOverrides"]>) : {};
  } catch {
    return {};
  }
}

export function saveDueDiligenceOverrides(
  propertyType: string,
  overrides: DueDiligenceInput["itemOverrides"]
) {
  if (typeof window === "undefined") return;
  const all = loadDueDiligenceOverrides();
  all[propertyType] = overrides;
  localStorage.setItem(DUE_DILIGENCE_STORAGE_KEY, JSON.stringify(all));
}
