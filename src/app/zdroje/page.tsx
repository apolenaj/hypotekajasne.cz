import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { DATA_CATALOG } from "@/lib/data/catalog";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Zdroje dat | HypotékaJasně.cz",
  description:
    "Kde bereme sazby, výnosy a editorial data — katalog domén a odkaz na metodiku.",
};

export default function ZdrojePage() {
  return (
    <TrustPageShell
      currentPath="/zdroje"
      eyebrow="Trust Center"
      title="Zdroje"
      lead="Každé důležité číslo má status (LIVE / VERIFIED / MODEL / PARTNER QUOTE / STALE). Chybějící údaj nevymýšlíme."
    >
      <p className="text-sm text-muted-foreground">
        Podrobný popis statusů a výpočtů:{" "}
        <Link href={routes.metodika} className="font-semibold text-deep-teal underline">
          /metodika
        </Link>
        .
      </p>

      <ul className="divide-y divide-border rounded-xl border border-border">
        {DATA_CATALOG.slice(0, 24).map((row) => (
          <li key={row.id} className="px-4 py-3 text-sm">
            <p className="font-semibold text-text-dark">{row.label}</p>
            <p className="text-xs text-muted-foreground">
              {row.domain} · default {row.defaultStatus}
              {row.canonicalModule ? ` · ${row.canonicalModule}` : null}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Kompletní katalog je v kódu (`DATA_CATALOG`) a na stránce metodiky.
      </p>
    </TrustPageShell>
  );
}
