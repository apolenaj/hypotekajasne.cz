import {
  practiceAnswerPath,
  type PracticeGuide,
  type PracticeSearchHit,
} from "@/lib/academy/practice/types";

function foldCs(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SYNONYMS: Record<string, string[]> = {
  osvc: ["zivnostnik", "podnikatel", "ico"],
  zivnostnik: ["osvc", "podnikatel"],
  rozvod: ["rozchod", "sjm", "vyporadani"],
  rozchod: ["rozvod", "partner"],
  odhad: ["oceneni", "znalecky posudek", "zastavni hodnota"],
  oceneni: ["odhad"],
  "mimoradna splatka": ["predcasne splaceni", "predcasna splatka"],
  "predcasne splaceni": ["mimoradna splatka"],
  refinancovani: ["refixace", "fixace", "otocka"],
  refixace: ["refinancovani", "fixace"],
  rpsn: ["urok", "naklady uveru"],
  dsti: ["splatkova kapacita", "vyse splatky"],
  ltv: ["vlastni zdroje", "zastavni hodnota"],
};

function expandQueryTokens(raw: string): string[] {
  const folded = foldCs(raw);
  if (!folded) return [];
  const base = folded.split(" ").filter(Boolean);
  const out = new Set(base);
  for (const token of base) {
    for (const [key, alts] of Object.entries(SYNONYMS)) {
      if (token === key || alts.includes(token) || key.includes(token)) {
        out.add(key);
        for (const a of alts) out.add(a);
      }
    }
  }
  return [...out];
}

export function searchPracticeGuides(
  guides: PracticeGuide[],
  query: string,
  limit = 12
): PracticeSearchHit[] {
  const tokens = expandQueryTokens(query);
  if (tokens.length === 0) return [];

  const hits: Array<PracticeSearchHit & { score: number }> = [];

  for (const guide of guides) {
    for (const answer of guide.answers) {
      const hay = foldCs(
        [
          answer.question,
          answer.directAnswer,
          answer.explanation,
          ...(answer.searchTerms ?? []),
          guide.title,
        ].join(" ")
      );
      let score = 0;
      for (const t of tokens) {
        if (foldCs(answer.question).includes(t)) score += 5;
        else if (hay.includes(t)) score += 2;
      }
      if (score <= 0) continue;
      hits.push({
        guideSlug: guide.slug,
        guideTitle: guide.title,
        answerId: answer.id,
        question: answer.question,
        snippet: answer.directAnswer.slice(0, 160),
        href: practiceAnswerPath(guide.slug, answer.id),
        score,
      });
    }
  }

  return hits
    .sort((a, b) => b.score - a.score || a.question.localeCompare(b.question, "cs"))
    .slice(0, limit)
    .map(({ score, ...hit }) => {
      void score;
      return hit;
    });
}
