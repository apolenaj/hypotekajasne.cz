/**
 * Unique SEO entries for crawlable static pages (SSR/SSG).
 * Titles must stay unique — enforced by seo.test.ts.
 */

import { routes, countrySlugs, getCountryGuidePath } from "@/lib/routes";
import { countryOrder } from "@/lib/calculators";

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
};

export const STATIC_PAGE_SEO: StaticPageSeo[] = [
  {
    path: "/",
    title: "HypotékaJasně.cz | Co si můžete dovolit. Kde koupit. Jak financovat.",
    description:
      "Informační platforma: živá hypoteční data ČR, srovnání trhů, kalkulačky a jasný další krok. Nejsme banka.",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/en",
    title: "HypotekaJasne.cz — English overview",
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
    title: "AI Property & Mortgage Copilot",
    description:
      "Důvěryhodný copilot nad ověřenými daty a kalkulačkami — citace DATA/MODEL/ODHAD, bez halucinací sazeb.",
    priority: 0.9,
  },
  {
    path: routes.financniPas,
    title: "Financial Passport — váš finančně-realitní profil",
    description:
      "Centrální profil dostupnosti, rizik a připravenosti s dimenzionálním skóre, timeline a simulacemi.",
    priority: 0.92,
  },
  {
    path: routes.b2bPortal,
    title: "B2B Professional Portal — partner SaaS",
    description:
      "Organizace, role, objednávky Property Analysis 5 000 Kč, tracking, reporty Majetio Property Intelligence, developer projekty, billing-ready fakturace, audit. Platba neovlivňuje investiční skóre.",
    priority: 0.89,
  },
  {
    path: routes.reportEngine,
    title: "Report Engine — profesionální export a sdílení",
    description:
      "Mortgage Readiness, Property Analysis, Comparison, Investment Passport, Portfolio Risk, Refinance. Web, tisk, PDF-ready HTML. Expiring token, heslo, revoke, maskování PII.",
    priority: 0.88,
  },
  {
    path: routes.alertCenter,
    title: "Alert Center — centrální upozornění",
    description:
      "Personalizované alerty: sazby v LTV kontextu, fixace, dokumenty, regulace. Deduplication a preference doručení. Email/push vyžadují consent.",
    priority: 0.87,
  },
  {
    path: routes.marketPulse,
    title: "Market Pulse — vývoj trhů bez clickbaitu",
    description:
      "Trendy sazeb, cen, nájmů a yieldu pro podporované trhy. Opportunity Radar upozorňuje na shodu s kritérii — ne garantuje investici.",
    priority: 0.86,
  },
  {
    path: routes.dueDiligence,
    title: "Due Diligence Engine — prověrka nemovitosti",
    description:
      "Personalizovaný checklist LEGAL–EXIT dle typu nemovitosti. Traffic light GREY default — unknown není green. Human-expert escalation.",
    priority: 0.85,
  },
  {
    path: routes.offerStrategy,
    title: "Offer Strategy Assistant — strategie nabídky",
    description:
      "MODEL opening, target, max cena, scenario slider yield/CF/IRR a etický návrh textu. Ne znalecký posudek.",
    priority: 0.83,
  },
  {
    path: routes.dealRoom,
    title: "Property Deal Room — workspace pro transakci",
    description:
      "Timeline, dokumenty s permission modelem, kontakty a úkoly. Vznikne po „Mám vážný zájem“. Nahrazuje chaos z WhatsAppu a e-mailů.",
    priority: 0.84,
  },
  {
    path: routes.documentVault,
    title: "Document Vault — bezpečné uložení hypotečních dokumentů",
    description:
      "Šifrovaný trezor, checklist dle situace, AI extrakce faktických pozorování, audit log a sdílení se specialistou po souhlasu.",
    priority: 0.85,
  },
  {
    path: routes.globalFinancing,
    title: "Global Financing Router — mapa cest financování",
    description:
      "Porovnejte lokální hypotéku, české zajištěné financování, developer plán, hotovost a kombinace. Partner-ready architektura pro marketplace.",
    priority: 0.88,
  },
  {
    path: routes.refinanceRadar,
    title: "Refinance Radar — sledujte fixaci a porovnejte refinancování",
    description:
      "Personalizované alerty k fixaci, scénáře splátky (MODEL), Stay vs Refinance porovnání s poplatky a pojištěním. CTA na specialistu.",
    priority: 0.87,
  },
  {
    path: routes.portfolio,
    title: "Portfolio OS — správa více nemovitostí",
    description:
      "Souhrn hodnoty, equity, LTV, cash flow, koncentrace rizik a stress testy. Export pro poradce.",
    priority: 0.86,
  },
  {
    path: routes.sledovani,
    title: "Smart Watchlist — sledování nemovitostí",
    description:
      "Sledujte nemovitosti, města a filtry. Alerty jen z dostupných dat — propojeno s Majetio, bez spamu.",
    priority: 0.88,
  },
  {
    path: routes.investicniPas,
    title: "Osobní investiční průvodce",
    description:
      "Transparentní market matching: Top 3 trhy, váhy dimenzí a srovnání — organické skóre se neprodává.",
    priority: 0.9,
  },
  {
    path: routes.investicniRentgen,
    title: "Investiční rentgen nemovitosti",
    description:
      "Free preview metrik a Premium analýza s jasným claim statusem DATA / MODEL / ODHAD.",
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
    title: "Porovnání nemovitostí — profesionální compare",
    description:
      "Srovnejte 2–5 nemovitostí: yield, IRR, DSCR, riziko, fit k profilu. Trade-offs a shareable odkaz.",
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
    path: routes.clanky,
    title: "Magazín — články o hypotékách a investicích",
    description:
      "YMYL články s autorem, reviewerem, zdroji a datem faktické kontroly.",
    priority: 0.85,
  },
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
      "Role, vzdělání, odpovědnost za obsah. Trust Center: kdo co dělá.",
    priority: 0.6,
  },
  {
    path: routes.duvera,
    title: "Trust Center",
    description:
      "Kdo poskytuje kterou službu, jak vyděláváme, partneři a metodika.",
    priority: 0.7,
  },
  {
    path: routes.metodika,
    title: "Metodika dat",
    description:
      "Statusy LIVE / VERIFIED / MODEL, zdroje a váhy market matchingu.",
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
    title: "Editorial policy",
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
      "Licencovaný hypoteční partner: IČO, role, JERRS (po ověření) a scope.",
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
      "Property discovery oddělené od Hypotéka Jasně — Financial Passport handoff.",
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
      "Správce, souhlasy, partner transfer a cookies — draft k legal review.",
    priority: 0.4,
  },
  {
    path: routes.legal.cookies,
    title: "Cookie policy",
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
    const slug = countrySlugs[id];
    return {
      path,
      title: `Investiční hub: ${slug.replace(/-/g, " ")}`,
      description: `Financování, rizika a proces nákupu — ${slug}. Data a zdroje, ne marketingové absolutní výroky.`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    };
  });
}

export function getStaticPageSeo(path: string): StaticPageSeo | undefined {
  return STATIC_PAGE_SEO.find((p) => p.path === path);
}
