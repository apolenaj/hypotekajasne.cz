import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { COMPENSATION_DISCLOSURE } from "@/lib/trust";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/jak-vydelavame");


export default function JakVydelavamePage() {
  return (
    <TrustPageShell
      currentPath="/jak-vydelavame"
      eyebrow="Centrum důvěry"
      title="Jak vyděláváme"
      lead="Používání kalkulaček, akademie a připravenosti je pro vás zdarma. Platforma je financována B2B spoluprací."
    >
      <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-semibold">Klíčová věta</p>
        <p className="mt-2 text-base">{COMPENSATION_DISCLOSURE}</p>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-text-dark">
          Co to znamená v praxi
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Pokud požádáte o konzultaci a dojde k realizaci přes našeho
            licencovaného partnera, partner nám může vyplatit marketingovou /
            zprostředkovatelskou odměnu.
          </li>
          <li>
            Organické skóre přiřazení trhů a připravenosti se za peníze
            nemění — viz{" "}
            <Link href={routes.metodika} className="text-deep-teal underline">
              metodika
            </Link>
            .
          </li>
          <li>
            Neúčtujeme skryté poplatky za „schválení“ — schválení vždy provádí
            banka.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-lg font-semibold text-text-dark">
          Co neprodáváme jako jistotu
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Modelové limity, skóre a scénáře nejsou závaznou nabídkou. Detail rolí:{" "}
          <Link href={routes.duvera} className="text-deep-teal underline">
            Centrum důvěry
          </Link>
          .
        </p>
      </section>
    </TrustPageShell>
  );
}
