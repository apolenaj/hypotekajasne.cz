const STEPS = [
  {
    title: "Zadáte základní údaje",
    text: "Cena nemovitosti, vlastní prostředky, splatnost a fixace — bez zbytečných detailů na začátku.",
  },
  {
    title: "Uvidíte splátku a sazby",
    text: "Orientační měsíční splátka z modelu a zvlášť ověřené zveřejněné sazby bank včetně data a zdroje.",
  },
  {
    title: "Požádáte o nezávazné srovnání",
    text: "Když budete chtít, necháte kontakt — hypoteční specialista s vámi projde reálné možnosti.",
  },
] as const;

/**
 * Jak Hypotéka Jasně funguje — max 3 kroky.
 */
export function HomeHowItWorks() {
  return (
    <section
      aria-labelledby="home-how-heading"
      className="border-b border-border bg-white"
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
            Tři kroky k jasnějšímu rozhodnutí
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nejsme banka a neschvalujeme úvěry. Pomáháme si ujasnit čísla a
            podmínky dřív, než řešíte konkrétní nabídku.
          </p>
        </div>

        <ol className="mt-7 grid gap-4 sm:grid-cols-3">
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
