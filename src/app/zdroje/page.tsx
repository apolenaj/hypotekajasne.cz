import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { DATA_CATALOG } from "@/lib/data/catalog";
import { PUBLIC_DOMAIN_SOURCE } from "@/lib/data/public-methodology";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Zdroje dat | HypotékaJasně.cz",
  description:
    "Odkud bereme sazby, výnosy a editorial data — přehled oblastí a odkaz na metodiku.",
};

export default function ZdrojePage() {
  return (
    <TrustPageShell
      currentPath="/zdroje"
      eyebrow="Centrum důvěry"
      title="Zdroje"
      lead="Každé důležité číslo má status: Aktuální data, Ověřeno, Modelový výpočet, Nabídka partnera nebo Čeká na aktualizaci. Chybějící údaj nevymýšlíme."
    >
      <p className="text-sm text-muted-foreground">
        Podrobný popis statusů a výpočtů:{" "}
        <Link
          href={routes.metodika}
          className="font-semibold text-deep-teal underline"
        >
          Metodika dat
        </Link>
        .
      </p>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {DATA_CATALOG.map((row) => (
          <li key={row.id} className="px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-text-dark">{row.label}</p>
              <DataStatusBadge status={row.defaultStatus} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {PUBLIC_DOMAIN_SOURCE[row.domain]}
            </p>
          </li>
        ))}
      </ul>
    </TrustPageShell>
  );
}
