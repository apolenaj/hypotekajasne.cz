import Image from "next/image";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DESTINATION_METRICS } from "@/lib/destination-metrics";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

function riskTone(risk: string): string {
  if (risk === "Nižší") return "text-deep-teal";
  if (risk === "Vyšší") return "text-amber-800";
  return "text-text-dark";
}

export function DestinationDataGrid() {
  return (
    <section
      id="destinace"
      aria-labelledby="destinations-heading"
      className="scroll-mt-24 bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Trhy
            </p>
            <h2
              id="destinations-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
            >
              Investiční destinace — data, ne slogany
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Vlastnictví, financovatelnost, orientační kapitál a riziko. Každá
              karta ukazuje datový status.
            </p>
          </div>
          <Link
            href={routes.metodika}
            className="shrink-0 text-sm font-medium text-deep-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
          >
            Jak číst statusy →
          </Link>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DESTINATION_METRICS.map((d) => (
            <li key={d.countryId}>
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white transition-[border-color,box-shadow] duration-200 hover:border-deep-teal/35 hover:shadow-[0_10px_36px_-16px_rgba(27,77,62,0.28)]">
                <div className="relative aspect-[16/10] bg-slate-200">
                  <Image
                    src={d.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <span className="absolute left-3 top-3">
                    <DataStatusBadge status={d.dataStatus} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="font-heading text-lg font-semibold text-text-dark">
                    {d.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {d.summary}
                  </p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                    <div>
                      <dt className="text-muted-foreground">Vlastnictví</dt>
                      <dd className="mt-0.5 font-semibold text-text-dark">
                        {d.ownership}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Financování</dt>
                      <dd className="mt-0.5 font-semibold text-text-dark">
                        {d.financing}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Vstupní kapitál</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-text-dark">
                        {d.entryCapitalLabel}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Riziko</dt>
                      <dd
                        className={cn(
                          "mt-0.5 font-semibold",
                          riskTone(d.risk)
                        )}
                      >
                        {d.risk}
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`${routes.pruvodceInvestora}/${d.slug}`}
                    className="mt-5 inline-flex text-sm font-semibold text-deep-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2"
                  >
                    Otevřít průvodce destinací →
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
