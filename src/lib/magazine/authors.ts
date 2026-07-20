import type { MagazinePerson } from "@/lib/magazine/types";

/** Centrální registr autorů / odborné kontroly (YMYL). */
export const MAGAZINE_PEOPLE: Record<string, MagazinePerson> = {
  "redakce-hj": {
    id: "redakce-hj",
    name: "Redakce HypotékaJasně",
    role: "Redakce",
    bio: "Datová redakce zaměřená na hypotéky, kvalifikaci a zahraniční financování. Texty označujeme statusem dat a zdroji.",
    credentials: "Interní redakční zásady · metodika /metodika",
  },
  "analytička-hj": {
    id: "analytička-hj",
    name: "Analytický tým HJ",
    role: "Výzkum",
    bio: "Připravuje číselné scénáře a kontroluje, že modelové tvrzení nejsou vydávána za živá data bank.",
    credentials: "Výzkum / kontrola modelu",
  },
  "reviewer-compliance": {
    id: "reviewer-compliance",
    name: "Interní odborná kontrola",
    role: "Odborná kontrola",
    bio: "Kontroluje články: autor, aktualizace, zdroje, absence nepřípustných slibů schválení.",
    credentials: "Kontrolní seznam YMYL",
  },
};

export function getPerson(id: string): MagazinePerson {
  return (
    MAGAZINE_PEOPLE[id] ?? {
      id: "unknown",
      name: "Neuvedeno",
      role: "—",
      bio: "Autor nebo odborná kontrola není v registru — doplňte před publikací.",
    }
  );
}
