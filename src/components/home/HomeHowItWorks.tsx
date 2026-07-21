const STEPS = [
  {
    n: "1",
    title: "Finance",
    text: "Zjistíte orientační limity — úvěr, splátku a rezervu domácnosti.",
  },
  {
    n: "2",
    title: "Trh",
    text: "Porovnáte destinace: vlastnictví, financování, kapitál, riziko.",
  },
  {
    n: "3",
    title: "Nemovitost",
    text: "Vyberete konkrétní nabídku nebo zadáte parametry ručně.",
  },
  {
    n: "4",
    title: "Analýza",
    text: "Rentgen a laboratoř rozhodnutí — výnos, stres, koupě vs. nájem.",
  },
  {
    n: "5",
    title: "Financování",
    text: "Modelový fit a volitelně nezávazná konzultace — schválení vždy banka.",
  },
] as const;

/**
 * Jednoduchý produktový flow — 5 kroků bez textové stěny.
 */
export function HomeHowItWorks() {
  return (
    <section
      aria-labelledby="home-how-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Jak to funguje
          </p>
          <h2
            id="home-how-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Finance → trh → nemovitost → analýza → financování
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Stejná logika napříč nástroji — vždy víte, jestli jde o data, model
            nebo odhad.
          </p>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-xl border border-border bg-white p-4 sm:p-5"
            >
              <span className="font-heading text-2xl font-bold text-muted-gold">
                {s.n}
              </span>
              <h3 className="mt-2 font-semibold text-text-dark">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
