import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Opravy a aktualizace | HypotékaJasně.cz",
  description:
    "Veřejný changelog oprav YMYL obsahu, sazeb a metodiky.",
};

/** Seed log — rozšiřujte chronologicky při každé veřejné opravě. */
const CHANGELOG: {
  date: string;
  area: string;
  summary: string;
  href?: string;
}[] = [
  {
    date: "2026-07-19",
    area: "Centrum důvěry",
    summary:
      "Spouštění stránek Centra důvěry; odstranění nepodložených formulací ze stránky O nás.",
    href: routes.duvera,
  },
  {
    date: "2026-07-19",
    area: "Magazín",
    summary:
      "YMYL články: autor, reviewer, sources; odstraněn claim „s.r.o. je záchrana“.",
    href: routes.clanky,
  },
  {
    date: "2026-07-19",
    area: "Metodika",
    summary: "Váhy market matchingu a pravidlo sponzoringu publikovány.",
    href: routes.metodika,
  },
];

export default function OpravyPage() {
  return (
    <TrustPageShell
      currentPath="/opravy-a-aktualizace"
      eyebrow="Centrum důvěry"
      title="Opravy a aktualizace"
      lead="Když opravíme chybu v datech nebo YMYL textu, zapíšeme to sem. Bez tichých přepisů historie."
    >
      <ol className="space-y-4">
        {CHANGELOG.map((row) => (
          <li
            key={`${row.date}-${row.area}`}
            className="rounded-xl border border-border px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
              {row.date} · {row.area}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{row.summary}</p>
            {row.href ? (
              <Link
                href={row.href}
                className="mt-2 inline-block text-sm font-semibold text-deep-teal underline"
              >
                Otevřít →
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        Nahlášení chyby:{" "}
        <Link href={routes.kontakt} className="underline">
          kontakt
        </Link>
        .
      </p>
    </TrustPageShell>
  );
}
