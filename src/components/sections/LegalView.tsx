import Link from "next/link";
import { Scale } from "lucide-react";
import { LegalOperatorIdentity } from "@/components/legal/LegalOperatorIdentity";
import {
  CONSENT_POLICY_VERSION,
  COOKIE_POLICY_VERSION,
  CONSENT_PURPOSES,
  formatPolicyVersionDateCs,
  getOperatorIdentity,
  getPaidAnalysisTerms,
  getPublicProcessingRoles,
  getPublicCookieTableRows,
  getCookiePolicyDeploymentNotes,
  COOKIE_CATEGORY_LABEL_CS,
  buildPublicRetentionSummary,
  isThirdPartyTransferActive,
  REGULATED_BOUNDARIES,
  TERMS_VERSION,
} from "@/lib/legal";
import { legalOperator } from "@/config/legal";
import { routes } from "@/lib/routes";

function LegalVersionFooter({
  version,
  versionLabel,
}: {
  version: string;
  versionLabel: string;
}) {
  const updated = formatPolicyVersionDateCs(version);
  return (
    <p className="text-xs text-muted-foreground">
      {updated ? <>Poslední aktualizace: {updated}. </> : null}
      {versionLabel}: {version}.
    </p>
  );
}

export type LegalPageType =
  | "gdpr"
  | "smlouvy"
  | "zasady"
  | "cookies"
  | "placena-analyza";

const LEGAL_META: Record<
  LegalPageType,
  { title: string; subtitle: string; navLabel: string }
> = {
  gdpr: {
    title: "Ochrana osobních údajů (GDPR)",
    subtitle: "Správce, účely, souhlasy a práva subjektů údajů.",
    navLabel: "GDPR",
  },
  smlouvy: {
    title: "Smlouvy a podmínky užití",
    subtitle: "Rámec používání webu a regulované hranice.",
    navLabel: "Smlouvy",
  },
  zasady: {
    title: "Zásady používání platformy",
    subtitle: "Transparentnost obsahu a chování uživatelů.",
    navLabel: "Zásady",
  },
  cookies: {
    title: "Zásady cookies",
    subtitle:
      "Nezbytné / analytické / marketingové — analytika jen se souhlasem.",
    navLabel: "Zásady cookies",
  },
  "placena-analyza": {
    title: "Podmínky placené analýzy",
    subtitle: "Cena, rozsah a stav služby (digitální obsah).",
    navLabel: "Placená analýza",
  },
};

const GDPR_ROLE_CS: Record<string, string> = {
  controller: "správce",
  processor: "zpracovatel",
  independent_controller: "samostatný správce",
  not_processor: "nezpracovává osobní údaje pro nás",
};

function OperatorBlock({ heading }: { heading?: string }) {
  return (
    <LegalOperatorIdentity
      variant="full"
      heading={heading ?? "Provozovatel / správce"}
    />
  );
}

function RegulatedBoundariesBox() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
      <p className="font-bold">{REGULATED_BOUNDARIES.title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {REGULATED_BOUNDARIES.statements.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="mt-3">
        Role v ekosystému:{" "}
        <Link href={routes.duvera} className="font-semibold underline">
          Centrum důvěry
        </Link>
        {"."}
      </p>
    </div>
  );
}

