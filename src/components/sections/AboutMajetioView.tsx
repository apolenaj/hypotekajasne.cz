import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Calculator,
  Globe2,
  GraduationCap,
  Handshake,
  Shield,
} from "lucide-react";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import {
  ECOSYSTEM_FEATURES,
  FUTURE_SSO_BLUEPRINT,
  PROPERTY_DETAIL_WIDGETS,
} from "@/lib/majetio";
import { routes } from "@/lib/routes";

const MAJETIO_URL = "https://majetio.cz";

export function AboutMajetioView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-[#063d38] via-[#0b5c52] to-[#127a6a] text-white">
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-24 lg:py-28">
          <span className="inline-flex rounded-full border border-emerald-300/40 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-100">
            Ekosystém
          </span>
          <h1 className="mt-6 font-heading text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Hypotéka Jasně &amp; Majetio: finance a nemovitosti v jednom toku
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-emerald-50/90 sm:text-xl">
            <strong className="font-semibold text-white">Hypotéka Jasně</strong>{" "}
            = finance, kvalifikace, edukace a výběr trhu.{" "}
            <strong className="font-semibold text-white">Majetio</strong> =
            discovery nemovitostí, analýza a transakce. Spojuje je Financial
            Passport — bez zbytečného PII a bez falešných počtů listingů.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="font-heading text-2xl font-black text-gray-900 sm:text-3xl">
          Role platforem
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Hypotéka Jasně
            </p>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li className="flex gap-2">
                <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Finance &amp; Hypoteční připravenost
              </li>
              <li className="flex gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Kvalifikace (Financial Passport)
              </li>
              <li className="flex gap-2">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Edukace &amp; metodika
              </li>
              <li className="flex gap-2">
                <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                Market selection
              </li>
            </ul>
            <Link
              href={routes.navrhNaMiru}
              className="mt-6 inline-flex text-sm font-bold text-deep-teal hover:underline"
            >
              Spustit Hypoteční připravenost →
            </Link>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-deep-teal to-[#0f6b5f] p-8 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Majetio.cz / Majetio.com
            </p>
            <ul className="mt-4 space-y-3 text-sm text-emerald-50">
              <li className="flex gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                Property discovery
              </li>
              <li className="flex gap-2">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" />
                Property analysis
              </li>
              <li className="flex gap-2">
                <Handshake className="mt-0.5 h-4 w-4 shrink-0" />
                Transaction support
              </li>
            </ul>
            <p className="mt-4 text-xs text-emerald-100/80">
              Počet analyzovaných nemovitostí uvádíme jen s ověřenými daty —
              nikdy jako marketingový odhad.
            </p>
            <a
              href={MAJETIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white hover:underline"
            >
              Otevřít Majetio
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[#f4f6f5] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-2xl font-black text-gray-900 sm:text-3xl">
            Financial Passport
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Po Hypoteční připravenosti předáme Majetio jen potřebné parametry:
            maxEstimatedBankBudget, safePropertyBudget, ownFunds,
            safeMonthlyPayment, purpose, country, investmentProfile,
            financingStatus — plus source attribution, UTM, referral ID a lead
            lifecycle ID.
          </p>
          <p className="mt-4 text-sm font-semibold text-deep-teal">
            CTA: „Zobrazit nemovitosti, které odpovídají mému rozpočtu“
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl font-black text-gray-900 sm:text-3xl">
          Stav funkcí (LIVE / BETA / COMING SOON)
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {ECOSYSTEM_FEATURES.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-border bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-text-dark">{f.name}</p>
                <FeatureStatusBadge status={f.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                {f.owner}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl border border-border bg-white p-5">
          <h3 className="font-semibold text-text-dark">
            Property detail API (Majetio)
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex flex-wrap items-center gap-2">
              <FeatureStatusBadge
                status={PROPERTY_DETAIL_WIDGETS.canIAfford.status}
              />
              {PROPERTY_DETAIL_WIDGETS.canIAfford.label} →{" "}
              <code className="text-xs">
                {PROPERTY_DETAIL_WIDGETS.canIAfford.hjEndpoint}
              </code>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <FeatureStatusBadge
                status={PROPERTY_DETAIL_WIDGETS.calculateFinancing.status}
              />
              {PROPERTY_DETAIL_WIDGETS.calculateFinancing.label} →{" "}
              <code className="text-xs">
                {PROPERTY_DETAIL_WIDGETS.calculateFinancing.hjEndpoint}
              </code>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            SSO: {FUTURE_SSO_BLUEPRINT.status === "COMING_SOON" ? "COMING SOON" : FUTURE_SSO_BLUEPRINT.status}{" "}
            — {FUTURE_SSO_BLUEPRINT.note}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-heading text-2xl font-black text-gray-900 sm:text-3xl">
          Začněte kvalifikací, pak discovery
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={routes.navrhNaMiru}
            className="inline-flex rounded-full bg-deep-teal px-6 py-3 text-sm font-bold text-white"
          >
            Hypoteční připravenost
          </Link>
          <a
            href={MAJETIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-bold text-text-dark"
          >
            Majetio
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
