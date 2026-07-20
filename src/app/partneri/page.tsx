import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import {
  COMPENSATION_DISCLOSURE,
  MORTGAGE_PARTNERS,
} from "@/lib/trust";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Partneři | HypotékaJasně.cz",
  description:
    "Licencovaný hypoteční partner: IČO, role, JERRS, scope a transparentní odměna.",
};

export default function PartneriPage() {
  return (
    <TrustPageShell
      currentPath="/partneri"
      eyebrow="Centrum důvěry"
      title="Partneři"
      lead="Hypotéka Jasně předává poptávky licencovaným specialistům. Níže je připravená struktura partnera — registrační údaje doplníme po ověření, nevymýšlíme je."
    >
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        {COMPENSATION_DISCLOSURE}
      </p>

      <ul className="space-y-6">
        {MORTGAGE_PARTNERS.map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-border p-5 sm:p-6"
          >
            <h2 className="font-heading text-lg font-bold text-text-dark">
              {p.name}
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase text-muted-foreground">
                  IČO
                </dt>
                <dd className="mt-0.5 text-text-dark">
                  {p.ico ?? "Doplníme po ověření (zatím neuvedeno)"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-muted-foreground">
                  Role / licence
                </dt>
                <dd className="mt-0.5 text-text-dark">{p.role}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase text-muted-foreground">
                  Licence — shrnutí
                </dt>
                <dd className="mt-0.5 text-muted-foreground">
                  {p.licenceSummary}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase text-muted-foreground">
                  JERRS / veřejný registr
                </dt>
                <dd className="mt-0.5">
                  <span className="mr-2 rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold">
                    {p.jerrsStatus === "LIVE"
                      ? "Ověřeno"
                      : p.jerrsStatus === "PENDING_VERIFICATION"
                        ? "Čeká na ověření"
                        : "Připravujeme"}
                  </span>
                  {p.jerrsVerificationUrl ? (
                    <a
                      href={p.jerrsVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-deep-teal underline"
                    >
                      Ověřit v registru
                    </a>
                  ) : (
                    <span className="text-muted-foreground">
                      Odkaz na JERRS / ČNB registr zveřejníme po ověření identity
                      partnera.
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
        ))}
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
