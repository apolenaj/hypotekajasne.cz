import type { MagazinePerson } from "@/lib/magazine/types";
import { routes } from "@/lib/routes";
import { financialPartner, projectFounder } from "@/config/legal";

/**
 * Centrální registr autorů / odborné kontroly (YMYL).
 * Person schema pouze pro reálné lidi nebo explicitní redakční entitu —
 * žádné fiktivní „compliance reviewer“ jmenovky na každém článku.
 */
export const MAGAZINE_PEOPLE: Record<string, MagazinePerson> = {
  "josef-apolenar": {
    id: "josef-apolenar",
    name: projectFounder.displayName,
    role: projectFounder.role,
    bio: projectFounder.description,
    credentials: "Computing Technologies · MBA · Hypotéka Jasně",
    url: `${routes.oNas}#josef-apolenar`,
  },
  "michal-heinzke": {
    id: "michal-heinzke",
    name: financialPartner.representative,
    role: `${financialPartner.representativeRole} · ${financialPartner.specialistTitle}`,
    bio: financialPartner.michalDescription,
    credentials: "Praxe v oblasti hypoték, úvěrů a pojištění",
    url: `${routes.oNas}#michal-heinzke`,
  },
  "redakce-hj": {
    id: "redakce-hj",
    name: "Redakce Hypotéka Jasně",
    role: "Redakce",
    bio: "Datová redakce zaměřená na hypotéky, kvalifikaci a zahraniční financování. Texty označujeme statusem dat a zdroji.",
    credentials: "Redakční zásady · metodika /metodika",
    url: routes.editorialPolicy,
  },
};

export function getPerson(id: string): MagazinePerson {
  return (
    MAGAZINE_PEOPLE[id] ?? {
      id: "unknown",
      name: "Neuvedeno",
      role: "—",
      bio: "Autor nebo odborná kontrola není uvedena.",
    }
  );
}

/** Named human authors eligible for Person JSON-LD (exclude placeholders). */
export function isNamedPerson(id: string): boolean {
  return id === "josef-apolenar" || id === "michal-heinzke";
}
