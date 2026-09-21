import Link from "next/link";
import { PracticeHashScroll } from "@/components/academy/practice/PracticeHashScroll";
import { PRACTICE_ICONS } from "@/components/academy/practice/PracticeIcons";
import { PracticeVizIsland } from "@/components/academy/practice/PracticeVizIsland";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getAcademyLesson, getAcademyLessonPath } from "@/lib/academy";
import {
  practiceGuidePath,
  practiceHubPath,
  type PracticeAnswer,
  type PracticeGuide,
} from "@/lib/academy/practice";
import { PRACTICE_TAG_LABELS } from "@/lib/academy/practice/types";
import { routes } from "@/lib/routes";
import { crumbs } from "@/lib/seo/breadcrumbs";

export function PracticeGuideView({ guide }: { guide: PracticeGuide }) {
  const Icon = PRACTICE_ICONS[guide.icon];
  const path = practiceGuidePath(guide.slug);

  return (
    <div className="bg-white">
      <PracticeHashScroll />
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              { name: "Akademie", path: routes.akademie },
              { name: "Hypotéky v praxi", path: practiceHubPath() },
              { name: guide.title, path }
            )}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:px-8 lg:py-14">
        <div className="min-w-0">
          <header className="border-b border-border pb-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-deep-teal/10 text-deep-teal">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
                  Hypotéky v praxi
                </p>
                <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
                  {guide.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  {guide.cardBlurb}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {guide.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-[#f7f8f7] px-2 py-0.5 text-[11px] font-semibold text-deep-teal ring-1 ring-border"
                    >
                      {PRACTICE_TAG_LABELS[t]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <nav aria-label="Otázky v průvodci" className="mt-8 lg:hidden">
            <details className="rounded-xl border border-border bg-[#f7f8f7] p-4">
              <summary className="cursor-pointer font-semibold text-text-dark">
                Obsah průvodce ({guide.answers.length})
              </summary>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                {guide.answers.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      className="text-deep-teal hover:underline"
                    >
                      {a.question}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          </nav>

          <div className="mt-8 space-y-6">
            {guide.answers.map((answer, index) => (
              <PracticeAnswerBlock
                key={answer.id}
                answer={answer}
                index={index}
              />
            ))}
          </div>

          {guide.checklist && guide.checklist.length > 0 ? (
            <section className="mt-10 rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6">
              <h2 className="font-heading text-xl font-bold text-text-dark">
                Praktický checklist
              </h2>
              <ul className="mt-4 space-y-2">
                {guide.checklist.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm text-text-dark"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-deep-teal"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
            <Link
              href={guide.cta.href}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
            >
              {guide.cta.label}
            </Link>
            <Link
              href={practiceHubPath()}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
            >
              Zpět na Hypotéky v praxi
            </Link>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <nav
              aria-label="Obsah průvodce"
              className="rounded-2xl border border-border bg-[#f7f8f7] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                Obsah
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm">
                {guide.answers.map((a) => (
                  <li key={a.id}>
                    <a
                      href={`#${a.id}`}
                      className="text-text-dark hover:text-deep-teal hover:underline"
                    >
                      {a.question}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            {guide.relatedLessonSlugs.length > 0 ? (
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                  Související pojmy
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  {guide.relatedLessonSlugs.map((slug) => {
                    const lesson = getAcademyLesson(slug);
                    return (
                      <li key={slug}>
                        <Link
                          href={getAcademyLessonPath(slug)}
                          className="font-medium text-deep-teal hover:underline"
                        >
                          {lesson?.title ?? slug}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <p className="text-xs leading-relaxed text-muted-foreground">
              Výpočty jsou orientační. Konkrétní podmínky a schválení vždy
              posuzuje banka podle aktuální metodiky a dokumentace.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PracticeAnswerBlock({
  answer,
  index,
}: {
  answer: PracticeAnswer;
  index: number;
}) {
  return (
    <article
      id={answer.id}
      className="scroll-mt-28 rounded-2xl border border-border bg-white"
    >
      <div className="border-b border-border bg-[#f7f8f7] px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gold">
          Otázka {index + 1}
        </p>
        <h2 className="mt-1 font-heading text-xl font-bold text-text-dark">
          {answer.question}
        </h2>
      </div>

      <div className="space-y-4 px-4 py-5 sm:px-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Přímá odpověď
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-dark sm:text-base">
            {answer.directAnswer}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
            Praktické vysvětlení
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {answer.explanation}
          </p>
        </div>

        {answer.example ? (
          <div className="rounded-xl bg-[#f7f8f7] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-text-dark">
              Příklad
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {answer.example}
            </p>
          </div>
        ) : null}

        {answer.table ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              {answer.table.caption ? (
                <caption className="bg-[#f7f8f7] px-3 py-2 text-left text-xs font-semibold text-text-dark">
                  {answer.table.caption}
                </caption>
              ) : null}
              <thead>
                <tr className="border-b border-border bg-[#f7f8f7] text-xs text-muted-foreground">
                  {answer.table.headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {answer.table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/70">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-2 tabular-nums text-text-dark"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {answer.vizId ? (
          <div className="pt-1">
            <PracticeVizIsland vizId={answer.vizId} />
          </div>
        ) : null}

        {answer.commonMistake ? (
          <details className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-text-dark">
              Typická chyba / výjimka
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {answer.commonMistake}
            </p>
          </details>
        ) : null}

        {answer.sources && answer.sources.length > 0 ? (
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-text-dark">
              Zdroje
            </summary>
            <ul className="mt-2 space-y-2">
              {answer.sources.map((s) => (
                <li key={`${s.label}-${s.url ?? ""}`} className="text-muted-foreground">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-deep-teal hover:underline"
                    >
                      {s.label}
                    </a>
                  ) : (
                    <span className="font-medium text-text-dark">{s.label}</span>
                  )}
                  {s.notes ? (
                    <span className="block text-xs">{s.notes}</span>
                  ) : null}
                  {s.checkedAt ? (
                    <span className="block text-[11px]">
                      Kontrola: {s.checkedAt}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        <div className="pt-1">
          <Link
            href={answer.nextStep.href}
            className="inline-flex text-sm font-semibold text-deep-teal hover:underline"
          >
            Další krok: {answer.nextStep.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
