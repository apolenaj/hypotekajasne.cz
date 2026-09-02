import Link from "next/link";
import { CTA_CS, CTA_PRIMARY_ON_DARK_CLASS, CTA_SECONDARY_CLASS } from "@/lib/ux/cta";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Závěrečné CTA — krátká diagnostika, bez lead formuláře.
 */
export function HomeFinalCta() {
  return (
    <section
      aria-labelledby="home-final-cta-heading"
      className="bg-deep-teal text-white"
      id="poptavka"
    >
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
          Další krok
        </p>
        <h2
          id="home-final-cta-heading"
          className="mt-2 font-heading text-2xl font-bold leading-tight sm:text-3xl"
        >
          Najděte řešení pro svou situaci
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          Ať řešíte vlastní bydlení, refinancování nebo investici v Česku či
          zahraničí, začněte krátkou diagnostikou a zjistěte, které nástroje a
          informace jsou pro vás relevantní.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href={routes.mojeMoznosti}
            className={cn(CTA_PRIMARY_ON_DARK_CLASS, "w-full sm:w-auto")}
          >
            {CTA_CS.findIdealSolution}
          </Link>
          <Link
            href={routes.kontakt}
            className={cn(
              CTA_SECONDARY_CLASS,
              "w-full border-white/30 bg-white/5 text-white hover:border-white/50 hover:bg-white/10 sm:w-auto"
            )}
          >
            Kontaktovat nás
          </Link>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-white/65 sm:text-[13px]">
          Nezávazně · kontakt zanecháte pouze tehdy, pokud sami chcete · nejsme
          banka
        </p>
      </div>
    </section>
  );
}
