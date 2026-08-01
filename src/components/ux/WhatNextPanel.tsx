"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExpertContactCta } from "@/components/forms/ExpertContactCta";
import {
  CTA_CS,
  CTA_PRIMARY_CLASS,
  CTA_SECONDARY_CLASS,
} from "@/lib/ux/cta";
import { cn } from "@/lib/utils";

export type WhatNextAction = {
  id: string;
  label: string;
  description?: string;
  href: string;
  /** Exactly one primary recommended — others are secondary. */
  primary?: boolean;
};

/**
 * Jednotný panel „Co mám udělat dál?“ po dokončení nástroje.
 * Jedno jasné primary CTA + max 3 sekundární + kontakt na experta.
 */
export function WhatNextPanel({
  title = CTA_CS.whatNext,
  lead = "Jeden doporučený krok — zbytek můžete přeskočit.",
  actions,
  showExpertContact = true,
  expertContextNote,
  className,
}: {
  title?: string;
  lead?: string;
  actions: WhatNextAction[];
  /** Výrazný CTA na dialog s poptávkou experta. */
  showExpertContact?: boolean;
  expertContextNote?: string;
  className?: string;
}) {
  if (actions.length === 0 && !showExpertContact) return null;

  const primary =
    actions.length > 0
      ? (actions.find((a) => a.primary) ?? actions[0])
      : null;
  const secondary = primary
    ? actions.filter((a) => a.id !== primary.id).slice(0, 3)
    : [];

  return (
    <section
      aria-labelledby="what-next-heading"
      className={cn(
        "rounded-2xl border border-deep-teal/20 bg-[#f3f8f6] p-5 sm:p-6",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
        {CTA_CS.nextStep}
      </p>
      <h2
        id="what-next-heading"
        className="mt-1 font-heading text-xl font-bold text-text-dark sm:text-2xl"
      >
        {title}
      </h2>
      {lead ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {lead}
        </p>
      ) : null}

      {showExpertContact ? (
        <div className="mt-5">
          <ExpertContactCta
            variant="card"
            contextNote={
              expertContextNote ??
              "Poptávka z panelu „Co mám udělat dál?“."
            }
            metadata={{ surface: "what_next_panel" }}
          />
        </div>
      ) : null}

      {primary ? (
        <div className={cn(showExpertContact ? "mt-4" : "mt-5")}>
          <Link
            href={primary.href}
            className={cn(CTA_PRIMARY_CLASS, "w-full sm:w-auto")}
          >
            {primary.label}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
          {primary.description ? (
            <p className="mt-2 max-w-lg text-xs text-muted-foreground">
              {primary.description}
            </p>
          ) : null}
        </div>
      ) : null}

      {secondary.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {secondary.map((a) => (
            <li key={a.id}>
              <Link
                href={a.href}
                className={cn(
                  CTA_SECONDARY_CLASS,
                  "h-auto min-h-11 w-full flex-col items-start gap-1 px-4 py-3 text-left"
                )}
              >
                <span className="font-semibold text-deep-teal">
                  {a.label}
                </span>
                {a.description ? (
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">
                    {a.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
