import Link from "next/link";
import { Scale } from "lucide-react";
import {
  CONSENT_POLICY_VERSION,
  COOKIE_POLICY_VERSION,
  CONSENT_PURPOSES,
  formatOperatorAddress,
  getOperatorIdentity,
  getPaidAnalysisTerms,
  operatorDisplayName,
  PROCESSING_ROLES,
  REGULATED_BOUNDARIES,
  TERMS_VERSION,
} from "@/lib/legal";
import { routes } from "@/lib/routes";

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

function OperatorBlock() {
  const op = getOperatorIdentity();
  return (
    <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm">
      <p className="font-semibold text-text-dark">Provozovatel / správce</p>
      <p className="mt-1 text-muted-foreground">{operatorDisplayName(op)}</p>
      <p className="mt-1 text-muted-foreground">
        {formatOperatorAddress(op)}
      </p>
      <p className="mt-1 text-muted-foreground">
        E-mail: {op.email} · Tel: {op.phone}
      </p>
      <dl className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
        {op.ico ? (
          <div>
            <dt className="font-bold uppercase text-muted-foreground">IČO</dt>
            <dd>{op.ico}</dd>
          </div>
        ) : null}
        {op.dic ? (
          <div>
            <dt className="font-bold uppercase text-muted-foreground">DIČ</dt>
            <dd>{op.dic}</dd>
          </div>
        ) : null}
        {op.publicRegisterUrl ? (
          <div className="sm:col-span-2">
            <dt className="font-bold uppercase text-muted-foreground">
              Veřejný registr
            </dt>
            <dd>
              <a
                href={op.publicRegisterUrl}
                className="text-deep-teal underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Otevřít výpis
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      {!op.isProductionReady ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Úplná obchodní identifikace (právní jméno, IČO) zatím není ve
          veřejném configu. Kontaktní údaje výše slouží ke komunikaci;
          placené služby zůstávají vypnuté, dokud není identita ověřena.
        </p>
      ) : null}
    </div>
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
        .
      </p>
    </div>
  );
}

function GdprContent() {
  const op = getOperatorIdentity();
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <OperatorBlock />
      <RegulatedBoundariesBox />

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          1. Role správců a zpracovatelů
        </h3>
        <ul className="space-y-3">
          {PROCESSING_ROLES.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="font-semibold text-text-dark">{r.label}</p>
              <p className="text-xs font-medium text-deep-teal">
                Role: {GDPR_ROLE_CS[r.gdprRole] ?? r.gdprRole}
              </p>
              <p className="mt-1 text-muted-foreground">{r.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          2. Jaké údaje zpracováváme
        </h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kontaktní údaje z formulářů (jméno, e-mail, telefon).</li>
          <li>
            Kontext záměru (příjem, kapitál, lokalita) — pro model a vyřízení
            žádosti.
          </li>
          <li>
            Technické údaje nezbytné pro provoz (bezpečnost, session). Analytika
            a marketingové cookies jen po souhlasu — viz{" "}
            <Link href={routes.legal.cookies} className="text-deep-teal underline">
              Zásady cookies
            </Link>
            .
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          3. Právní základy a souhlasy
        </h3>
        <p className="mb-3 text-sm">
          <strong>
            Odeslání formuláře není univerzální marketingový souhlas.
          </strong>{" "}
          Marketing je samostatný checkbox. Předání partnerovi je samostatný
          souhlas s uvedeným rozsahem.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong>Vyřízení žádosti:</strong>{" "}
            {CONSENT_PURPOSES.privacy_processing.description}
          </li>
          <li>
            <strong>Předání partnerovi:</strong>{" "}
            {CONSENT_PURPOSES.partner_transfer.description} Základ: souhlas
            (čl. 6 odst. 1 písm. a) GDPR).
          </li>
          <li>
            <strong>Marketing:</strong> {CONSENT_PURPOSES.marketing.description}
          </li>
          <li>
            <strong>Analytické cookies:</strong> právní základ = souhlas.{" "}
            <strong className="text-text-dark">
              Nepoužíváme oprávněný zájem pro analytické cookies.
            </strong>{" "}
            Analytiku spouštíme až po „Přijmout vše“ nebo po výslovném zapnutí v
            nastavení.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          4. Předání partnerovi
        </h3>
        <p>
          Údaje předáme jen pokud zaškrtnete souhlas s předáním a jen v uvedeném
          rozsahu (např. licencovaný hypoteční specialista, Majetio). Nejde o
          plošné předání všem makléřům. Hypotéka Jasně není banka; konzultace je
          nezávazná. Stav zveřejnění identity partnera:{" "}
          <Link href={routes.partneri} className="text-deep-teal underline">
            Partneři
          </Link>
          . Pokud identifikace partnera není zveřejněna, formuláře přijímá
          provozovatel webu (správce) bez produkčního partner handoff.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">5. Doba uchování</h3>
        <p>
          Preference cookies ukládáme ve vašem prohlížeči do změny nebo smazání.
          Doba uchování poptávek a marketingových souhlasů bude upřesněna po
          finálním právním textu provozovatele. Do té doby můžete požádat o
          výmaz na {op.email}.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-xl font-bold text-gray-900">6. Vaše práva</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Přístup, oprava, výmaz, omezení, námitka, přenositelnost.</li>
          <li>
            Odvolání souhlasu (marketing / předání partnerovi / cookies) na{" "}
            {op.email} — bez vlivu na zákonnost zpracování před odvoláním.
          </li>
          <li>Stížnost u ÚOOÚ.</li>
        </ul>
      </section>

      <p className="text-xs text-muted-foreground">
        Verze zásad ochrany osobních údajů: {CONSENT_POLICY_VERSION}. Verze
        zásad cookies: {COOKIE_POLICY_VERSION}.
      </p>
    </div>
  );
}

function CookiesContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
      <OperatorBlock />
      <p>
        Tyto zásady odpovídají skutečnému chování webu: analytické i
        marketingové cookies spouštíme{" "}
        <strong>až po aktivním souhlasu</strong>. Banner nabízí „Přijmout vše“,
        „Odmítnout volitelné“ a „Nastavení“. Preference ukládáme ve vašem
        prohlížeči.
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
      <p className="text-sm">
        Preference změníte přes „Nastavení cookies“ v patičce. Verze zásad:{" "}
        {COOKIE_POLICY_VERSION}.
      </p>
      <p className="text-sm">
        Související:{" "}
        <Link href={routes.legal.gdpr} className="text-deep-teal underline">
          Ochrana osobních údajů
        </Link>
        .
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
        Podmínky užití platformy Hypotéka Jasně (verze {TERMS_VERSION}).
        Používáním webu berete na vědomí informační charakter nástrojů.
      </p>
      <h3 className="text-xl font-bold text-gray-900">1. Povaha služeb</h3>
      <p>
        Portál je technologická a vzdělávací platforma. Modelové výpočty nejsou
        závaznou nabídkou banky. Předání partnerovi jen se souhlasem.
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
        .
      </p>
      <h3 className="text-xl font-bold text-gray-900">4. Odpovědnost</h3>
      <p>
        Provozovatel nenese odpovědnost za rozhodnutí učiněná výhradně na
        základě modelů na webu ani za jednání třetích stran (banka, specialista,
        makléř).
      </p>
    </div>
  );
}

function ZasadyContent() {
  return (
    <div className="space-y-8 text-gray-700 leading-relaxed">
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
          .
        </li>
        <li>
          Odměna od partnera při realizaci — viz{" "}
          <Link
            href={routes.jakVydelavame}
            className="text-deep-teal underline"
          >
            Jak vyděláváme
          </Link>
          .
        </li>
      </ul>
      <h3 className="text-xl font-bold text-gray-900">Chování uživatelů</h3>
      <p>
        Zákaz automatizovaného scrapingu a falešných poptávek. Kontaktní údaje
        musí být pravdivé.
      </p>
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
          <p className="font-semibold">Připravujeme</p>
          <p className="mt-1 text-muted-foreground">
            Placená analýza zatím není k dispozici ke koupi. Můžete zanechat
            kontakt v Investičním rentgenu — jde o evidenci zájmu, ne o
            objednávku.
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
        ) : null}{" "}
        · Verze textu: {t.version}
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
