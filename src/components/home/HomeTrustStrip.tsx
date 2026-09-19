const POINTS = [
  "Srozumitelné finanční nástroje",
  "Výpočty založené na datech",
  "Transparentní předpoklady",
  "Kalkulačky dostupné online",
  "Možnost navázat na specialistu",
] as const;

export function HomeTrustStrip() {
  return (
    <section aria-labelledby="home-trust-heading" className="border-b border-gray-200 bg-[#f7f6f3]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2
            id="home-trust-heading"
            className="font-heading text-2xl font-bold text-text-dark"
          >
            Proč právě HypotékaJasně?
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-gray-700">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-deep-teal" aria-hidden>
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-gray-500">
            Nejsme banka a neschvalujeme úvěry. Čísla na webu jsou modely a
            zveřejněné sazby s datem ověření, ne nabídka banky.
          </p>
        </div>
      </div>
    </section>
  );
}
