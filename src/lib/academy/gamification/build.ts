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
      "Progress 0–100 % z vážených kroků — lekce, quiz, kalkulačka, praktický úkol.",
      "Žádné streaks, žádné casino body — jen smysluplné badges.",
      "Post-lesson CTA: education → tool → personalized result.",
      "Copilot doporučení vychází z Financial Passport (MODEL), ne z halucinací.",
      "Postavy (Igor, Bohouš, …) jsou vizuální vrstva pro budoucí video — ne zdroj pravdy.",
    ],
  };
}
