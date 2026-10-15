/**
 * Public, page-local facts about Michal Heinzke.
 * Do not invent licences or guarantees.
 * Do not expose phone, e-mail or website: leads stay on HypotékaJasně.cz.
 * Used only by /o-nas and /partneri.
 */

export const HEINZKE_PARTNER_PUBLIC = {
  personName: "Michal Heinzke",
  initials: "MH",
  companyShort: "HEINZKE",
  companyLegal: "Heinzke & partneři s.r.o.",
  roleOfficial: "Jednatel společnosti · Hypoteční poradce",
  roleOnPlatform:
    "Hypoteční poradce | Partner pro individuální finanční řešení",
  experienceYears: 15,
  experienceLabel: "15 let zkušeností ve financích",
  photoUrl: "/images/team/michal-heinzke.webp",
  photoWidth: 600,
  photoHeight: 600,
  photoAlt:
    "Michal Heinzke – hypoteční poradce a partner HypotékaJasně.cz",
  summaryParagraphs: [
    "Michal Heinzke je partnerem HypotékaJasně.cz pro individuální řešení financování bydlení a nastavení vhodné finanční strategie.",
    "Jako jednatel společnosti Heinzke & partneři s.r.o. působí v oblasti financí již 15 let. Věnuje se především financování bydlení, výstavbě nemovitostí, refinancování hypoték a souvisejícím finančním službám včetně pojištění.",
    "Klientům pomáhá zorientovat se v možnostech financování a najít řešení odpovídající jejich individuálním potřebám.",
  ],
  /** @deprecated Prefer summaryParagraphs for multi-paragraph layout. */
  summary:
    "Michal Heinzke je partnerem HypotékaJasně.cz pro individuální řešení financování bydlení a nastavení vhodné finanční strategie. Jako jednatel společnosti Heinzke & partneři s.r.o. působí v oblasti financí již 15 let. Věnuje se především financování bydlení, výstavbě nemovitostí, refinancování hypoték a souvisejícím finančním službám včetně pojištění. Klientům pomáhá zorientovat se v možnostech financování a najít řešení odpovídající jejich individuálním potřebám.",
  focusAreas: [
    {
      id: "housing",
      label: "Hypotéky na bydlení",
      icon: "home",
    },
    {
      id: "construction",
      label: "Financování výstavby",
      icon: "building",
    },
    {
      id: "refinance",
      label: "Refinancování hypoték",
      icon: "refresh",
    },
    {
      id: "loans",
      label: "Úvěry a další finanční řešení",
      icon: "wallet",
    },
  ],
} as const;

export type HeinzkeFocusArea = (typeof HEINZKE_PARTNER_PUBLIC.focusAreas)[number];
