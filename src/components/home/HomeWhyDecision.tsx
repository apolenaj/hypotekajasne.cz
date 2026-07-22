import Link from "next/link";
import { routes } from "@/lib/routes";

/**
 * Positioning — rozhodnutí dřív než produkt banky.
 */
export function HomeWhyDecision() {
  return (
    <section
      aria-labelledby="home-why-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Přístup
            </p>
            <h2
              id="home-why-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
            >
              Proč nezačínáme bankou, ale vaším rozhodnutím
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base lg:col-span-7">
            <p>
              Banka schvaluje úvěr. Nejdřív ale potřebujete vědět, co si můžete
              dovolit, kde dává nákup smysl a jestli konkrétní nemovitost obstojí
              v číslech.
            </p>
            <p>
              Hypotéka Jasně proto začíná vaší situací a datovým statusem — ne
              nejhlasitější nabídkou. Až když je obraz jasnější, dává smysl
              řešit produkt nebo konzultaci.
            </p>
            <p>
              Individuální zprostředkování provádí partner jen po ověření a se
              souhlasem. Schválení úvěru vždy zůstává na bance.
            </p>
            <p>
              <Link
                href={routes.oNas}
                className="font-semibold text-deep-teal underline-offset-2 hover:underline"
              >
                Jak pracujeme →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
