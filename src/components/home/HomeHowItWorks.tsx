const STEPS = [
  {
    title: "Vyberete svou situaci",
    text: "Koupě, refinancování, nájem vs. hypotéka, investice nebo zahraniční trh.",
  },
  {
    title: "Spočítáte a porovnáte možnosti",
    text: "Kalkulačky, sazby bank a investiční modely — s datem ověření a zdrojem.",
  },
  {
    title: "Pokud chcete, požádáte o nezávaznou pomoc",
    text: "Kontakt necháte až když sami chcete. Nejsme banka a neschvalujeme úvěry.",
  },
] as const;

/**
 * Jak Hypotéka Jasně funguje — produktové kroky (ne metodika dat).
 */
export function HomeHowItWorks() {
  return (
    <section
      id="jak-to-funguje"
      aria-labelledby="home-how-heading"
      className="scroll-mt-24 border-b border-border bg-white lg:scroll-mt-28"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Jak to funguje
          </p>
          <h2
            id="home-how-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Tři kroky k jasnějšímu rozhodnutí
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nejsme banka a neschvalujeme úvěry. Pomáháme si ujasnit čísla a
            podmínky dřív, než řešíte konkrétní nabídku.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="home-below-fold rounded-xl border border-border bg-[#f7f8f7] p-5"
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
