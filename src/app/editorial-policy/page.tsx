import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Redakční zásady | HypotékaJasně.cz",
  description:
    "Jak píšeme YMYL obsah: autor, review, zdroje, aktualizace, zákaz nepodložených slibů.",
};

export default function EditorialPolicyPage() {
  return (
    <TrustPageShell
      currentPath="/editorial-policy"
      eyebrow="Centrum důvěry"
      title="Redakční zásady"
      lead="Pravidla pro magazín, akademii a marketingové texty — zejména YMYL (finance)."
    >
      <section>
        <h2 className="font-heading text-lg font-semibold text-text-dark">
          Povinné u YMYL článku
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Autor a reviewer (jména v Trust / magazine people registry)</li>
          <li>publishedAt, updatedAt, factCheckedAt</li>
          <li>Zdroje — primární nebo metodika platformy</li>
          <li>Oddělení Data / Modelový výpočet / Odhad / Neověřeno</li>
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
          .
        </p>
      </section>
    </TrustPageShell>
  );
}
