"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BankRateCard,
  LenderPendingCard,
} from "@/components/mortgage-market/BankRateCard";
import { ltvBand } from "@/lib/analytics/bands";
import { trackEvent } from "@/lib/analytics/track-event";
import {
  groupOffersByLenderProduct,
  type LenderOfferGroup,
} from "@/lib/mortgage-market/group-offers";
import type {
  GetMortgageOffersResult,
  MortgageOffer,
} from "@/lib/mortgage-market/offers";
import { cn } from "@/lib/utils";

export type RatesQueryState = {
  purpose: "purchase" | "refinance";
  fixationMonths: number;
  ltv: number;
};

type PublishedRatesPanelProps = {
  initialResult: GetMortgageOffersResult | null;
  initialQuery: RatesQueryState;
  className?: string;
  headingId?: string;
  onSelectOffer?: (offer: MortgageOffer) => void;
  /** Show CSOB / RB pending cards when useful. */
  showPendingLenders?: boolean;
};

async function fetchOffers(
  query: RatesQueryState
): Promise<GetMortgageOffersResult | null> {
  const params = new URLSearchParams({
    country: "CZ",
    purpose: query.purpose,
    fixationMonths: String(query.fixationMonths),
    ltv: String(query.ltv),
    includeLtvUnspecified: "1",
  });
  const res = await fetch(`/api/mortgage-market/offers?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return (await res.json()) as GetMortgageOffersResult;
}

function pendingCards(result: GetMortgageOffersResult | null) {
  if (!result) return [];
  const wanted = new Map([
    ["csob", "Sazbu právě ověřujeme"],
    ["raiffeisenbank", "Aktuální sazbu ověřujeme"],
  ]);
  const seen = new Set<string>();
  const cards: { slug: string; name: string; message: string }[] = [];
  for (const a of result.lenderAvailability) {
    const msg = wanted.get(a.lenderSlug);
    if (!msg || seen.has(a.lenderSlug)) continue;
    if (a.rateStatus === "verification_pending" || a.rateStatus === "no_matching_rate") {
      seen.add(a.lenderSlug);
      cards.push({
        slug: a.lenderSlug,
        name: a.lenderName,
        message: msg,
      });
    }
  }
  // Ensure placeholders even if availability empty (filter too narrow)
  for (const [slug, message] of wanted) {
    if (seen.has(slug)) continue;
    const hasOffer =
      result.offers.some((o) => o.lenderSlug === slug) ||
      result.unspecifiedLtvOffers.some((o) => o.lenderSlug === slug);
    if (!hasOffer) {
      cards.push({
        slug,
        name: slug === "csob" ? "ČSOB" : "Raiffeisenbank",
        message,
      });
    }
  }
  return cards;
}

export function PublishedRatesPanel({
  initialResult,
  initialQuery,
  className,
  headingId = "published-rates-heading",
  onSelectOffer,
  showPendingLenders = true,
}: PublishedRatesPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const lastResultsViewKeyRef = useRef<string | null>(null);

  const reload = useCallback(async (next: RatesQueryState) => {
    setLoading(true);
    try {
      const data = await fetchOffers(next);
      if (data) setResult(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const same =
      query.purpose === initialQuery.purpose &&
      query.fixationMonths === initialQuery.fixationMonths &&
      query.ltv === initialQuery.ltv;
    if (same && initialResult) return;
    const t = setTimeout(() => {
      void reload(query);
    }, 350);
    return () => clearTimeout(t);
  }, [query, initialQuery, initialResult, reload]);

  useEffect(() => {
    if (!result) return;
    const key = [
      query.purpose,
      query.fixationMonths,
      query.ltv,
      result.offers.length,
      result.unspecifiedLtvOffers.length,
    ].join("|");
    if (lastResultsViewKeyRef.current === key) return;
    lastResultsViewKeyRef.current = key;
    trackEvent("rate_results_view", {
      purpose: query.purpose,
      fixation_months: query.fixationMonths,
      ltv_band: ltvBand(query.ltv),
      matched_offer_count: result.offers.length,
      unspecified_ltv_offer_count: result.unspecifiedLtvOffers.length,
      funnel_id: "phase4_conversion",
    });
  }, [result, query.purpose, query.fixationMonths, query.ltv]);

  const matchedGroups: LenderOfferGroup[] = useMemo(
    () => groupOffersByLenderProduct(result?.offers ?? []),
    [result]
  );
  const unspecifiedGroups: LenderOfferGroup[] = useMemo(
    () => groupOffersByLenderProduct(result?.unspecifiedLtvOffers ?? []),
    [result]
  );
  const pending = showPendingLenders ? pendingCards(result) : [];

  return (
    <section
      aria-labelledby={headingId}
      className={cn("border-b border-border bg-white", className)}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Zveřejněné sazby bank
          </p>
          <h2
            id={headingId}
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Ověřené sazby z oficiálních zdrojů bank
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Sazby přebíráme z veřejných sazebníků. Konečná nabídka banky závisí
            na vaší situaci — nejde o schválenou ani garantovanou sazbu.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <label className="block min-w-0 text-sm">
            <span className="mb-1.5 block text-xs font-semibold text-text-dark">
              Účel
            </span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-base"
              value={query.purpose}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  purpose: e.target.value as RatesQueryState["purpose"],
                }))
              }
            >
              <option value="purchase">Koupě bydlení</option>
              <option value="refinance">Refinancování</option>
            </select>
          </label>
          <label className="block min-w-0 text-sm">
            <span className="mb-1.5 block text-xs font-semibold text-text-dark">
              Fixace
            </span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-base"
              value={query.fixationMonths}
              onChange={(e) =>
                setQuery((q) => ({
                  ...q,
                  fixationMonths: Number(e.target.value),
                }))
              }
            >
              {[24, 36, 60, 84, 120].map((m) => (
                <option key={m} value={m}>
                  {m / 12} {m / 12 === 1 ? "rok" : m / 12 < 5 ? "roky" : "let"}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0 text-sm">
            <span className="mb-1.5 block text-xs font-semibold text-text-dark">
              Vaše LTV
            </span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-base"
              value={query.ltv}
              onChange={(e) =>
                setQuery((q) => ({ ...q, ltv: Number(e.target.value) }))
              }
            >
              {[70, 75, 80, 85, 90].map((v) => (
                <option key={v} value={v}>
                  {v} %
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            Načítám sazby…
          </p>
        ) : null}

        <div className="mt-8">
          <h3 className="font-heading text-lg font-semibold text-text-dark">
            Sazby odpovídající zadanému LTV
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Banka v sazebníku uvádí pásmo LTV, které odpovídá vašemu zadání (
            {query.ltv}&nbsp;%).
          </p>
          {matchedGroups.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Pro toto LTV a fixaci zatím nemáme ověřenou sazbu s explicitním
              pásmem LTV.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {matchedGroups.map((g) => (
                <BankRateCard
                  key={g.key}
                  group={g}
                  onSelectScenario={onSelectOffer}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h3 className="font-heading text-lg font-semibold text-text-dark">
            Další zveřejněné sazby bank
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tyto sazby banka zveřejnila bez samostatného cenového pásma LTV —
            proto je neřadíme k vašemu LTV {query.ltv}&nbsp;%.
          </p>
          {unspecifiedGroups.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Žádné další zveřejněné sazby pro zvolený filtr.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {unspecifiedGroups.map((g) => (
                <BankRateCard
                  key={g.key}
                  group={g}
                  onSelectScenario={onSelectOffer}
                />
              ))}
            </div>
          )}
        </div>

        {pending.length > 0 ? (
          <div className="mt-10">
            <h3 className="font-heading text-lg font-semibold text-text-dark">
              Banky v ověřování
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {pending.map((p) => (
                <LenderPendingCard
                  key={p.slug}
                  lenderName={p.name}
                  message={p.message}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
