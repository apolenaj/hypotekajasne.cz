"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import {
  LEAD_FORM_FRICTION_ABOVE,
  LEAD_FORM_FRICTION_SHORT,
} from "@/lib/leads-form-copy";
import type { ScenarioSource } from "@/lib/scenarios/sources";
import { formatAuditDateCs } from "@/lib/i18n/audit-date";
import { cn } from "@/lib/utils";

export type ScenarioTocItem = { id: string; label: string };

type ScenarioShellProps = {
  eyebrow: string;
  h1: string;
  lead: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  toc: ScenarioTocItem[];
  keyCards: Array<{ title: string; text: string }>;
  children: ReactNode;
  faq: Array<{ question: string; answer: string }>;
  sources: ScenarioSource[];
  leadSource?: "mortgage_calculator" | "lead_gen";
  leadTitle: string;
  leadMetadata: Record<string, unknown>;
  leadNotes?: string;
  className?: string;
};

export function ScenarioShell({
  eyebrow,
  h1,
  lead,
  primaryCta,
  secondaryCta,
  toc,
  keyCards,
  children,
  faq,
  sources,
  leadSource = "mortgage_calculator",
  leadTitle,
  leadMetadata,
  leadNotes,
  className,
}: ScenarioShellProps) {
  return (
    <div className={cn("bg-white", className)}>
      <header className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            {h1}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {lead}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
            >
              {primaryCta.label}
            </a>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
              >
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {LEAD_FORM_FRICTION_SHORT}
          </p>
        </div>
      </header>

      <nav
        aria-label="Obsah stránky"
        className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur lg:hidden"
      >
        <ul className="flex gap-2 overflow-x-auto px-4 py-3 text-sm">
          {toc.map((item) => (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                className="inline-flex rounded-full border border-border px-3 py-1.5 text-muted-foreground hover:border-deep-teal/40 hover:text-deep-teal"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-12">
        <aside className="hidden lg:block">
          <nav
            aria-label="Obsah stránky"
            className="sticky top-28 space-y-1 text-sm"
          >
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-lg px-3 py-2 text-muted-foreground hover:bg-[#f7f8f7] hover:text-deep-teal"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <section
            id="prehled"
            className="scroll-mt-28 grid gap-3 sm:grid-cols-3"
          >
            {keyCards.slice(0, 3).map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-border bg-[#f7f8f7] p-4"
              >
                <h2 className="font-heading text-base font-semibold text-text-dark">
                  {card.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.text}
                </p>
              </article>
            ))}
          </section>

          {children}

          <section id="faq" className="mt-12 scroll-mt-28">
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              Časté otázky
            </h2>
            <div className="mt-4 space-y-3">
              {faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border border-border bg-white p-4"
                >
                  <summary className="cursor-pointer font-semibold text-text-dark">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section
            id="poptavka"
            className="mt-12 scroll-mt-28 rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6"
          >
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              {leadTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {LEAD_FORM_FRICTION_ABOVE}
            </p>
            <div className="mt-5">
              <LeadCaptureForm
                source={leadSource}
                title="Nezávazná poptávka"
                subtitle="Stačí kontakt. Podrobnosti k výpočtu pošleme jako kontext konzultace."
                submitLabel="Odeslat poptávku"
                notes={leadNotes}
                metadata={leadMetadata}
              />
            </div>
          </section>

          <section id="zdroje" className="mt-12 scroll-mt-28">
            <h2 className="font-heading text-xl font-bold text-text-dark">
              Zdroje a ověření
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {sources.map((source) => (
                <li key={source.url} className="rounded-xl border border-border p-3">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-deep-teal hover:underline"
                  >
                    {source.label}
                  </a>
                  <p className="mt-1 text-xs">
                    Ověřeno {formatAuditDateCs(source.checkedAt)}
                    {source.note ? ` · ${source.note}` : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
