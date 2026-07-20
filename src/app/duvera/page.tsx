import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell } from "@/components/trust/TrustPageShell";
import {
  COMPENSATION_DISCLOSURE,
  ECOSYSTEM_ACTORS,
  TRUST_NAV,
} from "@/lib/trust";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Trust Center | HypotékaJasně.cz",
  description:
    "Komu dáváte data, kdo poskytuje kterou službu, jak vyděláváme a kde najdete metodiku, partnery a editorial policy.",
};

export default function DuveraPage() {
  return (
    <TrustPageShell
      currentPath="/duvera"
      eyebrow="Důvěryhodnost"
      title="Trust Center"
      lead="Do 30 sekund: Hypotéka Jasně je technologická platforma. Úvěr schvaluje banka. Individuální zprostředkování dělá licencovaný specialista. Majetio slouží k nemovitostem."
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
          Dokumenty Trust Center
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
