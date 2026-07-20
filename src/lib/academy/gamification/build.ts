import { ACADEMY_CHARACTERS } from "@/lib/academy/gamification/paths";
import { ACADEMY_BADGES } from "@/lib/academy/gamification/badges";
import { computeAllPathProgress } from "@/lib/academy/gamification/progress";
import {
  recommendLessons,
  syncBadges,
} from "@/lib/academy/gamification/recommendations";
import type {
  AcademyGamificationDashboard,
  AcademyProgressStore,
} from "@/lib/academy/gamification/types";

export function buildGamificationDashboard(
  store: AcademyProgressStore,
  now: Date = new Date()
): AcademyGamificationDashboard {
  const synced = syncBadges(store);
  const paths = computeAllPathProgress(synced);
  const earned = synced.earnedBadges
    .map((id) => ACADEMY_BADGES.find((b) => b.id === id)!)
    .filter(Boolean);

  return {
    generatedAt: now.toISOString(),
    paths,
    earnedBadges: earned,
    availableBadges: ACADEMY_BADGES,
    recommendations: recommendLessons(),
    characters: ACADEMY_CHARACTERS,
    methodology: [
      "Průběh 0–100 % z vážených kroků — lekce, kvíz, kalkulačka, praktický úkol.",
      "Žádné série (streaks), žádné casino body — jen smysluplné odznaky.",
      "Po lekci: vzdělávání → nástroj → personalizovaný výsledek.",
      "Doporučení AI průvodce vychází z Finančního pasu (model), ne z halucinací.",
      "Postavy (Igor, Bohouš, …) jsou vizuální vrstva pro budoucí video — ne zdroj pravdy.",
    ],
  };
}
