/**
 * Unique SEO entries for crawlable static pages (SSR/SSG).
 * Titles must stay unique — enforced by seo.test.ts.
 */

import type { Metadata } from "next";
import { routes, getCountryGuidePath } from "@/lib/routes";
import { countryOrder } from "@/lib/calculators";
import { getCountryDossier } from "@/lib/country-dossier";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  SEO_LANDING_HUB,
  SEO_LANDINGS,
  getLandingPath,
} from "@/lib/seo/landings";

export type StaticPageSeo = {
  path: string;
  title: string;
  description: string;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  /** When true, page is catalogued for audits but must not appear in sitemap. */
  noIndex?: boolean;
};

export const STATIC_PAGE_SEO: StaticPageSeo[] = [
  {
    path: "/",
    title: "Hypotéka Jasně | Co si můžete dovolit. Kde koupit. Jak financovat.",
    description:
      "Informační platforma: živá hypoteční data ČR, srovnání trhů, kalkulačky a jasný další krok. Nejsme banka.",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/en",
    title: "Hypotéka Jasně — English overview",
    description:
      "Czech mortgage and property decision platform. Human-edited English overview — no machine translations of the full site.",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: routes.navrhNaMiru,
    title: "Hypoteční připravenost",
    description:
      "Skóre připravenosti, překážky a action plan podle záměru — bez příslibu schválení bankou.",
    priority: 0.9,
  },
  {
    path: routes.copilot,
    title: "Finanční AI průvodce",
    description:
      "Finanční AI průvodce nad ověřenými daty a kalkulačkami — citace, bez halucinací sazeb.",
    priority: 0.9,
  },
  {
    path: routes.financniPas,
    title: "Finanční pas — váš finančně-realitní profil",
    description:
      "Centrální profil dostupnosti, rizik a připravenosti s dimenzionálním skóre, timeline a simulacemi.",
    priority: 0.92,
  },
  {
    path: routes.b2bPortal,
    title: "Profesionální B2B portál — partner SaaS",
    description:
      "Organizace, role, objednávky analýzy nemovitosti, tracking, reporty Majetio, developer projekty, fakturace, audit. Platba neovlivňuje investiční skóre.",
    priority: 0.89,
    /** BETA demo — do not index until commercially live */
    noIndex: true,
  },
  {
    path: routes.reportEngine,
    title: "Profesionální reporty — export a sdílení",
    description:
      "Připravenost na hypotéku, analýza nemovitosti, porovnání, investiční pas, riziko portfolia, refinancování. Web, tisk, HTML připravené pro PDF. Časově omezený token, heslo, revoke, maskování PII.",
    priority: 0.88,
  },
  {
    path: routes.alertCenter,
    title: "Centrum upozornění — centrální upozornění",
    description:
      "Personalizované alerty: sazby v LTV kontextu, fixace, dokumenty, regulace. Deduplication a preference doručení. Email/push vyžadují consent.",
    priority: 0.87,
  },
  {
    path: routes.marketPulse,
    title: "Tržní puls — vývoj trhů bez clickbaitu",
    description:
      "Trendy sazeb, cen, nájmů a yieldu pro podporované trhy. Radar příležitostí upozorňuje na shodu s kritérii — ne garantuje investici.",
    priority: 0.86,
  },
  {
    path: routes.dueDiligence,
    title: "Dynamická prověrka nemovitosti",
    description:
      "Personalizovaný checklist LEGAL–EXIT dle typu nemovitosti. Semafor výchozí šedý — unknown není green. Eskalace k lidskému specialistovi.",
    priority: 0.85,
  },
  {
    path: routes.offerStrategy,
    title: "Strategie nabídky — asistent",
    description:
      "Modelová otevírací, cílová a maximální cena, scénáře výnosu a cash-flow a návrh textu nabídky. Nejde o znalecký posudek.",
    priority: 0.83,
  },
  {
    path: routes.dealRoom,
    title: "Transakční místnost — společný prostor pro transakci",
    description:
      "Časová osa, dokumenty s oprávněními, kontakty a úkoly. Vznikne po „Mám vážný zájem“. Nahrazuje chaos z WhatsAppu a e-mailů.",
    priority: 0.84,
    /** BETA demo — do not index until commercially live */
    noIndex: true,
  },
  {
    path: routes.documentVault,
    title: "Dokumentový trezor — bezpečné uložení hypotečních dokumentů",
    description:
      "Šifrovaný trezor, checklist dle situace, AI extrakce faktických pozorování, auditní záznam a sdílení se specialistou po souhlasu.",
    priority: 0.85,
  },
  {
    path: routes.globalFinancing,
    title: "Mapa globálního financování — cesty financování",
    description:
      "Porovnejte lokální hypotéku, české zajištěné financování, plán developera, hotovost a kombinace — přehledně v jedné mapě.",
    priority: 0.88,
  },
  {
    path: routes.refinanceRadar,
    title: "Hlídač refinancování — sledujte fixaci a porovnejte nabídky",
    description:
      "Personalizovaná upozornění k fixaci, scénáře splátky (model), Zůstat vs. refinancovat porovnání s poplatky a pojištěním. CTA na specialistu.",
    priority: 0.87,
  },
  {
    path: routes.portfolio,
    title: "Moje portfolio — správa více nemovitostí",
    description:
      "Souhrn hodnoty, vlastní kapitál, LTV, peněžní tok, koncentrace rizik a zátěžové testy. Export pro poradce.",
    priority: 0.86,
  },
  {
    path: routes.sledovani,
    title: "Sledované nemovitosti",
    description:
      "Sledujte nemovitosti, města a filtry. Upozornění jen z dostupných dat — propojeno s Majetio, bez spamu.",
    priority: 0.88,
  },
  {
    path: routes.investicniPas,
    title: "Osobní investiční průvodce",
    description:
      "Transparentní přiřazení trhů: Top 3 trhy, váhy dimenzí a srovnání — organické skóre se neprodává.",
    priority: 0.9,
  },
  {
    path: routes.investicniRentgen,
    title: "Investiční rentgen nemovitosti",
    description:
      "Bezplatný snapshot a detailní analýza nemovitosti (4 990 Kč). Údaje: Data, Model, Odhad, Neověřeno — bez garantovaného výnosu.",
    priority: 0.85,
  },
  {
    path: routes.investicniRentgenModelar,
    title: "Investiční modelář 30 let",
    description:
      "Model cash-flow a citlivosti na 30 let — předpoklady jsou viditelné, výsledek není garance.",
    priority: 0.7,
  },
  {
    path: routes.investicniRentgenPorovnani,
    title: "Porovnání nemovitostí — profesionální srovnání",
    description:
      "Srovnejte 2–5 nemovitostí: výnos, peněžní tok, IRR, DSCR, riziko a shodu s profilem. Kompromisy a sdílený odkaz.",
    priority: 0.75,
  },
  {
    path: routes.akademie,
    title: "Hypoteční akademie",
    description:
      "Lekce LTV, RPSN, fixace, DTI, DSTI a další — jednoduše řečeno, s příklady a FAQ.",
    priority: 0.85,
  },
  {
    path: `${routes.akademie}/cesty`,
    title: "Vzdělávací cesty | Hypoteční akademie",
    description:
      "První bydlení, OSVČ, refinancování, investice, zahraničí — průběh 0–100 %, odznaky bez sérií, vzdělávání → nástroj.",
    priority: 0.8,
  },
  {
    path: routes.clanky,
    title: "Magazín — články o hypotékách a investicích",
    description:
      "Články o hypotékách a investicích s autorem, datem aktualizace, zdroji a případnou odbornou kontrolou — bez falešných ratingů.",
    priority: 0.85,
  },
  {
    path: SEO_LANDING_HUB.path,
    title: SEO_LANDING_HUB.title,
    description: SEO_LANDING_HUB.description,
    priority: 0.88,
  },
  ...SEO_LANDINGS.map((l) => ({
    path: getLandingPath(l.slug),
    title: l.title,
    description: l.description,
    changeFrequency: "weekly" as const,
    priority: 0.86,
  })),
  {
    path: routes.pruvodceInvestora,
    title: "Průvodce investora — zahraniční trhy",
    description:
      "Huby trhů: financování, rizika a procesy nákupu — bez marketingových absolutních výroků.",
    priority: 0.85,
  },
  {
    path: routes.kalkulacky.root,
    title: "Hypoteční a investiční kalkulačky",
    description:
      "Kalkulačky koupě vs. nájem, historický a potenciální vývoj — modelové nástroje, ne nabídka banky.",
    priority: 0.8,
  },
  {
    path: routes.kalkulacky.koupeVsNajem,
    title: "Kalkulačka koupě vs. nájem",
    description:
      "Porovnání koupě a nájmu s viditelnými předpoklady. Orientační model.",
    priority: 0.75,
  },
  {
    path: routes.kalkulacky.historickyVyvoj,
    title: "Historický vývoj hypoték",
    description: "Historická data a kontext sazeb — ne predikce budoucnosti.",
    priority: 0.7,
  },
  {
    path: routes.kalkulacky.potencialniVyvoj,
    title: "Potenciální vývoj investice",
    description: "Scénáře potenciálního vývoje s uvedenými předpoklady modelu.",
    priority: 0.7,
  },
  {
    path: routes.oNas,
    title: "O nás — tým a role",
    description:
      "Role, vzdělání, odpovědnost za obsah. Centrum důvěry: kdo co dělá.",
    priority: 0.6,
  },
  {
    path: routes.duvera,
    title: "Centrum důvěry",
    description:
      "Kdo poskytuje kterou službu, jak vyděláváme, partneři a metodika.",
    priority: 0.7,
  },
  {
    path: routes.metodika,
    title: "Metodika dat",
    description:
      "Statusy AKTUÁLNÍ DATA / OVĚŘENO / MODELOVÝ VÝPOČET, zdroje a váhy přiřazení trhů.",
    priority: 0.7,
  },
  {
    path: routes.zdroje,
    title: "Zdroje dat",
    description: "Katalog datových domén a statusů používaných na platformě.",
    priority: 0.55,
  },
  {
    path: routes.editorialPolicy,
    title: "Redakční zásady",
    description:
      "Pravidla YMYL obsahu: autor, review, zdroje, zákaz nepodložených slibů.",
    priority: 0.55,
  },
  {
    path: routes.jakVydelavame,
    title: "Jak vyděláváme",
    description:
      "Nástroje zdarma; odměna od partnera jen při realizaci přes nás.",
    priority: 0.6,
  },
  {
    path: routes.partneri,
    title: "Partneři",
    description:
      "Role hypotečního partnera vůči platformě. Registrační údaje zveřejňujeme jen po ověření.",
    priority: 0.6,
  },
  {
    path: routes.opravyAAktualizace,
    title: "Opravy a aktualizace",
    description:
      "Veřejný changelog oprav YMYL obsahu, sazeb a metodiky — bez tichých přepisů historie.",
    priority: 0.5,
  },
  {
    path: routes.oMajetio,
    title: "O Majetio",
    description:
      "Property discovery oddělené od Hypotéka Jasně — předání Finančního pasu.",
    priority: 0.55,
  },
  {
    path: routes.kontakt,
    title: "Kontakt",
    description:
      "Kontaktní údaje provozovatele platformy Hypotéka Jasně a kontaktní formulář.",
    priority: 0.5,
  },
  {
    path: routes.faq,
    title: "FAQ — časté otázky",
    description:
      "Kdo jsme, zda jsou kalkulace závazné, jak funguje odměna a předání dat.",
    priority: 0.65,
  },
  {
    path: routes.legal.gdpr,
    title: "Ochrana osobních údajů (GDPR)",
    description:
      "Správce, souhlasy, předání partnerovi a cookies — analytika jen se souhlasem.",
    priority: 0.4,
  },
  {
    path: routes.legal.cookies,
    title: "Zásady cookies",
    description:
      "Analytika a marketing cookies pouze se souhlasem — sjednoceno s GDPR.",
    priority: 0.4,
  },
  {
    path: routes.legal.smlouvy,
    title: "Smlouvy a podmínky užití",
    description: "Podmínky užívání webu a regulované hranice platformy.",
    priority: 0.4,
  },
  {
    path: routes.legal.zasady,
    title: "Zásady používání platformy",
    description: "Transparentnost obsahu a pravidla chování uživatelů.",
    priority: 0.4,
  },
  {
    path: routes.legal.placenaAnalyza,
    title: "Podmínky placené analýzy",
    description:
      "Cena, scope, delivery, reklamace a odstoupení u digitální analýzy.",
    priority: 0.45,
  },
];

export function countryGuideSeoEntries(): StaticPageSeo[] {
  return countryOrder.map((id) => {
    const path = getCountryGuidePath(id);
    const name = getCountryDossier(id).name;
    return {
      path,
      title: `Hypotéka a nákup nemovitosti: ${name}`,
      description: `Financování, vlastnictví, daně a rizika — ${name}. Dossier se zdroji a statusem dat, ne marketingové absolutní výroky.`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    };
  });
}

export function findStaticPageSeo(path: string): StaticPageSeo | undefined {
  return STATIC_PAGE_SEO.find((p) => p.path === path);
}

/**
 * Full Next.js Metadata (canonical, OG, Twitter) from the static catalog.
 * Throws if path is missing — prevents silent homepage canonical inheritance.
 */
export function getStaticPageSeo(path: string): Metadata {
  const entry = findStaticPageSeo(path);
  if (!entry) {
    throw new Error(`STATIC_PAGE_SEO missing entry for path: ${path}`);
  }
  return buildPageMetadata({
    title: entry.title,
    description: entry.description,
    path: entry.path,
    noIndex: entry.noIndex,
    ...(path === "/en"
      ? { locale: "en" as const, alternatePath: { cs: "/", en: "/en" } }
      : {}),
  });
}
