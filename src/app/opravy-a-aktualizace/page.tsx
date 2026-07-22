import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { listPublicChangelog } from "@/lib/trust/public-changelog";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/opravy-a-aktualizace");

export default function OpravyPage() {
  const changelog = listPublicChangelog();

  return (
    <TrustPageShell
      currentPath="/opravy-a-aktualizace"
      eyebrow="Centrum důvěry"
      title="Co jsme aktualizovali"
      lead="Veřejný changelog reálných oprav a změn. Bez falešné historie — zapisujeme jen to, co se skutečně stalo."
    >
      <ol className="space-y-4">
        {changelog.map((row) => (
          <li
            key={`${row.date}-${row.area}-${row.summary.slice(0, 24)}`}
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
