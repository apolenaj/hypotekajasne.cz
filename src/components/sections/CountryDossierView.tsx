"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Scale,
} from "lucide-react";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import {
  countryConfigs,
  type CountryId,
} from "@/lib/calculators";
import {
  getCountryDossier,
  type DossierSection,
  type LegalClaim,
} from "@/lib/country-dossier";
import {
  COUNTRY_PAGE_NAV,
  DOSSIER_SUBSECTION_LABELS_CS,
  type CountryPageNavId,
} from "@/lib/country-dossier/page-structure";
import { formatCzechDate } from "@/lib/data/freshness";
import {
  FINANCING_OPTION_LABELS,
  getFinancingProducts,
  type FinancingOptionId,
  type RateAvailability,
} from "@/lib/financing";
import { formatMoney, type MoneyCurrency } from "@/lib/money";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function ClaimMeta({ claim }: { claim: LegalClaim }) {
  const dateLabel = (() => {
    try {
      return formatCzechDate(claim.asOf);
    } catch {
      return claim.asOf;
    }
  })();

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      <DataStatusBadge status={claim.status} />
      <span>
        Zdroj: {claim.source}
        {claim.sourceUrl && (
          <>
            {" · "}
            <a
              href={claim.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium text-deep-teal underline-offset-2 hover:underline"
            >
              odkaz <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
      </span>
      <span>· Stav k {dateLabel}</span>
      {claim.notes && (
        <span className="w-full text-muted-foreground/90">{claim.notes}</span>
      )}
    </div>
  );
}

function rateAvailabilityLabel(a: RateAvailability): string {
  switch (a) {
    case "LIVE":
      return "Živá data";
    case "VERIFIED":
      return "Ověřeno";
    default:
      return "Data ověřujeme";
  }
}

function SectionBody({ section }: { section: DossierSection }) {
  switch (section.kind) {
    case "narrative":
    case "ownership":
      return (
        <>
          {"modelLabel" in section && (
            <p className="mb-4 inline-flex rounded-md bg-deep-teal/5 px-2.5 py-1 text-xs font-semibold text-deep-teal">
              Režim vlastnictví: {section.modelLabel}
            </p>
          )}
          <ul className="space-y-4">
            {section.bullets.map((b, i) => (
              <li key={i} className="border-l-2 border-deep-teal/20 pl-4">
                <p className="text-sm leading-relaxed text-text-dark">{b.text}</p>
                {b.claim && <ClaimMeta claim={b.claim} />}
              </li>
            ))}
          </ul>
        </>
      );
    case "financing":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {section.lanes.map((lane) => (
            <div
              key={`${lane.audience}-${lane.title}`}
              className="rounded-xl border border-border bg-[#f7f8f7] p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {lane.audience === "resident"
                  ? "Rezident"
                  : lane.audience === "non_resident"
                    ? "Nerezident"
                    : "Rezident i nerezident"}
              </p>
              <p className="mt-1 font-semibold text-text-dark">{lane.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {lane.summary}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-deep-teal">
                {lane.linkedOptions.map((opt) => (
                  <li key={opt}>
                    {FINANCING_OPTION_LABELS[opt as FinancingOptionId] ?? opt}
                  </li>
                ))}
              </ul>
              {lane.claim && <ClaimMeta claim={lane.claim} />}
            </div>
          ))}
        </div>
      );
    case "costs":
      return (
        <dl className="divide-y divide-border rounded-xl border border-border">
          {section.lines.map((line) => (
            <div
              key={line.label}
              className="px-4 py-3 sm:flex sm:justify-between sm:gap-4"
            >
              <dt className="text-sm font-medium text-text-dark">{line.label}</dt>
              <dd className="mt-1 text-sm text-muted-foreground sm:mt-0 sm:text-right">
                <span className="font-semibold tabular-nums text-text-dark">
                  {line.range}
                </span>
                {line.claim && <ClaimMeta claim={line.claim} />}
              </dd>
            </div>
          ))}
        </dl>
      );
    case "timeline":
      return (
        <ol className="space-y-3">
          {section.steps.map((step) => (
            <li
              key={step.order}
              className="flex gap-3 rounded-xl border border-border bg-[#f7f8f7] p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deep-teal text-sm font-bold text-white">
                {step.order}
              </span>
              <div>
                <p className="font-semibold text-text-dark">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                {step.durationHint && (
                  <p className="mt-1 text-xs text-deep-teal">{step.durationHint}</p>
                )}
                {step.claim && <ClaimMeta claim={step.claim} />}
              </div>
            </li>
          ))}
        </ol>
      );
    case "flags":
      return (
        <ul className="space-y-2">
          {section.flags.map((flag, i) => (
            <li
              key={i}
              className={cn(
                "flex gap-2 rounded-lg border px-3 py-2.5 text-sm",
                flag.severity === "high" &&
                  "border-red-200 bg-red-50 text-red-950",
                flag.severity === "medium" &&
                  "border-amber-200 bg-amber-50 text-amber-950",
                flag.severity === "info" &&
                  "border-border bg-[#f7f8f7] text-text-dark"
              )}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p>{flag.text}</p>
                {flag.claim && <ClaimMeta claim={flag.claim} />}
              </div>
            </li>
          ))}
        </ul>
      );
    case "sources":
      return (
        <>
          <div className="rounded-xl border border-deep-teal/20 bg-deep-teal/5 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-deep-teal">
              <Scale className="h-4 w-4" />
              Poslední právní kontrola
            </p>
            <p className="mt-2 text-sm text-text-dark">
              {section.lastLegalReview.text}
            </p>
            <ClaimMeta claim={section.lastLegalReview} />
          </div>
          <ul className="mt-4 space-y-3">
            {section.sources.map((s, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <p className="text-sm text-text-dark">{s.text}</p>
                <ClaimMeta claim={s} />
              </li>
            ))}
          </ul>
        </>
      );
    case "cta":
      return (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={section.majetioHref}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-teal-light"
            >
              {section.majetioLabel}
            </Link>
            <Link
              href={section.financingHref}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-deep-teal/30 bg-white px-5 text-sm font-semibold text-deep-teal transition-colors hover:bg-deep-teal/5"
            >
              {section.financingLabel}
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {section.disclaimer}
          </p>
        </>
      );
    default:
      return null;
  }
}

function KeyFiguresBlock({ countryId }: { countryId: CountryId }) {
  const config = countryConfigs[countryId];
  const products = getFinancingProducts(countryId);
  const local = products.find((p) => p.option === "LOCAL_MORTGAGE");
  const ownership = getCountryDossier(countryId).sections.find(
    (s) => s.kind === "ownership"
  );

  const figures: { label: string; value: string; note?: string }[] = [
    {
      label: "Měna trhu",
      value: config.currency === "CZK" ? "Kč (CZK)" : config.currency,
      note: "Bez automatické konverze kurzů — částky v měně produktu.",
    },
    {
      label: "Orientační kupní cena v modelu",
      value: formatMoney(
        config.defaultPrice,
        config.currency as MoneyCurrency
      ),
      note: "Modelový výchozí vstup — ne průměr trhu.",
    },
    {
      label: "Orientační hrubý výnos",
      value: `${(config.defaultRentalYield * 100).toLocaleString("cs-CZ", {
        maximumFractionDigits: 1,
      })}\u00a0%`,
      note: "Modelový předpoklad — ověřte lokalitou.",
    },
    {
      label: "Lokální bankovní LTV",
      value:
        local?.maxLtvPercent != null && local.maxLtvPercent > 0
          ? `do ${local.maxLtvPercent}\u00a0%`
          : "Data ověřujeme",
      note: local
        ? rateAvailabilityLabel(local.rateAvailability)
        : "Bez ověřeného lokálního produktu v datech.",
    },
    {
      label: "Režim vlastnictví",
      value:
        ownership && "modelLabel" in ownership
          ? ownership.modelLabel
          : "Data ověřujeme",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {figures.map((f) => (
        <div
          key={f.label}
          className="rounded-xl border border-border bg-white p-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {f.label}
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-text-dark">
            {f.value}
          </p>
          {f.note && (
            <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function YieldBlock({ countryId }: { countryId: CountryId }) {
  const config = countryConfigs[countryId];
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Orientační hrubý výnos v modelu:{" "}
        <strong className="text-text-dark">
          {(config.defaultRentalYield * 100).toLocaleString("cs-CZ", {
            maximumFractionDigits: 1,
          })}
          %
        </strong>
        . Jde o modelový předpoklad v měně{" "}
        {config.currency === "CZK" ? "Kč" : config.currency} — ne o garanci.
        Detailní scénáře (neobsazenost, správa, růst hodnoty) najdete v
        kalkulačkách níže.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="#decision-lab"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
        >
          Otevřít Decision Lab
        </a>
        <Link
          href={routes.investicniRentgenModelar}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-deep-teal/30 bg-white px-4 text-sm font-semibold text-deep-teal hover:bg-deep-teal/5"
        >
          Investiční modelář
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">
        Chybějící ověřená sazba nebo výnos = „Data ověřujeme“, nikoli vymyšlené
        číslo.
      </p>
    </div>
  );
}

function AccordionGroup({
  id,
  title,
  defaultOpen,
  children,
}: {
  id: string;
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = id.replace(/^#/, "");

  return (
    <section
      id={sectionId}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-border bg-white"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-7 sm:py-5 lg:pointer-events-none"
      >
        <h2 className="font-heading text-lg font-bold text-text-dark sm:text-xl">
          {title}
        </h2>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-deep-teal transition-transform lg:hidden",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "border-t border-border px-5 pb-5 sm:px-7 sm:pb-7",
          open ? "block" : "hidden",
          "lg:block"
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function CountryDossierView({ countryId }: { countryId: CountryId }) {
  const dossier = getCountryDossier(countryId);
  const byId = useMemo(() => {
    const map = new Map<string, DossierSection>();
    for (const s of dossier.sections) map.set(s.id, s);
    return map;
  }, [dossier.sections]);

  const [active, setActive] = useState<CountryPageNavId>("overview");

  return (
    <div id="country-dossier" className="scroll-mt-28 bg-[#f4f5f4]">
      {/* 1. Hero */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-deep-teal">
            Průvodce investora
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-dark sm:text-4xl lg:text-5xl">
            {dossier.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {dossier.tagline}
          </p>
          <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
            Jedna generace obsahu — Premium Data Dossier. Právní tvrzení mají
            zdroj, datum a status. Chybějící údaje = „Data ověřujeme“.
          </p>
        </div>
      </header>

      {/* Mobile sticky dropdown */}
      <div className="sticky top-16 z-30 border-b border-border bg-[#f4f5f4]/95 px-4 py-3 backdrop-blur lg:hidden">
        <label htmlFor="country-section-nav" className="sr-only">
          Přeskočit na sekci
        </label>
        <div className="relative">
          <select
            id="country-section-nav"
            value={active}
            onChange={(e) => {
              const id = e.target.value as CountryPageNavId;
              setActive(id);
              const item = COUNTRY_PAGE_NAV.find((n) => n.id === id);
              if (item) {
                document
                  .querySelector(item.href)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="h-11 w-full appearance-none rounded-lg border border-border bg-white px-3 pr-10 text-sm font-medium text-text-dark"
          >
            {COUNTRY_PAGE_NAV.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-8 sm:py-12">
        {/* Desktop sticky side nav */}
        <nav
          aria-label="Obsah stránky země"
          className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto self-start lg:block"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Na této stránce
          </p>
          <ul className="space-y-1 border-l border-border">
            {COUNTRY_PAGE_NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={n.href}
                  onClick={() => setActive(n.id)}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors",
                    active === n.id
                      ? "border-deep-teal font-semibold text-deep-teal"
                      : "border-transparent text-muted-foreground hover:border-deep-teal/40 hover:text-text-dark"
                  )}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {COUNTRY_PAGE_NAV.filter((n) => n.id !== "decision_lab").map(
            (nav, index) => {
              const defaultOpen = index < 2;
              if (nav.synthetic === "key_figures") {
                return (
                  <AccordionGroup
                    key={nav.id}
                    id={nav.href}
                    title={nav.label}
                    defaultOpen={defaultOpen}
                  >
                    <KeyFiguresBlock countryId={countryId} />
                  </AccordionGroup>
                );
              }
              if (nav.synthetic === "yield") {
                return (
                  <AccordionGroup
                    key={nav.id}
                    id={nav.href}
                    title={nav.label}
                    defaultOpen={false}
                  >
                    <YieldBlock countryId={countryId} />
                  </AccordionGroup>
                );
              }

              const sections = nav.dossierSectionIds
                .map((id) => byId.get(id))
                .filter(Boolean) as DossierSection[];

              if (sections.length === 0) return null;

              return (
                <AccordionGroup
                  key={nav.id}
                  id={nav.href}
                  title={nav.label}
                  defaultOpen={defaultOpen}
                >
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <div key={section.id}>
                        {sections.length > 1 && (
                          <h3 className="mb-2 text-sm font-semibold text-deep-teal">
                            {DOSSIER_SUBSECTION_LABELS_CS[section.id] ??
                              section.title}
                          </h3>
                        )}
                        {section.summary && (
                          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                            {section.summary}
                          </p>
                        )}
                        <SectionBody section={section} />
                      </div>
                    ))}
                  </div>
                </AccordionGroup>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
