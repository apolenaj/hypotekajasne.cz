import type { FeatureStatus } from "@/lib/majetio/types";

export type EcosystemFeature = {
  id: string;
  name: string;
  owner: "hypoteka-jasne" | "majetio" | "shared";
  status: FeatureStatus;
  description: string;
};

/**
 * Stav funkcí ekosystému — žádné falešné „stovky nemovitostí“.
 * Katalog LIVE až když existují ověřená data.
 */
export const ECOSYSTEM_FEATURES: EcosystemFeature[] = [
  {
    id: "hj.readiness",
    name: "Hypoteční připravenost",
    owner: "hypoteka-jasne",
    status: "LIVE",
    description: "Kvalifikace a Finanční pas (orientační model).",
  },
  {
    id: "hj.market_matching",
    name: "Osobní investiční průvodce",
    owner: "hypoteka-jasne",
    status: "LIVE",
    description: "Výběr trhu — transparentní vážené skóre.",
  },
  {
    id: "hj.rentgen",
    name: "Investiční rentgen (náhled + prémiová analýza)",
    owner: "hypoteka-jasne",
    status: "LIVE",
    description: "Vstup do analýzy konkrétní nemovitosti.",
  },
  {
    id: "shared.financial_passport",
    name: "Předání Finančního pasu",
    owner: "shared",
    status: "BETA",
    description: "Bezpečný přenos rozpočtových parametrů Hypotéka Jasně → Majetio.",
  },
  {
    id: "majetio.discovery",
    name: "Prohlížení nabídek (Majetio)",
    owner: "majetio",
    status: "BETA",
    description:
      "Prohlížení nabídek dle rozpočtu. Počet listingů neuvádíme bez ověřených dat.",
  },
  {
    id: "majetio.property_analysis",
    name: "Analýza nemovitosti Majetio",
    owner: "majetio",
    status: "BETA",
    description: "Placená hloubková analýza konkrétní nemovitosti.",
  },
  {
    id: "majetio.affordability_widget",
    name: "Mohu si to dovolit? (detail nemovitosti)",
    owner: "shared",
    status: "COMING_SOON",
    description: "Rozhraní připraveno; UI na detailu nemovitosti v Majetio.",
  },
  {
    id: "shared.sso",
    name: "Jednotné přihlášení napříč platformami",
    owner: "shared",
    status: "COMING_SOON",
    description:
      "Architektura připravena; plný autentizační systém zatím nenasazujeme.",
  },
  {
    id: "shared.smart_watchlist",
    name: "Chytrý seznam sledování",
    owner: "shared",
    status: "BETA",
    description:
      "Lokální sledování + upozornění v aplikaci; synchronizace s Majetio a e-mail/push už brzy.",
  },
  {
    id: "hj.property_compare",
    name: "Porovnání nemovitostí (2–5)",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Profesionální srovnání s vítězi kategorií, kompromisy a odkazem ke sdílení.",
  },
  {
    id: "shared.digital_twin",
    name: "Digitální dvojče nemovitosti",
    owner: "shared",
    status: "COMING_SOON",
    description:
      "Dlouhodobý profil nemovitosti — původ hodnoty, časová osa, portfolio a AI asistent.",
  },
  {
    id: "hj.academy_gamification",
    name: "Vzdělávací cesty a odznaky",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Vzdělávací cesty, postup 0–100 %, smysluplné odznaky, doporučení AI asistenta dle situace — bez streaků.",
  },
  {
    id: "hj.b2b_portal",
    name: "Profesionální B2B portál",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "SaaS vrstva pro makléře, kanceláře, developery a hypoteční partnery — organizace, role, analýzy připravené k fakturaci, reporty, engagement, audit. Izolace skóre: platba neovlivňuje skóre.",
  },
  {
    id: "hj.report_engine",
    name: "Sdílení a export reportů",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "6 typů reportů — web, tisk, HTML připravené pro PDF. Expirující odkaz, volitelné heslo, odvolání, výchozí maskování osobních údajů. Vlastní značka B2B s transparentní metodikou Hypotéka Jasně/Majetio.",
  },
  {
    id: "hj.alert_center",
    name: "Centrum upozornění",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Centrální upozornění s deduplikací, textací sazeb podle LTV, preference ihned/souhrn, kanály (v aplikaci v provozu, e-mail/push už brzy + souhlas).",
  },
  {
    id: "hj.market_pulse",
    name: "Tržní puls",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Trendy sazeb, cen, nájmů, výnosů a regulační změny. Radar příležitostí upozorňuje — negarantuje investici. CZ sazby z aktuálních dat.",
  },
  {
    id: "hj.due_diligence",
    name: "Dynamická prověrka nemovitosti",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Personalizovaný checklist LEGAL–EXIT dle typu nemovitosti. Šedá jako výchozí — neznámé není zelené. Eskalace k lidskému specialistovi.",
  },
  {
    id: "hj.offer_strategy",
    name: "Asistent strategie nabídky",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Modelová strategie nabídky, posuvník scénářů, investiční metriky, etický návrh textu.",
  },
  {
    id: "hj.deal_room",
    name: "Transakční místnost",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Pracovní prostor pro transakci — časová osa, role, dokumenty dle oprávnění, předání Majetio a specialistovi.",
  },
  {
    id: "hj.document_vault",
    name: "Dokumentový trezor",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Zabezpečený trezor hypotečních a majetkových dokumentů — šifrování, checklist, faktická AI extrakce, předání specialistovi se souhlasem.",
  },
  {
    id: "hj.global_financing_router",
    name: "Mapa globálního financování",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Mapa cest financování podle rezidence a země nemovitosti — bez jediného doporučení, připraveno pro partnery.",
  },
  {
    id: "hj.refinance_radar",
    name: "Radar refinancování",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Personalizovaná upozornění k fixaci, scénáře splátky (model), srovnání zůstat vs. refinancovat, výzva ke specialistovi.",
  },
  {
    id: "hj.portfolio_os",
    name: "Správa portfolia",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Agregace více vlastněných digitálních dvojčat: shrnutí, koncentrace, zátěžové testy, vysvětlitelné scénáře, export.",
  },
];
