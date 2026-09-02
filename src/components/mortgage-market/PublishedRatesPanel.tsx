"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormattedMoneyInput } from "@/components/ui/FormattedMoneyInput";
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
import {
  formatExactLtvCs,
  formatLtvBandLabel,
  rateFilterLtvFromContext,
  buildLtvContext,
  journeyCoreEqual,
  parseMortgageJourneyParams,
  serializeMortgageJourneyParams,
  type LtvContext,
  type MortgageJourneyContext,
  type MortgageJourneyCore,
} from "@/lib/mortgage-rates/ltv-context";
import { RatesDisclaimer } from "@/components/legal/RatesDisclaimer";
import { cn } from "@/lib/utils";

export type RatesQueryState = MortgageJourneyCore;

type PublishedRatesPanelProps = {
  initialResult: GetMortgageOffersResult | null;
  initialQuery: RatesQueryState;
  initialLtvContext: LtvContext;
  initialParamErrors?: string[];
  className?: string;
  headingId?: string;
  onSelectOffer?: (offer: MortgageOffer) => void;
  showPendingLenders?: boolean;
  /** Homepage uses shorter intro focused on date + source. */
  variant?: "default" | "home";
};

async function fetchOffers(
  query: RatesQueryState,
  filterLtv: number
): Promise<GetMortgageOffersResult | null> {
  const params = new URLSearchParams({
    country: "CZ",
    purpose: query.purpose,
    fixationMonths: String(query.fixationMonths),
    ltv: String(filterLtv),
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
    if (
      a.rateStatus === "verification_pending" ||
      a.rateStatus === "no_matching_rate"
    ) {
      seen.add(a.lenderSlug);
      cards.push({
        slug: a.lenderSlug,
        name: a.lenderName,
        message: msg,
      });
    }
  }
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

function queriesEqual(a: RatesQueryState, b: RatesQueryState): boolean {
  return journeyCoreEqual(a, b);
}

export function PublishedRatesPanel({
  initialResult,
  initialQuery,
  initialLtvContext,
  initialParamErrors = [],
  className,
  headingId = "published-rates-heading",
  onSelectOffer,
  showPendingLenders = true,
  variant = "default",
}: PublishedRatesPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [marketing, setMarketing] = useState<Partial<MortgageJourneyContext>>(() =>
    parseMortgageJourneyParams(
      Object.fromEntries(searchParams.entries())
    ).context
  );
  const [ltvContext, setLtvContext] = useState(initialLtvContext);
  const [paramErrors, setParamErrors] = useState(initialParamErrors);
  const [result, setResult] = useState(initialResult);
  const [loading, setLoading] = useState(false);
  const lastResultsViewKeyRef = useRef<string | null>(null);
  const skipInitialReloadRef = useRef(true);

  const syncUrl = useCallback(
    (nextCore: RatesQueryState, nextMarketing: Partial<MortgageJourneyContext>) => {
      const params = serializeMortgageJourneyParams(
        { ...nextCore, ...nextMarketing },
        { preserveMarketingFrom: searchParams }
      );
      router.replace(`/sazby?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const applyQuery = useCallback(
    (next: RatesQueryState) => {
      setQuery(next);
      setParamErrors([]);
      setLtvContext(
        buildLtvContext({
          propertyValueCzk: next.propertyValueCzk,
          loanAmountCzk: next.loanAmountCzk,
        })
      );
      syncUrl(next, marketing);
    },
    [marketing, syncUrl]
  );

  useEffect(() => {
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = parseMortgageJourneyParams(raw);
    setQuery((prev) =>
      journeyCoreEqual(parsed.context, prev) ? prev : parsed.context
    );
    setLtvContext(parsed.ltvContext);
    setMarketing(parsed.context);
    setParamErrors(parsed.paramErrors);
  }, [searchParams]);

  const reload = useCallback(
    async (next: RatesQueryState, context: LtvContext) => {
      const filterLtv = rateFilterLtvFromContext(context);
      if (filterLtv == null || paramErrors.length > 0) {
        setResult({
          offers: [],
          unspecifiedLtvOffers: [],
          lenderAvailability: [],
          usedModelFallback: false,
        });
        return;
      }
      setLoading(true);
      try {
        const data = await fetchOffers(next, filterLtv);
        if (data) setResult(data);
      } finally {
        setLoading(false);
      }
    },
    [paramErrors.length]
  );

  useEffect(() => {
    if (skipInitialReloadRef.current) {
      skipInitialReloadRef.current = false;
      if (queriesEqual(query, initialQuery) && initialResult && paramErrors.length === 0) {
        return;
      }
    }
    const t = setTimeout(() => {
      void reload(query, ltvContext);
    }, 350);
    return () => clearTimeout(t);
  }, [query, ltvContext, initialQuery, initialResult, reload, paramErrors.length]);

  useEffect(() => {
    if (!result || ltvContext.exactLtv == null) return;
    const key = [
      query.purpose,
      query.fixationMonths,
      ltvContext.exactLtv,
      ltvContext.ltvBand,
      result.offers.length,
      result.unspecifiedLtvOffers.length,
    ].join("|");
    if (lastResultsViewKeyRef.current === key) return;
    lastResultsViewKeyRef.current = key;
    trackEvent("rate_results_view", {
      purpose: query.purpose,
      fixation_months: query.fixationMonths,
      ltv_band: ltvBand(ltvContext.exactLtv),
      matched_offer_count: result.offers.length,
      unspecified_ltv_offer_count: result.unspecifiedLtvOffers.length,
      funnel_id: "phase4_conversion",
    });
  }, [result, query.purpose, query.fixationMonths, ltvContext]);

  const matchedGroups: LenderOfferGroup[] = useMemo(
    () => groupOffersByLenderProduct(result?.offers ?? []),
    [result]
  );
  const unspecifiedGroups: LenderOfferGroup[] = useMemo(
    () => groupOffersByLenderProduct(result?.unspecifiedLtvOffers ?? []),
    [result]
  );
  const pending = showPendingLenders ? pendingCards(result) : [];

  const canShowRates =
    paramErrors.length === 0 &&
    ltvContext.exactLtv != null &&
    !ltvContext.validationError &&
    !ltvContext.exceedsSupportedMax;

  const paymentParams = useMemo(
    () =>
      canShowRates && query.loanAmountCzk > 0 && query.termYears > 0
        ? {
            loanAmountCzk: query.loanAmountCzk,
            termYears: query.termYears,
          }
        : null,
    [canShowRates, query.loanAmountCzk, query.termYears]
  );

  return (
    <section
      aria-labelledby={headingId}
      className={cn("border-b border-border bg-white", className)}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            {variant === "home" ? "Orientační sazby" : "Zveřejněné sazby bank"}
          </p>
          <h2
            id={headingId}
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            {variant === "home"
              ? "Přehled sazeb s datem a zdrojem ověření"
              : "Ověřené sazby z oficiálních zdrojů bank"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {variant === "home"
              ? "Sazby přebíráme z veřejných sazebníků bank. U každé karty uvádíme datum posledního ověření a odkaz na oficiální zdroj."
              : "Sazby přebíráme z veřejných sazebníků. U každé karty uvádíme datum posledního ověření a odkaz na oficiální zdroj."}
          </p>
          <RatesDisclaimer className="mt-3" />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block min-w-0 text-sm">
            <span className="mb-1.5 block text-xs font-semibold text-text-dark">
              Účel
            </span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-white px-3 text-base"
              value={query.purpose}
              onChange={(e) =>
                applyQuery({
                  ...query,
                  purpose: e.target.value as RatesQueryState["purpose"],
                })
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
                applyQuery({
                  ...query,
                  fixationMonths: Number(e.target.value),
                })
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
              Hodnota nemovitosti
            </span>
            <FormattedMoneyInput
              value={query.propertyValueCzk}
              onChange={(propertyValueCzk) =>
                applyQuery({ ...query, propertyValueCzk })
              }
              suffix="Kč"
              className="h-11 rounded-lg border-border bg-white text-base"
            />
          </label>
          <label className="block min-w-0 text-sm">
            <span className="mb-1.5 block text-xs font-semibold text-text-dark">
              Výše úvěru
            </span>
            <FormattedMoneyInput
              value={query.loanAmountCzk}
              onChange={(loanAmountCzk) =>
                applyQuery({ ...query, loanAmountCzk })
              }
              suffix="Kč"
              className="h-11 rounded-lg border-border bg-white text-base"
            />
          </label>
        </div>

        {paramErrors.length > 0 ? (
          <div
            className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            <p className="font-semibold">Odkaz obsahuje neplatné parametry</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {paramErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Upravte hodnoty ve filtrech výše — sazby se načtou podle opraveného
              výpočtu.
            </p>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-border bg-[#f7f8f7] px-4 py-3 text-sm">
          {ltvContext.validationError ? (
            <p className="font-medium text-amber-900" role="alert">
              {ltvContext.validationError}
            </p>
          ) : ltvContext.exactLtv != null ? (
            <p className="text-text-dark">
              Vaše LTV:{" "}
              <span className="font-semibold tabular-nums">
                {formatExactLtvCs(ltvContext.exactLtv)}&nbsp;%
              </span>
              {ltvContext.ltvBand != null ? (
                <>
                  {" "}
                  · sazby filtrujeme pro pásmo{" "}
                  <span className="font-semibold">
                    {formatLtvBandLabel(ltvContext.ltvBand)}
                  </span>
                </>
              ) : null}
            </p>
          ) : null}
          {ltvContext.exactLtv != null && !ltvContext.validationError ? (
            <p className="mt-1 text-xs text-muted-foreground">
              LTV = výše úvěru / hodnota nemovitosti × 100. Banka posuzuje i
              další podmínky — shoda LTV sama o sobě neznamená nárok na sazbu.
            </p>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            Načítám sazby…
          </p>
        ) : null}

        {canShowRates ? (
          <>
            <div className="mt-8">
              <h3 className="font-heading text-lg font-semibold text-text-dark">
                Sazby s cenovým pásmem odpovídajícím vašemu LTV
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Banka v sazebníku uvádí pásmo LTV, které odpovídá vašemu LTV{" "}
                {formatExactLtvCs(ltvContext.exactLtv!)}&nbsp;% (filtr{" "}
                {formatLtvBandLabel(ltvContext.ltvBand!)}). Shoda LTV sama o
                sobě neznamená nárok na úvěr nebo sazbu.
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
                      paymentParams={paymentParams}
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
                Tyto sazby banka zveřejnila bez samostatného cenového pásma LTV
                — proto je neřadíme k vašemu LTV{" "}
                {formatExactLtvCs(ltvContext.exactLtv!)}&nbsp;%.
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
                      paymentParams={paymentParams}
                      onSelectScenario={onSelectOffer}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        {pending.length > 0 && canShowRates ? (
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

        {variant === "home" ? (
          <div className="mt-8">
            <Link
              href="/sazby"
              className="inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
            >
              Zobrazit všechny sazby
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
