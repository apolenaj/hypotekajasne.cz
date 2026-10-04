import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { LegalOperatorIdentity } from "@/components/legal/LegalOperatorIdentity";
import {
  legalOperator,
  PLATFORM_SAFE_DESCRIPTION_CS,
  projectFounder,
} from "@/config/legal";
import { COMPENSATION_DISCLOSURE } from "@/lib/legal/partner-config";
import { HEINZKE_PARTNER_PUBLIC } from "@/lib/trust/heinzke-partner-public";
import { routes } from "@/lib/routes";
import { CTA_CS, PRIMARY_PRODUCT_CTA } from "@/lib/ux/cta";

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
    title: projectFounder.displayName,
    body: projectFounder.role,
  },
  {
    title: `${HEINZKE_PARTNER_PUBLIC.personName} / ${HEINZKE_PARTNER_PUBLIC.companyShort}`,
    body: "Partner pro individuální hypoteční řešení a odbornou konzultaci. Finální schválení úvěru provádí banka.",
  },
  {
    title: "Banka",
    body: "Poskytovatel úvěru — schválení úvěru vždy provádí banka po vlastním posouzení.",
  },
] as const;

export default function PartneriPage() {
  const partner = HEINZKE_PARTNER_PUBLIC;

  return (
    <TrustPageShell
      currentPath="/partneri"
      eyebrow="Centrum důvěry"
      title="Partneři a role"
      lead={`${legalOperator.brand} je technologická a informační platforma. Provozovatelem je ${legalOperator.companyName} Schválení úvěru vždy provádí banka po vlastním posouzení.`}
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
          Jednatel: {projectFounder.displayName}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-dark">
          {PLATFORM_SAFE_DESCRIPTION_CS}
        </p>
      </section>

      <section className="rounded-2xl border border-border p-5 sm:p-6">
        <h2 className="font-heading text-lg font-bold text-text-dark">
          Partner pro hypoteční řešení
        </h2>
        <h3 className="mt-4 font-heading text-xl font-bold text-text-dark">
          {partner.personName}
        </h3>
        <p className="mt-1 text-sm font-semibold text-deep-teal">
          {partner.roleOnPlatform}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-dark">
          {partner.summary}
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {partner.focusAreas.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link
          href={PRIMARY_PRODUCT_CTA.href}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-deep-teal px-4 text-sm font-semibold text-white hover:bg-deep-teal-light"
        >
          {CTA_CS.discoverSituation}
        </Link>
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
          platformy; není hypotečním specialistou, finančním poradcem ani
          regulovaným hypotečním zprostředkovatelem.
        </p>
        <p className="mt-3">
          Schválení úvěru, sazbu a konečné podmínky vždy určuje příslušná banka
          po vlastním posouzení.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">
        Role v ekosystému:{" "}
        <Link href={routes.duvera} className="text-deep-teal underline">
          Centrum důvěry
        </Link>
        {". Majetio: "}
        <Link href={routes.oMajetio} className="text-deep-teal underline">
          /o-majetio
        </Link>
        {"."}
      </p>
    </TrustPageShell>
  );
}
