import type { AcademyBadge, AcademyBadgeId } from "@/lib/academy/gamification/types";

export const ACADEMY_BADGES: AcademyBadge[] = [
  {
    id: "understand_ltv",
    title: "Rozumím LTV",
    description: "Lekce LTV dokončena a quiz úspěšně absolvován.",
    unlockCriteria: "Přečíst lekci LTV + splnit quiz (min. 1 správně).",
  },
  {
    id: "ready_first_viewing",
    title: "Připraven na první prohlídku",
    description: "Path První bydlení ≥ 80 % — základy LTV, DSTI, RPSN, fixace.",
    unlockCriteria: "Dokončit path „První bydlení“ na 80 %+.",
  },
  {
    id: "investor_basics_complete",
    title: "Investor Basics Complete",
    description: "Path První investiční byt dokončen — cash flow, LTV, praktický model.",
    unlockCriteria: "Dokončit path „První investiční byt“ na 100 %.",
  },
  {
    id: "refinance_ready",
    title: "Refinance Ready",
    description: "Fixace, RPSN a praktický profil v Refinance Radar.",
    unlockCriteria: "Path Refinancování ≥ 80 % + praktický úkol.",
  },
  {
    id: "foreign_dd_basics",
    title: "Foreign DD Basics",
    description: "Freehold, off-plan, escrow — připraven na due diligence.",
    unlockCriteria: "Path Zahraniční nemovitost ≥ 75 %.",
  },
];

export function getBadge(id: AcademyBadgeId): AcademyBadge {
  return ACADEMY_BADGES.find((b) => b.id === id)!;
}