function GdprContent() {
  const op = getOperatorIdentity();
  const processingRoles = getPublicProcessingRoles();
  const controllerRoles = processingRoles.filter(
    (r) => r.gdprRole === "controller"
  );
  const processorRoles = processingRoles.filter(
    (r) => r.gdprRole === "processor"
  );
  const independentRoles = processingRoles.filter(
    (r) => r.gdprRole === "independent_controller"
  );
  const anyThirdPartyTransfer =
    isThirdPartyTransferActive("mortgage_specialist") ||
    isThirdPartyTransferActive("majetio") ||
    isThirdPartyTransferActive("broker_developer");

  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <section>
        <h2 className="mb-3 text-xl font-bold text-gray-900">Správce</h2>
        <LegalOperatorIdentity variant="full" />
        <p className="mt-3 text-sm text-muted-foreground">
          Úvodní formuláře přijímá přímo {legalOperator.companyName} To není
          předání údajů třetí straně.
        </p>
      </section>
      <RegulatedBoundariesBox />

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          Účely zpracování
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong>Vyřízení nezávazné poptávky:</strong>{" "}
            {CONSENT_PURPOSES.privacy_processing.description}
          </li>
          <li>
            <strong>Příprava objednávky / placené služby:</strong> pokud
            požádáte o placenou analýzu nebo obdobnou službu, údaje použijeme k
            vyřízení poptávky a případné objednávky.
          </li>
          <li>
            <strong>Marketing:</strong> jen pokud zaškrtnete samostatný
            e-mailový souhlas.{" "}
            {CONSENT_PURPOSES.marketing.description}
          </li>
          <li>
            <strong>Technický provoz a bezpečnost:</strong> provoz webu, session,
            ochrana proti zneužití.
          </li>
          <li>
            <strong>Analytika:</strong> jen po souhlasu se zásadami cookies — viz{" "}
            <Link href={routes.legal.cookies} className="text-deep-teal underline">
              Zásady cookies
            </Link>
            {". Nepoužíváme oprávněný zájem pro analytické cookies."}
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          Příjemci / zpracovatelé
        </h3>
        <ul className="space-y-3">
          {[...controllerRoles, ...processorRoles].map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="font-semibold text-text-dark">{r.label}</p>
              <p className="text-xs font-medium text-deep-teal">
                Role: {r.roleLabelCs ?? GDPR_ROLE_CS[r.gdprRole] ?? r.gdprRole}
              </p>
              <p className="mt-1 text-muted-foreground">{r.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          Další samostatní správci
        </h3>
        {independentRoles.length > 0 ? (
          <ul className="space-y-3">
            {independentRoles.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <p className="font-semibold text-text-dark">{r.label}</p>
                <p className="text-xs font-medium text-deep-teal">
                  Role: {r.roleLabelCs ?? GDPR_ROLE_CS[r.gdprRole] ?? r.gdprRole}
                </p>
                <p className="mt-1 text-muted-foreground">{r.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">
            INSIA, banka, Majetio ani realitní partner z úvodního formuláře
            osobní údaje nedostávají. Samostatný správce by se zde uváděl jen
            při skutečném, výslovně odsouhlaseném předání konkrétnímu příjemci.
            Přehled obchodních rolí:{" "}
            <Link href={routes.partneri} className="text-deep-teal underline">
              Partneři
            </Link>
            {"."}
          </p>
        )}
        {anyThirdPartyTransfer ? (
          <p className="mt-3 text-sm">
            Předání třetí straně probíhá jen po souhlasu pro konkrétního
            příjemce. {CONSENT_PURPOSES.partner_transfer.description}
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          Jaké údaje zpracováváme
        </h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kontaktní údaje z formulářů (jméno, e-mail, telefon).</li>
          <li>
            Kontext záměru (příjem, kapitál, lokalita) — pro model a vyřízení
            poptávky.
          </li>
          <li>
            Technické údaje nezbytné pro provoz (bezpečnost, session).
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">Doba uchování</h3>
        <ul className="list-disc space-y-2 pl-5">
          {buildPublicRetentionSummary(op.privacyEmail).map((line) => (
            <li key={line.slice(0, 48)}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">Vaše práva</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Přístup, oprava, výmaz, omezení, námitka, přenositelnost.</li>
          <li>
            Odvolání souhlasu (marketing
            {anyThirdPartyTransfer ? " / předání třetí straně" : ""} / cookies)
            na {op.privacyEmail} — bez vlivu na zákonnost zpracování před
            odvoláním.
          </li>
          <li>Stížnost u ÚOOÚ.</li>
        </ul>
      </section>

      <LegalVersionFooter
        version={CONSENT_POLICY_VERSION}
        versionLabel="Verze zásad ochrany osobních údajů"
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Verze zásad cookies: {COOKIE_POLICY_VERSION}.
      </p>
    </div>
  );
}

function CookiesContent() {
  const rows = getPublicCookieTableRows();
  const notes = getCookiePolicyDeploymentNotes();

  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <OperatorBlock />
      <p>
        Tyto zásady odpovídají skutečnému chování webu: analytické i
        marketingové technologie spouštíme{" "}
        <strong>až po aktivním souhlasu</strong>. Banner nabízí „Přijmout vše“,
        „Odmítnout volitelné“ a „Nastavení“. Preference ukládáme ve vašem
        prohlížeči (localStorage).
      </p>
      <ul className="list-disc space-y-3 pl-5">
        <li>
          <strong>Nezbytné:</strong> provoz webu, bezpečnost, uložení preference
          cookies. Nelze vypnout.
        </li>
        <li>
          <strong>Analytické:</strong>{" "}
          {CONSENT_PURPOSES.cookie_analytics.description} Právní základ: souhlas
          — nikoli oprávněný zájem.
        </li>
        <li>
          <strong>Marketingové:</strong>{" "}
          {CONSENT_PURPOSES.cookie_marketing.description}
        </li>
      </ul>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          Přehled technologií v této instalaci
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Technologie</th>
                <th className="px-3 py-2 font-semibold">Poskytovatel</th>
                <th className="px-3 py-2 font-semibold">Kategorie</th>
                <th className="px-3 py-2 font-semibold">Účel</th>
                <th className="px-3 py-2 font-semibold">Doba</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 align-top font-mono text-xs">
                    {row.technology}
                  </td>
                  <td className="px-3 py-2 align-top font-medium text-text-dark">
                    {row.provider}
                  </td>
                  <td className="px-3 py-2 align-top">
                    {COOKIE_CATEGORY_LABEL_CS[row.category]}
                  </td>
                  <td className="px-3 py-2 align-top">{row.purpose}</td>
                  <td className="px-3 py-2 align-top text-muted-foreground">
                    {row.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          {notes.map((n) => (
            <li key={n.slice(0, 40)}>{n}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Po „Odmítnout volitelné“ nebo odvolání analytiky se first-party
          analytické klíče smažou a gtag se znovu nenačte. Případné cookies
          Google z dřívějšího souhlasu může odstranit prohlížeč (web je sám
          nepojmenovává ani nemáže).
        </p>
      </section>

      <p className="text-sm">
        Preference změníte přes „Nastavení cookies“ v patičce.
      </p>
      <LegalVersionFooter
        version={COOKIE_POLICY_VERSION}
        versionLabel="Verze zásad"
      />
      <p className="text-sm">
        Související:{" "}
        <Link href={routes.legal.gdpr} className="text-deep-teal underline">
          Ochrana osobních údajů
        </Link>
        {"."}
      </p>
    </div>
  );
}

function SmlouvyContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <OperatorBlock />
      <RegulatedBoundariesBox />
      <p>
        Podmínky užití platformy Hypotéka Jasně. Používáním webu berete na
        vědomí informační charakter nástrojů.
      </p>
      <h3 className="text-xl font-bold text-gray-900">1. Povaha služeb</h3>
      <p>
        Portál je technologická a vzdělávací platforma. Modelové výpočty nejsou
        závaznou nabídkou banky. Úvodní formulář přijímá provozovatel platformy;
        předání jinému subjektu jen se souhlasem, pokud je takové předání
        aktivní.
      </p>
      <h3 className="text-xl font-bold text-gray-900">2. Kalkulačky</h3>
      <p>
        Výstupy jsou orientační. Skutečné sazby a schválení určuje banka.
      </p>
      <h3 className="text-xl font-bold text-gray-900">
        3. Placená digitální analýza
      </h3>
      <p>
        Stav a podmínky:{" "}
        <Link
          href={routes.legal.placenaAnalyza}
          className="text-deep-teal underline"
        >
          Podmínky placené analýzy
        </Link>
        {"."}
      </p>
      <h3 className="text-xl font-bold text-gray-900">4. Odpovědnost</h3>
      <p>
        Provozovatel nenese odpovědnost za rozhodnutí učiněná výhradně na
        základě modelů na webu ani za jednání třetích stran (banka, specialista,
        makléř).
      </p>
      <LegalVersionFooter
        version={TERMS_VERSION}
        versionLabel="Verze podmínek užití"
      />
    </div>
  );
}

function ZasadyContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <OperatorBlock />
      <RegulatedBoundariesBox />
      <p>
        Zásady doplňují smlouvy. Cookies:{" "}
        <Link href={routes.legal.cookies} className="text-deep-teal underline">
          Zásady cookies
        </Link>{" "}
        (analytika jen se souhlasem — shodně s GDPR).
      </p>
      <h3 className="text-xl font-bold text-gray-900">Transparentnost</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Organické skóre se neprodává. Sponzoring je označen — viz{" "}
          <Link href={routes.metodika} className="text-deep-teal underline">
            metodika
          </Link>
          {"."}
        </li>
        <li>
          Odměna od partnera při realizaci — viz{" "}
          <Link
            href={routes.jakVydelavame}
            className="text-deep-teal underline"
          >
            Jak vyděláváme
          </Link>
          {"."}
        </li>
      </ul>
      <h3 className="text-xl font-bold text-gray-900">Chování uživatelů</h3>
      <p>
        Zákaz automatizovaného scrapingu a falešných poptávek. Kontaktní údaje
        musí být pravdivé.
      </p>
      <LegalVersionFooter
        version={TERMS_VERSION}
        versionLabel="Verze zásad používání"
      />
    </div>
  );
}

function PlacenaAnalyzaContent() {
  const t = getPaidAnalysisTerms();
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <OperatorBlock />
      <RegulatedBoundariesBox />

      {!t.commerciallyAvailable ? (
        <div className="rounded-xl border border-deep-teal/30 bg-deep-teal/5 px-4 py-3 text-sm text-text-dark">
          <p className="font-semibold">Služba zatím není k dispozici ke koupi</p>
          <p className="mt-1 text-muted-foreground">
            Placená analýza není aktivní. Můžete zanechat kontakt v Investičním
            rentgenu — jde o evidenci zájmu, ne o objednávku.
          </p>
        </div>
      ) : null}

      <p className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm">
        Produkt: <strong>{t.productName}</strong>
        {t.commerciallyAvailable ? (
          <>
            {" "}
            · Orientační cena: <strong>{t.priceLabel}</strong>
          </>
        ) : null}
      </p>

      {t.commerciallyAvailable ? (
        <section>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Cena</h3>
          <p>
            {t.priceLabel} ({t.currency}).
          </p>
        </section>
      ) : null}

      <section>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Plánovaný rozsah</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {t.scope.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm font-semibold">Mimo rozsah:</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {t.outOfScope.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Dodání</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {t.delivery.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xl font-bold text-gray-900">Reklamace</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {t.complaint.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          Zrušení / odstoupení
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {t.cancellationWithdrawal.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          Poznámky k digitální službě
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {t.digitalServiceNotes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <LegalVersionFooter
        version={t.version}
        versionLabel="Verze podmínek"
      />
    </div>
  );
}

export function LegalView({ type }: { type: LegalPageType }) {
  const meta = LEGAL_META[type];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="border-b border-gray-200 bg-deep-teal text-white">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <div className="flex items-center gap-3 text-emerald-200">
            <Scale className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">
              Právní informace
            </span>
          </div>
          <h1 className="mt-4 font-heading text-3xl font-black md:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 text-emerald-50/90">{meta.subtitle}</p>
          <nav className="mt-6 flex flex-wrap gap-2 text-xs">
            {(
              [
                ["gdpr", routes.legal.gdpr],
                ["cookies", routes.legal.cookies],
                ["smlouvy", routes.legal.smlouvy],
                ["zasady", routes.legal.zasady],
                ["placena-analyza", routes.legal.placenaAnalyza],
              ] as const
            ).map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className={
                  type === key
                    ? "rounded-full bg-white px-3 py-1 font-bold text-deep-teal"
                    : "rounded-full border border-white/30 px-3 py-1 text-white/90 hover:bg-white/10"
                }
              >
                {LEGAL_META[key].navLabel}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:p-10">
          {type === "gdpr" ? (
            <GdprContent />
          ) : type === "smlouvy" ? (
            <SmlouvyContent />
          ) : type === "cookies" ? (
            <CookiesContent />
          ) : type === "placena-analyza" ? (
            <PlacenaAnalyzaContent />
          ) : (
            <ZasadyContent />
          )}
        </article>
      </div>
    </div>
  );
}
