import { Calculator, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BENEFITS: {
  icon: LucideIcon;
  title: string;
  text: string;
}[] = [
  {
    icon: Calculator,
    title: "Orientační splátka během minuty",
    text: "Zadáte cenu nemovitosti, vlastní prostředky a splatnost — hned uvidíte modelovou měsíční splátku a LTV pro sazby.",
  },
  {
    icon: ShieldCheck,
    title: "Sazby s datem a oficiálním zdrojem",
    text: "Porovnáte zveřejněné sazby bank z veřejných sazebníků. U každé sazby uvádíme, kdy byla naposledy ověřena a odkud pochází.",
  },
  {
    icon: UserRound,
    title: "Specialista až když chcete vy",
    text: "Výpočet zvládnete sami bez registrace. Kontakt necháte až po něm — tým Hypotéka Jasně s vámi projde možnosti zdarma a nezávazně.",
  },
];

/**
 * Tři konkrétní přínosy — bez vymyšlených statistik.
 */
export function HomeBenefits() {
  return (
    <section
      aria-labelledby="home-benefits-heading"
      className="home-below-fold border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Proč začít zde
          </p>
          <h2
            id="home-benefits-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Jasná čísla dřív, než řešíte banku
          </h2>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-deep-teal/10 text-deep-teal">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-text-dark">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
