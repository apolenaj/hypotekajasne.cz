import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { MethodologyDrawer } from "@/components/trust/MethodologyDrawer";
import { formatCzechDate } from "@/lib/data/freshness";
import { getCountryProvenance } from "@/lib/data/provenance";
import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import { routes } from "@/lib/routes";

type CountryDataProvenanceSectionProps = {
  countryId: CountryId;
};

export function CountryDataProvenanceSection({
  countryId,
}: CountryDataProvenanceSectionProps) {
  const items = getCountryProvenance(countryId);
  const label = countryConfigs[countryId].label;

  return (
    <section
      id="zdroje-metodika"
      aria-labelledby="country-provenance-heading"
      className="scroll-mt-28 border-t border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Transparentnost
            </p>
            <h2
              id="country-provenance-heading"
              className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-dark sm:text-3xl"
            >
              Zdroje, metodika a datum kontroly
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Přehled pro {label}: odkud čísla bereme, jaký mají status a kdy
              byla naposledy kontrolována. MODEL nikdy nevydáváme za LIVE.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MethodologyDrawer topic="general" triggerLabel="Otevřít metodiku" />
            <Link
              href={routes.metodika}
              className="text-sm font-semibold text-deep-teal underline-offset-2 hover:underline"
            >
              /metodika →
            </Link>
          </div>
        </div>

        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
          {items.map((item) => (
            <li
              key={item.label}
              className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6 sm:px-5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-dark">
                    {item.label}
                  </h3>
                  <DataStatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.source}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.notes}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Kontrola
                </p>
                <p className="mt-0.5 text-sm tabular-nums font-semibold text-text-dark">
                  {item.lastVerifiedAt
                    ? formatCzechDate(item.lastVerifiedAt)
                    : item.status === "LIVE"
                      ? "dle scrape"
                      : "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
