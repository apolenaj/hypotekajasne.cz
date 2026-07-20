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
    case "MODELLED":
    case "PARTNER_QUOTE":
      return "MODEL";
    case "STALE":
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
    source: entry.canonicalModule,
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
    source: "Trust Center / metodika",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.metodika,
  };
}

export function readinessCitation(): CopilotCitation {
  return {
    id: "tool:readiness",
    label: "Hypoteční připravenost (algoritmický model)",
    source: "src/lib/mortgage-readiness",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.navrhNaMiru,
  };
}

export function decisionCitation(): CopilotCitation {
  return {
    id: "tool:mortgage-decision",
    label: "Hypoteční decision tool (CZ)",
    source: "src/lib/mortgage-decision",
    updatedAt: null,
    claimKind: "MODEL",
    href: routes.kalkulacky.root,
  };
}

export function marketMatchCitation(): CopilotCitation {
  return {
    id: "tool:market-matching",
    label: "Market matching (Investiční pas)",
    source: "src/lib/market-matching",
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
      source: "supabase:current_rates / bank_rates",
      updatedAt,
      claimKind,
      href: routes.zdroje,
    }
  );
}

export const CLAIM_KIND_HINT: Record<ClaimKind, string> = {
  DATA: "Ověřená / živá data platformy",
  MODEL: "Algoritmický model s dokumentovanými předpoklady",
  ODHAD: "Orientační odhad — ověřte u specialisty",
  NEOVERENO: "Údaj není ověřen — nepoužíváme jako fakt",
};
