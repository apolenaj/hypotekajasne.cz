import Link from "next/link";
import { CTA_PRIMARY_CLASS } from "@/lib/ux/cta";
import { routes } from "@/lib/routes";
import { getLandingPath } from "@/lib/seo/landings";

/** Stručná sekce nájem vs. hypotéka — bez absolutních tvrzení. */
export function HomeRentVsMortgage() {
  return (
    <section
      aria-labelledby="home-rent-heading"
      className="home-below-fold border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Nájem vs. hypotéka
            </p>
            <h2
              id="home-rent-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
            >
              Nájem je náklad. Hypotéka může budovat majetek.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Nájem je pravidelný náklad bez budování vlastnictví. Hypotéka může
              postupně budovat vlastní kapitál — ale výhodnost závisí na ceně
              nemovitosti, úroku, délce držení, nákladech a vaší situaci. Není
              vždy výhodnější než nájem.
            </p>
            <Link
              href={routes.kalkulacky.koupeVsNajem}
              className={`${CTA_PRIMARY_CLASS} mt-6`}
            >
              Porovnat nájem a hypotéku
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Nebo si přečtěte průvodce{" "}
              <Link
                href={getLandingPath("koupe-vs-najem")}
                className="font-medium text-deep-teal underline-offset-2 hover:underline"
              >
                koupě vs. nájem
              </Link>
              .
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              "Nájem = pravidelný náklad bez vlastnictví",
              "Hypotéka = možné budování vlastního kapitálu",
              "Rozhodnutí závisí na číslech a horizontu",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border bg-[#f7f8f7] px-4 py-3 text-sm font-medium text-text-dark"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
