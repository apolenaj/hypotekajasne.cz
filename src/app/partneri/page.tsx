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
import { getCooperationWordingNeutral } from "@/lib/legal/regulatory-texts";
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
    title: projectFounder.displayName,
    body: projectFounder.role,
  },
  {
    title: "Možná partnerská spolupráce",
    body: "Platforma může spolupracovat s dalšími subjekty — podrobnosti uvádíme po ověření.",
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
        <p className="mt-3 text-sm leading-relaxed text-text-dark">
          {getCooperationWordingNeutral("cs")}
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
          platformy; není hypotečním specialistou, finančním poradcem ani
          regulovaným hypotečním zprostředkovatelem.
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
