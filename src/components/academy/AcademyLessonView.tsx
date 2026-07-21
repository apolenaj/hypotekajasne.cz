import Link from "next/link";
import { AcademyMediaPlaceholders } from "@/components/academy/AcademyMediaPlaceholders";
import { AcademyMiniCalculator } from "@/components/academy/AcademyMiniCalculator";
import { AcademyQuiz } from "@/components/academy/AcademyQuiz";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { DefinitionTerm, VideoTranscript } from "@/components/seo/AiReadiness";
import type { AcademyLesson } from "@/lib/academy/types";
import {
  ACADEMY_LESSONS,
  getAcademyLessonPath,
} from "@/lib/academy";
import {
  getMechanicsBridgeTools,
  getRelatedMechanicsLessons,
} from "@/lib/academy/related-lessons";
import { AcademyLessonGamificationPanel } from "@/components/academy/AcademyLessonGamificationPanel";
import { routes } from "@/lib/routes";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  courseJsonLd,
  faqPageJsonLd,
  videoObjectJsonLd,
  type JsonLd,
} from "@/lib/seo/json-ld";
import {
  contentChannelLabel,
  mediaStatusLabel,
} from "@/lib/i18n/labels";

function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-8">
      <h2 className="font-heading text-xl font-bold text-text-dark">
        <span className="mr-2 text-muted-gold">{n}.</span>
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

