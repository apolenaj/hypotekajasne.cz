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
    description: "Kvalifikace a Financial Passport (orientační model).",
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
    name: "Investiční rentgen (SSR + free preview)",
    owner: "hypoteka-jasne",
    status: "LIVE",
    description: "Vstup do property analysis funnelu.",
  },
  {
    id: "shared.financial_passport",
    name: "Financial Passport handoff",
    owner: "shared",
    status: "BETA",
    description: "Bezpečný přenos rozpočtových parametrů HJ → Majetio.",
  },
  {
    id: "majetio.discovery",
    name: "Property discovery",
    owner: "majetio",
    status: "BETA",
    description:
      "Prohlížení nabídek dle rozpočtu. Počet listingů neuvádíme bez ověřených dat.",
  },
  {
    id: "majetio.property_analysis",
    name: "Majetio Property Analysis",
    owner: "majetio",
    status: "BETA",
    description: "Placená hloubková analýza konkrétní nemovitosti.",
  },
  {
    id: "majetio.affordability_widget",
    name: "Mohu si to dovolit? (property detail)",
    owner: "shared",
    status: "COMING_SOON",
    description: "API contract připraven; UI na Majetio property detail.",
  },
  {
    id: "shared.sso",
    name: "Cross-platform SSO",
    owner: "shared",
    status: "COMING_SOON",
    description:
      "Architektura připravena; plný auth systém zatím nenasazujeme.",
  },
  {
    id: "shared.smart_watchlist",
    name: "Smart Property Watchlist",
    owner: "shared",
    status: "BETA",
    description:
      "Lokální sledování + in-app alerty; Majetio sync a email/push COMING_SOON.",
  },
  {
    id: "hj.property_compare",
    name: "Property Compare (2–5)",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Profesionální srovnání s category winners, trade-offs a shareable linkem.",
  },
  {
    id: "shared.digital_twin",
    name: "Property Digital Twin",
    owner: "shared",
    status: "COMING_SOON",
    description:
      "Dlouhodobý profil nemovitosti — value provenance, timeline, portfolio + Copilot.",
  },
  {
    id: "hj.academy_gamification",
    name: "Academy Gamification Layer",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Learning paths, 0–100 % progress, meaningful badges, situational Copilot recommendations, character system — no streaks.",
  },
  {
    id: "hj.b2b_portal",
    name: "B2B Professional Portal",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "SaaS vrstva pro makléře, kanceláře, developery a hypoteční partnery — org accounts, roles, billing-ready analýzy 5 000 Kč, reporty, engagement, audit. Score isolation: platba neovlivňuje skóre.",
  },
  {
    id: "hj.report_engine",
    name: "Professional Share/Export Report Engine",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "6 report types — web, print, PDF-ready HTML. Expiring share token, optional password, revoke, PII masking default. White-label B2B with transparent HJ/Majetio methodology.",
  },
  {
    id: "hj.alert_center",
    name: "Alert Center",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Centrální alerty s deduplication, LTV-specific rate copy, preference immediate/digest, notification channels (in-app LIVE, email/push COMING_SOON + consent).",
  },
  {
    id: "hj.market_pulse",
    name: "Market Pulse Dashboard",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Trendy sazeb, cen, nájmů, yieldu a regulační changelog. Opportunity Radar upozorňuje — negarantuje investici. CZ sazby LIVE.",
  },
  {
    id: "hj.due_diligence",
    name: "Dynamic Due Diligence Engine",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Personalizovaný checklist LEGAL–EXIT dle typu nemovitosti. GREY default — unknown není green. Human-expert escalation.",
  },
  {
    id: "hj.offer_strategy",
    name: "Offer Strategy Assistant",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "MODEL strategie nabídky, scenario slider, investment metrics, etický draft textu.",
  },
  {
    id: "hj.deal_room",
    name: "Property Deal Room",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Workspace pro transakci — timeline, role, permission-based documents, Majetio + specialist handoff.",
  },
  {
    id: "hj.document_vault",
    name: "Document Vault",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Secure mortgage & property document vault — encryption, checklist, AI extraction (factual), consent-based specialist handoff.",
  },
  {
    id: "hj.global_financing_router",
    name: "Global Financing Router",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Mapa cest financování podle rezidence a země nemovitosti — bez jediného doporučení, partner-ready marketplace.",
  },
  {
    id: "hj.refinance_radar",
    name: "Refinance Radar",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Personalizované alerty k fixaci, scénáře splátky (MODEL), Stay vs Refinance porovnání, CTA na specialistu.",
  },
  {
    id: "hj.portfolio_os",
    name: "Portfolio OS",
    owner: "hypoteka-jasne",
    status: "BETA",
    description:
      "Agregace více owned twins: summary, koncentrace, stress, explainable scénáře, export.",
  },
];
