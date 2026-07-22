import { getStaticPageSeo } from "@/lib/seo/pages";
import Link from "next/link";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import {
  COMPENSATION_DISCLOSURE,
  ECOSYSTEM_ACTORS,
  TRUST_NAV,
} from "@/lib/trust";
import { listPublicChangelog } from "@/lib/trust/public-changelog";
import { NUMBER_PIPELINE_STEPS } from "@/lib/trust/number-pipeline";
import {
  PUBLIC_STATUS_MEANINGS,
  PUBLIC_STATUS_ORDER,
} from "@/lib/data/public-methodology";
import { getPartnerClaimLabels } from "@/lib/partners/verification";
import { getOperatorIdentity } from "@/lib/legal/operator";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/duvera");

export default function DuveraPage() {
  const partnerLabels = getPartnerClaimLabels();
  const op = getOperatorIdentity();
  const recent = listPublicChangelog().slice(0, 3);

  return (
    <TrustPageShell
      currentPath="/duvera"
      eyebrow="Důvěryhodnost"
      title="Centrum důvěry"
      lead={`Do 30 sekund: Hypotéka Jasně je technologická platforma. Úvěr schvaluje banka. Individuální zprostředkování provádí partner jen po ověření identity (${partnerLabels.badgeLabel}). Majetio slouží k nemovitostem.`}
    >
      <section>
        <h2 className="font-heading text-xl font-semibold text-text-dark">
          Kdo co dělá
        </h2>
        <ul className="mt-4 space-y-3">
          {ECOSYSTEM_ACTORS.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-border px-4 py-3"
            >
              <p className="font-semibold text-text-dark">{a.name}</p>
              <p className="text-xs font-medium text-deep-teal">{a.shortRole}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="text-text-dark">Dělá: </strong>
                {a.whatTheyDo}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <strong className="text-text-dark">Nedělá: </strong>
                {a.whatTheyDont}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-text-dark">
          Statusy dat
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          LIVE · VERIFIED · MODEL · ESTIMATE · UNVERIFIED · NEEDS UPDATE ·
          PARTNER OFFER — každé číslo nese jeden z těchto statusů.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {PUBLIC_STATUS_ORDER.map((s) => (
            <li
              key={s}
              className="flex items-start gap-2 rounded-lg border border-border px-3 py-2.5"
            >
              <DataStatusBadge status={s} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {PUBLIC_STATUS_MEANINGS[s].description}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <Link
            href={routes.metodika}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Celá metodika →
          </Link>
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-text-dark">
          Jak vzniká číslo, které vidíte
        </h2>
        <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {NUMBER_PIPELINE_STEPS.map((step, i) => (
            <li key={step.id} className="flex items-center gap-2">
              <span className="inline-flex h-8 items-center rounded-lg bg-deep-teal/10 px-3 text-xs font-semibold text-deep-teal">
                {step.title}
              </span>
              {i < NUMBER_PIPELINE_STEPS.length - 1 ? (
                <span className="hidden text-muted-foreground sm:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-muted-foreground">
          Detail kroků a předpokladů je na stránce Metodika.
        </p>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-semibold">Transparentní odměna</p>
        <p className="mt-1">{COMPENSATION_DISCLOSURE}</p>
        <p className="mt-2">
          Detail:{" "}
          <Link href={routes.jakVydelavame} className="underline">
            /jak-vydelavame
          </Link>
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-text-dark">
          Redakční kontrola právních zdrojů
        </h2>
        {op.lastLegalReviewDate && op.legalReviewedBy ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Evidovaná právní revize: {op.lastLegalReviewDate} (
            {op.legalReviewedBy}).
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Právní a daňové přehledy procházejí redakční kontrolou právních
            zdrojů. Oddělenou právní revizi kvalifikovaným odborníkem
            zveřejníme, až bude evidována.
          </p>
        )}
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-text-dark">
          Co jsme aktualizovali
        </h2>
        <ul className="mt-4 space-y-3">
          {recent.map((row) => (
            <li
              key={`${row.date}-${row.area}`}
              className="rounded-xl border border-border px-4 py-3"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                {row.date} · {row.area}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{row.summary}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <Link
            href={routes.opravyAAktualizace}
            className="font-semibold text-deep-teal underline-offset-2 hover:underline"
          >
            Celý changelog →
          </Link>
        </p>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold text-text-dark">
          Dokumenty Centra důvěry
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {TRUST_NAV.filter((i) => i.href !== "/duvera").map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg border border-border px-3 py-2 text-sm font-semibold text-deep-teal hover:bg-deep-teal/5"
              >
                {item.label} →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </TrustPageShell>
  );
}
