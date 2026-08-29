import Link from "next/link";
import { HOME_FAQ_ITEMS } from "@/lib/faq/home-items";
import { routes } from "@/lib/routes";

/**
 * Stručné FAQ na homepage — nativní details/summary pro klávesnici a crawl.
 */
export function HomeFaq() {
  return (
    <section
      aria-labelledby="home-faq-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            FAQ
          </p>
          <h2
            id="home-faq-heading"
            className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
          >
            Krátké odpovědi před prvním krokem
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Role platformy, model versus banka a práce s kontaktem — bez
            marketingových slibů.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {HOME_FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-white open:shadow-sm"
            >
              <summary className="cursor-pointer list-none rounded-xl px-4 py-4 text-sm font-semibold text-text-dark outline-none marker:content-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2 sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {item.q}
                  <span
                    className="mt-0.5 shrink-0 text-muted-gold transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </span>
              </summary>
              <div className="border-t border-border/70 px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground sm:px-5">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href={routes.faq}
            className="font-semibold text-deep-teal underline-offset-4 hover:underline"
          >
            Všechny časté otázky →
          </Link>
        </p>
      </div>
    </section>
  );
}
