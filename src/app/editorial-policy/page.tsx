import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { legalOperator } from "@/config/legal";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/editorial-policy");

export default function EditorialPolicyPage() {
  return (
    <TrustPageShell
      currentPath="/editorial-policy"
      eyebrow="Centrum důvěry"
      title="Redakční zásady"
      lead={`Pravidla pro magazín, akademii a marketingové texty na ${legalOperator.brand} — zejména u financí a bydlení.`}
    >
      <section>
        <h2 className="font-heading text-lg font-semibold text-text-dark">
          Povinné u odborného článku
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Jméno autora a osoby, která text odborně zkontrolovala</li>
          <li>Datum zveřejnění, aktualizace a ověření faktů</li>
          <li>Zdroje — primární podklady nebo metodika platformy</li>
          <li>Oddělení dat, modelového výpočtu, odhadu a neověřených údajů</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-text-dark">
          Zakázané formulace
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Nepodložená „záruka“ výsledku nebo schválení</li>
          <li>„Financování proběhne hladce“ bez procesu a výhrad</li>
          <li>„Procesní dokonalost“ jako prázdný slogan</li>
          <li>Sensational claimy typu „s.r.o. je vaše záchrana“</li>
          <li>Počty nemovitostí / „stovky analýz“ bez ověřených dat</li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-text-dark">
          Opravy
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Chyby opravujeme veřejně na{" "}
          <Link href={routes.opravyAAktualizace} className="text-deep-teal underline">
            /opravy-a-aktualizace
          </Link>
          {"."}
        </p>
      </section>
    </TrustPageShell>
  );
}
