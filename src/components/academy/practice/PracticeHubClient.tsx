"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PracticeSearch, PracticeTagFilter } from "@/components/academy/practice/PracticeSearch";
import { PRACTICE_ICONS } from "@/components/academy/practice/PracticeIcons";
import {
  PRACTICE_GUIDES,
  practiceAnswerPath,
  practiceGuidePath,
  type PracticeGuide,
  type PracticeSituationTag,
} from "@/lib/academy/practice";
import { PRACTICE_TAG_LABELS } from "@/lib/academy/practice/types";

const RECOMMENDED: Array<{ question: string; href: string }> = [
  {
    question: "Co řešit první: banku, nebo nemovitost?",
    href: practiceAnswerPath("prvni-hypoteka", "banka-nebo-nemovitost"),
  },
  {
    question: "Kolik potřebuji vlastních prostředků?",
    href: practiceAnswerPath("vlastni-penize-odhad", "kolik-vlastnich"),
  },
  {
    question: "Hypotéka ve zkušební době — jde to?",
    href: practiceAnswerPath("prijmy-osvc-zkusebni", "zkusebni-doba"),
  },
  {
    question: "Kdy začít řešit konec fixace?",
    href: practiceAnswerPath(
      "mimoradne-splatky-refinancovani",
      "konec-fixace"
    ),
  },
];

export function PracticeHubClient({
  guides = PRACTICE_GUIDES,
}: {
  guides?: PracticeGuide[];
}) {
  const [tag, setTag] = useState<string | null>(null);
  const filtered = useMemo(() => {
    if (!tag) return guides;
    return guides.filter((g) =>
      g.tags.includes(tag as PracticeSituationTag)
    );
  }, [guides, tag]);

  return (
    <div className="space-y-10">
      <PracticeSearch guides={guides} />

      <section aria-labelledby="recommended-heading">
        <h2
          id="recommended-heading"
          className="font-heading text-lg font-bold text-text-dark"
        >
          Doporučené vstupní otázky
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {RECOMMENDED.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-dark transition hover:border-deep-teal/40 hover:bg-[#f7f8f7]"
              >
                {item.question}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guides-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="guides-heading"
            className="font-heading text-lg font-bold text-text-dark"
          >
            Deset praktických průvodců
          </h2>
          <PracticeTagFilter active={tag} onChange={setTag} />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((guide) => (
            <li key={guide.slug}>
              <PracticeGuideCard guide={guide} />
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Pro zvolený štítek zatím není průvodce. Zvolte „Vše“.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function PracticeGuideCard({ guide }: { guide: PracticeGuide }) {
  const Icon = PRACTICE_ICONS[guide.icon];
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-[#f7f8f7] p-5 transition hover:border-deep-teal/40 hover:bg-white">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-deep-teal/10 text-deep-teal">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-bold text-text-dark">
            {guide.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{guide.cardBlurb}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-text-dark">
        {guide.sampleQuestions.map((q) => (
          <li key={q} className="flex gap-2">
            <span className="text-muted-gold" aria-hidden>
              ·
            </span>
            <span>{q}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {guide.tags.map((t) => (
          <span
            key={t}
            className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-deep-teal ring-1 ring-border"
          >
            {PRACTICE_TAG_LABELS[t]}
          </span>
        ))}
      </div>
      <Link
        href={practiceGuidePath(guide.slug)}
        className="mt-auto inline-flex pt-5 text-sm font-semibold text-deep-teal hover:underline"
      >
        Zobrazit odpovědi
      </Link>
    </article>
  );
}
