/** 12 hlavních metrik produktu — SEO + funnel (ne všechny jsou ve free preview). */

export type MetricCatalogItem = {
  id: string;
  label: string;
  description: string;
  tier: "free" | "premium";
  typicalKind: "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";
};

export const RENTGEN_METRICS_CATALOG: MetricCatalogItem[] = [
  {
    id: "price",
    label: "Kupní cena",
    description: "Zadaná nebo z inzerátu — bez ověření = Neověřeno.",
    tier: "free",
    typicalKind: "DATA",
  },
  {
    id: "area",
    label: "Užitná plocha",
    description: "m² dle vstupu; katastr neověřujeme automaticky.",
    tier: "free",
    typicalKind: "DATA",
  },
  {
    id: "price_m2",
    label: "Cena / m²",
    description: "Výpočet z ceny a plochy, nebo modelové srovnání lokality.",
    tier: "free",
    typicalKind: "MODEL",
  },
  {
    id: "market_compare",
    label: "Porovnání trhu",
    description: "Jen pokud existují katalogová data lokality — jinak sekce chybí.",
    tier: "free",
    typicalKind: "MODEL",
  },
  {
    id: "gross_yield",
    label: "Orientační hrubý výnos",
    description: "Z nájmu a ceny, nebo modelový výnos lokality.",
    tier: "free",
    typicalKind: "MODEL",
  },
  {
    id: "cash_flow_free",
    label: "Modelové cash flow (snapshot)",
    description: "Nájem − modelová splátka − provoz — hrubý odhad v free vrstvě.",
    tier: "free",
    typicalKind: "MODEL",
  },
  {
    id: "financing_fit",
    label: "Základní vhodnost financování",
    description: "Orientační páka vlastních prostředků vs. cena — ne posouzení banky.",
    tier: "free",
    typicalKind: "ODHAD",
  },
  {
    id: "red_flags",
    label: "Warning signals / red flags",
    description: "Jen z dostupných vstupů; nic právního nevymýšlíme.",
    tier: "free",
    typicalKind: "ODHAD",
  },
  {
    id: "data_quality",
    label: "Data quality indicator",
    description: "Completeness vstupů — ne kvalita nemovitosti.",
    tier: "free",
    typicalKind: "MODEL",
  },
  {
    id: "net_yield",
    label: "Orientační čistý výnos",
    description: "Po modelových nákladech — detailní analýza.",
    tier: "premium",
    typicalKind: "MODEL",
  },
  {
    id: "cash_flow",
    label: "Měsíční peněžní tok (model)",
    description: "Nájem minus modelová splátka — detailní analýza.",
    tier: "premium",
    typicalKind: "MODEL",
  },
  {
    id: "ltv_dsti",
    label: "LTV / DSTI rámec",
    description: "Modelové limity, ne schválení.",
    tier: "premium",
    typicalKind: "MODEL",
  },
  {
    id: "liquidity",
    label: "Likvidita lokality",
    description: "Redakční / modelový odhad — bez falešné přesnosti.",
    tier: "premium",
    typicalKind: "ODHAD",
  },
  {
    id: "ownership",
    label: "Checklist vlastnictví a práva",
    description: "Checklist otázek; odpovědi jen po ověření partnerem.",
    tier: "premium",
    typicalKind: "NEOVERENO",
  },
  {
    id: "sensitivity",
    label: "Citlivost na sazbu a neobsazenost",
    description: "Scénáře modelu — detailní analýza.",
    tier: "premium",
    typicalKind: "MODEL",
  },
];
