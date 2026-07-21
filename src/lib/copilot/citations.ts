import type { ClaimKind, CopilotCitation } from "@/lib/copilot/types";
import { getCatalogEntry } from "@/lib/data/catalog";
import { routes } from "@/lib/routes";

export function claimFromDataStatus(
  status: string | undefined
): ClaimKind {
  switch (status) {
    case "LIVE":
    case "VERIFIED":
      return "DATA";
    case "MODEL":
    case "PARTNER_QUOTE":
      return "MODEL";
    case "ESTIMATE":
      return "ODHAD";
    case "STALE":
    case "UNVERIFIED":
      return "NEOVERENO";
    default:
      return "ODHAD";
  }
}

export function citationFromCatalog(
  catalogId: string,
  overrides?: Partial<CopilotCitation>
): CopilotCitation | null {
  const entry = getCatalogEntry(catalogId);
  if (!entry) return null;
  return {
    id: `catalog:${entry.id}`,
    label: entry.label,
    source: "Katalog dat HypotékaJasně",
    updatedAt: null,
    claimKind: claimFromDataStatus(entry.defaultStatus),
    href: routes.zdroje,
    ...overrides,
  };
}

export function methodologyCitation(): CopilotCitation {
  return {
    id: "metodika",
    label: "Metodika modelů HypotékaJasně",
    source: "Centrum důvěry / metodika",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.metodika,
  };
}

export function readinessCitation(): CopilotCitation {
  return {
    id: "tool:readiness",
    label: "Hypoteční připravenost (algoritmický model)",
    source: "Nástroj Hypoteční připravenost",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.navrhNaMiru,
  };
}

export function decisionCitation(): CopilotCitation {
  return {
    id: "tool:mortgage-decision",
    label: "Hypoteční kalkulačka (ČR)",
    source: "Nástroj rozhodování o hypotéce",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.kalkulacky.root,
  };
}

export function marketMatchCitation(): CopilotCitation {
  return {
    id: "tool:market-matching",
    label: "Přiřazení trhů (Investiční pas)",
    source: "Nástroj Investiční pas",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.investicniPas,
  };
}

export function rateCitation(
  updatedAt: string | null,
  claimKind: ClaimKind
): CopilotCitation {
  const base = citationFromCatalog("rate.cz.market.aggregate", {
    updatedAt,
    claimKind,
  });
  return (
    base ?? {
      id: "rate.cz.market.aggregate",
      label: "Agregovaná modelová sazba ČR",
      source: "Veřejné sazby sledovaných bank",
      updatedAt,
      claimKind,
      href: routes.zdroje,
    }
  );
}

export const CLAIM_KIND_HINT: Record<ClaimKind, string> = {
  DATA: "Ověřená / aktuální data platformy",
  MODEL: "Modelový výpočet s dokumentovanými předpoklady",
  ODHAD: "Orientační odhad — ověřte u specialisty",
  NEOVERENO: "Údaj není ověřen — nepoužíváme jako fakt",
};
