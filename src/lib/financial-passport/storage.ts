import {
  buildDocumentFromReadiness,
  fromReadinessAnswers,
  recordScoreChange,
  toPersistedAnswers,
} from "@/lib/financial-passport";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";
import {
  loadReadiness,
  saveReadiness,
  type StoredReadiness,
} from "@/lib/mortgage-readiness/storage";
import type { ReadinessAnswers } from "@/lib/mortgage-readiness/types";

export function loadFinancialProfile(): FinancialProfileAnswers | null {
  const stored = loadReadiness();
  if (!stored?.answers) return null;
  return fromReadinessAnswers(stored.answers as ReadinessAnswers);
}

/**
 * Uloží profil + zaznamená timeline při změně skóre.
 */
export function saveFinancialProfile(
  profile: FinancialProfileAnswers,
  modelRatePercent: number | null = 5
): StoredReadiness {
  const prev = loadReadiness();
  const prevAnswers = prev?.answers as ReadinessAnswers | undefined;
  const prevDoc = prevAnswers
    ? buildDocumentFromReadiness(prevAnswers, modelRatePercent)
    : null;

  const persisted = toPersistedAnswers(profile);
  saveReadiness(persisted);

  const nextDoc = buildDocumentFromReadiness(
    persisted as ReadinessAnswers,
    modelRatePercent
  );

  if (prevDoc) {
    recordScoreChange({
      scoreFrom: prevDoc.readiness.overall,
      scoreTo: nextDoc.readiness.overall,
      dimensionFrom: prevDoc.readiness.dimensions.map((d) => ({
        id: d.id,
        score: d.score,
      })),
      dimensionTo: nextDoc.readiness.dimensions.map((d) => ({
        id: d.id,
        score: d.score,
      })),
    });
  }

  return loadReadiness()!;
}
