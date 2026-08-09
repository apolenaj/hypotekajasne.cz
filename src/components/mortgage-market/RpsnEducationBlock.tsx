/**
 * Concise RPSN education using verified MONETA representative examples.
 * Server-safe — no client state.
 */

import { formatRatePercentCs } from "@/lib/mortgage-market/public-labels";

const MONETA_EXAMPLES = [
  {
    id: "with-ppi",
    title: "S pojištěním",
    nominal: 4.99,
    rpsn: 6.11,
  },
  {
    id: "without-ppi",
    title: "Bez pojištění",
    nominal: 5.19,
    rpsn: 5.33,
  },
] as const;

export function RpsnEducationBlock() {
  return (
    <section
      aria-labelledby="rpsn-edu-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Celková cena
          </p>
          <h2
            id="rpsn-edu-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Nejnižší úrok nemusí znamenat nejnižší náklady
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Pojištění a další náklady mohou změnit celkovou cenu úvěru. Níže je
            reprezentativní příklad banky — ne univerzální pořadí pro každého
            klienta.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {MONETA_EXAMPLES.map((ex) => (
            <article
              key={ex.id}
              className="rounded-2xl border border-border bg-white p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Reprezentativní příklad banky
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold text-text-dark">
                MONETA · {ex.title}
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Úroková sazba
                  </dt>
                  <dd className="mt-0.5 font-heading text-xl font-bold tabular-nums text-text-dark">
                    {formatRatePercentCs(ex.nominal)}&nbsp;%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">RPSN</dt>
                  <dd className="mt-0.5 font-heading text-xl font-bold tabular-nums text-text-dark">
                    {formatRatePercentCs(ex.rpsn)}&nbsp;%
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          V tomto příkladu má varianta s nižším úrokem vyšší RPSN — kvůli
          pojištění a dalším nákladům v příkladu banky. Neznamená to, že
          pojištění je vždy nevýhodné.
        </p>
      </div>
    </section>
  );
}
