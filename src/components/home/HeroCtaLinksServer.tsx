import Link from "next/link";

/** Server CTA — bez klientského bundle v hero (tracking přes deferred analytics). */
export function HeroCtaLinksServer() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-8">
      <Link
        href="#hero-calculator"
        data-cta-id="hero_spocitat_splatku"
        className="inline-flex h-11 min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-muted-gold px-5 text-sm font-semibold text-text-dark transition-colors hover:bg-muted-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal sm:w-auto"
      >
        Spočítat splátku
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
      <Link
        href="#home-rates-heading"
        data-cta-id="hero_porovnat_orientacni_sazby"
        className="inline-flex h-11 min-h-11 w-full items-center justify-center rounded-lg border border-white/30 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-teal sm:w-auto"
      >
        Porovnat orientační sazby
      </Link>
    </div>
  );
}
