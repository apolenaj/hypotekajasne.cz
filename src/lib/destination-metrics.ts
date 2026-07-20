/**
 * Datové metriky destinací pro homepage cards.
 * Statusy odpovídají Source of Truth — žádné marketingové superlativy.
 */

import type { DataStatus } from "@/lib/data/types";
import type { CountryId } from "@/lib/calculators";
import { countrySlugs } from "@/lib/routes";

export type OwnershipType =
  | "Freehold"
  | "Leasehold"
  | "Mix Freehold / Leasehold";

export type FinancingLevel =
  | "Vysoká (CZ banky)"
  | "Střední (EU / nerezident)"
  | "Omezená (lokální / cash)"
  | "Na vyžádání";

export type RiskLevel = "Nižší" | "Střední" | "Vyšší";

export type DestinationMetric = {
  countryId: CountryId;
  name: string;
  slug: string;
  ownership: OwnershipType;
  financing: FinancingLevel;
  /** Orientační vstupní kapitál — MODELLED, ne live kotace */
  entryCapitalLabel: string;
  risk: RiskLevel;
  dataStatus: DataStatus;
  summary: string;
  image: string;
};

/**
 * Editorial / MODELLED přehled — UI musí ukazovat datový status.
 * Vstupní kapitál je orientační pásmo, ne nabídka.
 */
export const DESTINATION_METRICS: DestinationMetric[] = [
  {
    countryId: "cz",
    name: "Česká republika",
    slug: countrySlugs.cz,
    ownership: "Freehold",
    financing: "Vysoká (CZ banky)",
    entryCapitalLabel: "od ~1 mil. Kč",
    risk: "Nižší",
    dataStatus: "LIVE",
    summary:
      "Domácí trh s limity ČNB a živými sazbami 6 sledovaných bank.",
    image:
      "https://images.pexels.com/photos/126292/pexels-photo-126292.jpeg?auto=compress&cs=tinysrgb&w=1000",
  },
  {
    countryId: "dubai",
    name: "SAE (Dubaj)",
    slug: countrySlugs.dubai,
    ownership: "Freehold",
    financing: "Omezená (lokální / cash)",
    entryCapitalLabel: "od ~800 tis. AED",
    risk: "Vyšší",
    dataStatus: "MODELLED",
    summary:
      "Freehold v designovaných zónách; financování a daňový režim ověřujte lokálně.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    countryId: "spain",
    name: "Španělsko",
    slug: countrySlugs.spain,
    ownership: "Freehold",
    financing: "Střední (EU / nerezident)",
    entryCapitalLabel: "od ~80 tis. €",
    risk: "Střední",
    dataStatus: "MODELLED",
    summary:
      "EU trh; dostupnost úvěru pro nerezidenty závisí na bance a LTV.",
    image:
      "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1000",
  },
  {
    countryId: "italy",
    name: "Itálie",
    slug: countrySlugs.italy,
    ownership: "Freehold",
    financing: "Střední (EU / nerezident)",
    entryCapitalLabel: "od ~100 tis. €",
    risk: "Střední",
    dataStatus: "MODELLED",
    summary:
      "Regionální rozdíly (sever vs. jih); proces koupě je delší než v ČR.",
    image:
      "https://images.pexels.com/photos/1701595/pexels-photo-1701595.jpeg?auto=compress&cs=tinysrgb&w=1000",
  },
  {
    countryId: "croatia",
    name: "Chorvatsko",
    slug: countrySlugs.croatia,
    ownership: "Freehold",
    financing: "Střední (EU / nerezident)",
    entryCapitalLabel: "od ~70 tis. €",
    risk: "Střední",
    dataStatus: "MODELLED",
    summary:
      "Eurozóna a Schengen; sezónnost nájmů ovlivňuje cash-flow u přímoří.",
    image:
      "https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=1000",
  },
  {
    countryId: "bali",
    name: "Bali (Indonésie)",
    slug: countrySlugs.bali,
    ownership: "Leasehold",
    financing: "Omezená (lokální / cash)",
    entryCapitalLabel: "od ~150 tis. USD",
    risk: "Vyšší",
    dataStatus: "MODELLED",
    summary:
      "Pro cizince typicky leasehold; výnosy i právní struktura vyžadují due diligence.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    countryId: "saudi",
    name: "Saúdská Arábie",
    slug: countrySlugs.saudi,
    ownership: "Mix Freehold / Leasehold",
    financing: "Na vyžádání",
    entryCapitalLabel: "Na vyžádání",
    risk: "Vyšší",
    dataStatus: "STALE",
    summary:
      "Trh se otevírá (Vision 2030); vlastnictví a financování pro cizince ověřujeme individuálně.",
    image:
      "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    countryId: "slovakia",
    name: "Slovensko",
    slug: countrySlugs.slovakia,
    ownership: "Freehold",
    financing: "Střední (EU / nerezident)",
    entryCapitalLabel: "od ~60 tis. €",
    risk: "Nižší",
    dataStatus: "MODELLED",
    summary:
      "Euro a blízký právní rámec EU; sazby nejsou live — modelové defaulty.",
    image:
      "https://images.pexels.com/photos/3322194/pexels-photo-3322194.jpeg?auto=compress&cs=tinysrgb&w=1000",
  },
];

export const TRACKED_MARKETS_COUNT = DESTINATION_METRICS.length;
export const TRACKED_CZ_BANKS_COUNT = 6;
