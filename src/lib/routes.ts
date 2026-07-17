import { countryOrder, type CountryId } from "@/lib/calculators";

export const routes = {
  home: "/",
  navrhNaMiru: "/navrh-na-miru",
  clanky: "/clanky",
  oNas: "/o-nas",
  pruvodceInvestora: "/pruvodce-investora",
  investicniRentgen: "/investicni-rentgen",
  investicniPas: "/investicni-pas",
  hypotecniAkademie: "/hypotecni-akademie",
  oMajetio: "/o-majetio",
  kontakt: "/kontakt",
  faq: "/faq",
  dekujeme: "/dekujeme",
  legal: {
    gdpr: "/pravni/gdpr",
    smlouvy: "/pravni/smlouvy",
    zasady: "/pravni/zasady",
  },
  kalkulacky: {
    root: "/kalkulacky",
    koupeVsNajem: "/kalkulacky/koupe-vs-najem",
    historickyVyvoj: "/kalkulacky/historicky-vyvoj",
    potencialniVyvoj: "/kalkulacky/potencialni-vyvoj",
  },
} as const;

export const countrySlugs: Record<CountryId, string> = {
  cz: "ceska-republika",
  dubai: "dubaj",
  spain: "spanelsko",
  italy: "italie",
  croatia: "chorvatsko",
  bali: "bali",
  saudi: "saudska-arabie",
  slovakia: "slovensko",
};

const slugToCountryId = Object.fromEntries(
  Object.entries(countrySlugs).map(([id, slug]) => [slug, id])
) as Record<string, CountryId>;

export function getCountryGuidePath(countryId: CountryId): string {
  return `${routes.pruvodceInvestora}/${countrySlugs[countryId]}`;
}

export function getCountryIdFromSlug(slug: string): CountryId | null {
  if (slug in slugToCountryId) {
    return slugToCountryId[slug];
  }
  if (countryOrder.includes(slug as CountryId)) {
    return slug as CountryId;
  }
  return null;
}

export function isCountryId(value: string): value is CountryId {
  return countryOrder.includes(value as CountryId);
}
