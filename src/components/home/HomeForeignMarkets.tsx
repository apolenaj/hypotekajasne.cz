import Link from "next/link";
import { unifiedDestinations } from "@/lib/unified-destinations";
import { routes } from "@/lib/routes";
import { CTA_PRIMARY_CLASS } from "@/lib/ux/cta";

/** Zahraniční trhy — pouze existující podporované destinace. */
export function HomeForeignMarkets() {
  return (
    <section
      aria-labelledby="home-foreign-heading"
      className="home-below-fold border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Zahraničí
          </p>
          <h2
            id="home-foreign-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Investice do nemovitostí v zahraničí
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Porovnejte podporované trhy, zjistěte orientační výnosy a náklady,
            pochopte možnosti financování a rizika jednotlivých zemí. U
            modelových nebo neúplných dat zůstává označení stavu u daného trhu.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {unifiedDestinations.map((m) => (
            <li key={m.slug}>
              <Link
                href={`${routes.pruvodceInvestora}/${m.slug}`}
                className="flex h-full flex-col rounded-xl border border-border bg-[#f7f8f7] p-4 transition-colors hover:border-deep-teal/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
              >
                <span className="font-heading text-base font-semibold text-text-dark">
                  {m.country}
                </span>
                <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {m.desc}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link href={routes.pruvodceInvestora} className={CTA_PRIMARY_CLASS}>
            Prozkoumat zahraniční trhy
          </Link>
        </div>
      </div>
    </section>
  );
}
