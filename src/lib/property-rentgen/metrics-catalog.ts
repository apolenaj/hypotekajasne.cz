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
    description: "Zadaná nebo z inzerátu — bez ověření = NEOVĚŘENO.",
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
    id: "gross_yield",
    label: "Orientační hrubý výnos",
    description: "Z nájmu a ceny, nebo modelový yield lokality.",
    tier: "free",
    typicalKind: "MODEL",
  },
  {
    id: "financing_fit",
    label: "Základní financing fit",
    description: "Orientační páka equity vs. cena — ne posouzení banky.",
    tier: "free",
    typicalKind: "ODHAD",
  },
  {
    id: "red_flags",
    label: "Základní red flags",
    description: "Jen z dostupných vstupů; nic právního nevymýšlíme.",
    tier: "free",
    typicalKind: "ODHAD",
  },
  {
    id: "net_yield",
    label: "Orientační čistý výnos",
    description: "Po modelových nákladech — Premium.",
    tier: "premium",
    typicalKind: "MODEL",
  },
  {
    id: "cash_flow",
    label: "Měsíční cash-flow (model)",
    description: "Nájem minus modelová splátka — Premium.",
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
    description: "Editorial / model — bez falešné přesnosti.",
    tier: "premium",
    typicalKind: "ODHAD",
  },
  {
    id: "ownership",
    label: "Ownership & legal checklist",
    description: "Checklist otázek; odpovědi jen po ověření partnerem.",
    tier: "premium",
    typicalKind: "NEOVERENO",
  },
  {
    id: "sensitivity",
    label: "Citlivost na sazbu a neobsazenost",
    description: "Scénáře modelu — Premium.",
    tier: "premium",
    typicalKind: "MODEL",
  },
];
