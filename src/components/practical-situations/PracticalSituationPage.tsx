"use client";

import Link from "next/link";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import {
  LEAD_FORM_FRICTION_ABOVE,
  LEAD_FORM_FRICTION_SHORT,
} from "@/lib/leads-form-copy";
import { formatAuditDateCs } from "@/lib/i18n/audit-date";
import type { PracticalTopic } from "@/lib/practical-situations/catalog";
import { routes } from "@/lib/routes";

export function PracticalSituationPage({ topic }: { topic: PracticalTopic }) {
  return (
    <article className="bg-white">
      <header className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Praktické situace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            {topic.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {topic.lead}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Pracovní edukativní obsah. Nejde o právní ani daňové poradenství.
            Konkrétní lhůty a limity ověřujte v primárních zdrojích.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {topic.calculator ? (
              <Link
                href={topic.calculator.href}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
              >
                {topic.calculator.label}
              </Link>
            ) : null}
            <Link
              href={routes.pruvodce.praktickeSituace}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
            >
              Všechny praktické situace
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section>
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Krátká odpověď
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {topic.directAnswer}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Praktický postup
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {topic.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Potřebné podklady
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {topic.documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold text-text-dark">
            {topic.modelExample.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {topic.modelExample.body}
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Časté komplikace
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {topic.complications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        {topic.related && topic.related.length > 0 ? (
          <section>
            <h2 className="font-heading text-2xl font-bold text-text-dark">
              Související
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {topic.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="font-medium text-deep-teal hover:underline"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section id="zdroje">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Zdroje a datum kontroly
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {topic.sources.map((s) => (
              <li key={s.url} className="rounded-xl border border-border p-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-deep-teal hover:underline"
                >
                  {s.label}
                </a>
                <p className="mt-1 text-xs">
                  Kontrola {formatAuditDateCs(s.checkedAt)}
                  {s.note ? ` — ${s.note}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Obsah nebyl samostatně právně ani daňově certifikován. Při změně
            předpisů nebo metodiky banky vždy ověřte primární zdroj.
          </p>
        </section>

        <section id="poptavka" className="scroll-mt-28 border-t border-border pt-10">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Probrat vaši situaci
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {LEAD_FORM_FRICTION_ABOVE}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {LEAD_FORM_FRICTION_SHORT}
          </p>
          <div className="mt-6">
            <LeadCaptureForm
              source="lead_gen"
              title="Probrat hypoteční situaci"
              metadata={{
                page_intent: "practical_situation",
                topic_slug: topic.slug,
                sourcePage: `${routes.temata}/${topic.slug}`,
              }}
              notes={`Praktická situace: ${topic.title}`}
            />
          </div>
        </section>
      </div>
    </article>
  );
}
