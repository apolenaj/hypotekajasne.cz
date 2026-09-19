import Image from "next/image";
import Link from "next/link";
import { formatDigitalRentgenPrice } from "@/lib/property-rentgen/pricing";
import { routes } from "@/lib/routes";

const POINTS = ["Cash flow", "Scénáře", "Rizika", "Financování", "PDF výstup"] as const;

export function HomeRentgenBand() {
  return (
    <section aria-labelledby="home-rentgen-heading" className="border-b border-gray-200 bg-[#f7f6f3]">
      <div className="mx-auto grid max-w-[90rem] items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div className="relative h-64 overflow-hidden rounded-[18px] sm:h-80">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=75"
            alt="Nemovitost k prověření"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-gold">
            Investiční rentgen
          </p>
          <h2
            id="home-rentgen-heading"
            className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark"
          >
            Našli jste zajímavou nemovitost?
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-600">
            Prověřte její cash flow, financování, citlivost na sazby a hlavní
            investiční rizika.
          </p>
          <p className="mt-5 font-heading text-xl font-bold text-text-dark">
            Investiční rentgen{" "}
            <span className="text-deep-teal">od {formatDigitalRentgenPrice()}</span>
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {POINTS.map((point) => (
              <li
                key={point}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
              >
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={routes.investicniRentgenUkazka}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
            >
              Zobrazit ukázku →
            </Link>
            <Link
              href={routes.investicniRentgen}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-deep-teal hover:border-deep-teal"
            >
              Otevřít Rentgen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