export function AcademyLessonView({ lesson }: { lesson: AcademyLesson }) {
  const path = getAcademyLessonPath(lesson.slug);
  const relatedLessons = getRelatedMechanicsLessons(lesson.slug);
  const toolLinks = [
    ...lesson.relatedTools,
    ...getMechanicsBridgeTools(lesson.slug),
  ].filter((t, i, arr) => arr.findIndex((x) => x.href === t.href) === i);
  const toolsSectionN = relatedLessons.length > 0 ? 13 : 12;
  const ctaSectionN = toolsSectionN + 1;
  const schemas: JsonLd[] = [
    courseJsonLd({
      name: lesson.title,
      description: lesson.description,
      path,
    }),
  ];
  if (lesson.faq.length > 0) {
    schemas.push(
      faqPageJsonLd(lesson.faq.map((f) => ({ question: f.q, answer: f.a })))
    );
  }
  const video = lesson.media.video;
  if (
    video.status === "LIVE" &&
    video.src &&
    lesson.media.thumbnail.src
  ) {
    schemas.push(
      videoObjectJsonLd({
        name: lesson.title,
        description: lesson.description,
        thumbnailUrl: lesson.media.thumbnail.src,
        contentUrl: video.src,
        uploadDate: lesson.updatedAt,
        durationSec: video.durationSec,
        transcript: video.transcript ?? lesson.media.transcript?.text,
      })
    );
  }

  return (
    <article className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              { name: "Akademie", path: routes.akademie },
              { name: lesson.title, path }
            )}
          />
        </div>
      </div>
      <JsonLdScript data={schemas} />

      <header className="border-b border-border bg-gradient-to-br from-[#0b3d3a] via-[#0f4c48] to-[#1a5c4a] text-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-gold">
            <Link href={routes.akademie} className="hover:underline">
              Hypoteční akademie
            </Link>
            {" / "}
            {lesson.shortLabel}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            {lesson.description}
          </p>
          <p className="mt-2 text-xs text-white/60">
            Aktualizace {lesson.updatedAt}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_220px] lg:px-8">
        <div>
          <Section id="jednoduse" n={1} title="Jednoduše řečeno">
            <DefinitionTerm term={lesson.shortLabel}>
              {lesson.simplySaid}
            </DefinitionTerm>
          </Section>

          <Section id="priklad" n={2} title="Reálný příklad">
            <p>{lesson.realExample}</p>
          </Section>

          <Section id="vypocet" n={3} title="Jak se to počítá">
            <p>{lesson.howCalculated}</p>
          </Section>

          <Section id="banka" n={4} title="Co na to banka / investor">
            <p>{lesson.bankOrInvestor}</p>
          </Section>

          <Section id="chyba" n={5} title="Nejčastější chyba">
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
              {lesson.commonMistake}
            </p>
          </Section>

          <Section id="kalkulacka" n={6} title="Interaktivní mini kalkulačka">
            <AcademyMiniCalculator kind={lesson.calculator} />
          </Section>

          <Section id="media" n={7} title="Video (30–60 s)">
            <AcademyMediaPlaceholders
              media={lesson.media}
              lessonTitle={lesson.title}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Bod 8 (audio) je ve stejném bloku výše — bez falešných souborů,
              dokud není status „Dostupné“.
            </p>
            {video.status === "LIVE" &&
            (video.transcript || lesson.media.transcript?.text) ? (
              <div className="mt-4">
                <VideoTranscript
                  title={lesson.title}
                  text={
                    video.transcript ||
                    lesson.media.transcript?.text ||
                    ""
                  }
                />
              </div>
            ) : null}
          </Section>

          <Section id="quiz" n={9} title="Kvíz">
            <AcademyQuiz questions={lesson.quiz} lessonSlug={lesson.slug} />
          </Section>

          <Section id="faq" n={10} title="Časté otázky">
            <dl className="space-y-4">
              {lesson.faq.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-text-dark">{item.q}</dt>
                  <dd className="mt-1">{item.a}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="sources" n={11} title="Zdroje">
            <ul className="list-disc space-y-2 pl-5">
              {lesson.sources.map((s) => (
                <li key={s.label}>
                  {s.url ? (
                    <Link href={s.url} className="text-deep-teal underline">
                      {s.label}
                    </Link>
                  ) : (
                    s.label
                  )}
                  {s.note ? (
                    <span className="block text-xs">{s.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Section>

          {relatedLessons.length > 0 ? (
            <Section id="related-lessons" n={12} title="Související lekce">
              <p className="mb-3 text-sm text-muted-foreground">
                LTV, DTI, DSTI, RPSN a fixace spolu tvoří základ hypoteční
                mechaniky — čtěte je jako cluster, ne izolované pojmy.
              </p>
              <ul className="flex flex-wrap gap-2">
                {relatedLessons.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={l.href}
                      className="inline-flex rounded-full border border-deep-teal/25 bg-deep-teal/5 px-3 py-1.5 text-sm font-semibold text-deep-teal hover:bg-deep-teal/10"
                    >
                      {l.shortLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section id="tools" n={toolsSectionN} title="Související nástroje">
            <ul className="flex flex-wrap gap-2">
              {toolLinks.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="inline-flex rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-deep-teal hover:bg-deep-teal/5"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="cta" n={ctaSectionN} title="Další krok">
            <Link
              href={lesson.cta.href}
              className="inline-flex rounded-lg bg-deep-teal px-5 py-3 text-sm font-bold text-white"
            >
              {lesson.cta.label}
            </Link>
          </Section>

          <AcademyLessonGamificationPanel lessonSlug={lesson.slug} />

          <section className="py-8">
            <h2 className="font-heading text-lg font-bold text-text-dark">
              Další formáty obsahu
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Stejné téma můžete najít i jako článek, video, audio nebo e-mailové
              shrnutí.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {lesson.derivatives.map((d) => (
                <li
                  key={d.channel}
                  className="rounded-lg border border-border px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-deep-teal">
                    {contentChannelLabel(d.channel)}
                  </span>{" "}
                  · {mediaStatusLabel(d.status)}
                  {d.notes ? (
                    <span className="mt-0.5 block text-muted-foreground">
                      {d.notes}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Další pojmy
          </p>
          <nav className="mt-3 flex flex-col gap-1" aria-label="Akademie">
            {ACADEMY_LESSONS.map((l) => (
              <Link
                key={l.slug}
                href={getAcademyLessonPath(l.slug)}
                className={
                  l.slug === lesson.slug
                    ? "rounded-lg bg-deep-teal px-3 py-2 text-sm font-semibold text-white"
                    : "rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                }
              >
                {l.shortLabel}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </article>
  );
}
