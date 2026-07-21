import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { ZdrojeExplorer } from "@/components/trust/ZdrojeExplorer";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/zdroje");


export default function ZdrojePage() {
  return (
    <TrustPageShell
      currentPath="/zdroje"
      eyebrow="Centrum důvěry"
      title="Zdroje"
      lead="Skutečné autority — ne interní soubory. Každý významný údaj má status důvěryhodnosti a u Ověřeno i odkaz na externí zdroj."
    >
      <p className="text-sm text-muted-foreground">
        Podrobný popis výpočtů a modelů:{" "}
        <Link
          href={routes.metodika}
          className="font-semibold text-deep-teal underline"
        >
          Metodika dat
        </Link>
        .
      </p>

      <ZdrojeExplorer />
    </TrustPageShell>
  );
}
