"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
  LTV_ABOVE_CATALOG_WARNING,
  type LtvContext,
  type MortgageJourneyContext,
  type MortgageJourneyCore,
} from "@/lib/mortgage-rates/ltv-context";
import { RatesDisclaimer } from "@/components/legal/RatesDisclaimer";
import { buildHomeRateRows } from "@/lib/mortgage-market/home-rate-row";
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
  /** Homepage data row: card beside the price chart, without the full filter form. */
  layout?: "page" | "aside";
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
    ["csob", "Veřejnou sazbu se nepodařilo ověřit"],
    ["raiffeisenbank", "Veřejnou sazbu se nepodařilo ověřit"],
  ]);
  const seen = new Set<string>();
  const cards: { slug: string; name: string; message: string; sourceUrl: string | null }[] = [];
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
        sourceUrl:
          a.lenderSlug === "raiffeisenbank"
            ? "https://www.rb.cz/osobni/hypoteky"
            : null,
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
        sourceUrl:
          slug === "raiffeisenbank"
            ? "https://www.rb.cz/osobni/hypoteky"
            : null,
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
  layout = "page",
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
      // Keep equity consistent with property − loan so URL parse does not
      // treat a filter tweak as contradictory "invalid parameters".
      const normalized: RatesQueryState = {
        ...next,
        ownFundsCzk: Math.max(
          0,
          Math.round(next.propertyValueCzk - next.loanAmountCzk)
        ),
      };
      const nextLtv = buildLtvContext({
        propertyValueCzk: normalized.propertyValueCzk,
        loanAmountCzk: normalized.loanAmountCzk,
      });
      setQuery(normalized);
      setParamErrors([]);
      setLtvContext(nextLtv);
      // Homepage fixation tabs stay local. Only /sazby rewrites the URL.
      if (variant !== "home") {
        syncUrl(normalized, marketing);
      }
    },
    [marketing, syncUrl, variant]
  );

  useEffect(() => {
    if (variant === "home") return;
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = parseMortgageJourneyParams(raw);
    setQuery((prev) =>
      journeyCoreEqual(parsed.context, prev) ? prev : parsed.context
    );
    setLtvContext(parsed.ltvContext);
    setMarketing(parsed.context);
    setParamErrors(parsed.paramErrors);
  }, [searchParams, variant]);

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
  const homeRows = useMemo(
    () =>
      buildHomeRateRows(
        [...(result?.offers ?? []), ...(result?.unspecifiedLtvOffers ?? [])],
        query.fixationMonths
      ),
    [result, query.fixationMonths]
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
      className={cn(
        layout === "aside"
          ? "h-full rounded-[18px] border border-gray-200 bg-white shadow-[0_12px_40px_-28px_rgba(15,60,45,0.35)]"
          : "border-b border-border bg-white",
        className
      )}
    >
      <div
        className={cn(
          layout === "aside"
            ? "p-5 sm:p-6"
            : "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
        )}
      >
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            {variant === "home" ? "Orientační sazby" : "Zveřejněné sazby bank"}
          </p>
          <h2
            id={headingId}
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            {variant === "home"
              ? "Aktuální hypoteční sazby"
              : "Ověřené sazby z oficiálních zdrojů bank"}
          </h2>
          <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", layout === "aside" && "line-clamp-2")}>
            {variant === "home"
              ? "Sazby přebíráme z veřejných sazebníků bank. U každé karty uvádíme datum posledního ověření a odkaz na oficiální zdroj."
              : "Sazby přebíráme z veřejných sazebníků. U každé karty uvádíme datum posledního ověření a odkaz na oficiální zdroj."}
          </p>
          <RatesDisclaimer className="mt-3" />
          {variant === "home" ? (
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Fixace">
              {[
                [12, "1 rok"],
                [36, "3 roky"],
                [60, "5 let"],
                [120, "10 let"],
              ].map(([months, label]) => (
                <button
                  key={months}
                  type="button"
                  role="tab"
                  aria-selected={query.fixationMonths === months}
                  className={cn(
                    "h-9 rounded-lg px-3 text-sm font-semibold",
                    query.fixationMonths === months
                      ? "bg-deep-teal text-white"
                      : "bg-[#f4f6f5] text-gray-700"
                  )}
                  onClick={() =>
                    applyQuery({ ...query, fixationMonths: Number(months) })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={cn("mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4", layout === "aside" && "hidden")}>
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

        <div className={cn("mt-4 rounded-xl border border-border bg-[#f7f8f7] px-4 py-3 text-sm", layout === "aside" && "hidden")}>
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

        {paramErrors.length === 0 && ltvContext.exceedsSupportedMax ? (
          <div
            className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
            role="status"
          >
            <p>{LTV_ABOVE_CATALOG_WARNING}</p>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            Načítám sazby…
          </p>
        ) : null}

        {canShowRates && variant === "home" ? (
          <>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Nejde o osobní nabídku ani žebříček. Podmínky bank nejsou srovnatelné.
            </p>
            <ul className="mt-3 divide-y divide-gray-100 rounded-[16px] border border-gray-200 bg-white">
              {homeRows.map((row) => (
                <li key={row.key} className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f6f5] text-xs font-semibold text-deep-teal">
                      {row.lenderName.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-text-dark">
                          {row.lenderName}
                        </p>
                        <p
                          className={cn(
                            "shrink-0 text-right font-heading text-lg font-bold tabular-nums leading-none",
                            row.showNumeric ? "text-deep-teal" : "text-gray-500"
                          )}
                        >
                          {row.rateLabel}
                        </p>
                      </div>
                      {row.productLabel ? (
                        <p className="mt-0.5 text-xs font-medium text-gray-700">
                          {row.productLabel}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">
                        {row.fixationLabel}
                        {row.conditionLabel ? ` · ${row.conditionLabel}` : ""}
                      </p>
                      {row.verifiedAtLabel && row.showNumeric ? (
                        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                          {row.ageWarning ? "Poslední ověřená sazba" : "Ověřeno"}{" "}
                          {row.verifiedAtLabel}
                          {row.ageWarning
                            ? " · aktuální platnost není potvrzena"
                            : ""}
                          {row.sourceUrl ? (
                            <>
                              {" · "}
                              <a
                                href={row.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-deep-teal underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                              >
                                Zdroj
                              </a>
                            </>
                          ) : null}
                        </p>
                      ) : null}
                      {row.ageWarning ? (
                        <p className="sr-only">{row.ageWarning}</p>
                      ) : null}
                    </div>
                    <Link
                      href={`/sazby?purpose=${query.purpose}&fixationMonths=${query.fixationMonths}`}
                      className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-[#f7f6f3] hover:text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
                      aria-label={`Detail sazeb: ${row.lenderName}`}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </li>
              ))}
              {layout === "aside"
                ? pending
                    .filter(
                      (item) =>
                        !homeRows.some((row) => row.lenderSlug === item.slug)
                    )
                    .map((item) => (
                      <li key={item.slug} className="px-3 py-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4f6f5] text-xs font-semibold text-deep-teal">
                            {item.name.slice(0, 1)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-sm font-semibold text-text-dark">
                                {item.name}
                              </p>
                              <p className="text-sm font-semibold text-gray-500">
                                Sazba není dostupná
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-gray-600">
                              Pro tuto fixaci nemáme použitelný ověřený údaj.
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                : null}
            </ul>
            {homeRows.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">
                Pro zvolenou fixaci nemáme ověřenou sazbu. Nenahrazujeme ji údajem z jiného období.
              </p>
            ) : null}
          </>
        ) : null}

        {canShowRates && variant !== "home" ? (
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

        {pending.length > 0 && canShowRates && layout !== "aside" ? (
          <div className="mt-10">
            <h3 className="font-heading text-lg font-semibold text-text-dark">
              Banky bez ověřené sazby pro tento filtr
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {pending.map((p) => (
                <LenderPendingCard
                  key={p.slug}
                  lenderName={p.name}
                  message={p.message}
                  sourceUrl={p.sourceUrl}
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
              Zobrazit všechny banky →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
