import { countryOrder, type CountryId } from "@/lib/calculators";

export const routes = {
  home: "/",
  navrhNaMiru: "/navrh-na-miru",
  copilot: "/copilot",
  financniPas: "/financni-pas",
  dashboard: "/dashboard",
  portfolio: "/portfolio",
  sledovani: "/sledovani",
  clanky: "/clanky",
  oNas: "/o-nas",
  pruvodceInvestora: "/pruvodce-investora",
  investicniRentgen: "/investicni-rentgen",
  investicniRentgenModelar: "/investicni-rentgen/modelar",
  investicniRentgenPorovnani: "/investicni-rentgen/porovnani",
  investicniPas: "/investicni-pas",
  hypotecniAkademie: "/hypotecni-akademie",
  akademie: "/akademie",
  oMajetio: "/o-majetio",
  kontakt: "/kontakt",
  faq: "/faq",
  dekujeme: "/dekujeme",
  metodika: "/metodika",
  duvera: "/duvera",
  zdroje: "/zdroje",
  editorialPolicy: "/editorial-policy",
  jakVydelavame: "/jak-vydelavame",
  partneri: "/partneri",
  refinanceRadar: "/refinancovani-radar",
  globalFinancing: "/globalni-financovani",
  documentVault: "/dokumentovy-trezor",
  dealRoom: "/transakce",
  offerStrategy: "/strategie-nabidky",
  dueDiligence: "/proverka-nemovitosti",
  marketPulse: "/trhovy-puls",
  alertCenter: "/alerty",
  reportEngine: "/reporty",
  b2bPortal: "/profesionalni-portal",
  opravyAAktualizace: "/opravy-a-aktualizace",
  legal: {
    gdpr: "/pravni/gdpr",
    smlouvy: "/pravni/smlouvy",
    zasady: "/pravni/zasady",
    cookies: "/pravni/cookies",
    placenaAnalyza: "/pravni/placena-analyza",
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
