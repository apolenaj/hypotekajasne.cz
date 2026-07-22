import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Code2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { TrustNav } from "@/components/trust/TrustPageShell";
import {
  COMPENSATION_DISCLOSURE,
  ECOSYSTEM_ACTORS,
  TEAM_MEMBERS,
  type TeamMember,
} from "@/lib/trust";
import { getPartnerClaimLabels } from "@/lib/partners/verification";
import { routes } from "@/lib/routes";

const partnerLabels = getPartnerClaimLabels();

const pillars = [
  {
    icon: BarChart3,
    title: "Data s uvedeným statusem",
    description:
      "Sazby, výnosy a skóre mají status (aktuální data / modelový výpočet / odhad…). Chybějící údaj nevymýšlíme — viz Metodika a Zdroje.",
  },
  {
    icon: Code2,
    title: "Technologické nástroje",
    description:
      "Kalkulačky, Hypoteční připravenost a přiřazení trhů běží jako model. Výstup není závazná nabídka banky.",
  },
  {
    icon: ClipboardList,
    title: "Konkrétní proces předání",
    description: `1) Vyplníte záměr a model. 2) Pokud chcete a partner je ověřen, předáme poptávku partnerovi. 3) Schválení vždy provádí banka. 4) Majetio slouží k nemovitostem — odděleně. Stav: ${partnerLabels.badgeLabel}.`,
  },
];

const accents = [
  "from-deep-teal to-deep-teal-light",
  "from-emerald-800 to-emerald-600",
] as const;

function ProfilePhoto({
  member,
  accent,
}: {
  member: TeamMember;
  accent: string;
}) {
  if (member.photoUrl) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={member.photoUrl}
          alt={member.photoAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 13rem"
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100"
      role="img"
      aria-label={`Fotografie: ${member.name} (zatím nedodána)`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-90`}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-6xl font-bold tracking-tight text-white/90 md:text-7xl">
          {member.initials}
        </span>
      </div>
      <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-sm uppercase">
        Fotografie zatím není dodána
      </div>
    </div>
  );
}

export function AboutUsView() {
  return (
    <section id="o-nas" className="scroll-mt-28 bg-white">
      <TrustNav currentPath="/o-nas" />

      <div className="relative overflow-hidden pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="absolute inset-0 z-0 bg-deep-teal" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <span className="mb-6 block text-sm font-bold tracking-widest text-emerald-200/90 uppercase">
            O nás · Centrum důvěry
          </span>
          <h1 className="font-heading mb-6 text-4xl leading-tight font-extrabold text-white md:text-5xl">
            Lidé a role za Hypotéka Jasně
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed font-light text-emerald-50/90 md:text-xl">
            Jsme technologická platforma. Nejsme banka. Individuální
            zprostředkování provádí partner — jen se souhlasem a jen pokud je
            jeho identita ověřena a zveřejněna ({partnerLabels.badgeLabel}).
            Úvěr schvaluje banka. Do 30 sekund víte, komu dáváte data — detail v{" "}
            <Link href={routes.duvera} className="underline decoration-white/40">
              Centru důvěry
            </Link>
            .
          </p>
        </div>
      </div>

      {/* 30s role map */}
      <div className="border-b border-border bg-[#f7f8f7] py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-heading text-center text-2xl font-bold text-text-dark">
            Kdo co dělá
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
            Hypotéka Jasně ≠ specialista ≠ banka ≠ Majetio ≠ makléř.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM_ACTORS.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-border bg-white px-4 py-3"
              >
                <p className="font-semibold text-text-dark">{a.name}</p>
                <p className="text-xs font-medium text-deep-teal">{a.shortRole}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {a.whatTheyDo}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
            {COMPENSATION_DISCLOSURE}{" "}
            <Link
              href={routes.jakVydelavame}
              className="font-semibold underline"
            >
              Jak vyděláváme →
            </Link>
          </p>
        </div>
      </div>

      {/* Team */}
      <div className="border-b border-gray-100 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-bold tracking-widest text-deep-teal uppercase">
              Tým
            </p>
            <h2 className="font-heading text-3xl font-extrabold text-gray-900 md:text-4xl">
              Role, zkušenosti, odpovědnost za obsah
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Fotografie a LinkedIn zobrazujeme jen když jsou skutečně
              dodané — neověřené odkazy neuvádíme.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {TEAM_MEMBERS.map((member, i) => (
              <article
                key={member.id}
                id={member.id}
                className="scroll-mt-24 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-[11rem_1fr] md:grid-cols-[13rem_1fr]">
                  <ProfilePhoto
                    member={member}
                    accent={accents[i % accents.length]}
                  />
                  <div>
                    <h3 className="font-heading text-xl font-bold text-gray-900 md:text-2xl">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-deep-teal">
                      {member.role}
                    </p>
                    {member.linkedInUrl ? (
                      <a
                        href={member.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-deep-teal underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LinkedIn
                      </a>
                    ) : (
                      <p className="mt-3 text-xs text-muted-foreground">
                        LinkedIn profil zatím není zveřejněn.
                      </p>
                    )}
                  </div>
                </div>

                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Odpovědnosti
                    </dt>
                    <dd className="mt-1">
                      <ul className="list-disc space-y-1 pl-5 text-gray-600">
                        {member.responsibilities.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Ověřitelné zkušenosti
                    </dt>
                    <dd className="mt-1">
                      <ul className="list-disc space-y-1 pl-5 text-gray-600">
                        {member.experience.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Vzdělání
                    </dt>
                    <dd className="mt-1">
                      <ul className="list-disc space-y-1 pl-5 text-gray-600">
                        {member.education.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Odpovědnost za obsah
                    </dt>
                    <dd className="mt-1 text-gray-700">
                      {member.contentResponsibility}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Pillars = processes */}
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-extrabold text-gray-900">
            Na čem stavíme (procesy, ne slogany)
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="py-2">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-deep-teal/10 text-deep-teal">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading mb-3 text-xl font-bold text-gray-900">
                {pillar.title}
              </h3>
              <p className="leading-relaxed text-gray-600">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-heading mb-4 text-2xl font-extrabold text-gray-900">
            Ekosystém s jasnými hranicemi
          </h2>
          <p className="leading-relaxed text-gray-600">
            <strong className="font-semibold text-gray-900">
              Hypotéka Jasně
            </strong>{" "}
            <span className="text-sm font-medium text-gray-500">
              (HypotekaJasne.cz)
            </span>{" "}
            edukuje a modeluje.{" "}
            <strong className="font-semibold text-gray-900">Majetio</strong>{" "}
            pomáhá s nemovitostmi.{" "}
            {partnerLabels.roleLabel} zprostředkovává individuální konzultaci,
            pokud je ověřen. Banka schvaluje. Makléř/developer prodává.{" "}
            <Link href={routes.partneri} className="text-deep-teal underline">
              Partneři a ověření
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center md:p-14">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <ShieldCheck className="h-6 w-6 text-emerald-800" />
          </div>
          <h3 className="font-heading mb-4 text-2xl font-bold text-emerald-900 md:text-3xl">
            Chcete projít model a případně předání specialistovi?
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
