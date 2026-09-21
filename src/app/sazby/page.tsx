import type { Metadata } from "next";
import { Suspense } from "react";
import { SazbyExperience } from "@/components/mortgage-market/SazbyExperience";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import { CZ_MANIFEST_CHECKED_AT } from "@/lib/mortgage-market/import/data/cz-2026-08-09";
import {
  buildLeadMetadataFromJourney,
  parseMortgageJourneyParams,
  rateFilterLtvFromContext,
  type MortgageJourneyCore,
} from "@/lib/mortgage-rates/ltv-context";
import { resolveMortgageJourneySummary } from "@/lib/mortgage-rates/mortgage-journey-summary";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

/**
 * Canonical search document is always /sazby (no query variants).
 * Filters (fixation, property, loan, purpose…) personalize the UI only.
 *
 * Production SoT for rendered rates = verified CZ import manifest catalog.
 * (Supabase mortgage_rate_variants can lag behind the audited manifest;
 *  /sazby must not serve stale DB rows over fresh primary-source audit data.)
 */
export const metadata: Metadata = getStaticPageSeo(routes.sazby);

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

async function loadOffers(query: MortgageJourneyCore, ltvFilter: number) {
  return getMortgageOffers(getCz20260809Catalog(), {
    countryCode: "CZ",
    purpose: query.purpose,
    fixationMonths: query.fixationMonths,
    ltv: ltvFilter,
    includeLtvUnspecified: true,
    // Align freshness window with the audit snapshot (not wall-clock alone).
    nowMs: Date.parse(CZ_MANIFEST_CHECKED_AT) + 12 * 60 * 60 * 1000,
  });
}

export default async function SazbyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const journey = parseMortgageJourneyParams(params);
  const { context: query, ltvContext, paramErrors } = journey;
  const summary = resolveMortgageJourneySummary(journey);
  const filterLtv = rateFilterLtvFromContext(ltvContext);

  const initialOffers =
    paramErrors.length > 0 || filterLtv == null || ltvContext.exceedsSupportedMax
      ? {
          offers: [],
          unspecifiedLtvOffers: [],
          lenderAvailability: [],
          usedModelFallback: false as const,
        }
      : await loadOffers(query, filterLtv);

  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground">Načítám sazby…</div>}>
      <SazbyExperience
        initialOffers={initialOffers}
        initialQuery={query}
        ltvContext={ltvContext}
        initialParamErrors={paramErrors}
        journeySummary={summary}
        journeyMetadata={buildLeadMetadataFromJourney(query, ltvContext, {
          sourcePage: routes.sazby,
          ...(summary.status === "ready"
            ? { modelMonthlyPayment: summary.modelMonthlyPaymentCzk }
            : {}),
        })}
      />
    </Suspense>
  );
}
