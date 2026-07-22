const STEPS = [
  {
    title: "Zadáte svou situaci",
    text: "Příjem, vlastní zdroje, záměr — bez nutnosti vyplnit vše najednou.",
  },
  {
    title: "Dostanete orientační obraz",
    text: "Rozpočet, limity a další krok. U výsledků je status dat / model / odhad.",
  },
  {
    title: "Volíte další pohyb",
    text: "Trh, nemovitost, refinancování nebo konzultace — podle toho, co dává smysl.",
  },
] as const;

/**
 * Jak Hypotéka Jasně funguje — produktová logika, ne feature dump.
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
            Platforma
          </p>
          <h2
            id="home-how-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Jak Hypotéka Jasně funguje
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nejsme srovnávač bankovních akcí. Pomáháme si ujasnit rozhodnutí dřív,
            než řešíte konkrétní produkt.
          </p>
        </div>

        <ol className="mt-7 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-border bg-white p-5"
            >
              <span className="font-heading text-2xl font-bold text-muted-gold">
                {i + 1}
              </span>
              <h3 className="mt-2 font-heading text-lg font-semibold text-text-dark">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
