import Link from "next/link";
import { Scale, ShieldCheck } from "lucide-react";
import { COMPENSATION_DISCLOSURE } from "@/lib/legal/partner-config";
import { routes } from "@/lib/routes";

const STATUS_ROWS = [
  {
    id: "DATA",
    label: "DATA",
    text: "Údaj ze zdroje, který pravidelně kontrolujeme (např. sazby bank).",
  },
  {
    id: "MODEL",
    label: "MODEL",
    text: "Orientační výpočet platformy — není živá kotace ani nabídka banky.",
  },
  {
    id: "ODHAD",
    label: "ODHAD",
    text: "Hrubý odhad z dostupných vstupů; vyžaduje ověření.",
  },
] as const;

/**
 * Trust band — statusy, metodika, role, partner (bez falešných čísel).
 */
export function HomeTrustBlock() {
  return (
    <section
      aria-labelledby="home-trust-heading"
      className="border-b border-border bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Důvěra
          </p>
          <h2
            id="home-trust-heading"
            className="mt-2 font-heading text-2xl font-bold text-text-dark sm:text-3xl"
          >
            DATA / MODEL / ODHAD — vždy víte, co čtete
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hypotéka Jasně je informační platforma. Nejsme banka ani licencovaný
            zprostředkovatel. Individuální zprostředkování provádí partner — jen
            se souhlasem a jen pokud je jeho identita zveřejněna.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {STATUS_ROWS.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-border bg-[#f7f8f7] p-4"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-deep-teal">
                {row.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {row.text}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          {COMPENSATION_DISCLOSURE}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={routes.metodika}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
          >
            <Scale className="h-4 w-4" aria-hidden />
            Metodika
          </Link>
          <Link
            href={routes.zdroje}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
          >
            Zdroje
          </Link>
          <Link
            href={routes.duvera}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Centrum důvěry
          </Link>
          <Link
            href={routes.partneri}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
          >
            Partneři
          </Link>
        </div>
      </div>
    </section>
  );
}
