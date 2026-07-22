/**
 * Executive market snapshot — jen dostupná data (žádné vymyšlené metriky).
 */

import { countryConfigs, type CountryId } from "@/lib/calculators";
import { getCountryDossier } from "@/lib/country-dossier";
import type { DataStatus } from "@/lib/data/types";
import {
  DESTINATION_METRICS,
  type DestinationMetric,
} from "@/lib/destination-metrics";
import { MARKET_PROFILES } from "@/lib/market-matching/market-profiles";
import type { MarketId } from "@/lib/market-matching/types";

const COUNTRY_TO_MARKET: Record<CountryId, MarketId> = {
  cz: "cz",
  slovakia: "sk",
  dubai: "ae",
  spain: "es",
  italy: "it",
  croatia: "hr",
  bali: "id",
  saudi: "sa",
};

export type SnapshotField = {
  id: string;
  label: string;
  value: string;
  /** null = fakt bez status badge (např. kód měny) */
  status: DataStatus | null;
  note?: string;
};

export type ExecutiveSnapshot = {
  countryId: CountryId;
  name: string;
  tagline: string;
  /** Jedna věta — komu trh dává smysl */
  forWhom: string | null;
  /** Hlavní výhoda (z executive summary) */
  mainAdvantage: string | null;
  /** Hlavní riziko */
  mainRisk: string | null;
  fields: SnapshotField[];
  dataStatus: DataStatus;
};

function bandLabel(score: number, invert = false): string {
  const s = invert ? 100 - score : score;
  if (s >= 70) return "Vyšší";
  if (s >= 45) return "Střední";
  return "Nižší";
}

function firstBullet(
  dossier: ReturnType<typeof getCountryDossier>,
  sectionId: string
): string | null {
  const section = dossier.sections.find((s) => s.id === sectionId);
  if (!section) return null;
  if ("bullets" in section && section.bullets[0]?.text) {
    return section.bullets[0].text;
  }
  if ("flags" in section) {
    const high = section.flags.find((f) => f.severity === "high");
    return high?.text ?? section.flags[0]?.text ?? null;
  }
  return section.summary || null;
}

function destinationOf(countryId: CountryId): DestinationMetric | undefined {
  return DESTINATION_METRICS.find((d) => d.countryId === countryId);
}

export function buildExecutiveSnapshot(
  countryId: CountryId
): ExecutiveSnapshot {
  const dossier = getCountryDossier(countryId);
  const dest = destinationOf(countryId);
  const config = countryConfigs[countryId];
  const profile = MARKET_PROFILES.find(
    (p) => p.id === COUNTRY_TO_MARKET[countryId]
  );

  const forWhom = firstBullet(dossier, "suitability");
  const mainAdvantage =
    firstBullet(dossier, "executive_summary") ?? dest?.summary ?? null;
  const mainRisk =
    profile?.topRisks[0] ??
    firstBullet(dossier, "red_flags") ??
    (dest ? `Celkové riziko: ${dest.risk}` : null);

  const fields: SnapshotField[] = [];

  if (dest) {
    fields.push({
      id: "financing",
      label: "Financování",
      value: dest.financing,
      status: dest.dataStatus,
    });
    fields.push({
      id: "ownership",
      label: "Vlastnictví",
      value: dest.ownership,
      status: dest.dataStatus,
    });
    fields.push({
      id: "capital",
      label: "Potřebný kapitál",
      value: dest.entryCapitalLabel,
      status:
        dest.entryCapitalLabel.toLowerCase().includes("vyžádání")
          ? "UNVERIFIED"
          : "MODEL",
      note: "Orientační pásmo — ne nabídka.",
    });
  }

  fields.push({
    id: "currency",
    label: "Měna",
    value: config.currency === "CZK" ? "Kč (CZK)" : config.currency,
    status: null,
    note: "Měna produktů na tomto trhu — bez skryté konverze.",
  });

  if (profile) {
    fields.push({
      id: "liquidity",
      label: "Likvidita",
      value: bandLabel(profile.attributes.liquidity),
      status: profile.dataStatus === "VERIFIED" ? "VERIFIED" : "MODEL",
      note: "Modelové skóre oproti ostatním trhům v pasu.",
    });
    fields.push({
      id: "regulation",
      label: "Regulatorní složitost",
      value: bandLabel(profile.attributes.regulatory_complexity, true),
      status: profile.dataStatus === "VERIFIED" ? "VERIFIED" : "MODEL",
      note: "Vyšší = náročnější rámec pro cizince / strukturu.",
    });
  }

  return {
    countryId,
    name: dossier.name,
    tagline: dossier.tagline,
    forWhom,
    mainAdvantage,
    mainRisk,
    fields,
    dataStatus: dest?.dataStatus ?? "MODEL",
  };
}
