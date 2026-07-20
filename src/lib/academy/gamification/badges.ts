import type { AcademyBadge, AcademyBadgeId } from "@/lib/academy/gamification/types";

export const ACADEMY_BADGES: AcademyBadge[] = [
  {
    id: "understand_ltv",
    title: "Rozumím LTV",
    description: "Lekce LTV dokončena a kvíz úspěšně absolvován.",
    unlockCriteria: "Přečíst lekci LTV + splnit kvíz (min. 1 správně).",
  },
  {
    id: "ready_first_viewing",
    title: "Připraven na první prohlídku",
    description:
      "Cesta První bydlení ≥ 80 % — základy LTV, DSTI, RPSN, fixace.",
    unlockCriteria: "Dokončit cestu „První bydlení“ na 80 %+.",
  },
  {
    id: "investor_basics_complete",
    title: "Základy investora — dokončeno",
    description:
      "Cesta První investiční byt dokončena — peněžní tok, LTV, praktický model.",
    unlockCriteria: "Dokončit cestu „První investiční byt“ na 100 %.",
  },
  {
    id: "refinance_ready",
    title: "Připraven na refinancování",
    description: "Fixace, RPSN a praktický profil v Hlídači refinancování.",
    unlockCriteria: "Cesta Refinancování ≥ 80 % + praktický úkol.",
  },
  {
    id: "foreign_dd_basics",
    title: "Základy zahraniční prověrky",
    description:
      "Freehold, off-plan, escrow — připraven na due diligence.",
    unlockCriteria: "Cesta Zahraniční nemovitost ≥ 75 %.",
  },
];

export function getBadge(id: AcademyBadgeId): AcademyBadge {
  return ACADEMY_BADGES.find((b) => b.id === id)!;
}
