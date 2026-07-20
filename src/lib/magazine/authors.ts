import type { MagazinePerson } from "@/lib/magazine/types";

/** Centrální registr autorů / reviewerů (YMYL). */
export const MAGAZINE_PEOPLE: Record<string, MagazinePerson> = {
  "redakce-hj": {
    id: "redakce-hj",
    name: "Redakce HypotékaJasně",
    role: "Editorial",
    bio: "Datová redakce zaměřená na hypotéky, kvalifikaci a zahraniční financování. Texty označujeme statusem dat a zdroji.",
    credentials: "Interní editorial guidelines · metodika /metodika",
  },
  "analytička-hj": {
    id: "analytička-hj",
    name: "Analytický tým HJ",
    role: "Research",
    bio: "Připravuje číselné scénáře a kontroluje, že modelové tvrzení nejsou vydávána za LIVE data bank.",
    credentials: "Research / model review",
  },
  "reviewer-compliance": {
    id: "reviewer-compliance",
    name: "Compliance review (interní)",
    role: "Reviewer",
    bio: "Kontroluje YMYL články: autor, aktualizace, zdroje, absence nepřípustných slibů schválení.",
    credentials: "YMYL checklist",
  },
};

export function getPerson(id: string): MagazinePerson {
  return (
    MAGAZINE_PEOPLE[id] ?? {
      id: "unknown",
      name: "Neuvedeno",
      role: "—",
      bio: "Autor/reviewer není v registru — doplňte před publikací YMYL.",
    }
  );
}
