import type { MagazinePerson } from "@/lib/magazine/types";
import { routes } from "@/lib/routes";

/**
 * Centrální registr autorů / odborné kontroly (YMYL).
 * Person schema pouze pro reálné lidi nebo explicitní redakční entitu —
 * žádné fiktivní „compliance reviewer“ jmenovky na každém článku.
 */
export const MAGAZINE_PEOPLE: Record<string, MagazinePerson> = {
  "josef-apolenar": {
    id: "josef-apolenar",
    name: "Bc. Josef Apolenář BSc., MBA",
    role: "Zakladatel & CEO — produkt a data",
    bio: "Odpovídá za produktové znění nástrojů a za to, že modelové výstupy nejsou vydávány za závazné nabídky bank.",
    credentials: "Computing Technologies · MBA · Hypotéka Jasně",
    url: `${routes.oNas}#josef-apolenar`,
  },
  "michal-heinzke": {
    id: "michal-heinzke",
    name: "Michal Heinzke",
    role: "Hypoteční specialista — praxe a metodiky bank",
    bio: "Spoluodpovídá za věcnou správnost hypotečních vysvětlení. Nejde o slib schválení konkrétní žádosti.",
    credentials: "11 let praxe v oblasti hypoték, úvěrů a pojištění (uváděno jako praxe na trhu)",
    url: `${routes.oNas}#michal-heinzke`,
  },
  "redakce-hj": {
    id: "redakce-hj",
    name: "Redakce Hypotéka Jasně",
    role: "Redakce",
    bio: "Datová redakce zaměřená na hypotéky, kvalifikaci a zahraniční financování. Texty označujeme statusem dat a zdroji.",
    credentials: "Interní redakční zásady · metodika /metodika",
    url: routes.editorialPolicy,
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

/** Named human authors eligible for Person JSON-LD (exclude placeholders). */
export function isNamedPerson(id: string): boolean {
  return id === "josef-apolenar" || id === "michal-heinzke";
}
