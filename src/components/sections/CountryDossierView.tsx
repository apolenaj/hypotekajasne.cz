"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Scale,
} from "lucide-react";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { SourceEvidenceBadgeButton } from "@/components/trust/SourceEvidenceDrawer";
import {
  countryConfigs,
  type CountryId,
} from "@/lib/calculators";
import {
  getCountryDossier,
  type DossierSection,
  type LegalClaim,
} from "@/lib/country-dossier";
import { buildExecutiveSnapshot } from "@/lib/country-dossier/market-snapshot";
import {
  COUNTRY_PAGE_NAV,
  DOSSIER_SUBSECTION_LABELS_CS,
  type CountryPageNavId,
} from "@/lib/country-dossier/page-structure";
import { getCountryThematicCluster } from "@/lib/country-dossier/thematic-cluster";
import { formatCzechDate } from "@/lib/data/freshness";
import { getCountryProvenance } from "@/lib/data/provenance";
import {
  FINANCING_OPTION_LABELS,
  getFinancingProducts,
  type FinancingOptionId,
  type RateAvailability,
} from "@/lib/financing";
import { formatMoney, type MoneyCurrency } from "@/lib/money";
import { legalClaimToSourceEvidence } from "@/lib/sources/source-evidence";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function ClaimMeta({
  claim,
  jurisdiction,
}: {
  claim: LegalClaim;
  jurisdiction?: string;
}) {
  const dateLabel = (() => {
    try {
      return formatCzechDate(claim.asOf);
    } catch {
      return claim.asOf;
    }
  })();
  const evidence = legalClaimToSourceEvidence(
    claim,
    jurisdiction ?? "multi"
  );

  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-deep-teal/80">
        Zdroj a ověření
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <SourceEvidenceBadgeButton evidence={evidence} />
        <span>
          {claim.source}
          {claim.sourceUrl && (
            <>
              {" · "}
              <a
                href={claim.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-deep-teal underline-offset-2 hover:underline"
              >
                primární zdroj <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </span>
        <span>· Kontrola {dateLabel}</span>
        {claim.notes && (
          <span className="w-full text-muted-foreground/90">{claim.notes}</span>
        )}
      </div>
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

function SectionBody({
  section,
  countryId,
}: {
  section: DossierSection;
  countryId: CountryId;
}) {
  const j = countryId;
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
                {b.claim && <ClaimMeta claim={b.claim} jurisdiction={j} />}
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
              {lane.claim && <ClaimMeta claim={lane.claim} jurisdiction={j} />}
            </div>
          ))}
        </div>
      );
    case "costs":
      return (
        <div className="min-w-0 overflow-x-auto">
          <dl className="min-w-[16rem] divide-y divide-border rounded-xl border border-border">
            {section.lines.map((line) => (
              <div
                key={line.label}
                className="px-4 py-3 sm:flex sm:justify-between sm:gap-4"
              >
                <dt className="text-sm font-medium text-text-dark">
                  {line.label}
                </dt>
                <dd className="mt-1 min-w-0 text-sm text-muted-foreground sm:mt-0 sm:max-w-[55%] sm:text-right">
                  <span className="break-words font-semibold tabular-nums text-text-dark">
                    {line.range}
                  </span>
                  {line.claim && (
                    <ClaimMeta claim={line.claim} jurisdiction={j} />
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
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
              <div className="min-w-0">
                <p className="font-semibold text-text-dark">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                {step.durationHint && (
                  <p className="mt-1 text-xs text-deep-teal">{step.durationHint}</p>
                )}
                {step.claim && (
                  <ClaimMeta claim={step.claim} jurisdiction={j} />
                )}
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
              <div className="min-w-0">
                <p>{flag.text}</p>
                {flag.claim && (
                  <ClaimMeta claim={flag.claim} jurisdiction={j} />
                )}
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
              Poslední redakční kontrola právních zdrojů
            </p>
            <p className="mt-2 text-sm text-text-dark">
              {section.lastLegalReview.text}
            </p>
            <ClaimMeta
              claim={section.lastLegalReview}
              jurisdiction={j}
            />
          </div>
          <ul className="mt-4 space-y-3">
            {section.sources.map((s, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <p className="text-sm text-text-dark">{s.text}</p>
                <ClaimMeta claim={s} jurisdiction={j} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Autoritativní registry:{" "}
            <Link
              href={routes.zdroje}
              className="font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              Zdroje dat
            </Link>
            .
          </p>
        </>
      );
    case "cta":
      return (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#decision-lab"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-deep-teal-light"
            >
              Spočítat scénář pro tento trh
            </a>
            <Link
              href={section.majetioHref}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-deep-teal/30 bg-white px-5 text-sm font-semibold text-deep-teal transition-colors hover:bg-deep-teal/5"
            >
              {section.majetioLabel}
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
        Detailní scénáře (neobsazenost, správa, růst hodnoty) spočítejte v
        kalkulačkách níže.
      </p>
      <a
        href="#decision-lab"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
      >
        Otevřít scénáře a kalkulačky
      </a>
      <p className="text-xs text-muted-foreground">
        Chybějící ověřená sazba nebo výnos = „Data ověřujeme“, nikoli vymyšlené
        číslo.
      </p>
    </div>
  );
}

function ExecutiveSnapshotBlock({ countryId }: { countryId: CountryId }) {
  const snap = useMemo(() => buildExecutiveSnapshot(countryId), [countryId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <DataStatusBadge status={snap.dataStatus} />
        <p className="text-xs text-muted-foreground">
          Orientační snapshot — rozhodovací přehled, ne nabídka banky.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {snap.forWhom && (
          <div className="rounded-xl border border-border bg-[#f7f8f7] p-4 sm:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Komu dává smysl
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-dark">
              {snap.forWhom}
            </p>
          </div>
        )}
        {snap.mainAdvantage && (
          <div className="rounded-xl border border-border bg-[#f7f8f7] p-4 sm:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Hlavní výhoda
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-dark">
              {snap.mainAdvantage}
            </p>
          </div>
        )}
        {snap.mainRisk && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/70">
              Hlavní riziko
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-950">
              {snap.mainRisk}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {snap.fields.map((f) => (
          <div
            key={f.id}
            className="min-w-0 rounded-xl border border-border bg-white p-3"
          >
            <div className="flex flex-wrap items-center gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {f.label}
              </p>
              {f.status ? <DataStatusBadge status={f.status} /> : null}
            </div>
            <p className="mt-1 break-words text-sm font-semibold text-text-dark">
              {f.value}
            </p>
            {f.note ? (
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                {f.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalizedFitCta({ countryId }: { countryId: CountryId }) {
  const name = getCountryDossier(countryId).name;
  return (
    <div className="rounded-2xl border border-deep-teal/25 bg-gradient-to-br from-deep-teal/5 to-white p-5 sm:p-6">
      <h2 className="font-heading text-lg font-bold text-text-dark sm:text-xl">
        Sedí tento trh vašim financím?
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Krátká diagnostika porovná váš kapitál, příjem a cíle s rámcem trhu{" "}
        {name}. Výsledek je modelový — ne schválení banky.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={routes.mojeMoznosti}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
        >
          Zjistit, zda tento trh sedí mým financím
        </Link>
        <Link
          href={routes.investicniPas}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-deep-teal/30 bg-white px-4 text-sm font-semibold text-deep-teal hover:bg-deep-teal/5"
        >
          Investiční pas (shoda trhů)
        </Link>
      </div>
    </div>
  );
}

function DeepResearchBlock({
  countryId,
  sections,
}: {
  countryId: CountryId;
  sections: DossierSection[];
}) {
  const provenance = getCountryProvenance(countryId);

  return (
    <details
      id="kompletni-profil"
      className="scroll-mt-28 group overflow-hidden rounded-2xl border border-border bg-white"
    >
      <summary className="cursor-pointer list-none px-5 py-4 sm:px-7 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Hloubkový profil
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold text-text-dark sm:text-xl">
              Zobrazit kompletní datový profil trhu
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Plný editorial přehled, klíčová čísla a provenance — obsah zůstává
              ve stránce pro SEO.
            </p>
          </div>
          <ChevronDown className="h-5 w-5 shrink-0 text-deep-teal transition-transform group-open:rotate-180" />
        </div>
      </summary>
      <div className="space-y-8 border-t border-border px-5 py-5 sm:px-7 sm:py-7">
        {sections.map((section) => (
          <div key={section.id}>
            <h3 className="mb-2 text-sm font-semibold text-deep-teal">
              {DOSSIER_SUBSECTION_LABELS_CS[section.id] ?? section.title}
            </h3>
            {section.summary && (
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                {section.summary}
              </p>
            )}
            <SectionBody section={section} countryId={countryId} />
          </div>
        ))}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-deep-teal">
            Klíčová čísla (model)
          </h3>
          <KeyFiguresBlock countryId={countryId} />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-deep-teal">
            Provenance domén
          </h3>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {provenance.map((item) => (
              <li
                key={item.label}
                className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.source}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.notes}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <DataStatusBadge status={item.status} />
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {item.lastVerifiedAt
                      ? formatCzechDate(item.lastVerifiedAt)
                      : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            <Link
              href={routes.metodika}
              className="font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              Metodika dat →
            </Link>
          </p>
        </div>
      </div>
    </details>
  );
}

/** Accordion: na mobilu skládá; obsah zůstává v DOM (hidden), na lg vždy otevřeno. */
function AccordionGroup({
  id,
  title,
  defaultOpen,
  children,
}: {
  id: string;
  title: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = id.replace(/^#/, "");

  return (
    <section
      id={sectionId}
      className="scroll-mt-28 min-w-0 overflow-hidden rounded-2xl border border-border bg-white"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-7 sm:py-5 lg:pointer-events-none"
      >
        <h2 className="min-w-0 font-heading text-base font-bold text-text-dark sm:text-xl">
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
          "border-t border-border px-4 pb-5 sm:px-7 sm:pb-7",
          open ? "block" : "hidden",
          "lg:block"
        )}
      >
        {children}
      </div>
    </section>
  );
}

type CountryDossierViewProps = {
  countryId: CountryId;
  /** Scénáře / kalkulačky — vložené do správného místa v DOM (SEO + TOC). */
  calculatorSlot?: ReactNode;
};

export function CountryDossierView({
  countryId,
  calculatorSlot,
}: CountryDossierViewProps) {
  const dossier = getCountryDossier(countryId);
  const byId = useMemo(() => {
    const map = new Map<string, DossierSection>();
    for (const s of dossier.sections) map.set(s.id, s);
    return map;
  }, [dossier.sections]);

  const [active, setActive] = useState<CountryPageNavId>("snapshot");

  const deepSections = useMemo(() => {
    return (["executive_summary", "suitability"] as const)
      .map((id) => byId.get(id))
      .filter(Boolean) as DossierSection[];
  }, [byId]);

  return (
    <div id="country-dossier" className="scroll-mt-28 min-w-0 bg-[#f4f5f4]">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
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
            Nejdřív přehled do 30 sekund. Detaily, právo a kalkulačky níže —
            bez marketingových slibů výnosu.
          </p>
        </div>
      </header>

      <div className="sticky top-14 z-30 border-b border-border bg-[#f4f5f4]/95 px-4 py-3 backdrop-blur sm:top-16 lg:hidden">
        <label htmlFor="country-section-nav" className="sr-only">
          Přeskočit na sekci
        </label>
        <div className="relative min-w-0">
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
            className="h-11 w-full max-w-full appearance-none rounded-lg border border-border bg-white px-3 pr-10 text-sm font-medium text-text-dark"
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

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:gap-10 sm:py-12">
        <nav
          aria-label="Obsah stránky země"
          className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-52 shrink-0 overflow-y-auto self-start lg:block xl:w-56"
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
          {COUNTRY_PAGE_NAV.map((nav, index) => {
            if (nav.synthetic === "snapshot") {
              return (
                <section
                  key={nav.id}
                  id="snapshot"
                  className="scroll-mt-28 rounded-2xl border border-border bg-white px-4 py-5 sm:px-7 sm:py-7"
                >
                  <h2 className="font-heading text-lg font-bold text-text-dark sm:text-xl">
                    Orientační přehled trhu
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Co potřebujete vědět do 30 sekund, než půjdete do detailu.
                  </p>
                  <div className="mt-5">
                    <ExecutiveSnapshotBlock countryId={countryId} />
                  </div>
                </section>
              );
            }

            if (nav.synthetic === "fit") {
              return (
                <section key={nav.id} id="sedi-mi-trh" className="scroll-mt-28">
                  <PersonalizedFitCta countryId={countryId} />
                </section>
              );
            }

            if (nav.synthetic === "decision_lab") {
              return (
                <div key={nav.id} className="min-w-0">
                  {calculatorSlot}
                </div>
              );
            }

            if (nav.synthetic === "deep_research") {
              return (
                <DeepResearchBlock
                  key={nav.id}
                  countryId={countryId}
                  sections={deepSections}
                />
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

            // Na mobilu: první téma (financování) otevřené; zbytek skládaný.
            const topicIndex = index - 2;
            const defaultOpen = topicIndex === 0;

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
                      <SectionBody section={section} countryId={countryId} />
                    </div>
                  ))}
                </div>
              </AccordionGroup>
            );
          })}

          <section
            id="tematicky-cluster"
            className="scroll-mt-28 rounded-2xl border border-border bg-white px-4 py-5 sm:px-7 sm:py-7"
            aria-labelledby="cluster-heading"
          >
            <h2
              id="cluster-heading"
              className="font-heading text-lg font-bold text-text-dark sm:text-xl"
            >
              Tematické propojení
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Trh → financování → daně → vlastnictví → kalkulačky → akademie.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {getCountryThematicCluster(countryId).map((link) => (
                <li key={`${link.topic}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-deep-teal hover:bg-deep-teal/5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
