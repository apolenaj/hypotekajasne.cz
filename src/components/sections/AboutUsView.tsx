import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cpu,
  Handshake,
  Home,
  RefreshCw,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { TrustNav } from "@/components/trust/TrustPageShell";
import { PersonProfileCard } from "@/components/trust/PersonProfileCard";
import { COMPENSATION_DISCLOSURE, TEAM_MEMBERS } from "@/lib/trust";
import {
  HEINZKE_PARTNER_PUBLIC,
  type HeinzkeFocusArea,
} from "@/lib/trust/heinzke-partner-public";
import { routes } from "@/lib/routes";
import {
  formatCompactOfficeAddress,
  legalOperator,
  PLATFORM_SAFE_DESCRIPTION_CS,
  projectFounder,
} from "@/config/legal";

const josef = TEAM_MEMBERS[0]!;
const partner = HEINZKE_PARTNER_PUBLIC;

const FOCUS_ICONS: Record<HeinzkeFocusArea["icon"], LucideIcon> = {
  home: Home,
  building: Building2,
  refresh: RefreshCw,
  wallet: Wallet,
};

const collaboration = [
  {
    icon: Cpu,
    title: legalOperator.brand,
    body: "Digitální platforma, kalkulačky, data a modelové nástroje.",
  },
  {
    icon: Handshake,
    title: "Hypoteční partner",
    body: `${partner.personName} / ${partner.companyShort} pomáhá s individuálním řešením hypotéky a navazující odbornou konzultací.`,
  },
  {
    icon: Building2,
    title: "Banka",
    body: "Banka provádí vlastní posouzení klienta a rozhoduje o schválení, sazbě a konečných podmínkách úvěru.",
  },
] as const;

export function AboutUsView() {
  const office = formatCompactOfficeAddress({
    street: legalOperator.street,
    district: legalOperator.district,
    zip: legalOperator.zip,
    city: legalOperator.city,
  });

  return (
    <section id="o-nas" className="scroll-mt-28 bg-white">
      <TrustNav currentPath="/o-nas" />

      <div className="relative overflow-hidden pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="absolute inset-0 z-0 bg-deep-teal" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <span className="mb-6 block text-sm font-bold tracking-widest text-emerald-200/90 uppercase">
            O nás
          </span>
          <h1 className="font-heading mb-6 text-4xl leading-tight font-extrabold text-white md:text-5xl">
            Kdo stojí za HypotékaJasně.cz
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed font-light text-emerald-50/90 md:text-xl">
            HypotékaJasně.cz vznikla s cílem zpřehlednit lidem financování bydlení
            a investičních nemovitostí. Spojujeme digitální nástroje, srozumitelné
            výpočty a možnost navázat na individuální řešení s hypotečním partnerem.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-100 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold tracking-widest text-deep-teal uppercase">
              Tým
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-gray-900 md:text-4xl">
              Lidé za HypotékaJasně.cz
            </h2>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
            <PersonProfileCard
              name={projectFounder.name}
              role={`Zakladatel HypotékaJasně.cz · jednatel ${legalOperator.companyName}`}
              photoUrl={josef.photoUrl!}
              photoAlt={josef.photoAlt}
              photoWidth={josef.photoWidth ?? 800}
              photoHeight={josef.photoHeight ?? 800}
              photoObjectPosition="center 12%"
              paragraphs={[
                "Stojí za konceptem a produktem, vývojem platformy, digitálními nástroji, kalkulačkami, uživatelskou zkušeností a rozvojem projektu.",
                "Není hypotečním specialistou, finančním poradcem ani regulovaným hypotečním zprostředkovatelem.",
              ]}
              nameAs="h3"
              priority
              footer={
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-gray-700">
                  <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    Vzdělání
                  </p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {josef.education.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              }
            />

            <PersonProfileCard
              name={partner.personName}
              role={partner.roleOnPlatform}
              eyebrow="Hypoteční partner"
              photoUrl={partner.photoUrl}
              photoAlt={partner.photoAlt}
              photoWidth={partner.photoWidth}
              photoHeight={partner.photoHeight}
              photoObjectPosition="center 18%"
              paragraphs={partner.summaryParagraphs}
              nameAs="h3"
              priority
              footer={
                <div className="space-y-3">
                  <p className="rounded-xl border border-deep-teal/10 bg-deep-teal/[0.04] px-4 py-3 text-sm text-deep-teal">
                    <span className="font-heading text-lg font-bold tabular-nums text-text-dark">
                      {partner.experienceYears}
                    </span>{" "}
                    <span className="font-semibold">
                      let zkušeností ve financích
                    </span>
                  </p>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {partner.focusAreas.map((area) => {
                      const Icon = FOCUS_ICONS[area.icon];
                      return (
                        <li
                          key={area.id}
                          className="flex items-start gap-2.5 rounded-xl border border-border bg-slate-50 px-3 py-2.5"
                        >
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-deep-teal/10 text-deep-teal">
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <span className="pt-0.5 text-sm font-medium leading-snug text-text-dark">
                            {area.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-[#f7f8f7] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-center text-3xl font-extrabold text-gray-900">
            Jak spolupráce funguje
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {collaboration.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-white p-5 sm:p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-deep-teal/10 text-deep-teal">
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-heading text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-heading text-2xl font-extrabold text-gray-900">
            Transparentnost a role
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {PLATFORM_SAFE_DESCRIPTION_CS}
          </p>
          <dl className="mt-6 space-y-3 text-sm text-gray-600">
            <div>
              <dt className="font-semibold text-gray-900">Provozovatel</dt>
              <dd>
                {legalOperator.companyName}, IČO {legalOperator.ico}, sídlo {office}.
                Jednatel: {projectFounder.displayName}.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Hypoteční partner</dt>
              <dd>
                {partner.personName} / {partner.companyShort} — individuální
                hypoteční řešení. Banka posuzuje klienta a schvaluje úvěr.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Odměna</dt>
              <dd>
                {COMPENSATION_DISCLOSURE}{" "}
                <Link
                  href={routes.jakVydelavame}
                  className="font-semibold text-deep-teal underline"
                >
                  Jak vyděláváme
                </Link>
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-muted-foreground">
            Další informace:{" "}
            <Link href={routes.duvera} className="text-deep-teal underline">
              Centrum důvěry
            </Link>
            {", "}
            <Link href={routes.metodika} className="text-deep-teal underline">
              Metodika
            </Link>
            {", "}
            <Link href={routes.partneri} className="text-deep-teal underline">
              Partneři
            </Link>
            {"."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center md:p-14">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-800" />
          </div>
          <h3 className="font-heading mb-4 text-2xl font-bold text-emerald-900 md:text-3xl">
            Chcete projít model a případně konzultaci se specialistou?
          </h3>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-emerald-800">
            Hypoteční připravenost spočítá skóre a překážky. Konzultaci se
            specialistou spustíte jen když o to požádáte — bez slibu schválení
            bankou.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={routes.navrhNaMiru}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 px-8 py-4 font-bold text-white transition-colors hover:bg-emerald-800"
            >
              Hypoteční připravenost
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={routes.duvera}
              className="rounded-full border border-emerald-200 bg-white px-8 py-4 font-bold text-emerald-900 transition-colors hover:bg-gray-50"
            >
              Centrum důvěry
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
