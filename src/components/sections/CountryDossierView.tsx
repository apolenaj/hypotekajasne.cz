"use client";

import Link from "next/link";
import { AlertTriangle, ExternalLink, Scale } from "lucide-react";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import type { CountryId } from "@/lib/calculators";
import {
  getCountryDossier,
  type DossierSection,
  type LegalClaim,
} from "@/lib/country-dossier";
import { formatCzechDate } from "@/lib/data/freshness";
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
      {claim.notes && <span className="w-full text-muted-foreground/90">{claim.notes}</span>}
    </div>
  );
}

function SectionShell({
  section,
  children,
}: {
  section: DossierSection;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`dossier-${section.id}`}
      className="scroll-mt-28 rounded-2xl border border-border bg-white p-5 sm:p-7"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
        Country dossier
      </p>
      <h3 className="mt-1 font-heading text-xl font-bold text-text-dark sm:text-2xl">
        {section.title}
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {section.summary}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function renderSection(section: DossierSection) {
  switch (section.kind) {
    case "narrative":
    case "ownership":
      return (
        <SectionShell section={section}>
          {"modelLabel" in section && (
            <p className="mb-4 inline-flex rounded-md bg-deep-teal/5 px-2.5 py-1 text-xs font-semibold text-deep-teal">
              Model: {section.modelLabel}
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
        </SectionShell>
      );
    case "financing":
      return (
        <SectionShell section={section}>
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
                <p className="mt-2 text-xs text-deep-teal">
                  Produkty: {lane.linkedOptions.join(", ")}
                </p>
                {lane.claim && <ClaimMeta claim={lane.claim} />}
              </div>
            ))}
          </div>
        </SectionShell>
      );
    case "costs":
      return (
        <SectionShell section={section}>
          <dl className="divide-y divide-border rounded-xl border border-border">
            {section.lines.map((line) => (
              <div key={line.label} className="px-4 py-3 sm:flex sm:justify-between sm:gap-4">
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
        </SectionShell>
      );
    case "timeline":
      return (
        <SectionShell section={section}>
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
        </SectionShell>
      );
    case "flags":
      return (
        <SectionShell section={section}>
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
        </SectionShell>
      );
    case "sources":
      return (
        <SectionShell section={section}>
          <div className="rounded-xl border border-deep-teal/20 bg-deep-teal/5 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-deep-teal">
              <Scale className="h-4 w-4" />
              Last legal review
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
        </SectionShell>
      );
    case "cta":
      return (
        <SectionShell section={section}>
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
        </SectionShell>
      );
    default:
      return null;
  }
}

export function CountryDossierView({ countryId }: { countryId: CountryId }) {
  const dossier = getCountryDossier(countryId);

  return (
    <div id="country-dossier" className="scroll-mt-28 bg-[#f4f5f4] py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-deep-teal">
            Premium data dossier
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-text-dark sm:text-4xl">
            {dossier.name}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {dossier.tagline}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Bez marketingových absolutních výroků. Právní tvrzení mají source,
            datum a status.
          </p>
        </header>

        <nav
          aria-label="Obsah dossieru"
          className="mb-8 flex flex-wrap gap-2"
        >
          {dossier.sections.map((s) => (
            <a
              key={s.id}
              href={`#dossier-${s.id}`}
              className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-text-dark hover:border-deep-teal/40 hover:text-deep-teal"
            >
              {s.title.replace(/^\d+\.\s*/, "")}
            </a>
          ))}
        </nav>

        <div className="space-y-5">
          {dossier.sections.map((section) => (
            <div key={section.id}>{renderSection(section)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
