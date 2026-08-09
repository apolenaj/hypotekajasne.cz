import type { Metadata } from "next";
import { SazbyExperience } from "@/components/mortgage-market/SazbyExperience";
import { getMortgageOffersFromSupabase } from "@/lib/mortgage-market/offers.server";
import { getCz20260809Catalog } from "@/lib/mortgage-market/catalog-from-manifest";
import { getMortgageOffers } from "@/lib/mortgage-market/offers";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

/**
 * Canonical search document is always /sazby (no query variants).
 * Filters (fixation, LTV, purpose, loan…) personalize the UI only.
 */
export const metadata: Metadata = getStaticPageSeo(routes.sazby);

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    purpose?: string;
    fixationMonths?: string;
    ltv?: string;
    property?: string;
    loan?: string;
  }>;
};

function parseQuery(params: Awaited<PageProps["searchParams"]>) {
  const purpose =
    params.purpose === "refinance" ? ("refinance" as const) : ("purchase" as const);
  const fixationMonths = Number(params.fixationMonths ?? 36);
  const ltv = Number(params.ltv ?? 75);
  return {
    purpose,
    fixationMonths:
      Number.isFinite(fixationMonths) && fixationMonths > 0
        ? fixationMonths
        : 36,
    ltv: Number.isFinite(ltv) && ltv > 0 && ltv <= 100 ? ltv : 75,
    propertyValue: params.property ? Number(params.property) : undefined,
    loanAmount: params.loan ? Number(params.loan) : undefined,
  };
}

async function loadOffers(query: {
  purpose: "purchase" | "refinance";
  fixationMonths: number;
  ltv: number;
}) {
  const base = {
    countryCode: "CZ",
    purpose: query.purpose,
    fixationMonths: query.fixationMonths,
    ltv: query.ltv,
    includeLtvUnspecified: true,
  };
  try {
    const live = await getMortgageOffersFromSupabase(base);
    if (live) return live;
  } catch {
    // manifest fallback
  }
  return getMortgageOffers(getCz20260809Catalog(), {
    ...base,
    nowMs: Date.parse("2026-08-09T12:00:00.000Z"),
  });
}

export default async function SazbyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = parseQuery(params);
  const initialOffers = await loadOffers(query);

  return (
    <SazbyExperience
      initialOffers={initialOffers}
      initialQuery={{
        purpose: query.purpose,
        fixationMonths: query.fixationMonths,
        ltv: query.ltv,
      }}
      journeyMetadata={{
        purpose: query.purpose,
        fixationMonths: query.fixationMonths,
        ltv: query.ltv,
        propertyValue: query.propertyValue,
        mortgageAmount: query.loanAmount,
        sourcePage: routes.sazby,
      }}
    />
  );
}
