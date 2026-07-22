/**
 * Mapování FactClaim → LegalClaim / UI stringy.
 */

import type { LegalClaim } from "@/lib/country-dossier/types";
import type { DataStatus } from "@/lib/data/types";
import type { FactClaim, FactClaimStatus } from "@/lib/sources/types";

export function factStatusToDataStatus(status: FactClaimStatus): DataStatus {
  switch (status) {
    case "VERIFIED":
      return "VERIFIED";
    case "UNVERIFIED":
      return "UNVERIFIED";
    case "NEEDS_UPDATE":
      return "STALE";
    case "MODEL":
      return "MODEL";
    case "ESTIMATE":
      return "ESTIMATE";
    default:
      return "UNVERIFIED";
  }
}

export function formatFactClaimValue(claim: FactClaim): string {
  if (claim.value === null || claim.value === undefined) {
    return claim.status === "NEEDS_UPDATE"
      ? "Vyžaduje aktualizaci ze zdroje"
      : "Neuvedeno";
  }
  if (typeof claim.value === "number") {
    if (claim.topic === "ltv_dti_dsti" && claim.id.includes("ltv")) {
      return `${claim.value} %`;
    }
    if (claim.id.includes("dti") && !claim.id.includes("dsti")) {
      return String(claim.value);
    }
    if (claim.id.includes("dsti")) {
      return `${claim.value} %`;
    }
    if (claim.topic === "cadastre" || claim.topic === "fees") {
      return `${claim.value.toLocaleString("cs-CZ")} Kč`;
    }
    return String(claim.value);
  }
  return claim.value;
}

export function factClaimToLegalClaim(fact: FactClaim): LegalClaim {
  return {
    text: fact.claim,
    source: fact.sourceName,
    sourceUrl: fact.sourceUrl,
    asOf: fact.verifiedAt ?? fact.validFrom ?? "neznámé",
    status: factStatusToDataStatus(fact.status),
    notes: [
      fact.notes,
      fact.verifiedAt ? `Ověřeno: ${fact.verifiedAt}` : null,
      fact.value !== null && fact.value !== undefined
        ? `Hodnota: ${formatFactClaimValue(fact)}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ") || null,
  };
}

/** Krátký display pro cost line (label + range). */
export function factClaimCostRange(fact: FactClaim): string {
  if (fact.status === "NEEDS_UPDATE") {
    return "vyžaduje aktualizaci";
  }
  return formatFactClaimValue(fact);
}
