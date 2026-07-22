import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import { PartnerVerificationBadge } from "@/components/partners/PartnerVerificationBadge";
import {
  COMPENSATION_DISCLOSURE,
  getMortgagePartners,
  isMortgagePartnerHandoffReady,
  partnerJerrsPublicLabel,
  partnerPublicDisplayName,
} from "@/lib/legal/partner-config";
import {
  getPartnerClaimLabels,
  toPartnerVerification,
} from "@/lib/partners/verification";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/partneri");

export default function PartneriPage() {
  const partners = getMortgagePartners();
  const handoffReady = isMortgagePartnerHandoffReady();
  const labels = getPartnerClaimLabels();

  return (
    <TrustPageShell
      currentPath="/partneri"
      eyebrow="Centrum důvěry"
      title="Partneři"
      lead="Hypotéka Jasně je informační platforma — není banka. Individuální zprostředkování provádí partner pouze po ověření a zveřejnění jeho identity. Neověřené údaje a silná tvrzení o licenci neuvádíme."
    >
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {COMPENSATION_DISCLOSURE}
      </p>

      {!handoffReady ? (
        <p
          role="status"
          className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm text-text-dark"
        >
          {labels.leadIntakeDisclosure}
        </p>
      ) : null}

      <ul className="space-y-6">
        {partners.map((p) => {
          const verification = toPartnerVerification(p);
          return (
            <li
              key={p.id}
              className="rounded-2xl border border-border p-5 sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="font-heading text-lg font-bold text-text-dark">
                  {partnerPublicDisplayName(p)}
                </h2>
                <PartnerVerificationBadge
                  verification={verification}
                  className="sm:max-w-xs"
                />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    IČO
                  </dt>
                  <dd className="mt-0.5 text-text-dark">
                    {verification.registrationNumber ??
                      "Neuvedeno — nezveřejňujeme neověřené údaje"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Role
                  </dt>
                  <dd className="mt-0.5 text-text-dark">{p.role}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Licence / registrace — shrnutí
                  </dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    {p.licenceSummary}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Veřejný registr (např. JERRS / ČNB)
                  </dt>
                  <dd className="mt-0.5">
                    <span className="mr-2 rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold">
                      {partnerJerrsPublicLabel(p.jerrsStatus)}
                    </span>
                    {verification.registryUrl ? (
                      <a
                        href={verification.registryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-deep-teal underline"
                      >
                        Ověřit v registru
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        Odkaz na veřejný registr zatím není zveřejněn.
                      </span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase text-muted-foreground">
                    Scope
                  </dt>
                  <dd className="mt-0.5 text-muted-foreground">{p.scope}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Odměna: {p.compensationDisclosure}
              </p>
            </li>
          );
        })}
      </ul>

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
