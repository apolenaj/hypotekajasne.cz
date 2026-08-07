import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { LegalOperatorIdentity } from "@/components/legal/LegalOperatorIdentity";
import {
  financialPartner,
  legalOperator,
  projectFounder,
} from "@/config/legal";
import { COMPENSATION_DISCLOSURE } from "@/lib/legal/partner-config";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/partneri");

const ROLE_BLOCKS = [
  {
    title: legalOperator.brand,
    body: "Digitální platforma — edukace, kalkulačky a modelové nástroje.",
  },
  {
    title: legalOperator.companyName,
    body: `Provozovatel platformy · IČO ${legalOperator.ico}`,
  },
  {
    title: financialPartner.representative,
    body: "Jednatel společnosti a hypoteční specialista.",
  },
  {
    title: financialPartner.network,
    body: "Síť / partner, prostřednictvím které je zajišťována související finanční distribuce.",
  },
  {
    title: "Banka",
    body: "Poskytovatel úvěru — schválení úvěru vždy provádí banka po vlastním posouzení.",
  },
] as const;

export default function PartneriPage() {
  return (
    <TrustPageShell
      currentPath="/partneri"
      eyebrow="Centrum důvěry"
      title="Partneři a role"
      lead="Hypotéka Jasně je digitální platforma. Provozovatelem je HEINZKE & partneři s.r.o. Schválení úvěru vždy provádí banka po vlastním posouzení."
    >
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {COMPENSATION_DISCLOSURE}
      </p>

      <section className="rounded-2xl border border-border p-5 sm:p-6">
        <h2 className="font-heading text-lg font-bold text-text-dark">
          Provozovatel
        </h2>
        <div className="mt-4">
          <LegalOperatorIdentity variant="compact" showBrandNote showContact />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Jednatel: {financialPartner.representative} ·{" "}
          {financialPartner.specialistTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-dark">
          {financialPartner.cooperationWording}
        </p>
      </section>

      <section>
        <h2 className="font-heading text-lg font-bold text-text-dark">
          Kdo co dělá
        </h2>
        <ul className="mt-4 space-y-3">
          {ROLE_BLOCKS.map((block) => (
            <li
              key={block.title}
              className="rounded-xl border border-border px-4 py-3"
            >
              <p className="font-semibold text-text-dark">{block.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{block.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-slate-50 px-4 py-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-text-dark">{projectFounder.name}</strong> —{" "}
          {projectFounder.role}. Stojí za konceptem a vývojem digitální
          platformy; není provozovatelem ani správcem osobních údajů.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">
        Role v ekosystému:{" "}
        <Link href={routes.duvera} className="text-deep-teal underline">
          Centrum důvěry
        </Link>
        . Majetio:{" "}
        <Link href={routes.oMajetio} className="text-deep-teal underline">
          /o-majetio
        </Link>
        .
      </p>
    </TrustPageShell>
  );
}
