import { ACADEMY_LESSONS } from "@/lib/academy/catalog";
import { getAcademyLessonPath } from "@/lib/academy";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import type { EducationRec } from "@/lib/dashboard/types";

/**
 * Max 3 lekce podle účelu / slabých dimenzí — ne celý katalog.
 */
export function recommendEducation(
  doc: FinancialPassportDocument | null
): EducationRec[] {
  const picks: { slug: string; reason: string }[] = [];

  if (!doc) {
    picks.push(
      { slug: "ltv", reason: "Základ poměru úvěru a vlastních zdrojů" },
      { slug: "dsti", reason: "Jak příjem omezuje splátku" }
    );
  } else {
    const weak = [...doc.readiness.dimensions]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    for (const d of weak) {
      if (d.id === "equity" || d.id === "affordability_stress") {
        picks.push({ slug: "ltv", reason: d.explanation });
      }
      if (d.id === "debt_load" || d.id === "affordability_stress") {
        picks.push({ slug: "dsti", reason: d.explanation });
      }
      if (d.id === "affordability_stress") {
        picks.push({ slug: "fixace", reason: "Citlivost na sazbu po fixaci" });
      }
      if (d.id === "documentation_readiness") {
        picks.push({ slug: "rpsn", reason: "Číst nabídky a poplatky" });
      }
    }

    if (doc.propertyGoals.purpose === "foreign_purchase") {
      picks.push({
        slug: "americka-hypoteka",
        reason: "České zajištění při koupi v zahraničí",
      });
      picks.push({
        slug: "freehold-vs-leasehold",
        reason: "Ownership model mimo ČR",
      });
    }
    if (doc.propertyGoals.purpose === "investment") {
      picks.push({ slug: "cash-flow", reason: "Investiční cash-flow základy" });
    }
    if (doc.propertyGoals.purpose === "refinance") {
      picks.push({ slug: "fixace", reason: "Refixace a načasování" });
    }
  }

  const seen = new Set<string>();
  const out: EducationRec[] = [];
  for (const p of picks) {
    if (seen.has(p.slug)) continue;
    const lesson = ACADEMY_LESSONS.find((l) => l.slug === p.slug);
    if (!lesson) continue;
    seen.add(p.slug);
    out.push({
      slug: p.slug,
      title: lesson.title,
      reason: p.reason,
      href: getAcademyLessonPath(p.slug),
    });
    if (out.length >= 3) break;
  }
  return out;
}
